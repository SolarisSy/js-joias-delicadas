#!/usr/bin/env node
/* ===========================================================
   TEXTOS DE DIVULGAÇÃO — JS Joias Delicadas

   Escreve posts.md com, para cada peça, o texto pronto de cada
   canal orgânico: título e descrição da OLX, legenda de
   Instagram com hashtags, título e descrição de Pinterest e a
   mensagem de WhatsApp. É copiar e colar — nada aqui posta
   sozinho, os canais orgânicos não têm API gratuita para isso.

   Uso:  node tools/gerar-posts.mjs
   =========================================================== */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, SITE, lerCatalogo, secaoDe, url } from './ler-catalogo.mjs';

const SAIDA = join(RAIZ, 'posts.md');
const LIMITE_TITULO_OLX = 90; // a OLX corta o que passar disso

const dinheiro = (v) => 'R$ ' + Number(v).toFixed(2).replace('.', ',');

const acabamentoDe = (p) => (p.details || []).find(d => /ouro|ródio|rodio|prata/i.test(d)) || 'Ouro 18k';

// Singular da seção: "Anéis" → "anel", para caber no título do anúncio
const SINGULAR = {
  'Anéis': 'anel', 'Brincos': 'brinco', 'Argolas': 'argola', 'Colares': 'colar',
  'Pulseiras': 'pulseira', 'Tornozeleiras': 'tornozeleira', 'Conjuntos': 'conjunto',
  'Piercings': 'piercing', 'Braceletes': 'bracelete'
};
const pecaDe = (p) => SINGULAR[secaoDe(p)] || 'semi-joia';

const HASHTAGS_BASE = ['#semijoias', '#semijoiasfinas', '#joiasdelicadas', '#acessoriosfemininos', '#presenteparaela'];
const HASHTAG_SECAO = {
  'Anéis': ['#aneis', '#aneisfemininos'], 'Brincos': ['#brincos', '#brincosdelicados'],
  'Argolas': ['#argolas', '#argolinhas'], 'Colares': ['#colares', '#colardelicado'],
  'Pulseiras': ['#pulseiras', '#pulseirafeminina'], 'Conjuntos': ['#conjuntodesemijoias'],
  'Tornozeleiras': ['#tornozeleira'], 'Piercings': ['#piercing'], 'Braceletes': ['#bracelete']
};

function hashtags(p) {
  const material = /ouro/i.test(acabamentoDe(p)) ? ['#banhadoaouro18k', '#folheado'] : ['#pratacomrodio', '#ródiobranco'];
  return [...(HASHTAG_SECAO[secaoDe(p)] || []), ...material, ...HASHTAGS_BASE].join(' ');
}

const link = (p) => `${url('produto.html')}?id=${encodeURIComponent(p.id)}`;

function textos(p) {
  const preco = dinheiro(p.price);
  const acabamento = acabamentoDe(p);
  const peca = pecaDe(p);

  // Título de anúncio vende por palavra-chave, não por poesia: peça + acabamento + benefício
  let tituloOlx = `${p.name} Banhado ${acabamento} Antialérgico`;
  if (tituloOlx.length > LIMITE_TITULO_OLX) tituloOlx = `${p.name} ${acabamento}`;
  if (tituloOlx.length > LIMITE_TITULO_OLX) tituloOlx = tituloOlx.slice(0, LIMITE_TITULO_OLX).trim();

  const descricaoOlx = [
    `${p.name} — semi-joia banhada a ${acabamento.toLowerCase()}.`,
    '',
    '✦ Antialérgica, não escurece com o uso',
    '✦ 1 ano de garantia (troca ou reparo mediante análise)',
    '✦ Pronta-entrega, enviamos para todo o Brasil',
    '✦ Embalagem para presente com certificado de garantia',
    '',
    `Valor: ${preco} — 5% de desconto no Pix.`,
    'Frete grátis nas compras acima de R$ 150.',
    '',
    `Esta peça: ${link(p)}`,
    `Catálogo completo: ${SITE}`
  ].join('\n');

  const legendaInstagram = [
    `${p.name} ✦`,
    '',
    `${(p.desc || '').split('.')[0]}.`,
    `${preco} — ou 5% off no Pix.`,
    '',
    'Antialérgica, 1 ano de garantia e pronta-entrega 💛',
    'Chama no direct ou no link da bio pra garantir a sua.',
    '',
    hashtags(p)
  ].join('\n');

  const tituloPinterest = `${p.name} — ${peca} banhado a ${acabamento.toLowerCase()}`;
  const descricaoPinterest =
    `${p.name}, ${peca} antialérgico banhado a ${acabamento.toLowerCase()}, com 1 ano de garantia. ` +
    `${preco} com pronta-entrega e envio para todo o Brasil. ` +
    `Ideal para uso diário e para presentear.`;

  const whatsapp =
    `Oi! Chegou o ${p.name} ✨\n${preco} (5% off no Pix), antialérgico e com 1 ano de garantia.\n${link(p)}`;

  return { tituloOlx, descricaoOlx, legendaInstagram, tituloPinterest, descricaoPinterest, whatsapp };
}

const produtos = lerCatalogo().filter(p => !p.soldOut);

// Agrupado por seção: é assim que a divulgação é planejada, uma seção por semana
const porSecao = new Map();
for (const p of produtos) {
  const secao = secaoDe(p);
  if (!porSecao.has(secao)) porSecao.set(secao, []);
  porSecao.get(secao).push(p);
}

const blocos = [...porSecao.entries()].map(([secao, pecas]) => {
  const itens = pecas.map(p => {
    const t = textos(p);
    return [
      `### ${p.name} — ${dinheiro(p.price)}`,
      '',
      `Foto: \`${p.image}\` · Link: ${link(p)}`,
      '',
      `**OLX — título** (${t.tituloOlx.length}/90)`,
      '```', t.tituloOlx, '```',
      '**OLX — descrição**',
      '```', t.descricaoOlx, '```',
      '**Instagram / Facebook — legenda**',
      '```', t.legendaInstagram, '```',
      '**Pinterest — título e descrição**',
      '```', `${t.tituloPinterest}\n\n${t.descricaoPinterest}`, '```',
      '**WhatsApp — mensagem**',
      '```', t.whatsapp, '```'
    ].join('\n');
  }).join('\n\n');
  return `## ${secao} (${pecas.length} peças)\n\n${itens}`;
});

const cabecalho = `# Textos prontos de divulgação

GERADO AUTOMATICAMENTE — não edite à mão. Recriar: \`node tools/gerar-posts.mjs\`

${produtos.length} peças à venda. Copie o bloco do canal e cole. O roteiro de
frequência de cada canal está em COMO-INTEGRAR.md.
`;

writeFileSync(SAIDA, `${cabecalho}\n${blocos.join('\n\n')}\n`);
console.log(`${produtos.length} peça(s) → posts.md`);
