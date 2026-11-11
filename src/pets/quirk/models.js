// dam-la — Set 3 "Oyuncak": Quirky tarzında, bizim sıfırdan kurduğumuz düşük poligonlu 3B petler
// (kedi, köpek, baykuş, balina, Buz Bodur, filiz). Gerçek Quirky modelleri (serçe→civciv, kertenkele, pudu→keçi) engine.js'te
// dosyadan yüklenir; bunlar onların tarzına uyar: kalın kapsül/prizma gövde, düz çubuk bacaklar ve koyu "çorap", yanlara
// geniş yerleşik iri "googly" gözler (beyaz disk + siyah halka + iri bebek), açık renkli burun, üçgen kulaklar, mat doğal renkler.
// Her model kendi eklem hiyerarşisini (Object3D "kemikleri") ve kendi hareketlerini taşır; ileri yönü +X, yukarı +Y, kameraya bakan yan +Z.
import * as THREE from 'three';
import { clamp, lerp, bell, TAU, stride, cyc } from '../rigs/kit.js';

const mats = new Map();
export function mat(color, flat = true) {
  const k = color + (flat ? 'f' : 's');
  if (!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial({ color, flatShading: flat, roughness: 0.88, metalness: 0 }));
  return mats.get(k);
}
const geoCache = new Map();
function blob(rx, ry, rz, detail = 1) {
  const k = `b${rx},${ry},${rz},${detail}`;
  if (!geoCache.has(k)) { const g = new THREE.IcosahedronGeometry(1, detail); g.scale(rx, ry, rz); geoCache.set(k, g); }
  return geoCache.get(k);
}
const mesh = (g, c, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(g, mat(c)); m.position.set(x, y, z); return m; };
const joint = (parent, x = 0, y = 0, z = 0) => { const j = new THREE.Group(); j.position.set(x, y, z); parent.add(j); return j; };
// düz çubuk bacak: eklem üstte, aşağı uzanır; altta koyu çorap
function stick(parent, L, r, color, sock, x, y, z) {
  const j = joint(parent, x, y, z);
  const g = new THREE.CylinderGeometry(r, r * 0.92, L, 6); g.translate(0, -L / 2, 0);
  j.add(new THREE.Mesh(g, mat(color)));
  if (sock) { const s = new THREE.CylinderGeometry(r * 1.04, r * 0.96, L * 0.32, 6); s.translate(0, -L + L * 0.16, 0); j.add(new THREE.Mesh(s, mat(sock))); }
  j.userData.L = L;
  return j;
}
function cone(parent, r, h, c, x, y, z, seg = 4) { const g = new THREE.ConeGeometry(r, h, seg); g.translate(0, h / 2, 0); const m = new THREE.Mesh(g, mat(c)); m.position.set(x, y, z); parent.add(m); return m; }

// ---------------------------------------------------------------- googly göz (tuval dokusu: her ifade çizilebilir)
const EYE_PX = 64;
export class Eye {
  constructor(parent, r, bodyColor, x, y, z, ry = 0) {
    this.cv = document.createElement('canvas'); this.cv.width = this.cv.height = EYE_PX;
    this.tex = new THREE.CanvasTexture(this.cv); this.tex.colorSpace = THREE.SRGBColorSpace;
    this.mesh = new THREE.Mesh(new THREE.CircleGeometry(r * 1.18, 20), new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, depthWrite: true }));
    this.mesh.position.set(x, y, z); this.mesh.rotation.y = ry;
    parent.add(this.mesh);
    this.body = bodyColor; this.key = '';
  }
  set(state, lid, lx, ly, t, tears) {
    const q = v => Math.round(v * 8) / 8;
    const dz = state === 'dizzy' ? Math.round(t * 6) : 0;
    const key = [state, q(lid), q(lx), q(ly), dz, tears > 0.1 ? Math.round(t * 4) % 4 : 0].join('|');
    if (key === this.key) return; this.key = key;
    const c = this.cv.getContext('2d'), S = EYE_PX, C = S / 2, R = S / 2 / 1.18;
    c.clearRect(0, 0, S, S); c.lineCap = 'round'; c.lineJoin = 'round';
    const ink = '#1d1a20';
    const disc = (rr, col) => { c.beginPath(); c.arc(C, C, rr, 0, TAU); c.fillStyle = col; c.fill(); };
    if (state === 'closed' || state === 'happy') {
      disc(R * 1.02, this.body);
      c.strokeStyle = ink; c.lineWidth = R * 0.24; c.beginPath();
      if (state === 'closed') c.arc(C, C - R * 0.25, R * 0.62, 0.15 * Math.PI, 0.85 * Math.PI); else c.arc(C, C + R * 0.3, R * 0.62, 1.15 * Math.PI, 1.85 * Math.PI);
      c.stroke();
    } else if (state === 'x') {
      disc(R, '#fff'); c.strokeStyle = ink; c.lineWidth = R * 0.14; c.beginPath(); c.arc(C, C, R * 0.93, 0, TAU); c.stroke();
      c.lineWidth = R * 0.24; c.beginPath(); c.moveTo(C - R * 0.45, C - R * 0.45); c.lineTo(C + R * 0.45, C + R * 0.45); c.moveTo(C + R * 0.45, C - R * 0.45); c.lineTo(C - R * 0.45, C + R * 0.45); c.stroke();
    } else {
      const wide = state === 'wide';
      disc(R, '#fff'); c.strokeStyle = ink; c.lineWidth = R * 0.14; c.beginPath(); c.arc(C, C, R * 0.93, 0, TAU); c.stroke();
      let px = lx * R * 0.3, py = ly * R * 0.25, pr = wide ? R * 0.3 : R * 0.56;
      if (state === 'dizzy') {
        c.beginPath(); for (let i = 0; i < 40; i++) { const a = i * 0.5 + t * 6, rr = R * 0.04 + i * R * 0.018; c.lineTo(C + Math.cos(a) * rr, C + Math.sin(a) * rr); } c.lineWidth = R * 0.12; c.stroke();
      } else if (state === 'hurt') { c.lineWidth = R * 0.22; c.beginPath(); c.moveTo(C - R * 0.35, C - R * 0.4); c.lineTo(C + R * 0.3, C); c.lineTo(C - R * 0.35, C + R * 0.4); c.stroke(); }
      else { disc(0, ink); c.beginPath(); c.arc(C + px, C + py, pr, 0, TAU); c.fillStyle = ink; c.fill(); c.beginPath(); c.arc(C + px - pr * 0.35, C + py - pr * 0.4, pr * 0.22, 0, TAU); c.fillStyle = '#fff'; c.fill(); }
      // kapak (gövde rengi) — düz, ya da üzgün/öfkeli eğik
      let L = state === 'sleepy' ? Math.max(lid, 0.55) : state === 'squint' ? Math.max(lid, 0.45) : lid;
      let tilt = 0; if (state === 'sad') { L = Math.max(L, 0.38); tilt = 0.35; } if (state === 'angry') { L = Math.max(L, 0.42); tilt = -0.4; }
      if (L > 0.03) {
        c.save(); c.beginPath(); c.arc(C, C, R * 1.02, 0, TAU); c.clip();
        const y0 = C - R + 2 * R * L;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(S, 0); c.lineTo(S, y0 - tilt * R); c.lineTo(0, y0 + tilt * R); c.closePath(); c.fillStyle = this.body; c.fill();
        c.strokeStyle = ink; c.lineWidth = R * 0.12; c.beginPath(); c.moveTo(0, y0 + tilt * R); c.lineTo(S, y0 - tilt * R); c.stroke();
        c.restore();
      }
      if (state === 'squint') { c.save(); c.beginPath(); c.arc(C, C, R * 1.02, 0, TAU); c.clip(); c.fillStyle = this.body; c.fillRect(0, C + R * 0.55, S, S); c.restore(); }
    }
    if (tears > 0.1) { const q2 = ((t * 1.2) % 1); c.fillStyle = '#7FD4FF'; c.beginPath(); c.ellipse(C + R * 0.2, C + R * 0.7 + q2 * R * 0.25, R * 0.16, R * 0.24, 0, 0, TAU); c.fill(); }
    this.tex.needsUpdate = true;
  }
}

// ---------------------------------------------------------------- dört ayaklı (kedi, köpek, Buz Bodur)
const QUAD = {
  cat: { col: '#E8955A', light: '#F6D7B0', dark: '#8A4E2C', sock: '#7A4024', bx: 22, by: 13, bz: 12, L: 15, lr: 3.2, hr: 13, snout: 6, ears: 'tri', tail: [3, 10, 2.1], spots: '#C9743F' },
  dog: { col: '#B98256', light: '#EBD3B4', dark: '#6B4428', sock: '#5A3820', bx: 25, by: 15, bz: 14, L: 15, lr: 3.8, hr: 14, snout: 9, ears: 'flop', tail: [2, 8, 2.6], spots: '#8E5E38' },
  doodle: { col: '#8FD3E8', light: '#E6F8FF', dark: '#4E8FB0', sock: '#3E7A99', bx: 20, by: 18, bz: 15, L: 9, lr: 5, hr: 15, snout: 0, ears: 'crystal', tail: [1, 5, 3], spots: '#B9E6F4', boxy: true },
};
function buildQuad(sp, stage) {
  const P = QUAD[sp], u = stage / 5, hk = lerp(1.3, 1, u), lk = lerp(0.62, 1, u), bk = lerp(0.7, 1, u);
  const root = new THREE.Group(), hip = joint(root, 0, P.L * lk + P.by * 0.25, 0);
  const body = joint(hip);
  const bx = P.bx * bk, by = P.by * lerp(0.85, 1, u), bz = P.bz * lerp(0.85, 1, u);
  body.add(mesh(blob(bx, by, bz, P.boxy ? 0 : 1), P.col));
  body.add(mesh(blob(bx * 0.82, by * 0.55, bz * 0.92, 1), P.light, 0, -by * 0.42, 0));
  if (P.spots && !P.boxy) { body.add(mesh(blob(5, 3, 2), P.spots, -bx * 0.2, by * 0.55, bz * 0.62)); body.add(mesh(blob(4, 2.6, 2), P.spots, bx * 0.3, by * 0.6, -bz * 0.6)); }
  // bacaklar (çubuk, dik)
  const L = P.L * lk, legs = {};
  for (const [k, x, z] of [['FL', bx * 0.55, bz * 0.55], ['FR', bx * 0.55, -bz * 0.55], ['BL', -bx * 0.55, bz * 0.55], ['BR', -bx * 0.55, -bz * 0.55]]) legs[k] = stick(hip, L + by * 0.25, P.lr * lerp(0.85, 1, u), P.col, P.sock, x, 0, z);
  // boyun + baş
  const neck = joint(body, bx * 0.78, by * 0.55, 0);
  const head = joint(neck, 4 * hk, 6 * hk, 0);
  const hr = P.hr * hk;
  head.add(mesh(blob(hr * (P.boxy ? 1.05 : 1.08), hr * 0.92, hr * 0.98, P.boxy ? 0 : 1), P.col));
  if (P.snout) { head.add(mesh(blob(P.snout * 0.9, P.snout * 0.62, P.snout * 0.8), P.light, hr * 0.88, -hr * 0.28, 0)); head.add(mesh(blob(2.2, 1.6, 2.2, 0), '#2a1d1a', hr * 0.88 + P.snout * 0.82, -hr * 0.12, 0)); }
  const ears = [];
  if (P.ears === 'tri') for (const z of [-1, 1]) { const e = joint(head, -hr * 0.1, hr * 0.68, z * hr * 0.5); cone(e, hr * 0.38, hr * 0.62, P.col, 0, 0, 0, 3); cone(e, hr * 0.2, hr * 0.42, '#F2A7A0', hr * 0.06, 0.4, 0, 3).rotation.y = 0.6; e.rotation.x = z * 0.25; ears.push(e); }
  if (P.ears === 'flop') for (const z of [-1, 1]) { const e = joint(head, -hr * 0.15, hr * 0.55, z * hr * 0.88); const m = mesh(blob(hr * 0.42, hr * 0.62, hr * 0.14), P.dark, 0, -hr * 0.5, 0); e.add(m); e.rotation.x = z * 0.15; ears.push(e); }
  if (P.ears === 'crystal') for (let i = 0; i < (stage >= 1 ? 3 : 1); i++) { const e = joint(head, (i - 1) * hr * 0.42, hr * 0.8, 0); cone(e, hr * 0.2, hr * (0.55 + 0.25 * (i === 1)), '#D9F6FF', 0, 0, 0, 4); e.rotation.z = (1 - i) * 0.3; ears.push(e); }
  // gözler: başın iki yanında, geniş yerleşik
  const er = hr * 0.38, eyes = [new Eye(head, er, P.col, hr * 0.42, hr * 0.18, hr * 0.86, 0.45), new Eye(head, er, P.col, hr * 0.42, hr * 0.18, -hr * 0.86, Math.PI - 0.45)];
  // kuyruk zinciri
  const tail = []; let tp = joint(body, -bx * 0.95, by * 0.4, 0);
  const [tn, tl, tr] = P.tail;
  for (let i = 0; i < tn; i++) { const g = new THREE.CylinderGeometry(tr * (1 - i * 0.15), tr * (1 - (i + 1) * 0.15) + 0.4, tl * lk, 5); g.translate(0, tl * lk / 2, 0); const m = new THREE.Mesh(g, mat(i === tn - 1 && sp === 'cat' ? P.dark : P.col)); tp.add(m); tail.push(tp); tp = joint(tp, 0, tl * lk, 0); }
  return { root, hip, body, legs, neck, head, ears, eyes, tail, L, bx, by, kind: 'quad', earKind: P.ears, headR: hr };
}

// ---------------------------------------------------------------- baykuş (önden bakar)
function buildOwl(stage) {
  const u = stage / 5, k = lerp(0.62, 1, u), C = '#8C6E58', L2 = '#E9D6B8', D = '#5E4636';
  const root = new THREE.Group(), hip = joint(root, 0, 6 * k, 0), body = joint(hip);
  body.add(mesh(blob(17 * k, 21 * k, 16 * k), C, 0, 20 * k, 0));
  body.add(mesh(blob(4 * k, 15 * k, 12 * k), L2, 13 * k, 17 * k, 0));
  const legs = { L: joint(hip, 0, 0, 6 * k), R: joint(hip, 0, 0, -6 * k) };
  hip.position.y = 4 * k;
  for (const j of Object.values(legs)) { j.add(mesh(blob(4 * k, 2 * k, 3.4 * k, 0), '#E2A23A', 2 * k, -3 * k, 0)); }
  const wings = { L: joint(body, -1 * k, 30 * k, 16 * k), R: joint(body, -1 * k, 30 * k, -16 * k) };
  wings.L.add(mesh(blob(9 * k, 15 * k, 3 * k), D, -2 * k, -12 * k, 0)); wings.R.add(mesh(blob(9 * k, 15 * k, 3 * k), D, -2 * k, -12 * k, 0));
  const neck = joint(body, 0, 38 * k, 0), head = joint(neck, 0, 8 * k, 0), hr = 16 * k * lerp(1.15, 1, u);
  head.add(mesh(blob(hr, hr * 0.86, hr * 0.95), C));
  head.add(mesh(blob(hr * 0.3, hr * 0.6, hr * 0.8), L2, hr * 0.72, -hr * 0.05, 0));
  const ears = [];
  for (const z of [-1, 1]) { const e = joint(head, 0, hr * 0.62, z * hr * 0.55); cone(e, hr * 0.26, hr * 0.6, C, 0, 0, 0, 3); e.rotation.x = z * 0.35; ears.push(e); }
  head.add(mesh(blob(2.6 * k, 3.4 * k, 2.6 * k, 0), '#E2A23A', hr * 0.98, -hr * 0.28, 0));
  const er = hr * 0.36, eyes = [new Eye(head, er, C, hr * 0.0, hr * 0.12, hr * 0.98, 0), new Eye(head, er, C, 0, hr * 0.12, hr * 0.98, 0)];
  return { root, hip, body, legs, wings, neck, head, ears, eyes, kind: 'owl', headR: hr, frontEyes: true };
}

// ---------------------------------------------------------------- balina
function buildWhale(stage) {
  const u = stage / 5, k = lerp(0.6, 1, u), C = '#4C78B8', B = '#E8F1F7', D = '#2E4E80';
  const root = new THREE.Group(), hip = joint(root, 0, 34, 0), body = joint(hip);
  body.add(mesh(blob(30 * k, 16 * k, 16 * k), C, 6 * k, 0, 0));
  body.add(mesh(blob(26 * k, 9 * k, 13 * k), B, 6 * k, -8 * k, 0));
  const tail = joint(body, -20 * k, 1 * k, 0);
  tail.add(mesh(blob(16 * k, 9 * k, 9 * k), C, -10 * k, 0, 0));
  const fl = joint(tail, -24 * k, 0, 0);
  for (const z of [-1, 1]) { const m = mesh(blob(9 * k, 2 * k, 7 * k), D, -4 * k, 0, z * 6 * k); m.rotation.y = z * 0.5; fl.add(m); }
  const fins = { L: joint(body, 10 * k, -9 * k, 14 * k), R: joint(body, 10 * k, -9 * k, -14 * k) };
  fins.L.add(mesh(blob(8 * k, 2 * k, 4 * k), D, -4 * k, -2 * k, 2 * k)); fins.R.add(mesh(blob(8 * k, 2 * k, 4 * k), D, -4 * k, -2 * k, -2 * k));
  const head = joint(body, 22 * k, 2 * k, 0);
  const er = 5 * k, eyes = [new Eye(head, er, C, 4 * k, 0, 13 * k, 0.3), new Eye(head, er, C, 4 * k, 0, -13 * k, Math.PI - 0.3)];
  return { root, hip, body, tail, fluke: fl, fins, head, eyes, ears: [], kind: 'whale', headR: 16 * k };
}

// ---------------------------------------------------------------- filiz
function buildPlant(stage) {
  const k = [0.6, 0.66, 0.76, 0.86, 0.95, 1.05][stage], G = '#6DBB5A', GD = '#3F8A3A', P = '#F29AB8', POT = '#D9824E';
  const root = new THREE.Group(), hip = joint(root), body = joint(hip);
  let top = 0;
  if (stage >= 4) { const g = new THREE.CylinderGeometry(13 * k, 10 * k, 16 * k, 7); g.translate(0, 8 * k, 0); body.add(new THREE.Mesh(g, mat(POT))); const r = new THREE.CylinderGeometry(14.5 * k, 14.5 * k, 4 * k, 7); r.translate(0, 16 * k, 0); body.add(new THREE.Mesh(r, mat('#C46F3E'))); top = 18 * k; }
  const stemL = [4, 16, 22, 26, 20, 16][stage] * k;
  const neck = joint(body, 0, top, 0);
  const sg = new THREE.CylinderGeometry(stage === 5 ? 4 * k : 1.8 * k, stage === 5 ? 5 * k : 2.2 * k, stemL, 6); sg.translate(0, stemL / 2, 0);
  neck.add(new THREE.Mesh(sg, mat(stage === 5 ? '#8A5A3A' : GD)));
  const leaves = [];
  if (stage >= 1) for (const z of [-1, 1]) { const l = joint(neck, 0, stemL * 0.45, 0); const m = mesh(blob(7 * k, 1.6 * k, 4 * k), G, 0, 0, z * 7 * k); l.add(m); l.rotation.x = z * 0.4; leaves.push(l); }
  const head = joint(neck, 0, stemL, 0);
  const hr = [9, 10, 10, 10, 10, 18][stage] * k;
  head.add(mesh(blob(hr, hr * (stage === 0 ? 1.15 : 0.95), hr), stage === 0 ? '#C9A46E' : stage === 5 ? G : '#9ED36A', 0, hr * 0.8, 0));
  if (stage === 2) for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; const m = mesh(blob(5 * k, 2 * k, 3.4 * k), P, Math.cos(a) * hr * 1.15, hr * 0.8 + Math.sin(a) * hr * 1.15, -hr * 0.3); m.rotation.z = a; head.add(m); }
  if (stage === 3 || stage === 4) for (const x of [-1, 0, 1]) { const c2 = cone(head, hr * 0.4, hr * 0.8, P, x * hr * 0.6, hr * 1.4, 0, 4); c2.rotation.z = -x * 0.3; }
  const er = hr * (stage === 5 ? 0.24 : 0.36), eyes = [new Eye(head, er, stage === 5 ? G : '#9ED36A', 0, hr * 0.8, hr * 0.94, 0), new Eye(head, er, stage === 5 ? G : '#9ED36A', 0, hr * 0.8, hr * 0.94, 0)];
  return { root, hip, body, neck, head, leaves, eyes, ears: [], kind: 'plant', headR: hr, frontEyes: true, top: top + stemL + hr * 1.8 };
}

export function buildProc(sp, stage) {
  stage = clamp(stage | 0, 0, 5);
  const M = QUAD[sp] ? buildQuad(sp, stage) : sp === 'owl' ? buildOwl(stage) : sp === 'whale' ? buildWhale(stage) : buildPlant(stage);
  if (M.frontEyes) { // önden: x ekseni ileri yön olduğundan yan yana = z değil; baş kameraya döndürülür, gözler başın +X yüzünde
    const hr = M.headR, gap = M.kind === 'owl' ? hr * 0.48 : hr * 0.45, y = M.eyes[0].mesh.position.y;
    M.eyes.forEach((e, i) => { e.mesh.position.set(hr * 0.9, y, (i ? -1 : 1) * gap); e.mesh.rotation.set(0, Math.PI / 2, 0); });
  }
  return M;
}

// ---------------------------------------------------------------- hareket (Quirky klip adlarıyla aynı davranışlar)
// I: kit.intent() niyetleri, S: kare durumu. Yürüyüşte ayaklar yola kilitli (kayma yok).
export function animateProc(M, S, I, dt) {
  const t = S.t, run = S.run;
  const lift = I.lift, sq = I.squash;
  M.root.position.set(0, lift, 0);
  M.root.rotation.set(0, 0, 0);
  M.root.scale.set(1 + sq, 1 - sq, 1 + sq);
  if (I.shiver) M.root.position.x += I.shiver * 0.6;
  if (I.spin > 0 && I.spin < 1) M.root.rotation.y = I.spin * TAU;
  if (I.roll > 0 && I.roll < 1) M.root.rotation.x = I.roll * TAU;
  if (S.base === 'dead') { M.root.rotation.x = Math.PI / 2; M.root.position.y = (M.bz || 10) * 0.9; }
  const breath = 1 + 0.025 * Math.sin(t * 2.2);
  if (M.kind === 'quad') {
    const L = M.L, legs = M.legs;
    const S0 = 2 * L * Math.sin((run ? 34 : 24) * Math.PI / 180), beta = run ? 0.42 : 0.62;
    M.cycleLen = r => 2 * L * Math.sin((r ? 34 : 24) * Math.PI / 180) / (r ? 0.42 : 0.62);
    const sit = !S.moving && !I.lift && (S.asleep || S.base === 'lie' || S.base === 'full' || S.verb === 'sad' || S.verb === 'doze' || S.verb === 'bask' || S.verb === 'cry');
    let bob = 0;
    M.body.rotation.set(0, 0, 0); M.body.position.set(0, 0, 0); M.body.scale.set(1, breath, 1);
    const offs = run ? { BL: 0, BR: 0.1, FL: 0.5, FR: 0.6 } : { BL: 0, FL: 0.25, BR: 0.5, FR: 0.75 };
    for (const k in legs) {
      const j = legs[k], front = k[0] === 'F';
      let a = 0, s = 1;
      if (S.moving) { const g = stride(S.ph + offs[k], S0, beta); a = Math.asin(clamp(g.x / L, -0.95, 0.95)); s = 1 - 0.22 * g.lift; bob = Math.max(bob, Math.abs(Math.sin(TAU * S.ph * 2)) * (run ? 2.4 : 1)); }
      else if (sit) { a = front ? 0 : -1.25; s = front ? 1 : 0.75; }
      if (!S.moving && front && k === 'FL' && I.paw) a = -1.2 * I.paw;
      if (!S.moving && I.dig && front) a = (k === 'FL' ? 1 : -1) * I.dig * 0.9;
      if (I.lift > 2 && !S.moving) a = (front ? -0.7 : 0.7) * clamp(I.lift / 20, 0, 1);
      if (S.base === 'dead') a = (front ? -0.3 : 0.3);
      j.rotation.z = a; j.scale.y = s;
    }
    // gövde yüksekliği: oturuş/çömelme/uyku
    let hy = 0, pitch = 0;
    if (sit) { hy = -L * 0.45; pitch = S.asleep ? 0 : 0.35; }
    if (S.asleep || S.base === 'lie' || S.base === 'full') { hy = -L * 0.85; pitch = 0; for (const k in legs) { legs[k].rotation.z = k[0] === 'F' ? -1.4 : 1.4; legs[k].scale.y = 0.6; } }
    hy -= I.crouch * L * 0.4; pitch -= I.bow * 0.4;
    M.hip.position.y = L + M.by * 0.25 + hy + bob * -1 + 0;
    M.body.rotation.z = pitch + (run && S.moving ? 0.06 * Math.sin(TAU * S.ph) : 0);
    M.hip.position.x = 6 * I.push + 3 * I.lean;
    // baş
    M.neck.rotation.set(0, 0, -0.9 * I.headDown + 0.4 * I.headUp - pitch * 0.8 + (S.moving ? 0.04 * Math.sin(TAU * S.ph * 2) : 0));
    M.head.rotation.set(0.25 * I.headTilt, 0.55 * I.headTurn + (S.moving ? 0 : 0.35 * cyc(t, 9, 0.2, 0.45) - 0.3 * cyc(t, 9, 0.6, 0.8)), 0.35 * I.headDown);
    // kulaklar / kristaller
    M.ears.forEach((e, i) => { if (M.earKind === 'flop') e.rotation.z = -0.5 * I.earsUp + 0.6 * I.earsBack + (S.moving ? 0.3 * Math.sin(TAU * S.ph * 2 + i) : 0.08 * Math.sin(t * 2 + i)); else if (M.earKind === 'tri') e.rotation.z = 0.5 * I.earsBack - 0.2 * I.earsUp; else e.scale.y = 1 + 0.06 * Math.sin(t * 1.4 + i) + 0.3 * I.puff; });
    // kuyruk
    const wag = (S.moving ? 0.35 * Math.sin(TAU * S.ph) : 0.18 * Math.sin(t * 1.3)) + 0.6 * I.wag;
    M.tail.forEach((j, i) => { j.rotation.set(wag * (i + 1) * 0.5, 0, i === 0 ? 0.9 + 0.6 * I.tailUp - (sit ? 0.5 : 0) : -0.35); });
  } else if (M.kind === 'owl') {
    const hop = S.moving ? bell(S.ph > 0.28 ? (S.ph - 0.28) / 0.72 : 0) * 10 : 0;
    M.root.position.y += hop;
    M.body.scale.set(1, breath - 0.1 * I.crouch, 1);
    const fl = I.flap ? (-0.9 * Math.max(0, -I.flap) - 0.6 * Math.abs(I.flap) * Math.sin(t * 26)) : 0.06 * Math.sin(t * 1.6);
    M.wings.L.rotation.x = -fl; M.wings.R.rotation.x = fl;
    M.head.rotation.set(0.3 * I.headTilt + 0.2 * cyc(t, 9, 0.2, 0.42) - 0.18 * cyc(t, 9, 0.5, 0.7), 0.6 * I.headTurn, 0.4 * I.headDown);
    M.ears.forEach((e, i) => { e.rotation.x = (i ? -1 : 1) * (0.35 + 0.4 * I.earsBack - 0.3 * I.earsUp); });
    M.air = hop / 30;
  } else if (M.kind === 'whale') {
    const ph = S.moving ? S.ph * TAU * 2 : t * 1.5, amp = S.asleep ? 0.06 : S.moving ? 0.28 : 0.14;
    M.hip.position.y = (S.base === 'dead' ? 6 : S.asleep ? 18 : 34) + (S.moving ? 0 : 3 * Math.sin(t * 1.2));
    M.tail.rotation.z = amp * Math.sin(ph); M.fluke.rotation.z = amp * 1.4 * Math.sin(ph - 0.9);
    M.fins.L.rotation.x = -0.3 + 0.2 * Math.sin(t * 1.6) - 0.6 * Math.abs(I.flap); M.fins.R.rotation.x = 0.3 - 0.2 * Math.sin(t * 1.6) + 0.6 * Math.abs(I.flap);
    M.body.rotation.z = 0.05 * Math.sin(ph + 1) - 0.3 * I.headDown + 0.2 * I.headUp;
    if (S.base === 'dead') { M.root.rotation.x = Math.PI; M.root.position.y = 30; }
    M.air = 0.4;
  } else {
    const hop = S.moving ? bell(S.ph > 0.28 ? (S.ph - 0.28) / 0.72 : 0) * 8 : 0;
    M.root.position.y += hop;
    M.neck.rotation.set(0.2 * I.headTilt + 0.06 * Math.sin(t * 0.7), 0, 0.06 * Math.sin(t * 0.9) - 0.3 * I.headDown);
    M.head.rotation.set(0, 0.5 * I.headTurn, 0);
    M.head.scale.setScalar(1 + 0.04 * Math.sin(t * 1.25) + 0.15 * I.puff);
    M.leaves.forEach((l, i) => { l.rotation.x = (i ? -1 : 1) * (0.4 + 0.25 * Math.sin(t * 0.7 + 1) + 0.6 * Math.max(0, -I.flap) + 0.4 * I.flap * Math.sin(t * 20)); });
    M.air = hop / 30;
  }
  if (M.kind === 'quad') M.air = clamp(lift / 30, 0, 0.6);
}
