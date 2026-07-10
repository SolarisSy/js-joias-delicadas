/* ===========================
   JS JOIAS DELICADAS — Script
   =========================== */

'use strict';

// ===== CART STATE =====
let cart = JSON.parse(localStorage.getItem('js_joias_cart') || '[]');

function saveCart() {
  localStorage.setItem('js_joias_cart', JSON.stringify(cart));
}

// ===== NAVBAR SCROLL =====
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

// ===== ANNOUNCEMENT BAR =====
(function initAnnouncement() {
  const bar = document.getElementById('announcementBar');
  const closeBtn = document.getElementById('closeAnnouncement');
  if (!bar || !closeBtn) return;
  closeBtn.addEventListener('click', () => {
    bar.style.height = bar.offsetHeight + 'px';
    requestAnimationFrame(() => {
      bar.style.transition = 'height 0.35s ease, opacity 0.35s ease';
      bar.style.height = '0';
      bar.style.opacity = '0';
      bar.style.overflow = 'hidden';
    });
  });
})();

// ===== HAMBURGER MENU =====
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileClose = document.getElementById('mobileClose');
  if (!hamburger) return;

  function openMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);

  // Close on mobile link click
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
})();

// ===== SEARCH OVERLAY =====
(function initSearch() {
  const searchBtn = document.getElementById('searchBtn');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');
  if (!searchBtn) return;

  searchBtn.addEventListener('click', () => {
    searchOverlay.classList.toggle('active');
    if (searchOverlay.classList.contains('active')) {
      setTimeout(() => searchInput && searchInput.focus(), 100);
    }
  });
  if (searchClose) searchClose.addEventListener('click', () => searchOverlay.classList.remove('active'));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') searchOverlay.classList.remove('active');
  });
})();

// ===== PRODUCT DATA =====
// Catálogo classificado a partir das fotos reais em imagens/.
// imageAlt = segundo ângulo da mesma peça, exibido no hover.
const products = [
  { id: '1', name: 'Brinco Madrepérola Cravejado', tag: 'Brincos · Ouro 18k', categories: 'ouro perola', image: 'imagens/joia-01.png', price: 89.90, oldPrice: 110.00, details: ['Antialérgico', 'Ouro 18k'], badge: 'Mais Vendido', desc: 'Um clássico repaginado: madrepérola facetada em moldura de zircônias cravejadas à mão, com banho de ouro 18k. Brilho suave que acompanha do dia ao evento.' },
  { id: '2', name: 'Brinco Nó de Prata', tag: 'Brincos · Ródio Branco', categories: 'prata', image: 'imagens/joia-02.png', price: 79.90, details: ['Antialérgico', 'Ródio Branco'], desc: 'Design escultural em formato de nó, com banho de ródio branco e acabamento espelhado. Uma peça statement para quem ama prata.' },
  { id: '3', name: 'Brinco Coração Zircônia & Pérola', tag: 'Brincos · Prata', categories: 'prata perola', image: 'imagens/joia-03.png', imageAlt: 'imagens/joia-06.png', price: 99.90, details: ['Antialérgico', 'Ródio Branco'], badge: 'Novidade', desc: 'Coração de zircônia lapidada com pérola em formato de coração pendente. Romântico, delicado e cheio de movimento.' },
  { id: '4', name: 'Argola Máxi Dourada', tag: 'Brincos · Ouro 18k', categories: 'ouro', image: 'imagens/joia-07.png', price: 69.90, details: ['Antialérgico', 'Ouro 18k'], desc: 'A argola máxi que não pode faltar: leve, fina e com fecho seguro. Banho de ouro 18k de alta durabilidade.' },
  { id: '5', name: 'Anel Halo Rosa Pink', tag: 'Anéis · Ródio Branco', categories: 'prata', image: 'imagens/joia-08.png', price: 109.90, details: ['Antialérgico', 'Ródio Branco'], desc: 'Zircônia rosa pink cercada por um halo cravejado. Banho de ródio branco antialérgico com brilho intenso.' },
  { id: '6', name: 'Anel Solitário Dourado', tag: 'Anéis · Ouro 18k', categories: 'ouro', image: 'imagens/joia-09.png', imageAlt: 'imagens/joia-10.png', price: 99.90, details: ['Antialérgico', 'Ouro 18k'], desc: 'Solitário atemporal com zircônia redonda em lapidação brilhante e aro texturizado. Perfeito para usar sozinho ou em composições.' },
  { id: '7', name: 'Brinco Quadrado Cravejado', tag: 'Brincos · Ouro 18k', categories: 'ouro', image: 'imagens/joia-11.png', price: 84.90, details: ['Antialérgico', 'Ouro 18k'], desc: 'Quadradinho cravejado com micro zircônias, discreto e luminoso. O ponto de luz perfeito para o dia a dia.' },
  { id: '8', name: 'Brinco Pedra Verde Facetada', tag: 'Brincos · Ouro 18k', categories: 'ouro', image: 'imagens/joia-12.png', price: 79.90, details: ['Antialérgico', 'Ouro 18k'], desc: 'Pedra verde facetada em tom opalescente com moldura dourada. Cor e sofisticação em uma peça só.' },
  { id: '9', name: 'Brinco Esmeralda Delicado', tag: 'Brincos · Ouro 18k', categories: 'ouro', image: 'imagens/joia-13.png', imageAlt: 'imagens/joia-14.png', price: 89.90, details: ['Antialérgico', 'Ouro 18k'], desc: 'Mini marquise de zircônia esmeralda com detalhe em ponto de luz. Delicadeza para quem ama joias minimalistas.' },
  { id: '10', name: 'Kit 3 Argolinhas Cravejadas', tag: 'Brincos · Ouro 18k', categories: 'ouro', image: 'imagens/joia-17.png', imageAlt: 'imagens/joia-15.png', price: 129.90, details: ['Antialérgico', 'Ouro 18k'], badge: 'Favorita', desc: 'Trio de argolinhas huggie cravejadas em micro zircônias. Use juntas ou separadas — combinam com tudo.' },
  { id: '11', name: 'Colar Corrente Bolinhas', tag: 'Colares · Ouro 18k', categories: 'ouro', image: 'imagens/joia-19.png', price: 119.90, details: ['Antialérgico', 'Ouro 18k'], desc: 'Corrente bolinha com berloques ovais diamantados. Movimento e brilho a cada passo.' },
  { id: '12', name: 'Pulseira Borboletas de Pérola', tag: 'Pulseiras · Ouro 18k', categories: 'ouro perola', image: 'imagens/joia-20.png', price: 95.90, details: ['Antialérgico', 'Ouro 18k'], desc: 'Borboletas de madrepérola sobre corrente dourada com esferas facetadas. Feminina e cheia de significado.' },
  { id: '13', name: 'Pulseira Corações Dourados', tag: 'Pulseiras · Ouro 18k', categories: 'ouro', image: 'imagens/joia-21.png', price: 89.90, oldPrice: 105.00, details: ['Antialérgico', 'Ouro 18k'], desc: 'Corações lisos em acabamento acetinado sobre corrente cartier. Um mimo delicado para o pulso.' },
  { id: '14', name: 'Colar Elos de Coração', tag: 'Colares · Ródio Branco', categories: 'prata', image: 'imagens/joia-22.png', price: 129.90, details: ['Antialérgico', 'Ródio Branco'], desc: 'Elos entrelaçados com corações em alto relevo e banho de ródio branco. Presença e delicadeza no mesmo colar.' },
  { id: '15', name: 'Colar Pérolas Barrocas', tag: 'Colares · Prata', categories: 'prata perola', image: 'imagens/joia-23.png', price: 139.90, details: ['Antialérgico', 'Ródio Branco'], desc: 'Pérolas barrocas e esferas de prata alternadas em corrente delicada. Elegância orgânica, peça única.' },
  { id: '16', name: 'Colar Berloques de Prata', tag: 'Colares · Ródio Branco', categories: 'prata', image: 'imagens/joia-24.png', price: 109.90, details: ['Antialérgico', 'Ródio Branco'], desc: 'Corrente dupla com berloques ovais espelhados. Minimalista, moderna e fácil de amar.' }
];

// Deriva o tipo da peça a partir da tag ("Brincos · Ouro 18k" → "brincos")
function productType(product) {
  return product.tag.split('·')[0].trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function renderProducts() {
  const container = document.getElementById('productsGrid');
  if (!container) return;

  container.innerHTML = products.map((product, index) => {
    const hasOldPrice = product.oldPrice && product.oldPrice > product.price;
    const badgeHtml = product.badge ? `<div class="product-badge">${product.badge}</div>` : '';
    const detailsHtml = product.details.map(detail => `<span>${detail}</span>`).join('<span>•</span>');

    return `
      <article class="product-card" data-category="${product.categories} ${productType(product)}" id="prod-${product.id}">
        <div class="product-img-wrap">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          ${product.imageAlt ? `<img src="${product.imageAlt}" alt="" class="img-alt" loading="lazy" aria-hidden="true">` : ''}
          ${badgeHtml}
          <button class="wishlist-btn" aria-label="Favoritar">♡</button>
          <div class="product-quick-actions">
            <button class="quick-add-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price.toFixed(2)}">Adicionar à Sacola</button>
          </div>
        </div>
        <div class="product-info">
          <p class="product-tag">${product.tag}</p>
          <h3 class="product-name"><a href="produto.html?id=${product.id}">${product.name}</a></h3>
          <div class="product-price">${hasOldPrice ? `<span class="price-old">R$ ${product.oldPrice.toFixed(2).replace('.', ',')}</span>` : ''}<span class="price-current">R$ ${product.price.toFixed(2).replace('.', ',')}</span></div>
          <div class="product-details">${detailsHtml}</div>
        </div>
      </article>`;
  }).join('');
}

// ===== FILTER TABS =====
function applyFilter(filter) {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(t => {
    const active = t.dataset.filter === filter;
    t.classList.toggle('active', active);
    t.setAttribute('aria-selected', String(active));
  });

  document.querySelectorAll('.product-card').forEach((card, i) => {
    const categories = card.dataset.category || '';
    const show = filter === 'todos' || categories.includes(filter);
    card.classList.remove('hidden', 'fade-in');
    if (!show) {
      card.classList.add('hidden');
    } else {
      void card.offsetWidth; // reflow
      card.classList.add('fade-in');
      card.style.animationDelay = `${(i % 6) * 0.06}s`;
    }
  });
}

(function initFilterTabs() {
  renderProducts();
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => applyFilter(tab.dataset.filter));
  });
})();

// ===== CART LOGIC =====
function updateCartUI() {
  const countEl = document.getElementById('cartCount');
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  if (countEl) {
    countEl.textContent = totalCount;
    countEl.classList.toggle('visible', totalCount > 0);
  }
  renderCartItems();
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  const footer = document.getElementById('cartFooter');
  const totalEl = document.getElementById('cartTotal');
  if (!container) return;

  // Remove existing cart items (keep empty element)
  const existing = container.querySelectorAll('.cart-item');
  existing.forEach(el => el.remove());

  if (cart.length === 0) {
    if (emptyEl) emptyEl.style.display = 'flex';
    if (footer) footer.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (footer) footer.style.display = 'block';

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <a href="produto.html?id=${item.id}" class="cart-item-img" aria-label="Ver ${item.name}">
        <img src="${item.image || 'img/product_brincos.png'}" alt="${item.name}" loading="lazy">
      </a>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')} × ${item.qty}</div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}" aria-label="Remover ${item.name}">×</button>
    `;
    container.appendChild(el);
  });

  if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

  // Update checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    const itemsList = cart.map(i => `${i.qty}x ${i.name} (R$ ${i.price.toFixed(2).replace('.', ',')})`).join('%0A');
    const totalStr = total.toFixed(2).replace('.', ',');
    checkoutBtn.href = `https://wa.me/5541989043923?text=Ol%C3%A1!%20Gostaria%20de%20finalizar%20meu%20pedido%3A%0A${itemsList}%0A%0ATotal%3A%20R%24%20${totalStr}%20%F0%9F%92%9B`;
  }

  // Remove buttons
  container.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      cart = cart.filter(item => item.id !== id);
      saveCart();
      updateCartUI();
      showToast('Peça removida da sacola');
    });
  });
}

function addToCart(id, name, price) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    const product = products.find(p => p.id === id);
    cart.push({
      id,
      name,
      price: parseFloat(price),
      qty: 1,
      image: product ? product.image : 'img/product_brincos.png'
    });
  }
  saveCart();
  updateCartUI();
  openCart();
  showToast(`✦ "${name}" adicionado à sacola!`);
}

// ===== CART SIDEBAR =====
function openCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar) sidebar.classList.add('open');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

(function initCart() {
  const cartBtn = document.getElementById('cartBtn');
  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Quick add buttons
  document.querySelectorAll('.quick-add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      addToCart(btn.dataset.id, btn.dataset.name, btn.dataset.price);
    });
  });

  // Wishlist buttons
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      btn.classList.toggle('active');
      btn.textContent = btn.classList.contains('active') ? '♥' : '♡';
      showToast(btn.classList.contains('active') ? 'Adicionado aos favoritos ♥' : 'Removido dos favoritos');
    });
  });

  // Card click → página de detalhes
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = 'produto.html?id=' + card.id.replace('prod-', '');
    });
  });

  updateCartUI();
})();

// ===== TOAST NOTIFICATION =====
let toastTimeout;
function showToast(message) {
  let toast = document.getElementById('jsToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'jsToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #2c211c;
      color: #e2c89a;
      padding: 14px 24px;
      border-radius: 2px;
      font-family: 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.5px;
      z-index: 9999;
      opacity: 0;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 30px rgba(44,33,28,0.25);
      white-space: nowrap;
      max-width: 90vw;
      text-align: center;
    `;
    document.body.appendChild(toast);
  }

  clearTimeout(toastTimeout);
  toast.textContent = message;
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 3000);
}

// ===== CATEGORY CARD FILTER LINKS =====
(function initCatFilters() {
  document.querySelectorAll('.cat-card[data-filter]').forEach(card => {
    card.addEventListener('click', e => {
      const filter = card.dataset.filter;
      if (filter && filter !== 'noivas') {
        e.preventDefault();
        applyFilter(filter);
        setTimeout(() => {
          const section = document.getElementById('produtos');
          if (section) section.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    });
  });
})();

// ===== SCROLL REVEAL ANIMATIONS =====
(function initScrollReveal() {
  const reveals = ['#colecoes', '#produtos', '#sobre', '#noivas', '#fidelidade', '#garantia', '#instagram',
    '.loyalty-card', '.guarantee-item', '.product-card', '.cat-card', '.story-stats'];

  // Add data-reveal to targeted elements
  document.querySelectorAll('.loyalty-card, .guarantee-item, .cat-card').forEach(el => {
    el.setAttribute('data-reveal', '');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
})();

// ===== SMOOTH ANCHOR SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const navH = document.getElementById('navbar')?.offsetHeight || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== HERO IMAGE PARALLAX =====
(function initParallax() {
  const heroImg = document.getElementById('heroImg');
  if (!heroImg) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroImg.style.transform = `scale(1.04) translateY(${scrolled * 0.25}px)`;
    }
  }, { passive: true });
})();

// ===== PRODUCT CARD HOVER - NUMBER COUNTER FOR STATS =====
(function initCounters() {
  const stats = document.querySelectorAll('.stat-num');
  if (!stats.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const text = el.textContent;
      const num = parseInt(text.replace(/\D/g, ''));
      if (!num) return;

      const prefix = text.includes('+') ? '+' : '';
      const suffix = text.includes('%') ? '%' : (text.includes(' Ano') ? ' Ano' : '');
      let start = 0;
      const duration = 1500;
      const step = num / (duration / 16);

      const update = () => {
        start = Math.min(start + step, num);
        el.textContent = prefix + Math.floor(start) + suffix;
        if (start < num) requestAnimationFrame(update);
        else el.textContent = text;
      };
      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(el => observer.observe(el));
})();

// ===== LIGHTBOX GLOBAL =====
const lightboxEl = document.createElement('div');
lightboxEl.className = 'pdp-lightbox';
lightboxEl.innerHTML = '<button class="lightbox-close" aria-label="Fechar">×</button><img alt="Imagem ampliada">';
document.body.appendChild(lightboxEl);
lightboxEl.addEventListener('click', () => lightboxEl.classList.remove('open'));
document.addEventListener('keydown', e => { if (e.key === 'Escape') lightboxEl.classList.remove('open'); });

function openLightbox(src) {
  lightboxEl.querySelector('img').src = src;
  lightboxEl.classList.add('open');
}

// Imagens de seção ampliáveis ao clique (página inicial)
document.querySelectorAll('.story-img, .noivas-image img').forEach(img => {
  img.classList.add('zoomable');
  img.addEventListener('click', e => {
    e.stopPropagation();
    openLightbox(img.src);
  });
});

console.log('✦ JS Joias Delicadas — Site carregado com sucesso!');
