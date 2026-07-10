/* ===========================
   JS JOIAS DELICADAS — Painel de Controle
   =========================== */

'use strict';

(function initAdmin() {
  // Hash SHA-256 de "js-joias-<senha>" — a senha em si não aparece no código
  const PASS_HASH = '726dd2cd45f968e4da685859e324d766658232caab7e8df3b8b75f9086d4d2c9';
  const SESSION_KEY = 'js_joias_admin_session';
  const PREVIEW_KEY = 'js_joias_override_preview';
  const TOKEN_KEY = 'js_joias_gh_token';
  const REPO = 'SolarisSy/js-joias-delicadas';
  const OVERRIDE_PATH = 'data/produtos.js';

  const loginEl = document.getElementById('adminLogin');
  const panelEl = document.getElementById('adminPanel');
  const fmt = v => 'R$ ' + v.toFixed(2).replace('.', ',');

  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ===== LOGIN =====
  function showPanel() {
    loginEl.hidden = true;
    panelEl.hidden = false;
    renderPanel();
  }

  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const input = document.getElementById('loginPass');
    const hash = await sha256('js-joias-' + input.value.trim());
    if (hash === PASS_HASH) {
      sessionStorage.setItem(SESSION_KEY, hash);
      showPanel();
    } else {
      const card = document.getElementById('loginCard');
      document.getElementById('loginError').hidden = false;
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
      input.value = '';
      input.focus();
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.reload();
  });

  // ===== ESTADO DAS EDIÇÕES =====
  const published = (typeof PRODUCTS_OVERRIDE !== 'undefined' && PRODUCTS_OVERRIDE) || {};
  let preview = null;
  try { preview = JSON.parse(localStorage.getItem(PREVIEW_KEY) || 'null'); } catch (e) { /* ignora */ }
  // Estado inicial: prévia local, senão o publicado
  const edits = JSON.parse(JSON.stringify(preview || published || {}));

  function effective(p) {
    const o = edits[p.id] || {};
    return {
      name: (typeof o.name === 'string' && o.name.trim()) ? o.name : p.name,
      price: (typeof o.price === 'number' && o.price > 0) ? o.price : p.price,
      oldPrice: o.oldPrice === null ? undefined : (typeof o.oldPrice === 'number' ? o.oldPrice : p.oldPrice),
      badge: typeof o.badge === 'string' ? (o.badge.trim() || undefined) : p.badge,
      hidden: !!o.hidden
    };
  }

  function recomputeEdit(p, row) {
    const name = row.querySelector('[data-f="name"]').value.trim();
    const price = parseFloat(row.querySelector('[data-f="price"]').value.replace(',', '.'));
    const oldRaw = row.querySelector('[data-f="oldPrice"]').value.trim();
    const oldPrice = oldRaw === '' ? null : parseFloat(oldRaw.replace(',', '.'));
    const badge = row.querySelector('[data-f="badge"]').value.trim();
    const visible = row.querySelector('[data-f="visible"]').checked;

    const o = {};
    if (name && name !== p.name) o.name = name;
    if (!isNaN(price) && price > 0 && Math.abs(price - p.price) > 0.001) o.price = Math.round(price * 100) / 100;
    if (oldPrice === null) { if (p.oldPrice) o.oldPrice = null; }
    else if (!isNaN(oldPrice) && oldPrice > 0 && Math.abs(oldPrice - (p.oldPrice || 0)) > 0.001) o.oldPrice = Math.round(oldPrice * 100) / 100;
    if (badge !== (p.badge || '')) o.badge = badge;
    if (!visible) o.hidden = true;

    if (Object.keys(o).length) edits[p.id] = o;
    else delete edits[p.id];
    updatePending();
  }

  function updatePending() {
    const n = Object.keys(edits).length;
    const saved = JSON.stringify(preview || published || {});
    const dirty = JSON.stringify(edits) !== saved;
    document.getElementById('pendingNote').textContent = n
      ? `${n} peça${n > 1 ? 's' : ''} com ajustes${dirty ? ' · não salvos' : ''}`
      : 'Nenhuma alteração pendente';
    document.getElementById('actionsBar').classList.toggle('dirty', dirty);
    renderStats();
  }

  // ===== RENDER =====
  function renderStats() {
    const base = window.PRODUCTS_BASE || [];
    const eff = base.map(effective);
    const visiveis = eff.filter(p => !p.hidden);
    const promo = visiveis.filter(p => p.oldPrice && p.oldPrice > p.price);
    const medio = visiveis.length ? visiveis.reduce((s, p) => s + p.price, 0) / visiveis.length : 0;
    document.getElementById('adminStats').innerHTML = `
      <div class="stat-card"><span class="stat-value">${visiveis.length}</span><span class="stat-name">peças à venda</span></div>
      <div class="stat-card"><span class="stat-value">${base.length - visiveis.length}</span><span class="stat-name">ocultas</span></div>
      <div class="stat-card"><span class="stat-value">${promo.length}</span><span class="stat-name">em promoção</span></div>
      <div class="stat-card"><span class="stat-value">${fmt(medio)}</span><span class="stat-name">preço médio</span></div>`;
  }

  function renderPanel() {
    const rows = document.getElementById('adminRows');
    rows.innerHTML = (window.PRODUCTS_BASE || []).map(p => {
      const e = effective(p);
      return `
      <tr data-id="${p.id}" class="${e.hidden ? 'row-hidden' : ''}">
        <td class="cell-piece">
          <a href="produto.html?id=${p.id}" target="_blank" title="Ver página da peça">
            <img src="${p.image}" alt="">
          </a>
          <span class="cell-tag">${p.tag}</span>
        </td>
        <td><input type="text" data-f="name" value="${e.name.replace(/"/g, '&quot;')}"></td>
        <td><input type="text" data-f="price" inputmode="decimal" value="${e.price.toFixed(2).replace('.', ',')}" class="input-num"></td>
        <td><input type="text" data-f="oldPrice" inputmode="decimal" value="${e.oldPrice ? e.oldPrice.toFixed(2).replace('.', ',') : ''}" placeholder="—" class="input-num"></td>
        <td><input type="text" data-f="badge" value="${(e.badge || '').replace(/"/g, '&quot;')}" placeholder="—" class="input-badge"></td>
        <td class="cell-visible">
          <label class="switch">
            <input type="checkbox" data-f="visible" ${e.hidden ? '' : 'checked'}>
            <span class="slider"></span>
          </label>
        </td>
      </tr>`;
    }).join('');

    rows.querySelectorAll('tr').forEach(row => {
      const p = window.PRODUCTS_BASE.find(x => x.id === row.dataset.id);
      row.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', () => {
          recomputeEdit(p, row);
          if (inp.dataset.f === 'visible') row.classList.toggle('row-hidden', !inp.checked);
        });
      });
    });

    document.getElementById('ghToken').value = localStorage.getItem(TOKEN_KEY) || '';
    updatePending();
  }

  // ===== AÇÕES =====
  document.getElementById('previewBtn').addEventListener('click', () => {
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(edits));
    preview = JSON.parse(JSON.stringify(edits));
    updatePending();
    setStatus('Prévia salva! Abra a loja neste navegador para conferir — os visitantes ainda veem a versão publicada.', 'ok');
  });

  document.getElementById('discardBtn').addEventListener('click', () => {
    localStorage.removeItem(PREVIEW_KEY);
    window.location.reload();
  });

  document.getElementById('saveTokenBtn').addEventListener('click', () => {
    const t = document.getElementById('ghToken').value.trim();
    if (t) { localStorage.setItem(TOKEN_KEY, t); setStatus('Token salvo neste navegador.', 'ok'); }
    else { localStorage.removeItem(TOKEN_KEY); setStatus('Token removido.', 'ok'); }
  });

  function setStatus(msg, kind) {
    const el = document.getElementById('publishStatus');
    el.textContent = msg;
    el.className = 'publish-status ' + (kind || '');
  }

  document.getElementById('publishBtn').addEventListener('click', async () => {
    const token = (document.getElementById('ghToken').value || '').trim();
    if (!token) {
      setStatus('Cole um token do GitHub no campo abaixo para publicar.', 'err');
      document.getElementById('ghToken').focus();
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);

    const btn = document.getElementById('publishBtn');
    btn.disabled = true;
    btn.textContent = 'Publicando…';
    setStatus('Enviando alterações para o site…');

    try {
      const api = `https://api.github.com/repos/${REPO}/contents/${OVERRIDE_PATH}`;
      const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' };

      const getRes = await fetch(api, { headers });
      if (!getRes.ok) throw new Error(getRes.status === 401 ? 'Token inválido ou sem permissão.' : `Erro ao ler o arquivo (HTTP ${getRes.status}).`);
      const current = await getRes.json();

      const content = `/* Ajustes publicados pelo painel de controle (admin.html).\n   Formato: { "<id>": { price, oldPrice, name, badge, hidden } } */\nwindow.PRODUCTS_OVERRIDE = ${JSON.stringify(edits, null, 2)};\n`;
      const putRes = await fetch(api, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: 'Painel: atualização de preços/peças',
          content: btoa(unescape(encodeURIComponent(content))),
          sha: current.sha
        })
      });
      if (!putRes.ok) throw new Error(`Erro ao publicar (HTTP ${putRes.status}).`);

      localStorage.removeItem(PREVIEW_KEY);
      preview = null;
      Object.keys(published).forEach(k => delete published[k]);
      Object.assign(published, JSON.parse(JSON.stringify(edits)));
      updatePending();
      setStatus('✦ Publicado! O site atualiza em 1–2 minutos para todos os visitantes.', 'ok');
    } catch (err) {
      setStatus(err.message || 'Falha ao publicar. Verifique o token e a internet.', 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = '✦ Publicar no site';
    }
  });

  // Restaura a sessão (depois de todo o estado inicializado)
  if (sessionStorage.getItem(SESSION_KEY) === PASS_HASH) showPanel();
})();
