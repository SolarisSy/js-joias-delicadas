#!/usr/bin/env node
/* ===========================================================
   CADASTRO DO FEED NA META — sem abrir o Commerce Manager

   Cria (ou atualiza) a fonte de dados agendada do catálogo do
   Facebook/Instagram apontando para o feed.xml da loja. É o
   mesmo que a tela "Fontes de dados → Feed de dados → Agendar
   busca por URL" faz, só que por API.

   Antes de rodar, pegue um token:
     1. business.facebook.com → Configurações do negócio
     2. Usuários → Usuários do sistema → Adicionar (função Admin)
     3. Gerar novo token → app do negócio → marque catalog_management
     4. Atribua o catálogo a esse usuário do sistema (Ativos → Catálogos)

   Uso:
     META_TOKEN=EAA... node tools/cadastrar-feed-meta.mjs
       → lista os catálogos do negócio e mostra o id de cada um

     META_TOKEN=EAA... META_CATALOG_ID=123 node tools/cadastrar-feed-meta.mjs
       → cadastra o feed nesse catálogo, com busca diária

   O token vale só nesta execução: nada é gravado no repositório.
   =========================================================== */

import { SITE, url } from './ler-catalogo.mjs';

const TOKEN = process.env.META_TOKEN;
const CATALOGO = process.env.META_CATALOG_ID;
const VERSAO = process.env.GRAPH_VERSION || 'v23.0';
const FEED = url('feed.xml');
const NOME_DO_FEED = 'JS Joias Delicadas — feed do site';

if (!TOKEN) {
  console.error('Falta META_TOKEN. Veja o cabeçalho deste arquivo para gerar um.');
  process.exit(1);
}

const api = async (caminho, opcoes = {}) => {
  const endereco = `https://graph.facebook.com/${VERSAO}/${caminho}`;
  const resposta = await fetch(endereco, opcoes);
  const corpo = await resposta.json();
  if (corpo.error) {
    // A mensagem da Graph API já explica o que falta (permissão, id errado, token expirado)
    throw new Error(`${corpo.error.message} (código ${corpo.error.code})`);
  }
  return corpo;
};

const comToken = (params) => new URLSearchParams({ ...params, access_token: TOKEN });

async function listarCatalogos() {
  const negocios = await api(`me/businesses?${comToken({ fields: 'id,name' })}`);
  if (!negocios.data?.length) {
    console.log('Nenhum negócio nesse token. Confirme que o usuário do sistema é admin do negócio.');
    return;
  }
  for (const negocio of negocios.data) {
    const catalogos = await api(`${negocio.id}/owned_product_catalogs?${comToken({ fields: 'id,name,product_count' })}`);
    console.log(`\n${negocio.name} (negócio ${negocio.id})`);
    if (!catalogos.data?.length) {
      console.log('  nenhum catálogo — crie um no Commerce Manager primeiro');
      continue;
    }
    for (const c of catalogos.data) {
      console.log(`  ${c.id}  ${c.name} — ${c.product_count ?? 0} produto(s)`);
    }
  }
  console.log('\nRode de novo com META_CATALOG_ID=<id> para cadastrar o feed.');
}

async function cadastrarFeed() {
  const existentes = await api(`${CATALOGO}/product_feeds?${comToken({ fields: 'id,name,schedule' })}`);
  const jaCadastrado = (existentes.data || []).find(f => f.schedule?.url === FEED);

  if (jaCadastrado) {
    console.log(`Feed já cadastrado (id ${jaCadastrado.id}). Pedindo uma nova busca agora.`);
    await api(`${jaCadastrado.id}/uploads`, { method: 'POST', body: comToken({ url: FEED }) });
    console.log('Busca solicitada. O Commerce Manager mostra o resultado em alguns minutos.');
    return;
  }

  const criado = await api(`${CATALOGO}/product_feeds`, {
    method: 'POST',
    body: comToken({
      name: NOME_DO_FEED,
      'schedule[interval]': 'DAILY',
      'schedule[url]': FEED,
      'schedule[hour]': '6'
    })
  });
  console.log(`Feed criado: ${criado.id}`);
  console.log(`URL agendada: ${FEED} (diária, 6h)`);
  console.log(`Confira em: https://business.facebook.com/commerce/catalogs/${CATALOGO}/data_sources`);
}

console.log(`Site: ${SITE}`);
try {
  await (CATALOGO ? cadastrarFeed() : listarCatalogos());
} catch (erro) {
  console.error(`\nFalhou: ${erro.message}`);
  process.exit(1);
}
