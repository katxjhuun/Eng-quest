// Uniwords: çemberdeki harflerle kelimeler kur, iç içe bulmacayı doldur.
// Zorluk: 6 harfle başlar, 7 ve 8 harfe çıkar; bulunacak kelime sayısı 5'ten 10'a artar; ipucu hakkı azalır.
import { lexicon, upper, letters, canMake } from './lexicon.js';
import { shuffle } from './hub.js';
import { layout } from './crossword.js';

export function mount(el, ctx) {
  let alive = true;
  el.innerHTML = '<div class="gm-loading">Bulmaca hazırlanıyor…</div>';
  lexicon(ctx.lang).then(lx => { if (alive) start(lx); });
  return () => { alive = false; };

  function start(lx) {
    const { d, rng, lang, esc } = ctx;
    const t = (d - 0.4) / 0.6;
    const L = d < 0.6 ? 6 : d < 0.85 ? 7 : 8;
    const want = 5 + Math.round(t * 5);
    const depth = Math.round(2500 + t * 4500);
    const known = lx.common.slice(0, depth).filter(w => { const n = letters(w).length; return n >= 3 && n <= L; });
    let base = null, subs = [];
    const bases = shuffle(known.filter(w => letters(w).length === L), rng);
    for (const b of bases.slice(0, 120)) {
      const bl = letters(b);
      const s = known.filter(w => w !== b && canMake(w, bl));
      if (s.length + 1 >= want) { base = b; subs = s; break; }
      if (!base || s.length > subs.length) { base = b; subs = s; }
    }
    // uzun kelimeler önce; bulmacaya sığanlar seçilir
    const pick = [base, ...shuffle(subs, rng).sort((a, b) => letters(b).length - letters(a).length).slice(0, want * 2)];
    let lay = layout(pick.slice(0, want + 3), rng, 11);
    if (lay.words.length > want) lay = layout(lay.words.slice(0, want).map(x => x.w), rng, 11);
    const puzzle = lay.words; ctx.dbg?.({ base, puzzle, lay });
    const found = new Set(), revealed = new Set(), bonus = new Set();
    let hints = Math.max(1, 4 - Math.floor(t * 3)), usedHints = 0;
    // çember: harfler sabit düğümlerdir; karıştırınca yer değiştirirler (kayarak). Kelime parmakla harfleri bağlayarak kurulur.
    const W = letters(base), n = W.length;
    let slots = shuffle([...Array(n).keys()], rng);   // harf i → çemberdeki konum slots[i]
    let path = [], drag = false, finger = null, busy = false;
    el.innerHTML = `<div class="uw"><div class="uw-board" id="uwBoard" style="--w:${lay.w};--h:${lay.h}"></div>
      <div class="uw-cur" id="uwCur"><span></span></div>
      <div class="uw-wheel" id="uwWheel"><svg class="uw-lines" id="uwLines" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>
        ${W.map((c, i) => `<div class="uw-l" data-i="${i}">${esc(upper(c, lang))}</div>`).join('')}
        <span class="uw-mix" id="uwMix" role="button" tabindex="0" aria-label="Harfleri karıştır">🔀</span></div>
      <div class="uw-btns"><button class="gm-chip" id="uwHint">💡 <span id="uwHn"></span></button><span class="uw-bonus" id="uwBonus"></span></div></div>`;
    const key = (x, y) => `${x},${y}`;
    const openSet = () => { const o = new Set(revealed); for (const p of puzzle) if (found.has(p.w)) for (const [x, y] of p.cells) o.add(key(x, y)); return o; };
    const allDone = () => { const o = openSet(); return puzzle.every(p => found.has(p.w) || p.cells.every(([x, y]) => o.has(key(x, y)))); };
    const wheelEl = el.querySelector('#uwWheel'), linesEl = el.querySelector('#uwLines'), curEl = el.querySelector('#uwCur');
    const nodes = [...wheelEl.querySelectorAll('.uw-l')];
    const R = n > 6 ? 37 : 35;
    const pos = i => { const a = -Math.PI / 2 + slots[i] / n * Math.PI * 2; return [50 + Math.cos(a) * R, 50 + Math.sin(a) * R]; };
    let fresh = new Map(); // yeni açılan kare → sıra (animasyon gecikmesi)
    function drawBoard() {
      const open = openSet();
      let h = '';
      for (let y = 0; y < lay.h; y++) for (let x = 0; x < lay.w; x++) {
        const k = key(x, y), c = lay.cells.get(k);
        if (!c) { h += '<div class="uw-x"></div>'; continue; }
        const f = fresh.get(k);
        h += `<div class="uw-c${open.has(k) ? ' on' : ''}${f != null ? ' new' : ''}"${f != null ? ` style="--i:${f}"` : ''}>${open.has(k) ? esc(upper(c, lang)) : ''}</div>`;
      }
      el.querySelector('#uwBoard').innerHTML = h;
      fresh = new Map();
      el.querySelector('#uwHn').textContent = hints;
      el.querySelector('#uwBonus').textContent = bonus.size ? `✦ ${bonus.size} bonus` : '';
    }
    function placeNodes() { nodes.forEach((b, i) => { const [x, y] = pos(i); b.style.left = x + '%'; b.style.top = y + '%'; }); }
    function drawPath() {
      nodes.forEach((b, i) => b.classList.toggle('on', path.includes(i)));
      const pts = path.map(pos);
      if (finger && drag && pts.length) pts.push(finger);
      linesEl.innerHTML = pts.length > 1 ? `<polyline points="${pts.map(p => p.join(',')).join(' ')}"/>` : '';
      const w = path.map(i => W[i]).join('');
      curEl.className = 'uw-cur' + (w ? ' show' : '');
      curEl.firstElementChild.textContent = w ? upper(w, lang) : '';
    }
    function verdict(cls, ms = 520) {
      busy = true; curEl.classList.add(cls);
      setTimeout(() => { busy = false; curEl.classList.remove(cls); path = []; drawPath(); }, ms);
    }
    function submit() {
      const w = path.map(i => W[i]).join('');
      if (letters(w).length < 3) { path = []; drawPath(); return; }
      const p = puzzle.find(x => x.w === w);
      if (p) {
        if (found.has(w)) { verdict('dup'); return; }
        const before = openSet();
        found.add(w);
        p.cells.forEach(([x, y], j) => { if (!before.has(key(x, y))) fresh.set(key(x, y), j); });
        verdict('ok', 420); drawBoard();
        if (allDone()) setTimeout(() => ctx.win(usedHints === 0 ? 3 : usedHints <= 1 ? 2 : 1, bonus.size ? `${bonus.size} bonus kelime de buldun.` : ''), 900);
      } else if (lx.all.has(w)) {
        if (!bonus.has(w)) { bonus.add(w); drawBoard(); const b = el.querySelector('#uwBonus'); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); verdict('bonus', 600); }
        else verdict('dup');
      } else verdict('no');
    }
    // parmak konumu → çember koordinatı (0–100)
    const local = e => { const r = wheelEl.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100]; };
    const hit = ([x, y]) => { let best = -1, bd = 11.5; nodes.forEach((_, i) => { const [a, b] = pos(i), dd = Math.hypot(a - x, b - y); if (dd < bd) { bd = dd; best = i; } }); return best; };
    wheelEl.addEventListener('pointerdown', e => {
      if (busy || e.target.closest('#uwMix')) return;
      const i = hit(local(e)); if (i < 0) return;
      e.preventDefault(); drag = true; wheelEl.setPointerCapture?.(e.pointerId);
      path = [i]; finger = local(e); drawPath();
    });
    wheelEl.addEventListener('pointermove', e => {
      if (!drag) return;
      finger = local(e);
      const i = hit(finger);
      if (i >= 0) {
        if (!path.includes(i)) path.push(i);
        else if (path.length > 1 && path.at(-2) === i) path.pop(); // geri giderek son harfi bırak
      }
      drawPath();
    });
    const up = () => { if (!drag) return; drag = false; finger = null; submit(); drawPath(); };
    wheelEl.addEventListener('pointerup', up);
    wheelEl.addEventListener('pointercancel', () => { drag = false; finger = null; path = []; drawPath(); });
    const mix = () => { if (drag || busy) return; slots = shuffle(slots, Math.random); placeNodes(); const m = el.querySelector('#uwMix'); m.classList.remove('spin'); void m.offsetWidth; m.classList.add('spin'); };
    el.querySelector('#uwMix').addEventListener('click', mix);
    el.querySelector('#uwMix').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mix(); } });
    el.querySelector('#uwHint').addEventListener('click', () => {
      if (hints <= 0) { ctx.toast('İpucu hakkın kalmadı.'); return; }
      const open = openSet();
      const target = puzzle.filter(p => !found.has(p.w)).flatMap(p => p.cells).filter(([x, y]) => !open.has(key(x, y)));
      if (!target.length) return;
      const [x, y] = target[Math.floor(Math.random() * target.length)];
      revealed.add(key(x, y)); fresh.set(key(x, y), 0); hints--; usedHints++; drawBoard();
      if (allDone()) setTimeout(() => ctx.win(1), 700);
    });
    placeNodes(); drawBoard(); drawPath();
  }
}
