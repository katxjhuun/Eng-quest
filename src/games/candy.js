// Şeker (match-3): bölümler tamamen rastgele üretilir. Hedef türleri: puan, renk toplama, jöle temizleme.
// Zorluk: renk sayısı, tahta boyutu, hedef miktarı artar; hamle sayısı azalır; ileri bölümlerde çift kat jöle.
// 4'lü eşleşme şeritli şeker (satır/sütun temizler), 5'li eşleşme renk bombası üretir.
const SHAPES = [
  { c: '#E5534B', s: '<circle cx="20" cy="20" r="14"/>' },
  { c: '#F0A04B', s: '<rect x="7" y="7" width="26" height="26" rx="6"/>' },
  { c: '#E9C23C', s: '<path d="M20 5l15 15-15 15L5 20z"/>' },
  { c: '#6FB36A', s: '<path d="M20 6l15 27H5z"/>' },
  { c: '#5B8FD0', s: '<path d="M20 5l13 7.5v15L20 35 7 27.5v-15z"/>' },
  { c: '#9A7BD0', s: '<path d="M20 4l4.7 10 10.8 1.2-8 7.4 2.3 10.7L20 27.8 10.2 33.3l2.3-10.7-8-7.4L15.3 14z"/>' },
];
const svgOf = (k, sp) => `<svg viewBox="0 0 40 40"><g fill="${SHAPES[k].c}" stroke="#0002" stroke-width="1.2">${SHAPES[k].s}</g>${sp === 'h' ? '<path d="M6 20h28" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M6 15h28M6 25h28" stroke="#fff" stroke-width="1.6" opacity=".7"/>' : sp === 'v' ? '<path d="M20 6v28" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M15 6v28M25 6v28" stroke="#fff" stroke-width="1.6" opacity=".7"/>' : '<ellipse cx="15" cy="13" rx="5" ry="3" fill="#fff" opacity=".45"/>'}</svg>`;
const BOMB = '<svg viewBox="0 0 40 40"><circle cx="20" cy="22" r="13" fill="#2a2430"/><circle cx="16" cy="18" r="3" fill="#fff" opacity=".5"/><path d="M26 11l5-5" stroke="#E9C23C" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="22" r="13" fill="none" stroke="url(#rb)" stroke-width="3"/><defs><linearGradient id="rb"><stop offset="0" stop-color="#E5534B"/><stop offset=".5" stop-color="#6FB36A"/><stop offset="1" stop-color="#5B8FD0"/></linearGradient></defs></svg>';
const wait = ms => new Promise(r => setTimeout(r, ms));

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
  let score = 0, busy = false, sel = null, done = false;
  const got = {};
  const rnd = () => Math.floor(rng() * K);
  const B = Array.from({ length: N }, () => Array(N).fill(null));
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { let k; do k = rnd(); while ((x >= 2 && B[y][x - 1].k === k && B[y][x - 2].k === k) || (y >= 2 && B[y - 1][x].k === k && B[y - 2][x].k === k)); B[y][x] = { k, sp: '', id: Math.random() }; }

  el.innerHTML = `<div class="cd"><div class="cd-bar"><div><small>Hamle</small><b id="cdMoves">${moves}</b></div><div class="cd-goal" id="cdGoal"></div><div><small>Puan</small><b id="cdScore">0</b></div></div><div class="cd-board" id="cdBoard" style="--n:${N}"></div></div>`;
  const boardEl = el.querySelector('#cdBoard');
  function goalHTML() {
    if (goal.type === 'score') return `<small>Hedef puan</small><b>${Math.min(score, goal.target)} / ${goal.target}</b>`;
    if (goal.type === 'collect') return `<small>Topla</small><b>${Object.entries(goal.need).map(([k, n]) => `<span class="cd-gi">${svgOf(+k)}${Math.max(0, n - (got[k] | 0))}</span>`).join('')}</b>`;
    const left = jelly.flat().reduce((s, v) => s + v, 0); return `<small>Jöle</small><b>${left}</b>`;
  }
  function render(fall = {}) {
    let h = '';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const c = B[y][x]; const j = jelly[y][x];
      h += `<div class="cd-cell${j ? ` jelly j${j}` : ''}" data-x="${x}" data-y="${y}">${c ? `<div class="cd-p${sel && sel.x === x && sel.y === y ? ' sel' : ''}${c.pop ? ' pop' : ''}" style="${fall[c.id] ? `--fall:${fall[c.id]}` : ''}">${c.sp === 'b' ? BOMB : svgOf(c.k, c.sp)}</div>` : ''}</div>`;
    }
    boardEl.innerHTML = h;
    el.querySelector('#cdMoves').textContent = moves; el.querySelector('#cdScore').textContent = score; el.querySelector('#cdGoal').innerHTML = goalHTML();
  }
  function findMatches() {
    const runs = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N;) { const k = B[y][x]?.sp === 'b' ? -1 : B[y][x]?.k; let e = x + 1; while (e < N && k >= 0 && B[y][e]?.sp !== 'b' && B[y][e]?.k === k) e++; if (e - x >= 3) runs.push({ cells: Array.from({ length: e - x }, (_, i) => [x + i, y]), dir: 'h' }); x = e; }
    for (let x = 0; x < N; x++) for (let y = 0; y < N;) { const k = B[y][x]?.sp === 'b' ? -1 : B[y][x]?.k; let e = y + 1; while (e < N && k >= 0 && B[e][x]?.sp !== 'b' && B[e][x]?.k === k) e++; if (e - y >= 3) runs.push({ cells: Array.from({ length: e - y }, (_, i) => [x, y + i]), dir: 'v' }); y = e; }
    return runs;
  }
  function clearCell(x, y, set) {
    const k = `${x},${y}`; if (set.has(k) || !B[y][x]) return; set.add(k);
    const c = B[y][x];
    if (c.sp === 'h') for (let i = 0; i < N; i++) clearCell(i, y, set);
    if (c.sp === 'v') for (let i = 0; i < N; i++) clearCell(x, i, set);
    if (c.sp === 'b') { const t = Math.floor(rng() * K); for (let yy = 0; yy < N; yy++) for (let xx = 0; xx < N; xx++) if (B[yy][xx]?.k === t) clearCell(xx, yy, set); }
  }
  async function resolve(swapAt) {
    let combo = 0;
    for (;;) {
      const runs = findMatches(); if (!runs.length) break;
      combo++;
      const set = new Set(), makes = [];
      for (const r of runs) {
        for (const [x, y] of r.cells) clearCell(x, y, set);
        if (r.cells.length >= 4) {
          const at = (swapAt && r.cells.find(([x, y]) => (x === swapAt[0].x && y === swapAt[0].y) || (x === swapAt[1].x && y === swapAt[1].y))) || r.cells[Math.floor(r.cells.length / 2)];
          makes.push({ x: at[0], y: at[1], k: B[at[1]][at[0]].k, sp: r.cells.length >= 5 ? 'b' : (r.dir === 'h' ? 'v' : 'h') });
        }
      }
      for (const key of set) { const [x, y] = key.split(',').map(Number); const c = B[y][x]; c.pop = true; got[c.k] = (got[c.k] | 0) + 1; if (jelly[y][x]) jelly[y][x]--; }
      score += set.size * 20 * combo + makes.length * 60;
      render(); await wait(230);
      for (const key of set) { const [x, y] = key.split(',').map(Number); B[y][x] = null; }
      for (const m of makes) B[m.y][m.x] = { k: m.k, sp: m.sp, id: Math.random() };
      // yerçekimi ve doldurma
      const fall = {};
      for (let x = 0; x < N; x++) {
        let w = N - 1;
        for (let y = N - 1; y >= 0; y--) if (B[y][x]) { if (w !== y) { B[w][x] = B[y][x]; B[y][x] = null; fall[B[w][x].id] = w - y; } w--; }
        for (let y = w; y >= 0; y--) { B[y][x] = { k: rnd(), sp: '', id: Math.random() }; fall[B[y][x].id] = w + 1; }
      }
      render(fall); await wait(260); swapAt = null;
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
    if (A.sp === 'b' || Bc.sp === 'b') {
      const bomb = A.sp === 'b' ? b : a, other = A.sp === 'b' ? Bc : A, bombAt = A.sp === 'b' ? b : a;
      const set = new Set(); set.add(`${bombAt.x},${bombAt.y}`);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (B[y][x]?.k === other.k && B[y][x].sp !== 'b') clearCell(x, y, set);
      void bomb;
      for (const key of set) { const [x, y] = key.split(',').map(Number); const c = B[y][x]; c.pop = true; got[c.k] = (got[c.k] | 0) + 1; if (jelly[y][x]) jelly[y][x]--; }
      score += set.size * 30; render(); await wait(260);
      for (const key of set) { const [x, y] = key.split(',').map(Number); B[y][x] = null; }
      const fall = {};
      for (let x = 0; x < N; x++) { let w = N - 1; for (let y = N - 1; y >= 0; y--) if (B[y][x]) { if (w !== y) { B[w][x] = B[y][x]; B[y][x] = null; fall[B[w][x].id] = w - y; } w--; } for (let y = w; y >= 0; y--) { B[y][x] = { k: rnd(), sp: '', id: Math.random() }; fall[B[y][x].id] = w + 1; } }
      render(fall); await wait(260);
      moves--; await resolve(null);
    } else if (findMatches().length) { moves--; await resolve([a, b]); }
    else { [B[a.y][a.x], B[b.y][b.x]] = [A, Bc]; render(); boardEl.classList.add('nope'); setTimeout(() => boardEl.classList.remove('nope'), 300); busy = false; return; }
    if (!hasMove()) { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (B[y][x].sp !== 'b') B[y][x].k = rnd(); await resolve(null); ctx.toast('Hamle kalmadı, tahta karıştırıldı.'); }
    render(); busy = false;
    if (goalDone()) { done = true; const total = Math.round(30 - (d - 0.4) / 0.6 * 12); const ratio = moves / total; setTimeout(() => ctx.win(ratio >= 0.3 ? 3 : ratio >= 0.12 ? 2 : 1, `${moves} hamle arttı, ${score} puan.`), 300); }
    else if (moves <= 0) { done = true; setTimeout(() => ctx.lose('Hamlelerin bitti.'), 300); }
  }
  // dokun-dokun ya da kaydır
  let start = null;
  boardEl.addEventListener('pointerdown', e => { const c = e.target.closest('.cd-cell'); if (!c) return; start = { x: +c.dataset.x, y: +c.dataset.y, px: e.clientX, py: e.clientY }; });
  boardEl.addEventListener('pointerup', e => {
    if (!start) return;
    const dx = e.clientX - start.px, dy = e.clientY - start.py, s = start; start = null;
    if (Math.hypot(dx, dy) > 18) { const t = Math.abs(dx) > Math.abs(dy) ? { x: s.x + Math.sign(dx), y: s.y } : { x: s.x, y: s.y + Math.sign(dy) }; if (t.x >= 0 && t.y >= 0 && t.x < N && t.y < N) trySwap(s, t); return; }
    if (sel && Math.abs(sel.x - s.x) + Math.abs(sel.y - s.y) === 1) { trySwap(sel, s); return; }
    sel = sel && sel.x === s.x && sel.y === s.y ? null : { x: s.x, y: s.y }; render();
  });
  render();
  return () => { done = true; };
}
