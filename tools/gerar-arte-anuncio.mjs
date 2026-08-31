#!/usr/bin/env node
/* ===========================================================
   ARTE DO ANÚNCIO — peça de campanha, feed e story

   Monta a imagem que vai no anúncio pago e no post: foto da
   joia, a promessa da marca e o selo de frete grátis acima de
   R$ 150. Sai em 1080x1080 (feed) e 1080x1920 (story), os dois
   formatos que a Meta pede no mesmo criativo.

   Renderiza com o Chrome já instalado no Mac — por isso fica
   fora do deploy, que roda em Linux, igual ao gerar-pins.sh.

   Uso:
     node tools/gerar-arte-anuncio.mjs
     PECA="colar dourado bolinhas marteladas" node tools/gerar-arte-anuncio.mjs

   Saída: artes/anuncio-frete-gratis-feed.png e -story.png
   =========================================================== */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { RAIZ } from './ler-catalogo.mjs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PECA = process.env.PECA || 'anel dourado com pedra preta';
const SAIDA = join(RAIZ, 'artes');

const foto = 'data:image/png;base64,' +
  readFileSync(join(RAIZ, 'imagens', `${PECA}.png`)).toString('base64');

/* Didot e Helvetica Neue vêm no macOS: a arte não depende de rede
   nem de fonte baixada, e sai igual toda vez que rodar. */
const pagina = (largura, altura) => {
  const story = altura > largura;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${largura}px;height:${altura}px;overflow:hidden;background:#0B0A0C;
    font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;color:#F3EFE7}
  .arte{position:relative;width:100%;height:100%;display:flex;
    flex-direction:${story ? 'column' : 'row'};isolation:isolate}
  /* halo quente atrás da peça: o dourado da joia continua no fundo */
  .arte::before{content:"";position:absolute;inset:0;z-index:0;
    background:radial-gradient(${story ? '58% 34% at 50% 30%' : '46% 62% at 68% 50%'},
      rgba(186,142,66,.34), rgba(11,10,12,0) 70%)}
  .foto{position:relative;z-index:1;flex:${story ? '0 0 52%' : '0 0 52%'};
    order:${story ? 0 : 2};overflow:hidden}
  .foto img{width:100%;height:100%;object-fit:cover;filter:saturate(1.05) contrast(1.04)}
  /* a foto não termina numa borda dura: ela se dissolve no fundo */
  .foto::after{content:"";position:absolute;inset:0;
    background:linear-gradient(${story ? 'to top' : 'to right'},
      rgba(11,10,12,1) 0%, rgba(11,10,12,.92) ${story ? '12%' : '10%'},
      rgba(11,10,12,.45) ${story ? '34%' : '36%'}, rgba(11,10,12,0) ${story ? '72%' : '80%'})}
  .texto{position:relative;z-index:2;flex:1;display:flex;flex-direction:column;
    justify-content:center;gap:${story ? '38px' : '30px'};
    padding:${story ? '0 96px 130px' : '0 74px 0 88px'};
    margin-${story ? 'top' : 'right'}:${story ? '-120px' : '-90px'}}
  .marca{font-size:${story ? 26 : 21}px;letter-spacing:.42em;text-transform:uppercase;
    color:#C9A15C;font-weight:500}
  .marca span{display:block;margin-top:14px;width:64px;height:1px;background:#C9A15C;opacity:.55}
  h1{font-family:Didot,"Bodoni 72",Georgia,serif;font-weight:400;
    font-size:${story ? 108 : 84}px;line-height:1.02;letter-spacing:-.01em}
  h1 em{font-style:italic;color:#E4C387}
  .selo{align-self:flex-start;display:flex;align-items:baseline;gap:14px;white-space:nowrap;
    border:1px solid rgba(201,161,92,.5);border-radius:999px;
    padding:${story ? '20px 34px' : '16px 28px'};background:rgba(201,161,92,.09)}
  .selo b{font-family:Didot,"Bodoni 72",Georgia,serif;font-weight:400;
    font-size:${story ? 40 : 32}px;color:#E4C387;letter-spacing:.01em}
  .selo small{font-size:${story ? 22 : 17}px;letter-spacing:.16em;text-transform:uppercase;
    color:#F3EFE7;opacity:.72}
  .lista{display:flex;flex-direction:column;gap:${story ? 16 : 13}px;
    font-size:${story ? 30 : 24}px;color:#CFC7BA}
  .lista div{display:flex;align-items:center;gap:14px}
  .lista i{width:5px;height:5px;border-radius:50%;background:#C9A15C;display:block}
  .rodape{position:absolute;z-index:3;left:${story ? 96 : 88}px;bottom:${story ? 84 : 62}px;
    font-size:${story ? 26 : 21}px;letter-spacing:.2em;text-transform:uppercase;color:#8E877D}
  </style></head><body>
  <div class="arte">
    <div class="foto"><img src="${foto}" alt=""></div>
    <div class="texto">
      <div class="marca">JS Joias Delicadas<span></span></div>
      <h1>Ouro 18k<br>que <em>não escurece</em></h1>
      <div class="selo"><b>Frete grátis</b><small>acima de R$ 150</small></div>
      <div class="lista">
        <div><i></i>Antialérgica, para usar todo dia</div>
        <div><i></i>1 ano de garantia</div>
        <div><i></i>5% de desconto no Pix</div>
      </div>
    </div>
    <div class="rodape">Pronta-entrega · envio para todo o Brasil</div>
  </div></body></html>`;
};

const pasta = mkdtempSync(join(tmpdir(), 'arte-'));

for (const [nome, largura, altura] of [['feed', 1080, 1080], ['story', 1080, 1920]]) {
  const html = join(pasta, `${nome}.html`);
  const png = join(SAIDA, `anuncio-frete-gratis-${nome}.png`);
  writeFileSync(html, pagina(largura, altura));
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=1', `--window-size=${largura},${altura}`,
    `--screenshot=${png}`, `file://${html}`
  ], { stdio: 'ignore' });
  console.log(`${largura}x${altura} → artes/anuncio-frete-gratis-${nome}.png`);
}
