// Sudoku: bölüm tohumundan çözülmüş tablo üretilir, tek çözümü koruyarak hücreler silinir.
// Zorluk: ipucu sayısı 36'dan (orta) 24'e iner. 3 hata hakkı.
import { shuffle } from './hub.js';

function solved(r) {
  const g = Array(81).fill(0);
  const ok = (i, v) => { const R = Math.floor(i / 9), C = i % 9; for (let k = 0; k < 9; k++) { if (g[R * 9 + k] === v || g[k * 9 + C] === v) return false; } const br = R - R % 3, bc = C - C % 3; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) if (g[(br + a) * 9 + bc + b] === v) return false; return true; };
  const fill = i => { if (i === 81) return true; for (const v of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], r)) { if (ok(i, v)) { g[i] = v; if (fill(i + 1)) return true; g[i] = 0; } } return false; };
  fill(0); return g;
}
function countSolutions(g, limit = 2) {
  g = g.slice(); let n = 0;
  const cand = i => { const R = Math.floor(i / 9), C = i % 9, used = new Set(); for (let k = 0; k < 9; k++) { used.add(g[R * 9 + k]); used.add(g[k * 9 + C]); } const br = R - R % 3, bc = C - C % 3; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) used.add(g[(br + a) * 9 + bc + b]); return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(v => !used.has(v)); };
  const rec = () => {
    if (n >= limit) return;
    let best = -1, bc = null;
    for (let i = 0; i < 81; i++) if (!g[i]) { const c = cand(i); if (!c.length) return; if (!bc || c.length < bc.length) { best = i; bc = c; if (c.length === 1) break; } }
    if (best < 0) { n++; return; }
    for (const v of bc) { g[best] = v; rec(); g[best] = 0; if (n >= limit) return; }
  };
  rec(); return n;
}
export function makePuzzle(r, d) {
  const sol = solved(r), puz = sol.slice();
  const target = Math.round(36 - (d - 0.4) / 0.6 * 12); // 36 → 24 ipucu
  let clues = 81;
  for (const i of shuffle([...Array(81).keys()], r)) {
    if (clues <= target) break;
    const v = puz[i]; puz[i] = 0;
    if (countSolutions(puz) !== 1) puz[i] = v; else clues--;
  }
  return { sol, puz };
}

export function mount(el, ctx) {
  const { sol, puz } = makePuzzle(ctx.rng, ctx.d); ctx.dbg?.({ sol, puz });
  const cur = puz.slice(), notes = Array.from({ length: 81 }, () => new Set());
  let sel = cur.findIndex(v => !v), mistakes = 0, noteMode = false;
  const MAX = 3;
  el.innerHTML = `<div class="sd"><div class="sd-info"><span id="sdMiss">Hata: 0 / ${MAX}</span><button class="gm-chip" id="sdNote">✎ Not</button></div><div class="sd-grid" id="sdGrid"></div><div class="sd-pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-n="${n}">${n}</button>`).join('')}<button data-n="0">⌫</button></div></div>`;
  const grid = el.querySelector('#sdGrid');
  function draw() {
    const sv = cur[sel];
    grid.innerHTML = cur.map((v, i) => {
      const R = Math.floor(i / 9), C = i % 9, sR = Math.floor(sel / 9), sC = sel % 9;
      const peer = i !== sel && (R === sR || C === sC || (Math.floor(R / 3) === Math.floor(sR / 3) && Math.floor(C / 3) === Math.floor(sC / 3)));
      const cls = ['sd-c', puz[i] ? 'given' : '', i === sel ? 'sel' : '', peer ? 'peer' : '', v && sv && v === sv && i !== sel ? 'same' : '', v && !puz[i] && v !== sol[i] ? 'bad' : '', C % 3 === 2 && C < 8 ? 'br' : '', R % 3 === 2 && R < 8 ? 'bb' : ''].filter(Boolean).join(' ');
      const inner = v ? v : notes[i].size ? `<span class="sd-n">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<i>${notes[i].has(n) ? n : ''}</i>`).join('')}</span>` : '';
      return `<button class="${cls}" data-i="${i}">${inner}</button>`;
    }).join('');
    el.querySelector('#sdMiss').textContent = `Hata: ${mistakes} / ${MAX}`;
    el.querySelector('#sdNote').classList.toggle('on', noteMode);
  }
  function put(n) {
    if (sel < 0 || puz[sel]) return;
    if (n === 0) { cur[sel] = 0; notes[sel].clear(); draw(); return; }
    if (noteMode) { notes[sel].has(n) ? notes[sel].delete(n) : notes[sel].add(n); draw(); return; }
    cur[sel] = n; notes[sel].clear();
    if (n !== sol[sel]) { mistakes++; draw(); if (mistakes >= MAX) setTimeout(() => ctx.lose('Üç hata yaptın.'), 400); return; }
    // aynı satır/sütun/kutudaki notlardan sil
    const R = Math.floor(sel / 9), C = sel % 9;
    for (let i = 0; i < 81; i++) { const r2 = Math.floor(i / 9), c2 = i % 9; if (r2 === R || c2 === C || (Math.floor(r2 / 3) === Math.floor(R / 3) && Math.floor(c2 / 3) === Math.floor(C / 3))) notes[i].delete(n); }
    draw();
    if (cur.every((v, i) => v === sol[i])) setTimeout(() => ctx.win(mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1), 300);
  }
  el.addEventListener('click', e => {
    const c = e.target.closest('[data-i]'); if (c) { sel = +c.dataset.i; draw(); return; }
    const n = e.target.closest('[data-n]'); if (n) { put(+n.dataset.n); return; }
    if (e.target.closest('#sdNote')) { noteMode = !noteMode; draw(); }
  });
  const key = e => {
    if (/^[1-9]$/.test(e.key)) put(+e.key);
    else if (e.key === 'Backspace' || e.key === 'Delete') put(0);
    else if (e.key.startsWith('Arrow')) { const R = Math.floor(sel / 9), C = sel % 9; const d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key]; sel = ((R + d[0] + 9) % 9) * 9 + (C + d[1] + 9) % 9; draw(); }
  };
  document.addEventListener('keydown', key);
  draw();
  return () => document.removeEventListener('keydown', key);
}
