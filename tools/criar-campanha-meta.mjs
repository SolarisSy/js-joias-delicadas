#!/usr/bin/env node
/* ===========================================================
   CAMPANHA DE MENSAGENS NO WHATSAPP — pela Marketing API

   Monta, já pausada, a campanha que leva do Facebook/Instagram
   direto para a conversa no WhatsApp: campanha, conjunto (com
   público e orçamento), imagem, criativo e anúncio. Nada entra
   no ar sozinho — tudo nasce PAUSED e só roda quando você
   revisar e ativar no Gerenciador de Anúncios.

   Por que Mensagens e não Tráfego: o site não fecha a venda,
   ele empurra para o WhatsApp. Pagar pelo clique no site é
   pagar por uma etapa a mais no caminho.

   Antes de rodar, pegue um token:
     1. business.facebook.com → Configurações do negócio
     2. Usuários → Usuários do sistema → Adicionar (função Admin)
     3. Gerar novo token → marque ads_management e pages_read_engagement
     4. Atribua a Página e a conta de anúncios a esse usuário

   Uso:
     META_TOKEN=EAA... node tools/criar-campanha-meta.mjs
       → lista contas de anúncio e Páginas, com os ids

     META_TOKEN=EAA... META_AD_ACCOUNT_ID=act_123 META_PAGE_ID=456 \
       node tools/criar-campanha-meta.mjs
       → cria a campanha pausada, com R$ 20/dia

   Ajustes por variável de ambiente:
     META_DAILY_BRL=20        orçamento diário em reais
     META_CIDADE=Curitiba     cidade do público (padrão: Curitiba)
     META_RAIO_KM=30          raio ao redor da cidade
     META_ARTE=artes/post-brinco-madreperola.png   imagem do anúncio
     META_WHATSAPP=5541989043923

   O token vale só nesta execução: nada é gravado no repositório.
   =========================================================== */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, SITE } from './ler-catalogo.mjs';
import { ANUNCIO_PAGO } from './textos-anuncio.mjs';

const TOKEN = process.env.META_TOKEN;
const CONTA = process.env.META_AD_ACCOUNT_ID;   // act_<id>
const PAGINA = process.env.META_PAGE_ID;
const VERSAO = process.env.GRAPH_VERSION || 'v23.0';

const DIARIO_BRL = Number(process.env.META_DAILY_BRL || 20);
const CIDADE = process.env.META_CIDADE || 'Curitiba';
const RAIO_KM = Number(process.env.META_RAIO_KM || 30);
const ARTE = process.env.META_ARTE || 'artes/post-brinco-madreperola.png';
const WHATSAPP = process.env.META_WHATSAPP || '5541989043923';

const NOME = 'JS Joias Delicadas — mensagens WhatsApp';

/* Interesses de semi-joia e presente. Ids da Meta, estáveis:
   públicos amplos vencem detalhamento fino em orçamento pequeno. */
const INTERESSES = [
  { id: '6003332349920', name: 'Jewellery' },
  { id: '6003244433650', name: 'Fashion accessories' },
  { id: '6002839660079', name: 'Gifts' }
];

const TEXTO_ANUNCIO = ANUNCIO_PAGO.texto;
const TITULO_ANUNCIO = ANUNCIO_PAGO.titulo;
const DESCRICAO_ANUNCIO = ANUNCIO_PAGO.descricao;

if (!TOKEN) {
  console.error('Falta META_TOKEN. Veja o cabeçalho deste arquivo para gerar um.');
  process.exit(1);
}

const api = async (caminho, opcoes = {}) => {
  const resposta = await fetch(`https://graph.facebook.com/${VERSAO}/${caminho}`, opcoes);
  const corpo = await resposta.json();
  if (corpo.error) throw new Error(`${corpo.error.message} (código ${corpo.error.code})`);
  return corpo;
};

const comToken = (params) => new URLSearchParams({ ...params, access_token: TOKEN });
const postar = (caminho, params) => api(caminho, { method: 'POST', body: comToken(params) });

async function listarAtivos() {
  const contas = await api(`me/adaccounts?${comToken({ fields: 'id,name,account_status,currency' })}`);
  console.log('\nContas de anúncio:');
  for (const c of contas.data || []) {
    const situacao = c.account_status === 1 ? 'ativa' : `status ${c.account_status}`;
    console.log(`  ${c.id}  ${c.name} — ${situacao}, ${c.currency}`);
  }
  if (!contas.data?.length) console.log('  nenhuma. Crie uma em business.facebook.com → Contas de anúncio.');

  const paginas = await api(`me/accounts?${comToken({ fields: 'id,name,verification_status' })}`);
  console.log('\nPáginas:');
  for (const p of paginas.data || []) console.log(`  ${p.id}  ${p.name}`);
  if (!paginas.data?.length) console.log('  nenhuma atribuída a esse token.');

  console.log('\nRode de novo com META_AD_ACCOUNT_ID=act_... META_PAGE_ID=... para criar a campanha.');
}

// A Meta precisa da cidade pelo id dela, não pelo nome
async function acharCidade() {
  const busca = await api(`search?${comToken({
    type: 'adgeolocation', location_types: '["city"]', country_code: 'BR', q: CIDADE, limit: '1'
  })}`);
  const cidade = busca.data?.[0];
  if (!cidade) throw new Error(`Cidade "${CIDADE}" não encontrada no direcionamento da Meta.`);
  return { key: cidade.key, radius: RAIO_KM, distance_unit: 'kilometer' };
}

async function enviarArte() {
  const caminho = join(RAIZ, ARTE);
  const arquivo = new Blob([readFileSync(caminho)]);
  const corpo = new FormData();
  corpo.append('access_token', TOKEN);
  corpo.append('filename', arquivo, ARTE.split('/').pop());
  const resposta = await api(`${CONTA}/adimages`, { method: 'POST', body: corpo });
  const imagem = Object.values(resposta.images || {})[0];
  if (!imagem?.hash) throw new Error('A Meta não devolveu o hash da imagem.');
  return imagem.hash;
}

async function criarCampanha() {
  const cidade = await acharCidade();

  const campanha = await postar(`${CONTA}/campaigns`, {
    name: NOME,
    objective: 'OUTCOME_ENGAGEMENT',      // objetivo de mensagens
    status: 'PAUSED',
    special_ad_categories: '[]'
  });
  console.log(`campanha  ${campanha.id}`);

  const conjunto = await postar(`${CONTA}/adsets`, {
    name: `${CIDADE} · mulheres 25-50 · ${RAIO_KM} km`,
    campaign_id: campanha.id,
    status: 'PAUSED',
    daily_budget: String(Math.round(DIARIO_BRL * 100)),  // em centavos
    billing_event: 'IMPRESSIONS',
    optimization_goal: 'CONVERSATIONS',
    destination_type: 'WHATSAPP',
    promoted_object: JSON.stringify({ page_id: PAGINA }),
    targeting: JSON.stringify({
      geo_locations: { custom_locations: [cidade] },
      age_min: 25,
      age_max: 50,
      genders: [2],                                       // 2 = mulheres
      flexible_spec: [{ interests: INTERESSES }],
      publisher_platforms: ['facebook', 'instagram'],
      targeting_automation: { advantage_audience: 1 }
    })
  });
  console.log(`conjunto  ${conjunto.id}`);

  const hash = await enviarArte();
  const criativo = await postar(`${CONTA}/adcreatives`, {
    name: `${NOME} — criativo`,
    object_story_spec: JSON.stringify({
      page_id: PAGINA,
      link_data: {
        message: TEXTO_ANUNCIO,
        name: TITULO_ANUNCIO,
        description: DESCRICAO_ANUNCIO,
        link: `https://wa.me/${WHATSAPP}`,
        image_hash: hash,
        call_to_action: { type: 'WHATSAPP_MESSAGE', value: { app_destination: 'WHATSAPP' } }
      }
    })
  });
  console.log(`criativo  ${criativo.id}`);

  const anuncio = await postar(`${CONTA}/ads`, {
    name: `${NOME} — anúncio 1`,
    adset_id: conjunto.id,
    creative: JSON.stringify({ creative_id: criativo.id }),
    status: 'PAUSED'
  });
  console.log(`anúncio   ${anuncio.id}`);

  console.log(`\nTudo criado PAUSADO, R$ ${DIARIO_BRL.toFixed(2)}/dia. Revise e ative em:`);
  console.log(`https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${CONTA.replace('act_', '')}`);
  console.log(`O anúncio abre a conversa em wa.me/${WHATSAPP} · catálogo em ${SITE}`);
}

const alvo = CONTA && PAGINA ? criarCampanha() : listarAtivos();
alvo.catch(erro => { console.error(erro.message); process.exit(1); });
