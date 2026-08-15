#!/usr/bin/env node
/* ===========================================================
   GERADOR DE FEED DE DADOS — JS Joias Delicadas

   Monta o mesmo catálogo que a loja mostra e escreve feed.xml
   no formato de feed de produtos do Facebook/Instagram
   (RSS 2.0 com o namespace g:, o mesmo que o Meta Commerce
   Manager e o Google Merchant leem).

   Uso:  node tools/gerar-feed.mjs
   (também roda sozinho no deploy — .github/workflows/deploy.yml)

   No Commerce Manager: Catálogo → Fontes de dados → Feed de dados
   → agendar busca por URL, apontando para

     https://solarissy.github.io/js-joias-delicadas/feed.xml

   Rode tools/gerar-catalogo.mjs antes: o feed lê o catálogo já
   gerado, então nenhuma regra de nome de arquivo vive aqui.
   Endereço do site pode vir de SITE_URL (útil em domínio próprio).
   =========================================================== */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = join(RAIZ, 'feed.xml');

const SITE = (process.env.SITE_URL || 'https://solarissy.github.io/js-joias-delicadas/').replace(/\/?$/, '/');
const LOJA = 'JS Joias Delicadas';
const MOEDA = 'BRL';

/* Os arquivos de dados da loja só fazem window.X = ...; rodá-los
   num contexto vazio devolve o mesmo que o navegador enxerga. */
function lerWindow(arquivo) {
  const contexto = vm.createContext({ window: {} });
  vm.runInContext(readFileSync(join(RAIZ, arquivo), 'utf8'), contexto);
  return contexto.window;
}

/* O catálogo antigo mora dentro do script.js, num literal de array.
   Recortá-lo evita duplicar aqui as 16 peças escritas à mão. */
function lerCatalogoAntigo() {
  const fonte = readFileSync(join(RAIZ, 'script.js'), 'utf8');
  const trecho = fonte.match(/^const products = (\[[\s\S]*?^\]);/m);
  if (!trecho) throw new Error('script.js: array `products` não encontrado');
  return vm.runInNewContext(trecho[1]);
}

// ---------- catálogo final, na mesma ordem de prioridade da loja ----------

const produtos = lerCatalogoAntigo();

const auto = lerWindow('data/catalogo-auto.js').PRODUCTS_AUTO || [];
const jaNoCatalogo = new Set(produtos.map(p => p.image));
produtos.unshift(...auto.filter(p => p && p.image && !jaNoCatalogo.has(p.image)));

// Ajustes publicados pelo painel de controle (admin.html)
const painel = lerWindow('data/produtos.js');
const overrides = painel.PRODUCTS_OVERRIDE || {};
const extras = painel.PRODUCTS_EXTRA || [];

for (let i = produtos.length - 1; i >= 0; i--) {
  const o = overrides[produtos[i].id];
  if (!o) continue;
  if (o.hidden) { produtos.splice(i, 1); continue; } // peça escondida não vai para o anúncio
  ['name', 'badge', 'desc'].forEach(k => { if (typeof o[k] === 'string' && o[k].trim()) produtos[i][k] = o[k].trim(); });
  if (typeof o.price === 'number' && o.price > 0) produtos[i].price = o.price;
  if (typeof o.oldPrice === 'number' && o.oldPrice > 0) produtos[i].oldPrice = o.oldPrice;
  if (o.oldPrice === null) delete produtos[i].oldPrice;
  if (typeof o.soldOut === 'boolean') {
    if (o.soldOut) produtos[i].soldOut = true;
    else delete produtos[i].soldOut;
  }
}
produtos.unshift(...extras.filter(x => x && !x.hidden));

// ---------- feed ----------

const escapar = (t) => String(t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const url = (caminho) => SITE + String(caminho).replace(/^\//, '');
const dinheiro = (valor) => `${Number(valor).toFixed(2)} ${MOEDA}`;
const tag = (nome, valor) => `      <${nome}>${escapar(valor)}</${nome}>`;

// "Anéis · Ouro 18k" → seção da loja, que vira o product_type do anúncio
const secaoDe = (p) => String(p.tag || '').split('·')[0].trim() || 'Semi-joias';

function item(p) {
  const linhas = [
    tag('g:id', p.id),
    tag('g:title', p.name),
    tag('g:description', p.desc || `${p.name} — semi-joia ${secaoDe(p).toLowerCase()} da ${LOJA}.`),
    tag('g:link', `${url('produto.html')}?id=${encodeURIComponent(p.id)}`),
    tag('g:image_link', url(p.image))
  ];
  if (p.imageAlt) linhas.push(tag('g:additional_image_link', url(p.imageAlt)));
  linhas.push(
    tag('g:availability', p.soldOut ? 'out of stock' : 'in stock'),
    tag('g:condition', 'new'),
    tag('g:brand', LOJA),
    // Preço cheio no g:price e o promocional no g:sale_price: é assim que o
    // Meta mostra o "de/por" que a vitrine já exibe.
    tag('g:price', dinheiro(p.oldPrice && p.oldPrice > p.price ? p.oldPrice : p.price))
  );
  if (p.oldPrice && p.oldPrice > p.price) linhas.push(tag('g:sale_price', dinheiro(p.price)));
  linhas.push(
    tag('g:product_type', secaoDe(p)),
    tag('g:google_product_category', 'Apparel & Accessories > Jewelry'),
    tag('g:material', (p.details || []).find(d => /ouro|ródio|rodio|prata/i.test(d)) || 'Ouro 18k')
  );
  return `    <item>\n${linhas.join('\n')}\n    </item>`;
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- GERADO AUTOMATICAMENTE — não edite à mão.
     Recriar: node tools/gerar-feed.mjs -->
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapar(LOJA)}</title>
    <link>${escapar(SITE)}</link>
    <description>Semi-joias banhadas a ouro 18k e ródio branco, antialérgicas e com 1 ano de garantia.</description>
${produtos.map(item).join('\n')}
  </channel>
</rss>
`;

writeFileSync(SAIDA, xml);

const disponiveis = produtos.filter(p => !p.soldOut).length;
console.log(`${produtos.length} produto(s) → feed.xml (${disponiveis} disponível(is), ${produtos.length - disponiveis} esgotado(s))`);
console.log(`URL do feed: ${url('feed.xml')}`);
