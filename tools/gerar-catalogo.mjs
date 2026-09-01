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

// Primeira palavra do nome → seção da loja.
// piso: o mais barato que a seção pode custar (peça lisa, sem pedra).
// teto: o limite de quanto os detalhes podem empurrar o preço.
const TIPOS = [
  { termos: ['anel', 'aneis', 'anéis', 'alianca', 'aliança'], tag: 'Anéis', piso: 104.90, teto: 169.90 },
  { termos: ['brinco', 'brincos', 'argola', 'argolas', 'argolinha', 'argolinhas', 'piercing'], tag: 'Brincos', piso: 79.90, teto: 139.90 },
  { termos: ['pulseira', 'pulseiras', 'bracelete', 'berloque'], tag: 'Pulseiras', piso: 112.90, teto: 189.90 },
  { termos: ['colar', 'colares', 'gargantilha', 'corrente', 'pingente', 'choker', 'escapulario', 'escapulário'], tag: 'Colares', piso: 124.90, teto: 199.90 },
  { termos: ['tornozeleira', 'tornozeleiras'], tag: 'Tornozeleiras', piso: 94.90, teto: 149.90 },
  { termos: ['conjunto', 'kit'], tag: 'Conjuntos', piso: 174.90, teto: 289.90 }
];

/* ---------- preço por peça ----------
   Duas joias da mesma seção não valem o mesmo: uma argola lisa e uma
   argola de trilha de cristais dão trabalho e custo diferentes. O preço
   sai do piso da seção mais o que o nome da peça revela — cravação,
   pedra, pérola, banho de ouro, trabalho no metal — e não da seção.

   Cada grupo abaixo conta uma vez só, e os grupos entram com peso
   decrescente (1 · 0,75 · 0,56 ...): a peça mais rebuscada sobe bastante,
   sem que somar sete detalhes estoure o teto da seção. */
const DETALHES = [
  { valor: 24, termos: ['cravejado', 'cravejada', 'cravejadas', 'riviera', 'chuveiro', 'filigrana', 'halo', 'trilha'] },
  { valor: 17, termos: ['cristal', 'cristais', 'zirconia', 'zircônia', 'baguete', 'navete', 'navetes', 'facetada', 'facetado', 'facetadas', 'esmeralda', 'solitario', 'solitário', 'pedra', 'pedras', 'gota', 'gotas', 'diamantado', 'diamantada'] },
  { valor: 15, termos: ['perola', 'pérola', 'perolas', 'pérolas', 'madreperola', 'madrepérola', 'barrocas'] },
  { valor: 12, termos: ['dourado', 'dourada', 'ouro', 'gold'] },
  { valor: 11, termos: ['elo', 'elos', 'medalha', 'medalhas', 'berloque', 'berloques', 'corrente', 'grega', 'cordao', 'cordão', 'bracelete', 'maxi', 'máxi', 'kit', 'trio', 'duplo', 'dupla', 'escalada', 'losango'] },
  { valor: 9, termos: ['coracao', 'coração', 'coracoes', 'corações', 'trevo', 'flor', 'flores', 'borboleta', 'borboletas', 'libelula', 'libélula', 'estrela', 'estrelas', 'lua', 'cruz', 'no', 'nó', 'concha', 'coqueiro', 'patinha', 'pomba', 'arvore', 'árvore', 'senhora', 'aparecida', 'grego', 'laco', 'laço', 'infinito', 'coroa'] },
  { valor: 7, termos: ['martelada', 'marteladas', 'texturizado', 'texturizada', 'trancada', 'trançada', 'torcido', 'torcida', 'escovados', 'escovadas', 'espiral', 'abaulado', 'abaulada', 'abauladas', 'vazado', 'vazada', 'baiano'] }
];
// Peça sem trabalho nenhum no nome desconta: é a mais simples da vitrine.
const SIMPLES = ['liso', 'lisa', 'lisas', 'bolinha', 'bolinhas', 'barra', 'botao', 'botão', 'simples'];

/* Duas peças com exatamente os mesmos detalhes ainda assim não ficam com
   o mesmo número: um deslocamento de 0 a 15 reais tirado do próprio nome
   dá identidade a cada joia — e, por vir do nome, é sempre o mesmo. */
function desloca(chave) {
  let h = 2166136261;
  for (const c of chave) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 16;
}

// Termina em ,90: é o preço que a vitrine e o anúncio mostram.
const noventa = (v) => Math.floor(v) + 0.90;

function precificar(nome, tipo) {
  const palavras = new Set(semAcento(nome).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  const cru = nome.toLowerCase();
  const bate = (grupo) => grupo.some(t => palavras.has(semAcento(t)) || cru.includes(t));

  const achados = DETALHES.filter(d => bate(d.termos)).map(d => d.valor).sort((a, b) => b - a);
  let extra = achados.reduce((soma, valor, i) => soma + valor * Math.pow(0.75, i), 0);
  if (!achados.length || bate(SIMPLES)) extra -= 8;

  const preco = noventa(Math.min(tipo.piso + extra, tipo.teto));
  return { preco, precoDe: noventa(Math.min(preco * 1.24, tipo.teto * 1.28)) };
}

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
  // Preço escrito no nome do arquivo manda; sem ele, a peça é precificada
  // pelo que o nome descreve, mais o deslocamento próprio dela.
  const tabela = precificar(info.nome, classe.tipo);
  const preco = b ?? a ?? noventa(Math.min(tabela.preco + desloca(chave), classe.tipo.teto));
  // Sem preço no nome: o calculado entra como "por" e o cheio como "de"
  const precoDe = info.precos.length ? undefined : noventa(preco * 1.24);
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
  else if (precoDe && precoDe > preco) produto.oldPrice = precoDe;
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
