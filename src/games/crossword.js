// İç içe geçen bulmaca yerleşimi: kelimeler ortak harflerden kesiştirilerek ızgaraya yerleştirilir.
import { letters } from './lexicon.js';

export function layout(words, rng, maxSize = 12) {
  const grid = new Map(); // "x,y" → harf
  const placed = [];
  const get = (x, y) => grid.get(`${x},${y}`);
  const bounds = () => { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const k of grid.keys()) { const [x, y] = k.split(',').map(Number); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return { x0, y0, x1, y1 }; };
  function fits(L, x, y, dir) {
    const dx = dir === 'h' ? 1 : 0, dy = dir === 'h' ? 0 : 1;
    if (get(x - dx, y - dy) || get(x + dx * L.length, y + dy * L.length)) return -1;
    let cross = 0;
    for (let i = 0; i < L.length; i++) {
      const cx = x + dx * i, cy = y + dy * i, c = get(cx, cy);
      if (c) { if (c !== L[i]) return -1; cross++; continue; }
      // yan komşular boş olmalı (yalnızca kesişimde dolu olabilir)
      if (get(cx + dy, cy + dx) || get(cx - dy, cy - dx)) return -1;
    }
    if (grid.size) {
      const b = bounds();
      const nx0 = Math.min(b.x0, x), ny0 = Math.min(b.y0, y), nx1 = Math.max(b.x1, x + dx * (L.length - 1)), ny1 = Math.max(b.y1, y + dy * (L.length - 1));
      if (nx1 - nx0 + 1 > maxSize || ny1 - ny0 + 1 > maxSize) return -1;
    }
    return cross;
  }
  function put(w, L, x, y, dir) {
    const dx = dir === 'h' ? 1 : 0, dy = dir === 'h' ? 0 : 1, cells = [];
    for (let i = 0; i < L.length; i++) { grid.set(`${x + dx * i},${y + dy * i}`, L[i]); cells.push([x + dx * i, y + dy * i]); }
    placed.push({ w, x, y, dir, cells });
  }
  const list = words.slice().sort((a, b) => letters(b).length - letters(a).length);
  for (const w of list) {
    const L = letters(w);
    if (!placed.length) { put(w, L, 0, 0, 'h'); continue; }
    let best = null;
    for (const p of placed) for (let i = 0; i < p.cells.length; i++) {
      const [px, py] = p.cells[i], ch = grid.get(`${px},${py}`);
      for (let j = 0; j < L.length; j++) {
        if (L[j] !== ch) continue;
        const dir = p.dir === 'h' ? 'v' : 'h';
        const x = dir === 'h' ? px - j : px, y = dir === 'h' ? py : py - j;
        const c = fits(L, x, y, dir);
        if (c > 0) { const sc = c + rng() * 0.9; if (!best || sc > best.sc) best = { sc, x, y, dir }; }
      }
    }
    if (best) put(w, L, best.x, best.y, best.dir);
  }
  const b = bounds();
  for (const p of placed) { p.x -= b.x0; p.y -= b.y0; p.cells = p.cells.map(([x, y]) => [x - b.x0, y - b.y0]); }
  const cells = new Map(); for (const [k, v] of grid) { const [x, y] = k.split(',').map(Number); cells.set(`${x - b.x0},${y - b.y0}`, v); }
  return { w: b.x1 - b.x0 + 1, h: b.y1 - b.y0 + 1, cells, words: placed };
}
