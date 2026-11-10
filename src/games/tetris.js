// Tetris: bölüm hedefi belli sayıda satır temizlemek. Zorluk: düşme hızı ve hedef satır sayısı artar,
// ileri bölümlerde tahta altında hazır çöp satırlarla başlanır. Dokunmatik düğmeler, kaydırma ve klavye desteklenir.
const W = 10, H = 20;
const SHAPES = {
  I: [[0, 1], [1, 1], [2, 1], [3, 1]], O: [[1, 0], [2, 0], [1, 1], [2, 1]], T: [[1, 0], [0, 1], [1, 1], [2, 1]],
  S: [[1, 0], [2, 0], [0, 1], [1, 1]], Z: [[0, 0], [1, 0], [1, 1], [2, 1]], J: [[0, 0], [0, 1], [1, 1], [2, 1]], L: [[2, 0], [0, 1], [1, 1], [2, 1]],
};
const COLORS = { I: '#5BB8C9', O: '#E9C23C', T: '#9A7BD0', S: '#6FB36A', Z: '#E0705A', J: '#5B7FD0', L: '#E99A45', G: '#8f8794' };

export function mount(el, ctx) {
  const { d, rng } = ctx;
  const goal = Math.round(10 + (d - 0.4) / 0.6 * 20);              // 10 → 30 satır
  const baseDrop = Math.round(700 - (d - 0.4) / 0.6 * 520);          // 700 ms → 180 ms
  const garbage = Math.max(0, Math.round((d - 0.55) / 0.45 * 8));    // ileri bölümlerde 0 → 8 çöp satır
  const board = Array.from({ length: H }, () => Array(W).fill(''));
  for (let y = H - garbage; y < H; y++) { const hole = Math.floor(rng() * W); for (let x = 0; x < W; x++) board[y][x] = x === hole ? '' : 'G'; }
  let bag = [], piece = null, next = null, lines = 0, score = 0, over = false, last = 0, acc = 0, raf = 0, paused = false;
  const draw7 = () => { if (!bag.length) bag = Object.keys(SHAPES).sort(() => rng() - 0.5); return bag.pop(); };
  const mk = t => ({ t, cells: SHAPES[t].map(c => c.slice()), x: 3, y: -1 });
  const pos = p => p.cells.map(([cx, cy]) => [cx + p.x, cy + p.y]);
  const fits = p => pos(p).every(([x, y]) => x >= 0 && x < W && y < H && (y < 0 || !board[y][x]));
  el.innerHTML = `<div class="tt"><div class="tt-side"><div><small>Satır</small><b id="ttLines">0 / ${goal}</b></div><div><small>Sıradaki</small><div class="tt-next" id="ttNext"></div></div><div><small>Puan</small><b id="ttScore">0</b></div></div>
    <canvas id="ttCv" width="${W * 24}" height="${H * 24}"></canvas>
    <div class="tt-pad"><button data-k="left">◀</button><button data-k="rot">⟳</button><button data-k="right">▶</button><button data-k="down">▼</button><button data-k="drop">⤓</button></div></div>`;
  const cv = el.querySelector('#ttCv'), g = cv.getContext('2d');
  function spawn() {
    piece = mk(next || draw7()); next = draw7();
    el.querySelector('#ttNext').innerHTML = `<svg viewBox="0 0 4 2" width="64" height="32">${SHAPES[next].map(([x, y]) => `<rect x="${x + .05}" y="${y + .05}" width=".9" height=".9" rx=".15" fill="${COLORS[next]}"/>`).join('')}</svg>`;
    if (!fits(piece)) { over = true; cancelAnimationFrame(raf); setTimeout(() => ctx.lose(`Bloklar tepeye ulaştı. ${lines} / ${goal} satır.`), 300); }
  }
  function rotate() {
    if (piece.t === 'O') return;
    const c = piece.cells, cx = piece.t === 'I' ? 1.5 : 1, cy = 1;
    const rot = { ...piece, cells: c.map(([x, y]) => [Math.round(cx - (y - cy)), Math.round(cy + (x - cx))]) };
    for (const k of [0, -1, 1, -2, 2]) { const t = { ...rot, x: piece.x + k }; if (fits(t)) { piece = t; return; } }
  }
  function lock() {
    for (const [x, y] of pos(piece)) { if (y < 0) { over = true; cancelAnimationFrame(raf); setTimeout(() => ctx.lose('Bloklar tepeye ulaştı.'), 300); return; } board[y][x] = piece.t; }
    let n = 0;
    for (let y = H - 1; y >= 0; y--) if (board[y].every(Boolean)) { board.splice(y, 1); board.unshift(Array(W).fill('')); n++; y++; }
    if (n) { lines += n; score += [0, 100, 300, 500, 800][n]; el.querySelector('#ttLines').textContent = `${Math.min(lines, goal)} / ${goal}`; el.querySelector('#ttScore').textContent = score; }
    if (lines >= goal) { over = true; cancelAnimationFrame(raf); setTimeout(() => ctx.win(score >= goal * 220 ? 3 : score >= goal * 140 ? 2 : 1, `${lines} satır, ${score} puan.`), 300); return; }
    spawn();
  }
  const move = (dx, dy) => { const t = { ...piece, x: piece.x + dx, y: piece.y + dy }; if (fits(t)) { piece = t; return true; } return false; };
  function act(k) {
    if (over || paused) return;
    if (k === 'left') move(-1, 0); else if (k === 'right') move(1, 0); else if (k === 'rot') rotate();
    else if (k === 'down') { if (!move(0, 1)) lock(); else score += 1; }
    else if (k === 'drop') { let n = 0; while (move(0, 1)) n++; score += n * 2; lock(); }
    render();
  }
  function render() {
    g.fillStyle = '#1f1b27'; g.fillRect(0, 0, cv.width, cv.height);
    const cell = (x, y, c, a = 1) => { g.globalAlpha = a; g.fillStyle = c; g.beginPath(); g.roundRect ? g.roundRect(x * 24 + 1, y * 24 + 1, 22, 22, 4) : g.rect(x * 24 + 1, y * 24 + 1, 22, 22); g.fill(); g.globalAlpha = 1; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (board[y][x]) cell(x, y, COLORS[board[y][x]]); else { g.fillStyle = '#26212f'; g.fillRect(x * 24 + 11, y * 24 + 11, 2, 2); }
    if (piece && !over) {
      const gh = { ...piece }; while (fits({ ...gh, y: gh.y + 1 })) gh.y++;
      for (const [x, y] of pos(gh)) if (y >= 0) cell(x, y, COLORS[piece.t], 0.22);
      for (const [x, y] of pos(piece)) if (y >= 0) cell(x, y, COLORS[piece.t]);
    }
  }
  function loop(ts) {
    raf = requestAnimationFrame(loop);
    if (paused || over) { last = ts; return; }
    acc += ts - (last || ts); last = ts;
    const interval = Math.max(90, baseDrop - Math.floor(lines / 10) * 40);
    if (acc >= interval) { acc = 0; if (!move(0, 1)) lock(); render(); }
  }
  const keys = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'rot', ArrowDown: 'down', ' ': 'drop', x: 'rot' };
  const onKey = e => { const k = keys[e.key]; if (k) { e.preventDefault(); act(k); } };
  document.addEventListener('keydown', onKey);
  // düğmeler: basılı tutunca tekrar eder
  let rep = null;
  el.querySelector('.tt-pad').addEventListener('pointerdown', e => { const b = e.target.closest('[data-k]'); if (!b) return; e.preventDefault(); act(b.dataset.k); if (['left', 'right', 'down'].includes(b.dataset.k)) { clearInterval(rep); rep = setInterval(() => act(b.dataset.k), 110); } });
  const stopRep = () => { clearInterval(rep); rep = null; };
  el.addEventListener('pointerup', stopRep); el.addEventListener('pointercancel', stopRep); el.addEventListener('pointerleave', stopRep);
  // tuvalde kaydırma: sola/sağa taşı, aşağı düşür, dokun döndür
  let sx = 0, sy = 0, moved = false;
  cv.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; moved = false; });
  cv.addEventListener('pointermove', e => { if (!e.buttons && e.pointerType === 'mouse') return; const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.abs(dx) > 22) { act(dx > 0 ? 'right' : 'left'); sx = e.clientX; moved = true; } else if (dy > 40) { act('down'); sy = e.clientY; moved = true; } });
  cv.addEventListener('pointerup', e => { if (!moved) act('rot'); if (e.clientY - sy > 120) act('drop'); });
  const vis = () => { paused = document.visibilityState === 'hidden'; };
  document.addEventListener('visibilitychange', vis);
  spawn(); render(); raf = requestAnimationFrame(loop);
  return () => { cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey); document.removeEventListener('visibilitychange', vis); clearInterval(rep); };
}
