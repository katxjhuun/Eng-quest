// Gecko / kertenkele: yandan görünen, yere yakın, yayvan bacaklı iskelet.
// Herkesten farklı görünür, farklı yaşar: kendi gözünü yalar, adımın ortasında donup kalır,
// güneşte kıpırdamadan durur; av peşinde koşmaz, av ona gelir.
// viewBox 0 0 120 120, zemin y=108, yüz sağa bakar. Aynı oynatıcı arayüzü (quad/bean ile).
import { K, EASE, seg, bump, blend, clamp, lerp, rad, r1, P, smoothPath, ik, shade, mix, lum, wob, TAU } from './anim.js';
import { op, eyes, MOOD_EYE } from './face.js';

export const G = 108;
const F_ = c => ({ fill: c });
const S_ = (c, w) => ({ fill: 'none', stroke: c, 'stroke-width': r1(w), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });

// rastgele atanan renk (morf); kullanıcı seçemez
export const COATS = ['#7FE0D2', '#FF9EC4', '#FFD66B', '#B9A6F5', '#9BE58B', '#86D3F4', '#FFB28A', '#EDE7DC'];
const IRIS = ['#B88A3E', '#C9A24A', '#D0B070', '#8FA36A', '#B88A3E', '#C9A24A', '#D0B070', '#9DB07A'];
const ALT = ['#FF9EC4', '#86D3F4', '#9BE58B', '#FFD66B', '#B9A6F5', '#FFB28A', '#7FE0D2', '#F4A3C4'];

const FORMS = [
  { name: 'hatchling', k: 1.02, L: 22, rb: 6.6, hs: 1.42, leg: 1.05, tail: 26, tw: 5.6, fat: 0.25, marks: 'bands' },
  { name: 'house', k: 1.08, L: 26, rb: 6.2, hs: 1.24, leg: 1.15, tail: 34, tw: 4.8, fat: 0.05 },
  { name: 'leopard', k: 1.12, L: 30, rb: 7.6, hs: 1.2, leg: 1.18, tail: 30, tw: 7.4, fat: 0.6, marks: 'spots' },
  { name: 'rock', k: 1.14, L: 33, rb: 7.8, hs: 1.14, leg: 1.22, tail: 38, tw: 6.8, fat: 0.15, marks: 'bands', crest: 0.6 },
  { name: 'chameleon', k: 1.14, L: 30, rb: 8.8, hs: 1.18, leg: 1.3, tail: 30, tw: 5.6, fat: 0, curl: true, casque: true, shift: true, crest: 0.45 },
  { name: 'dragon', k: 1.12, L: 36, rb: 8.8, hs: 1.16, leg: 1.26, tail: 42, tw: 7.4, fat: 0.1, marks: 'spots', crest: 1, beard: true, glow: '#D9B45A' },
];
export function form(kind, stage) {
  const f = FORMS[clamp(stage | 0, 0, 5)];
  return { ...f, kind: 'gecko', stage: clamp(stage | 0, 0, 5), A: 6.6 * f.leg, B: 7 * f.leg };
}
export const food = () => 'bug';

// ---------------------------------------------------------------- pozlar
export function bases(F) {
  const { L, rb, A } = F;
  const lift = rb + A * 0.62;
  const stand = {
    rx: 0, ry: 0, rr: 0, sx: 1, sy: 1,
    hipX: 60 - L / 2 + F.tail * 0.1, chestX: 60 + L / 2 + F.tail * 0.1, bodyY: lift, arch: 1.2, headA: -4, neck: 0,
    fnX: 0, fnY: 0, ffX: 0, ffY: 0, hnX: 0, hnY: 0, hfX: 0, hfY: 0, splay: 0,
    tailA: F.curl ? 205 : 182, tailC: F.curl ? 14 : 3, tailW: 2, tailF: 0.35,
    eye: 'open', look: 0, lookY: 0, mouth: 0, tongue: 0, lick: 0, puff: 0, props: null,
  };
  const rest = { ...stand, bodyY: rb * 1.02, arch: 0.4, headA: -8, splay: 0.4, tailC: F.curl ? 22 : 5 };
  const flat = { ...stand, bodyY: rb * 0.9, arch: -0.4, headA: 2, splay: 1, tailC: F.curl ? 26 : 8, tailA: 178 };
  const up = { ...stand, bodyY: lift + 3, arch: 2, headA: -16, splay: -0.2, tailA: 186 };
  return { stand, rest, flat, up };
}
export function moodPose(p, mood, F) {
  const o = { ...p };
  if (!o.eye || o.eye === 'open') o.eye = MOOD_EYE[mood] || 'open';
  switch (mood) {
    case 'sad': case 'hungry': o.bodyY -= 1.5; o.headA += 10; o.tailW = 0.6; break;
    case 'happy': case 'love': case 'eat': o.headA -= 6; o.tailW = 5; o.tailF = 0.9; break;
    case 'groggy': case 'sleepy': o.headA += 6; o.bodyY -= 1; o.tailW = 0.8; break;
    case 'full': o.bodyY -= 1.2; break;
    case 'focus': o.headA -= 4; o.tailW = 0.4; break;
    case 'poked': o.headA -= 10; o.puff = Math.max(o.puff, 0.6); break;
  }
  return o;
}

// ---------------------------------------------------------------- yürüyüş (çapraz çiftler) ve koşu
function gait(B, F, ph, run = false) {
  const p = { ...B.stand };
  const stride = (run ? 8 : 6) * F.leg, lift = (run ? 5 : 3.6) * F.leg;
  const leg = off => {
    const q = ((ph + off) % 1 + 1) % 1;
    if (q < 0.55) { const u = q / 0.55; return [stride - 2 * stride * u, 0]; }
    const u = (q - 0.55) / 0.45; return [-stride + 2 * stride * EASE.sine(u), -lift * Math.sin(Math.PI * u)];
  };
  const fn = leg(0), hf = leg(0.02), ff = leg(0.5), hn = leg(0.52);
  p.fnX = fn[0]; p.fnY = fn[1]; p.hfX = hf[0]; p.hfY = hf[1]; p.ffX = ff[0]; p.ffY = ff[1]; p.hnX = hn[0]; p.hnY = hn[1];
  // yanlara kıvrılan omurga: yandan hafif inip kalkma ve kuyruk dalgası
  const s = Math.sin(ph * TAU * 2);
  p.bodyY += (run ? 1 : 0.6) * s; p.arch = 1.2 + (run ? 1.6 : 0.8) * Math.sin(ph * TAU);
  p.headA += (run ? 3 : 2) * Math.sin(ph * TAU + 1); p.tailA = 182 + (run ? 10 : 6) * Math.sin(ph * TAU + 2);
  p.tailW = 0; if (run) { p.bodyY -= 0.6; p.headA -= 4; }
  return p;
}

const cyc = (c, hz) => Math.sin(c.t * TAU * hz);
export const CLIPS = {
  idle: { dur: 6, loop: true, f: (u, c) => {
    const p = { ...c.B.stand };
    p.headA += 3 * wob(c.t * 0.35, 1); p.tailA += 4 * wob(c.t * 0.3, 2); p.bodyY += 0.25 * Math.sin(c.t * 1.6);
    return p;
  } },
  sit: { dur: 6, loop: true, f: (u, c) => { const p = { ...c.B.rest }; p.headA += 3 * wob(c.t * 0.3, 2); p.tailA += 3 * wob(c.t * 0.25, 1); return p; } },
  walk: { dur: 1, loop: true, phase: true, f: (u, c) => gait(c.B, c.F, c.ph) },
  run: { dur: 1, loop: true, phase: true, f: (u, c) => gait(c.B, c.F, c.ph, true) },
  sleep: { dur: 5, loop: true, f: (u, c) => { const p = { ...c.B.flat, eye: 'closed' }; p.bodyY += 0.3 * Math.sin(u * TAU); p.tailC += 4; p.headA = 6; return p; } },
  lie: { dur: 5, loop: true, f: (u, c) => { const p = { ...c.B.flat, eye: 'half' }; p.headA = 0 + 2 * wob(c.t * 0.3); return p; } },
  dead: { dur: 3, loop: true, f: (u, c) => {
    const p = { ...c.B.flat, eye: 'x', headA: 10, tailW: 0, splay: 1.3 };
    p.props = [{ type: 'halo', x: p.chestX + 9 * c.F.hs, y: G - 22 + Math.sin(u * TAU) * 1.2, s: 0.8 }];
    return p;
  } },
  hop: { dur: 0.9, f: (u, c) => skip(u, c, 12) },
  joy: { dur: 0.9, f: (u, c) => skip(u, c, 12) },
  dance: { dur: 1.6, f: (u, c) => {
    // başını sallar, ön ayaklarını sırayla kaldırır (kertenkele "el sallaması")
    const p = { ...c.B.up, eye: 'happy' };
    p.fnY = -5 * Math.max(0, Math.sin(u * TAU * 2)); p.ffY = -5 * Math.max(0, -Math.sin(u * TAU * 2)); p.fnX = 3; p.headA = -14 + 8 * Math.sin(u * TAU * 4);
    p.tailW = 6; p.tailF = 1.2;
    return p;
  } },
  eat: { dur: 2.2, rep: true, f: (u, c) => {
    // dil fırlatıp böceği yakalar, çiğner
    const p = { ...c.B.stand };
    const shot = bump(u, 0.18, 0.34), chew = seg(u, 0.36, 0.9);
    p.headA = -6 + 6 * shot; p.tongue = shot; p.mouth = 0.4 * shot + 0.3 * Math.abs(Math.sin(c.t * 14)) * chew; p.eye = chew > 0 ? 'happy' : 'focus';
    if (u < 0.3) p.props = [{ type: 'bug', x: p.chestX + 24 * c.F.hs - 6 * seg(u, 0.18, 0.3), y: G - 10, s: 0.9, t: c.t }];
    return p;
  } },
  flinch: { dur: 0.75, f: (u, c) => {
    const k = K(u, [[0, 0], [0.12, 1, 'out'], [0.5, 0.5], [1, 0.3]]);
    const p = blend(c.B.stand, { ...c.B.flat, headA: 10 }, k);
    p.rx = -4 * k + 1.5 * Math.sin(u * TAU * 3) * (1 - u); p.eye = u < 0.4 ? 'squint' : 'sad';
    return p;
  } },
  sad: { dur: 2.2, f: (u, c) => { const k = K(u, [[0, 0], [0.3, 1, 'io'], [1, 1]]); const p = blend(c.B.stand, moodPose({ ...c.B.rest }, 'sad', c.F), k); p.eye = 'sad'; return p; } },
  cry: { dur: 3, rep: true, f: (u, c) => { const p = moodPose({ ...c.B.flat }, 'sad', c.F); p.eye = 'sad'; p.props = [{ type: 'cloud', x: p.chestX + 4, y: G - 34, s: 0.85, t: c.t }]; return p; } },
  poked: { dur: 0.85, f: (u, c) => {
    // sırtını kabartır, ağzını açar (tehdit), sonra hiçbir şey olmamış gibi
    const k = K(u, [[0, 0], [0.14, 1, 'back'], [0.7, 1], [1, 0]]);
    const p = blend(c.B.stand, { ...c.B.up, headA: -20, puff: 1, tailA: 200 }, k);
    p.mouth = 0.8 * bump(u, 0.12, 0.6); p.eye = 'wide';
    return p;
  } },
  shock: { dur: 1, f: (u, c) => {
    const p = { ...c.B.stand, eye: 'wide' };
    p.ry = -K(u, [[0, 0], [0.06, 0], [0.22, 10, 'out'], [0.4, 0, 'in']]);
    p.splay = 0.8 * bump(u, 0.05, 0.4); p.tailA = 182 + 20 * bump(u, 0.05, 0.6);
    return p;
  } },
  love: { dur: 2.4, rep: true, f: (u, c) => {
    const p = { ...c.B.rest, eye: 'happy' };
    p.headA = -10 + 6 * Math.sin(u * TAU * 2); p.tailW = 5; p.tailF = 0.8;
    return p;
  } },
  look: { dur: 1.7, f: (u, c) => {
    const p = { ...c.B.stand };
    const k = K(u, [[0, 0], [0.2, 1, 'back'], [0.75, 1], [1, 0]]);
    p.headA = -4 - 14 * k; p.look = k; p.lookY = -0.6 * k;
    return p;
  } },
  stretch: { dur: 2, f: (u, c) => {
    const k = K(u, [[0, 0], [0.3, 1, 'io'], [0.65, 1], [0.9, 0, 'io']]);
    const p = blend(c.B.stand, { ...c.B.up, fnX: 6, ffX: 5, hnX: -5, hfX: -6, headA: -22 }, k);
    p.mouth = bump(u, 0.25, 0.65) * 0.9; p.eye = k > 0.5 ? 'closed' : 'open';
    return p;
  } },
  yawn: { dur: 2, f: (u, c) => { const p = { ...c.B.rest }; const k = bump(u, 0.15, 0.8); p.headA = -12 * k; p.mouth = Math.min(1, k * 1.2); p.eye = k > 0.3 ? 'closed' : 'half'; return p; } },
  doze: { dur: 3.2, f: (u, c) => {
    const p = { ...c.B.rest };
    const nod = K(u, [[0, 0], [0.55, 1, 'in'], [0.62, 0.15, 'out'], [0.9, 0.8, 'in'], [1, 0.5]]);
    p.headA = 12 * nod; p.eye = nod > 0.6 ? 'closed' : 'half';
    return p;
  } },
  roll: { dur: 4.2, f: (u, c) => { const k = K(u, [[0, 0], [0.2, 1, 'io'], [0.8, 1], [1, 0]]); const p = blend(c.B.stand, { ...c.B.flat, splay: 1.4, eye: 'half' }, k); p.bodyY -= 0.5 * k; return p; } },
  focus: { dur: 2.2, rep: true, f: (u, c) => { const p = { ...c.B.stand, eye: 'focus' }; p.headA = -8; p.tailW = 0.3; p.look = 0.3; return p; } },
  hungry: { dur: 3, rep: true, f: (u, c) => {
    const p = moodPose({ ...c.B.rest }, 'hungry', c.F);
    p.eye = 'up'; p.tongue = 0.35 * bump((c.t * 0.8) % 1, 0.1, 0.3);
    return p;
  } },
  // ---- gecko'ya özgü
  // kendi gözünü yalar (gecko'ların göz kapağı yoktur)
  lick: { dur: 1.8, f: (u, c) => {
    const p = { ...c.B.stand };
    p.lick = bump(u, 0.2, 0.75); p.eye = p.lick > 0.4 ? 'closed' : 'open'; p.headA = -6 + 4 * p.lick;
    return p;
  } },
  // dil çıkarıp havayı koklar
  tongue: { dur: 1.6, f: (u, c) => { const p = { ...c.B.stand }; p.tongue = bump(u, 0.15, 0.35) + bump(u, 0.45, 0.62); p.headA = -8; return p; } },
  // adımın ortasında donar; uzun süre kıpırdamaz, sonra devam eder
  freeze: { dur: 3, f: (u, c) => { const p = gait(c.B, c.F, 0.3); p.eye = u > 0.3 && u < 0.85 ? 'open' : 'half'; p.look = u > 0.5 ? 0.6 : 0; p.tailW = 0; return p; } },
  // kuyruğunu yavaşça dalgalandırır
  tailwave: { dur: 2.6, f: (u, c) => { const p = { ...c.B.rest }; p.tailW = 10 * bump(u, 0.05, 0.95); p.tailF = 0.7; p.eye = 'half'; return p; } },
  // güneşlenir: yassılır, gözleri kapalı, kıpırtısız
  bask: { dur: 4.2, f: (u, c) => {
    const k = K(u, [[0, 0], [0.2, 1, 'io'], [0.85, 1], [1, 0]]);
    const p = blend(c.B.stand, { ...c.B.flat, splay: 1.3, headA: -6 }, k);
    p.eye = k > 0.5 ? 'closed' : 'half';
    p.props = [{ type: 'sun', x: 60 + 36, y: G - 52, s: 0.8 * k, t: c.t, op: k }];
    return p;
  } },
  // Av Ona Gelir: kıpırtısız bekler; böcek kendiliğinden yaklaşır, dil şaklar
  ability: { dur: 3, f: (u, c) => {
    const F = c.F, B = c.B;
    const still = K(u, [[0, 0], [0.12, 1, 'io'], [0.86, 1], [1, 0]]);
    const p = blend(B.stand, { ...B.rest, headA: -6, eye: 'focus', tailW: 0 }, still);
    const shot = bump(u, 0.62, 0.74);
    p.tongue = shot * 1.3; p.headA += 6 * shot; p.mouth = 0.5 * shot;
    const tx = p.chestX + 34 * F.hs;
    if (u < 0.7) p.props = [{ type: 'bug', x: lerp(tx + 26, tx, EASE.out(seg(u, 0.1, 0.62))), y: G - 9 - 6 * Math.sin(u * TAU * 3), s: 0.9, t: c.t }];
    if (u > 0.74) { p.eye = 'happy'; p.mouth = 0.3 * Math.abs(Math.sin(c.t * 12)) * (1 - seg(u, 0.9, 1)); p.props = [{ type: 'spark', x: p.chestX + 12 * F.hs, y: G - 30, s: 0.6, o: 1 - seg(u, 0.8, 1), c: '#D9B45A' }]; }
    return p;
  } },
};
function skip(u, c, h) {
  const p = { ...c.B.stand };
  const cr = K(u, [[0, 0], [0.18, 1, 'out'], [0.28, 0, 'in'], [0.66, 0], [0.74, 0.8, 'out'], [1, 0]]);
  p.bodyY -= 2 * cr; p.ry = -K(u, [[0, 0], [0.24, 0], [0.46, h, 'out'], [0.68, 0, 'in'], [1, 0]]);
  const air = bump(u, 0.24, 0.68);
  p.splay = 0.6 * air; p.tailA = 182 + 12 * air; p.eye = u > 0.2 ? 'happy' : 'open'; p.headA = -10 * air;
  return p;
}

export const ALIAS = name => ({
  groom: 'lick', shake: 'tailwave', sniff: 'tongue', chase: 'run', pounce: 'ability', dig: 'ability',
  mirror: 'freeze', petals: 'lick', photo: 'bask', bubble: 'tongue', wiggle: 'tailwave', spin: 'hop', home: 'sit',
  bite: 'poked', snap: 'poked', knock: 'tailwave', swat: 'poked', cuddle: 'love', rub: 'love', protect: 'focus', guard: 'focus',
  coffee: 'bask', headturn: 'look',
}[name] || name);

// ---------------------------------------------------------------- çizim
function capsule(Rp, rr, Cp, rc, arch) {
  const dx = Cp[0] - Rp[0], dy = Cp[1] - Rp[1], L = Math.hypot(dx, dy) || 1, n = [dy / L, -dx / L];
  const add = (a, v, k) => [a[0] + v[0] * k, a[1] + v[1] * k];
  const Ct = add(Cp, n, rc), Cb = add(Cp, n, -rc), Rt = add(Rp, n, rr), Rb = add(Rp, n, -rr);
  const Mt = add([(Ct[0] + Rt[0]) / 2, (Ct[1] + Rt[1]) / 2], n, arch), Mb = add([(Cb[0] + Rb[0]) / 2, (Cb[1] + Rb[1]) / 2], n, -0.6);
  const qc = (A, M, B) => [2 * M[0] - (A[0] + B[0]) / 2, 2 * M[1] - (A[1] + B[1]) / 2];
  return { d: `M${P(...Rt)} Q${P(...qc(Rt, Mt, Ct))} ${P(...Ct)} A${r1(rc)} ${r1(rc)} 0 0 1 ${P(...Cb)} Q${P(...qc(Cb, Mb, Rb))} ${P(...Rb)} A${r1(rr)} ${r1(rr)} 0 0 1 ${P(...Rt)} Z`, n, Ct, Rt, Cb, Rb };
}
// sivrilen kuyruk: omurga noktalarından iki kenar
function tailShape(pts, w0, fat) {
  const n = pts.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = dy / d, ny = -dx / d;
    const t = i / (n - 1), w = w0 * Math.pow(1 - t, 0.85) * (1 + fat * Math.sin(Math.PI * Math.min(1, t * 1.6))) * 0.5 + 0.5;
    L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  return smoothPath([...L, ...R.reverse()], true);
}

export function draw(F, p, col, T, uid) {
  const o = [];
  const sh = F.shift ? 0.5 + 0.5 * Math.sin(T * 0.35) : 0;
  const body = sh ? mix(col.b, col.alt, sh * 0.8) : col.b;
  const far = shade(body, -0.16), under = shade(body, 0.34), mark = shade(body, -0.32);
  const by = G - p.bodyY;
  const Rp = [p.hipX, by + 0.5], Cp = [p.chestX, by - 0.6];
  const rr = F.rb * 0.92 * (p.puffBody || 1), rc = F.rb * 0.84;
  // kuyruk
  const N = 9, segL = F.tail / N;
  let tp = [Rp[0] - rr * 0.7, Rp[1] + rr * 0.15]; const pts = [tp];
  for (let i = 0; i < N; i++) {
    const w = (p.tailW || 0) * Math.sin(T * TAU * (p.tailF || 0.4) - i * 0.55) * (0.2 + i / N);
    const a = rad(p.tailA + (p.tailC || 0) * i * (F.curl ? -1.7 : 1) + w);
    tp = [tp[0] + Math.cos(a) * segL, Math.min(tp[1] + Math.sin(a) * segL, G - 1.2)]; pts.push(tp);
  }
  // bacaklar: omuz/kalça gövde altında, dirsek/diz gövdenin üstüne kalkar (yayvan duruş)
  const spl = p.splay || 0;
  const legOps = (k, S, Fx, Fy, near) => {
    const foot = [Fx, Math.min(Fy, G - 1.4)];
    const r = ik(S, foot, F.A, F.B, -1);
    const c = near ? body : far;
    const toes = [-34, 0, 34].map((a, i) => { const aa = rad(-90 + (near ? 1 : -1) * 70 + a); return `M${P(foot[0], foot[1])} l${r1(Math.cos(aa) * 3.2 * F.leg)} ${r1(Math.min(0.6, Math.sin(aa) * 1.6))}`; }).join(' ');
    return [op(k, 'path', { d: `M${P(...S)} Q${P(...r.knee)} ${P(...foot)}`, ...S_(c, 3.6 * F.leg) }), op(k + 't', 'path', { d: toes, ...S_(c, 1.4) })];
  };
  const shF = [Cp[0] - 1, by + rc * 0.45], shN = [Cp[0] + 1.5, by + rc * 0.5];
  const hpF = [Rp[0] - 1, by + rr * 0.45], hpN = [Rp[0] + 1.5, by + rr * 0.5];
  const fpos = (x, dx, s) => x + dx + s * (6 + 6 * spl);
  o.push(...legOps('lgFF', shF, fpos(Cp[0], p.ffX, -0.2) + 2, G + (p.ffY || 0), false), ...legOps('lgHF', hpF, fpos(Rp[0], p.hfX, -0.6) - 2, G + (p.hfY || 0), false));
  o.push(op('tail', 'path', { d: tailShape(pts, F.tw, F.fat), ...F_(body) }));
  if (F.marks === 'bands') pts.slice(2, 8).forEach((q, i) => { if (i % 2) o.push(op('tb' + i, 'circle', { cx: r1(q[0]), cy: r1(q[1]), r: r1(F.tw * 0.32 * (1 - i / 9)), ...F_(mark), opacity: '.55' })); });
  if (F.marks === 'spots') pts.slice(1, 8).forEach((q, i) => o.push(op('ts' + i, 'circle', { cx: r1(q[0] + (i % 2 ? 1 : -1)), cy: r1(q[1] - 0.8), r: 0.9, ...F_(mark) })));
  // gövde
  const cap = capsule(Rp, rr, Cp, rc, (p.arch || 0) + (p.puff || 0) * 1.6);
  o.push(op('defs', 'defs', {}, [op('clip', 'clipPath', { id: uid + 'c' }, [op('clipP', 'path', { d: cap.d })])]));
  o.push(op('body', 'path', { d: cap.d, ...F_(body) }));
  const inner = [op('belly', 'path', { d: `M${P(Rp[0] - rr, by + rr * 0.6)} L${P(Cp[0] + rc, by + rc * 0.6)} L${P(Cp[0] + rc, by + rc + 2)} L${P(Rp[0] - rr, by + rr + 2)} Z`, ...F_(under), opacity: '.75' })];
  if (F.marks === 'spots') [[0.15, -0.3], [0.35, 0.1], [0.55, -0.4], [0.7, 0.05], [0.85, -0.25], [0.28, -0.6], [0.62, -0.7]].forEach(([t, d], i) => inner.push(op('sp' + i, 'circle', { cx: r1(lerp(Rp[0], Cp[0], t)), cy: r1(by + d * F.rb), r: 1.1, ...F_(mark) })));
  if (F.marks === 'bands') [0.2, 0.5, 0.8].forEach((t, i) => inner.push(op('bd' + i, 'path', { d: `M${P(lerp(Rp[0], Cp[0], t), by - F.rb)} q-1.5 ${r1(F.rb)} 0 ${r1(F.rb * 1.4)}`, ...S_(mark, 2.2), opacity: '.5' })));
  if (F.shift) inner.push(op('sh', 'path', { d: `M${P(Rp[0], by - 1)} L${P(Cp[0], by - 2)}`, ...S_(shade(body, 0.18), 1.6), opacity: '.6' }));
  o.push(op('inner', 'g', { 'clip-path': `url(#${uid}c)` }, inner));
  if (F.crest) {
    const n = 6, sp = [];
    for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x = lerp(Rp[0], Cp[0], t), y = lerp(cap.Rt[1], cap.Ct[1], t) - (p.arch || 0) * Math.sin(t * Math.PI) - 0.2; const hh = 2.6 * F.crest * (0.6 + 0.4 * Math.sin(t * Math.PI)); sp.push(`M${P(x - 1.4, y + 0.6)} L${P(x, y - hh)} L${P(x + 1.4, y + 0.6)} Z`); }
    o.push(op('crest', 'path', { d: sp.join(' '), ...F_(shade(body, -0.12)) }));
  }
  o.push(...legOps('lgHN', hpN, fpos(Rp[0], p.hnX, 0.6) + 1, G + (p.hnY || 0), true), ...legOps('lgFN', shN, fpos(Cp[0], p.fnX, 0.4) + 3, G + (p.fnY || 0), true));
  // baş
  const hs = F.hs, H = [Cp[0] + rc * 0.75, by - rc * 0.35];
  const hk = [];
  if (F.beard) {
    const pf = 0.6 + 0.6 * (p.puff || 0);
    hk.push(op('beard', 'path', { d: `M-1 3 L${r1(-1 - 2 * pf)} ${r1(7 + 3 * pf)} L1.5 6 L2.5 ${r1(9 + 3 * pf)} L4.5 6.4 L6.5 ${r1(8.6 + 2 * pf)} L8 5 Z`, ...F_(shade(body, -0.2)) }));
  }
  hk.push(op('head', 'path', { d: 'M-6 -4.6 C-1 -8.4 9 -7.6 14.6 -2.6 C16.8 -0.6 16.2 2.6 13 3.6 C8 5.4 0 5.8 -6 4.2 Z', ...F_(body) }));
  if (F.casque) hk.push(op('casque', 'path', { d: 'M-6 -4 C-6 -11 1 -14 6 -9 C3 -8.5 0 -7 -2 -4.6 Z', ...F_(shade(body, -0.08)) }));
  hk.push(op('jaw', 'path', { d: `M14.4 1.6 C9 ${r1(2.6 + 3 * (p.mouth || 0))} 2 ${r1(3.6 + 2.6 * (p.mouth || 0))} -4 3.6`, ...S_(shade(body, -0.35), 0.9) }));
  if ((p.mouth || 0) > 0.1) hk.push(op('mo', 'path', { d: `M14 1.4 L2 2.6 L4 ${r1(2.8 + 3.4 * p.mouth)} Z`, ...F_('#4a2a30') }));
  // dil: burundan fırlar; göz yalamada yukarı kıvrılır
  const tg = p.tongue || 0, lk = p.lick || 0;
  if (tg > 0.03) hk.push(op('tg', 'path', { d: `M14.6 1.2 l${r1(8 * tg)} ${r1(-0.6 * tg)}`, ...S_('#C77B86', 1.3) }), op('tgt', 'circle', { cx: r1(14.6 + 8 * tg), cy: r1(1.2 - 0.6 * tg), r: r1(0.9 * Math.min(1, tg + 0.3)), ...F_('#C77B86') }));
  if (lk > 0.03) hk.push(op('lk', 'path', { d: `M14 1.6 C${r1(17 + 2 * lk)} ${r1(-1 - 3 * lk)} ${r1(12 + 1 * lk)} ${r1(-6 * lk)} ${r1(6 + 2 * (1 - lk))} ${r1(-3 - 1.6 * lk)}`, ...S_('#C77B86', 1.6) }));
  // tek göz (yandan): iri, yarık göz bebeği, kapaksız ve dikkatli
  const ec = { ...col, iris: F.glow || col.iris, pupil: '#141014', line: '#2a2026', lid: body, slit: true };
  const eyeOps = eyes('ring', 5, 5, -2, 3.1, p.eye || 'open', p.blink || 0, p.look || 0, p.lookY || 0, ec).filter(e => e.k.startsWith('eR'));
  hk.push(...eyeOps);
  hk.push(op('nost', 'circle', { cx: 13.4, cy: -1.4, r: 0.5, ...F_(shade(body, -0.4)) }));
  o.push(op('headG', 'g', { transform: `translate(${r1(H[0])} ${r1(H[1])}) rotate(${r1(p.headA || 0)}) scale(${r1(hs * 100) / 100})` }, hk));
  return o;
}

export function footprint(F, p) { return { cx: (p.hipX + p.chestX) / 2 - 4, w: Math.abs(p.chestX - p.hipX) + F.tail * 0.6 }; }
export function setup(kind, stage, coat = 0) {
  const F = form(kind, stage);
  const ci = ((coat | 0) % COATS.length + COATS.length) % COATS.length, b = COATS[ci];
  const col = { b, alt: ALT[ci], iris: IRIS[ci], white: '#EFE7DA', pupil: '#141014', line: '#2a2026', lid: b, light: lum(b) > 0.45 };
  return { F, B: bases(F), col, k: F.k };
}
export const cycleLen = (F, mode) => (mode === 'run' ? 30 : 20) * F.leg;
export const SPRINGS = { tailA: [60, 6], headA: [260, 20], bodyY: [300, 24] };
export const KICK = { tailA: 0.03 };
export const BASES = { idle: 'idle', sit: 'sit', walk: 'walk', run: 'run', sleep: 'sleep', lie: 'lie', dead: 'dead', home: 'sit' };
export const STATIC = { stand: 'idle', sit: 'sit', loaf: 'sleep', lie: 'lie', flat: 'dead', run: 'run', jump: 'hop', walk: 'walk', bow: 'stretch', arch: 'poked' };
export function belly(p, b) { return { ...p, puffBody: 1 + 0.12 * b, bodyY: p.bodyY - 0.8 * b }; }
