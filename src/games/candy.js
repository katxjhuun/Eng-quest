// Şeker (match-3): bölümler tamamen rastgele üretilir. Hedef türleri: puan, renk toplama, jöle temizleme.
// Zorluk: renk sayısı, tahta boyutu, hedef miktarı artar; hamle sayısı azalır; ileri bölümlerde çift kat jöle.
// 4'lü eşleşme şeritli şeker (satır/sütun temizler), 5'li eşleşme renk bombası üretir.
// Şekerler kalıcı DOM öğeleridir: yer değiştirme, düşme, patlama ve uçan puanlar CSS geçişleriyle canlandırılır.
const SHAPES = [
  { c: '#E5534B', d: '#a8322c', s: '<circle cx="20" cy="20" r="14"/>' },
  { c: '#F0A04B', d: '#b46a1c', s: '<rect x="7" y="7" width="26" height="26" rx="7"/>' },
  { c: '#E9C23C', d: '#a8861a', s: '<path d="M20 4.5l15.5 15.5L20 35.5 4.5 20z" stroke-linejoin="round"/>' },
  { c: '#6FB36A', d: '#3f7a3b', s: '<path d="M20 5.5l15 27H5z" stroke-linejoin="round"/>' },
  { c: '#5B8FD0', d: '#2f5e98', s: '<path d="M20 5l13 7.5v15L20 35 7 27.5v-15z" stroke-linejoin="round"/>' },
  { c: '#9A7BD0', d: '#634599', s: '<path d="M20 4l4.7 10 10.8 1.2-8 7.4 2.3 10.7L20 27.8 10.2 33.3l2.3-10.7-8-7.4L15.3 14z" stroke-linejoin="round"/>' },
];
const svgOf = (k, sp) => `<svg viewBox="0 0 40 40"><defs><radialGradient id="g${k}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="${SHAPES[k].c}" stop-opacity="0"/></radialGradient></defs><g fill="${SHAPES[k].c}" stroke="${SHAPES[k].d}" stroke-width="1.6">${SHAPES[k].s}</g><g fill="url(#g${k})">${SHAPES[k].s}</g>${sp === 'h' ? '<path d="M7 20h26" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/><path d="M8 14h24M8 26h24" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>' : sp === 'v' ? '<path d="M20 7v26" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/><path d="M14 8v24M26 8v24" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>' : '<ellipse cx="15" cy="13" rx="5" ry="3" fill="#fff" opacity=".5"/>'}</svg>`;
const BOMB = '<svg viewBox="0 0 40 40"><defs><linearGradient id="rb" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#E5534B"/><stop offset=".35" stop-color="#E9C23C"/><stop offset=".65" stop-color="#6FB36A"/><stop offset="1" stop-color="#5B8FD0"/></linearGradient></defs><circle cx="20" cy="21" r="14" fill="#2a2430"/><circle cx="20" cy="21" r="14" fill="none" stroke="url(#rb)" stroke-width="3.5"/><circle cx="15" cy="16" r="3.4" fill="#fff" opacity=".55"/><g fill="#fff"><circle cx="24" cy="25" r="1.4"/><circle cx="18" cy="27" r="1"/><circle cx="26" cy="18" r="1"/></g></svg>';
const wait = ms => new Promise(r => setTimeout(r, ms));
const SWAP_MS = 190;

export function mount(el, ctx) {
  const { d, rng } = ctx;
  const N = d < 0.55 ? 7 : 8, K = d < 0.62 ? 5 : 6;
  const kinds = ['score', 'collect', 'jelly'];
  const goalType = kinds[Math.floor(rng() * (d < 0.5 ? 2 : 3))];
  let moves = Math.round(30 - (d - 0.4) / 0.6 * 12);                 // 30 → 18 hamle
  const goal = { type: goalType };
  if (goalType === 'score') goal.target = Math.round((1800 + (d - 0.4) / 0.6 * 3000) / 100) * 100;
  if (goalType === 'collect') { const n = d < 0.7 ? 1 : 2; goal.need = {}; const cs = [...Array(K).keys()].sort(() => rng() - 0.5).slice(0, n); for (const c of cs) goal.need[c] = Math.round((22 + (d - 0.4) / 0.6 * 18) / n); }
  const jelly = Array.from({ length: N }, () => Array(N).fill(0));
  if (goalType === 'jelly') {
    const count = Math.round(N * N * (0.2 + (d - 0.4) / 0.6 * 0.22)); moves += 4;
    const cells = [...Array(N * N).keys()].sort(() => rng() - 0.5).slice(0, count);
    for (const i of cells) jelly[Math.floor(i / N)][i % N] = d > 0.75 && rng() < 0.3 ? 2 : 1;
  }
  const totalMoves = moves;
  let score = 0, busy = false, sel = null, done = false, uid = 0;
  const got = {};
  const rnd = () => Math.floor(rng() * K);
  const B = Array.from({ length: N }, () => Array(N).fill(null));
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { let k; do k = rnd(); while ((x >= 2 && B[y][x - 1].k === k && B[y][x - 2].k === k) || (y >= 2 && B[y - 1][x].k === k && B[y - 2][x].k === k)); B[y][x] = { k, sp: '', id: ++uid }; }

  el.innerHTML = `<div class="cd"><div class="cd-bar"><div class="cd-stat"><small>Hamle</small><b id="cdMoves">${moves}</b></div><div class="cd-goal" id="cdGoal"></div><div class="cd-stat"><small>Puan</small><b id="cdScore">0</b></div></div>
    <div class="cd-prog"><i id="cdProg"></i></div>
    <div class="cd-board" id="cdBoard" style="--n:${N}"><div class="cd-cells" id="cdCells"></div><div class="cd-layer" id="cdLayer"></div><div class="cd-fx" id="cdFx"></div></div></div>`;
  const boardEl = el.querySelector('#cdBoard'), layer = el.querySelector('#cdLayer'), fx = el.querySelector('#cdFx'), cellsEl = el.querySelector('#cdCells');
  const els = new Map(); // id → element

  function goalHTML() {
    if (goal.type === 'score') return `<small>Hedef puan</small><b>${Math.min(score, goal.target)} / ${goal.target}</b>`;
    if (goal.type === 'collect') return `<small>Topla</small><b>${Object.entries(goal.need).map(([k, n]) => { const left = Math.max(0, n - (got[k] | 0)); return `<span class="cd-gi${left ? '' : ' ok'}">${svgOf(+k)}${left || '✓'}</span>`; }).join('')}</b>`;
    const left = jelly.flat().reduce((s, v) => s + v, 0); return `<small>Jöle</small><b>${left}</b>`;
  }
  function progress() {
    if (goal.type === 'score') return Math.min(1, score / goal.target);
    if (goal.type === 'collect') { const all = Object.values(goal.need).reduce((a, b) => a + b, 0); return Object.entries(goal.need).reduce((s, [k, n]) => s + Math.min(n, got[k] | 0), 0) / all; }
    return 1 - jelly.flat().reduce((s, v) => s + v, 0) / jStart;
  }
  const jStart = Math.max(1, jelly.flat().reduce((s, v) => s + v, 0));
  function hud(bump) {
    el.querySelector('#cdMoves').textContent = moves;
    const s = el.querySelector('#cdScore'); s.textContent = score; if (bump) { s.classList.remove('bump'); void s.offsetWidth; s.classList.add('bump'); }
    el.querySelector('#cdGoal').innerHTML = goalHTML();
    el.querySelector('#cdProg').style.width = (progress() * 100).toFixed(1) + '%';
    el.querySelector('#cdMoves').parentElement.classList.toggle('low', moves <= 5);
  }
  function drawCells() {
    let h = '';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const j = jelly[y][x]; h += `<div class="cd-cell${j ? ` jelly j${j}` : ''}${(x + y) % 2 ? ' alt' : ''}"></div>`; }
    cellsEl.innerHTML = h;
  }
  const pos = (x, y) => `translate(${x * 100}%,${y * 100}%)`;
  // B ile DOM'u eşitle. fromAbove: yeni şekerlerin kaç kare yukarıdan düşeceği
  function sync(fall = {}) {
    const live = new Set();
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const c = B[y][x]; if (!c) continue; live.add(c.id);
      let e = els.get(c.id);
      if (!e) {
        e = document.createElement('div'); e.className = 'cd-p'; els.set(c.id, e); layer.appendChild(e);
        e.style.transition = 'none'; e.style.transform = pos(x, y - (fall[c.id] || 0)); void e.offsetWidth; e.style.transition = '';
      }
      const art = c.sp === 'b' ? 'b' : `${c.k}${c.sp}`;
      if (e.dataset.art !== art) { e.innerHTML = `<div class="cd-in">${c.sp === 'b' ? BOMB : svgOf(c.k, c.sp)}</div>`; e.dataset.art = art; if (c.sp) e.classList.add('made'); }
      if (fall[c.id]) e.style.setProperty('--fd', `${Math.min(520, 150 + fall[c.id] * 55)}ms`); else e.style.removeProperty('--fd');
      e.classList.toggle('falling', !!fall[c.id]);
      e.style.transform = pos(x, y);
      e.dataset.x = x; e.dataset.y = y;
      e.classList.toggle('sel', !!(sel && sel.x === x && sel.y === y));
    }
    for (const [id, e] of els) if (!live.has(id)) { els.delete(id); e.remove(); }
  }
  function burst(x, y, k, big) {
    const color = k >= 0 ? SHAPES[k].c : '#fff';
    const n = big ? 9 : 6;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i'); p.className = 'cd-shard';
      p.style.left = `${(x + 0.5) / N * 100}%`; p.style.top = `${(y + 0.5) / N * 100}%`; p.style.background = color;
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.6, r = 26 + Math.random() * (big ? 46 : 26);
      p.style.setProperty('--dx', `${Math.cos(a) * r}px`); p.style.setProperty('--dy', `${Math.sin(a) * r}px`);
      fx.appendChild(p); setTimeout(() => p.remove(), 620);
    }
    const ring = document.createElement('i'); ring.className = 'cd-ring'; ring.style.left = `${(x + 0.5) / N * 100}%`; ring.style.top = `${(y + 0.5) / N * 100}%`; ring.style.borderColor = color;
    fx.appendChild(ring); setTimeout(() => ring.remove(), 500);
  }
  function floatText(x, y, text, cls = '', color) {
    const t = document.createElement('b'); t.className = 'cd-float ' + cls; t.textContent = text;
    t.style.left = `${(x + 0.5) / N * 100}%`; t.style.top = `${(y + 0.5) / N * 100}%`; if (color) t.style.color = color;
    fx.appendChild(t); setTimeout(() => t.remove(), 1100);
  }
  function beam(dir, i) {
    const b = document.createElement('i'); b.className = `cd-beam ${dir}`;
    if (dir === 'h') b.style.top = `${(i + 0.5) / N * 100}%`; else b.style.left = `${(i + 0.5) / N * 100}%`;
    fx.appendChild(b); setTimeout(() => b.remove(), 450);
  }
  function findMatches() {
    const runs = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N;) { const k = B[y][x]?.sp === 'b' ? -1 : B[y][x]?.k; let e = x + 1; while (e < N && k >= 0 && B[y][e]?.sp !== 'b' && B[y][e]?.k === k) e++; if (e - x >= 3) runs.push({ cells: Array.from({ length: e - x }, (_, i) => [x + i, y]), dir: 'h', k }); x = e; }
    for (let x = 0; x < N; x++) for (let y = 0; y < N;) { const k = B[y][x]?.sp === 'b' ? -1 : B[y][x]?.k; let e = y + 1; while (e < N && k >= 0 && B[e][x]?.sp !== 'b' && B[e][x]?.k === k) e++; if (e - y >= 3) runs.push({ cells: Array.from({ length: e - y }, (_, i) => [x, y + i]), dir: 'v', k }); y = e; }
    return runs;
  }
  function clearCell(x, y, set, colorFor) {
    const key = `${x},${y}`; if (set.has(key) || !B[y][x]) return; set.add(key);
    const c = B[y][x];
    if (c.sp === 'h') { beam('h', y); for (let i = 0; i < N; i++) clearCell(i, y, set, colorFor); }
    if (c.sp === 'v') { beam('v', x); for (let i = 0; i < N; i++) clearCell(x, i, set, colorFor); }
    if (c.sp === 'b') { const t = colorFor ?? Math.floor(rng() * K); for (let yy = 0; yy < N; yy++) for (let xx = 0; xx < N; xx++) if (B[yy][xx]?.k === t && B[yy][xx].sp !== 'b') clearCell(xx, yy, set, colorFor); }
  }
  // patlat → puanı göster → düşür
  async function explode(set, makes, pts, at, combo) {
    for (const key of set) {
      const [x, y] = key.split(',').map(Number); const c = B[y][x];
      got[c.k] = (got[c.k] | 0) + 1; if (jelly[y][x]) jelly[y][x]--;
      const e = els.get(c.id); if (e) { e.classList.add('pop'); e.style.setProperty('--pd', `${Math.random() * 70}ms`); }
      burst(x, y, c.sp === 'b' ? -1 : c.k, !!c.sp);
    }
    for (const a of at) floatText(a.x, a.y, `+${a.pts}`, a.big ? 'big' : '', a.color);
    if (combo >= 2) { floatText((N - 1) / 2, (N - 1) / 2 - 1, combo >= 4 ? `Muhteşem! ×${combo}` : combo === 3 ? `Süper! ×${combo}` : `Kombo ×${combo}`, 'combo'); boardEl.classList.remove('quake'); void boardEl.offsetWidth; if (combo >= 3) boardEl.classList.add('quake'); }
    score += pts; hud(true); drawCells();
    await wait(260);
    for (const key of set) { const [x, y] = key.split(',').map(Number); B[y][x] = null; }
    for (const m of makes) { B[m.y][m.x] = { k: m.k, sp: m.sp, id: ++uid }; }
    const fall = {};
    for (let x = 0; x < N; x++) {
      let w = N - 1;
      for (let y = N - 1; y >= 0; y--) if (B[y][x]) { if (w !== y) { B[w][x] = B[y][x]; B[y][x] = null; fall[B[w][x].id] = w - y; } w--; }
      const missing = w + 1;
      for (let y = w; y >= 0; y--) { B[y][x] = { k: rnd(), sp: '', id: ++uid }; fall[B[y][x].id] = missing + 0.6; }
    }
    sync(fall);
    const maxFall = Math.max(0, ...Object.values(fall));
    await wait(Math.min(520, 150 + maxFall * 55) + 60);
  }
  async function resolve(swapAt) {
    let combo = 0;
    for (;;) {
      if (done && !alive) return;
      const runs = findMatches(); if (!runs.length) break;
      combo++;
      const set = new Set(), makes = [], at = [];
      let pts = 0;
      for (const r of runs) {
        const before = set.size;
        for (const [x, y] of r.cells) clearCell(x, y, set);
        const p = (set.size - before) * 20 * combo + (r.cells.length >= 4 ? 60 : 0);
        pts += p;
        const mid = r.cells[Math.floor(r.cells.length / 2)];
        at.push({ x: mid[0], y: mid[1], pts: p, big: r.cells.length >= 4, color: SHAPES[r.k]?.c });
        if (r.cells.length >= 4) {
          const hit = (swapAt && r.cells.find(([x, y]) => (x === swapAt[0].x && y === swapAt[0].y) || (x === swapAt[1].x && y === swapAt[1].y))) || mid;
          makes.push({ x: hit[0], y: hit[1], k: B[hit[1]][hit[0]].k, sp: r.cells.length >= 5 ? 'b' : (r.dir === 'h' ? 'v' : 'h') });
        }
      }
      await explode(set, makes, pts, at, combo);
      swapAt = null;
    }
  }
  function hasMove() {
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) for (const [dx, dy] of [[1, 0], [0, 1]]) {
      const x2 = x + dx, y2 = y + dy; if (x2 >= N || y2 >= N) continue;
      if (B[y][x].sp === 'b' || B[y2][x2].sp === 'b') return true;
      [B[y][x], B[y2][x2]] = [B[y2][x2], B[y][x]]; const ok = findMatches().length > 0; [B[y][x], B[y2][x2]] = [B[y2][x2], B[y][x]];
      if (ok) return true;
    }
    return false;
  }
  function goalDone() {
    if (goal.type === 'score') return score >= goal.target;
    if (goal.type === 'collect') return Object.entries(goal.need).every(([k, n]) => (got[k] | 0) >= n);
    return jelly.flat().every(v => !v);
  }
  async function trySwap(a, b) {
    if (busy || done) return;
    busy = true; sel = null;
    const A = B[a.y][a.x], Bc = B[b.y][b.x];
    [B[a.y][a.x], B[b.y][b.x]] = [Bc, A];
    sync(); await wait(SWAP_MS);
    if (A.sp === 'b' || Bc.sp === 'b') {
      const bombAt = A.sp === 'b' ? b : a, other = A.sp === 'b' ? Bc : A;
      const set = new Set();
      if (other.sp === 'b') { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) set.add(`${x},${y}`); }
      else { set.add(`${bombAt.x},${bombAt.y}`); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (B[y][x]?.k === other.k && B[y][x].sp !== 'b') clearCell(x, y, set, other.k); }
      // bombadan hedeflere ışınlar
      for (const key of set) { const [x, y] = key.split(',').map(Number); if (x === bombAt.x && y === bombAt.y) continue; const z = document.createElement('i'); z.className = 'cd-zap'; const x1 = (bombAt.x + 0.5) / N * 100, y1 = (bombAt.y + 0.5) / N * 100, x2 = (x + 0.5) / N * 100, y2 = (y + 0.5) / N * 100; z.style.left = x1 + '%'; z.style.top = y1 + '%'; z.style.setProperty('--len', Math.hypot(x2 - x1, y2 - y1) + '%'); z.style.setProperty('--ang', Math.atan2(y2 - y1, x2 - x1) + 'rad'); fx.appendChild(z); setTimeout(() => z.remove(), 420); }
      await wait(220);
      moves--;
      await explode(set, [], set.size * 30, [{ x: bombAt.x, y: bombAt.y, pts: set.size * 30, big: true }], 1);
      await resolve(null);
    } else if (findMatches().length) { moves--; hud(); await resolve([a, b]); }
    else {
      [B[a.y][a.x], B[b.y][b.x]] = [A, Bc];
      for (const c of [A, Bc]) els.get(c.id)?.classList.add('nope');
      sync(); await wait(SWAP_MS + 40);
      for (const c of [A, Bc]) els.get(c.id)?.classList.remove('nope');
      busy = false; return;
    }
    if (!alive) return;
    if (!hasMove()) {
      ctx.toast('Hamle kalmadı, tahta karıştırılıyor.');
      for (const e of els.values()) e.classList.add('shuffle');
      await wait(280);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (B[y][x].sp !== 'b') { B[y][x].k = rnd(); const e = els.get(B[y][x].id); if (e) e.dataset.art = ''; }
      sync(); for (const e of els.values()) e.classList.remove('shuffle');
      await resolve(null);
    }
    hud(); busy = false;
    if (goalDone()) { done = true; boardEl.classList.add('won'); const ratio = moves / totalMoves; setTimeout(() => ctx.win(ratio >= 0.3 ? 3 : ratio >= 0.12 ? 2 : 1, `${moves} hamle arttı, ${score} puan.`), 700); }
    else if (moves <= 0) { done = true; setTimeout(() => ctx.lose('Hamlelerin bitti.'), 500); }
  }
  // dokun-dokun ya da kaydır: parmak bir kare kaydığında takas hemen başlar
  let start = null;
  const cellAt = e => { const r = layer.getBoundingClientRect(); const x = Math.floor((e.clientX - r.left) / r.width * N), y = Math.floor((e.clientY - r.top) / r.height * N); return x >= 0 && y >= 0 && x < N && y < N ? { x, y } : null; };
  boardEl.addEventListener('pointerdown', e => { const c = cellAt(e); if (!c || busy) return; start = { ...c, px: e.clientX, py: e.clientY, moved: false }; boardEl.setPointerCapture?.(e.pointerId); const p = els.get(B[c.y][c.x]?.id); p?.classList.add('press'); });
  boardEl.addEventListener('pointermove', e => {
    if (!start || start.moved) return;
    const dx = e.clientX - start.px, dy = e.clientY - start.py, cell = layer.getBoundingClientRect().width / N;
    if (Math.hypot(dx, dy) < cell * 0.35) return;
    start.moved = true; els.get(B[start.y][start.x]?.id)?.classList.remove('press');
    const t = Math.abs(dx) > Math.abs(dy) ? { x: start.x + Math.sign(dx), y: start.y } : { x: start.x, y: start.y + Math.sign(dy) };
    if (t.x >= 0 && t.y >= 0 && t.x < N && t.y < N) trySwap({ x: start.x, y: start.y }, t);
  });
  const up = () => {
    if (!start) return; const s = start; start = null;
    for (const e of els.values()) e.classList.remove('press');
    if (s.moved || busy) return;
    if (sel && Math.abs(sel.x - s.x) + Math.abs(sel.y - s.y) === 1) { trySwap(sel, s); return; }
    sel = sel && sel.x === s.x && sel.y === s.y ? null : { x: s.x, y: s.y }; sync();
  };
  boardEl.addEventListener('pointerup', up); boardEl.addEventListener('pointercancel', () => { start = null; for (const e of els.values()) e.classList.remove('press'); });
  let alive = true;
  drawCells(); sync(); hud();
  // açılış: şekerler sırayla yağar
  for (const e of els.values()) { const y = +e.dataset.y, x = +e.dataset.x; e.classList.add('intro'); e.style.animationDelay = `${(N - y) * 35 + x * 12}ms`; }
  setTimeout(() => { for (const e of els.values()) { e.classList.remove('intro'); e.style.animationDelay = ''; } }, 900);
  return () => { done = true; alive = false; };
}
