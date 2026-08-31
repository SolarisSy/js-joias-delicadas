#!/usr/bin/env node
/* ===========================================================
   PIXEL × CATÁLOGO — diagnóstico e conexão pela Graph API

   Responde, sem abrir o Gerenciador de Eventos, as duas
   perguntas que travam a taxa de correspondência do catálogo:
   qual pixel está de fato recebendo eventos do site e qual
   pixel o catálogo está escutando.

   Token: o mesmo de tools/cadastrar-feed-meta.mjs, com as
   permissões catalog_management e ads_management.

   Uso:
     META_TOKEN=EAA... node tools/conectar-pixel-meta.mjs
       → lista os pixels do negócio, quando cada um disparou
         pela última vez, e o que o catálogo escuta hoje

     META_TOKEN=EAA... META_CATALOG_ID=818990844574983 \
     META_PIXEL_ID=1331208122113813 \
     node tools/conectar-pixel-meta.mjs
       → conecta esse pixel ao catálogo
   =========================================================== */

const TOKEN = process.env.META_TOKEN;
const CATALOGO = process.env.META_CATALOG_ID;
const PIXEL = process.env.META_PIXEL_ID;
const VERSAO = process.env.GRAPH_VERSION || 'v23.0';

if (!TOKEN) {
  console.error('Falta META_TOKEN. Veja o cabeçalho de tools/cadastrar-feed-meta.mjs.');
  process.exit(1);
}

const api = async (caminho, opcoes = {}) => {
  const resposta = await fetch(`https://graph.facebook.com/${VERSAO}/${caminho}`, opcoes);
  const corpo = await resposta.json();
  if (corpo.error) throw new Error(`${corpo.error.message} (código ${corpo.error.code})`);
  return corpo;
};

const comToken = (params) => new URLSearchParams({ ...params, access_token: TOKEN });

const quando = (iso) => {
  if (!iso) return 'nunca disparou';
  const dias = Math.floor((Date.now() - new Date(iso)) / 86400000);
  return dias === 0 ? 'disparou hoje' : `último evento há ${dias} dia(s)`;
};

async function diagnosticar() {
  const negocios = await api(`me/businesses?${comToken({ fields: 'id,name' })}`);
  for (const negocio of negocios.data || []) {
    console.log(`\n${negocio.name} (negócio ${negocio.id})`);

    const pixels = await api(`${negocio.id}/adspixels?${comToken({ fields: 'id,name,last_fired_time' })}`);
    console.log('  Pixels:');
    for (const p of pixels.data || []) {
      console.log(`    ${p.id}  ${p.name || 'sem nome'} — ${quando(p.last_fired_time)}`);
    }
    if (!pixels.data?.length) console.log('    nenhum');

    const catalogos = await api(`${negocio.id}/owned_product_catalogs?${comToken({ fields: 'id,name' })}`);
    for (const c of catalogos.data || []) {
      const fontes = await api(`${c.id}/external_event_sources?${comToken({ fields: 'id,name' })}`);
      const ligados = (fontes.data || []).map(f => f.id).join(', ') || 'nenhum';
      console.log(`  Catálogo ${c.id} (${c.name}) escuta: ${ligados}`);
    }
  }
  console.log('\nO pixel que o catálogo escuta precisa ser o mesmo que disparou hoje.');
  console.log('Para ligar: META_CATALOG_ID=<id> META_PIXEL_ID=<id> node tools/conectar-pixel-meta.mjs');
}

async function conectar() {
  await api(`${CATALOGO}/external_event_sources`, {
    method: 'POST',
    body: comToken({ external_event_sources: JSON.stringify([PIXEL]) })
  });
  console.log(`Pixel ${PIXEL} conectado ao catálogo ${CATALOGO}.`);
  const fontes = await api(`${CATALOGO}/external_event_sources?${comToken({ fields: 'id,name' })}`);
  console.log('Fontes agora:', (fontes.data || []).map(f => `${f.id} ${f.name || ''}`.trim()).join(' · '));
}

try {
  await (CATALOGO && PIXEL ? conectar() : diagnosticar());
} catch (erro) {
  console.error(`\nFalhou: ${erro.message}`);
  process.exit(1);
}
