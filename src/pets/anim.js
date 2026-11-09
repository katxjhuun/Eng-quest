// Animasyon yardımcıları: yumuşatma eğrileri, anahtar kare izleri, poz harmanlama, yaylar.
// Pozlar düz nesnelerdir: sayısal kanallar harmanlanır, diğerleri (göz biçimi, eşyalar) yarıda el değiştirir.

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const TAU = Math.PI * 2;
export const rad = d => d * Math.PI / 180;

export const EASE = {
  lin: t => t,
  in: t => t * t,
  out: t => 1 - (1 - t) * (1 - t),
  io: t => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)),
  sine: t => 0.5 - 0.5 * Math.cos(Math.PI * t),
  in3: t => t * t * t,
  out3: t => 1 - (1 - t) ** 3,
  // hedefi aşıp geri oturur
  back: t => { const c = 1.9; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; },
  // önce geri çekilir, sonra atılır
  backIn: t => { const c = 1.7; return (c + 1) * t ** 3 - c * t * t; },
  elastic: t => (t <= 0 ? 0 : t >= 1 ? 1 : 2 ** (-9 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
  hold: () => 0,
};

// K(t, [[t0, v0], [t1, v1, 'ease'], ...]): t'ye göre anahtar kareler arasında değer.
// Her anahtarın yumuşatması, o anahtara VARAN parçaya uygulanır (varsayılan sine).
export function K(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      const u = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * (EASE[e || 'sine'] || EASE.sine)(u);
    }
  }
  return keys[keys.length - 1][1];
}

// bir aralığın içinde 0..1 ilerleme (dışında 0 veya 1)
export const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
// yumuşak tepe: a..b arasında 0→1→0
export const bump = (t, a, b) => { const u = seg(t, a, b); return Math.sin(u * Math.PI); };

// iki pozu harmanla
export function blend(a, b, t) {
  if (t >= 1) return { ...a, ...b };
  if (t <= 0) return { ...b, ...a, props: a.props };
  const o = { ...a };
  for (const k in b) {
    const va = a[k], vb = b[k];
    if (typeof vb === 'number' && typeof va === 'number') o[k] = va + (vb - va) * t;
    else if (va === undefined || t >= 0.5) o[k] = vb;
  }
  if (t >= 0.5) o.props = b.props; else o.props = a.props;
  return o;
}

// sönümlü yay: hedefi gecikmeyle izler, biraz salınır (kuyruk, kulak, yaprak)
export class Spring {
  constructor(k = 160, d = 13) { this.k = k; this.d = d; this.x = null; this.v = 0; }
  step(target, dt) {
    if (this.x === null) { this.x = target; return target; }
    // büyük adımda kararlı kalsın diye alt adımlara böl
    const n = Math.max(1, Math.ceil(dt / 0.012)), h = dt / n;
    for (let i = 0; i < n; i++) {
      const a = this.k * (target - this.x) - this.d * this.v;
      this.v += a * h; this.x += this.v * h;
    }
    return this.x;
  }
  kick(v) { this.v += v; }
  reset() { this.x = null; this.v = 0; }
}

// tekrarlamayan yumuşak dalgalanma (boşta salınım için)
export const wob = (t, s = 0) => Math.sin(t * 1.3 + s) * 0.55 + Math.sin(t * 2.1 + s * 1.7) * 0.3 + Math.sin(t * 0.7 + s * 2.9) * 0.15;

// tohumdan kararlı rastgele sayı
export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967296;
}

// sayıları kısalt (SVG metnini küçük tutar)
export const r1 = v => Math.round(v * 10) / 10;
export const P = (x, y) => `${r1(x)} ${r1(y)}`;

// noktalar arasından yumuşak eğri (Catmull-Rom → kübik Bézier)
export function smoothPath(pts, closed = false) {
  if (pts.length < 2) return '';
  let d = `M${P(pts[0][0], pts[0][1])}`;
  const n = pts.length;
  const get = i => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${P(c1[0], c1[1])} ${P(c2[0], c2[1])} ${P(p2[0], p2[1])}`;
  }
  return d + (closed ? ' Z' : '');
}

// iki kemikli ters kinematik: omuz S, ayak hedefi F, uzunluklar a, b; bend=+1/-1 dizin yönü
export function ik(S, F, a, b, bend = -1) {
  let dx = F[0] - S[0], dy = F[1] - S[1];
  let d = Math.hypot(dx, dy) || 0.001;
  const max = (a + b) * 0.999;
  if (d > max) { F = [S[0] + dx / d * max, S[1] + dy / d * max]; dx = F[0] - S[0]; dy = F[1] - S[1]; d = max; }
  const min = Math.abs(a - b) + 0.5;
  if (d < min) d = min;
  const ca = clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1);
  const ang = Math.atan2(dy, dx) + bend * Math.acos(ca);
  return { knee: [S[0] + Math.cos(ang) * a, S[1] + Math.sin(ang) * a], foot: F };
}

// renk yardımcıları
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgb2hex(r, g, b) { return '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
export function shade(h, k) {
  const [r, g, b] = hex2rgb(h);
  return k < 0 ? rgb2hex(r * (1 + k), g * (1 + k), b * (1 + k)) : rgb2hex(r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k);
}
export function lum(h) {
  const [r, g, b] = hex2rgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function mix(a, b, t) { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)); }
