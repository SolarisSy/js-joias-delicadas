#!/usr/bin/env node
/* ===========================================================
   FILA DO MARKETPLACE — página de postagem manual

   Escreve marketplace.html: uma ficha por peça com a foto, o
   título dentro do limite de 100 caracteres, a descrição pronta
   e o botão de baixar a foto. Existe porque o Facebook
   Marketplace não tem API para joia — o anúncio é criado à mão,
   do perfil pessoal, e esta página é o balcão de apoio.

   Fica fora do sitemap e com noindex: é ferramenta de trabalho,
   não vitrine.

   Uso:  node tools/gerar-marketplace.mjs
   =========================================================== */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, lerCatalogo, secaoDe } from './ler-catalogo.mjs';
import { dinheiro, acabamentoDe, textos } from './textos-anuncio.mjs';

const SAIDA = join(RAIZ, 'marketplace.html');

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (t) => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const CHECK = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8.6 6 12.5 14 3.5"/></svg>';
const BAIXAR = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v8.5M4.5 7.5 8 11l3.5-3.5M2.5 13.5h11"/></svg>';

const FIXOS = [
  ['Categoria', 'Roupas e acessórios › Joias e acessórios'],
  ['Condição', 'Novo'],
  ['Anunciar como estoque', 'marque, senão o anúncio some na primeira venda'],
  ['Publicar em grupos', 'até 10 grupos de compra e venda da sua região'],
  ['Localização', 'sua cidade — o comprador busca por raio'],
  ['Nada de link no texto', 'o site vai na resposta do chat, não na descrição']
];

const campo = (rotulo, texto, conta) => `<div class="campo">
  <div class="campo-cab"><label>${esc(rotulo)}</label><div class="acoes">${conta ? `<span class="conta">${conta}</span>` : ''}<button class="botao" type="button" data-copiar>Copiar</button></div></div>
  <pre>${esc(texto)}</pre>
</div>`;

const produtos = lerCatalogo().filter(p => !p.soldOut);
const secoes = [...new Set(produtos.map(secaoDe))];

const fichas = produtos.map((p, i) => {
  const t = textos(p);
  const acabamento = acabamentoDe(p);
  const material = /ouro/i.test(acabamento) ? 'ouro' : 'prata';
  const extensao = (p.image.split('.').pop() || 'png').split('?')[0];
  const arquivo = `${slug(p.name)}.${extensao}`;
  return `<article class="ficha" data-id="${esc(p.id)}" data-secao="${esc(secaoDe(p))}" data-busca="${esc((p.name + ' ' + secaoDe(p)).toLowerCase())}" data-feito="0">
  <figure class="foto">
    <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" width="600" height="600">
    <figcaption>
      <span>${esc(arquivo)}</span>
      <a class="botao" href="${esc(p.image)}" download="${esc(arquivo)}">${BAIXAR} Baixar foto</a>
    </figcaption>
  </figure>
  <div class="corpo">
    <div class="cab">
      <div>
        <h3 class="nome">${esc(p.name)}</h3>
        <div class="tags"><span class="tag">${esc(secaoDe(p))}</span><span class="tag mat-${material}">${esc(acabamento.toLowerCase())}</span></div>
      </div>
      <div class="preco">${dinheiro(p.price)}<small>5% off no Pix</small></div>
    </div>
    ${campo('Título', t.tituloMarketplace, `${t.tituloMarketplace.length}/100`)}
    ${campo('Descrição', t.descricaoMarketplace)}
    <div class="rodape">
      <label class="marcar"><input type="checkbox" data-feito-input> Publicado no Marketplace</label>
      <span class="ordem">${String(i + 1).padStart(3, '0')} / ${String(produtos.length).padStart(3, '0')}</span>
    </div>
  </div>
</article>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Fila do Marketplace — JS Joias Delicadas</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Karla:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root{
  --ground:#FFFFFF; --surface:#F5F4F8; --sunk:#EDEBF2;
  --ink:#17151C; --muted:#6C6875; --line:#E3E1E9;
  --gold:#8A6620; --gold-soft:#F1E7D4; --silver:#5E6B7A; --silver-soft:#E6EAEF;
  --done:#2E6B4F; --done-soft:#DFEDE6;
  --shadow:0 1px 2px rgba(23,21,28,.05), 0 8px 24px -16px rgba(23,21,28,.28);
}
@media (prefers-color-scheme: dark){
  :root{
    --ground:#131218; --surface:#1C1A23; --sunk:#232029;
    --ink:#EDEBF1; --muted:#9A94A5; --line:#302D3A;
    --gold:#D8B26A; --gold-soft:#332A19; --silver:#A6B3C2; --silver-soft:#212831;
    --done:#6FC395; --done-soft:#1B2C23;
    --shadow:0 1px 2px rgba(0,0,0,.4), 0 10px 28px -18px rgba(0,0,0,.8);
  }
}
*{box-sizing:border-box}
html{color-scheme:light dark}
body{margin:0;background:var(--ground);color:var(--ink);font-family:Karla,"Helvetica Neue",Arial,sans-serif;font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased}
img{max-width:100%}
.wrap{max-width:900px;margin:0 auto;padding:40px 20px 80px;display:flex;flex-direction:column;gap:24px}

header{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:16px;border-bottom:1px solid var(--line);padding-bottom:20px}
.eyebrow{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:0}
h1{font-family:"Instrument Serif",Georgia,serif;font-weight:400;font-size:44px;line-height:1.02;margin:6px 0 0;text-wrap:balance}
h1 em{font-style:italic;color:var(--gold)}
.lede{color:var(--muted);max-width:56ch;margin:10px 0 0}
.counter{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:13px;color:var(--muted);white-space:nowrap;display:flex;align-items:center;gap:10px}
.counter b{font-size:26px;color:var(--ink);font-weight:500;font-variant-numeric:tabular-nums}
.bar{width:84px;height:5px;border-radius:3px;background:var(--sunk);overflow:hidden}
.bar span{display:block;height:100%;width:0;background:var(--done);transition:width .35s ease}

.filtros{position:sticky;top:0;z-index:5;background:var(--ground);border-bottom:1px solid var(--line);padding:12px 0;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.chip{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:5px 11px;border-radius:99px;border:1px solid var(--line);background:var(--ground);color:var(--muted);cursor:pointer}
.chip[aria-pressed="true"]{background:var(--ink);color:var(--ground);border-color:transparent}
.busca{flex:1;min-width:150px;font-family:Karla,sans-serif;font-size:14px;padding:6px 12px;border-radius:99px;border:1px solid var(--line);background:var(--surface);color:var(--ink)}
.esconder{display:flex;align-items:center;gap:7px;font-size:13px;color:var(--muted);cursor:pointer;user-select:none;white-space:nowrap}
.esconder input{accent-color:var(--done)}

.criativo{display:grid;grid-template-columns:1fr 300px;gap:26px;align-items:center;background:#0B0A0C;color:#F3EFE7;border-radius:16px;padding:26px 28px;box-shadow:var(--shadow)}
.criativo h2{font-family:"Instrument Serif",Georgia,serif;font-weight:400;font-size:31px;line-height:1.1;margin:6px 0 0}
.criativo h2 em{font-style:italic;color:#E4C387}
.criativo p{color:#B4ACA1;margin:9px 0 0;max-width:44ch;font-size:14px}
.criativo .eyebrow{color:#C9A15C}
.criativo .acoes{display:flex;gap:9px;flex-wrap:wrap;margin-top:16px}
.criativo .botao{background:transparent;color:#F3EFE7;border-color:rgba(201,161,92,.45)}
.criativo .botao:hover{border-color:#E4C387;color:#E4C387}
.previas{display:flex;gap:10px;justify-content:flex-end}
.previas a{display:block;border:1px solid rgba(201,161,92,.28);border-radius:9px;overflow:hidden;line-height:0}
.previas img{display:block;height:150px;width:auto}
.fixos{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:18px 20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px 22px}
.fixos h2{grid-column:1/-1;margin:0;font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:500}
.fixo{display:flex;gap:9px;align-items:flex-start;font-size:14px}
.fixo svg{flex:none;margin-top:3px;color:var(--gold)}
.fixo b{font-weight:600}
.fixo small{display:block;color:var(--muted);font-size:12.5px;line-height:1.4}

.ficha{background:var(--ground);border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow);overflow:hidden;display:grid;grid-template-columns:236px 1fr;transition:opacity .25s ease}
.ficha[data-feito="1"]{opacity:.5}
.ficha[hidden]{display:none}
.foto{position:relative;background:var(--sunk);border-right:1px solid var(--line);display:flex;flex-direction:column;margin:0}
.foto img{width:100%;aspect-ratio:1;object-fit:cover;display:block;height:auto}
.foto figcaption{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:10.5px;color:var(--muted);padding:9px 10px 10px 12px;word-break:break-word;line-height:1.35;border-top:1px solid var(--line);background:var(--surface);display:flex;flex-direction:column;align-items:flex-start;gap:8px;flex:1}
.corpo{padding:18px 20px 20px;display:flex;flex-direction:column;gap:14px;min-width:0}
.cab{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
.nome{font-family:"Instrument Serif",Georgia,serif;font-size:25px;line-height:1.15;margin:0;font-weight:400}
.tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}
.tag{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;padding:3px 8px;border-radius:99px;border:1px solid var(--line);color:var(--muted)}
.tag.mat-ouro{color:var(--gold);background:var(--gold-soft);border-color:transparent}
.tag.mat-prata{color:var(--silver);background:var(--silver-soft);border-color:transparent}
.preco{font-family:"Instrument Serif",Georgia,serif;font-size:27px;white-space:nowrap;font-variant-numeric:tabular-nums}
.preco small{font-family:Karla,sans-serif;font-size:12px;color:var(--muted);display:block;text-align:right;letter-spacing:.02em}

.campo{border:1px solid var(--line);border-radius:11px;background:var(--surface)}
.campo-cab{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px 8px 12px}
.campo-cab label{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.acoes{display:flex;align-items:center;gap:10px;font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:10.5px;color:var(--muted)}
.campo pre{margin:0;padding:0 12px 12px;font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:12.5px;line-height:1.65;white-space:pre-wrap;word-break:break-word;color:var(--ink)}
.botao{font-family:Karla,sans-serif;font-size:12px;font-weight:600;color:var(--ink);background:var(--ground);border:1px solid var(--line);border-radius:8px;padding:5px 11px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;text-decoration:none;white-space:nowrap;transition:background .15s,color .15s,border-color .15s}
.botao:hover{border-color:var(--gold);color:var(--gold)}
.botao[data-ok="1"]{background:var(--done-soft);border-color:transparent;color:var(--done)}
:focus-visible{outline:2px solid var(--gold);outline-offset:2px}

.rodape{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.marcar{display:flex;align-items:center;gap:8px;font-size:13.5px;color:var(--muted);cursor:pointer;user-select:none}
.marcar input{accent-color:var(--done);width:16px;height:16px;cursor:pointer}
.ficha[data-feito="1"] .marcar{color:var(--done);font-weight:600}
.ordem{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:11px;color:var(--muted);letter-spacing:.1em}
.vazio{color:var(--muted);text-align:center;padding:40px 0}

footer{border-top:1px solid var(--line);padding-top:18px;color:var(--muted);font-size:13.5px;display:flex;flex-wrap:wrap;gap:8px 18px;justify-content:space-between}
footer a{color:var(--ink)}

@media (max-width:680px){
  h1{font-size:34px}
  .criativo{grid-template-columns:1fr}
  .previas{justify-content:flex-start}
  .ficha{grid-template-columns:1fr}
  .foto{border-right:none;border-bottom:1px solid var(--line)}
  .foto img{aspect-ratio:16/10}
  .foto figcaption{flex-direction:row;align-items:center;justify-content:space-between}
  .cab{flex-direction:column}
  .preco small{text-align:left}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<div class="wrap">
<header>
  <div>
    <p class="eyebrow">JS Joias Delicadas · Facebook Marketplace</p>
    <h1>Fila do <em>Marketplace</em></h1>
    <p class="lede">${produtos.length} peças com foto, título dentro do limite e descrição prontos. Publique 5 a 10 por dia, do perfil pessoal, e marque as que já foram.</p>
  </div>
  <div class="counter"><b id="feitos">0</b><span>de ${produtos.length}<br>publicadas</span><span class="bar"><span id="barra"></span></span></div>
</header>

<div class="filtros">
  <button class="chip" type="button" data-secao="" aria-pressed="true">Todas</button>
  ${secoes.map(s => `<button class="chip" type="button" data-secao="${esc(s)}" aria-pressed="false">${esc(s)}</button>`).join('\n  ')}
  <input class="busca" type="search" id="busca" placeholder="Buscar peça…" aria-label="Buscar peça">
  <label class="esconder"><input type="checkbox" id="esconder"> esconder publicadas</label>
</div>

<section class="criativo">
  <div>
    <p class="eyebrow">Arte do anúncio</p>
    <h2>Frete grátis <em>acima de R$ 150</em></h2>
    <p>A peça de campanha nos dois formatos que a Meta pede no mesmo criativo: feed 1080×1080 e story 1080×1920. Serve para o impulsionamento, para o post e para o story.</p>
    <div class="acoes">
      <a class="botao" href="artes/anuncio-frete-gratis-feed.png" download>${BAIXAR} Baixar feed 1:1</a>
      <a class="botao" href="artes/anuncio-frete-gratis-story.png" download>${BAIXAR} Baixar story 9:16</a>
    </div>
  </div>
  <div class="previas">
    <a href="artes/anuncio-frete-gratis-feed.png" target="_blank" rel="noopener"><img src="artes/anuncio-frete-gratis-feed.png" alt="Arte do anúncio, formato feed" loading="lazy"></a>
    <a href="artes/anuncio-frete-gratis-story.png" target="_blank" rel="noopener"><img src="artes/anuncio-frete-gratis-story.png" alt="Arte do anúncio, formato story" loading="lazy"></a>
  </div>
</section>

<section class="fixos">
  <h2>Igual em todos os anúncios</h2>
  ${FIXOS.map(([t, d]) => `<div class="fixo">${CHECK}<div><b>${esc(t)}</b><small>${esc(d)}</small></div></div>`).join('\n  ')}
</section>

${fichas}

<p class="vazio" id="vazio" hidden>Nenhuma peça com esse filtro.</p>

<footer>
  <span>Gerado do catálogo — <a href="./">voltar para a loja</a></span>
  <span>Marcações ficam salvas neste navegador</span>
</footer>
</div>

<script>
const CHAVE = 'marketplace-publicadas';
const fichas = [...document.querySelectorAll('.ficha')];

const ler = () => { try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; } };
const gravar = (estado) => { try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) {} };

function placar() {
  const n = fichas.filter(f => f.dataset.feito === '1').length;
  document.getElementById('feitos').textContent = n;
  document.getElementById('barra').style.width = (n / fichas.length * 100) + '%';
}

const estado = ler();
for (const ficha of fichas) {
  const caixa = ficha.querySelector('[data-feito-input]');
  if (estado[ficha.dataset.id]) { caixa.checked = true; ficha.dataset.feito = '1'; }
  caixa.addEventListener('change', () => {
    ficha.dataset.feito = caixa.checked ? '1' : '0';
    const atual = ler();
    if (caixa.checked) atual[ficha.dataset.id] = true; else delete atual[ficha.dataset.id];
    gravar(atual);
    placar(); filtrar();
  });
}
placar();

/* ---- filtros ---- */
let secao = '';
const busca = document.getElementById('busca');
const esconder = document.getElementById('esconder');

function filtrar() {
  const termo = busca.value.trim().toLowerCase();
  let visiveis = 0;
  for (const ficha of fichas) {
    const ok = (!secao || ficha.dataset.secao === secao)
      && (!termo || ficha.dataset.busca.includes(termo))
      && (!esconder.checked || ficha.dataset.feito !== '1');
    ficha.hidden = !ok;
    if (ok) visiveis++;
  }
  document.getElementById('vazio').hidden = visiveis > 0;
}

for (const chip of document.querySelectorAll('.chip')) {
  chip.addEventListener('click', () => {
    secao = chip.dataset.secao;
    for (const outro of document.querySelectorAll('.chip')) outro.setAttribute('aria-pressed', String(outro === chip));
    filtrar();
  });
}
busca.addEventListener('input', filtrar);
esconder.addEventListener('change', filtrar);

/* ---- copiar ---- */
for (const botao of document.querySelectorAll('[data-copiar]')) {
  botao.addEventListener('click', async () => {
    const texto = botao.closest('.campo').querySelector('pre').textContent;
    try {
      await navigator.clipboard.writeText(texto);
    } catch (e) {
      const area = document.createElement('textarea');
      area.value = texto; document.body.appendChild(area); area.select();
      document.execCommand('copy'); area.remove();
    }
    botao.dataset.ok = '1'; botao.textContent = 'Copiado';
    setTimeout(() => { botao.removeAttribute('data-ok'); botao.textContent = 'Copiar'; }, 1600);
  });
}
</script>
</body>
</html>
`;

writeFileSync(SAIDA, html);
console.log(`${produtos.length} peça(s) → marketplace.html`);
