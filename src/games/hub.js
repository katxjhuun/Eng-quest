// dam-la — Oyunlar merkezi: mini oyunlar, 1000+ bölüm, zorluk ayarı yok.
// Her bölüm "oyun + dil + bölüm no" tohumundan üretilir (aynı bölüm hep aynıdır). Zorluk orta seviyeden başlar ve bölümle artar.
// Oyun modülleri ayrı parçalar hâlinde, açıldıklarında yüklenir.

export const GAMES = [
  { id: 'stack', g: '#e0705a', g2: '#f0a04b', name: 'Stack', icon: '🧩', lang: true, desc: 'Kelimeleri gizli ortak temalarına göre gruplara ayır.', load: () => import('./stack.js') },
  { id: 'uniwords', g: '#4f3bd4', g2: '#8a6cf0', name: 'Uniwords', icon: '🔤', lang: true, desc: 'Eldeki harflerle iç içe bulmacayı doldur.', load: () => import('./uniwords.js') },
  { id: 'crossup', g: '#d0443c', g2: '#9a2f6a', name: 'Cross Up', icon: '⚔️', lang: true, desc: 'Bota karşı sırayla harf yerleştir, puanı kap.', load: () => import('./crossup.js') },
  { id: 'trace', g: '#2f7a8a', g2: '#4fc3d9', name: 'Trace', icon: '⏳', desc: 'Olayı zaman çizgisinde doğru yere yerleştir.', load: () => import('./trace.js') },
  { id: 'sudoku', g: '#3f8a4a', g2: '#7cc46a', name: 'Sudoku', icon: '🔢', desc: 'Her satır, sütun ve kutuda 1–9 bir kez.', load: () => import('./sudoku.js') },
  { id: 'tetris', g: '#2b2240', g2: '#5c46a0', name: 'Tetris', icon: '🧱', desc: 'Blokları yerleştir, satırları temizle.', load: () => import('./tetris.js') },
  { id: 'candy', g: '#e05a9a', g2: '#f0a04b', name: 'Şeker', icon: '🍬', desc: 'Üç aynı şekeri yan yana getir, hedefi tamamla.', load: () => import('./candy.js') },
];
export const MAX_LEVEL = 1000;

// orta (0.4) → çok zor (1.0); ilk bölümler bile kolay değildir
export function difficulty(level) { const t = Math.min(1, Math.max(0, (level - 1) / (MAX_LEVEL - 1))); return 0.4 + 0.6 * Math.pow(t, 0.8); }
export function rngFor(...parts) {
  let h = 2166136261; for (const c of parts.join(':')) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  let a = h >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const shuffle = (a, r) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export function initGames(core) {
  const $ = s => document.querySelector(s);
  const esc = core.esc;
  const A = () => core.app;
  function st() {
    const app = A();
    if (!app.games || typeof app.games !== 'object') app.games = {};
    const g = app.games;
    if (!g.lv || typeof g.lv !== 'object') g.lv = {};
    if (!g.lang || typeof g.lang !== 'object') g.lang = {};
    if (!g.stars || typeof g.stars !== 'object') g.stars = {};
    return g;
  }
  const key = (id, lang) => (lang ? `${id}.${lang}` : id);
  const levelOf = (id, lang) => Math.max(1, Math.min(MAX_LEVEL, st().lv[key(id, lang)] | 0 || 1));
  const langOf = id => (st().lang[id] === 'en' ? 'en' : 'tr');

  const root = document.createElement('div');
  root.className = 'gm-overlay'; root.id = 'gamesOverlay'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
  root.innerHTML = `<div class="gm-shell"><div class="gm-head"><button class="gm-back" id="gmBack" aria-label="Geri">←</button><div class="gm-title"><div class="eyebrow" id="gmEye">OYUNLAR</div><b id="gmTitle">Mini oyunlar</b></div><div class="gm-tools" id="gmTools"></div></div><div class="gm-body" id="gmBody"></div></div>`;
  document.body.appendChild(root);
  let cleanup = null, current = null;

  function hub() {
    cleanup?.(); cleanup = null; current = null; root.classList.remove('full');
    $('#gmEye').textContent = 'OYUNLAR'; $('#gmTitle').textContent = 'Mini oyunlar'; $('#gmTools').innerHTML = '';
    $('#gmBody').innerHTML = `<div class="gm-grid">${GAMES.map((g, i) => {
      const lang = g.lang ? langOf(g.id) : null, lv = levelOf(g.id, lang), stars = st().stars[key(g.id, lang)] | 0;
      return `<button class="gm-card" data-game="${g.id}" style="--g:${g.g};--g2:${g.g2};--i:${i}"><div class="gm-art"><span class="gm-ico">${g.icon}</span></div><div class="gm-meta"><b>${esc(g.name)}</b><small>${esc(g.desc)}</small><em>Bölüm ${lv}${lang ? ` · ${lang.toUpperCase()}` : ''}${stars ? ` <s>★ ${stars}</s>` : ''}</em></div><i style="width:${(lv - 1) / (MAX_LEVEL - 1) * 100}%"></i></button>`;
    }).join('')}</div><p class="gm-note">Zorluk ayarı yok: her oyun orta zorlukta başlar, bölüm ilerledikçe zorlaşır.</p>`;
  }
  function open(id) { root.classList.add('show'); document.body.classList.add('gm-open'); id ? play(id) : hub(); }
  function close() { cleanup?.(); cleanup = null; root.classList.remove('full'); root.classList.remove('show'); document.body.classList.remove('gm-open'); }

  async function play(id, again = false) {
    const g = GAMES.find(x => x.id === id); if (!g) return hub();
    cleanup?.(); cleanup = null; current = id;
    const lang = g.lang ? langOf(id) : null, level = levelOf(id, lang);
    $('#gmEye').textContent = `${g.name.toLocaleUpperCase('tr')}${lang ? ' · ' + lang.toUpperCase() : ''}`;
    $('#gmTitle').textContent = `Bölüm ${level}`;
    $('#gmTools').innerHTML = g.lang ? `<button class="gm-lang" id="gmLang" title="Dil">${lang === 'en' ? '🇬🇧 EN' : '🇹🇷 TR'}</button>` : '';
    $('#gmBody').innerHTML = '<div class="gm-loading">Yükleniyor…</div>';
    let mod;
    try { mod = await g.load(); } catch (e) { console.warn('[games]', e); $('#gmBody').innerHTML = '<div class="gm-loading">Oyun yüklenemedi.</div>'; return; }
    if (current !== id) return;
    const body = $('#gmBody'); body.innerHTML = '';
    const ctx = {
      level, lang, d: difficulty(level), rng: rngFor(id, lang || '', level, again ? Date.now() : 0), esc, toast: core.toast,
      win: (stars = 3, msg = '') => finish(true, stars, msg),
      lose: (msg = '') => finish(false, 0, msg),
      fullscreen: on => root.classList.toggle('full', !!on),
      exit: () => hub(),
      dbg: o => { try { if (localStorage.getItem('dl-debug') === '1') window.__gm = o; } catch {} },
      setTitle: t => { $('#gmTitle').textContent = t; },
    };
    // aynı bölüm tekrar oynanırken bulmaca aynı kalır (tohum değişmez); yalnızca Şeker ve Tetris’te taşlar her denemede farklı gelebilir
    if (!again || !['candy', 'tetris'].includes(id)) ctx.rng = rngFor(id, lang || '', level);
    cleanup = mod.mount(body, ctx) || null;

    function finish(won, stars, msg) {
      const s = st(), k = key(id, lang);
      if (won) { s.lv[k] = Math.min(MAX_LEVEL, level + 1); s.stars[k] = (s.stars[k] | 0) + stars; core.saveLocal(true); }
      const ov = document.createElement('div');
      ov.className = 'gm-end';
      ov.innerHTML = `<div class="gm-endcard"><div class="gm-endico">${won ? '🏆' : '💭'}</div><h3>${won ? `Bölüm ${level} tamam!` : 'Olmadı'}</h3>${won ? `<div class="gm-stars">${[0, 1, 2].map(i => `<span class="${i < stars ? 'on' : ''}" style="--i:${i}">★</span>`).join('')}</div>` : ''}<p>${esc(msg || (won ? 'Bir sonraki bölüm biraz daha zor.' : 'Bir daha dene.'))}</p>
        <div class="gm-endbtns">${won ? `<button class="primarybtn" data-end="next">Sonraki bölüm →</button>` : `<button class="primarybtn" data-end="retry">Tekrar dene</button>`}<button class="secondarybtn" data-end="hub">Oyunlar</button></div></div>`;
      body.appendChild(ov);
      if (won) import('./fx.js').then(fx => { const c = ov.querySelector('.gm-endcard'); setTimeout(() => fx.burstAt(c.querySelector('.gm-stars'), { n: 22, spread: 140, shape: 'star', size: 11 }), 350 + stars * 180); });
      ov.addEventListener('click', e => { const b = e.target.closest('[data-end]'); if (!b) return; if (b.dataset.end === 'hub') hub(); else play(id, b.dataset.end === 'retry'); });
    }
  }

  root.addEventListener('click', e => {
    if (e.target.closest('#gmBack')) { if (current) hub(); else close(); return; }
    if (e.target.closest('#gmLang')) { const s = st(); s.lang[current] = langOf(current) === 'en' ? 'tr' : 'en'; core.saveLocal(false); play(current); return; }
    const c = e.target.closest('[data-game]'); if (c) play(c.dataset.game);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('show')) { if (current) hub(); else close(); } });
  return { open, close };
}
