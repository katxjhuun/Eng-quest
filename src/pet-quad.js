// dam-la kedi ve köpek hattı: yandan görünen, poz verebilen siluet karakterler.
// Görsel dil: düz renk gövde, ince yuvarlak bacaklar, beyaz "O" gözler, ağız yok (gerektiğinde küçük).
// Koordinatlar viewBox 0 0 120 120, zemin y=108, yüz sağa bakar (CSS scaleX ile çevrilir).

const G = 108;
const r1 = v => Math.round(v * 10) / 10;
const pt = p => `${r1(p[0])} ${r1(p[1])}`;
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];

function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgb2hex(r, g, b) { return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
export function shade(h, k) { const [r, g, b] = hex2rgb(h); return k < 0 ? rgb2hex(r * (1 + k), g * (1 + k), b * (1 + k)) : rgb2hex(r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k); }
function lum(h) { const [r, g, b] = hex2rgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }

// ------------------------------------------------------------ türlerin aşamaları
const CAT = [
  { name: 'kitten', k: 0.86, hs: 1.22, leg: 0.7, len: 0.66, th: 0.96, b: '#F2A14A', d: '#D97F2A', l: '#FFF1DE', ear: '#F7B9A8', tail: 'kit', nose: '#E07A6A', chest: true, sock: true },
  { name: 'tabby', k: 0.92, hs: 1.1, leg: 0.86, len: 0.86, th: 0.98, b: '#EE9A43', d: '#B9661E', l: '#FBE3C4', ear: '#F2B6A3', tail: 'long', nose: '#D9776A', stripes: true, chest: true },
  { name: 'lynx', k: 0.97, hs: 1.06, leg: 1.0, len: 0.92, th: 1.0, b: '#CDAA7E', d: '#4A3A2A', l: '#F1E3CC', ear: '#3A2E24', tail: 'bob', nose: '#B87566', tufts: true, ruff: true, dots: '#9C7A55' },
  { name: 'puma', k: 1.0, hs: 1.02, leg: 1.04, len: 1.06, th: 0.98, b: '#C98B4E', d: '#5E3E22', l: '#F0D9BB', ear: '#6A4A2E', tail: 'long', tip: '#4A3020', nose: '#A86A5A', muzzle: true },
  { name: 'leopard', k: 1.03, hs: 1.02, leg: 1.04, len: 1.12, th: 1.02, b: '#E6B44E', d: '#5A3E18', l: '#F8E6B8', ear: '#5A3E18', tail: 'long', nose: '#B8705A', rosettes: true, muzzle: true },
  { name: 'panther', k: 1.07, hs: 1.04, leg: 1.08, len: 1.16, th: 1.02, b: '#26222B', d: '#3A3541', l: '#26222B', ear: '#26222B', tail: 'long', eye: '#E9CF4E', ghost: true },
];
const DOG = [
  { name: 'puppy', k: 0.86, hs: 1.18, leg: 0.7, len: 0.68, th: 1.02, b: '#C98B55', d: '#8E5A30', l: '#F3DEC4', ears: 'floppy', tail: 'stub', nose: '#3a2a20', chest: true },
  { name: 'pup', k: 0.92, hs: 1.04, leg: 0.94, len: 0.88, th: 1.0, b: '#DDA35C', d: '#A8702F', l: '#F6E2C0', ears: 'mixed', tail: 'feather', nose: '#3a2a20' },
  { name: 'shepherd', k: 1.0, hs: 1.0, leg: 1.02, len: 1.0, th: 1.03, b: '#CF9256', d: '#2F2A2C', l: '#EED2A8', ears: 'pointy', earIn: '#3a3034', tail: 'brush', nose: '#2a2226', saddle: true, collar: '#D9534F', muzzleDark: true },
  { name: 'youngwolf', k: 1.0, hs: 0.97, leg: 1.04, len: 1.04, th: 1.0, b: '#9E9389', d: '#6E655D', l: '#E2DBD2', ears: 'pointy', earIn: '#6E655D', tail: 'bushy', nose: '#2a2226', wolf: true, eye: '#F2C14E' },
  { name: 'wolf', k: 1.06, hs: 0.98, leg: 1.08, len: 1.1, th: 1.04, b: '#7F8893', d: '#555F6B', l: '#E6E9ED', ears: 'pointy', earIn: '#555F6B', tail: 'bushy', nose: '#24262b', wolf: true, ruff: true, eye: '#F2C14E' },
  { name: 'alpha', k: 1.12, hs: 1.0, leg: 1.1, len: 1.14, th: 1.1, b: '#4C5560', d: '#343B45', l: '#D9DFE6', ears: 'pointy', earIn: '#343B45', tail: 'bushy', nose: '#1d1f24', wolf: true, ruff: true, mane: true, eye: '#F5C64E' },
];

// ------------------------------------------------------------ gövde
function bodyPath(C, rc, R, rr, sagTop = 0, sagBot = 0) {
  const dx = C[0] - R[0], dy = C[1] - R[1], L = Math.hypot(dx, dy) || 1;
  const n = [dy / L, -dx / L]; // yukarı normal
  const Ct = add(C, n, rc), Cb = add(C, n, -rc), Rt = add(R, n, rr), Rb = add(R, n, -rr);
  const Mt = add([(Ct[0] + Rt[0]) / 2, (Ct[1] + Rt[1]) / 2], n, sagTop);
  const Mb = add([(Cb[0] + Rb[0]) / 2, (Cb[1] + Rb[1]) / 2], n, -sagBot);
  return { d: `M${pt(Rt)} Q${pt(Mt)} ${pt(Ct)} A${r1(rc)} ${r1(rc)} 0 0 1 ${pt(Cb)} Q${pt(Mb)} ${pt(Rb)} A${r1(rr)} ${r1(rr)} 0 0 1 ${pt(Rt)} Z`, n, Ct, Rt, Cb, Rb, Mt };
}
const legPath = pts => `M${pt(pts[0])}` + (pts.length === 3 ? ` Q${pt(pts[1])} ${pt(pts[2])}` : pts.slice(1).map(p => ` L${pt(p)}`).join(''));

// ------------------------------------------------------------ pozlar
// her poz: C (göğüs), rc, R (kalça), rr, kafa {x,y,rot}, bacaklar, kuyruk {base, kind}, sırt eğriliği
function geom(s, pose, belly, isDog) {
  const legL = 21 * s.leg, lw = 6.4 * s.th, len = 29 * s.len;
  const rc = 13 * s.th * (1 + 0.18 * belly), rr = 12.3 * s.th * (1 + 0.12 * belly);
  const hs = s.hs;
  const g = { lw, rc, rr, sagTop: -1.2, sagBot: 1.5 + 4 * belly, neck: true, tailMood: 'rest', paws: [] };
  const groundY = G - lw / 2;
  const standLegs = (C, R, lift = 0) => {
    const kneeF = isDog ? 2 : 1.4;
    return [
      { far: true, pts: [[R[0] - 5, R[1] + 2], [R[0] - 8 + kneeF, (R[1] + G) / 2 + 2], [R[0] - 6.5, groundY - lift]] },
      { far: true, pts: [[C[0] - 4, C[1] + 2], [C[0] - 4, (C[1] + G) / 2], [C[0] - 3.5, groundY - lift]] },
      { far: false, pts: [[R[0] + 2, R[1] + 2], [R[0] - 2 + kneeF, (R[1] + G) / 2 + 3], [R[0], groundY - lift]], cls: 'hf' },
      { far: false, pts: [[C[0] + 3, C[1] + 2], [C[0] + 4, (C[1] + G) / 2], [C[0] + 4.5, groundY - lift]], cls: 'lf' },
    ];
  };
  const headStand = C => ({ x: C[0] + (isDog ? 9 : 6) * hs, y: C[1] - rc * 0.55 - (isDog ? 11 : 9.5) * hs, rot: 0 });
  switch (pose) {
    case 'sit': {
      const R = [55, G - rr * 1.02], C = [64, G - rr - 19 - 2 * s.leg];
      Object.assign(g, { C, R, rc: rc * 0.92, rr: rr * 1.08, sagTop: 1.5, sagBot: 2 + 3 * belly });
      g.legs = [
        { far: true, pts: [[C[0] - 1, C[1] + 2], [C[0] - 0.5, groundY]] },
        { far: false, pts: [[C[0] + 4, C[1] + 2], [C[0] + 5, groundY]], cls: 'lf' },
      ];
      g.paws = [[R[0] + 3, G - lw / 2, R[0] + 11, G - lw / 2]];
      g.haunch = [R[0] + 1, R[1] + 1, rr * 0.95, rr * 0.82];
      g.head = { x: C[0] + 5 * hs, y: C[1] - g.rc * 0.6 - 9 * hs, rot: 0 };
      g.tail = { base: [R[0] - rr * 0.95, G - 5], kind: 'sit' };
      break;
    }
    case 'loaf': case 'lie': case 'flat': {
      const big = 15.5 * s.th * (1 + 0.15 * belly);
      const R = [50, G - big + 1], C = [70, G - 10.5 * s.th - 0.5];
      Object.assign(g, { C, R, rc: 10.5 * s.th * (1 + 0.15 * belly), rr: big, sagTop: 2, sagBot: 0, neck: pose !== 'flat' });
      g.legs = [];
      g.paws = pose === 'flat' ? [[C[0] + 2, G - 3, C[0] + 14, G - 5], [R[0] - 6, G - 3, R[0] - 18, G - 5]] : [[C[0] + 4, G - lw / 2, C[0] + 13, G - lw / 2]];
      g.head = pose === 'loaf'
        ? { x: C[0] + 9 * hs, y: G - 11.5 * hs, rot: 0 }
        : pose === 'flat' ? { x: C[0] + 10 * hs, y: G - 9 * hs, rot: 12 } : { x: C[0] + 6 * hs, y: C[1] - 10 - 6 * hs, rot: -4 };
      g.tail = pose === 'flat' ? { base: [R[0] - big * 0.7, G - 5], kind: 'limp' } : { base: [R[0] - big * 0.55, G - 3], kind: 'wrap' };
      break;
    }
    case 'bow': {
      const R = [44, G - legL - rr * 0.6 - 6], C = [68, G - rc * 0.85 - 2];
      Object.assign(g, { C, R, rc: rc * 0.9, sagTop: 2, sagBot: 1 });
      g.legs = [
        { far: true, pts: [[R[0] - 5, R[1] + 2], [R[0] - 6, (R[1] + G) / 2], [R[0] - 6, groundY]] },
        { far: true, pts: [[C[0] + 1, C[1] + 3], [C[0] + 9, groundY - 0.5], [C[0] + 15, groundY]] },
        { far: false, pts: [[R[0] + 2, R[1] + 2], [R[0] + 1, (R[1] + G) / 2], [R[0] + 1, groundY]], cls: 'hf' },
        { far: false, pts: [[C[0] + 4, C[1] + 3], [C[0] + 12, groundY - 0.5], [C[0] + 19, groundY]], cls: 'lf' },
      ];
      g.head = { x: C[0] + 10 * hs, y: G - 15 * hs - 1, rot: 8 };
      g.tail = { base: [R[0] - rr * 0.7, R[1] - rr * 0.5], kind: 'up' };
      break;
    }
    case 'run': {
      const y = G - legL * 0.95 - rc * 0.55;
      const R = [44 - 2, y + 1], C = [44 + len * 1.12, y - 1];
      Object.assign(g, { C, R, sagTop: -0.5, sagBot: 0.5 });
      g.legs = [
        { far: true, pts: [[R[0] - 4, R[1] + 3], [R[0] - 12, R[1] + 10], [R[0] - 19, G - 8]] },
        { far: true, pts: [[C[0] - 2, C[1] + 3], [C[0] + 8, C[1] + 10], [C[0] + 15, G - 6]] },
        { far: false, pts: [[R[0] + 2, R[1] + 3], [R[0] - 4, R[1] + 12], [R[0] - 13, G - 4]], cls: 'hf' },
        { far: false, pts: [[C[0] + 2, C[1] + 3], [C[0] + 12, C[1] + 8], [C[0] + 21, G - 9]], cls: 'lf' },
      ];
      g.head = { x: C[0] + 9 * hs, y: C[1] - rc * 0.35 - 7 * hs, rot: 6 };
      g.tail = { base: [R[0] - rr * 0.9, R[1] - rr * 0.3], kind: 'back' };
      g.earsBack = true;
      break;
    }
    case 'jump': {
      const y = G - legL - rc * 0.7 - 2;
      const R = [60 - len / 2 - 3, y + 3], C = [60 + len / 2 - 3, y - 3];
      Object.assign(g, { C, R });
      g.legs = [
        { far: true, pts: [[R[0] - 4, R[1] + 3], [R[0] - 11, R[1] + 9], [R[0] - 4, R[1] + 15]] },
        { far: true, pts: [[C[0] - 2, C[1] + 3], [C[0] + 4, C[1] + 11], [C[0] - 2, C[1] + 16]] },
        { far: false, pts: [[R[0] + 2, R[1] + 3], [R[0] - 7, R[1] + 11], [R[0] + 1, R[1] + 17]], cls: 'hf' },
        { far: false, pts: [[C[0] + 3, C[1] + 3], [C[0] + 10, C[1] + 10], [C[0] + 3, C[1] + 17]], cls: 'lf' },
      ];
      g.head = { x: C[0] + 7 * hs, y: C[1] - rc * 0.55 - 10 * hs, rot: -8 };
      g.tail = { base: [R[0] - rr * 0.85, R[1] - rr * 0.4], kind: 'up' };
      break;
    }
    case 'sniff': {
      const R = [60 - len / 2 - 6, G - legL - rr * 0.7], C = [60 + len / 2 - 4, G - legL - rc * 0.55 + 4];
      Object.assign(g, { C, R, sagTop: -1 });
      g.legs = standLegs(C, R);
      g.head = { x: C[0] + 12 * hs, y: G - 13 * hs - 2, rot: 22 };
      g.tail = { base: [R[0] - rr * 0.85, R[1] - rr * 0.4], kind: 'up' };
      break;
    }
    case 'arch': {
      const R = [60 - len / 2 - 4, G - legL * 1.08 - rr * 0.7], C = [60 + len / 2 - 4, G - legL * 1.08 - rc * 0.7];
      Object.assign(g, { C, R, sagTop: isDog ? 1 : 9, sagBot: isDog ? 1 : 5 });
      g.legs = standLegs(C, R).map(l => ({ ...l, pts: [l.pts[0], l.pts[2]] }));
      g.head = isDog ? { x: C[0] + 9 * hs, y: C[1] - rc * 0.5 - 9 * hs, rot: -6 } : { x: C[0] + 7 * hs, y: C[1] - rc * 0.2 - 5 * hs, rot: 4 };
      g.tail = { base: [R[0] - rr * 0.85, R[1] - rr * 0.5], kind: 'puff' };
      g.puff = !isDog;
      break;
    }
    default: { // stand / walk
      const R = [60 - len / 2 - 4, G - legL - rr * 0.72], C = [60 + len / 2 - 4, G - legL - rc * 0.72 - (isDog ? 1.5 : 0)];
      Object.assign(g, { C, R });
      g.legs = standLegs(C, R);
      g.head = headStand(C);
      g.tail = { base: [R[0] - rr * 0.85, R[1] - rr * 0.4], kind: 'rest' };
    }
  }
  return g;
}

// ------------------------------------------------------------ kuyruklar
function tailSVG(s, g, mood, isDog, col) {
  const { base, kind } = g.tail;
  const w = (isDog ? 5.6 : 5.2) * s.th;
  const happy = ['happy', 'love', 'eat', 'focus', 'surprised'].includes(mood);
  const low = ['sad', 'dead', 'hungry'].includes(mood);
  let k = kind;
  if (k === 'rest' && (happy || isDog) && !low) k = 'up';
  if ((k === 'rest' || k === 'up') && low) k = 'down';
  const T = {
    long: { rest: 'M0 0 C-7 4 -12 11 -18 10 C-23 9 -24 2 -21 -2', up: 'M0 0 C-7 -5 -11 -15 -8 -25 C-7 -30 -2 -31 0 -28', sit: 'M0 0 C-10 0 -14 -9 -12 -21 C-11 -29 -6 -33 -2 -31', wrap: 'M0 -1 C-5 2 -3 4 6 4 C18 4 28 4 33 2', limp: 'M0 0 C-10 2 -20 3 -28 3', back: 'M0 0 C-9 -1 -17 -1 -24 -5 C-26 -6 -28 -4 -27 -2', up2: '', down: 'M0 0 C-6 6 -10 14 -10 22 C-10 25 -7 26 -5 25', puff: 'M0 0 C-3 -9 -4 -19 -1 -30' },
    kit: { rest: 'M0 0 C-5 -3 -8 -9 -8 -15', up: 'M0 0 C-4 -5 -5 -11 -3 -17', sit: 'M0 0 C-7 0 -10 -6 -9 -13', wrap: 'M0 -1 C-4 2 -2 3 5 3 C12 3 18 3 21 2', limp: 'M0 0 C-6 1 -12 2 -16 2', back: 'M0 0 C-6 -1 -12 -2 -16 -5', down: 'M0 0 C-4 4 -6 9 -6 13', puff: 'M0 0 C-2 -6 -2 -12 0 -18' },
    bob: { rest: 'M0 0 C-4 -1 -7 -4 -8 -8', up: 'M0 0 C-3 -3 -4 -7 -3 -11', sit: 'M0 0 C-4 0 -7 -2 -8 -6', wrap: 'M0 0 C-3 1 -5 1 -8 1', limp: 'M0 0 L-9 1', back: 'M0 0 C-4 -1 -7 -2 -10 -4', down: 'M0 0 C-3 3 -4 6 -4 9', puff: 'M0 0 C-2 -4 -2 -8 0 -11' },
    stub: { rest: 'M0 0 C-3 -3 -5 -7 -4 -11', up: 'M0 0 C-3 -3 -5 -7 -4 -11', sit: 'M0 0 C-4 -1 -6 -4 -6 -8', wrap: 'M0 0 C-3 1 -5 1 -8 1', limp: 'M0 0 L-8 2', back: 'M0 0 C-4 -1 -7 -2 -10 -4', down: 'M0 0 C-3 3 -4 6 -4 9', puff: 'M0 0 C-2 -4 -3 -8 -2 -11' },
    feather: { rest: 'M0 0 C-4 -4 -7 -12 -4 -19', up: 'M0 0 C-5 -4 -8 -12 -5 -20 C-4 -22 -2 -23 0 -22', sit: 'M0 0 C-8 0 -12 -4 -14 -10', wrap: 'M0 -1 C-4 2 -2 3 5 3 C12 3 17 3 20 2', limp: 'M0 0 C-8 1 -15 2 -21 2', back: 'M0 0 C-8 -2 -15 -4 -22 -9', down: 'M0 0 C-4 5 -6 11 -6 17', puff: 'M0 0 C-4 -6 -6 -14 -4 -22' },
    brush: { rest: 'M0 0 C-6 4 -10 12 -12 20', up: 'M0 0 C-7 -3 -12 -10 -12 -18', sit: 'M0 0 C-8 2 -13 4 -18 3', wrap: 'M0 -1 C-5 2 -2 3 6 3 C14 3 20 3 23 2', limp: 'M0 0 C-9 2 -16 3 -22 3', back: 'M0 0 C-9 -1 -17 -3 -24 -6', down: 'M0 0 C-4 6 -6 13 -6 20', puff: 'M0 0 C-6 -4 -10 -12 -10 -20' },
    bushy: { rest: 'M0 0 C-7 4 -11 12 -13 21', up: 'M0 0 C-8 -2 -14 -8 -16 -16', sit: 'M0 0 C-8 2 -14 4 -20 3', wrap: 'M0 -1 C-5 2 -2 3 6 3 C14 3 21 3 24 2', limp: 'M0 0 C-10 2 -18 3 -24 3', back: 'M0 0 C-10 -1 -18 -2 -26 -4', down: 'M0 0 C-4 7 -6 14 -5 22', puff: 'M0 0 C-7 -4 -12 -12 -13 -20' },
  }[s.tail];
  const d = T[k] || T.rest;
  const ww = s.tail === 'bushy' ? w * 1.55 : s.tail === 'brush' ? w * 1.25 : k === 'puff' && !isDog ? w * 1.7 : w;
  const xsT = (d.match(/-?[\d.]+/g) || []).map(Number).filter((_, i) => i % 2 === 0);
  g.tailBox = [base[0] + Math.min(0, ...xsT) - ww / 2, base[0] + Math.max(0, ...xsT) + ww / 2];
  const end = d.match(/(-?[\d.]+) (-?[\d.]+)$/);
  const ex = end ? +end[1] : 0, ey = end ? +end[2] : 0;
  let tip = '';
  if (s.tip) tip = `<circle cx="${ex}" cy="${ey}" r="${(ww * 0.62).toFixed(1)}" fill="${s.tip}"/>`;
  if (s.tail === 'bob') tip = `<circle cx="${ex}" cy="${ey}" r="${(ww * 0.6).toFixed(1)}" fill="${s.d}"/>`;
  if (s.tail === 'bushy' || s.tail === 'brush') tip = `<circle cx="${ex}" cy="${ey}" r="${(ww * 0.5).toFixed(1)}" fill="${s.tail === 'bushy' ? s.l : s.d}"/>`;
  if (s.rosettes) tip += [0.35, 0.6, 0.85].map(() => '').join('');
  return `<g class="q-tail" style="transform-origin:${r1(base[0])}px ${r1(base[1])}px"><g transform="translate(${r1(base[0])} ${r1(base[1])})"><path d="${d}" fill="none" stroke="${col}" stroke-width="${ww.toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>${tip}</g></g>`;
}

// ------------------------------------------------------------ gözler (beyaz "O")
function qEyes(e, r, mood, look, sclera, pupil, line) {
  const ln = (w) => `fill="none" stroke="${line}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  const lx = look * r * 0.28;
  return e.map(([x, y], i) => {
    const d = i ? 1 : -1;
    switch (mood) {
      case 'happy': case 'love': case 'eat':
        return `<path d="M${r1(x - r)} ${r1(y + r * 0.45)} Q${r1(x)} ${r1(y - r * 1.25)} ${r1(x + r)} ${r1(y + r * 0.45)}" ${ln(r * 0.62)}/>`;
      case 'sleep': case 'full':
        return `<path d="M${r1(x - r)} ${r1(y - r * 0.1)} Q${r1(x)} ${r1(y + r * 1.0)} ${r1(x + r)} ${r1(y - r * 0.1)}" ${ln(r * 0.55)}/>`;
      case 'groggy': case 'sleepy':
        return `<path d="M${r1(x - r)} ${r1(y - r * 0.05)} A${r} ${r} 0 0 0 ${r1(x + r)} ${r1(y - r * 0.05)} Z" fill="${sclera}"/><circle cx="${r1(x + r * 0.15)}" cy="${r1(y + r * 0.42)}" r="${r1(r * 0.48)}" fill="${pupil}"/>`;
      case 'focus':
        return `<path d="M${r1(x - r)} ${r1(y - r * (d < 0 ? 0.45 : 0.05))} L${r1(x + r)} ${r1(y - r * (d < 0 ? 0.05 : 0.45))} A${r} ${r} 0 0 1 ${r1(x - r)} ${r1(y - r * (d < 0 ? 0.45 : 0.05))} Z" fill="${sclera}"/><circle cx="${r1(x + r * 0.2)}" cy="${r1(y + r * 0.3)}" r="${r1(r * 0.5)}" fill="${pupil}"/>`;
      case 'sad':
        return `<path d="M${r1(x - r)} ${r1(y - r * (d < 0 ? -0.05 : 0.6))} L${r1(x + r)} ${r1(y - r * (d < 0 ? 0.6 : -0.05))} A${r} ${r} 0 0 1 ${r1(x - r)} ${r1(y - r * (d < 0 ? -0.05 : 0.6))} Z" fill="${sclera}"/><circle cx="${r1(x)}" cy="${r1(y + r * 0.45)}" r="${r1(r * 0.5)}" fill="${pupil}"/>`;
      case 'poked':
        return d < 0
          ? `<path d="M${r1(x - r)} ${r1(y - r * 0.8)} L${r1(x + r * 0.8)} ${r1(y)} L${r1(x - r)} ${r1(y + r * 0.8)}" ${ln(r * 0.55)}/>`
          : `<path d="M${r1(x + r)} ${r1(y - r * 0.8)} L${r1(x - r * 0.8)} ${r1(y)} L${r1(x + r)} ${r1(y + r * 0.8)}" ${ln(r * 0.55)}/>`;
      case 'dead':
        return `<path d="M${r1(x - r * 0.8)} ${r1(y - r * 0.8)} L${r1(x + r * 0.8)} ${r1(y + r * 0.8)} M${r1(x + r * 0.8)} ${r1(y - r * 0.8)} L${r1(x - r * 0.8)} ${r1(y + r * 0.8)}" ${ln(r * 0.5)}/>`;
      case 'surprised':
        return `<circle cx="${x}" cy="${y}" r="${r1(r * 1.3)}" fill="${sclera}"/><circle cx="${r1(x + r * 0.1)}" cy="${y}" r="${r1(r * 0.38)}" fill="${pupil}"/>`;
      case 'hungry':
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="${sclera}"/><circle cx="${r1(x + r * 0.25)}" cy="${r1(y - r * 0.32)}" r="${r1(r * 0.55)}" fill="${pupil}"/>`;
      default:
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="${sclera}"/><circle cx="${r1(x + r * 0.18 + lx)}" cy="${r1(y + r * 0.04)}" r="${r1(r * 0.54)}" fill="${pupil}"/>`;
    }
  }).join('');
}

// ------------------------------------------------------------ kafalar
function catHead(s, mood, look, earsBack) {
  const b = s.b, out = [];
  const eT = earsBack ? -17.5 : -20.5;
  const sad = mood === 'sad' || mood === 'dead';
  const earL = sad ? `-14.5 ${eT + 4}` : `-11.2 ${eT}`, earR = sad ? `14.8 ${eT + 4.5}` : `11.4 ${eT}`;
  const headD = `M-11.5 11 ${s.ruff ? 'L-12.6 9.8 L-15.4 8.6 L-13.8 6.6 L-16 4.4 C-15 1 -14.4 -3 -12.8 -7.5' : 'C-14.6 6 -14.6 -3.5 -12.8 -7.5'} L${earL} L-4.6 -10.8 Q0 -11.8 4.6 -10.8 L${earR} L12.8 -7.5 ${s.ruff ? 'C14.4 -3 15 1 16 4.4 L13.8 6.6 L15.4 8.6 L12.6 9.8' : 'C14.6 -3.5 14.6 6 11.5 11'} Q0 14.6 -11.5 11 Z`;
  out.push(`<path d="${headD}" fill="${b}" stroke="${b}" stroke-width="2.2" stroke-linejoin="round"/>`);
  if (s.ear !== b) {
    const [lx, ly] = earL.split(' ').map(Number), [rx, ry] = earR.split(' ').map(Number);
    out.push(`<path d="M${r1(lx + 1)} ${r1(ly + 4)} L${r1(lx + 1.4)} -9.6 L-6.6 -10.3 Z M${r1(rx - 1)} ${r1(ry + 4)} L${r1(rx - 1.4)} -9.6 L6.6 -10.3 Z" fill="${s.ear}" stroke="${s.ear}" stroke-width="1.2" stroke-linejoin="round"/>`);
  }
  if (s.tufts && !sad) out.push(`<path d="M-11.2 ${eT} l-0.6 -5 M11.4 ${eT} l0.6 -5" stroke="${s.d}" stroke-width="2" stroke-linecap="round"/>`);
  if (s.stripes) out.push(`<path d="M-3.5 -10.5 l0.8 4.5 M0.6 -11.2 l0 5 M4.6 -10.5 l-0.8 4.5 M-13.2 0 l3.6 0.6 M-13.4 4 l3.4 -0.2 M13.4 0 l-3.6 0.6" stroke="${s.d}" stroke-width="1.8" stroke-linecap="round"/>`);
  if (s.rosettes) out.push([[-7, -6.5], [8, -7], [0, -8]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="${s.d}" opacity=".75"/>`).join(''));
  if (s.muzzle) out.push(`<ellipse cx="1.4" cy="6.4" rx="6.2" ry="4.4" fill="${s.l}"/>`);
  if (s.chest && s.name === 'kitten') out.push(`<ellipse cx="1.2" cy="6.6" rx="5.4" ry="3.8" fill="${s.l}"/>`);
  // gözler
  const sclera = s.eye || '#fff', pupil = s.ghost ? '#16131a' : '#2a2026';
  const dark = lum(b) > 0.3 && !s.eye;
  const line = dark ? '#3a2a22' : (s.eye || '#fff');
  const eyeR = 3.55;
  out.push(`<g class="p-eyes">${qEyes([[-4.6, -1.2], [6.2, -1.2]], eyeR, mood, look, sclera, pupil, line)}</g>`);
  if (dark && !['happy', 'love', 'eat', 'sleep', 'full', 'poked', 'dead'].includes(mood)) {
    // açık renk gövdede gözün çevresi kaybolmasın
    out.push(`<g fill="none" stroke="${shade(b, -0.28)}" stroke-width=".9" opacity=".7"><circle cx="-4.6" cy="-1.2" r="${mood === 'surprised' ? 4.7 : 3.9}"/><circle cx="6.2" cy="-1.2" r="${mood === 'surprised' ? 4.7 : 3.9}"/></g>`);
  }
  if (s.nose) out.push(`<path d="M-0.4 4.2 L3 4.2 L1.3 6 Z" fill="${s.nose}" stroke="${s.nose}" stroke-width="1" stroke-linejoin="round"/>`);
  out.push(qMouth(mood, 1.3, 8.4, s.ghost ? '#4a4452' : (dark || s.nose ? '#5a3424' : '#fff'), false));
  return out.join('');
}

function dogHead(s, mood, look, earsBack) {
  const b = s.b, out = [], wolf = !!s.wolf;
  const sx = wolf ? 20 : s.ears === 'floppy' ? 15.5 : 17.5; // burun ucu
  const sad = mood === 'sad' || mood === 'dead';
  const skull = `M-9 11 C-13.5 8 -14.5 -2 -11 -8 C-8 -12.8 2 -13.2 6 -9.2 C8 -7.2 9 -4.4 10.2 -2.6 L${sx - 2.5} -1.6 C${sx + 0.8} -1.1 ${sx + 0.8} 6.6 ${sx - 2.4} 7.2 L9 8.4 C6 11.6 -3 13.2 -9 11 Z`;
  // kulaklar
  let back = '', front = '';
  const ec = s.ears === 'floppy' || s.ears === 'mixed' ? s.d : b;
  if (s.ears === 'floppy') {
    back = `M-9.5 -8.5 C-15.5 -6.5 -16.5 4 -12.5 8 C-10.6 4 -8.4 -1 -5.5 -6 Z`;
    front = `M0 -11.4 C6 -12.5 8.6 -6.5 7 -0.5 C4.8 -2.6 2.6 -5.8 -1.2 -7.8 Z`;
  } else if (s.ears === 'mixed') {
    back = sad || earsBack ? `M-10 -6 C-16 -8 -19 -3 -18 2 C-14 0 -11 -2 -7 -3 Z` : `M-10.4 -6 C-12.6 -14 -10.6 -21.5 -6.4 -22 C-3.6 -22 -3 -15.6 -2.6 -10.4 Z`;
    front = `M-0.4 -11.6 C3 -15.6 8.4 -15.6 10 -12.2 C11 -9.6 9 -7 6.8 -8 C5.6 -9.6 3 -9.6 0.8 -8.2 Z`;
  } else {
    back = sad || earsBack ? `M-10 -6.5 L-18.5 -9 L-6 -11.5 Z` : `M-10.2 -6.8 L-9.4 -22.5 L-2.6 -11.2 Z`;
    front = sad || earsBack ? `M-1.5 -11 L-8 -16 L4 -12 Z` : `M-1.2 -11.6 L4.6 -24.4 L7.8 -9.4 Z`;
  }
  out.push(`<path d="${back}" fill="${s.ears === 'pointy' ? shade(b, -0.12) : ec}" stroke="${s.ears === 'pointy' ? shade(b, -0.12) : ec}" stroke-width="2" stroke-linejoin="round"/>`);
  if (s.ruff) out.push(`<path d="M-11 -4 L-17.5 -0.5 L-13 1.6 L-18 5.4 L-12.4 6.6 L-15.4 10.6 L-8 10 Z" fill="${s.mane ? s.l : b}" stroke="${s.mane ? s.l : b}" stroke-width="1.6" stroke-linejoin="round"/>`);
  out.push(`<path d="${skull}" fill="${b}" stroke="${b}" stroke-width="2" stroke-linejoin="round"/>`);
  if (wolf || s.ears === 'pointy') out.push(`<path d="M6 -1.4 L${sx - 2.5} -1.6 C${sx + 0.8} -1.1 ${sx + 0.8} 6.6 ${sx - 2.4} 7.2 L9 8.4 C6 10.6 0.5 11 -2.4 9.4 C1.2 6.4 3.4 2.4 6 -1.4 Z" fill="${s.l}"/>`);
  else if (s.chest || s.ears === 'mixed') out.push(`<path d="M8 -0.5 L${sx - 2.5} -1.2 C${sx + 0.8} -0.8 ${sx + 0.8} 6.6 ${sx - 2.4} 7.2 L9 8.4 C7 9.4 5 8.8 4.4 7.4 C5.2 4.6 6.4 1.6 8 -0.5 Z" fill="${s.l}"/>`);
  if (s.muzzleDark) out.push(`<path d="M${sx - 6} -1.4 L${sx - 2.5} -1.6 C${sx + 0.8} -1.1 ${sx + 0.8} 6.6 ${sx - 2.4} 7.2 L${sx - 7} 7.6 Z" fill="${s.d}" opacity=".85"/>`);
  const fc = s.ears === 'pointy' ? b : ec;
  out.push(`<g class="q-ear" style="transform-origin:1px -10px"><path d="${front}" fill="${fc}" stroke="${fc}" stroke-width="2" stroke-linejoin="round"/>${s.earIn && !(sad || earsBack) ? `<path d="M0.6 -11.4 L4.4 -20 L6.4 -10.4 Z" fill="${s.earIn}" opacity=".55"/>` : ''}</g>`);
  // burun
  out.push(`<ellipse cx="${sx - 0.6}" cy="0.4" rx="2.6" ry="2" fill="${s.nose}"/>`);
  const sclera = s.eye || '#fff', pupil = '#221d24';
  const dark = lum(b) > 0.3 && !s.eye;
  const line = dark ? '#3a2a22' : (s.eye || '#fff');
  out.push(`<g class="p-eyes">${qEyes([[-3.4, -3.4], [5.2, -3.6]], 3.35, mood, look, sclera, pupil, line)}</g>`);
  if (dark && !['happy', 'love', 'eat', 'sleep', 'full', 'poked', 'dead'].includes(mood))
    out.push(`<g fill="none" stroke="${shade(b, -0.3)}" stroke-width=".9" opacity=".65"><circle cx="-3.4" cy="-3.4" r="${mood === 'surprised' ? 4.5 : 3.7}"/><circle cx="5.2" cy="-3.6" r="${mood === 'surprised' ? 4.5 : 3.7}"/></g>`);
  out.push(qMouth(mood, sx - 4, 8.2, '#4a2a22', true));
  return out.join('');
}

function qMouth(mood, x, y, col, dog) {
  switch (mood) {
    case 'happy': case 'love':
      return dog ? `<path d="M${x - 1.6} ${y - 0.4} C${x - 1.8} ${y + 4.6} ${x + 2.6} ${y + 5} ${x + 2.4} ${y - 0.2} Z" fill="#F07A8A"/>` : '';
    case 'eat': return `<ellipse cx="${x}" cy="${y}" rx="1.9" ry="1.6" fill="#7a2a34"/>`;
    case 'surprised': return `<ellipse cx="${x}" cy="${y + 0.4}" rx="1.5" ry="2" fill="#5a2430"/>`;
    case 'poked': return `<path d="M${x - 2.4} ${y} l1.2 -1 l1.2 1 l1.2 -1 l1.2 1" fill="none" stroke="${col}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'hungry': return dog ? `<path d="M${x - 1.2} ${y - 0.4} C${x - 1.4} ${y + 3.4} ${x + 2} ${y + 3.6} ${x + 1.8} ${y - 0.2} Z" fill="#F07A8A"/><path d="M${x + 2.6} ${y + 1} q0.8 2.6 0 4" fill="none" stroke="#9FDCFF" stroke-width="1.2" stroke-linecap="round"/>` : `<path d="M${x + 1.6} ${y} q0.8 2.6 0 4" fill="none" stroke="#9FDCFF" stroke-width="1.2" stroke-linecap="round"/>`;
    default: return '';
  }
}

// ------------------------------------------------------------ çizim
export function quadSVG(kind, stage, opts = {}, uid = 'q') {
  const isDog = kind === 'dog';
  const s = (isDog ? DOG : CAT)[Math.max(0, Math.min(5, stage | 0))];
  const mood = opts.mood || 'idle';
  const belly = Math.max(0, Math.min(1, opts.belly || 0));
  let pose = opts.pose || 'stand';
  if (pose === 'walk') pose = 'stand';
  const g = geom(s, pose, belly, isDog);
  const b = s.b, far = shade(b, s.ghost ? 0.08 : -0.16);
  const body = bodyPath(g.C, g.rc, g.R, g.rr, g.sagTop, g.sagBot);
  const legs = (arr, isFar) => arr.filter(l => !!l.far === isFar).map(l => `<path class="q-leg ${l.cls || (isFar ? 'fb' : '')}${isFar ? ' far' : ''}" style="transform-origin:${r1(l.pts[0][0])}px ${r1(l.pts[0][1])}px" d="${legPath(l.pts)}" fill="none" stroke="${isFar ? far : b}" stroke-width="${r1(g.lw)}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  // arka bacaklar sınıfları (uzak) — yürüyüşte çapraz eşleşme için
  (g.legs || []).forEach((l, i) => { if (l.far && !l.cls) l.cls = i === 0 ? 'hb' : 'lb'; });
  const cid = `qc${uid}`;
  // gövde işaretleri (gövdeye kırpılmış)
  let marks = '';
  const { n, Ct, Rt } = body;
  const along = t => [Rt[0] + (Ct[0] - Rt[0]) * t, Rt[1] + (Ct[1] - Rt[1]) * t];
  const deep = (t, dd) => add(along(t), n, -g.rc * dd);
  if (s.wolf && pose !== 'flat') marks += `<path d="M${pt(deep(0.02, 1.5))} Q${pt(deep(0.5, 1.45))} ${pt(deep(0.98, 1.2))} L${pt(add(g.C, [1, 0], g.rc * 1.3))} L${pt(add(g.C, n, -g.rc * 1.6))} L${pt(add(g.R, n, -g.rr * 1.6))} Z" fill="${s.l}"/>` +
    `<ellipse cx="${r1(g.C[0] + g.rc * 0.75)}" cy="${r1(g.C[1] + g.rc * 0.15)}" rx="${r1(g.rc * 0.45)}" ry="${r1(g.rc * 0.8)}" fill="${s.l}"/>`;
  if (s.stripes) marks += [0.2, 0.42, 0.64].map(t => { const p = along(t); return `<path d="M${pt(add(p, n, 1.5))} q${r1(-n[0] * 7 + 1.5)} ${r1(-n[1] * 7)} ${r1(-n[0] * 10 - 1)} ${r1(-n[1] * 10)}" fill="none" stroke="${s.d}" stroke-width="2.6" stroke-linecap="round"/>`; }).join('');
  if (s.saddle) marks += `<path d="M${pt(add(Rt, n, 3))} L${pt(add(along(0.86), n, 3))} C${pt(deep(0.9, 0.5))} ${pt(deep(0.82, 1.05))} ${pt(deep(0.66, 1.05))} Q${pt(deep(0.35, 1.25))} ${pt(deep(-0.05, 0.95))} Z" fill="${s.d}"/>`;
  if (s.rosettes) marks += [[0.1, 0.45], [0.36, 0.3], [0.58, 0.62], [0.8, 0.35], [0.28, 0.95], [0.7, 1.05]].map(([t, dd]) => { const p = deep(t, dd); return [0, 72, 144, 216, 288].map(a => { const q = [p[0] + Math.cos(a * Math.PI / 180 + t * 3) * 2.6, p[1] + Math.sin(a * Math.PI / 180 + t * 3) * 2.2]; return `<circle cx="${r1(q[0])}" cy="${r1(q[1])}" r=".95" fill="${s.d}" opacity=".8"/>`; }).join(''); }).join('');
  if (s.dots) marks += [[0.2, 0.7], [0.45, 0.4], [0.7, 0.85], [0.35, 1.2]].map(([t, dd]) => { const p = deep(t, dd); return `<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="1.3" fill="${s.dots}"/>`; }).join('');
  if (s.ghost) marks += [[0.25, 0.5], [0.55, 0.35], [0.75, 0.8], [0.4, 1.0]].map(([t, dd]) => { const p = deep(t, dd); return `<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="2.6" fill="none" stroke="#2f2a35" stroke-width="1.3"/>`; }).join('');
  // boyun
  const H = g.head, hs = s.hs;
  const neck = g.neck ? `<path d="M${pt(add(g.C, [0.3, -0.6], g.rc * 0.5))} L${r1(H.x - 1.5 * hs)} ${r1(H.y + 3 * hs)}" stroke="${b}" stroke-width="${r1((isDog ? 12 : 13) * hs * (s.name === 'kitten' || s.name === 'puppy' ? 0.85 : 1))}" stroke-linecap="round"/>` : '';
  const collar = s.collar && g.neck ? `<path d="M${pt(add(g.C, [0.2, -0.8], g.rc * 0.95))} L${r1(H.x - 4 * hs)} ${r1(H.y + 8 * hs)}" stroke="${s.collar}" stroke-width="3" stroke-linecap="round"/><circle cx="${r1(H.x - 2.5 * hs)}" cy="${r1(H.y + 11 * hs)}" r="1.6" fill="#F2C14E"/>` : '';
  const paws = g.paws.map(([x1, y1, x2, y2]) => `<path d="M${r1(x1)} ${r1(y1)} L${r1(x2)} ${r1(y2)}" stroke="${b}" stroke-width="${r1(g.lw)}" stroke-linecap="round"/>`).join('');
  const haunch = g.haunch ? `<ellipse cx="${r1(g.haunch[0])}" cy="${r1(g.haunch[1])}" rx="${r1(g.haunch[2])}" ry="${r1(g.haunch[3])}" fill="${shade(b, s.ghost ? 0.05 : -0.06)}"/>` : '';
  const puff = g.puff ? `<path d="${body.d}" fill="none" stroke="${b}" stroke-width="3" stroke-dasharray="1.4 2.2" stroke-linecap="round"/>` : '';
  const headInner = isDog ? dogHead(s, mood, opts.look || 0, g.earsBack) : catHead(s, mood, opts.look || 0, g.earsBack);
  const tears = mood === 'sad' ? `<g class="p-tears"><path d="M${isDog ? -3.4 : -4.6} 2 q-1 4 0 8" fill="none" stroke="#7CC6F5" stroke-width="1.8" stroke-linecap="round"/><path d="M${isDog ? 5.2 : 6.2} 2 q1 4 0 8" fill="none" stroke="#7CC6F5" stroke-width="1.8" stroke-linecap="round"/></g>` : '';
  const head = `<g class="q-head" style="transform-origin:${r1(H.x - 2 * hs)}px ${r1(H.y + 8 * hs)}px"><g transform="translate(${r1(H.x)} ${r1(H.y)}) rotate(${H.rot || 0}) scale(${hs})">${headInner}${tears}</g></g>`;
  const halo = mood === 'dead' ? `<ellipse cx="${r1(H.x)}" cy="${r1(H.y - 22 * hs)}" rx="${r1(11 * hs)}" ry="3" fill="none" stroke="#FFD86B" stroke-width="2.4"/>` : '';
  const tailStr = tailSVG(s, g, mood, isDog, b);
  const xs = [g.R[0] - g.rr, g.C[0] + g.rc, H.x + (isDog ? 21 : 16) * hs, H.x - 16 * hs, ...g.tailBox, ...(g.legs || []).flatMap(l => l.pts.map(p => p[0])), ...g.paws.flatMap(p => [p[0], p[2]])];
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const dx = 60 - (minX + maxX) / 2;
  const k = Math.min(s.k, 112 / (maxX - minX));
  const shadowRx = pose === 'run' || pose === 'jump' ? 22 : Math.min(30, (g.C[0] - g.R[0] + g.rc + g.rr) / 2 + 4);
  return `<svg class="pet-svg quad q-${kind} pose-${pose}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
    `<defs><clipPath id="${cid}"><path d="${body.d}"/></clipPath></defs>` +
    `<ellipse class="p-ground" cx="${r1(60 + ((g.C[0] + g.R[0]) / 2 + dx - 60) * k)}" cy="${G + 1.6}" rx="${r1(shadowRx * k)}" ry="2.8" fill="#1f1b24" opacity=".1"/>` +
    `<g class="q-fig" transform="translate(60 ${G}) scale(${r1(k * 100) / 100}) translate(${r1(dx - 60)} -${G})">` +
    `<g class="q-bob">` +
    legs(g.legs || [], true) + (g.tail.kind === 'wrap' ? '' : tailStr) + haunch +
    `<g class="p-body"><path d="${body.d}" fill="${b}"/><g clip-path="url(#${cid})">${marks}</g>${puff}</g>` +
    paws + legs(g.legs || [], false) + (g.tail.kind === 'wrap' ? tailStr : '') + neck + collar + head + halo +
    `</g></g></svg>`;
}

export const QUAD_STAGES = { cat: CAT.length, dog: DOG.length };
