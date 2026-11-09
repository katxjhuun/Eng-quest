// Civciv, bitki ve damla (5. tür): öne bakan yuvarlak gövdeli karakterler.
// Aynı düz renk dili: çizgisiz şekiller, yumuşak tonlar, büyük ifadeli gözler.
// Gövde zeminde (60, 108) oturur; yaslanma ve ezilip uzama gövdenin altından yapılır, ayaklar yerde kalır.
import { K, EASE, seg, bump, blend, clamp, lerp, rad, r1, P, smoothPath, shade, wob, TAU } from './anim.js';
import { op, eyes, mouth, blush, MOOD_EYE } from './face.js';

export const G = 108;
const F_ = c => ({ fill: c });
const S_ = (c, w) => ({ fill: 'none', stroke: c, 'stroke-width': r1(w), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });

// ---------------------------------------------------------------- formlar
const ORANGE = '#F2994A';
const CHICK = [
  { name: 'egg', w: 44, h: 46, body: '#FFD54A', belly: '#FFE58C', shell: true, feet: ORANGE, eyeY: 0.6, eyeGap: 7.2, eyeR: 2.7, beak: 0.8, blush: 0.5, arms: null, top: 'cap' },
  { name: 'chick', w: 52, h: 50, body: '#FFD54A', belly: '#FFE58C', feet: ORANGE, eyeY: 0.56, eyeGap: 8.8, eyeR: 3.1, beak: 1, blush: 0.55, arms: 'wing', armCol: '#F5C232', top: 'tuft' },
  { name: 'chubby', w: 60, h: 54, body: '#FFD54A', belly: '#FFE58C', feet: ORANGE, eyeY: 0.56, eyeGap: 9.6, eyeR: 3.2, beak: 1.05, blush: 0.55, arms: 'wing', armCol: '#F5C232', top: 'tuft2' },
  { name: 'fledge', w: 56, h: 56, body: '#FFD54A', belly: '#FFE58C', feet: ORANGE, eyeY: 0.57, eyeGap: 9.2, eyeR: 3.1, beak: 1, blush: 0.5, arms: 'wing', armCol: '#F5C232', armTip: '#3FA3B5', top: 'crest', crest: ['#2F8F9A', '#3FA3B5'], back: 'fan', fanN: 5, fanR: 42, fanCol: '#3BA55C' },
  { name: 'peachick', w: 40, h: 50, legH: 8, body: '#4A86DA', belly: '#6A9FE6', feet: '#8C8C98', eyeFam: 'ring', eyeY: 0.6, eyeGap: 7, eyeR: 3, beak: 0.85, arms: 'wing', armCol: '#C29858', top: 'crest', crest: ['#2E6FB8', '#3FA3B5'], back: 'fan', fanN: 7, fanR: 38, fanCol: '#3BA55C' },
  { name: 'peacock', w: 42, h: 56, legH: 9, body: '#2E6FD1', belly: '#4A8BE0', feet: '#8C8C98', eyeFam: 'ring', eyeY: 0.62, eyeGap: 7.2, eyeR: 3, beak: 0.9, arms: 'wing', armCol: '#B88A4A', top: 'crest', crest: ['#1E5DB8', '#2F9FC8'], back: 'fan', fanN: 11, fanR: 46, fanCol: '#3BA55C' },
];
const PLANT = [
  { name: 'seed', w: 36, h: 42, body: '#B07A4A', belly: '#C9935F', feet: null, hopper: true, mound: true, eyeFam: 'ring', eyeY: 0.48, eyeGap: 6.6, eyeR: 2.7, mouthCol: '#5a3a1e', top: 'sprout0' },
  { name: 'sprout', w: 46, h: 52, body: '#EFE7C8', belly: '#F7F1DC', feet: '#D6CCA6', foot: 'stub', eyeY: 0.48, eyeGap: 7.6, eyeR: 2.6, blush: 0.6, arms: 'stub', armCol: '#E3D9B4', top: 'sprout', smile: true },
  { name: 'daisy', w: 46, h: 50, body: '#D6E8B4', belly: '#E6F1CF', feet: '#B9CF8E', foot: 'stub', eyeY: 0.5, eyeGap: 7.8, eyeR: 2.7, blush: 0.5, arms: 'leaf', armCol: '#7DB872', top: 'daisy', smile: true },
  { name: 'tulip', w: 46, h: 52, body: '#AED696', belly: '#C4E2B0', feet: '#8FBF78', foot: 'stub', eyeY: 0.5, eyeGap: 7.8, eyeR: 2.7, blush: 0.5, arms: 'leaf', armCol: '#5C9A5A', top: 'tulip', smile: true },
  { name: 'cactus', w: 40, h: 60, body: '#6BAF6E', belly: '#7CBD7E', feet: '#5A9A5D', foot: 'stub', ribs: true, eyeY: 0.62, eyeGap: 7, eyeR: 2.7, blush: 0.45, arms: 'cactus', armCol: '#6BAF6E', top: 'bloom', smile: true },
  { name: 'tree', w: 44, h: 46, body: '#9A6B44', belly: '#A97A52', feet: '#7E5434', foot: 'root', bark: true, eyeFam: 'ring', eyeY: 0.48, eyeGap: 7.4, eyeR: 2.8, mouthCol: '#4a2c14', arms: 'branch', armCol: '#8A5E3A', top: 'crown', crownR: 30 },
];
const TABLE = { chick: CHICK, plant: PLANT };
const FOOD = { chick: 'seed', plant: 'water' };

export function form(kind, stage) {
  const f = (TABLE[kind] || CHICK)[clamp(stage | 0, 0, 5)];
  const footH = f.feet ? 3 : 0, legH = f.legH || 0;
  return { eyeFam: 'dot', ...f, kind, stage: clamp(stage | 0, 0, 5), footH, legH, by: G - footH - legH, food: FOOD[kind] };
}
export const food = F => F.food;

export function colors(F) {
  const ring = F.eyeFam === 'ring';
  return {
    b: F.body, white: F.glow || '#FFFFFF', pupil: ring ? '#16131a' : '#2b2230', line: ring ? (F.glow || '#FFFFFF') : '#2b2230', lid: F.body,
    mouth: '#5a2a34', beak: ORANGE, beak2: '#D9773A', smile: !!F.smile, smileLine: F.mouthCol || '#3a2a30',
  };
}

// ---------------------------------------------------------------- pozlar
export function bases(F) {
  const stand = {
    rx: 0, ry: 0, rr: 0, sx: 1, sy: 1, lean: 0, bsx: 1, bsy: 1,
    fLx: 0, fLy: 0, fRx: 0, fRy: 0, aL: 8, aR: 8, topA: 0, topS: 1, fan: F.back === 'fan' ? 0.35 : 0, wing: 0, tailA: 0,
    faceX: 2.5, faceY: 0, eye: 'open', look: 0, lookY: 0, mouth: 0, blush: 0, props: null,
  };
  const sit = { ...stand, bsy: 0.95, bsx: 1.04, fLx: 2, fRx: -2, aL: 4, aR: 4 };
  return { stand, sit };
}
export function moodPose(p, mood, F) {
  const o = { ...p };
  if (!o.eye || o.eye === 'open') o.eye = MOOD_EYE[mood] || 'open';
  switch (mood) {
    case 'sad': case 'hungry': o.lean += 4; o.bsy *= 0.97; o.aL = 2; o.aR = 2; o.topA += 16; o.faceY += 1.5; o.fan *= 0.4; break;
    case 'happy': case 'love': case 'eat': o.aL += 12; o.aR += 12; o.blush += 0.25; o.fan = Math.max(o.fan, 0.6); break;
    case 'groggy': case 'sleepy': o.lean += 3; o.topA += 10; o.bsy *= 0.98; break;
    case 'full': o.bsx *= 1.1; o.bsy *= 0.95; break;
    case 'focus': o.aL = 18; o.aR = 18; o.fan = Math.max(o.fan, 0.5); break;
  }
  return o;
}

// ---------------------------------------------------------------- hareket döngüleri
function walkPose(B, F, ph, run = false) {
  const p = { ...B.stand };
  const s = Math.sin(ph * TAU), up = Math.abs(s);
  if (F.hopper) {
    // ayaksız: zıplayarak ilerler
    const q = ph % 1;
    p.ry = -(run ? 11 : 7) * Math.sin(Math.PI * q);
    const land = q < 0.12 ? 1 - q / 0.12 : q > 0.9 ? (q - 0.9) / 0.1 : 0;
    p.bsy = 1 - 0.14 * land + 0.08 * Math.sin(Math.PI * q); p.bsx = 1 + 0.12 * land - 0.04 * Math.sin(Math.PI * q);
    p.lean = run ? 8 : 4; p.topA = -8 * Math.sin(Math.PI * q);
    return p;
  }
  const step = (run ? 6 : 4) * (F.w / 50);
  p.lean = (run ? 9 : 0) + (run ? 3 : 6) * s;
  p.rr = (run ? 0 : 2.5) * s;
  p.ry = -(run ? 2.5 : 1.6) * up;
  // yerdeki ayak gövdeye göre geriye kayar (zemine göre sabit), havadaki öne savrulur
  p.fLx = -step * Math.cos(ph * TAU); p.fLy = -Math.max(0, s) * (run ? 6 : 4);
  p.fRx = step * Math.cos(ph * TAU); p.fRy = -Math.max(0, -s) * (run ? 6 : 4);
  p.aL = (run ? 36 : 14) + (run ? 14 : 8) * s; p.aR = (run ? 36 : 14) - (run ? 14 : 8) * s;
  p.topA = -5 * s - (run ? 12 : 0); p.tailA = 10 * s;
  p.fan = F.back === 'fan' ? 0.2 : 0; p.wing = run ? 12 * s : 0;
  return p;
}

// ---------------------------------------------------------------- klipler
const hopJump = (u, c, h = 20) => {
  const B = c.B;
  const p = { ...B.stand };
  const cr = K(u, [[0, 0], [0.18, 1, 'out'], [0.28, 0, 'in'], [0.66, 0], [0.74, 0.8, 'out'], [1, 0]]);
  const air = bump(u, 0.24, 0.68);
  p.ry = -K(u, [[0, 0], [0.24, 0], [0.46, h, 'out'], [0.68, 0, 'in'], [1, 0]]);
  p.bsy = 1 - 0.16 * cr + 0.1 * air; p.bsx = 1 + 0.14 * cr - 0.06 * air;
  p.aL = 10 + 70 * air; p.aR = 10 + 70 * air;
  p.fLy = -4 * air; p.fRy = -4 * air; p.fLx = -2 * air; p.fRx = 2 * air;
  p.topA = 22 * cr - 14 * air; p.fan = 0.35 + 0.6 * air; p.wing = 30 * air;
  p.eye = u > 0.2 ? 'happy' : 'open'; p.mouth = 0.6 * air; p.blush = 0.3;
  return p;
};
export const CLIPS = {
  idle: { dur: 6, loop: true, f: (u, c) => {
    const p = { ...c.B.stand };
    const br = Math.sin(c.t * 2.2);
    p.bsy = 1 + 0.015 * br; p.bsx = 1 - 0.008 * br;
    p.lean = 1.6 * wob(c.t * 0.5); p.topA = 6 * wob(c.t * 0.6, 2); p.aL += 3 * wob(c.t * 0.7, 1); p.aR += 3 * wob(c.t * 0.7, 3);
    p.tailA = 10 * wob(c.t * 0.5, 4); p.fan += 0.05 * Math.sin(c.t * 1.2);
    return p;
  } },
  sit: { dur: 6, loop: true, f: (u, c) => {
    const p = { ...c.B.sit };
    const br = Math.sin(c.t * 1.9);
    p.bsy *= 1 + 0.015 * br; p.lean = 1.4 * wob(c.t * 0.4); p.topA = 5 * wob(c.t * 0.5, 2); p.tailA = 8 * wob(c.t * 0.4, 1);
    return p;
  } },
  walk: { dur: 1, loop: true, phase: true, f: (u, c) => walkPose(c.B, c.F, c.ph) },
  run: { dur: 1, loop: true, phase: true, f: (u, c) => walkPose(c.B, c.F, c.ph, true) },
  sleep: { dur: 4.4, loop: true, f: (u, c) => {
    const p = { ...c.B.sit, eye: 'closed' };
    const br = Math.sin(u * TAU);
    p.bsy = 0.93 + 0.03 * br; p.bsx = 1.06 - 0.015 * br; p.lean = 7 + 1.5 * br; p.topA = 26 + 3 * br; p.aL = 2; p.aR = 2; p.fan = 0.05; p.faceY = 2;
    return p;
  } },
  lie: { dur: 5, loop: true, f: (u, c) => {
    const p = { ...c.B.sit, eye: 'half' };
    p.bsx = 1.12; p.bsy = 0.9; p.lean = -6 + 1.5 * Math.sin(u * TAU); p.aL = 30; p.aR = 30; p.fLx = 5; p.fRx = -5; p.fLy = -2; p.fRy = -2; p.topA = -10;
    return p;
  } },
  dead: { dur: 3, loop: true, f: (u, c) => {
    const F = c.F, H = G - F.by + F.h, half = F.w / 2;
    const p = { ...c.B.stand, eye: 'x', rr: 84, ry: -(half - F.footH) * 0.9 + 2, rx: -H * 0.45, aL: 70, aR: 0, fLy: -1, fRy: -1, topA: 30, fan: 0, faceX: 0 };
    // hale dünyaya göre başın üstünde (gövde döndüğü halde)
    p.props = [{ type: 'halo', world: true, x: 60 + p.rx + H * 0.9, y: G + p.ry - half - 6 + Math.sin(u * TAU) * 1.2, a: 0, s: 0.9 }];
    return p;
  } },
  hop: { dur: 0.95, f: (u, c) => hopJump(u, c, 20) },
  joy: { dur: 0.95, f: (u, c) => hopJump(u, c, 20) },
  dance: { dur: 1.6, f: (u, c) => {
    const q = (u * 2) % 1, n = Math.floor(u * 2) ? 1 : -1;
    const p = hopJump(q, c, 12);
    p.lean = 14 * n * bump(q, 0.2, 0.8); p.rx = 4 * n * bump(q, 0.2, 0.8);
    p.aL = n > 0 ? 100 : 30; p.aR = n > 0 ? 30 : 100; p.eye = 'happy';
    return p;
  } },
  eat: { dur: 2.2, rep: true, f: (u, c) => {
    const p = { ...c.B.stand, eye: 'happy' }, F = c.F;
    const down = K(u, [[0, 0], [0.15, 1, 'out'], [0.85, 1], [1, 0]]);
    const peck = down * Math.abs(Math.sin(u * TAU * 4));
    if (F.kind === 'plant') {
      // yağmur suyu içer: yukarı bakar, damlalar düşer
      p.lean = -6 * down; p.faceY = -2 * down; p.aL = 30 * down + 8; p.aR = 30 * down + 8; p.mouth = 0.5 * down; p.topA = -10 * down + 4 * Math.sin(c.t * 6);
      p.props = [0, 1, 2].map(i => { const q = (c.t * 1.6 + i / 3) % 1; return { type: 'drop', x: 52 + i * 8, y: F.by - F.h - 22 + q * 26, s: 0.9, o: down * (1 - q * 0.6) }; });
      return p;
    }
    p.lean = 16 * down + 6 * peck; p.bsy = 1 - 0.04 * peck; p.mouth = peck * 0.9;
    p.aL = 18; p.aR = 18; p.topA = -6 * peck;
    p.props = [{ type: 'bowl', x: 60 + F.w * 0.42, y: G, s: 0.85, food: F.food, full: 1 - seg(u, 0.15, 0.85) }];
    return p;
  } },
  flinch: { dur: 0.75, f: (u, c) => {
    const p = { ...c.B.stand };
    const k = K(u, [[0, 0], [0.12, 1, 'out'], [0.5, 0.5], [1, 0.4]]);
    p.lean = -14 * k; p.rx = -5 * k + 2 * Math.sin(u * TAU * 3) * (1 - u); p.bsy = 1 - 0.1 * k; p.bsx = 1 + 0.08 * k;
    p.aL = 4; p.aR = 4; p.topA = 30 * k; p.eye = u < 0.4 ? 'squint' : 'sad';
    return p;
  } },
  sad: { dur: 2.2, f: (u, c) => {
    const k = K(u, [[0, 0], [0.3, 1, 'io'], [1, 1]]);
    const p = blend(c.B.stand, moodPose({ ...c.B.sit, lean: 8, faceY: 2.5 }, 'sad', c.F), k);
    p.lean += 1.5 * Math.sin(u * TAU); p.eye = 'sad';
    return p;
  } },
  cry: { dur: 3, rep: true, f: (u, c) => {
    // referans: yağmur altında ağlayan civciv — gözler kapalı, ağız açık, gözyaşı şeritleri
    const p = moodPose({ ...c.B.sit }, 'sad', c.F);
    p.eye = 'closed'; p.mouth = 0.7 + 0.2 * Math.sin(c.t * 9); p.lean = -4; p.faceY = -1.5; p.aL = 30 + 6 * Math.sin(c.t * 9); p.aR = 6;
    p.rx = 0.5 * Math.sin(c.t * 40); p.tears = 1;
    p.props = [{ type: 'cloud', x: 60, y: c.F.by - c.F.h - 18, s: 1, t: c.t }];
    return p;
  } },
  poked: { dur: 0.85, f: (u, c) => {
    const p = { ...c.B.stand };
    const sq = K(u, [[0, 0], [0.1, 1, 'out'], [0.24, -0.6, 'out'], [0.4, 0.3], [0.55, -0.15], [0.7, 0]]);
    p.bsy = 1 - 0.18 * sq; p.bsx = 1 + 0.16 * sq;
    p.ry = -K(u, [[0, 0], [0.12, 0], [0.26, 7, 'out'], [0.4, 0, 'in']]);
    p.rx = 2 * Math.sin(u * TAU * 4) * (1 - u); p.eye = 'squint'; p.mouth = bump(u, 0.1, 0.5) * 0.6; p.aL = 50 * bump(u, 0.1, 0.6); p.aR = 50 * bump(u, 0.1, 0.6);
    p.topA = -20 * sq; p.blush = 0.5;
    return p;
  } },
  shock: { dur: 1, f: (u, c) => {
    const p = { ...c.B.stand, eye: 'wide' };
    p.ry = -K(u, [[0, 0], [0.06, 0], [0.22, 16, 'out'], [0.4, 0, 'in'], [0.48, -1], [0.56, 0]]);
    p.bsy = 1 + 0.16 * bump(u, 0.05, 0.3) - 0.12 * bump(u, 0.36, 0.52); p.bsx = 1 - 0.08 * bump(u, 0.05, 0.3) + 0.1 * bump(u, 0.36, 0.52);
    p.aL = 110 * bump(u, 0.05, 0.8); p.aR = 110 * bump(u, 0.05, 0.8); p.mouth = bump(u, 0.1, 0.7) * 0.8;
    p.topA = -30 * bump(u, 0.1, 0.4) + 10 * bump(u, 0.4, 0.7); p.fan = 0.9 * bump(u, 0.05, 0.9); p.wing = 40 * bump(u, 0.05, 0.6);
    return p;
  } },
  love: { dur: 2.4, rep: true, f: (u, c) => {
    const p = { ...c.B.sit, eye: 'happy' };
    const s = Math.sin(u * TAU * 2);
    p.lean = 8 * s; p.rx = 1.5 * s; p.aL = 40 + 10 * s; p.aR = 40 - 10 * s; p.blush = 0.6; p.topA = -8 * s; p.fan = 0.7;
    p.props = [{ type: 'heart', x: 60 + 14 * Math.sin(u * TAU), y: c.F.by - c.F.h - 6 - 10 * u, s: 0.8, o: 1 - u }];
    return p;
  } },
  look: { dur: 1.7, f: (u, c) => {
    const p = { ...c.B.stand };
    const k = K(u, [[0, 0], [0.2, 1, 'back'], [0.75, 1], [1, 0]]);
    p.faceX = 2.5 - 5 * k; p.look = -1 * k; p.lean = -5 * k; p.topA = 8 * k;
    return p;
  } },
  stretch: { dur: 2, f: (u, c) => {
    const p = { ...c.B.stand };
    const k = K(u, [[0, 0], [0.3, 1, 'io'], [0.65, 1], [0.9, 0, 'io']]);
    p.bsy = 1 + 0.12 * k; p.bsx = 1 - 0.06 * k; p.aL = 8 + 140 * k; p.aR = 8 + 140 * k; p.eye = k > 0.5 ? 'closed' : 'open'; p.mouth = bump(u, 0.2, 0.7) * 0.8;
    p.fan = 0.35 + 0.5 * k; p.wing = 30 * k;
    return p;
  } },
  yawn: { dur: 2, f: (u, c) => {
    const p = { ...c.B.sit };
    const k = bump(u, 0.15, 0.8);
    p.lean = -6 * k; p.mouth = Math.min(1, k * 1.3); p.eye = k > 0.3 ? 'closed' : 'half'; p.aL = 8 + 40 * k; p.aR = 8 + 10 * k;
    return p;
  } },
  doze: { dur: 3.2, f: (u, c) => {
    const p = { ...c.B.sit };
    const nod = K(u, [[0, 0], [0.55, 1, 'in'], [0.62, 0.15, 'out'], [0.9, 0.8, 'in'], [1, 0.5]]);
    p.lean = 12 * nod; p.faceY = 2 * nod; p.topA = 20 * nod; p.eye = nod > 0.6 ? 'closed' : 'half';
    return p;
  } },
  // referans: sırtüstü yuvarlanan tok civciv
  roll: { dur: 4.2, f: (u, c) => {
    const p = { ...c.B.sit, eye: 'happy' };
    const k = K(u, [[0, 0], [0.18, 1, 'io'], [0.82, 1], [1, 0, 'io']]);
    const w = Math.sin(u * TAU * 3);
    p.rr = -70 * k + 14 * w * k; p.ry = -3 * k; p.bsx = 1.08; p.bsy = 0.94;
    p.fLy = -5 * k * (0.5 + 0.5 * Math.sin(c.t * 9)); p.fRy = -5 * k * (0.5 + 0.5 * Math.sin(c.t * 9 + 2));
    p.aL = 40 * k; p.aR = 40 * k; p.blush = 0.5;
    return p;
  } },
  focus: { dur: 2.2, rep: true, f: (u, c) => {
    const p = { ...c.B.stand, eye: 'focus' };
    p.lean = 2 * Math.sin(u * TAU); p.aL = 20; p.aR = 20; p.fan = 0.6; p.topA = -6;
    return p;
  } },
  // referans: kaşığı tutup titreyen aç civciv
  hungry: { dur: 3, rep: true, f: (u, c) => {
    const p = moodPose({ ...c.B.stand }, 'hungry', c.F);
    const F = c.F;
    p.eye = 'up'; p.lookY = -0.6; p.rx = 0.45 * Math.sin(c.t * 55); p.aL = 20; p.aR = 48; p.mouth = 0.2;
    p.sweat = 1;
    p.props = F.kind === 'plant'
      ? [{ type: 'drop', x: 60 + F.w * 0.48, y: F.by - F.h * 0.75, s: 0.9, o: 0.9 }]
      : [{ type: 'spoon', x: 60 + F.w * 0.5, y: F.by - F.h * 0.62, a: 18 + 3 * Math.sin(c.t * 50), s: 0.85 }];
    return p;
  } },
  // ---- türe özel boşta hareketleri
  mirror: { dur: 3.2, f: (u, c) => {
    // referans: aynada kendine bakıp öpücük
    const p = { ...c.B.stand };
    const k = K(u, [[0, 0], [0.15, 1, 'io'], [0.88, 1], [1, 0]]);
    p.faceX = 2.5 + 3 * k; p.look = k; p.lean = -4 * k;
    const kiss = bump(u, 0.5, 0.75);
    p.eye = kiss > 0.2 ? 'closed' : 'open'; p.mouth = kiss * 0.3; p.blush = 0.4 + 0.4 * kiss; p.lean += 8 * kiss;
    p.props = [{ type: 'mirror', x: 60 + c.F.w * 0.62, y: c.F.by - c.F.h * 0.45, s: 0.95, t: c.t, op: k, back: false }];
    if (kiss > 0.4) p.props.push({ type: 'heart', x: 60 + c.F.w * 0.4, y: c.F.by - c.F.h * 0.9 - 8 * kiss, s: 0.6, o: kiss });
    return p;
  } },
  petals: { dur: 3.4, f: (u, c) => {
    // referans: çiçeğin yapraklarını tek tek koparan civciv
    const p = { ...c.B.sit, eye: 'half' };
    const k = K(u, [[0, 0], [0.12, 1, 'io'], [0.9, 1], [1, 0]]);
    const n = Math.floor(seg(u, 0.15, 0.85) * 5);
    const pull = (seg(u, 0.15, 0.85) * 5) % 1;
    p.aR = 30 + 30 * bump(pull, 0.2, 0.8) * k; p.aL = 20; p.lean = 4 * k;
    p.props = [{ type: 'flower', x: 60 + c.F.w * 0.46, y: c.F.by - c.F.h * 0.42, a: 12, s: 0.9 * k, petals: 7 - n, op: k }];
    for (let i = 0; i < n; i++) p.props.push({ type: 'petal', x: 60 + 16 + i * 4, y: G - 1, a: 70 + i * 23, s: 0.8, o: 0.9 });
    if (pull > 0.5 && n < 5) p.props.push({ type: 'petal', x: 60 + 16 + pull * 6, y: c.F.by - c.F.h * 0.4 + pull * 20, a: pull * 200, s: 0.8, o: 1 });
    return p;
  } },
  photo: { dur: 3.6, f: (u, c) => {
    // bitki: güneşe döner, yapraklarını açar
    const p = { ...c.B.stand };
    const k = K(u, [[0, 0], [0.2, 1, 'io'], [0.8, 1], [1, 0]]);
    p.lean = -7 * k; p.faceY = -1.5 * k; p.eye = k > 0.4 ? 'closed' : 'open'; p.blush = 0.5 * k; p.aL = 8 + 50 * k; p.aR = 8 + 50 * k; p.topA = -8 * k; p.topS = 1 + 0.08 * k;
    p.props = [{ type: 'sun', x: 60 + 34, y: c.F.by - c.F.h - 14, s: 0.8 * k, t: c.t, op: k }];
    if (k > 0.5) [0, 1, 2].forEach(i => { const q = (c.t * 0.7 + i / 3) % 1; p.props.push({ type: 'spark', x: 54 + i * 10, y: c.F.by - c.F.h * 0.8 - q * 10, s: 0.6, o: (1 - q) * k }); });
    return p;
  } },
  bubble: { dur: 3, f: (u, c) => {
    // damla: kabarcık üfler, kabarcık patlar
    const p = { ...c.B.stand };
    const blow = K(u, [[0, 0], [0.15, 1], [0.6, 1], [0.7, 0]]);
    const r = 1 + 7 * seg(u, 0.15, 0.6);
    p.mouth = 0.3 * blow; p.bsx = 1 + 0.05 * blow; p.eye = u > 0.62 && u < 0.75 ? 'squint' : 'open'; p.lean = -3 * blow;
    if (u < 0.62) p.props = [{ type: 'bubble', x: 60 + 4 + r * 0.9, y: c.F.by - c.F.h * 0.25 - r * 0.6, r, s: 1, o: 1 }];
    else if (u < 0.72) p.props = [0, 1, 2, 3].map(i => ({ type: 'drop', x: 70 + Math.cos(i * 1.6) * 10 * seg(u, 0.62, 0.72), y: c.F.by - c.F.h * 0.4 + Math.sin(i * 1.6) * 10 * seg(u, 0.62, 0.72), s: 0.5, o: 1 - seg(u, 0.62, 0.72) }));
    return p;
  } },
  wiggle: { dur: 1.2, f: (u, c) => {
    const p = { ...c.B.stand };
    const env = bump(u, 0.05, 0.95), w = Math.sin(u * TAU * 7) * env;
    p.lean = 10 * w; p.bsx = 1 + 0.06 * Math.abs(w); p.topA = 30 * Math.sin(u * TAU * 7 + 1) * env; p.aL = 30 + 20 * w; p.aR = 30 - 20 * w; p.eye = env > 0.3 ? 'squint' : 'open';
    return p;
  } },
  spin: { dur: 1.6, f: (u, c) => {
    const p = walkPose(c.B, c.F, (c.t * 2.6) % 1, true);
    const env = K(u, [[0, 0], [0.1, 1], [0.9, 1], [1, 0]]);
    p.spin = Math.cos(u * TAU * 2 * env); p.eye = 'happy';
    return p;
  } },
  // ---- yetenekler (form başına)
  ability: { dur: 2.6, f: (u, c) => ability(u, c) },
};

function ability(u, c) {
  const F = c.F, B = c.B, st = F.stage;
  if (F.kind === 'chick') {
    if (st === 0) {
      // kabuk şapka havaya fırlar, civciv kafasını çıkarıp fısıldar
      const p = hopJump(seg(u, 0, 0.45), c, 10);
      p.topA = 0; p.capUp = 30 * bump(u, 0.15, 0.7); p.capSpin = 360 * seg(u, 0.15, 0.6);
      p.eye = u > 0.5 ? 'happy' : 'wide';
      p.props = u > 0.55 ? [{ type: 'spark', x: 60 + 16, y: F.by - F.h - 6 - 6 * seg(u, 0.55, 1), s: 0.8, o: 1 - seg(u, 0.8, 1) }] : null;
      return p;
    }
    if (st <= 3) {
      // kanadını gagasına siper edip fısıldar
      const p = { ...B.stand };
      const k = K(u, [[0, 0], [0.15, 1, 'back'], [0.75, 1], [0.9, 0]]);
      p.lean = 10 * k; p.faceX = 2.5 + 3 * k; p.aR = 8 + 120 * k; p.aL = 20; p.eye = 'focus'; p.mouth = 0.4 * Math.abs(Math.sin(c.t * 14)) * k; p.blush = 0.4;
      p.props = [0, 1].map(i => { const q = seg(u, 0.25 + i * 0.2, 0.75 + i * 0.1); return { type: 'spark', x: 60 + F.w * 0.5 + 10 * q, y: F.by - F.h * 0.6 - 10 * q, s: 0.7, o: bump(q, 0, 1) }; });
      return p;
    }
    // tavus: kuyruğunu tamamen açar, tüyler parlar
    const p = { ...B.stand };
    const k = K(u, [[0, 0], [0.2, 1, 'back'], [0.8, 1], [1, 0.35]]);
    p.fan = 0.35 + 0.65 * k; p.fanShim = k; p.bsy = 1 + 0.05 * k; p.aL = 30 * k; p.aR = 30 * k; p.eye = k > 0.5 ? 'happy' : 'open';
    p.lean = 3 * Math.sin(u * TAU * 2) * k;
    p.props = [0, 1, 2, 3].map(i => { const a = (i / 4 + c.t * 0.4) * TAU; return { type: 'spark', x: 60 + Math.cos(a) * F.fanR * 0.9, y: F.by - F.h * 0.4 + Math.sin(a) * F.fanR * 0.5 - 10, s: 0.7, o: k * (0.5 + 0.5 * Math.sin(c.t * 8 + i)) }; });
    return p;
  }
  if (F.kind === 'plant') {
    const p = { ...B.stand };
    if (st === 0) {
      // tohum kıpırdar, filizi büyüyüp küçülür
      const w = Math.sin(u * TAU * 5) * bump(u, 0, 0.6);
      p.lean = 8 * w; p.topS = 1 + 0.8 * bump(u, 0.3, 0.95); p.topA = 10 * w; p.eye = u > 0.5 ? 'happy' : 'squint';
      return p;
    }
    if (st <= 3) {
      // yabani otu yerden söküp fırlatır
      const grab = K(u, [[0, 0], [0.15, 1, 'out'], [0.55, 1], [0.6, 0]]);
      const pull = K(u, [[0, 0], [0.2, 0], [0.5, 1, 'backIn']]);
      p.lean = 18 * grab - 14 * pull * grab; p.aR = 10 + 60 * grab; p.aL = 10 + 40 * grab; p.eye = pull > 0.2 && pull < 0.95 ? 'squint' : 'focus';
      p.bsy = 1 - 0.06 * grab; p.rx = -3 * pull * grab;
      const fly = seg(u, 0.55, 0.9);
      p.props = [{ type: 'weed', x: 60 + F.w * 0.55 - 40 * fly, y: G - 4 - 12 * pull * (1 - fly) - 30 * Math.sin(fly * Math.PI), a: 400 * fly, s: 0.9, u: pull, op: 1 - seg(u, 0.85, 0.95) }];
      if (u > 0.6) { p.eye = 'happy'; p.aL = 90 * bump(u, 0.6, 1); p.aR = 90 * bump(u, 0.6, 1); }
      return p;
    }
    if (st === 4) {
      // kaktüs: dikenlerini fırlatır
      const k = K(u, [[0, 0], [0.25, 1, 'out'], [0.35, -0.4, 'out'], [0.6, 0]]);
      p.bsx = 1 + 0.1 * k; p.bsy = 1 - 0.08 * k; p.aL = 20 + 40 * Math.max(0, -k); p.aR = 20 + 40 * Math.max(0, -k); p.eye = u > 0.3 ? 'angry' : 'squint';
      const fly = seg(u, 0.3, 0.8);
      p.props = fly > 0 ? [0, 1, 2, 3, 4, 5].map(i => { const a = rad(-160 + i * 28); return { type: 'spine', x: 60 + Math.cos(a) * (14 + 30 * fly), y: F.by - F.h * 0.5 + Math.sin(a) * (14 + 30 * fly), a: i * 28 - 160, s: 1, op: 1 - fly }; }) : null;
      return p;
    }
    // ulu ağaç: tacını sallar, yapraklar dökülür
    const env = bump(u, 0.05, 0.75), w = Math.sin(u * TAU * 6) * env;
    p.topA = 12 * w; p.lean = 4 * w; p.aL = 30 + 20 * w; p.aR = 30 - 20 * w; p.eye = env > 0.3 ? 'closed' : 'open';
    p.props = [0, 1, 2, 3, 4].map(i => { const q = seg(u, 0.1 + i * 0.08, 0.7 + i * 0.06); return { type: 'leaf', x: 34 + i * 13 + 8 * Math.sin(q * 6 + i), y: F.by - F.h - 10 + q * 52, a: q * 300 + i * 40, s: 0.9, o: bump(q, 0, 1), c: i % 2 ? '#7DBB72' : '#F6C6D6' }; });
    return p;
  }
  // damla: dalga — çömel, sıçra, inişte dalga ve kabarcıklar
  const p = hopJump(seg(u, 0, 0.6), c, st >= 4 ? 24 : 16);
  if (F.back === 'wings') p.wing = 50 * Math.sin(u * TAU * 4) * bump(u, 0.1, 0.5);
  const w = seg(u, 0.38, 0.95);
  p.props = [{ type: 'wave', x: 60, y: G, s: 1, u: w, op: w > 0 ? 1 : 0 }, ...[0, 1, 2].map(i => ({ type: 'bubble', x: 46 + i * 14, y: G - 6 - 30 * seg(u, 0.4 + i * 0.08, 1), r: 2.4 + i, s: 1, o: bump(seg(u, 0.4 + i * 0.08, 1), 0, 1) }))];
  if (u > 0.55) p.eye = 'happy';
  return p;
}

export const ALIAS = (name, F) => ({
  groom: F.kind === 'chick' ? 'mirror' : F.kind === 'plant' ? 'photo' : 'bubble',
  shake: 'wiggle', sniff: 'look', chase: 'spin', pounce: 'ability', dig: 'ability', home: 'sit',
}[name] || name);

// ---------------------------------------------------------------- çizim
function egg(cx, by, w, h, top = 1) {
  const hw = w / 2, my = by - h * 0.46;
  return `M${P(cx, by)} C${P(cx + w * 0.32, by)} ${P(cx + hw, by - h * 0.16)} ${P(cx + hw, my)} C${P(cx + hw, by - h * 0.8)} ${P(cx + w * 0.3 * top, by - h)} ${P(cx, by - h)} C${P(cx - w * 0.3 * top, by - h)} ${P(cx - hw, by - h * 0.8)} ${P(cx - hw, my)} C${P(cx - hw, by - h * 0.16)} ${P(cx - w * 0.32, by)} ${P(cx, by)} Z`;
}
function dropShape(cx, by, w, h) {
  // referans: geniş tabanlı, tepesi geriye kıvrılan damla
  const hw = w / 2;
  return `M${P(cx - hw, by - h * 0.32)} C${P(cx - hw, by - h * 0.05)} ${P(cx - w * 0.3, by)} ${P(cx, by)} C${P(cx + w * 0.34, by)} ${P(cx + hw, by - h * 0.06)} ${P(cx + hw, by - h * 0.36)} C${P(cx + hw, by - h * 0.78)} ${P(cx + w * 0.1, by - h * 0.92)} ${P(cx - w * 0.14, by - h * 0.92)} C${P(cx - w * 0.3, by - h * 0.95)} ${P(cx - w * 0.42, by - h * 1.12)} ${P(cx - w * 0.62, by - h * 1.05)} C${P(cx - w * 0.5, by - h * 0.86)} ${P(cx - hw, by - h * 0.62)} ${P(cx - hw, by - h * 0.32)} Z`;
}
const armPath = (type, side) => {
  const m = side; // -1 sol, +1 sağ (x yönü)
  switch (type) {
    case 'wing': return `M0 -2 C${4 * m} 0 ${6 * m} 8 ${2 * m} 14 C${-1 * m} 10 ${-1.5 * m} 4 0 -2 Z`;
    case 'leaf': return `M0 0 C${5 * m} 2 ${7 * m} 9 ${2 * m} 14 C${-1 * m} 9 ${-1 * m} 4 0 0 Z`;
    case 'stub': return `M0 0 C${3.4 * m} 1 ${4.4 * m} 6 ${1.6 * m} 8 C${-1 * m} 8 ${-1.4 * m} 3 0 0 Z`;
    case 'fin': return `M0 -1 C${5 * m} 1 ${7 * m} 7 ${5 * m} 11 C${2 * m} 9 ${-1 * m} 6 0 -1 Z`;
    case 'cactus': return `M0 -1 L${6 * m} -1 C${9 * m} -1 ${9 * m} 2 ${9 * m} 4 L${9 * m} 13 C${9 * m} 16 ${4 * m} 16 ${4 * m} 13 L${4 * m} 4.5 L0 4.5 Z`;
    case 'branch': return `M0 0 L${3 * m} 9 L${7 * m} 13 M${3 * m} 9 L${1 * m} 15`;
    default: return '';
  }
};

function topOps(F, p, x, y) {
  const o = [], s = p.topS ?? 1;
  const g = kids => op('top', 'g', { transform: `translate(${r1(x)} ${r1(y)}) rotate(${r1(p.topA || 0)}) scale(${r1(s * 100) / 100})` }, kids);
  const leaf = (k, x0, y0, a, sc, c, v) => op(k, 'g', { transform: `translate(${x0} ${y0}) rotate(${a}) scale(${sc})` }, [op(k + 'a', 'path', { d: 'M0 0 C7 -10 22 -12 27 -4 C21 6 7 6 0 0 Z', ...F_(c) }), op(k + 'b', 'path', { d: 'M2 -0.5 C10 -3 18 -4.5 24 -4', ...S_(v, 1.3) })]);
  switch (F.top) {
    case 'cap': {
      const up = p.capUp || 0, spin = p.capSpin || 0;
      return [op('top', 'g', { transform: `translate(${r1(x)} ${r1(y - up + 6)}) rotate(${r1((p.topA || 0) * 0.6 - 10 + spin)})` }, [op('capS', 'path', { d: 'M-19 2 C-18 -10 -9 -17 1 -17 C11 -17 19 -10 20 1 L14 -3 L9 3 L3 -4 L-3 3 L-9 -4 L-14 2 Z', ...F_('#F6EBD8') }), op('capD', 'ellipse', { cx: -5, cy: -10, rx: 2.6, ry: 1.8, ...F_('#E9D9BF') })])];
    }
    case 'tuft': return [g([op('tf', 'path', { d: 'M-4 2 C-7 -7 -1 -10 0 -4 C1 -11 8 -10 4 2 Z', ...F_(F.body) })])];
    case 'tuft2': return [g([op('tf', 'path', { d: 'M-8 3 C-12 -8 -4 -11 -3 -3 C-3 -14 7 -14 5 -3 C9 -11 17 -8 10 3 Z', ...F_(F.body) })])];
    case 'crest': {
      const [c1, c2] = F.crest;
      return [g([-7, 0, 7].flatMap((dx, i) => [op('cs' + i, 'path', { d: `M0 3 L${dx} ${-12 + Math.abs(dx) * 0.4}`, ...S_(c1, 1.7) }), op('cb' + i, 'ellipse', { cx: dx, cy: r1(-14 + Math.abs(dx) * 0.4), rx: 2.6, ry: 3.4, ...F_(c2) })]))];
    }
    case 'sprout0': return [g([op('st', 'path', { d: 'M0 2 C-1 -4 1 -8 5 -10', ...S_('#5C9A5A', 2.2) }), leaf('lf', 4.5, -9.5, -38, 0.42, '#7DB872', '#4E8A4E')])];
    case 'sprout': return [g([op('st', 'path', { d: 'M0 3 L0 -12', ...S_('#5C9A5A', 2.6) }), leaf('lf1', 0, -11, -152, 0.8, '#7DB872', '#4E8A4E'), leaf('lf2', 0, -11, -28, 0.9, '#8BC47F', '#4E8A4E')])];
    case 'daisy': {
      const petals = Array.from({ length: 12 }, (_, i) => op('pt' + i, 'ellipse', { cx: 0, cy: -9, rx: 3.3, ry: 7.4, transform: `rotate(${i * 30} 0 -17)`, ...F_(i % 2 ? '#F4EEE2' : '#FFFDF7') }));
      return [g([op('st', 'path', { d: 'M0 3 L0 -8', ...S_('#5C9A5A', 2.4) }), ...petals.map(pp => ({ ...pp, a: { ...pp.a, cy: -17 - 8 } })), op('ctr', 'circle', { cx: 0, cy: -17, r: 6.2, ...F_('#F2BE45') }), op('ctr2', 'circle', { cx: -1.4, cy: -18.4, r: 2, ...F_('#F7D06A') })])];
    }
    case 'tulip': return [g([op('st', 'path', { d: 'M0 3 L0 -8', ...S_('#5C9A5A', 2.4) }), op('tb', 'path', { d: 'M-10 -12 C-11 -2 -6 4 0 4 C6 4 11 -2 10 -12 C7 -9 5 -9 3.5 -15 C2 -10 -2 -10 -3.5 -15 C-5 -9 -7 -9 -10 -12 Z', ...F_('#D9505E'), transform: 'translate(0 -10)' }), op('tf', 'path', { d: 'M-5 -12 C-5 -4 -3 2 0 4 C3 2 5 -4 5 -12 C3 -9 1 -11 0 -17 C-1 -11 -3 -9 -5 -12 Z', ...F_('#EC6B78'), transform: 'translate(0 -10)' })])];
    case 'bloom': return [g([0, 72, 144, 216, 288].map((a, i) => op('bp' + i, 'ellipse', { cx: 0, cy: -6, rx: 3.4, ry: 5.6, transform: `rotate(${a} 0 -2)`, ...F_('#F28BB0') })).concat([op('bc', 'circle', { cx: 0, cy: -2, r: 3, ...F_('#F7D466') })])) ];
    case 'crown': {
      const R = F.crownR, cl = [[-16, -6, 14, '#4E8F55'], [16, -6, 14, '#4E8F55'], [0, -4, 15, '#4E8F55'], [-11, -18, 14, '#65A866'], [11, -18, 14, '#65A866'], [0, -26, 16, '#7DBB72'], [-3, -32, 6, '#93CB86'], [9, -26, 5, '#93CB86']];
      const fl = [[-17, -14], [-4, -36], [10, -32], [18, -14], [2, -16], [-10, -4], [13, -2]];
      return [g([...cl.map(([cx, cy, r, c], i) => op('cr' + i, 'circle', { cx, cy, r: r1(r * R / 30), ...F_(c) })), ...fl.map(([cx, cy], i) => op('fl' + i, 'circle', { cx, cy, r: i % 3 ? 2.4 : 3, ...F_(i % 2 ? '#F6C6D6' : '#EFA3BD') }))])];
    }
    case 'finears': return [op('top', 'g', {}, [op('feL', 'path', { d: `M${P(x - F.w * 0.36, y + F.h * 0.3)} c-7 -3 -9 -11 -5 -15 c2 5 5 8 9 9 Z`, ...F_(shade(F.body, -0.12)), transform: `rotate(${r1(-(p.topA || 0))} ${r1(x - F.w * 0.36)} ${r1(y + F.h * 0.3)})` }),
      op('feR', 'path', { d: `M${P(x + F.w * 0.36, y + F.h * 0.3)} c7 -3 9 -11 5 -15 c-2 5 -5 8 -9 9 Z`, ...F_(shade(F.body, -0.12)), transform: `rotate(${r1(p.topA || 0)} ${r1(x + F.w * 0.36)} ${r1(y + F.h * 0.3)})` })])];
    case 'gills': {
      const side = (m, k) => op(k, 'g', { transform: `translate(${r1(x + m * F.w * 0.42)} ${r1(y + F.h * 0.28)}) rotate(${r1(m * (p.topA || 0))})` },
        [-1, 0, 1].map(i => op(k + i, 'path', { d: `M0 0 C${m * 4} ${-4 + i * 4} ${m * 9} ${-7 + i * 5} ${m * 11} ${-9 + i * 6}`, ...S_(F.gill, 2.6) })));
      return [op('top', 'g', {}, [side(-1, 'gL'), side(1, 'gR')])];
    }
    case 'dorsal': return [g([op('df', 'path', { d: 'M-8 3 C-6 -6 0 -12 8 -14 C5 -8 5 -2 8 3 Z', ...F_(shade(F.body, -0.15)) })])];
    case 'horn1': return [g([op('hn', 'path', { d: 'M-2.6 2 L0.6 -9 L3 2 Z', ...F_('#F2E6C8') })])];
    case 'horn2': return [g([op('hn1', 'path', { d: 'M-9 3 C-10 -4 -12 -9 -16 -12 C-9 -11 -5 -6 -4 2 Z', ...F_('#F2E6C8') }), op('hn2', 'path', { d: 'M9 3 C10 -4 12 -9 16 -12 C9 -11 5 -6 4 2 Z', ...F_('#F2E6C8') })])];
    default: return o;
  }
}

export function draw(F, p, col, T, uid) {
  const o = [];
  const by = F.by, w = F.w * (p.bsx ?? 1), h = F.h * (p.bsy ?? 1);
  const cx = 60;
  // kuyruk (gövdenin arkasında, sol alttan çıkar)
  if (F.tail) {
    const tl = F.tail, n = tl.n, sl = tl.len / n;
    let pt = [cx - w * 0.4, by - h * 0.22]; const pts = [pt];
    for (let i = 0; i < n; i++) { const a = rad(165 + i * (84 / n) + (p.tailA || 0) * (0.4 + i / n) + 5 * Math.sin(T * 2.4 - i * 0.6)); pt = [pt[0] + Math.cos(a) * sl, Math.min(G - tl.w / 2, pt[1] + Math.sin(a) * sl)]; pts.push(pt); }
    o.push(op('tail', 'path', { d: smoothPath(pts), ...S_(F.body, tl.w) }));
    if (tl.fin) { const e = pts[pts.length - 1], q = pts[pts.length - 2], a = Math.atan2(e[1] - q[1], e[0] - q[0]) * 180 / Math.PI; o.push(op('tfin', 'path', { d: 'M-2 0 C2 -6 7 -8 10 -7 C8 -3 8 3 10 7 C7 8 2 6 -2 0 Z', ...F_(shade(F.body, -0.12)), transform: `translate(${P(...e)}) rotate(${r1(a)})` })); }
  }
  // arka süs: tavus yelpazesi / kanatlar
  if (F.back === 'fan') {
    const n = F.fanN, fo = clamp(p.fan || 0, 0, 1.2), R = F.fanR * (0.55 + 0.45 * fo), cyF = by - h * 0.35;
    const total = n <= 5 ? 60 + 40 * fo : n <= 7 ? 90 + 60 * fo : 110 + 70 * fo, step = total / (n - 1);
    const kids = [];
    for (let i = 0; i < n; i++) {
      const a = -90 + (i - (n - 1) / 2) * step;
      const ra = rad(a), x = cx + Math.cos(ra) * R, y = cyF + Math.sin(ra) * R;
      const shim = p.fanShim ? 0.85 + 0.15 * Math.sin(T * 9 + i) : 1;
      const rx = 6.5 + 2.5 * (n / 11), ry = 11 + 4 * (n / 11);
      kids.push(op('fs' + i, 'path', { d: `M${P(cx, cyF)} L${P(x, y)}`, ...S_('#2F7D4A', 1.4) }));
      kids.push(op('ff' + i, 'g', { transform: `translate(${P(x, y)}) rotate(${r1(a + 90)})` }, [
        op('a', 'ellipse', { cx: 0, cy: 0, rx: r1(rx), ry: r1(ry), ...F_(F.fanCol) }),
        op('b', 'ellipse', { cx: 0, cy: r1(-ry * 0.2), rx: r1(rx * 0.56 * shim), ry: r1(ry * 0.4 * shim), ...F_('#E8C84A') }),
        op('c', 'ellipse', { cx: 0, cy: r1(-ry * 0.2), rx: r1(rx * 0.38), ry: r1(ry * 0.28), ...F_('#1E7FA8') }),
        op('d', 'circle', { cx: 0, cy: r1(-ry * 0.24), r: r1(rx * 0.2), ...F_('#1B3F8F') })]));
    }
    o.push(op('fan', 'g', {}, kids));
  }
  if (F.back === 'wings') {
    const s = F.wingS, fl = (p.wing || 0) + 6 * Math.sin(T * 1.8);
    const wing = (m, k) => op(k, 'path', { d: `M0 0 C${m * 10} -14 ${m * 26} -22 ${m * 34} -18 C${m * 28} -12 ${m * 30} -6 ${m * 26} -2 C${m * 22} -6 ${m * 18} -3 ${m * 16} 2 C${m * 12} -2 ${m * 8} 0 0 6 Z`, ...F_(shade(F.body, -0.2)), transform: `translate(${r1(cx + m * w * 0.18)} ${r1(by - h * 0.62)}) rotate(${r1(-m * fl)}) scale(${s})` });
    o.push(wing(-1, 'wgL'), wing(1, 'wgR'));
  }
  // bacaklar (tavus) ve ayaklar
  const fy = G - 2.4;
  const fL = [cx - w * 0.2 + (p.fLx || 0), fy + (p.fLy || 0)], fR = [cx + w * 0.2 + (p.fRx || 0), fy + (p.fRy || 0)];
  if (F.legH) o.push(op('legs', 'path', { d: `M${P(cx - 6, by - 2)} L${P(fL[0], fL[1])} M${P(cx + 6, by - 2)} L${P(fR[0], fR[1])}`, ...S_(F.feet, 2.6) }));
  if (F.feet) {
    const fw = F.foot === 'stub' ? 4.6 : F.foot === 'root' ? 6 : 6, fh = F.foot === 'stub' ? 3.4 : 3;
    o.push(op('ftL', 'ellipse', { cx: r1(fL[0] - 1), cy: r1(fL[1]), rx: fw, ry: fh, ...F_(F.feet) }), op('ftR', 'ellipse', { cx: r1(fR[0] + 1), cy: r1(fR[1]), rx: fw, ry: fh, ...F_(F.feet) }));
  }
  if (F.mound) o.push(op('mound', 'path', { d: `M${cx - 30} ${G + 1} C${cx - 22} ${G - 9} ${cx + 22} ${G - 9} ${cx + 30} ${G + 1} Z`, ...F_('#8A6A4E') }));
  // gövde grubu: yaslanma ve ezilme gövdenin tabanından
  const bodyK = [];
  const bodyD = F.shape === 'drop' ? dropShape(cx, by, w, h) : egg(cx, by, w, h, F.kind === 'chick' && F.stage <= 2 ? 1.05 : 0.92);
  bodyK.push(op('defs', 'defs', {}, [op('clip', 'clipPath', { id: uid + 'c' }, [op('clipP', 'path', { d: bodyD })])]));
  bodyK.push(op('body', 'path', { d: bodyD, ...F_(F.body) }));
  const inner = [];
  if (F.belly) inner.push(op('belly', 'ellipse', { cx, cy: r1(by - h * 0.2), rx: r1(w * 0.32), ry: r1(h * 0.22), ...F_(F.belly) }));
  inner.push(op('shd', 'ellipse', { cx: r1(cx - w * 0.52), cy: r1(by - h * 0.42), rx: r1(w * 0.24), ry: r1(h * 0.66), ...F_(shade(F.body, -0.08)), opacity: '.4' }));
  if (F.ribs) inner.push(op('ribs', 'path', { d: `M${P(cx - w * 0.2, by - h * 0.92)} C${P(cx - w * 0.3, by - h * 0.6)} ${P(cx - w * 0.3, by - h * 0.3)} ${P(cx - w * 0.22, by - 1)} M${P(cx + w * 0.2, by - h * 0.92)} C${P(cx + w * 0.3, by - h * 0.6)} ${P(cx + w * 0.3, by - h * 0.3)} ${P(cx + w * 0.22, by - 1)}`, ...S_(shade(F.body, -0.12), 1.4) }),
    ...[[-0.33, 0.7], [0.36, 0.66], [-0.3, 0.3], [0.33, 0.25], [0, 0.88]].map(([dx, dy], i) => op('sp' + i, 'path', { d: `M${P(cx + w * dx - 1.4, by - h * dy)} l2.8 0 M${P(cx + w * dx, by - h * dy - 1.4)} l0 2.8`, ...S_('#E8F2D8', 0.9) })));
  if (F.bark) inner.push(op('bark', 'path', { d: `M${P(cx - w * 0.22, by - h * 0.15)} C${P(cx - w * 0.25, by - h * 0.4)} ${P(cx - w * 0.2, by - h * 0.6)} ${P(cx - w * 0.24, by - h * 0.85)} M${P(cx + w * 0.24, by - h * 0.1)} C${P(cx + w * 0.27, by - h * 0.35)} ${P(cx + w * 0.22, by - h * 0.55)} ${P(cx + w * 0.26, by - h * 0.8)}`, ...S_(shade(F.body, -0.14), 1.6) }));
  const shellOps = [];
  if (F.shell) shellOps.push(op('shell', 'path', { d: `M${P(cx - w * 0.62, by - h * 0.46)} L${P(cx - w * 0.46, by - h * 0.56)} L${P(cx - w * 0.32, by - h * 0.44)} L${P(cx - w * 0.16, by - h * 0.58)} L${P(cx, by - h * 0.45)} L${P(cx + w * 0.16, by - h * 0.58)} L${P(cx + w * 0.32, by - h * 0.44)} L${P(cx + w * 0.46, by - h * 0.56)} L${P(cx + w * 0.62, by - h * 0.46)} L${P(cx + w * 0.62, by + 2)} L${P(cx - w * 0.62, by + 2)} Z`, ...F_('#F6EBD8') }),
    op('shellD', 'path', { d: `M${P(cx - w * 0.4, by - h * 0.2)} C${P(cx - w * 0.3, by - h * 0.05)} ${P(cx - w * 0.1, by)} ${P(cx + w * 0.05, by)}`, ...S_('#E9D9BF', 2.4) }));
  bodyK.push(op('inner', 'g', { 'clip-path': `url(#${uid}c)` }, inner), ...shellOps);
  // kollar / kanatlar / yapraklar
  if (F.arms) {
    const ay = by - h * (F.arms === 'cactus' ? 0.55 : 0.42);
    const arm = (m, a, k) => {
      const x = cx + m * w * (F.arms === 'cactus' ? 0.46 : 0.45);
      const isB = F.arms === 'branch';
      const ops = [op(k + 's', 'path', { d: armPath(F.arms, m), ...(isB ? S_(F.armCol, 2.6) : F_(F.armCol)) })];
      if (isB) ops.push(op(k + 'l', 'ellipse', { cx: r1(m * 8), cy: 14, rx: 3.6, ry: 2.2, ...F_('#65A866') }));
      if (F.armTip) ops.push(op(k + 't', 'path', { d: `M${2 * m} 14 C${-1 * m} 12 ${-1 * m} 9 ${1 * m} 8 C${4 * m} 9 ${5 * m} 12 ${2 * m} 14 Z`, ...F_(F.armTip) }));
      return op(k, 'g', { transform: `translate(${r1(x)} ${r1(ay)}) rotate(${r1(m < 0 ? a : -a)})` }, ops);
    };
    bodyK.push(arm(-1, p.aL ?? 8, 'arL'), arm(1, p.aR ?? 8, 'arR'));
  }
  // yüz
  const fx = cx + (p.faceX ?? 2.5), fyy = by - h * F.eyeY + (p.faceY || 0);
  const g2 = F.eyeGap;
  const face = [];
  if (F.blush || p.blush) face.push(...blush(fx - g2 - 3.4, fx + g2 + 3.4, fyy + 5.2, 1, clamp((F.blush || 0) + (p.blush || 0), 0, 0.9)));
  face.push(...eyes(F.eyeFam, fx - g2, fx + g2, fyy, F.eyeR, p.eye || 'open', p.blink || 0, p.look || 0, p.lookY || 0, colors(F)));
  if (F.beak) face.push(...mouth('beak', fx, fyy + 6 * F.beak, F.beak, '', p.mouth || 0, 0, colors(F)));
  else if (F.mouth === 'cat') {
    const m = p.mouth || 0;
    if (m > 0.08) face.push(op('mo', 'ellipse', { cx: r1(fx), cy: r1(fyy + 6.4), rx: r1(2 + m), ry: r1(0.8 + m * 2.6), fill: '#3a1f3a' }));
    else face.push(op('mo', 'path', { d: `M${P(fx - 3, fyy + 5.4)} Q${P(fx - 1.5, fyy + 7.6)} ${P(fx, fyy + 5.6)} Q${P(fx + 1.5, fyy + 7.6)} ${P(fx + 3, fyy + 5.4)}`, ...S_('#2b3a5a', 1.3) }));
  } else face.push(...mouth('tiny', fx, fyy + 5.6, 1, p.eye === 'happy' ? 'happy' : p.eye === 'sad' ? 'sad' : '', p.mouth || 0, 0, { ...colors(F), line: F.mouthCol || '#3a2a30', mouth: '#5a2a34' }));
  if (p.tears) face.push(op('tr1', 'path', { d: `M${P(fx - g2, fyy + 1)} C${P(fx - g2 - 2, fyy + 10)} ${P(fx - g2 + 1, fyy + 18)} ${P(fx - g2 - 1, by - 2)}`, ...S_('#7CC6F5', 2.6), opacity: '.85' }), op('tr2', 'path', { d: `M${P(fx + g2, fyy + 1)} C${P(fx + g2 + 2, fyy + 10)} ${P(fx + g2 - 1, fyy + 18)} ${P(fx + g2 + 1, by - 2)}`, ...S_('#7CC6F5', 2.6), opacity: '.85' }));
  if (p.sweat) face.push(op('sw', 'path', { d: `M${P(fx + g2 + 8, fyy - 8)} C${P(fx + g2 + 11, fyy - 3)} ${P(fx + g2 + 5, fyy - 1)} ${P(fx + g2 + 7, fyy - 7)} Z`, fill: '#9FDCFF' }));
  bodyK.push(op('face', 'g', {}, face));
  bodyK.push(...topOps(F, p, cx + (p.faceX ?? 2.5) * 0.3, by - h + (F.top === 'cap' ? 8 : 2)));
  o.push(op('bodyG', 'g', { transform: `rotate(${r1(p.lean || 0)} ${cx} ${by})` }, bodyK));
  return o;
}

export function footprint(F, p) {
  const r = p.rr || 0;
  if (Math.abs(r) > 45) { const H = G - F.by + F.h * (p.bsy ?? 1); return { cx: 60 + Math.sign(r) * H * 0.55, w: H * 0.9 }; }
  return { cx: 60, w: F.w * (p.bsx ?? 1) * 0.95 };
}

export function setup(kind, stage) {
  const F = form(kind, stage);
  return { F, B: bases(F), col: colors(F), k: kind === 'plant' && stage === 5 ? 0.92 : 1 };
}
export const cycleLen = (F, mode) => (F.hopper ? (mode === 'run' ? 34 : 24) : (mode === 'run' ? 24 : 16) * (F.w / 50));
export const SPRINGS = { topA: [90, 7], tailA: [60, 6], lean: [260, 18], aL: [200, 14], aR: [200, 14], fan: [90, 10] };
export const KICK = { topA: 0.05, tailA: 0.04 };
export const BASES = { idle: 'idle', sit: 'sit', walk: 'walk', run: 'run', sleep: 'sleep', lie: 'lie', dead: 'dead', home: 'sit' };
export const STATIC = { stand: 'idle', sit: 'sit', loaf: 'sleep', lie: 'lie', flat: 'dead', run: 'run', jump: 'hop', walk: 'walk' };
export function belly(p, b) { return { ...p, bsx: (p.bsx ?? 1) * (1 + 0.14 * b), bsy: (p.bsy ?? 1) * (1 - 0.04 * b) }; }
