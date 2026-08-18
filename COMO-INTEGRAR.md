# Como integrar a loja nos canais gratuitos

Nenhum canal desta página cobra mensalidade. O que o deploy já entrega pronto:

| Arquivo | Gerado por | Serve |
|---|---|---|
| `feed.xml` | `tools/gerar-feed.mjs` | Meta, Google Merchant, Pinterest |
| `catalogo.csv` | `tools/gerar-planilha.mjs` | WhatsApp Business, OLX, Shopee |
| `sitemap.xml` + `robots.txt` | `tools/gerar-sitemap.mjs` | Google Search |

## O que roda hoje, sem domínio próprio

| Canal | Sem domínio | Observação |
|---|---|---|
| Catálogo do WhatsApp | ✅ completo | nunca pede domínio |
| OLX | ✅ completo | 20 anúncios grátis/mês, manuais |
| Catálogo da Meta | ✅ feed + anúncios | a sacolinha do Instagram fica de fora |
| Google Merchant | ⚠️ testável | reivindicar por prefixo de URL no Search Console |
| Pinterest | ⚠️ testável | reivindicação de `github.io` pode ser recusada |
| Google Search | ✅ com sitemap enviado à mão | `robots.txt` em subpasta é ignorado |

URLs públicas (trocar o endereço quando o domínio próprio entrar):

- Feed: <https://solarissy.github.io/js-joias-delicadas/feed.xml>
- Planilha: <https://solarissy.github.io/js-joias-delicadas/catalogo.csv>
- Sitemap: <https://solarissy.github.io/js-joias-delicadas/sitemap.xml>

---

## 1. Catálogo do WhatsApp Business — R$ 0, hoje

App do WhatsApp Business → **Ferramentas comerciais → Catálogo → Adicionar item**.
Não existe importação de arquivo: é foto + nome + preço à mão. Use o `catalogo.csv`
aberto no celular para copiar nome, preço e descrição sem digitar.

Comece pelas 20 peças mais vendidas — catálogo gigante atrapalha mais do que ajuda no chat.

## 2. OLX — R$ 0, hoje

20 anúncios grátis por mês na categoria **Bijuterias, relógios e acessórios**, renovados
todo mês. Não existe integração automática: joias e moda ficam de fora dos integradores
da OLX (só imóveis, autos, peças e agro). É postagem manual.

Regra prática: anunciar as peças de maior giro, com o link do site na descrição, e
fechar a venda no WhatsApp. A OLX não cobra comissão.

## 3. Meta (Instagram + Facebook) — R$ 0

Commerce Manager → **Catálogo → Fontes de dados → Feed de dados → Agendar busca por URL**,
apontando para o `feed.xml`. Frequência diária.

- Perfil precisa ser Conta Comercial ligada a uma Página do Facebook.
- No Brasil não há checkout dentro do app: o clique leva ao site, que leva ao WhatsApp.
- A sacolinha exige **verificação de domínio** — ver a nota do domínio no fim.
- Sem domínio o catálogo ainda funciona: entra em anúncios dinâmicos e no
  remarketing do Pixel, que já está instalado nas duas páginas.

## 4. Google Merchant Center — R$ 0 (listagens gratuitas)

Merchant Center → **Produtos → Feeds → Adicionar feed → Busca agendada**, mesma URL do `feed.xml`.

Exige verificar e reivindicar o site (Search Console) e ter no site: política de trocas,
prazo de entrega e forma de contato — todos já existem no rodapé.

Sem domínio próprio, verifique no Search Console como **prefixo de URL**
(`https://solarissy.github.io/js-joias-delicadas/`), pela meta tag do `index.html`, e
envie o `sitemap.xml` na mesma tela. Domínio inteiro (`Domain property`) não dá: exige
DNS, que é do GitHub.

O feed já sai com `identifier_exists=no`, obrigatório para joia sem código de barras.

## 5. Pinterest — R$ 0

Pinterest Business → **Anúncios → Catálogos → Adicionar feed de dados**, mesma URL,
formato RSS/XML. Exige reivindicar o site pela meta tag `p:domain_verify`.

Se a reivindicação do `github.io` for recusada, o plano B custa R$ 0: pinar as peças à
mão com o link do produto. As páginas já publicam Open Graph e JSON-LD (`produto.js`),
então o pin sai com foto, nome e preço mesmo sem catálogo ligado.

---

## Verificação de domínio

O `index.html` já tem as três meta tags comentadas no `<head>`, prontas para receber o
código de cada canal:

```html
<meta name="google-site-verification" content="...">
<meta name="facebook-domain-verification" content="...">
<meta name="p:domain_verify" content="...">
```

**Atenção:** `github.io` está na Public Suffix List — vale como TLD, não como domínio
próprio. Google e Meta tendem a recusar a verificação enquanto o site estiver nesse
endereço. Com domínio próprio apontado para o GitHub Pages (arquivo `CNAME`), os três
canais liberam. Depois de trocar, rode o deploy com `SITE_URL=https://seudominio.com.br/`
para o feed e a planilha saírem com o endereço novo.

---

# Rotina de postagem

Todo texto já vem pronto em `posts.md` — um bloco por peça, com título de OLX,
legenda de Instagram, pin de Pinterest e mensagem de WhatsApp. Nenhum canal orgânico
tem API gratuita de publicação: postar é copiar, colar e enviar a foto.

| Canal | Frequência | O que postar | Tempo/dia |
|---|---|---|---|
| Instagram | 3–5 Reels/semana + 2–3 feed + stories diário | Reels de peça na mão/no corpo; carrossel de 3 peças da mesma seção | 20 min |
| Pinterest | 1 pin/dia | foto vertical, salva **primeiro** na pasta da seção | 5 min |
| OLX | 20 anúncios/mês | as peças de maior giro, renovadas ao expirar | 10 min/semana |
| WhatsApp | status 1×/dia | peça do dia + link do catálogo | 3 min |
| Meta catálogo | automático | o feed atualiza sozinho a cada deploy | 0 |

## Instagram

- **Reels puxa 3 a 5× mais alcance** que foto parada — a peça girando na luz, o fecho
  abrindo, a mão vestindo. 7 a 15 segundos bastam.
- Vídeo com marca d'água de outro app é rebaixado. Grave no próprio Instagram ou
  exporte limpo.
- Carrossel converte melhor que post único quando ensina algo: "3 anéis que combinam
  com qualquer look", "como não escurecer sua semi-joia".
- Os primeiros minutos decidem o alcance: publique no horário em que suas clientes
  estão online e responda todo comentário na primeira hora.
- Link fica na bio; a legenda manda para o direct. Link externo na legenda derruba entrega.

## Pinterest

- Pin vertical (2:3, ex. 1000×1500). Foto quadrada rende bem menos.
- **Salve o pin na pasta certa antes de qualquer coisa** — a primeira pasta é o que o
  Pinterest usa para classificar. Crie uma pasta por seção: Anéis, Brincos, Colares,
  Pulseiras, Conjuntos.
- Título e descrição vêm de `posts.md`, já escritos com as palavras que a cliente busca
  ("anel banhado a ouro 18k", "colar delicado").
- Um pin por dia, todo dia, vale mais que trinta num sábado.
- Pinterest é o canal de resultado mais lento e mais duradouro: um pin bom traz visita
  por meses.

## OLX

- 20 inserções gratuitas por mês na categoria **Bijuterias, relógios e acessórios**,
  renovadas todo mês.
- Anúncio vive 30 dias. Depois fica 180 dias na aba **Expirados**, de onde dá para
  renovar sem refazer — o chat e as fotos voltam junto.
- Rotacione: 20 peças este mês, outras 20 no mês seguinte. Repetir a mesma peça sem
  parar não rende.
- Título é busca, não poesia — o de `posts.md` já vem com peça + acabamento + benefício.
- Preço redondo e frete combinado no chat fecham mais rápido. A OLX não cobra comissão.

## WhatsApp

- Catálogo montado uma vez com as 20 peças de maior giro; o resto vive no site.
- Status diário com uma peça e o link. É o canal com maior taxa de leitura que você tem.
- A lista de transmissão só entrega para quem tem seu número salvo — peça para salvarem.

## Semana modelo

| Dia | Tarefa |
|---|---|
| Segunda | 1 Reels + 1 pin + renovar OLX expirados |
| Terça | 1 pin + stories da peça do dia |
| Quarta | 1 Reels + carrossel no feed + 1 pin |
| Quinta | 1 pin + status no WhatsApp |
| Sexta | 1 Reels + 1 pin + 5 anúncios novos na OLX |
| Sábado | 1 pin + stories de bastidor (embalagem, envio) |
| Domingo | 1 pin agendado |
