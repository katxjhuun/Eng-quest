// Tetris: bölüm hedefi belli sayıda satır temizlemek. Zorluk: düşme hızı ve hedef satır sayısı artar,
// ileri bölümlerde tahta altında hazır çöp satırlarla başlanır.
// Tam ekran oynanır: skor, sıradaki parça ve düğmeler oyunun kendi çerçevesinin içindedir.
const W = 10, H = 20;
const SHAPES = {
  I: [[0, 1], [1, 1], [2, 1], [3, 1]], O: [[1, 0], [2, 0], [1, 1], [2, 1]], T: [[1, 0], [0, 1], [1, 1], [2, 1]],
  S: [[1, 0], [2, 0], [0, 1], [1, 1]], Z: [[0, 0], [1, 0], [1, 1], [2, 1]], J: [[0, 0], [0, 1], [1, 1], [2, 1]], L: [[2, 0], [0, 1], [1, 1], [2, 1]],
};
const COLORS = { I: '#4FC3D9', O: '#F2C744', T: '#A57FE0', S: '#6CC46A', Z: '#EF6A5A', J: '#5C86E0', L: '#F29A45', G: '#5d5566' };
const NAMES = ['', 'Tek', 'Çift', 'Üçlü', 'TETRİS!'];

const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const m = c => Math.max(0, Math.min(255, Math.round(f > 0 ? c + (255 - c) * f : c * (1 + f)))); return `rgb(${m(r)},${m(g)},${m(b)})`; };

export function mount(el, ctx) {
  const { d, rng } = ctx;
  ctx.fullscreen?.(true);
  const goal = Math.round(10 + (d - 0.4) / 0.6 * 20);              // 10 → 30 satır
  const baseDrop = Math.round(700 - (d - 0.4) / 0.6 * 520);          // 700 ms → 180 ms
  const garbage = Math.max(0, Math.round((d - 0.55) / 0.45 * 8));    // ileri bölümlerde 0 → 8 çöp satır
  const board = Array.from({ length: H }, () => Array(W).fill(''));
  for (let y = H - garbage; y < H; y++) { const hole = Math.floor(rng() * W); for (let x = 0; x < W; x++) board[y][x] = x === hole ? '' : 'G'; }
  let bag = [], piece = null, next = null, lines = 0, score = 0, over = false, last = 0, acc = 0, raf = 0, paused = false, hidden = false, clearing = null, lockFlash = null;
  const draw7 = () => { if (!bag.length) bag = Object.keys(SHAPES).sort(() => rng() - 0.5); return bag.pop(); };
  const mk = t => ({ t, cells: SHAPES[t].map(c => c.slice()), x: 3, y: -1 });
  const pos = p => p.cells.map(([cx, cy]) => [cx + p.x, cy + p.y]);
  const fits = p => pos(p).every(([x, y]) => x >= 0 && x < W && y < H && (y < 0 || !board[y][x]));
  const pieceSvg = t => `<svg viewBox="-.1 -.1 4.2 2.2">${SHAPES[t].map(([x, y]) => `<rect x="${x + .06}" y="${y + .06}" width=".88" height=".88" rx=".18" fill="${COLORS[t]}"/><rect x="${x + .2}" y="${y + .16}" width=".5" height=".14" rx=".07" fill="#fff" opacity=".35"/>`).join('')}</svg>`;

  el.innerHTML = `<div class="tt"><div class="tt-frame">
    <div class="tt-hud">
      <div class="tt-hbtns"><button class="tt-ic" id="ttExit" aria-label="Oyunlardan çık">✕</button><button class="tt-ic" id="ttPause" aria-label="Duraklat">❚❚</button></div>
      <div class="tt-goal"><div class="tt-lbl">Bölüm ${ctx.level} · <b id="ttLines">0</b> / ${goal} satır</div><div class="tt-bar"><i id="ttBar"></i></div></div>
      <div class="tt-box"><span class="tt-lbl">Sıradaki</span><div class="tt-next" id="ttNext"></div></div>
      <div class="tt-box"><span class="tt-lbl">Puan</span><b id="ttScore">0</b></div>
    </div>
    <div class="tt-well" id="ttWell"><canvas id="ttCv"></canvas><div class="tt-fx" id="ttFx"></div><div class="tt-paused hidden" id="ttPaused"><b>Duraklatıldı</b><button class="primarybtn" id="ttResume">Devam et</button></div></div>
    <div class="tt-pad"><button data-k="left" aria-label="Sola">◀</button><button data-k="right" aria-label="Sağa">▶</button><button data-k="down" aria-label="Aşağı">▼</button><button data-k="rot" class="rot" aria-label="Döndür">⟳</button><button data-k="drop" class="drop" aria-label="Bırak">⤓</button></div>
  </div></div>`;
  const cv = el.querySelector('#ttCv'), g = cv.getContext('2d'), well = el.querySelector('#ttWell'), fx = el.querySelector('#ttFx');
  let S = 24; // kare boyutu (css px)
  function fit() {
    const r = well.getBoundingClientRect();
    S = Math.max(10, Math.floor(Math.min(r.width / W, r.height / H)));
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    cv.width = W * S * dpr; cv.height = H * S * dpr; cv.style.width = W * S + 'px'; cv.style.height = H * S + 'px';
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    fx.style.width = W * S + 'px'; fx.style.height = H * S + 'px';
    render();
  }
  function hud() {
    el.querySelector('#ttLines').textContent = Math.min(lines, goal);
    el.querySelector('#ttBar').style.width = Math.min(100, lines / goal * 100) + '%';
    const s = el.querySelector('#ttScore'); s.textContent = score;
  }
  function pop(text, cls, y) {
    const t = document.createElement('b'); t.className = 'tt-pop ' + (cls || ''); t.textContent = text; t.style.top = (y ?? H / 2) * S + 'px';
    fx.appendChild(t); setTimeout(() => t.remove(), 1200);
  }
  function spawn() {
    piece = mk(next || draw7()); next = draw7();
    const n = el.querySelector('#ttNext'); n.innerHTML = pieceSvg(next); n.classList.remove('in'); void n.offsetWidth; n.classList.add('in');
    if (!fits(piece)) gameOver();
  }
  function gameOver() {
    if (over) return; over = true;
    well.classList.add('dead'); render();
    setTimeout(() => ctx.lose(`Bloklar tepeye ulaştı. ${lines} / ${goal} satır.`), 900);
  }
  function rotate() {
    if (piece.t === 'O') return;
    const c = piece.cells, cx = piece.t === 'I' ? 1.5 : 1, cy = 1;
    const rot = { ...piece, cells: c.map(([x, y]) => [Math.round(cx - (y - cy)), Math.round(cy + (x - cx))]) };
    for (const k of [0, -1, 1, -2, 2]) { const t = { ...rot, x: piece.x + k }; if (fits(t)) { piece = t; return; } }
  }
  function lock(hard = 0) {
    for (const [x, y] of pos(piece)) { if (y < 0) { gameOver(); return; } board[y][x] = piece.t; }
    lockFlash = { cells: pos(piece), t: performance.now() };
    if (hard) { well.classList.remove('thud'); void well.offsetWidth; well.classList.add('thud'); }
    const full = []; for (let y = 0; y < H; y++) if (board[y].every(Boolean)) full.push(y);
    piece = null;
    if (full.length) {
      clearing = { rows: full, t: performance.now() };
      const n = full.length, add = [0, 100, 300, 500, 800][n];
      score += add; lines += n; hud();
      pop(`+${add}`, n === 4 ? 'tetris' : '', full[0] + n / 2);
      if (n >= 2) pop(NAMES[n], n === 4 ? 'tetris big' : 'big', full[0] - 1.5);
      for (const y of full) for (let x = 0; x < W; x++) spark(x, y, COLORS[board[y][x]] || '#fff');
      setTimeout(() => {
        for (const y of full.sort((a, b) => a - b)) { board.splice(y, 1); board.unshift(Array(W).fill('')); }
        clearing = null;
        if (lines >= goal) { win(); return; }
        spawn(); render();
      }, 300);
      return;
    }
    hud();
    spawn();
  }
  function spark(x, y, c) {
    const p = document.createElement('i'); p.className = 'tt-spark'; p.style.left = (x + 0.5) * S + 'px'; p.style.top = (y + 0.5) * S + 'px'; p.style.background = c;
    p.style.setProperty('--dx', (Math.random() - 0.5) * S * 4 + 'px'); p.style.setProperty('--dy', -(Math.random() * S * 3 + S) + 'px');
    fx.appendChild(p); setTimeout(() => p.remove(), 700);
  }
  function win() {
    over = true; well.classList.add('won'); render();
    setTimeout(() => ctx.win(score >= goal * 220 ? 3 : score >= goal * 140 ? 2 : 1, `${lines} satır, ${score} puan.`), 900);
  }
  const move = (dx, dy) => { const t = { ...piece, x: piece.x + dx, y: piece.y + dy }; if (fits(t)) { piece = t; return true; } return false; };
  function act(k) {
    if (over || paused || !piece || clearing) return;
    if (k === 'left') move(-1, 0); else if (k === 'right') move(1, 0); else if (k === 'rot') rotate();
    else if (k === 'down') { if (!move(0, 1)) lock(); else { score += 1; hud(); } acc = 0; }
    else if (k === 'drop') {
      const from = pos(piece); let n = 0; while (move(0, 1)) n++;
      score += n * 2;
      // düşüş izi
      const xs = from.map(([x]) => x), minX = Math.min(...xs), maxX = Math.max(...xs), y0 = Math.max(0, Math.min(...from.map(([, y]) => y)));
      const tr = document.createElement('i'); tr.className = 'tt-trail'; tr.style.left = minX * S + 'px'; tr.style.width = (maxX - minX + 1) * S + 'px'; tr.style.top = y0 * S + 'px'; tr.style.height = Math.max(1, n) * S + 'px'; tr.style.setProperty('--c', COLORS[piece.t]);
      fx.appendChild(tr); setTimeout(() => tr.remove(), 320);
      lock(1);
    }
    render();
  }
  function block(x, y, c, a = 1, s = S) {
    const px = x * s, py = y * s, r = Math.max(2, s * 0.18);
    g.globalAlpha = a;
    g.fillStyle = shade(c, -0.28); g.beginPath(); g.roundRect ? g.roundRect(px + 1, py + 1, s - 2, s - 2, r) : g.rect(px + 1, py + 1, s - 2, s - 2); g.fill();
    g.fillStyle = c; g.beginPath(); g.roundRect ? g.roundRect(px + 1, py + 1, s - 2, s - 4, r) : g.rect(px + 1, py + 1, s - 2, s - 4); g.fill();
    g.fillStyle = shade(c, 0.35); g.beginPath(); g.roundRect ? g.roundRect(px + s * 0.22, py + s * 0.16, s * 0.42, s * 0.13, s * 0.07) : g.rect(px + s * 0.22, py + s * 0.16, s * 0.42, s * 0.13); g.fill();
    g.globalAlpha = 1;
  }
  function render() {
    const now = performance.now();
    g.clearRect(0, 0, W * S, H * S);
    g.fillStyle = '#16121d'; g.fillRect(0, 0, W * S, H * S);
    g.strokeStyle = '#ffffff0b'; g.lineWidth = 1; g.beginPath();
    for (let x = 1; x < W; x++) { g.moveTo(x * S + 0.5, 0); g.lineTo(x * S + 0.5, H * S); }
    for (let y = 1; y < H; y++) { g.moveTo(0, y * S + 0.5); g.lineTo(W * S, y * S + 0.5); }
    g.stroke();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (board[y][x]) block(x, y, over && !well.classList.contains('won') ? '#5d5566' : COLORS[board[y][x]]);
    if (clearing) {
      const k = Math.min(1, (now - clearing.t) / 300);
      for (const y of clearing.rows) { g.fillStyle = `rgba(255,255,255,${0.85 * (1 - k)})`; g.fillRect(0, y * S, W * S, S); g.fillStyle = '#16121d'; const w = W * S * k; g.fillRect((W * S - w) / 2, y * S, w, S); }
    }
    if (lockFlash) {
      const k = (now - lockFlash.t) / 220;
      if (k >= 1) lockFlash = null; else { g.fillStyle = `rgba(255,255,255,${0.5 * (1 - k)})`; for (const [x, y] of lockFlash.cells) if (y >= 0) g.fillRect(x * S + 1, y * S + 1, S - 2, S - 2); }
    }
    if (piece && !over) {
      const gh = { ...piece }; while (fits({ ...gh, y: gh.y + 1 })) gh.y++;
      g.strokeStyle = COLORS[piece.t]; g.globalAlpha = 0.55; g.lineWidth = 2;
      for (const [x, y] of pos(gh)) if (y >= 0) { g.beginPath(); g.roundRect ? g.roundRect(x * S + 2, y * S + 2, S - 4, S - 4, 4) : g.rect(x * S + 2, y * S + 2, S - 4, S - 4); g.stroke(); }
      g.globalAlpha = 1;
      for (const [x, y] of pos(piece)) if (y >= 0) block(x, y, COLORS[piece.t]);
    }
  }
  function loop(ts) {
    raf = requestAnimationFrame(loop);
    if (paused || over || hidden) { last = ts; if (clearing || lockFlash) render(); return; }
    acc += ts - (last || ts); last = ts;
    const interval = Math.max(90, baseDrop - Math.floor(lines / 10) * 40);
    if (piece && !clearing && acc >= interval) { acc = 0; if (!move(0, 1)) lock(); }
    render();
  }
  const keys = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'rot', ArrowDown: 'down', ' ': 'drop', x: 'rot', p: 'pause', Escape: 'pause' };
  const onKey = e => { const k = keys[e.key]; if (!k) return; e.preventDefault(); e.stopImmediatePropagation(); if (k === 'pause') setPause(!paused); else act(k); };
  document.addEventListener('keydown', onKey, true);
  function setPause(v) { if (over) return; paused = v; el.querySelector('#ttPaused').classList.toggle('hidden', !v); el.querySelector('#ttPause').textContent = v ? '▶' : '❚❚'; }
  el.querySelector('#ttPause').addEventListener('click', () => setPause(!paused));
  el.querySelector('#ttResume').addEventListener('click', () => setPause(false));
  el.querySelector('#ttExit').addEventListener('click', () => ctx.exit?.());
  // düğmeler: basılı tutunca tekrar eder
  let rep = null, repT = null;
  const pad = el.querySelector('.tt-pad');
  pad.addEventListener('pointerdown', e => {
    const b = e.target.closest('[data-k]'); if (!b) return; e.preventDefault(); b.classList.add('on');
    act(b.dataset.k);
    if (['left', 'right', 'down'].includes(b.dataset.k)) { clearTimeout(repT); clearInterval(rep); repT = setTimeout(() => { rep = setInterval(() => act(b.dataset.k), b.dataset.k === 'down' ? 50 : 80); }, 170); }
  });
  const stopRep = () => { clearTimeout(repT); clearInterval(rep); rep = null; pad.querySelectorAll('.on').forEach(b => b.classList.remove('on')); };
  el.addEventListener('pointerup', stopRep); el.addEventListener('pointercancel', stopRep); pad.addEventListener('pointerleave', stopRep);
  // tahtada kaydırma: sola/sağa taşı, aşağı çek, hızlı aşağı fırlat = bırak, dokun = döndür
  let sx = 0, sy = 0, st = 0, moved = false, down = false;
  cv.addEventListener('pointerdown', e => { down = true; sx = e.clientX; sy = e.clientY; st = performance.now(); moved = false; cv.setPointerCapture?.(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.abs(dx) > S * 0.9) { act(dx > 0 ? 'right' : 'left'); sx = e.clientX; moved = true; } else if (dy > S * 1.2) { act('down'); sy = e.clientY; moved = true; } });
  cv.addEventListener('pointerup', e => { if (!down) return; down = false; const dy = e.clientY - sy, dt = performance.now() - st; if (!moved) act('rot'); else if (dy > S * 2 && dt < 260) act('drop'); });
  const vis = () => { hidden = document.visibilityState === 'hidden'; if (hidden) setPause(true); };
  document.addEventListener('visibilitychange', vis);
  const ro = new ResizeObserver(() => fit()); ro.observe(well);
  spawn(); hud(); fit(); raf = requestAnimationFrame(loop);
  return () => { over = true; cancelAnimationFrame(raf); ro.disconnect(); document.removeEventListener('keydown', onKey, true); document.removeEventListener('visibilitychange', vis); stopRep(); ctx.fullscreen?.(false); };
}
