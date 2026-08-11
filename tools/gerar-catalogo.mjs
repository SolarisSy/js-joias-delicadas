#!/usr/bin/env node
/* ===========================================================
   GERADOR DE CATÁLOGO — JS Joias Delicadas

   Lê a pasta imagens/ e transforma cada foto com nome de peça
   em um produto da grade, escrevendo data/catalogo-auto.js.

   Uso:  node tools/gerar-catalogo.mjs
   (também roda sozinho no deploy — .github/workflows/deploy.yml)

   Convenção de nome de arquivo (tudo depois do nome é opcional):

     anel dourado com pedra preta.png
     anel dourado com pedra preta - 129,90.png          → preço
     anel dourado com pedra preta - 159,90 - 129,90.png → de / por
     anel dourado com pedra preta (novidade).png        → selo
     anel dourado com pedra preta (esgotado).png        → esgotado
     pulseira prata elos com bolinhas (kids).png        → filtro Kids + selo
     anel dourado com pedra preta-alt.png               → 2º ângulo

   Só entra na grade quem começa com um tipo de peça conhecido
   (anel, brinco, argola, pulseira, colar, pingente, conjunto...).
   Assim as imagens de arte/print que moram na mesma pasta ficam de fora.
   =========================================================== */

import { readdirSync, writeFileSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PASTA = 'imagens';
const SAIDA = join(RAIZ, 'data', 'catalogo-auto.js');
const EXTENSOES = ['.png', '.jpg', '.jpeg', '.webp', '.avif'];

// Primeira palavra do nome → seção da loja + preço padrão
const TIPOS = [
  { termos: ['anel', 'aneis', 'anéis', 'alianca', 'aliança'], tag: 'Anéis', preco: 109.90 },
  { termos: ['brinco', 'brincos', 'argola', 'argolas', 'argolinha', 'argolinhas', 'piercing'], tag: 'Brincos', preco: 79.90 },
  { termos: ['pulseira', 'pulseiras', 'bracelete', 'berloque'], tag: 'Pulseiras', preco: 109.90 },
  { termos: ['colar', 'colares', 'gargantilha', 'corrente', 'pingente', 'choker', 'escapulario', 'escapulário'], tag: 'Colares', preco: 119.90 },
  { termos: ['tornozeleira', 'tornozeleiras'], tag: 'Tornozeleiras', preco: 89.90 },
  { termos: ['conjunto', 'kit'], tag: 'Conjuntos', preco: 149.90 }
];

// Palavras no nome → acabamento + filtro de categoria
const MATERIAIS = [
  { termos: ['prata', 'prateado', 'prateada', 'rodio', 'ródio', 'branco', 'branca'], acabamento: 'Ródio Branco', categoria: 'prata' },
  { termos: ['ouro', 'dourado', 'dourada', 'gold', 'amarelo'], acabamento: 'Ouro 18k', categoria: 'ouro' }
];
const MATERIAL_PADRAO = { acabamento: 'Ouro 18k', categoria: 'ouro' };

const semAcento = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function tituloDe(texto) {
  const minusculas = new Set(['com', 'de', 'da', 'do', 'e', 'em', 'para', 'na', 'no', 'a', 'o']);
  return texto.split(/\s+/).map((palavra, i) => {
    const p = palavra.toLowerCase();
    if (i > 0 && minusculas.has(semAcento(p))) return p;
    return p.charAt(0).toUpperCase() + p.slice(1);
  }).join(' ');
}

const slug = (texto) => semAcento(texto).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* Quebra o nome do arquivo nas partes: nome, preços, selo, esgotado, alt */
function interpretar(arquivo) {
  let nome = basename(arquivo, extname(arquivo)).normalize('NFC');

  const alt = /[-_\s]alt$/i.test(nome);
  if (alt) nome = nome.replace(/[-_\s]alt$/i, '');

  // Duplicatas do Finder: "peça-2.png", "peça copy.png"
  nome = nome.replace(/\s*(copy|cópia)\s*\d*$/i, '').replace(/-[2-9]$/, '');

  let badge = null;
  let esgotado = false;
  let kids = false;
  nome = nome.replace(/\s*\(([^)]+)\)\s*/g, (_, dentro) => {
    const marca = semAcento(dentro).trim().toLowerCase();
    if (marca === 'esgotado' || marca === 'esgotada') esgotado = true;
    else if (marca === 'kids' || marca === 'infantil') kids = true;
    else badge = tituloDe(dentro.trim());
    return ' ';
  });

  // "- 159,90 - 129,90" (de/por) ou "- 129,90" (preço) no fim.
  // O espaço antes do hífen é obrigatório: separa preço de nomes como "anel-01".
  const precos = [];
  const regexPreco = /\s+[-–—]\s*(\d{1,5}(?:[.,]\d{1,2})?)\s*$/;
  let achou;
  while (precos.length < 2 && (achou = nome.match(regexPreco))) {
    precos.unshift(parseFloat(achou[1].replace(',', '.')));
    nome = nome.slice(0, achou.index);
  }

  return { nome: nome.replace(/\s+/g, ' ').trim(), precos, badge, esgotado, kids, alt };
}

function classificar(nome) {
  // Nome de peça é escrito com espaços ("anel dourado com pedra preta").
  // Arquivos slug do catálogo antigo ("anel-01", "brinco-03-alt") ficam de fora.
  if (!/\s/.test(nome)) return null;

  const palavras = semAcento(nome).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const tipo = TIPOS.find(t => t.termos.some(termo => semAcento(termo) === palavras[0]));
  if (!tipo) return null;

  const material = MATERIAIS.find(m => m.termos.some(termo => palavras.includes(semAcento(termo)))) || MATERIAL_PADRAO;
  const categorias = [material.categoria];
  if (palavras.some(p => p.startsWith('perola') || p.startsWith('madreperola'))) categorias.push('perola');

  return { tipo, material, categorias: categorias.join(' ') };
}

// ---------- leitura da pasta ----------

const arquivos = readdirSync(join(RAIZ, PASTA))
  .filter(f => EXTENSOES.includes(extname(f).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, 'pt-BR'));

const porNome = new Map();

for (const arquivo of arquivos) {
  const info = interpretar(arquivo);
  const classe = classificar(info.nome);
  if (!classe) continue; // arte, print, imagem solta — não é peça

  const chave = slug(info.nome);
  const caminho = encodeURI(`${PASTA}/${arquivo}`.normalize('NFC'));

  if (info.alt) {
    const base = porNome.get(chave);
    if (base && !base.imageAlt) base.imageAlt = caminho;
    continue;
  }
  if (porNome.has(chave)) {
    // mesma peça fotografada de novo → vira o segundo ângulo
    const base = porNome.get(chave);
    if (!base.imageAlt) base.imageAlt = caminho;
    continue;
  }

  const nome = tituloDe(info.nome);
  const [a, b] = info.precos;
  const preco = b ?? a ?? classe.tipo.preco;
  // (kids) no nome do arquivo entra na aba Kids da vitrine
  const categorias = info.kids ? `${classe.categorias} kids` : classe.categorias;

  const produto = {
    id: `auto-${chave}`,
    name: nome,
    tag: `${classe.tipo.tag} · ${classe.material.acabamento}`,
    categories: categorias,
    image: caminho,
    price: preco,
    details: ['Antialérgico', classe.material.acabamento],
    desc: `${nome} com acabamento em ${classe.material.acabamento.toLowerCase()}. `
        + `Peça selecionada à mão pela JS Joias Delicadas: antialérgica, `
        + `resistente ao dia a dia e pronta para virar sua favorita.`
  };
  if (b && a && a > b) produto.oldPrice = a;
  if (info.badge) produto.badge = info.badge;
  else if (info.kids) produto.badge = 'Kids'; // um selo próprio dado no nome tem prioridade
  if (info.esgotado) produto.soldOut = true;

  porNome.set(chave, produto);
}

// Chaves em ordem fixa para o arquivo gerado não oscilar entre execuções
const ORDEM = ['id', 'name', 'tag', 'categories', 'image', 'imageAlt', 'price', 'oldPrice', 'details', 'badge', 'soldOut', 'desc'];
const produtos = [...porNome.values()].map(p =>
  Object.fromEntries(ORDEM.filter(k => p[k] !== undefined).map(k => [k, p[k]]))
);

const conteudo = `/* GERADO AUTOMATICAMENTE — não edite à mão.
   Fonte: os nomes dos arquivos em ${PASTA}/
   Recriar: node tools/gerar-catalogo.mjs
   ${produtos.length} peça(s). */
window.PRODUCTS_AUTO = ${JSON.stringify(produtos, null, 2)};
`;

writeFileSync(SAIDA, conteudo);
console.log(`${produtos.length} peça(s) → data/catalogo-auto.js`);
produtos.forEach(p => console.log(`  • ${p.name} — R$ ${p.price.toFixed(2).replace('.', ',')}${p.soldOut ? ' (esgotado)' : ''}`));
