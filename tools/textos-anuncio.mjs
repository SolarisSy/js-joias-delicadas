/* ===========================================================
   TEXTO DE ANÚNCIO — uma peça, todos os canais

   Fonte única dos textos: `gerar-posts.mjs` escreve o posts.md
   e `gerar-marketplace.mjs` monta a página de postagem com as
   mesmas palavras. Mudou aqui, mudou nos dois.
   =========================================================== */

import { SITE, secaoDe, url } from './ler-catalogo.mjs';

export const LIMITE_TITULO_OLX = 90;          // a OLX corta o que passar disso
export const LIMITE_TITULO_MARKETPLACE = 100; // limite do campo Título do Facebook Marketplace

export const dinheiro = (v) => 'R$ ' + Number(v).toFixed(2).replace('.', ',');

export const acabamentoDe = (p) => (p.details || []).find(d => /ouro|ródio|rodio|prata/i.test(d)) || 'Ouro 18k';

// Singular da seção: "Anéis" → "anel", para caber no título do anúncio
const SINGULAR = {
  'Anéis': 'anel', 'Brincos': 'brinco', 'Argolas': 'argola', 'Colares': 'colar',
  'Pulseiras': 'pulseira', 'Tornozeleiras': 'tornozeleira', 'Conjuntos': 'conjunto',
  'Piercings': 'piercing', 'Braceletes': 'bracelete'
};
export const pecaDe = (p) => SINGULAR[secaoDe(p)] || 'semi-joia';

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

export const link = (p) => `${url('produto.html')}?id=${encodeURIComponent(p.id)}`;

export function textos(p) {
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

  // Marketplace é classificado: título é busca e a descrição fecha no chat.
  // Link externo aqui derruba o alcance do anúncio — por isso o catálogo
  // não entra no texto, entra na resposta do chat.
  let tituloMarketplace = `${p.name} Semi Joia Banhada ${acabamento} Antialérgica Feminina`;
  if (tituloMarketplace.length > LIMITE_TITULO_MARKETPLACE) tituloMarketplace = `${p.name} Semi Joia Banhada ${acabamento}`;
  if (tituloMarketplace.length > LIMITE_TITULO_MARKETPLACE) tituloMarketplace = tituloMarketplace.slice(0, LIMITE_TITULO_MARKETPLACE).trim();

  const descricaoMarketplace = [
    `${p.name} — semi-joia banhada a ${acabamento.toLowerCase()}.`,
    '',
    `✦ ${preco} — 5% de desconto no Pix`,
    '✦ Antialérgica, não escurece com o uso',
    '✦ 1 ano de garantia (troca ou reparo mediante análise)',
    '✦ Peça nova, pronta-entrega',
    '✦ Embalagem para presente com certificado',
    '',
    'Entrego combinando o ponto ou envio para todo o Brasil pelos Correios.',
    'Frete grátis acima de R$ 150.',
    '',
    'Chame no chat que eu mando mais fotos e o catálogo completo.'
  ].join('\n');

  return {
    tituloOlx, descricaoOlx, legendaInstagram, tituloPinterest, descricaoPinterest, whatsapp,
    tituloMarketplace, descricaoMarketplace
  };
}

/* ===========================================================
   ANÚNCIO PAGO — a mesma copy no criativo, na página e na API

   Abre pela objeção que trava a venda de semi-joia (escurece?),
   responde com a garantia e só então oferece. As duas primeiras
   linhas são o que aparece antes do "ver mais" no feed.
   =========================================================== */
export const ANUNCIO_PAGO = {
  titulo: 'Semi-joia que não escurece',
  descricao: 'Ouro 18k com 1 ano de garantia',
  texto: [
    'Cansada de folheado que escurece em duas semanas?',
    '',
    'As nossas peças são banhadas a ouro 18k, antialérgicas e vêm com 1 ano de garantia — escureceu, a gente troca.',
    '',
    '✦ Frete grátis acima de R$ 150',
    '✦ 5% de desconto no Pix',
    '✦ Pronta-entrega, envio para todo o Brasil',
    '',
    'Chame no WhatsApp e receba o catálogo completo 💛'
  ].join('\n')
};
