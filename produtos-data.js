/* ===========================
   JS JOIAS DELICADAS — Catálogo
   Compartilhado entre index.html e produto.html
   =========================== */

'use strict';

// Catálogo classificado a partir das fotos reais em imagens/.
// imageAlt = segundo ângulo da mesma peça (hover no card / galeria na página do produto).
const products = [
  { id: '1', name: 'Brinco Madrepérola Cravejado', tag: 'Brincos · Ouro 18k', categories: 'ouro perola', image: 'imagens/joia-01.png', price: 89.90, oldPrice: 110.00, details: ['Antialérgico', 'Ouro 18k'], badge: 'Mais Vendido',
    description: 'Brinco quadrado em madrepérola facetada com contorno cravejado em zircônias, banho de ouro 18k. Uma peça clássica que ilumina o rosto e combina do trabalho à festa.' },
  { id: '2', name: 'Brinco Nó de Prata', tag: 'Brincos · Ródio Branco', categories: 'prata', image: 'imagens/joia-02.png', price: 79.90, details: ['Antialérgico', 'Ródio Branco'],
    description: 'Brinco em formato de nó entrelaçado com acabamento espelhado em ródio branco. Volume na medida certa para um visual moderno e sofisticado.' },
  { id: '3', name: 'Brinco Coração Zircônia & Pérola', tag: 'Brincos · Prata', categories: 'prata perola', image: 'imagens/joia-03.png', imageAlt: 'imagens/joia-06.png', price: 99.90, details: ['Antialérgico', 'Ródio Branco'], badge: 'Novidade',
    description: 'Coração de zircônia cristal com pérola em formato de coração pendurada. Delicado e romântico — perfeito para presentear quem você ama.' },
  { id: '4', name: 'Argola Máxi Dourada', tag: 'Brincos · Ouro 18k', categories: 'ouro', image: 'imagens/joia-07.png', price: 69.90, details: ['Antialérgico', 'Ouro 18k'],
    description: 'Argola grande e levíssima com banho de ouro 18k. O básico que nunca sai de moda e valoriza qualquer produção.' },
  { id: '5', name: 'Anel Halo Rosa Pink', tag: 'Anéis · Ródio Branco', categories: 'prata', image: 'imagens/joia-08.png', price: 109.90, details: ['Antialérgico', 'Ródio Branco'],
    description: 'Anel com pedra central rosa pink cercada por halo de zircônias no mesmo tom, aro trabalhado em ródio. Uma joia de presença para momentos especiais.' },
  { id: '6', name: 'Anel Solitário Dourado', tag: 'Anéis · Ouro 18k', categories: 'ouro', image: 'imagens/joia-09.png', imageAlt: 'imagens/joia-10.png', price: 99.90, details: ['Antialérgico', 'Ouro 18k'],
    description: 'Solitário clássico com zircônia cristal em lapidação redonda e aro texturizado com banho de ouro 18k. Elegância atemporal para o dia a dia ou para marcar uma ocasião.' },
  { id: '7', name: 'Brinco Quadrado Cravejado', tag: 'Brincos · Ouro 18k', categories: 'ouro', image: 'imagens/joia-11.png', price: 84.90, details: ['Antialérgico', 'Ouro 18k'],
    description: 'Brinco quadrado totalmente cravejado em zircônias com banho de ouro 18k. Pequeno no tamanho, gigante no brilho.' },
  { id: '8', name: 'Brinco Pedra Verde Facetada', tag: 'Brincos · Ouro 18k', categories: 'ouro', image: 'imagens/joia-12.png', price: 79.90, details: ['Antialérgico', 'Ouro 18k'],
    description: 'Brinco redondo com pedra verde facetada que reflete tons dourados, borda em banho de ouro 18k. Um toque de cor cheio de personalidade.' },
  { id: '9', name: 'Brinco Esmeralda Delicado', tag: 'Brincos · Ouro 18k', categories: 'ouro', image: 'imagens/joia-13.png', imageAlt: 'imagens/joia-14.png', price: 89.90, details: ['Antialérgico', 'Ouro 18k'],
    description: 'Brinco mini com pedra verde esmeralda em lapidação navete e ponto de luz, banho de ouro 18k. Discreto, delicado e perfeito para compor com outras peças.' },
  { id: '10', name: 'Kit 3 Argolinhas Cravejadas', tag: 'Brincos · Ouro 18k', categories: 'ouro', image: 'imagens/joia-17.png', imageAlt: 'imagens/joia-15.png', price: 129.90, details: ['Antialérgico', 'Ouro 18k'], badge: 'Favorita',
    description: 'Kit com 3 pares de argolinhas click cravejadas em zircônias, banho de ouro 18k. Ideais para quem tem mais de um furinho — use juntas ou separadas.' },
  { id: '11', name: 'Colar Corrente Bolinhas', tag: 'Colares · Ouro 18k', categories: 'ouro', image: 'imagens/joia-19.png', price: 119.90, details: ['Antialérgico', 'Ouro 18k'],
    description: 'Colar de corrente bolinha com berloques ovais diamantados, banho de ouro 18k. Leve, moderno e fácil de combinar em composições de colares.' },
  { id: '12', name: 'Pulseira Borboletas de Pérola', tag: 'Pulseiras · Ouro 18k', categories: 'ouro perola', image: 'imagens/joia-20.png', price: 95.90, details: ['Antialérgico', 'Ouro 18k'],
    description: 'Pulseira com borboletas de madrepérola intercaladas por esferas douradas, banho de ouro 18k. Feminina e delicada, do jeitinho JS.' },
  { id: '13', name: 'Pulseira Corações Dourados', tag: 'Pulseiras · Ouro 18k', categories: 'ouro', image: 'imagens/joia-21.png', price: 89.90, oldPrice: 105.00, details: ['Antialérgico', 'Ouro 18k'],
    description: 'Pulseira de elos cartier com corações acetinados, banho de ouro 18k. Um clássico romântico para usar todos os dias.' },
  { id: '14', name: 'Colar Elos de Coração', tag: 'Colares · Ródio Branco', categories: 'prata', image: 'imagens/joia-22.png', price: 129.90, details: ['Antialérgico', 'Ródio Branco'],
    description: 'Colar de elos ovais com corações encaixados, acabamento em ródio branco. Estilo choker moderno com atitude e delicadeza.' },
  { id: '15', name: 'Colar Pérolas Barrocas', tag: 'Colares · Prata', categories: 'prata perola', image: 'imagens/joia-23.png', price: 139.90, details: ['Antialérgico', 'Ródio Branco'],
    description: 'Colar com pérolas barrocas e esferas acetinadas intercaladas em corrente ródio. Peça statement com o charme irregular das pérolas.' },
  { id: '16', name: 'Colar Berloques de Prata', tag: 'Colares · Ródio Branco', categories: 'prata', image: 'imagens/joia-24.png', price: 109.90, details: ['Antialérgico', 'Ródio Branco'],
    description: 'Colar de corrente cadeado com berloques ovais polidos, acabamento em ródio branco. Minimalista e versátil para qualquer look.' }
];

// Deriva o tipo da peça a partir da tag ("Brincos · Ouro 18k" → "brincos")
function productType(product) {
  return product.tag.split('·')[0].trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const WHATSAPP_NUMBER = '5541989043923';

function formatPrice(value) {
  return 'R$ ' + value.toFixed(2).replace('.', ',');
}
