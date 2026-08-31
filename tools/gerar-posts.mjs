#!/usr/bin/env node
/* ===========================================================
   TEXTOS DE DIVULGAÇÃO — JS Joias Delicadas

   Escreve posts.md com, para cada peça, o texto pronto de cada
   canal orgânico: título e descrição da OLX, legenda de
   Instagram com hashtags, título e descrição de Pinterest, a
   mensagem de WhatsApp e o anúncio do Facebook Marketplace.
   É copiar e colar — nada aqui posta sozinho, os canais
   orgânicos não têm API gratuita para isso.

   Uso:  node tools/gerar-posts.mjs
   =========================================================== */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, lerCatalogo, secaoDe } from './ler-catalogo.mjs';
import { dinheiro, link, textos } from './textos-anuncio.mjs';

const SAIDA = join(RAIZ, 'posts.md');

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
      '```', t.whatsapp, '```',
      `**Facebook Marketplace — título** (${t.tituloMarketplace.length}/100)`,
      '```', t.tituloMarketplace, '```',
      '**Facebook Marketplace — descrição** · Categoria: Roupas e acessórios › Joias e acessórios · Condição: Novo',
      '```', t.descricaoMarketplace, '```'
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
