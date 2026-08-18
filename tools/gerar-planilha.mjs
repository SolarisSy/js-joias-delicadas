#!/usr/bin/env node
/* ===========================================================
   PLANILHA DO CATÁLOGO — JS Joias Delicadas

   Escreve catalogo.csv com o mesmo catálogo do feed, só que no
   formato que se cola à mão nos canais que não leem XML:
   catálogo do WhatsApp Business, anúncio da OLX e importação
   por planilha de Shopee / Shein.

   Uso:  node tools/gerar-planilha.mjs
   (também roda sozinho no deploy — .github/workflows/deploy.yml)

   Abre no Excel/Google Sheets: separador ";" e BOM UTF-8, senão
   o Excel brasileiro come os acentos.
   =========================================================== */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, LOJA, lerCatalogo, secaoDe, url } from './ler-catalogo.mjs';

const SAIDA = join(RAIZ, 'catalogo.csv');

const COLUNAS = [
  'id', 'nome', 'secao', 'preco', 'preco_de', 'disponivel',
  'descricao', 'foto', 'link', 'marca', 'material'
];

// Campo com ; " ou quebra de linha precisa de aspas; aspas internas dobram.
const campo = (v) => {
  const t = v === undefined || v === null ? '' : String(v);
  return /[";\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};

// Vírgula decimal: é o que a planilha brasileira espera.
const dinheiro = (v) => (typeof v === 'number' ? v.toFixed(2).replace('.', ',') : '');

const produtos = lerCatalogo();

const linhas = produtos.map(p => [
  p.id,
  p.name,
  secaoDe(p),
  dinheiro(p.price),
  dinheiro(p.oldPrice && p.oldPrice > p.price ? p.oldPrice : undefined),
  p.soldOut ? 'nao' : 'sim',
  p.desc || '',
  url(p.image),
  `${url('produto.html')}?id=${encodeURIComponent(p.id)}`,
  LOJA,
  (p.details || []).find(d => /ouro|ródio|rodio|prata/i.test(d)) || 'Ouro 18k'
].map(campo).join(';'));

writeFileSync(SAIDA, '﻿' + [COLUNAS.join(';'), ...linhas].join('\r\n') + '\r\n');

const disponiveis = produtos.filter(p => !p.soldOut).length;
console.log(`${produtos.length} produto(s) → catalogo.csv (${disponiveis} disponível(is))`);
