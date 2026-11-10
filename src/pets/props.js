// Sahne eşyaları: animasyonların içinde görünen küçük nesneler (mama kabı, kemik, lazer noktası, yağmur bulutu…).
// Her eşya { type, x, y, s, a, t, ... } — viewBox (0..120) koordinatlarında, yön çevrilmesinden sonra çizilir değil:
// gövdeyle birlikte döner (petin önündeki kap, ağzındaki kemik). Ekran sabiti olanlar (bulut) için fixed:true.
import { op } from './face.js';
import { r1, P, TAU } from './anim.js';

const F = c => ({ fill: c });
const S = (c, w) => ({ fill: 'none', stroke: c, 'stroke-width': r1(w), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
const tr = (x, y, a = 0, s = 1) => `translate(${r1(x)} ${r1(y)}) rotate(${r1(a)}) scale(${r1(s * 100) / 100})`;

// her eşya: (önek, eşya) → op listesi; grup olarak döner
const DRAW = {
  bowl(k, p) {
    const food = p.food || 'fish', fill = p.full ?? 1;
    const o = [op(k + 'b', 'path', { d: 'M-11 -6 L11 -6 L8.5 1 L-8.5 1 Z', ...F('#B5735F') }), op(k + 'r', 'path', { d: 'M-12 -6.5 L12 -6.5', ...S('#C48A78', 2.4) })];
    if (fill > 0.05) {
      const c = { fish: '#C9A27A', bone: '#B98B5E', seed: '#E6B54A', water: '#5BB4F0', plankton: '#7FD3C3' }[food] || '#C9A27A';
      o.push(op(k + 'f', 'ellipse', { cx: 0, cy: r1(-6.5 - 2 * fill), rx: r1(9.5), ry: r1(2.6 * fill + 0.6), ...F(c) }));
    }
    return o;
  },
  fish(k) {
    return [op(k + 'a', 'path', { d: 'M-7 0 C-4 -4.4 2 -4.6 5 0 C2 4.6 -4 4.4 -7 0 Z', ...F('#7D9BB3') }), op(k + 'b', 'path', { d: 'M5 0 L9.5 -3.6 L9.5 3.6 Z', ...F('#7D9BB3') }), op(k + 'e', 'circle', { cx: -3.6, cy: -0.8, r: 0.9, ...F('#1f2a3a') })];
  },
  bone(k) {
    const c = '#F3E6D2';
    return [op(k + 'a', 'rect', { x: -6.5, y: -1.7, width: 13, height: 3.4, ...F(c) }),
      ...[[-6.5, -1.9], [-6.5, 1.9], [6.5, -1.9], [6.5, 1.9]].map(([x, y], i) => op(k + 'e' + i, 'circle', { cx: x, cy: y, r: 2.3, ...F(c) }))];
  },
  laser(k, p) {
    const r = 2.2 + Math.sin((p.t || 0) * 30) * 0.4;
    return [op(k + 'g', 'circle', { cx: 0, cy: 0, r: r1(r * 2.6), ...F('#FF3B3B'), opacity: '.25' }), op(k + 'c', 'circle', { cx: 0, cy: 0, r: r1(r), ...F('#FF2D2D') }), op(k + 'h', 'circle', { cx: -0.6, cy: -0.6, r: r1(r * 0.35), ...F('#FFD0D0') })];
  },
  dirt(k, p) {
    // kazılan toprak yığını + uçuşan parçalar
    const h = p.h ?? 1, o = [op(k + 'm', 'path', { d: `M-14 0 Q0 ${r1(-9 * h)} 14 0 Z`, ...F('#8A6A4E') })];
    (p.bits || []).forEach((b, i) => o.push(op(k + 'p' + i, 'circle', { cx: r1(b[0]), cy: r1(b[1]), r: r1(b[2] || 1.6), ...F(i % 2 ? '#A5825F' : '#7B5B40') })));
    return o;
  },
  hole(k) { return [op(k + 'h', 'ellipse', { cx: 0, cy: 0, rx: 9, ry: 2.2, ...F('#5E4632') })]; },
  cloud(k, p) {
    const t = p.t || 0, o = [];
    for (let i = 0; i < 5; i++) {
      const x = -10 + i * 5, ph = (t * 2.4 + i * 0.37) % 1;
      o.push(op(k + 'r' + i, 'path', { d: `M${P(x, 6 + ph * 22)} l-1.2 ${r1(4)}`, ...S('#8DAFC4', 1.6), opacity: r1(1 - ph * 0.7) }));
    }
    o.push(op(k + 'c', 'path', { d: 'M-14 4 C-19 4 -19 -4 -13 -4 C-12 -10 -3 -11 0 -6 C3 -11 12 -9 12 -3 C18 -3 18 4 13 4 Z', ...F('#9AA3B2') }));
    return o;
  },
  halo(k) { return [op(k + 'h', 'ellipse', { cx: 0, cy: 0, rx: 10, ry: 2.8, ...S('#D9C08A', 2.2) })]; },
  spoon(k) {
    return [op(k + 'h', 'path', { d: 'M0 0 L0 22', ...S('#B9BEC8', 3) }), op(k + 'b', 'ellipse', { cx: 0, cy: -4, rx: 5.6, ry: 7.4, ...F('#CDD2DB') }), op(k + 'i', 'ellipse', { cx: -1.2, cy: -5, rx: 2, ry: 3.6, ...F('#E8EBF0') })];
  },
  flower(k, p) {
    const n = p.petals ?? 7, o = [op(k + 's', 'path', { d: 'M0 0 L0 14', ...S('#5C9A5A', 1.6) })];
    for (let i = 0; i < n; i++) { const a = i / 7 * 360; o.push(op(k + 'p' + i, 'ellipse', { cx: 0, cy: -4, rx: 1.8, ry: 3.6, transform: `rotate(${r1(a)})`, ...F('#FFFDF7') })); }
    o.push(op(k + 'c', 'circle', { cx: 0, cy: 0, r: 2.2, ...F('#F2BE45') }));
    return o;
  },
  petal(k, p) { return [op(k + 'p', 'ellipse', { cx: 0, cy: 0, rx: 1.6, ry: 3.2, ...F('#FFFDF7'), opacity: r1(p.o ?? 1) })]; },
  mirror(k, p) {
    return [op(k + 'f', 'rect', { x: -9, y: -15, width: 18, height: 30, rx: 3, ...F('#9DB8A8') }), op(k + 'g', 'rect', { x: -6.6, y: -12.6, width: 13.2, height: 25.2, rx: 1.6, ...F('#EAF6FF') }),
      op(k + 's', 'path', { d: 'M-4 -9 L1 -12 M-4 -4 L4 -9', ...S('#FFFFFF', 1.4), opacity: r1(0.6 + 0.4 * Math.sin((p.t || 0) * 8)) })];
  },
  heart(k, p) { return [op(k + 'h', 'path', { d: 'M0 4 C-7 -1 -3 -7 0 -3 C3 -7 7 -1 0 4 Z', ...F('#C97C86'), opacity: r1(p.o ?? 1) })]; },
  drop(k, p) { return [op(k + 'd', 'path', { d: 'M0 -4 C2.4 -0.6 3 1 3 2 A3 3 0 0 1 -3 2 C-3 1 -2.4 -0.6 0 -4 Z', ...F(p.c || '#8DAFC4'), opacity: r1(p.o ?? 1) })]; },
  sun(k, p) {
    const t = p.t || 0, o = [];
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t * 0.8; o.push(op(k + 'r' + i, 'path', { d: `M${P(Math.cos(a) * 8, Math.sin(a) * 8)} L${P(Math.cos(a) * 12, Math.sin(a) * 12)}`, ...S('#D9B866', 2) })); }
    o.push(op(k + 'c', 'circle', { cx: 0, cy: 0, r: 5.6, ...F('#DCC27A') }));
    return o;
  },
  spark(k, p) { const s = p.o ?? 1; return [op(k + 's', 'path', { d: 'M0 -4 C0.6 -1 1 -0.6 4 0 C1 0.6 0.6 1 0 4 C-0.6 1 -1 0.6 -4 0 C-1 -0.6 -0.6 -1 0 -4 Z', ...F(p.c || '#DCC27A'), opacity: r1(s) })]; },
  bubble(k, p) { return [op(k + 'b', 'circle', { cx: 0, cy: 0, r: r1(p.r || 4), ...S('#A9C6D6', 1.2), opacity: r1(p.o ?? 1) }), op(k + 'h', 'circle', { cx: r1(-(p.r || 4) * 0.35), cy: r1(-(p.r || 4) * 0.35), r: r1((p.r || 4) * 0.22), ...F('#FFFFFF'), opacity: r1((p.o ?? 1) * 0.9) })]; },
  weed(k, p) {
    const u = p.u ?? 0; // 0 gömülü → 1 çekildi
    return [op(k + 'r', 'path', { d: `M0 ${r1(4 - u * 2)} C-2 ${r1(8 - u * 2)} 2 ${r1(10 - u * 2)} -1 ${r1(12 - u * 3)}`, ...S('#B08A5E', 1.2), opacity: r1(u) }),
      op(k + 'l', 'path', { d: 'M0 4 C-5 0 -6 -6 -2 -9 C-1 -5 0 -2 0 4 Z M0 4 C5 0 6 -5 3 -8 C1.6 -4 0.6 -1 0 4 Z', ...F('#6E9E3E') })];
  },
  spine(k) { return [op(k + 's', 'path', { d: 'M-3 0 L3 0', ...S('#E8F2D8', 1.4) })]; },
  leaf(k, p) { return [op(k + 'l', 'path', { d: 'M0 0 C3 -4 9 -4 11 -1 C8 3 3 3 0 0 Z', ...F(p.c || '#7DBB72'), opacity: r1(p.o ?? 1) })]; },
  wave(k, p) {
    const u = p.u ?? 0, w = 10 + u * 30;
    return [op(k + 'w', 'path', { d: `M${r1(-w)} 0 C${r1(-w * 0.6)} ${r1(-10 * (1 - u * 0.6))} ${r1(-w * 0.2)} ${r1(-12 * (1 - u * 0.6))} 0 ${r1(-4 * (1 - u))} C${r1(w * 0.2)} ${r1(-12 * (1 - u * 0.6))} ${r1(w * 0.6)} ${r1(-10 * (1 - u * 0.6))} ${r1(w)} 0 Z`, ...F('#8DAFC4'), opacity: r1(0.85 * (1 - u * 0.8)) })];
  },
  // fincan (kedinin düşürdüğü, baykuşun kahvesi)
  mug(k, p) {
    const o = [op(k + 'b', 'path', { d: 'M-5 0 L-5.6 -9 L5.6 -9 L5 0 Z', ...F(p.c || '#C9B9A6') }), op(k + 'h', 'path', { d: 'M5.4 -7 C9 -7 9 -2.4 5.2 -2.4', ...S(p.c || '#C9B9A6', 1.6) }), op(k + 'r', 'path', { d: 'M-5.6 -9 L5.6 -9', ...S('#9E8E7C', 1.2) })];
    if (p.steam) for (let i = 0; i < 2; i++) { const q = ((p.t || 0) * 0.8 + i * 0.5) % 1; o.push(op(k + 's' + i, 'path', { d: `M${r1(-1.5 + i * 3)} ${r1(-11 - q * 8)} q1.4 -2 0 -4`, ...S('#B9B1A8', 1), opacity: r1(1 - q) })); }
    return o;
  },
  spill(k) { return [op(k + 's', 'ellipse', { cx: 0, cy: 0, rx: 7, ry: 1.6, ...F('#6E5544'), opacity: '.55' })]; },
  bug(k, p) {
    const t = p.t || 0;
    return [op(k + 'b', 'ellipse', { cx: 0, cy: 0, rx: 2.6, ry: 1.7, ...F('#4A4038') }), op(k + 'w', 'path', { d: `M-1 -1 l${r1(-2 - Math.sin(t * 40))} -2.4 M1 -1 l${r1(2 + Math.sin(t * 40))} -2.4`, ...S('#9A928A', 0.8), opacity: '.8' })];
  },
  egg(k) { return [op(k + 'e', 'path', { d: 'M-8 0 L-6 -4 L-3 -1 L0 -5 L3 -1 L6 -4 L8 0 C8 6 4 9 0 9 C-4 9 -8 6 -8 0 Z', ...F('#F6EBD8') })]; },
};

export function propOps(list, prefix = 'pr') {
  const out = [];
  (list || []).forEach((p, i) => {
    const f = DRAW[p.type]; if (!f) return;
    const k = `${prefix}${i}${p.type}`;
    out.push({ k, t: 'g', a: { transform: tr(p.x, p.y, p.a || 0, p.s || 1), opacity: p.op != null ? r1(p.op) : null }, kids: f(k, p) });
  });
  return out;
}
