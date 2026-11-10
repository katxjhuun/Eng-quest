// dam-la — 3B kil pet modelleri. Her tür 6 evrede farklı (oran, renk, ayrıntı, bazı türlerde bambaşka biçim).
// Parça adları motor tarafından oynatılır: body, head, earL/earR, tail, legFL/legFR/legBL/legBR, wingL/wingR,
// eyeL/eyeR (+Pup, +Lid), jaw, tongue, tuft, fan, crest. İleri yön +Z.
import { grp, blob, caps, cone, cyl, torus, lathe, eye, leg, tailChain, mark, THREE } from './kit.js';

const mixHex = (a, b, t) => { const A = new THREE.Color(a), B = new THREE.Color(b); return '#' + A.lerp(B, t).getHexString(); };
const lighten = (c, t = 0.35) => mixHex(c, '#F6EEDD', t), darken = (c, t = 0.3) => mixHex(c, '#1A1719', t);
const pick = (arr, st) => arr[Math.min(st, arr.length - 1)];

// ---------------------------------------------------------------- dört ayaklı (kedi, köpek, keçi, doodle'ın akrabası)
function quad(o) {
  const root = grp(null, 'root');
  const L = o.legLen, rx = o.bodyW, ry = o.bodyH, rz = o.bodyL;
  const body = grp(root, 'body', 0, L + ry * 0.55, 0);
  blob(body, o.col, 0, 0, 0, rx, ry, rz);
  blob(body, o.belly, 0, -ry * 0.42, rz * 0.12, rx * 0.78, ry * 0.55, rz * 0.8);
  if (o.chest) blob(body, o.chest, 0, ry * 0.05, rz * 0.62, rx * 0.72, ry * 0.75, rz * 0.42);
  (o.marks || []).forEach(m => mark(body, m.c, rx, ry, rz, 0, 0, 0, m.u, m.v, m.w, m.h, m.d, m.ring));
  // bacaklar (kalça gövdenin altında)
  const hipY = -ry * 0.35, hipZ = rz * 0.58, hipX = rx * 0.55;
  const legLen = L + ry * 0.55 + hipY;
  for (const [n, x, z, c] of [['legFL', hipX, hipZ, o.col], ['legFR', -hipX, hipZ, o.col], ['legBL', hipX, -hipZ, o.col], ['legBR', -hipX, -hipZ, o.col]])
    leg(body, n, x, hipY, z, legLen, o.legR, c, o.paw);
  // kuyruk
  const tail = tailChain(body, 'tail', 0, ry * 0.25, -rz * 0.92, o.tailN || 4, o.tailSeg, o.tailR0, o.tailR1, o.tailCol || o.col, o.tailDir || [0, 0.75, -0.6], o.tailTip);
  // baş
  const head = grp(body, 'head', 0, ry * 0.62, rz * 0.82);
  blob(head, o.col, 0, o.neckY ?? 0.06, -0.06, rx * 0.62, ry * 0.7, rz * 0.32);         // boyun
  const hs = o.headR;
  const skull = grp(head, 'skull', 0, hs * 0.9, hs * 0.35);
  blob(skull, o.col, 0, 0, 0, hs, hs * 0.92, hs * 0.95);
  if (o.cheeks) { blob(skull, o.cheeks, hs * 0.48, -hs * 0.3, hs * 0.45, hs * 0.42, hs * 0.36, hs * 0.36); blob(skull, o.cheeks, -hs * 0.48, -hs * 0.3, hs * 0.45, hs * 0.42, hs * 0.36, hs * 0.36); }
  const muz = o.muzzle || 0.4;
  blob(skull, o.muzCol || lighten(o.col, 0.25), 0, -hs * 0.32, hs * (0.72 + muz * 0.4), hs * 0.42, hs * 0.32, hs * (0.3 + muz * 0.55));
  blob(skull, o.noseCol || '#C9837A', 0, -hs * 0.14, hs * (1.0 + muz * 0.82), hs * 0.12, hs * 0.08, hs * 0.08, { gloss: true });
  const jaw = grp(skull, 'jaw', 0, -hs * 0.48, hs * (0.6 + muz * 0.4));
  blob(jaw, o.muzCol || lighten(o.col, 0.25), 0, 0, 0, hs * 0.3, hs * 0.12, hs * (0.22 + muz * 0.4));
  const tongue = grp(jaw, 'tongue', 0, 0.01, hs * (0.2 + muz * 0.3)); blob(tongue, '#D9786E', 0, 0, 0, hs * 0.14, hs * 0.04, hs * 0.2); tongue.scale.set(0.001, 0.001, 0.001);
  // gözler
  const ey = hs * 0.18, ez = hs * 0.78, ex = hs * 0.4;
  eye(skull, 'eyeL', ex, ey, ez, hs * o.eyeR, { iris: o.iris, pupil: o.pupil, lid: o.lidCol || o.col, ry: 0.32 });
  eye(skull, 'eyeR', -ex, ey, ez, hs * o.eyeR, { iris: o.iris, pupil: o.pupil, lid: o.lidCol || o.col, ry: -0.32 });
  // kulaklar
  for (const [n, s] of [['earL', 1], ['earR', -1]]) {
    const e = grp(skull, n, s * hs * 0.55, hs * 0.62, -hs * 0.05);
    if (o.floppy) { blob(e, o.earCol || o.col, s * hs * 0.18, -hs * 0.5, 0.02, hs * 0.2, hs * 0.55, hs * 0.12); e.rotation.z = s * 0.25; }
    else {
      cone(e, o.earCol || o.col, 0, hs * o.earH * 0.5, 0, hs * o.earW, hs * o.earH, 0, 0, -s * 0.22, { flat: 0.45 });
      cone(e, o.earIn || '#C98C7E', 0, hs * o.earH * 0.42, hs * 0.05, hs * o.earW * 0.6, hs * o.earH * 0.75, 0, 0, -s * 0.22, { flat: 0.25 });
      if (o.tufts) cone(e, '#1E1B1D', -s * hs * o.earH * 0.2, hs * o.earH * 1.1, 0, hs * 0.04, hs * 0.4, 0, 0, -s * 0.22);
    }
  }
  if (o.whiskers) for (const s of [1, -1]) for (let i = 0; i < 3; i++)
    cyl(skull, '#F3EBD8', s * hs * 0.62, -hs * 0.32 - i * hs * 0.07, hs * 1.0, 0.004, hs * 0.75, 0, 0, s * (1.45 + i * 0.12), { smooth: true });
  if (o.extraHead) o.extraHead(skull, hs);
  if (o.extraBody) o.extraBody(body, rx, ry, rz, head);
  return { root, meta: { gait: 'walk', leg: legLen, quad: true, height: L + ry * 1.6 + hs * 2, sit: o.sit !== false } };
}

const CAT_COATS = ['#2A2629', '#C7742F', '#9A938C', '#E2D2B2', '#6A4A36', '#F0E8D8', '#5C6670', '#D9A940'];
function cat(st, coat) {
  const col = st < 2 ? CAT_COATS[coat % 8] : ['', '', '#A8957A', '#B98A55', '#D6A445', '#26232A'][st];
  const dark = darken(col, 0.45), k = [1.25, 1.1, 1, 0.95, 0.95, 0.95][st];
  const marks = [];
  if (st === 1) for (let i = 0; i < 5; i++) marks.push({ c: darken(col, 0.4), u: Math.PI / 2 * (i % 2 ? 1 : -1), v: 0.4, w: 0.03, h: 0.16, d: 0.02 }, { c: darken(col, 0.4), u: 0, v: 0.9 - i * 0.05, w: 0.18, h: 0.025, d: 0.02 });
  const spots = (c, ring, n = 14, sz = 0.035) => { for (let i = 0; i < n; i++) marks.push({ c, u: (i * 2.399) % (Math.PI * 2), v: -0.1 + ((i * 0.618) % 1) * 1.1, w: sz, h: sz, d: 0.012, ring }); };
  if (st === 2) spots(darken(col, 0.5), false, 12, 0.025);
  if (st === 4) spots('#2A2420', true, 16, 0.035);
  if (st === 5) spots('#3A3640', true, 14, 0.035);
  if (st === 1) { marks.length = 0; for (let i = 0; i < 6; i++) marks.push({ c: darken(col, 0.42), u: -1.2 + i * 0.48, v: 0.55, w: 0.035, h: 0.2, d: 0.018 }); }
  return quad({
    col, belly: lighten(col, st === 5 ? 0.08 : 0.35), chest: st >= 3 && st < 5 ? lighten(col, 0.45) : null, paw: lighten(col, 0.18),
    legLen: [0.26, 0.32, 0.38, 0.42, 0.42, 0.44][st], legR: 0.055, bodyW: 0.2, bodyH: 0.2, bodyL: [0.28, 0.32, 0.34, 0.4, 0.4, 0.44][st],
    headR: 0.2 * k, eyeR: [0.32, 0.28, 0.25, 0.24, 0.24, 0.24][st], iris: st === 5 ? '#7FB03A' : '#C9A22E', pupil: 'slit', muzzle: st === 3 ? 0.35 : 0.22,
    muzCol: st === 3 ? '#EADBC0' : lighten(col, 0.3), earH: [1.0, 0.95, 1.15, 0.85, 0.85, 0.85][st], earW: 0.36, tufts: st === 2,
    cheeks: st === 2 ? lighten(col, 0.25) : null, whiskers: true, tailN: 5, tailSeg: st === 2 ? 0.05 : 0.11, tailR0: 0.045, tailR1: 0.03, tailTip: st === 2 ? '#1E1B1D' : null, marks,
    extraBody: st >= 1 && st <= 2 ? (b, rx, ry, rz) => { const c = torus(b, '#B4532A', 0, ry * 0.75, rz * 0.82, 0.13, 1.25, 0, 0, 0.9); blob(b, '#C99A2E', 0, ry * 0.42, rz * 0.98, 0.03); } : null,
  });
}
const DOG_COATS = ['#D8C5A0', '#B07A4C', '#9B9088', '#3A3436', '#8C8E94', '#E6DCC6', '#A06A4C', '#C99A5E'];
function dog(st, coat) {
  const col = st < 2 ? DOG_COATS[coat % 8] : ['', '', '#D9B98A', '#A8A29A', '#8E877F', '#4A4448'][st];
  const k = [1.28, 1.12, 1.02, 0.96, 0.95, 1][st];
  return quad({
    col, belly: lighten(col, 0.4), chest: lighten(col, 0.5), paw: lighten(col, 0.3),
    legLen: [0.24, 0.32, 0.42, 0.48, 0.5, 0.52][st], legR: 0.065, bodyW: 0.22, bodyH: 0.22, bodyL: [0.3, 0.36, 0.42, 0.46, 0.48, 0.52][st],
    headR: 0.2 * k, eyeR: [0.3, 0.26, 0.22, 0.2, 0.2, 0.2][st], iris: st >= 3 ? '#D9A43A' : '#5A3A22', pupil: 'round', muzzle: [0.5, 0.7, 0.9, 1.05, 1.1, 1.1][st],
    muzCol: st === 2 ? '#2A2629' : lighten(col, 0.4), noseCol: '#1E1B1D', floppy: st === 0, earH: [1, 0.9, 1.0, 1.15, 1.2, 1.25][st], earW: 0.32, earIn: darken(col, 0.25),
    tailN: 4, tailSeg: [0.08, 0.1, 0.12, 0.14, 0.15, 0.16][st], tailR0: [0.05, 0.06, 0.07, 0.08, 0.085, 0.09][st], tailR1: [0.04, 0.05, 0.06, 0.07, 0.07, 0.075][st], tailTip: st >= 3 ? lighten(col, 0.5) : null,
    tailDir: st >= 3 ? [0, 0.1, -1] : [0, 0.8, -0.6],
    extraBody: (b, rx, ry, rz, head) => {
      if (st === 1 || st === 3 || st === 4) torus(b, '#B4532A', 0, ry * 0.72, rz * 0.8, 0.15, 1.2, 0, 0, 0.8);
      if (st === 2) { torus(b, '#1E1B1D', 0, ry * 0.72, rz * 0.8, 0.15, 1.2, 0, 0, 0.9); for (let i = 0; i < 6; i++) cone(b, '#C8C2B8', Math.cos(i) * 0.15, ry * 0.72 + Math.sin(i) * 0.1, rz * 0.86, 0.015, 0.05, 1.2, 0, 0); }
      if (st === 5) for (let i = 0; i < 7; i++) blob(b, darken(col, 0.35), (i - 3) * 0.05, ry * 0.85, rz * 0.7 - Math.abs(i - 3) * 0.03, 0.08, 0.12, 0.06);
    },
    extraHead: st === 5 ? (s, hs) => cyl(s, '#E8DCC8', hs * 0.45, hs * 0.35, hs * 0.86, 0.006, hs * 0.5, 0, 0, 0.5, { smooth: true }) : null,
  });
}
function goat(st) {
  // keçi: masum av gibi görünen; beyaz, karanlık perçem bir gözünü örter, gözler boş (yatay bebek), boynuz evreyle büyür
  const col = ['#EFE8DC', '#E8E0D2', '#E2D9CA', '#D9D0C0', '#CFC6B6', '#3A3538'][st];
  const fr = st === 5 ? '#1A1719' : '#2A2629';
  return quad({
    col, belly: lighten(col, 0.3), paw: '#3A3538', legLen: [0.28, 0.34, 0.42, 0.46, 0.5, 0.52][st], legR: 0.05, bodyW: 0.2, bodyH: 0.22, bodyL: [0.28, 0.32, 0.38, 0.42, 0.44, 0.46][st],
    headR: 0.19 * [1.22, 1.1, 1, 0.98, 0.97, 1][st], eyeR: 0.22, iris: st === 5 ? '#B4532A' : '#D8CBA0', pupil: 'bar', muzzle: 0.8, muzCol: lighten(col, 0.15), noseCol: '#6A5A55',
    floppy: true, earCol: col, sit: false, tailN: 2, tailSeg: 0.06, tailR0: 0.04, tailR1: 0.03, tailDir: [0, 1, -0.3],
    extraHead: (s, hs) => {
      // perçem (emo): tek gözün üstüne düşen koyu tutam
      blob(s, fr, hs * 0.22, hs * 0.52, hs * 0.62, hs * 0.5, hs * 0.38, hs * 0.22);
      blob(s, fr, hs * 0.38, hs * 0.18, hs * 0.86, hs * 0.26, hs * 0.34, hs * 0.1);
      blob(s, fr, -hs * 0.1, hs * 0.72, hs * 0.38, hs * 0.38, hs * 0.22, hs * 0.3);
      // boynuzlar
      const hn = [0, 0.25, 0.45, 0.7, 0.95, 1.15][st];
      if (hn) for (const sx of [1, -1]) { const h = grp(s, '', sx * hs * 0.42, hs * 0.72, -hs * 0.12); for (let i = 0; i < 4; i++) { const t = i / 3; cone(h, '#5A4E48', sx * hs * 0.1 * t * hn, hs * (0.2 + 0.32 * i) * hn, -hs * 0.25 * t * t * hn, hs * (0.16 - 0.03 * i), hs * 0.42 * hn, -0.5 - t * 0.6, 0, -sx * 0.25); } }
      // sakal
      if (st >= 2) cone(s, st === 5 ? fr : '#BFB6A6', 0, -hs * 0.9, hs * 0.86, hs * 0.12, hs * (0.3 + st * 0.06), Math.PI, 0, 0);
      if (st === 5) { blob(s, '#C8553D', hs * 0.38, hs * 0.18, hs * 0.92, 0.02, 0.02, 0.01, { glow: '#C8553D' }); }
    },
  });
}

// ---------------------------------------------------------------- iki ayaklı kuşlar (civciv/tavus, baykuş)
function bird(o) {
  const root = grp(null, 'root');
  const body = grp(root, 'body', 0, o.legLen + o.bodyR * 0.9, 0);
  blob(body, o.col, 0, 0, 0, o.bodyR * (o.bodyW || 1), o.bodyR * (o.bodyH || 1), o.bodyR * (o.bodyD || 0.95));
  blob(body, o.belly, 0, -o.bodyR * 0.18, o.bodyR * 0.45, o.bodyR * 0.68, o.bodyR * 0.72, o.bodyR * 0.55);
  if (o.scales) for (let i = 0; i < 9; i++) mark(body, o.scales, o.bodyR * 0.72, o.bodyR * 0.78, o.bodyR * 0.62, 0, -o.bodyR * 0.18, o.bodyR * 0.45, -0.5 + (i % 3) * 0.5, 0.2 - Math.floor(i / 3) * 0.3, 0.035, 0.022, 0.015);
  for (const [n, s] of [['wingL', 1], ['wingR', -1]]) {
    const w = grp(body, n, s * o.bodyR * 0.85, o.bodyR * 0.25, 0);
    blob(w, o.wing || darken(o.col, 0.15), s * o.bodyR * 0.08, -o.bodyR * 0.35, -o.bodyR * 0.05, o.bodyR * 0.16, o.bodyR * (o.wingL || 0.55), o.bodyR * 0.45);
  }
  if (o.legLen > 0.01) for (const [n, s] of [['legFL', 1], ['legFR', -1]]) {
    const g = grp(body, n, s * o.bodyR * 0.32, -o.bodyR * 0.75, 0);
    const len = o.legLen + o.bodyR * 0.15;
    cyl(g, o.legCol || '#B4532A', 0, -len / 2, 0, 0.018, len);
    for (const a of [-0.5, 0, 0.5]) cyl(g, o.legCol || '#B4532A', Math.sin(a) * 0.05, -len + 0.01, Math.cos(a) * 0.05, 0.014, 0.1, Math.PI / 2, 0, -a);
    g.userData.len = len;
  }
  const head = grp(body, 'head', 0, o.bodyR * (o.headUp ?? 0.75), o.bodyR * (o.headFwd ?? 0.15));
  if (o.neck) caps(head, o.neckCol || o.col, 0, o.neck * 0.5, 0, o.headR * 0.42, o.neck);
  const skull = grp(head, 'skull', 0, o.headR * 0.8 + (o.neck || 0), 0);
  blob(skull, o.headCol || o.col, 0, 0, 0, o.headR, o.headR * 0.95, o.headR * 0.95);
  if (o.disc) { blob(skull, o.disc, o.headR * 0.38, 0, o.headR * 0.55, o.headR * 0.5, o.headR * 0.55, o.headR * 0.35); blob(skull, o.disc, -o.headR * 0.38, 0, o.headR * 0.55, o.headR * 0.5, o.headR * 0.55, o.headR * 0.35); }
  const er = o.headR * o.eyeR;
  eye(skull, 'eyeL', o.headR * o.eyeX, o.headR * 0.12, o.headR * 0.78, er, { iris: o.iris, pupil: o.pupil || 'bead', lid: o.lid || o.headCol || o.col, ry: 0.3 });
  eye(skull, 'eyeR', -o.headR * o.eyeX, o.headR * 0.12, o.headR * 0.78, er, { iris: o.iris, pupil: o.pupil || 'bead', lid: o.lid || o.headCol || o.col, ry: -0.3 });
  cone(skull, o.beak || '#D9772E', 0, -o.headR * 0.12, o.headR * 1.0, o.headR * 0.2, o.headR * (o.beakL || 0.45), Math.PI / 2 + 0.25, 0, 0);
  const jaw = grp(skull, 'jaw', 0, -o.headR * 0.24, o.headR * 0.88);
  cone(jaw, darken(o.beak || '#D9772E', 0.2), 0, 0, 0.02, o.headR * 0.13, o.headR * (o.beakL || 0.45) * 0.6, Math.PI / 2 + 0.5, 0, 0);
  if (o.tuft) { const t = grp(skull, 'tuft', 0, o.headR * 0.9, 0); for (const [x, h] of [[-0.3, 0.5], [0, 0.75], [0.3, 0.55]]) cone(t, o.tuftCol || o.col, x * o.headR, h * o.headR * 0.5, 0, o.headR * 0.12, h * o.headR, 0, 0, -x * 0.6); }
  if (o.ears) for (const [n, s] of [['earL', 1], ['earR', -1]]) { const e = grp(skull, n, s * o.headR * 0.62, o.headR * 0.7, 0); cone(e, o.earCol || o.col, 0, o.headR * o.ears * 0.4, 0, o.headR * 0.2, o.headR * o.ears, 0, 0, -s * 0.35, { flat: 0.5 }); }
  if (o.extra) o.extra(root, body, skull, head);
  return { root, meta: { gait: 'hop', hop: o.hop || 0.4, leg: o.legLen, height: o.legLen + o.bodyR * 2 + o.headR * 2 } };
}
function chick(st) {
  if (st === 0) {
    // yumurta: çatlaktan bakan iki göz, kabuk sallanır
    const root = grp(null, 'root');
    const body = grp(root, 'body', 0, 0, 0);
    lathe(body, '#F2EADB', [[0, 0], [0.22, 0.05], [0.3, 0.2], [0.3, 0.38], [0.24, 0.56], [0.12, 0.66], [0, 0.69]]);
    for (let i = 0; i < 6; i++) blob(body, '#4A6378', Math.cos(i * 1.7) * 0.29, 0.12 + (i * 0.09) % 0.4, Math.sin(i * 1.7) * 0.29, 0.018, 0.018, 0.01);
    const head = grp(body, 'head', 0, 0.42, 0.2);
    blob(head, '#2A2629', 0, 0, 0.06, 0.16, 0.07, 0.06);
    eye(head, 'eyeL', 0.06, 0, 0.08, 0.035, { pupil: 'bead', lid: '#2A2629' }); eye(head, 'eyeR', -0.06, 0, 0.08, 0.035, { pupil: 'bead', lid: '#2A2629' });
    const t = grp(head, 'tuft', 0, 0.18, -0.05); cone(t, '#E2B13A', 0, 0.05, 0, 0.025, 0.1);
    return { root, meta: { gait: 'hop', hop: 0.25, leg: 0, height: 0.7 } };
  }
  if (st >= 4) {
    const adult = st === 5;
    const col = adult ? '#2E5A8A' : '#B9A47C', neck = adult ? '#24686A' : '#7A947E';
    return bird({ col, belly: adult ? '#24686A' : '#D8C5A0', wing: adult ? '#5A4630' : '#9E8A62', legLen: 0.3, bodyR: 0.24, bodyD: 1.25, bodyH: 0.85, headR: 0.09, neck: 0.32, neckCol: neck, headCol: neck,
      eyeR: 0.28, eyeX: 0.55, beak: '#B9A47C', beakL: 0.5, headUp: 0.6, headFwd: 0.7, legCol: '#7A6E66', hop: 0.45, tuft: false,
      extra: (root, body, skull) => {
        // taç
        const t = grp(skull, 'tuft', 0, 0.08, -0.01); for (const a of [-0.35, 0, 0.35]) { cyl(t, neck, Math.sin(a) * 0.06, 0.07, 0, 0.004, 0.14, 0, 0, -a); blob(t, adult ? '#2FA5A0' : '#9EB07A', Math.sin(a) * 0.12, 0.14, 0, 0.018); }
        // yelpaze kuyruk: arkada yay şeklinde tüyler, uçta göz deseni
        const fan = grp(body, 'fan', 0, 0.05, -0.22);
        const n = adult ? 15 : 7, R = adult ? 0.62 : 0.34;
        for (let i = 0; i < n; i++) {
          const a = -Math.PI * 0.45 + Math.PI * 0.9 * i / (n - 1);
          const f = grp(fan, '', 0, 0, 0); f.rotation.z = -a; f.rotation.x = -0.35;
          caps(f, adult ? '#2E7A6E' : '#B9A47C', 0, R * 0.5, -0.02, 0.012, R);
          blob(f, adult ? '#2A8A84' : '#C9B68C', 0, R * 0.92, -0.02, 0.07 * (adult ? 1 : 0.6), 0.1 * (adult ? 1 : 0.6), 0.015);
          blob(f, adult ? '#D9A43A' : '#D8C5A0', 0, R * 0.93, 0, 0.045 * (adult ? 1 : 0.6), 0.06 * (adult ? 1 : 0.6), 0.015);
          blob(f, adult ? '#1F3F66' : '#7A6E66', 0, R * 0.93, 0.012, 0.025 * (adult ? 1 : 0.6), 0.03 * (adult ? 1 : 0.6), 0.012);
        }
      } });
  }
  const shell = st === 1;
  return bird({ col: '#E2B13A', belly: '#F2D782', wing: '#D19E2A', legLen: shell ? 0.02 : [0, 0, 0.12, 0.17][st], bodyR: [0, 0.24, 0.26, 0.26][st], bodyH: st === 3 ? 0.95 : 1, headR: [0, 0.18, 0.17, 0.15][st],
    eyeR: 0.24, eyeX: 0.42, beak: '#D9772E', beakL: 0.4, tuft: true, tuftCol: st === 3 ? '#B4532A' : '#E2B13A', headUp: 0.85, headFwd: 0.2, wingL: st === 3 ? 0.85 : 0.5, hop: 0.3, legCol: '#C8553D',
    extra: (root, body) => {
      if (shell) {
        const sh = grp(root, 'shell', 0, 0, 0);
        lathe(sh, '#F2EADB', [[0, 0], [0.22, 0.03], [0.31, 0.14], [0.32, 0.26], [0.31, 0.27], [0.3, 0.15], [0.21, 0.05], [0, 0.04]]);
        for (let i = 0; i < 8; i++) cone(sh, '#F2EADB', Math.cos(i * 0.785) * 0.3, 0.29, Math.sin(i * 0.785) * 0.3, 0.05, 0.08, 0, -i * 0.785, 0);
        body.position.y = 0.26;
      }
      if (st === 3) { const t = grp(body, 'tail', 0, 0.05, -0.24); for (const a of [-0.4, 0, 0.4]) cone(t, '#D19E2A', a * 0.12, 0.08, -0.04, 0.05, 0.22, -0.9, 0, a); }
    } });
}
function owl(st) {
  const P = [['#C9C1B4', '#E6DECF', '#E6DECF', '#5A7A99'], ['#9B9087', '#D8C5A0', '#D8C5A0', '#C99A2E'], ['#8A6A4A', '#D8C5A0', '#C7B08A', '#C99A2E'],
    ['#C99A5E', '#F3EBD8', '#F6F0E2', '#1E1B1D'], ['#7A5A3C', '#C9A57A', '#B9874E', '#E07A2E'], ['#2E3B4E', '#5A6A80', '#4A5A70', '#E2B13A']][st];
  return bird({ col: P[0], belly: P[1], disc: P[2], iris: P[3], pupil: 'round', legLen: 0.05, bodyR: [0.27, 0.27, 0.27, 0.29, 0.32, 0.33][st], bodyH: 1.15, bodyW: st === 0 ? 1.1 : 1, headR: [0.24, 0.23, 0.22, 0.22, 0.24, 0.25][st],
    eyeR: [0.36, 0.34, 0.34, 0.3, 0.34, 0.34][st], eyeX: 0.4, beak: '#3A3538', beakL: 0.3, headUp: 0.9, headFwd: 0.05, wingL: 0.85, hop: 0.38, legCol: '#5A4E48',
    ears: [0, 0.35, 0, 0, 0.9, 0.7][st], scales: st === 3 ? null : darken(P[1], 0.3), lid: P[2],
    extra: (root, body, skull) => {
      if (st === 2) for (let i = 0; i < 10; i++) mark(skull, '#F3EBD8', 0.22, 0.21, 0.21, 0, 0, 0, -2.4 + i * 0.5, 0.5 + (i % 2) * 0.2, 0.018, 0.018, 0.01);
      if (st === 3) torus(skull, '#C9A57A', 0, -0.02, 0.12, 0.2, 0, 0, 0, 0.3);
      if (st === 5) for (const s of [1, -1]) blob(skull, '#E2B13A', s * 0.088, 0.027, 0.2, 0.05, 0.05, 0.01, { glow: '#E2B13A', alpha: 0.35 });
    } });
}

// ---------------------------------------------------------------- gecko (yayvan dört ayak, uzun kuyruk)
function gecko(st, coat) {
  const COATS = ['#8FB89A', '#B9AC98', '#B4532A', '#4A6378', '#C99A2E', '#7A5A7E', '#2E2A2C', '#9B9087'];
  const col = st < 2 ? COATS[coat % 8] : ['', '', '#D8B44A', '#8C7A5A', '#6E9A4A', '#24686A'][st];
  const root = grp(null, 'root');
  const k = [1.2, 1.32, 1.45, 1.52, 1.6, 1.68][st];
  const body = grp(root, 'body', 0, 0.13 * k, 0);
  blob(body, col, 0, 0, 0, 0.13 * k, 0.08 * k, 0.28 * k);
  blob(body, lighten(col, 0.35), 0, -0.04 * k, 0.02, 0.1 * k, 0.04 * k, 0.24 * k);
  const spots = st === 2 ? '#1E1B1D' : st === 1 || st === 5 ? '#E2B13A' : null;
  if (spots) for (let i = 0; i < 12; i++) mark(body, spots, 0.13 * k, 0.08 * k, 0.28 * k, 0, 0, 0, -0.8 + (i % 4) * 0.55, 0.5 + (i % 3) * 0.2, 0.018 * k, 0.018 * k, 0.008);
  if (st === 3) for (let i = 0; i < 4; i++) mark(body, darken(col, 0.35), 0.13 * k, 0.08 * k, 0.28 * k, 0, 0, 0, 0, 1.0, 0.14 * k, 0.018 * k, 0.01);
  if (st >= 3) { const cr = grp(body, 'crest', 0, 0.07 * k, 0); for (let i = 0; i < 7; i++) cone(cr, '#C8553D', 0, 0.02 * k, (0.2 - i * 0.065) * k, 0.018 * k, [0.04, 0.06, 0.08][st - 3] * k, 0, 0, 0); }
  // bacaklar: yana açık
  for (const [n, s, z] of [['legFL', 1, 0.17], ['legFR', -1, 0.17], ['legBL', 1, -0.17], ['legBR', -1, -0.17]]) {
    const g = grp(body, n, s * 0.11 * k, -0.02 * k, z * k);
    caps(g, col, s * 0.06 * k, -0.02 * k, 0, 0.025 * k, 0.12 * k, 0, 0, s * 1.2);
    caps(g, col, s * 0.12 * k, -0.07 * k, 0, 0.022 * k, 0.1 * k, 0, 0, s * 0.2);
    for (const a of [-0.6, 0, 0.6]) blob(g, darken(col, 0.15), s * 0.12 * k + Math.sin(a) * 0.03 * k, -0.11 * k, Math.cos(a) * 0.03 * k, 0.014 * k, 0.008 * k, 0.014 * k);
    g.userData.len = 0.11 * k;
  }
  tailChain(body, 'tail', 0, 0, -0.26 * k, 6, [0.07, 0.08, 0.09, 0.09, 0.1, 0.1][st] * k, 0.055 * k, 0.015 * k, col, st === 4 ? [0, 0.35, -1] : [0, 0.05, -1]);
  const head = grp(body, 'head', 0, 0.02 * k, 0.27 * k);
  const skull = grp(head, 'skull', 0, 0.02 * k, 0.07 * k);
  blob(skull, col, 0, 0, 0, 0.11 * k, 0.07 * k, 0.12 * k);
  blob(skull, lighten(col, 0.3), 0, -0.035 * k, 0.03 * k, 0.09 * k, 0.03 * k, 0.1 * k);
  const ek = st === 0 ? 1.25 : 1;
  eye(skull, 'eyeL', 0.085 * k, 0.04 * k, 0.03 * k, 0.04 * k * ek, { iris: '#D9A43A', pupil: 'slit', lid: col, ry: 1.1 });
  eye(skull, 'eyeR', -0.085 * k, 0.04 * k, 0.03 * k, 0.04 * k * ek, { iris: '#D9A43A', pupil: 'slit', lid: col, ry: -1.1 });
  const jaw = grp(skull, 'jaw', 0, -0.04 * k, 0.06 * k); blob(jaw, darken(col, 0.1), 0, 0, 0, 0.07 * k, 0.015 * k, 0.06 * k);
  const tongue = grp(jaw, 'tongue', 0, 0.005, 0.07 * k); caps(tongue, '#4A6378', 0, 0, 0.04 * k, 0.008 * k, 0.1 * k, Math.PI / 2, 0, 0); tongue.scale.set(0.001, 0.001, 0.001);
  if (st === 4) cone(skull, darken(col, 0.2), 0, 0.08 * k, -0.04 * k, 0.07 * k, 0.12 * k, -0.6, 0, 0, { flat: 0.4 });
  if (st === 5) { for (const s of [1, -1]) cone(skull, '#D8C5A0', s * 0.05 * k, 0.08 * k, -0.06 * k, 0.018 * k, 0.1 * k, -0.7, 0, -s * 0.3); for (let i = 0; i < 5; i++) cone(skull, '#C8553D', (i - 2) * 0.03 * k, -0.07 * k, 0.04 * k, 0.012 * k, 0.05 * k, Math.PI, 0, 0); }
  return { root, meta: { gait: 'walk', leg: 0.11 * k, height: 0.3 * k, sprawl: true } };
}

// ---------------------------------------------------------------- bitki (saksıda; evreye göre bambaşka)
function plant(st) {
  const root = grp(null, 'root');
  const pot = grp(root, 'pot');
  lathe(pot, '#B4532A', [[0, 0], [0.2, 0], [0.24, 0.26], [0.29, 0.27], [0.29, 0.33], [0.26, 0.33], [0.25, 0.3], [0, 0.3]]);
  for (let i = 0; i < 6; i++) blob(pot, '#E2B13A', Math.cos(i * 1.047) * 0.225, 0.14, Math.sin(i * 1.047) * 0.225, 0.02, 0.02, 0.008).lookAt(0, 0.14, 0);
  blob(pot, '#4A3A2C', 0, 0.3, 0, 0.25, 0.03, 0.25);
  const body = grp(root, 'body', 0, 0.31, 0);
  const face = (parent, y, z, r, col, eyeR = 0.035) => {
    const h = grp(parent, 'head', 0, y, 0);
    eye(h, 'eyeL', r * 0.38, 0.02, z, eyeR, { pupil: 'bead', lid: col }); eye(h, 'eyeR', -r * 0.38, 0.02, z, eyeR, { pupil: 'bead', lid: col });
    const j = grp(h, 'jaw', 0, -r * 0.3, z); blob(j, '#2A2629', 0, 0, 0, r * 0.12, 0.008, 0.008);
    return h;
  };
  const OL = '#6E8A3A', OLD = '#4E6A28';
  if (st === 0) {
    blob(body, '#8A5A3A', 0, 0.04, 0, 0.12, 0.09, 0.1);
    face(body, 0.05, 0.09, 0.12, '#8A5A3A', 0.025);
    const b = grp(body, 'tuft', 0, 0.12, 0); caps(b, OL, 0, 0.05, 0, 0.012, 0.1, 0, 0, 0.3); blob(b, OL, -0.03, 0.11, 0, 0.03, 0.015, 0.02);
  } else if (st === 1) {
    cyl(body, OLD, 0, 0.12, 0, 0.018, 0.24);
    for (const [n, s] of [['wingL', 1], ['wingR', -1]]) { const w = grp(body, n, 0, 0.12, 0); blob(w, s > 0 ? OL : OLD, s * 0.1, 0.03, 0, 0.1, 0.02, 0.05).rotation.z = s * 0.3; }
    blob(body, OL, 0, 0.3, 0, 0.09, 0.085, 0.085);
    face(body, 0.3, 0.08, 0.09, OL, 0.025);
  } else if (st === 2) {
    cyl(body, OLD, 0, 0.2, 0, 0.018, 0.4);
    for (const [n, s, y] of [['wingL', 1, 0.08], ['wingR', -1, 0.14]]) { const w = grp(body, n, 0, y, 0); blob(w, s > 0 ? OL : OLD, s * 0.1, 0.02, 0, 0.11, 0.02, 0.05).rotation.z = s * 0.4; }
    const fl = grp(body, 'flower', 0, 0.44, 0.02);
    for (let i = 0; i < 12; i++) { const p = grp(fl, '', 0, 0, 0); p.rotation.z = i * Math.PI / 6; blob(p, i % 2 ? '#F6F0E2' : '#ECE2CC', 0, 0.14, 0, 0.04, 0.09, 0.015); }
    blob(fl, '#E2B13A', 0, 0, 0.01, 0.085, 0.085, 0.05);
    face(fl, 0, 0.06, 0.085, '#E2B13A', 0.02);
  } else if (st === 3) {
    cyl(body, OLD, 0, 0.18, 0, 0.018, 0.36);
    for (const [n, s] of [['wingL', 1], ['wingR', -1]]) { const w = grp(body, n, 0, 0.04, 0); blob(w, s > 0 ? OL : OLD, s * 0.06, 0.16, 0, 0.04, 0.18, 0.025).rotation.z = -s * 0.25; }
    const cup = grp(body, 'flower', 0, 0.42, 0);
    for (let i = 0; i < 5; i++) { const p = grp(cup, '', 0, 0, 0); p.rotation.y = i * 1.2566; blob(p, i % 2 ? '#C8553D' : '#D9705A', 0, 0.06, 0.06, 0.07, 0.11, 0.04).rotation.x = -0.25; }
    face(cup, 0.04, 0.12, 0.1, '#C8553D', 0.022);
  } else if (st === 4) {
    caps(body, OL, 0, 0.24, 0, 0.13, 0.4);
    for (let i = 0; i < 14; i++) blob(body, '#ECE2CC', Math.cos(i * 2.4) * 0.13, 0.08 + (i * 0.031) % 0.38, Math.sin(i * 2.4) * 0.13, 0.008);
    const L = grp(body, 'wingL', 0.12, 0.2, 0); caps(L, OL, 0.08, 0, 0, 0.06, 0.16, 0, 0, Math.PI / 2); caps(L, OL, 0.15, 0.08, 0, 0.055, 0.14); const bud = grp(L, 'bud', 0.15, 0.2, 0); blob(bud, '#D98B73', 0, 0, 0, 0.045, 0.06, 0.045);
    const R = grp(body, 'wingR', -0.12, 0.18, 0); caps(R, '#B9A47C', -0.07, -0.02, 0, 0.05, 0.14, 0, 0, -Math.PI / 2 + 0.5);
    face(body, 0.3, 0.13, 0.13, OL, 0.03);
  } else {
    // ulu ağaç: gövdede yüz, bir yanı yapraklı ve meyveli, öbür yanı çıplak
    caps(body, '#7E5A3C', 0, 0.2, 0, 0.07, 0.34);
    face(body, 0.16, 0.065, 0.07, '#7E5A3C', 0.022);
    const L = grp(body, 'wingL', 0.02, 0.38, 0);
    for (const [x, y, z, r] of [[0.08, 0.06, 0, 0.17], [-0.02, 0.2, 0.02, 0.18], [0.16, 0.18, -0.04, 0.12], [0.04, 0.1, 0.12, 0.12]]) blob(L, r > 0.15 ? '#6E8A3A' : '#5A7A30', x, y, z, r);
    for (const [x, y, z] of [[0.12, 0.08, 0.15], [-0.05, 0.22, 0.18]]) blob(L, '#D98B73', x, y, z, 0.025);
    const R = grp(body, 'wingR', -0.03, 0.34, 0); caps(R, '#7E5A3C', -0.1, 0.06, 0, 0.018, 0.2, 0, 0, 0.9); caps(R, '#7E5A3C', -0.16, 0.14, 0, 0.012, 0.12, 0, 0, 0.2); blob(R, '#B9A47C', -0.22, 0.2, 0, 0.03, 0.015, 0.02);
  }
  return { root, meta: { gait: 'hop', hop: 0.22, leg: 0, height: 0.8 } };
}

// ---------------------------------------------------------------- balina (havada süzülür; yüzgeçleriyle uçabileceğini sanır)
function whale(st) {
  const col = ['#7A93A8', '#6A86A0', '#5A7896', '#4A6A8A', '#3E5C7A', '#2E4560'][st];
  const k = [0.62, 0.72, 0.82, 0.92, 1.02, 1.12][st];
  const root = grp(null, 'root');
  const body = grp(root, 'body', 0, 0.62, 0);
  blob(body, col, 0, 0, 0, 0.26 * k, 0.24 * k, 0.46 * k);
  blob(body, '#E6DCC6', 0, -0.1 * k, 0.08 * k, 0.2 * k, 0.15 * k, 0.38 * k);
  for (let i = 0; i < 5; i++) blob(body, '#B9AC98', (i - 2) * 0.05 * k, -0.2 * k, 0.1 * k, 0.008, 0.008, 0.28 * k);
  if (st >= 3) for (let i = 0; i < 6 + st; i++) mark(body, '#D8D0C0', 0.26 * k, 0.24 * k, 0.46 * k, 0, 0, 0, -0.6 + (i * 0.37) % 1.4, 0.5 + (i * 0.23) % 0.5, 0.02, 0.016, 0.012);
  const head = grp(body, 'head', 0, 0, 0.3 * k);
  eye(head, 'eyeL', 0.2 * k, 0.0, 0.08 * k, 0.04 * k * (st === 0 ? 1.3 : 1), { pupil: 'bead', lid: col, ry: 1.0 });
  eye(head, 'eyeR', -0.2 * k, 0.0, 0.08 * k, 0.04 * k * (st === 0 ? 1.3 : 1), { pupil: 'bead', lid: col, ry: -1.0 });
  const jaw = grp(head, 'jaw', 0, -0.08 * k, 0.12 * k); blob(jaw, darken(col, 0.2), 0, 0, 0, 0.16 * k, 0.012, 0.012);
  for (const [n, s] of [['wingL', 1], ['wingR', -1]]) { const w = grp(body, n, s * 0.22 * k, -0.08 * k, 0.1 * k); blob(w, darken(col, 0.1), s * 0.14 * k, -0.02, -0.04, 0.17 * k, 0.03 * k, 0.07 * k).rotation.y = -s * 0.4; }
  const tail = tailChain(body, 'tail', 0, 0.02 * k, -0.42 * k, 3, 0.14 * k, 0.12 * k, 0.05 * k, col, [0, 0.12, -1]);
  const seg = tail.userData.segs[2]; const fl = grp(seg, 'fluke', 0, 0.02 * k, -0.16 * k);
  for (const s of [1, -1]) blob(fl, darken(col, 0.1), s * 0.12 * k, 0, -0.02, 0.15 * k, 0.025 * k, 0.07 * k).rotation.y = s * 0.3;
  if (st >= 2) { const sp = grp(head, 'spout', 0, 0.24 * k, -0.05 * k); blob(sp, '#2A2629', 0, 0, 0, 0.02 * k, 0.008, 0.015 * k); }
  if (st === 5) for (let i = 0; i < 3; i++) blob(body, '#E2B13A', (i - 1) * 0.12 * k, 0.24 * k, (i - 1) * 0.08, 0.012, 0.012, 0.012, { glow: '#E2B13A' });
  return { root, meta: { gait: 'float', hover: 0.62, leg: 0, height: 1.2 } };
}

// ---------------------------------------------------------------- doodle (hiçbir canlıyı temsil etmeyen cüce bodur yumru)
function doodle(st) {
  const col = ['#B8B0C0', '#A8A0B2', '#9890A4', '#888096', '#787088', '#5A5468'][st];
  const k = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5][st];
  const root = grp(null, 'root');
  const body = grp(root, 'body', 0, 0.3 * k, 0);
  // birbirine kaynamış yumrular (biraz eğri, simetrisiz)
  blob(body, col, 0, 0, 0, 0.27 * k, 0.24 * k, 0.24 * k);
  blob(body, col, 0.08 * k, 0.14 * k, 0.02, 0.17 * k, 0.15 * k, 0.17 * k);
  blob(body, col, -0.12 * k, 0.06 * k, -0.04, 0.15 * k, 0.14 * k, 0.15 * k);
  if (st >= 2) blob(body, darken(col, 0.08), 0.15 * k, -0.05 * k, -0.1, 0.12 * k);
  if (st >= 4) blob(body, darken(col, 0.12), -0.05 * k, 0.22 * k, -0.08, 0.1 * k);
  // bodur ayaklar ve kolcuklar
  for (const [n, s] of [['legFL', 1], ['legFR', -1]]) { const g = grp(body, n, s * 0.11 * k, -0.18 * k, 0.02); caps(g, darken(col, 0.1), 0, -0.04 * k, 0, 0.05 * k, 0.1 * k); blob(g, darken(col, 0.18), 0, -0.1 * k, 0.03, 0.06 * k, 0.03 * k, 0.07 * k); g.userData.len = 0.12 * k; }
  for (const [n, s] of [['wingL', 1], ['wingR', -1]]) { const g = grp(body, n, s * 0.25 * k, 0.0, 0.04); caps(g, col, s * 0.03, -0.04 * k, 0, 0.035 * k, 0.09 * k, 0, 0, s * 0.4); }
  const head = grp(body, 'head', 0, 0.06 * k, 0.2 * k);
  // ağır kapaklı, boş bakan gözler; düz ağız
  eye(head, 'eyeL', 0.08 * k, 0.04 * k, 0.03, 0.05 * k, { pupil: 'bead', lid: col, ry: 0.25 }); eye(head, 'eyeR', -0.07 * k, 0.03 * k, 0.03, 0.045 * k, { pupil: 'bead', lid: col, ry: -0.25 });
  const jaw = grp(head, 'jaw', 0.01, -0.07 * k, 0.04); blob(jaw, '#2A2629', 0, 0, 0, 0.04 * k, 0.005, 0.005);
  // tepede kendine dolanmış karalama (sıkıntı)
  const t = grp(body, 'tuft', 0.04, 0.3 * k, 0); torus(t, darken(col, 0.4), 0, 0, 0, 0.04 * k, 0.5, 0.3, 0, 0.3); torus(t, darken(col, 0.4), 0.01, 0.025, 0, 0.026 * k, 0.9, 0.2, 0, 0.3);
  if (st === 5) { const c = grp(body, 'cloud', 0, 0.48 * k, 0); for (const [x, r] of [[-0.08, 0.06], [0, 0.08], [0.08, 0.06]]) blob(c, '#3A3540', x * k, 0, 0, r * k, r * 0.7 * k, r * k, { alpha: 0.7 }); }
  return { root, meta: { gait: 'walk', leg: 0.12 * k, height: 0.6 * k, stubby: true } };
}

// ---------------------------------------------------------------- tür tablosu
export const BUILD = { cat, dog, chick, owl, gecko, plant, whale, doodle, goat };
export function build(species, stage, coat = 0) {
  const f = BUILD[species] || chick;
  const m = f(Math.max(0, Math.min(5, stage | 0)), coat | 0);
  const parts = {};
  m.root.traverse(o => { if (o.name && !parts[o.name]) parts[o.name] = o; });
  // dinlenme dönüşü/konumu: hareketler bunun üstüne eklenir
  for (const o of Object.values(parts)) o.userData.rest = { p: o.position.clone(), r: o.rotation.clone(), s: o.scale.clone() };
  return { root: m.root, parts, meta: m.meta };
}
