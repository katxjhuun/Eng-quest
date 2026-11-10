// Kedi ve köpek: yandan görünen, iskeletli siluet karakterler (referans: düz renk gövde, beyaz "O" gözler).
// viewBox 0 0 120 120, zemin y=108, yüz sağa bakar. Poz = kanallar (sayılar) → çizim.
import { K, EASE, seg, bump, blend, clamp, lerp, rad, r1, P, smoothPath, ik, shade, lum, wob, TAU } from './anim.js';
import { op, eyes, mouth, MOOD_EYE } from './face.js';

export const G = 108;

// ---------------------------------------------------------------- tüy renkleri (rastgele atanır)
export const COATS = {
  // lo-fi: kırık, tozlu tonlar (doygun turuncu/sarı yok)
  // gerçek tüy renkleri; baskı geçişi bunları retro mürekkeplere çevirir (zencefil, kül, kömür, krem, tarçın...)
  cat: ['#C9773F', '#8A8890', '#2B2629', '#E2D3B4', '#7A5844', '#EDE4D2', '#55505A', '#D9A35C'],
  dog: ['#B07A4C', '#6E5040', '#D9B57C', '#E6DAC2', '#8C8E94', '#2B2629', '#A06A4C', '#C99A5E'],
};
// göz rengi tüyle eşleşir (kedi: amber/yeşil/gri-mavi; köpek: koyu kahve)
const IRIS = { cat: ['#C9A24A', '#8FA36A', '#C9A24A', '#7E9AA6', '#B98E45', '#7E9AA6', '#9DB07A', '#B98E45'], dog: ['#6B4A33', '#3A2A22', '#4A3326', '#5A3E2C', '#4A3326', '#5A3E2C', '#3A2A22', '#7A5638'] };
export function coatColors(b) {
  const L = lum(b), dark = L < 0.1, light = L > 0.45;
  return {
    b, dark, light,
    far: dark ? shade(b, 0.07) : shade(b, -0.1),
    mark: dark ? shade(b, 0.16) : shade(b, light ? -0.22 : -0.34),
    under: dark ? shade(b, 0.28) : shade(b, 0.5),
    white: '#FFFFFF', pupil: dark ? '#141116' : '#231d27', line: dark ? '#EFE3CC' : '#2A2230', lid: b,
    rim: null,
  };
}

// ---------------------------------------------------------------- evrim formları
const CAT = [
  { name: 'kitten', k: 0.92, hs: 1.26, leg: 0.72, len: 0.7, th: 0.96, tail: 4.4, tailLen: 0.72 },
  { name: 'tabby', k: 0.96, hs: 1.1, leg: 0.88, len: 0.88, th: 0.98, tail: 4.8, tailLen: 1, marks: 'stripes' },
  { name: 'lynx', k: 0.99, hs: 1.06, leg: 1.02, len: 0.92, th: 1.03, tail: 5.6, tailLen: 0.34, tufts: true, ruff: true, marks: 'spots' },
  { name: 'puma', k: 1, hs: 1, leg: 1.05, len: 1.06, th: 1, tail: 5, tailLen: 1.15 },
  { name: 'leopard', k: 1.03, hs: 1, leg: 1.05, len: 1.12, th: 1.02, tail: 5, tailLen: 1.15, marks: 'rosettes' },
  { name: 'panther', k: 1.08, hs: 1.02, leg: 1.08, len: 1.16, th: 1.03, tail: 5.2, tailLen: 1.22, glow: '#D9B45A' },
];
const DOG = [
  { name: 'puppy', k: 0.92, hs: 1.22, leg: 0.72, len: 0.72, th: 1.03, ears: 'floppy', tail: 5.4, tailLen: 0.42 },
  { name: 'pup', k: 0.96, hs: 1.06, leg: 0.92, len: 0.88, th: 1, ears: 'mixed', tail: 5, tailLen: 0.66 },
  { name: 'shepherd', k: 0.96, hs: 1, leg: 1.02, len: 1, th: 1.03, ears: 'pointy', tail: 6.2, tailLen: 0.86, marks: 'saddle', collar: '#9E5A4E' },
  { name: 'youngwolf', k: 0.99, hs: 0.98, leg: 1.04, len: 1.04, th: 1, ears: 'pointy', tail: 7, tailLen: 0.9, marks: 'wolf', bush: true },
  { name: 'wolf', k: 1.04, hs: 0.98, leg: 1.08, len: 1.1, th: 1.04, ears: 'pointy', tail: 7.6, tailLen: 0.95, marks: 'wolf', bush: true, ruff: true },
  { name: 'alpha', k: 1.1, hs: 1, leg: 1.1, len: 1.14, th: 1.1, ears: 'pointy', tail: 8, tailLen: 1, marks: 'wolf', bush: true, ruff: true, mane: true, glow: '#C9A55A' },
];
export function form(kind, stage) {
  const f = (kind === 'dog' ? DOG : CAT)[clamp(stage | 0, 0, 5)];
  const A = 11.2 * f.leg;
  return { ...f, kind, dog: kind === 'dog', A, rc: 12.5 * f.th, rr: 11.5 * f.th, L: 27 * f.len, lw: 6.2 * f.th };
}

// ---------------------------------------------------------------- temel pozlar
export function bases(F) {
  const { A, rc, rr, L, lw, hs, dog } = F, lift = lw / 2, gy = G - lift;
  const standY = gy - 2 * A * 0.965;
  const stand = {
    rx: 0, ry: 0, rr: 0, sx: 1, sy: 1, rcS: 1, rrS: 1, tuck: 0, inv: 0, haunch: 0, arch: 0, sag: 1.4,
    hipX: 60 - L / 2, hipY: standY - rr * 0.4, chestX: 60 + L / 2, chestY: standY - rc * 0.35 - (dog ? 1 : 0),
    headX: 60 + L / 2 + (dog ? 9 : 7.5) * hs, headY: standY - rc * 0.35 - rc * 0.55 - (dog ? 10.5 : 9.5) * hs, headA: 0,
    earA: 0, earB: 0,
    fnX: 60 + L / 2 + 3, fnY: gy, ffX: 60 + L / 2 - 2, ffY: gy, hnX: 60 - L / 2 + 2, hnY: gy, hfX: 60 - L / 2 - 3, hfY: gy,
    tailB: 205, tailA: dog ? 228 : 152, tailC: dog ? 7 : 16, tailW: dog ? 5 : 4, tailF: dog ? 1.6 : 0.5, puff: 0, tailFront: 0,
    eye: 'open', look: 0, lookY: 0, mouth: 0, tongue: 0, props: null,
  };
  const head = (p, dx, dy, a = 0) => ({ headX: p.chestX + dx * hs, headY: p.chestY + dy * hs, headA: a });
  // oturuş: kalça yerde, gövde dik, ön bacaklar düz
  const sitChestY = gy - 2 * A * 0.975 - rc * 0.35;
  const sit = { ...stand, rrS: 1.2, rcS: 0.94, hipX: 50.5, hipY: G - rr * 1.2, chestX: 60.5, chestY: Math.min(sitChestY, G - rr * 1.2 - 8), haunch: 1, arch: 3, sag: 2,
    fnX: 64.5, ffX: 61.5, hnX: 62, hfX: 58.5, hnY: gy, hfY: gy, tailB: 192, tailA: 172, tailC: 15, tailW: 3, tailF: 0.45 };
  Object.assign(sit, head(sit, dog ? 6 : 5, dog ? -rc / hs * 0.5 - 10.5 : -rc / hs * 0.6 - 9));
  // somun: yere yatmış, bacaklar içeride, kuyruk öne sarılı (referans: uyuyan kedi)
  const loaf = { ...stand, rcS: 0.96, rrS: 1.3, tuck: 1, hipX: 60 - L * 0.32, hipY: G - rr * 1.3 + 0.5, chestX: 60 + L * 0.34, chestY: G - rc * 0.96 + 0.5, arch: 3, sag: 0,
    fnX: 60 + L * 0.34 + 5, ffX: 60 + L * 0.34 + 3, hnX: 60 - L * 0.32 + 6, hfX: 60 - L * 0.32 + 4, fnY: gy, ffY: gy, hnY: gy, hfY: gy,
    tailB: 115, tailA: 8, tailC: -15, tailL: 1.35, tailW: 1.5, tailF: 0.3, tailFront: 1 };
  Object.assign(loaf, { headX: loaf.chestX + 7 * hs, headY: G - 11.5 * hs, headA: 4 });
  // sırtüstü, bacaklar havada (yuvarlanma, bayılma)
  const back = { ...stand, inv: 1, tuck: 0, hipX: 60 - L * 0.42, hipY: G - rr * 0.92, chestX: 60 + L * 0.4, chestY: G - rc * 0.9, arch: -2, sag: -1,
    fnX: 60 + L * 0.4 + 5, fnY: G - rc * 1.25 - 2 * A * 0.95, ffX: 60 + L * 0.4 + 1, ffY: G - rc * 1.25 - 2 * A * 0.9, hnX: 60 - L * 0.42 + 1, hnY: G - rr * 1.3 - 2 * A * 0.95, hfX: 60 - L * 0.42 - 3, hfY: G - rr * 1.3 - 2 * A * 0.9,
    tailB: 170, tailA: 178, tailC: 4, tailW: 2, tailF: 0.5 };
  Object.assign(back, { headX: back.chestX + 11 * hs, headY: G - 11 * hs, headA: 22 });
  // eğilme (gerinme, oyun daveti): ön alçak, arka yüksek
  const bow = { ...stand, chestX: 60 + L * 0.62, chestY: G - rc * 0.95 - 2.5, hipX: 60 - L * 0.4, arch: -3, sag: 0,
    fnX: 60 + L * 0.62 + 17, ffX: 60 + L * 0.62 + 13, hnX: 60 - L * 0.4 + 2, hfX: 60 - L * 0.4 - 3, tailA: 245, tailC: 6, tailW: 6, tailF: 2 };
  Object.assign(bow, { headX: bow.chestX + 11 * hs, headY: G - 15 * hs, headA: 6 });
  // çömelme (zıplamaya hazırlık)
  const crouch = { ...stand, hipY: stand.hipY + 6, chestY: stand.chestY + 5, arch: 2, sag: 0.5, hipX: stand.hipX + 1, chestX: stand.chestX - 1,
    fnX: stand.fnX + 1, hnX: stand.hnX - 1, tailA: stand.tailA - 8 };
  Object.assign(crouch, { headX: crouch.chestX + 8 * hs, headY: crouch.chestY - rc * 0.4 - 8 * hs, headA: 4 });
  // havada uzanmış (sıçrayış)
  const leap = { ...stand, hipX: 60 - L * 0.58, chestX: 60 + L * 0.58, hipY: stand.hipY + 1, chestY: stand.chestY - 1, arch: -2, tuck: 0.05,
    fnX: 60 + L * 0.58 + 13, fnY: stand.chestY + 14, ffX: 60 + L * 0.58 + 10, ffY: stand.chestY + 16,
    hnX: 60 - L * 0.58 - 13, hnY: stand.hipY + 12, hfX: 60 - L * 0.58 - 10, hfY: stand.hipY + 14, tailA: 196, tailC: 5, tailW: 0, earA: -10, earB: -10 };
  Object.assign(leap, head(leap, 8.5, -rc / hs * 0.4 - 8.5, -6));
  // havada toplanmış
  const gather = { ...stand, hipX: 60 - L * 0.42, chestX: 60 + L * 0.42, arch: 6, tuck: 0.35,
    fnX: 60 + L * 0.42 - 1, fnY: stand.chestY + 13, ffX: 60 + L * 0.42 - 4, ffY: stand.chestY + 14,
    hnX: 60 - L * 0.42 + 5, hnY: stand.hipY + 12, hfX: 60 - L * 0.42 + 2, hfY: stand.hipY + 13, tailA: 220, tailC: 10 };
  Object.assign(gather, head(gather, 8, -rc / hs * 0.5 - 9, 6));
  // kamburlaşma (irkilen kedi): sırt kemer, kuyruk kabarık dik
  const arch = { ...stand, arch: 11, sag: 4, hipY: stand.hipY - 2.5, chestY: stand.chestY - 1.5, hipX: stand.hipX + 2, chestX: stand.chestX - 2,
    tailA: 262, tailC: 2, tailW: 0, puff: 1, earA: -18, earB: -18, eye: 'wide' };
  Object.assign(arch, head(arch, 7, -rc / hs * 0.2 - 6, 6));
  return { stand, sit, loaf, back, bow, crouch, leap, gather, arch, gy, lift };
}

// ruh haline göre temel duruş ayarı
export function moodPose(p, mood, F) {
  const o = { ...p };
  if (!o.eye || o.eye === 'open') o.eye = MOOD_EYE[mood] || 'open';
  switch (mood) {
    case 'sad': case 'hungry':
      o.earA -= 26; o.earB -= 22; o.headA += 10; o.headY += 3; o.headX -= 1;
      if (o.haunch < 0.5 && o.tuck < 0.5) { o.tailA = F.dog ? 150 : 128; o.tailC = F.dog ? 3 : 7; }
      o.tailW = 1; o.tailF = 0.3; break;
    case 'happy': case 'love': case 'eat':
      if (F.dog) { o.tailW = 18; o.tailF = 4.2; o.tailA = Math.max(o.tailA, 225); o.tongue = 0.7; }
      else if (o.tailFront < 0.5) { o.tailA = Math.max(o.tailA, 200); o.tailW = 7; o.tailF = 1.4; }
      o.earA += 4; o.earB += 4; break;
    case 'focus': o.earA += 6; o.earB += 6; o.headY -= 1.5; o.tailW = 2; break;
    case 'groggy': case 'sleepy': o.earA -= 10; o.earB -= 8; o.headA += 6; o.headY += 1.5; o.tailW = 1.5; o.tailF = 0.3; break;
    case 'full': o.sag += 5; o.rcS *= 1.06; o.rrS *= 1.08; break;
    case 'surprised': o.earA += 8; o.earB += 8; break;
    case 'poked': o.earA -= 14; o.earB -= 14; break;
  }
  return o;
}

// ---------------------------------------------------------------- yürüme ve koşu (adım fazı mesafeden gelir)
function walkPose(B, F, ph, sp = 1) {
  const p = { ...B.stand };
  const stride = 8.5 * F.leg * sp, lift = 5.5 * F.leg;
  const leg = (off) => {
    const q = ((ph + off) % 1 + 1) % 1;
    if (q < 0.6) { const u = q / 0.6; return [stride - 2 * stride * u, 0]; }
    const u = (q - 0.6) / 0.4; return [-stride + 2 * stride * EASE.sine(u), -lift * Math.sin(Math.PI * u)];
  };
  const fn = leg(0.25), ff = leg(0.75), hn = leg(0), hf = leg(0.5);
  p.fnX += fn[0]; p.fnY += fn[1]; p.ffX += ff[0]; p.ffY += ff[1]; p.hnX += hn[0]; p.hnY += hn[1]; p.hfX += hf[0]; p.hfY += hf[1];
  const b2 = Math.cos(ph * TAU * 2);
  p.chestY += b2 * 0.9; p.hipY += Math.cos(ph * TAU * 2 + 1.4) * 0.9;
  p.headY += Math.cos(ph * TAU * 2 + 0.6) * 1.1; p.headA += Math.sin(ph * TAU * 2) * 2;
  p.tailA += Math.sin(ph * TAU) * 6;
  return p;
}
function runPose(B, F, ph) {
  const p = { ...B.stand };
  const ext = Math.sin(ph * TAU); // + uzanma, - toplanma
  p.hipX -= 3.2 * ext; p.chestX += 3.2 * ext; p.arch = -2 - 4 * ext; p.sag = 0;
  const s = 12 * F.leg, lf = 8 * F.leg;
  const leg = (off) => {
    const q = ((ph + off) % 1 + 1) % 1;
    if (q < 0.42) { const u = q / 0.42; return [s - 2 * s * u, 0]; }
    const u = (q - 0.42) / 0.58; return [-s + 2 * s * EASE.io(u), -lf * Math.sin(Math.PI * u)];
  };
  const fn = leg(0.0), ff = leg(0.08), hn = leg(0.5), hf = leg(0.58);
  p.fnX += fn[0]; p.fnY += fn[1]; p.ffX += ff[0]; p.ffY += ff[1]; p.hnX += hn[0]; p.hnY += hn[1]; p.hfX += hf[0]; p.hfY += hf[1];
  const up = Math.max(0, Math.sin(ph * TAU + 0.6));
  p.ry = -3.5 * up; p.rr = -3 * ext;
  p.headX += 2 + 1.2 * ext; p.headY += 2 - 1.5 * Math.sin(ph * TAU + 1); p.headA = 6;
  p.earA = -22; p.earB = -22; p.tailA = 186 + 8 * ext; p.tailC = 3; p.tailW = 0;
  return p;
}

// ---------------------------------------------------------------- klipler
// her klip: { dur (sn), loop, f(u, c) → poz }; c = { B, F, t (sn), mood, ph, food, stage }
const cyc = (c, hz) => Math.sin(c.t * TAU * hz);

export const CLIPS = {
  idle: { dur: 6, loop: true, f: (u, c) => {
    const p = { ...c.B.stand };
    p.chestX += 0.5 * wob(c.t * 0.5); p.headA += 2.2 * wob(c.t * 0.4, 2); p.headY += 0.4 * wob(c.t * 0.6, 4);
    p.tailA += 7 * wob(c.t * 0.45, 1); p.tailC += 4 * wob(c.t * 0.3, 3);
    return p;
  } },
  sit: { dur: 6, loop: true, f: (u, c) => {
    const p = { ...c.B.sit };
    p.headA += 2.5 * wob(c.t * 0.35, 1); p.tailA += 10 * wob(c.t * 0.5, 2); p.tailC += 5 * wob(c.t * 0.4, 5);
    return p;
  } },
  walk: { dur: 1, loop: true, phase: true, f: (u, c) => walkPose(c.B, c.F, c.ph) },
  run: { dur: 1, loop: true, phase: true, f: (u, c) => runPose(c.B, c.F, c.ph) },
  sleep: { dur: 4.4, loop: true, f: (u, c) => {
    const p = { ...c.B.loaf, eye: 'closed' };
    const br = Math.sin(u * TAU);
    p.rrS *= 1 + 0.035 * br; p.rcS *= 1 + 0.025 * br; p.hipY -= 0.6 * br; p.headY += 0.35 * br;
    p.tailC += 2 * wob(c.t * 0.2);
    return p;
  } },
  lie: { dur: 5, loop: true, f: (u, c) => {
    const p = { ...c.B.loaf, sag: 3, rcS: 1.02, rrS: 1.34 };
    p.headY -= 4 * c.F.hs; p.headX += 1; p.headA = -2 + 2 * wob(c.t * 0.3);
    p.tailC = -24 + 4 * wob(c.t * 0.4);
    return p;
  } },
  dead: { dur: 3, loop: true, f: (u, c) => {
    const p = { ...c.B.back, eye: 'x', tuck: 0.15 };
    p.props = [{ type: 'halo', x: p.headX + 2, y: p.headY - 18 * c.F.hs + Math.sin(u * TAU) * 1.2, s: c.F.hs }];
    return p;
  } },

  // ---- tek seferlik tepkiler
  hop: { dur: 0.95, f: (u, c) => jump(u, c, 22) },
  joy: { dur: 0.95, f: (u, c) => jump(u, c, 22) },
  dance: { dur: 1.5, f: (u, c) => {
    const B = c.B, q = (u * 2) % 1, n = Math.floor(u * 2);
    const p = jump(q, c, 14);
    p.rr += (n ? 1 : -1) * 8 * bump(q, 0.2, 0.7);
    if (!c.F.dog) p.tailA = 235 + 10 * Math.sin(u * TAU * 2);
    p.eye = 'happy';
    return p;
  } },
  eat: { dur: 2.2, rep: true, f: (u, c) => {
    const B = c.B, F = c.F;
    const down = K(u, [[0, 0], [0.16, 1, 'out'], [0.84, 1], [1, 0, 'io']]);
    const p = blend(B.stand, { ...B.stand, chestY: B.stand.chestY + 3, chestX: B.stand.chestX + 1, hipY: B.stand.hipY - 1, arch: 2,
      headX: B.stand.chestX + 12 * F.hs, headY: G - 13 * F.hs, headA: 28 }, down);
    const peck = down * Math.abs(Math.sin(u * TAU * 4.5));
    p.headY += peck * 2.6; p.headA += peck * 5; p.mouth = peck * 0.8;
    p.eye = u > 0.15 && u < 0.85 ? 'happy' : 'open';
    if (!F.dog) { p.tailA = 205 + 12 * Math.sin(u * TAU * 2); p.tailC = 13; } else { p.tailW = 16; p.tailF = 4; p.tailA = 232; }
    const fill = 1 - seg(u, 0.18, 0.84);
    p.props = [{ type: 'bowl', x: B.stand.chestX + 15 * F.hs, y: G, s: F.hs * 0.95, food: c.food, full: fill }];
    return p;
  } },
  flinch: { dur: 0.75, f: (u, c) => {
    const B = c.B;
    const k = K(u, [[0, 0], [0.12, 1, 'out'], [0.45, 0.55], [1, 0.4]]);
    const p = blend(B.stand, { ...B.crouch, rx: -5, rr: -6, headA: -12, earA: -34, earB: -30, tailA: 120, tailC: 4 }, k);
    p.rx += Math.sin(u * TAU * 3) * 2 * (1 - u);
    p.eye = u < 0.4 ? 'squint' : 'sad';
    return p;
  } },
  sad: { dur: 2.2, f: (u, c) => {
    const B = c.B;
    const k = K(u, [[0, 0], [0.3, 1, 'io'], [1, 1]]);
    const p = blend(B.stand, moodPose({ ...B.sit, headA: 16, headY: B.sit.headY + 4, tailA: 150, tailC: -4 }, 'sad', c.F), k);
    p.headA += Math.sin(u * TAU) * 2; p.eye = 'sad';
    return p;
  } },
  cry: { dur: 3, rep: true, f: (u, c) => {
    const p = moodPose({ ...c.B.sit, headA: 20, headY: c.B.sit.headY + 5, tailA: 150, tailC: -4 }, 'sad', c.F);
    p.rx = Math.sin(c.t * TAU * 6) * 0.5; p.eye = 'sad';
    p.props = [{ type: 'cloud', x: p.headX - 2, y: p.headY - 26 * c.F.hs, s: 0.9, t: c.t }];
    return p;
  } },
  poked: { dur: 0.85, f: (u, c) => {
    const B = c.B;
    if (c.F.dog) {
      // oyun daveti: eğil, havla
      const k = K(u, [[0, 0], [0.18, 1, 'back'], [0.75, 1], [1, 0]]);
      const p = blend(B.stand, B.bow, k);
      p.mouth = bump(u, 0.25, 0.45) + bump(u, 0.5, 0.7); p.eye = u < 0.5 ? 'squint' : 'open'; p.tailW = 18; p.tailF = 5;
      return p;
    }
    const k = K(u, [[0, 0], [0.14, 1, 'back'], [0.7, 1], [1, 0]]);
    const p = blend(B.stand, B.arch, k);
    p.ry = -K(u, [[0, 0], [0.1, 0], [0.22, 7, 'out'], [0.36, 0, 'in']]);
    p.eye = 'squint'; p.mouth = bump(u, 0.15, 0.5) * 0.6;
    return p;
  } },
  shock: { dur: 1, f: (u, c) => {
    const B = c.B;
    const tgt = c.F.dog ? { ...B.stand, earA: 12, earB: 12, eye: 'wide' } : B.arch;
    const k = K(u, [[0, 0], [0.12, 1, 'out'], [0.78, 1], [1, 0]]);
    const p = blend(B.stand, tgt, k);
    p.ry = -K(u, [[0, 0], [0.06, 0], [0.2, 18, 'out'], [0.38, 0, 'in'], [0.46, -1.5], [0.54, 0]]);
    p.rx = -K(u, [[0, 0], [0.2, 4], [0.38, 6], [1, 0]]);
    p.sy = 1 + 0.1 * bump(u, 0.05, 0.3) - 0.08 * bump(u, 0.34, 0.5);
    p.eye = 'wide'; p.mouth = bump(u, 0.12, 0.6) * 0.7;
    p.rr = c.F.dog ? -6 * bump(u, 0.1, 0.4) : 0;
    return p;
  } },
  love: { dur: 2.4, rep: true, f: (u, c) => {
    const p = { ...c.B.sit, eye: 'happy' };
    const s = Math.sin(u * TAU * 2);
    p.headA = -8 + 10 * s; p.headX += 1.5 * s; p.rr = 2.5 * s;
    if (c.F.dog) { p.tailW = 20; p.tailF = 4.5; p.tongue = 0.8; } else { p.tailA = 230 + 8 * s; p.tailC = 14; p.rx = 0.4 * Math.sin(c.t * 60); }
    p.earA = -6; p.earB = -6;
    return p;
  } },
  look: { dur: 1.7, f: (u, c) => {
    const p = { ...c.B.stand };
    const k = K(u, [[0, 0], [0.2, 1, 'back'], [0.75, 1], [1, 0]]);
    p.headA = -10 * k; p.headX -= 2.5 * k; p.look = -1 * k; p.lookY = -0.4 * k; p.earA += 10 * k; p.earB += 6 * k;
    p.tailA += 8 * k;
    return p;
  } },
  stretch: { dur: 2, f: (u, c) => {
    const B = c.B;
    const k = K(u, [[0, 0], [0.25, 1, 'io'], [0.62, 1], [0.85, 0, 'io']]);
    const p = blend(B.stand, B.bow, k);
    // arka bacak geriye uzanır
    const leg = bump(u, 0.62, 0.95);
    p.hnX -= 9 * leg; p.hnY -= 3 * leg;
    p.mouth = bump(u, 0.2, 0.6) * 0.9; p.eye = k > 0.5 ? 'closed' : 'open';
    return p;
  } },
  yawn: { dur: 2, f: (u, c) => {
    const p = { ...c.B.sit };
    const k = bump(u, 0.15, 0.8);
    p.headA = -16 * k; p.headY -= 2 * k; p.mouth = Math.min(1, k * 1.3); p.eye = k > 0.3 ? 'closed' : 'half';
    p.earA -= 10 * k; p.earB -= 10 * k;
    return p;
  } },
  doze: { dur: 3.2, f: (u, c) => {
    const p = { ...c.B.sit };
    const nod = K(u, [[0, 0], [0.55, 1, 'in'], [0.62, 0.15, 'out'], [0.9, 0.8, 'in'], [1, 0.5]]);
    p.headA = 22 * nod; p.headY += 5 * nod; p.headX += 1.5 * nod;
    p.eye = nod > 0.6 ? 'closed' : 'half';
    return p;
  } },
  roll: { dur: 4.2, f: (u, c) => {
    const B = c.B;
    const k = K(u, [[0, 0], [0.18, 1, 'io'], [0.82, 1], [1, 0, 'io']]);
    const p = blend(B.stand, B.back, k);
    const w = Math.sin(u * TAU * 3) * k;
    p.rr = 9 * w; p.rx = 3 * w;
    p.fnY += 3 * Math.sin(c.t * 9); p.hnY += 3 * Math.sin(c.t * 9 + 1.6); p.ffY += 2.4 * Math.sin(c.t * 9 + 3); p.hfY += 2.4 * Math.sin(c.t * 9 + 4.4);
    p.eye = 'happy'; p.sag = -1 - 4 * k;
    return p;
  } },
  focus: { dur: 2.2, rep: true, f: (u, c) => {
    const p = { ...c.B.stand, eye: 'focus' };
    p.chestX += 0.8 * Math.sin(u * TAU); p.hipX += 0.8 * Math.sin(u * TAU + 0.5);
    p.headY -= 1.5; p.earA = 8; p.earB = 8; p.tailA = c.F.dog ? 236 : 220; p.tailC = 6; p.tailW = 2; p.tailF = 0.8;
    return p;
  } },
  // kedi: tımarlanma (referans: Grooming)
  groom: { dur: 2.6, f: (u, c) => {
    const B = c.B, F = c.F;
    const p = { ...B.sit };
    const k = K(u, [[0, 0], [0.18, 1, 'io'], [0.84, 1], [1, 0, 'io']]);
    const lick = Math.sin(u * TAU * 5) * k;
    p.fnX = lerp(B.sit.fnX, p.headX - 1, k); p.fnY = lerp(B.sit.fnY, p.headY + 9 * F.hs + lick * 1.5, k);
    p.headA = 18 * k + lick * 6; p.headX -= 1 * k;
    p.eye = k > 0.4 ? 'half' : 'open'; p.mouth = k * Math.max(0, lick) * 0.6; p.tongue = k * Math.max(0, lick);
    return p;
  } },
  // köpek: silkinme (referans: Shaking)
  shake: { dur: 1.4, f: (u, c) => {
    const p = { ...c.B.stand };
    const env = bump(u, 0.05, 0.9);
    const w = Math.sin(u * TAU * 9) * env;
    p.rr = 7 * w; p.headA = 16 * Math.sin(u * TAU * 9 + 0.8) * env; p.rx = 1.5 * w;
    p.earA = 30 * Math.sin(u * TAU * 9 + 1.2) * env; p.earB = 30 * Math.sin(u * TAU * 9 + 1.5) * env;
    p.tailA += 20 * w; p.eye = env > 0.3 ? 'squint' : 'open';
    p.props = env > 0.25 ? [0, 1, 2, 3].map(i => { const a = (i / 4 + u * 3) * TAU; return { type: 'drop', x: 60 + Math.cos(a) * (22 + 6 * env), y: 80 + Math.sin(a) * 12, s: 0.7, a: 0, o: env }; }) : null;
    return p;
  } },
  // köpek: koklama (referans: Sniffing)
  sniff: { dur: 1.8, rep: true, f: (u, c) => {
    const B = c.B, F = c.F;
    const k = K(u, [[0, 0], [0.15, 1, 'io'], [0.85, 1], [1, 0]]);
    const p = blend(B.stand, { ...B.stand, chestY: B.stand.chestY + 3, headX: B.stand.chestX + 13 * F.hs, headY: G - 12 * F.hs, headA: 26, arch: 1 }, k);
    p.headX += 1.5 * Math.sin(u * TAU * 7) * k; p.headY += 0.8 * Math.sin(u * TAU * 11) * k;
    p.tailW = 12; p.tailF = 3; p.tailA = 236; p.earA = 8 * k; p.eye = 'focus';
    return p;
  } },
  // köpek: kuyruk kovalama — dönerken gövde incelip ters yüze geçer
  chase: { dur: 2.2, f: (u, c) => {
    const p = runPose(c.B, c.F, (c.t * 2.4) % 1);
    const env = K(u, [[0, 0], [0.1, 1], [0.9, 1], [1, 0]]);
    p.spin = Math.cos(u * TAU * 2.5 * env) ; p.ry *= 0.5; p.eye = 'happy'; p.tongue = 0.8;
    return p;
  } },
  // aç: boş kaba bakıp sahibine bakar
  hungry: { dur: 3, rep: true, f: (u, c) => {
    const B = c.B, F = c.F;
    const p = moodPose({ ...B.sit }, 'hungry', F);
    const look = K(u, [[0, 0], [0.15, 1, 'io'], [0.5, 1], [0.62, 0, 'io'], [1, 0]]);
    p.headA += 14 * look; p.headX += 2 * look; p.look = look; p.lookY = 0.5 * look - 0.8 * (1 - look);
    p.rx = 0.35 * Math.sin(c.t * 50) * (1 - look);
    p.eye = 'up';
    p.props = [{ type: 'bowl', x: B.sit.chestX + 15 * F.hs, y: G, s: F.hs * 0.95, food: c.food, full: 0 }];
    return p;
  } },
  // ---- yetenekler
  // kedi: lazer avı — kalça sallar, atılır, patileriyle bastırır
  pounce: { dur: 2.2, f: (u, c) => {
    const B = c.B, F = c.F;
    const prep = K(u, [[0, 0], [0.12, 1, 'io'], [0.5, 1], [0.56, 0, 'in']]);
    let p = blend(B.stand, { ...B.crouch, hipY: B.crouch.hipY - 3, chestY: B.crouch.chestY + 4, headY: B.crouch.headY + 5, earA: 8, earB: 8, tailA: 170, tailC: 6, eye: 'focus' }, prep);
    p.hipX += 2.2 * Math.sin(c.t * TAU * 5) * seg(u, 0.15, 0.5); p.rr = 2 * Math.sin(c.t * TAU * 5) * seg(u, 0.15, 0.5);
    const air = K(u, [[0, 0], [0.52, 0], [0.62, 1, 'out'], [0.72, 0.6], [0.78, 0, 'in']]);
    p = blend(p, B.leap, air);
    p.ry = -K(u, [[0, 0], [0.52, 0], [0.64, 16, 'out'], [0.78, 0, 'in']]);
    p.rx = K(u, [[0, 0], [0.52, -3], [0.78, 14, 'out'], [1, 14]]);
    const land = K(u, [[0, 0], [0.76, 0], [0.84, 1, 'out'], [1, 1]]);
    if (land > 0) { const q = { ...B.crouch, fnX: B.crouch.fnX + 6, ffX: B.crouch.fnX + 4, headY: B.crouch.headY + 6, headA: 22, eye: 'happy', tailA: 235 }; p = blend(p, { ...q, rx: 14 }, land); }
    p.props = [{ type: 'laser', x: B.stand.fnX + 18 - 4 * seg(u, 0.5, 0.8), y: G - 1, s: 1, t: c.t, op: 1 - seg(u, 0.86, 1) }];
    return p;
  } },
  // köpek: yeri kazar, kemik çıkarır, ağzında gururla tutar
  dig: { dur: 3.4, f: (u, c) => {
    const B = c.B, F = c.F;
    const k = K(u, [[0, 0], [0.1, 1, 'io'], [0.55, 1], [0.66, 0, 'io']]);
    const p = blend(B.stand, { ...B.bow, chestY: B.bow.chestY + 1, headY: B.bow.headY + 2, eye: 'focus' }, k);
    const sc = seg(u, 0.12, 0.55) > 0 && u < 0.55;
    if (sc) {
      p.fnX += 4 * Math.sin(c.t * TAU * 6); p.fnY -= 4 * Math.max(0, Math.sin(c.t * TAU * 6));
      p.ffX += 4 * Math.sin(c.t * TAU * 6 + Math.PI); p.ffY -= 4 * Math.max(0, Math.sin(c.t * TAU * 6 + Math.PI));
    }
    const bits = sc ? [0, 1, 2, 3, 4].map(i => { const q = (c.t * 2.6 + i / 5) % 1; return [-30 * q - 4, -16 * Math.sin(q * Math.PI) + 2, 1.4 + (i % 2) * 0.6]; }) : [];
    const hx = B.bow.fnX + 2;
    const bone = seg(u, 0.56, 0.68), held = u > 0.68;
    p.props = [{ type: 'dirt', x: B.stand.hipX - 8, y: G, s: 1, h: seg(u, 0.12, 0.55), bits }, { type: 'hole', x: hx, y: G + 0.5, s: 1, op: seg(u, 0.1, 0.25) }];
    if (u > 0.56 && !held) p.props.push({ type: 'bone', x: hx, y: G - 4 - 14 * Math.sin(bone * Math.PI * 0.8), a: 360 * bone, s: 1 });
    // sonra oturup kemiği ağzında tutar
    const proud = K(u, [[0, 0], [0.66, 0], [0.76, 1, 'io'], [1, 1]]);
    const q = blend(p, { ...B.sit, eye: 'happy', tailW: 18, tailF: 4.5, tailA: 230, headA: -6 }, proud);
    if (held) q.props = [...p.props.slice(0, 2), { type: 'bone', x: q.headX + 15 * F.hs, y: q.headY + 6 * F.hs, a: -8, s: 0.9 * F.hs }];
    return q;
  } },
  // kurt: uyurken dürtülünce — kafa kalkar, öne atılıp ısırır (ağız açık, kulaklar geride), geri çekilir
  snap: { dur: 1.1, f: (u, c) => {
    const B = c.B, F = c.F;
    const wake = K(u, [[0, 0], [0.12, 1, 'out'], [1, 1]]);
    let p = blend({ ...B.loaf, eye: 'closed' }, { ...B.crouch, earA: -30, earB: -30, tailA: 160, tailC: 2, eye: 'angry' }, wake);
    const lunge = K(u, [[0, 0], [0.18, 0], [0.3, 1, 'out'], [0.46, 1], [0.7, 0, 'io']]);
    p.headX += 8 * lunge * F.hs; p.headY += 2 * lunge; p.headA = 8 - 14 * lunge; p.chestX += 3 * lunge; p.rx = 3 * lunge;
    const bite = bump(u, 0.24, 0.36) + bump(u, 0.38, 0.48);
    p.mouth = 0.25 + 0.75 * bite; p.rr = -2 * lunge;
    p.rx += 0.8 * Math.sin(u * TAU * 14) * bump(u, 0.5, 1);
    return p;
  } },
  // kedi: oturur, patisini kaldırır ve masadaki fincanı itip düşürür; sonra umursamaz
  swat: { dur: 2.4, f: (u, c) => {
    const B = c.B, F = c.F;
    const p = { ...B.sit };
    const raise = K(u, [[0, 0], [0.18, 1, 'out'], [0.3, 0.6], [0.38, 1, 'out'], [0.5, 0, 'io']]);
    p.fnX = B.sit.fnX + 9 * raise; p.fnY = B.sit.fnY - 10 * raise; p.headA = -6 * raise + 10 * seg(u, 0.55, 0.8);
    p.eye = u < 0.5 ? 'focus' : 'half'; p.tailA = 205 + 15 * Math.sin(u * TAU * 2); p.tailC = 14;
    const push = seg(u, 0.36, 0.5), fall = seg(u, 0.5, 0.85);
    const cx = B.sit.fnX + 13;
    p.props = [{ type: 'mug', x: cx + 4 * push + 8 * fall, y: G - 0.5 + 0 * fall, a: 95 * EASE.in(fall) + 12 * push, s: 0.95 * F.hs + 0.1, op: 1 }];
    if (fall > 0.95) p.props.push({ type: 'spill', x: cx + 13, y: G, s: 1 });
    return p;
  } },
  // kedi: hiçbir şey olmamış gibi sokulur — başını sürter, gözler kapalı, kuyruk dik ve uçta kıvrık
  rub: { dur: 2.6, rep: true, f: (u, c) => {
    const p = { ...c.B.stand, eye: 'closed' };
    const s = Math.sin(u * TAU * 2);
    p.headA = 10 + 8 * s; p.headX += 2 + 1.5 * s; p.headY += 2; p.chestX += 1 * s; p.rr = 1.5 * s;
    p.tailA = 262; p.tailC = -14; p.tailW = 2; p.tailF = 0.6; p.earA = -8; p.earB = -6;
    return p;
  } },
  // köpek: nöbet — dik duruş, göğüs önde, kulaklar dik, kuyruk yüksek ve sabit
  guard: { dur: 3, rep: true, f: (u, c) => {
    const B = c.B, F = c.F;
    const p = { ...B.stand, eye: 'focus' };
    p.chestY -= 2.5; p.chestX += 1.5; p.headY -= 4 * F.hs; p.headX += 1; p.headA = -6 + 2 * Math.sin(u * TAU);
    p.earA = 12; p.earB = 12; p.tailA = 250; p.tailC = 3; p.tailW = 1.2; p.tailF = 0.5;
    p.look = Math.sin(u * TAU) * 0.6;
    return p;
  } },
};

// sıçrama: çömel → fırla → havada → konar → yerleş
function jump(u, c, h = 22) {
  const B = c.B;
  const cr = K(u, [[0, 0], [0.18, 1, 'out'], [0.28, 0, 'in'], [0.64, 0], [0.72, 0.85, 'out'], [1, 0, 'sine']]);
  let p = blend(B.stand, B.crouch, cr);
  const ext = bump(u, 0.22, 0.42), gat = bump(u, 0.34, 0.66);
  p = blend(p, B.leap, ext * 0.85);
  p = blend(p, B.gather, gat * 0.7);
  p.ry = -K(u, [[0, 0], [0.22, 0], [0.45, h, 'out'], [0.67, 0, 'in'], [1, 0]]);
  p.rr = K(u, [[0, 0], [0.2, -3], [0.36, -10], [0.56, 5], [0.68, 4, 'in'], [0.85, 0]]);
  p.sy = 1 - 0.06 * cr + 0.05 * ext; p.sx = 1 + 0.05 * cr;
  if (u > 0.24) p.eye = 'happy';
  p.tailA = lerp(p.tailA, 232, bump(u, 0.2, 0.9)); p.tailW = c.F.dog ? 14 : 3; p.tailF = 3;
  return p;
}

// ---------------------------------------------------------------- çizim
function bodyPath(C, rc, R, rr, arch, sag) {
  const dx = C[0] - R[0], dy = C[1] - R[1], L = Math.hypot(dx, dy) || 1;
  const n = [dy / L, -dx / L];
  const add = (a, v, k) => [a[0] + v[0] * k, a[1] + v[1] * k];
  const Ct = add(C, n, rc), Cb = add(C, n, -rc), Rt = add(R, n, rr), Rb = add(R, n, -rr);
  const Mt = add([(Ct[0] + Rt[0]) / 2, (Ct[1] + Rt[1]) / 2], n, arch);
  const Mb = add([(Cb[0] + Rb[0]) / 2, (Cb[1] + Rb[1]) / 2], n, -sag);
  // ara noktadan geçen eğri için kontrol noktası
  const qc = (A, M, Bp) => [2 * M[0] - (A[0] + Bp[0]) / 2, 2 * M[1] - (A[1] + Bp[1]) / 2];
  const ct = qc(Rt, Mt, Ct), cb = qc(Cb, Mb, Rb);
  return { d: `M${P(...Rt)} Q${P(...ct)} ${P(...Ct)} A${r1(rc)} ${r1(rc)} 0 0 1 ${P(...Cb)} Q${P(...cb)} ${P(...Rb)} A${r1(rr)} ${r1(rr)} 0 0 1 ${P(...Rt)} Z`, n, Ct, Rt, Cb, Rb };
}
const legD = (S, Kn, Fo) => { const c = [2 * Kn[0] - (S[0] + Fo[0]) / 2, 2 * Kn[1] - (S[1] + Fo[1]) / 2]; return `M${P(...S)} Q${P(...c)} ${P(...Fo)}`; };
const strokeA = (c, w) => ({ fill: 'none', stroke: c, 'stroke-width': r1(w), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });

function catHead(F, p, col) {
  const b = col.b, o = [];
  const ear = (k, base, d, a) => op(k, 'g', { transform: `rotate(${r1(a)} ${base[0]} ${base[1]})` }, [op(k + 's', 'path', { d, fill: b, stroke: b, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }),
    ...(F.tufts ? [op(k + 't', 'path', { d: k === 'erN' ? 'M9 -21 L9.6 -26' : 'M-9 -21 L-9.6 -26', ...strokeA(b, 1.8) })] : [])]);
  o.push(ear('erF', [-7.5, -8.5], 'M-12.4 -6.6 L-9.2 -20.4 L-3 -9.6 Z', p.earB));
  o.push(op('skull', 'path', { d: F.ruff ? 'M-11.5 9.5 L-13.4 8.2 L-15.8 7 L-14 5 L-15.9 2.6 C-14.6 -2 -14 -5.5 -11.6 -8.6 Q0 -11.6 11.6 -8.6 C14 -5.5 14.6 -2 15.9 2.6 L14 5 L15.8 7 L13.4 8.2 L11.5 9.5 Q0 13.8 -11.5 9.5 Z'
    : 'M-11.6 9.2 C-14.4 4 -14.2 -5 -11.6 -8.6 Q0 -11.6 11.6 -8.6 C14.2 -5 14.4 4 11.6 9.2 Q0 13.6 -11.6 9.2 Z', fill: b }));
  o.push(ear('erN', [7.5, -8.5], 'M3 -9.6 L9.2 -20.4 L12.4 -6.6 Z', p.earA));
  if (F.marks === 'stripes') o.push(op('hmk', 'path', { d: 'M-3.4 -10.6 l0.8 4 M0.6 -11.2 l0 4.4 M4.6 -10.6 l-0.8 4', ...strokeA(col.mark, 1.7) }));
  // logodaki gibi: düğüm burun ve kontura taşan gevşek bıyıklar
  const ink = col.dark ? '#F3EDF6' : '#17131B';
  o.push(op('nz', 'path', { d: 'M-0.6 3.4 c1.4 -1.3 3 -0.5 2.3 0.9 c-0.7 1.3 -2.7 0.8 -2 -0.5 l2.9 1.4', ...strokeA(ink, 0.75) }));
  o.push(op('wh', 'path', { d: 'M10.6 4.6 l7.4 -1.8 M10.8 6 l7.6 0.3 M10.4 7.4 l6.4 2.4 M-10.4 4.6 l-6 -1.8 M-10.6 6 l-6.2 0.3 M-10.2 7.4 l-5.2 2', ...strokeA(ink, 0.6) }));
  if (F.marks === 'rosettes' || F.marks === 'spots') o.push(op('hmk', 'path', { d: 'M-7 -6.4 h0.1 M8 -6.8 h0.1 M0.4 -8 h0.1', ...strokeA(col.mark, 2.2) }));
  return o;
}
function dogHead(F, p, col) {
  const b = col.b, o = [];
  const sx = F.ears === 'floppy' ? 16.5 : 19;
  const eg = (k, base, d, a, c = b) => op(k, 'g', { transform: `rotate(${r1(a)} ${base[0]} ${base[1]})` }, [op(k + 's', 'path', { d, fill: c, stroke: c, 'stroke-width': 2, 'stroke-linejoin': 'round' })]);
  const farCol = F.ears === 'pointy' ? b : shade(b, col.dark ? 0.06 : -0.1);
  if (F.ears === 'floppy') o.push(eg('erF', [-7, -8], 'M-8.5 -9 C-15.5 -8 -17.5 2 -13 7.5 C-10.6 3.5 -8.6 -1.5 -5 -6.5 Z', p.earB, farCol));
  else if (F.ears === 'mixed') o.push(eg('erF', [-6, -9], 'M-10.2 -6.4 C-12.4 -14 -10.6 -21.4 -6.4 -22 C-3.6 -22 -3 -15.6 -2.6 -10.4 Z', p.earB, farCol));
  else o.push(eg('erF', [-6, -9], 'M-10.2 -6.8 L-9.2 -22.4 L-2.6 -11.2 Z', p.earB, farCol));
  if (F.ruff) o.push(op('ruff', 'path', { d: 'M-11 -4 L-17.5 -0.5 L-13 1.6 L-18 5.4 L-12.4 6.6 L-15.4 10.6 L-8 10 Z', fill: F.mane ? col.under : b }));
  o.push(op('skull', 'path', { d: `M-9.5 10.6 C-13.8 7.6 -14.6 -2.4 -11.2 -8 C-8 -12.8 2 -13.2 6 -9.2 C8 -7.2 9 -4.4 10.2 -2.6 L${sx - 2.5} -1.6 C${sx + 0.9} -1.1 ${sx + 0.9} 6.6 ${sx - 2.4} 7.4 L9 8.6 C6 11.8 -3.4 13.2 -9.5 10.6 Z`, fill: b }));
  if (F.marks === 'wolf') o.push(op('mz', 'path', { d: `M6 -1.2 L${sx - 2.5} -1.4 C${sx + 0.9} -0.9 ${sx + 0.9} 6.6 ${sx - 2.4} 7.4 L9 8.6 C6 10.8 0.5 11.2 -2.4 9.6 C1.2 6.4 3.4 2.4 6 -1.2 Z`, fill: col.under }));
  if (F.marks === 'saddle') o.push(op('mz', 'path', { d: `M${sx - 7} -1.4 L${sx - 2.5} -1.6 C${sx + 0.9} -1.1 ${sx + 0.9} 6.6 ${sx - 2.4} 7.4 L${sx - 8} 7.8 Z`, fill: col.mark }));
  // burun
  o.push(op('nose', 'ellipse', { cx: r1(sx - 0.4), cy: 0.6, rx: 2.4, ry: 1.9, fill: col.dark ? '#0d0b0f' : '#2a2226' }));
  if (F.ears === 'floppy') o.push(eg('erN', [1, -10], 'M-1 -11 C5 -13 9 -7.5 7.6 -1.5 C5.4 -3.4 2.6 -6.4 -1.4 -7.6 Z', p.earA));
  else o.push(eg('erN', [3, -10], 'M-1.2 -11.6 L4.6 -24.2 L8.4 -9.4 Z', p.earA));
  return { o, sx };
}

const wrap = (a, b, kids) => ({ k: a, t: 'g', a: b, kids });

// pose → çizim komutları (kök grubu dışarıda uygulanır)
export function draw(F, p, col, T, uid) {
  const o = [];
  const A = F.A * (1 - 0.72 * (p.tuck || 0)), Bl = A;
  const rc = F.rc * (p.rcS || 1), rr = F.rr * (p.rrS || 1);
  const C = [p.chestX, p.chestY], R = [p.hipX, p.hipY];
  const inv = (p.inv || 0) > 0.5 ? -1 : 1;
  const sh = n => [p.chestX + (n ? 1.5 : -2.5), p.chestY + inv * rc * 0.35];
  const hp = n => [p.hipX + (n ? 1.5 : -2.5), p.hipY + inv * rr * 0.4];
  const legOp = (k, S, Fx, Fy, near) => {
    const r = ik(S, [Fx, Math.min(Fy, G - F.lw / 2)], A, Bl, inv);
    return op(k, 'path', { d: legD(S, r.knee, r.foot), ...strokeA(near ? col.b : col.far, F.lw) });
  };
  // kuyruk
  const N = 7, segL = 30 * F.tailLen * (p.tailL || 1) / N, tw = F.tail * (1 + 0.7 * (p.puff || 0)) * (F.bush ? 1.1 : 1);
  const b0 = rad(p.tailB);
  let tp = [R[0] + Math.cos(b0) * rr * 0.86, R[1] + Math.sin(b0) * rr * 0.86];
  const pts = [tp];
  for (let i = 0; i < N; i++) {
    const w = (p.tailW || 0) * Math.sin(T * TAU * (p.tailF || 1) - i * 0.55) * (0.3 + i / N);
    const a = rad(p.tailA + p.tailC * i + w);
    tp = [tp[0] + Math.cos(a) * segL, Math.min(tp[1] + Math.sin(a) * segL, G - tw / 2)];
    pts.push(tp);
  }
  const tail = [op('tail', 'path', { d: smoothPath(pts), ...strokeA(col.b, tw) })];
  if (F.bush) tail.push(op('ttip', 'circle', { cx: r1(tp[0]), cy: r1(tp[1]), r: r1(tw * 0.48), fill: col.under }));
  if (F.marks === 'stripes' || F.marks === 'rosettes') tail.push(op('ttip', 'circle', { cx: r1(tp[0]), cy: r1(tp[1]), r: r1(tw * 0.5), fill: col.mark }));
  // uzak bacaklar
  o.push(legOp('lgFF', sh(0), p.ffX, p.ffY, false), legOp('lgHF', hp(0), p.hfX, p.hfY, false));
  if ((p.tailFront || 0) < 0.5) o.push(...tail);
  // gövde
  const body = bodyPath(C, rc, R, rr, p.arch || 0, p.sag || 0);
  o.push(op('defs', 'defs', {}, [op('clip', 'clipPath', { id: uid + 'c' }, [op('clipP', 'path', { d: body.d })])]));
  o.push(op('body', 'path', { d: body.d, fill: col.b }));
  // işaretler (gövdeye kırpılı)
  const along = t => [body.Rt[0] + (body.Ct[0] - body.Rt[0]) * t, body.Rt[1] + (body.Ct[1] - body.Rt[1]) * t];
  const deep = (t, dd) => { const a = along(t); return [a[0] - body.n[0] * rc * dd, a[1] - body.n[1] * rc * dd]; };
  const mk = [];
  if (F.marks === 'stripes') [0.18, 0.4, 0.62].forEach((t, i) => { const a = deep(t, -0.15), b2 = deep(t + 0.04, 0.9); mk.push(op('mk' + i, 'path', { d: `M${P(...a)} Q${P(...deep(t - 0.03, 0.45))} ${P(...b2)}`, ...strokeA(col.mark, 2.6) })); });
  if (F.marks === 'spots') [[0.2, 0.6], [0.45, 0.35], [0.7, 0.8], [0.35, 1.1], [0.6, 1.25]].forEach(([t, d], i) => { const a = deep(t, d); mk.push(op('mk' + i, 'circle', { cx: r1(a[0]), cy: r1(a[1]), r: 1.3, fill: col.mark })); });
  if (F.marks === 'rosettes') [[0.12, 0.5], [0.36, 0.3], [0.58, 0.62], [0.8, 0.38], [0.28, 0.98], [0.68, 1.1]].forEach(([t, d], i) => { const a = deep(t, d); mk.push(op('mk' + i, 'circle', { cx: r1(a[0]), cy: r1(a[1]), r: 2.3, fill: 'none', stroke: col.mark, 'stroke-width': 1.5, 'stroke-dasharray': '2.2 1.4' })); });
  if (F.marks === 'saddle') mk.push(op('mk0', 'path', { d: `M${P(...deep(-0.1, -0.2))} L${P(...deep(0.85, -0.2))} Q${P(...deep(0.8, 0.9))} ${P(...deep(0.55, 0.95))} Q${P(...deep(0.25, 1.15))} ${P(...deep(-0.1, 0.9))} Z`, fill: col.mark }));
  if (F.marks === 'wolf') mk.push(op('mk0', 'path', { d: `M${P(...deep(-0.15, 1.55))} Q${P(...deep(0.5, 1.4))} ${P(...deep(1.1, 1.2))} L${P(...deep(1.2, 2.4))} L${P(...deep(-0.2, 2.4))} Z`, fill: col.under }));
  if (mk.length) o.push(op('marks', 'g', { 'clip-path': `url(#${uid}c)` }, mk));
  if ((p.haunch || 0) > 0.05) o.push(op('haunch', 'ellipse', { cx: r1(R[0] + 2.5), cy: r1(R[1] - 0.5), rx: r1(rr * 1.02 * p.haunch), ry: r1(rr * 0.92 * p.haunch), fill: col.b }));
  // yakın bacaklar
  o.push(legOp('lgHN', hp(1), p.hnX, p.hnY, true), legOp('lgFN', sh(1), p.fnX, p.fnY, true));
  if ((p.tailFront || 0) >= 0.5) o.push(...tail);
  // boyun + baş
  const hs = F.hs, H = [p.headX, p.headY];
  o.push(op('neck', 'path', { d: `M${P(C[0] + rc * 0.25, C[1] - rc * 0.45 * inv)} L${P(H[0] - 2 * hs, H[1] + 5 * hs)}`, ...strokeA(col.b, (F.dog ? 10 : 11) * hs * (F.name === 'kitten' || F.name === 'puppy' ? 0.85 : 1)) }));
  if (F.collar) o.push(op('collar', 'path', { d: `M${P(C[0] + rc * 0.5, C[1] - rc * 0.82)} L${P(H[0] - 4 * hs, H[1] + 9 * hs)}`, ...strokeA(F.collar, 3) }), op('tag', 'circle', { cx: r1(H[0] - 2 * hs), cy: r1(H[1] + 12 * hs), r: 1.6, fill: '#F2C14E' }));
  let hk, sx = 0;
  if (F.dog) { const d = dogHead(F, p, col); hk = d.o; sx = d.sx; } else hk = catHead(F, p, col);
  // gözler
  const ec = { ...col, iris: F.glow || col.iris, pupil: '#141014', line: F.glow || col.line };
  const ex = F.dog ? [-3.2, 5] : [-4.4, 5.4], ey = F.dog ? -3.4 : -0.8, er = F.dog ? 2.9 : 3.2;
  if (col.rim && !['happy', 'closed', 'x', 'squint'].includes(p.eye)) hk.push(op('rim', 'path', { d: `M${P(ex[0] - er - 0.8, ey)} a${r1(er + 0.8)} ${r1(er + 0.8)} 0 1 0 ${r1(2 * er + 1.6)} 0 a${r1(er + 0.8)} ${r1(er + 0.8)} 0 1 0 ${r1(-2 * er - 1.6)} 0 M${P(ex[1] - er - 0.8, ey)} a${r1(er + 0.8)} ${r1(er + 0.8)} 0 1 0 ${r1(2 * er + 1.6)} 0 a${r1(er + 0.8)} ${r1(er + 0.8)} 0 1 0 ${r1(-2 * er - 1.6)} 0`, fill: col.rim, opacity: '.55' }));
  hk.push(...eyes('ring', ex[0], ex[1], ey, er, p.eye || 'open', p.blink || 0, p.look || 0, p.lookY || 0, ec));
  hk.push(...mouth(F.dog ? 'dog' : 'cat', F.dog ? sx - 5 : 1.2, F.dog ? 7.6 : 6.8, 1, '', p.mouth || 0, p.tongue || 0, { mouth: '#4a1f28' }));
  o.push(op('head', 'g', { transform: `translate(${r1(H[0])} ${r1(H[1])}) rotate(${r1(p.headA || 0)}) scale(${r1(hs * 100) / 100})` }, hk));
  return o;
}

// gövde dışına taşan yatay alan (gölge için)
export function footprint(F, p) {
  return { cx: (p.hipX + p.chestX) / 2, w: Math.abs(p.chestX - p.hipX) + F.rc + F.rr };
}

// oynatıcının ihtiyaç duyduğu her şey
export function setup(kind, stage, coat = 0) {
  const F = form(kind, stage);
  const list = COATS[kind] || COATS.cat;
  const ci = ((coat | 0) % list.length + list.length) % list.length;
  const col = coatColors(list[ci]);
  col.iris = (IRIS[kind] || IRIS.cat)[ci]; col.slit = kind !== 'dog';
  return { F, B: bases(F), col, k: F.k };
}
// bir adım döngüsünde gövdenin aldığı yol (viewBox birimi, ölçeksiz)
export const cycleLen = (F, mode) => (mode === 'run' ? 57 : 28) * F.leg;
// yaylı kanallar: [sertlik, sönüm]; kick: zıplamada ivmeye tepki
export const SPRINGS = { tailA: [70, 7], tailC: [60, 7], earA: [260, 9], earB: [220, 8], headA: [300, 22] };
export const KICK = { earA: -0.02, earB: -0.025, tailA: 0.03 };
export const BASES = { idle: 'idle', sit: 'sit', walk: 'walk', run: 'run', sleep: 'sleep', lie: 'lie', dead: 'dead', home: 'sit' };
// kalıcı (statik) çizimler için poz adı → klip
export const STATIC = { stand: 'idle', sit: 'sit', loaf: 'sleep', lie: 'lie', flat: 'dead', run: 'run', jump: 'hop', walk: 'walk', bow: 'stretch', arch: 'poked' };
export const food = F => (F.dog ? 'bone' : 'fish');
// genel adlar → türe özel klip
export const ALIAS = (name, F) => ({
  ability: F.dog ? 'dig' : 'pounce',
  groom: F.dog ? 'sniff' : 'groom',
  shake: F.dog ? 'shake' : 'groom',
  chase: F.dog ? 'chase' : 'pounce',
  bite: F.dog ? 'snap' : 'poked', knock: F.dog ? 'shake' : 'swat', cuddle: F.dog ? 'love' : 'rub', protect: F.dog ? 'guard' : 'focus',
  mirror: 'look', petals: F.dog ? 'sniff' : 'groom', photo: 'stretch', bubble: 'look', wiggle: F.dog ? 'shake' : 'stretch', spin: F.dog ? 'chase' : 'hop', home: 'sit',
}[name] || name);
export function belly(p, b) { return { ...p, sag: (p.sag || 0) + 5 * b, rcS: (p.rcS || 1) * (1 + 0.08 * b), rrS: (p.rrS || 1) * (1 + 0.1 * b) }; }
