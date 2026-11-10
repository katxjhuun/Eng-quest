// dam-la — 3B kil pet motoru (Three.js). Dış arayüz eski Puppet ile aynı:
// setForm, setMood, setCond, setBase, play, stop, travel, face, tick, playing; staticSVG (resim döndürür).
// Kayma yok: yürüyende duruştaki ayak yerde sabit (adım uzunluğu ekrandaki hıza eşlenir), zıplayan yalnızca havada ilerler,
// balina zaten havada süzülür. Dönüşler gerçek 3B dönüştür; baş gövdeden önce döner.
import { THREE } from './kit.js';
import { build } from './models.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;
const bell = u => Math.sin(Math.PI * clamp(u, 0, 1));
const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const env = (u, a = 0.15, b = 0.2) => clamp(Math.min(u / a, (1 - u) / b), 0, 1);

// ---------------------------------------------------------------- isim → fiil (uygulamanın tüm klip adları)
const VERB = {
  idle: 'none', sit: 'none', home: 'none', full: 'none', lie: 'none', sleep: 'none', dead: 'none', flee: 'none',
  happy: 'hop', love: 'hop', hop: 'hop', note: 'hop', star: 'hop', chase: 'hop', play: 'hop', petals: 'look', mirror: 'look', photo: 'bask', bask: 'bask',
  eat: 'eat', peck: 'eat', hungry: 'sad', sad: 'sad', cry: 'cry', groggy: 'doze', doze: 'doze', sleepy: 'doze',
  angry: 'lunge', bite: 'lunge', snap: 'lunge', knock: 'swat', swat: 'swat', pounce: 'pounce', guard: 'guard', protect: 'guard',
  surprised: 'jump', poked: 'jump', shock: 'jump', flinch: 'jump', wake: 'jump', freeze: 'freeze',
  look: 'look', headturn: 'headturn', focus: 'focus', sniff: 'sniff', coffee: 'sip',
  groom: 'groom', lick: 'lick', tongue: 'tongue', stretch: 'stretch', shake: 'shake', roll: 'roll', dig: 'dig', tailwave: 'tailwave',
  ability: 'ability', rub: 'rub', cuddle: 'rub',
};
const DUR = { hop: 1.2, eat: 1.6, sad: 2, cry: 2.2, doze: 2.6, lunge: 0.9, swat: 0.8, pounce: 1.2, guard: 2, jump: 0.7, freeze: 2.4, look: 1.8, headturn: 2.6, focus: 2,
  sniff: 1.8, sip: 3, groom: 2.6, lick: 1.8, tongue: 1.2, stretch: 2, shake: 1.2, roll: 1.4, dig: 1.6, tailwave: 2.4, ability: 1.6, rub: 1.6, bask: 3.6, none: 1 };
export const clipNames = () => Object.keys(VERB);
const LID = { idle: 0, happy: 0.3, love: 0.35, sad: 0.45, hungry: 0.35, cry: 0.55, groggy: 0.62, sleepy: 0.62, focus: 0.28, angry: 0.38, surprised: 0, full: 0.5, sleep: 1, dead: 1, bored: 0.42 };
// tür mizacı: göz kapağının doğal duruşu (baykuş gündüz yarı kapalı, doodle hep ağır, keçi boş bakış)
const LID_BASE = { owl: 0.32, doodle: 0.48, goat: 0.18, gecko: 0.05 };

// ---------------------------------------------------------------- sahne
const CAM = { fov: 30, pos: [0, 1.12, 3.3], at: [0, 0.52, 0] };
const VIEW_W = 2 * Math.hypot(CAM.pos[1] - CAM.at[1], CAM.pos[2]) * Math.tan((CAM.fov / 2) * Math.PI / 180);   // hedef düzleminde görünen genişlik
let shadowTex = null;
function shadowTexture() {
  if (shadowTex) return shadowTex;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 2, 32, 32, 31);
  gr.addColorStop(0, 'rgba(30,25,30,.5)'); gr.addColorStop(0.6, 'rgba(30,25,30,.18)'); gr.addColorStop(1, 'rgba(30,25,30,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return (shadowTex = new THREE.CanvasTexture(c));
}
function makeScene() {
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(CAM.fov, 1, 0.1, 50);
  cam.position.set(...CAM.pos); cam.lookAt(...CAM.at);
  scene.add(new THREE.HemisphereLight('#FFF3E2', '#7A6E66', 1.55));
  const key = new THREE.DirectionalLight('#FFF8EE', 1.9); key.position.set(-2.2, 4, 3); scene.add(key);
  const rim = new THREE.DirectionalLight('#C9DAFF', 0.75); rim.position.set(1.8, 2.2, -3); scene.add(rim);
  const fill = new THREE.DirectionalLight('#FFE6CC', 0.35); fill.position.set(2.5, 0.6, 2.5); scene.add(fill);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.y = 0.002; scene.add(sh);
  return { scene, cam, sh };
}
function makeRenderer(canvas, px) {
  const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: !!px, powerPreference: 'low-power' });
  r.setClearColor(0x000000, 0);
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.08;
  return r;
}

// ---------------------------------------------------------------- poz
// her kare: parçalar dinlenme hâline döner, kanallar eklenir
function resetPose(parts) {
  for (const o of Object.values(parts)) { const r = o.userData.rest; if (!r) continue; o.position.copy(r.p); o.rotation.copy(r.r); o.scale.copy(r.s); }
}
function A(parts, name, c) {
  const o = parts[name]; if (!o) return;
  if (c.rx) o.rotation.x += c.rx; if (c.ry) o.rotation.y += c.ry; if (c.rz) o.rotation.z += c.rz;
  if (c.x) o.position.x += c.x; if (c.y) o.position.y += c.y; if (c.z) o.position.z += c.z;
  if (c.s != null) o.scale.multiplyScalar(c.s);
  if (c.sx != null) o.scale.x *= c.sx; if (c.sy != null) o.scale.y *= c.sy; if (c.sz != null) o.scale.z *= c.sz;
}
function gaitDims(meta, run) {
  const amp = (meta.sprawl ? 32 : meta.stubby ? 26 : 22) * (run ? 1.4 : 1) * Math.PI / 180, beta = run ? 0.45 : 0.62;
  const S = 2 * meta.leg * Math.sin(amp);
  return { S, beta, D: S / beta };
}
// st: { species, parts, meta, t, base, mood, clip, clipT, clipDur, ph, run, blink, look, headYaw }
function pose(st) {
  const { parts: P, meta, t, base, mood, species } = st;
  const a = (n, c) => A(P, n, c);
  const verb = st.clip ? VERB[st.clip] || 'none' : 'none';
  const cu = st.clip ? clamp(st.clipT / st.clipDur, 0, 1) : 0, cT = st.clipT || 0, ce = st.clip ? env(cu) : 0;
  const moving = base === 'walk' || base === 'run';
  const asleep = base === 'sleep' || base === 'dead' || mood === 'sleep';
  const quad = !!meta.quad, legsAll = ['legFL', 'legFR', 'legBL', 'legBR'];
  let lift = 0, comp = 0;   // kök yüksekliği, zıplama telafisi (yol birimi)

  // --- göz kapakları ve bakış
  let lidV = asleep ? 1 : Math.max(LID[mood] ?? 0, LID_BASE[species] || 0);
  if (verb === 'doze') lidV = Math.max(lidV, 0.55 + 0.45 * bell(cu));
  if (verb === 'jump' || verb === 'guard') lidV = 0;
  if (verb === 'bask') lidV = Math.max(lidV, 0.65);
  if (species === 'owl' && (mood === 'focus' || verb === 'headturn')) lidV = Math.min(lidV, 0.08);
  if (!asleep) lidV = Math.max(lidV, st.blink);
  for (const side of ['eyeL', 'eyeR']) {
    const e = P[side]; if (!e) continue;
    a(side + 'Lid', { rx: lidV * (Math.PI / 2 + 0.25) });
    const r = e.userData.r || 0.03;
    a(side + 'Pup', { x: st.look * r * 0.28, y: (mood === 'sad' ? -0.2 : 0) * r, s: mood === 'surprised' || verb === 'jump' ? 0.8 : 1 });
  }

  // --- nefes
  const br = asleep ? 0.035 * Math.sin(t * 1.5) : 0.016 * Math.sin(t * 2.2);
  if (base !== 'dead') a('body', { sy: 1 + br, sx: 1 + br * 0.5, sz: 1 + br * 0.3 });

  // --- oturma / yatma (dört ayaklılar)
  const sitting = quad && meta.sit && !moving && !asleep && base !== 'lie' && base !== 'dead' && verb !== 'stretch';
  const lying = quad && (asleep || base === 'lie');
  const L = meta.leg;
  if (sitting) {
    a('body', { rx: -0.5, y: -L * 0.42, z: -L * 0.12 });
    a('legBL', { rx: -1.15, sy: 0.62, z: L * 0.15 }); a('legBR', { rx: -1.15, sy: 0.62, z: L * 0.15 });
    a('legFL', { rx: 0.5 }); a('legFR', { rx: 0.5 });
    a('head', { rx: 0.42 }); a('tail', { rx: 0.9 });
  } else if (lying) {
    a('body', { y: -L * 0.85 });
    for (const n of ['legFL', 'legFR']) a(n, { rx: -1.45, sy: 0.85 });
    for (const n of ['legBL', 'legBR']) a(n, { rx: -1.3, sy: 0.75 });
    a('head', { rx: asleep ? 0.55 : 0.2, y: asleep ? -0.06 : 0 }); a('tail', { ry: 1.1, rx: 1.2 });
  } else if (asleep) {
    a('head', { rx: 0.45, y: -0.03 }); a('body', { sy: 0.94 }); a('wingL', { rz: -0.05 }); a('wingR', { rz: 0.05 });
  }
  if (base === 'dead') { a('root', { rz: 0 }); a('head', { rx: 0.8 }); a('earL', { rz: 0.6 }); a('earR', { rz: -0.6 }); }

  // --- yürüyüş / zıplama / süzülme
  if (moving) {
    const ph = st.ph, run = st.run;
    if (meta.gait === 'walk') {
      const g = gaitDims(meta, run);
      const offs = P.legBL ? (run ? { legFL: 0, legFR: 0.1, legBL: 0.5, legBR: 0.6 } : { legFL: 0, legBR: 0, legFR: 0.5, legBL: 0.5 }) : { legFL: 0, legFR: 0.5 };
      for (const [n, o] of Object.entries(offs)) {
        const q = (ph + o) % 1;
        let z, up = 0;
        if (q < g.beta) z = g.S / 2 - g.S * (q / g.beta);
        else { const sw = (q - g.beta) / (1 - g.beta); z = -g.S / 2 + g.S * ease(sw); up = bell(sw); }
        const ang = Math.asin(clamp(-z / L, -0.95, 0.95));
        a(n, { rx: ang, sy: (1 / Math.cos(ang)) * (1 - (run ? 0.3 : 0.22) * up) });
      }
      lift = Math.abs(Math.sin(TAU * ph)) * (run ? 0.03 : 0.012);
      a('head', { rx: (run ? 0.06 : 0.03) * Math.sin(TAU * ph * 2) });
      if (P.tail) for (const s of P.tail.userData.segs || []) s.rotation.y += (run ? 0.18 : 0.12) * Math.sin(TAU * ph + 0.6);
      if (run) a('body', { rx: 0.06 * Math.sin(TAU * ph) });
      if (meta.stubby) a('body', { rz: 0.08 * Math.sin(TAU * ph) });   // bodur: paytak yürür
      if (meta.sprawl) a('body', { ry: 0.12 * Math.sin(TAU * ph) });
    } else if (meta.gait === 'hop') {
      const u = st.ph, air = u > 0.28 ? bell((u - 0.28) / 0.72) : 0, ground = u <= 0.28 ? bell(u / 0.28) : 0;
      lift = air * (st.run ? 0.3 : 0.2);
      a('body', { sy: 1 - 0.1 * ground + 0.05 * air, sx: 1 + 0.07 * ground });
      a('wingL', { rz: 0.9 * air }); a('wingR', { rz: -0.9 * air });
      a('head', { rx: -0.15 * air + 0.12 * ground });
      const v = u <= 0.28 ? 0 : ease((u - 0.28) / 0.72);
      comp = v - u;      // görünen ilerleme − gerçek ilerleme (döngü uzunluğu cinsinden)
    } else if (meta.gait === 'float') {
      const u = st.ph;
      a('wingL', { rz: 0.5 * Math.sin(TAU * u * 2) }); a('wingR', { rz: -0.5 * Math.sin(TAU * u * 2) });
      if (P.tail) (P.tail.userData.segs || []).forEach((s, i) => { s.rotation.x += 0.18 * Math.sin(TAU * u * 2 - i * 0.7); });
      lift = 0.04 * Math.sin(TAU * u * 2);
    }
  } else if (!asleep && verb === 'none' && base !== 'dead') {
    personality(st, a, t, mood);
  }
  if (meta.gait === 'float' && !moving) {
    // süzülen balina: hafif yükselip alçalır, yüzgeçleri ağır çırpar
    lift += 0.05 * Math.sin(t * 1.2);
    a('wingL', { rz: 0.25 * Math.sin(t * 1.6) }); a('wingR', { rz: -0.25 * Math.sin(t * 1.6) });
    if (P.tail) (P.tail.userData.segs || []).forEach((s, i) => { s.rotation.x += 0.12 * Math.sin(t * 1.6 - i * 0.8); });
    if (asleep) lift -= 0.25;
  }

  // --- ruh hâli duruşu
  if (!moving && base !== 'dead') {
    if (mood === 'sad' || mood === 'hungry' || mood === 'cry') { a('head', { rx: 0.25 }); a('earL', { rz: -0.45 }); a('earR', { rz: 0.45 }); if (P.tail) a('tail', { rx: 0.5 }); a('wingL', { rz: -0.1 }); a('wingR', { rz: 0.1 }); }
    if (mood === 'happy' || mood === 'love') { if (P.tail) for (const s of P.tail.userData.segs || []) s.rotation.y += 0.25 * Math.sin(t * 9); a('head', { rz: 0.1 * Math.sin(t * 1.3) }); }
    if (mood === 'angry') { a('earL', { rz: 0.6, rx: 0.5 }); a('earR', { rz: -0.6, rx: 0.5 }); a('head', { rx: 0.15 }); }
    if (mood === 'groggy' || mood === 'sleepy') a('head', { rx: 0.15 + 0.1 * Math.sin(t * 0.8), rz: 0.08 * Math.sin(t * 0.5) });
    if (mood === 'full') a('body', { sx: 1.06, sy: 0.97 });
  }

  // --- tek seferlik hareketler
  switch (verb) {
    case 'hop': { const q = (cu * 2) % 1, h = bell(q); lift += 0.16 * h; a('body', { sy: 1 + 0.04 * h }); a('wingL', { rz: 0.9 * h }); a('wingR', { rz: -0.9 * h }); a('earL', { rz: 0.2 * h }); a('earR', { rz: -0.2 * h });
      if (P.tail) for (const s of P.tail.userData.segs || []) s.rotation.y += 0.3 * Math.sin(cT * 14); break; }
    case 'eat': { const pk = Math.pow(Math.abs(Math.sin(cT * 7)), 2); a('head', { rx: (0.6 + 0.25 * pk) * ce }); a('jaw', { rx: 0.35 * pk * ce }); break; }
    case 'sad': case 'cry': { a('head', { rx: 0.4 * ce }); a('earL', { rz: -0.5 * ce }); a('earR', { rz: 0.5 * ce }); a('body', { sy: 1 - 0.04 * ce }); if (verb === 'cry') a('body', { rz: 0.03 * Math.sin(cT * 30) * ce }); break; }
    case 'doze': a('head', { rx: 0.45 * bell(cu) }); break;
    case 'lunge': case 'pounce': {
      const wind = cu < 0.35 ? bell(cu / 0.7) : 0, hit = cu >= 0.35 ? bell((cu - 0.35) / 0.65) : 0;
      a('body', { z: 0.14 * hit - 0.05 * wind, y: -0.04 * wind });
      if (verb === 'pounce') lift += 0.25 * hit;
      a('head', { rx: -0.2 * hit, rz: 0.08 * Math.sin(cT * 30) * hit }); a('jaw', { rx: 0.6 * hit }); a('earL', { rz: 0.6 * ce, rx: 0.5 * ce }); a('earR', { rz: -0.6 * ce, rx: 0.5 * ce });
      a('wingL', { rz: 0.8 * hit }); a('wingR', { rz: -0.8 * hit }); break;
    }
    case 'swat': { const h = bell(cu); a('legFL', { rx: -1.3 * h, y: 0.05 * h }); a('wingL', { rz: 1.2 * h }); a('head', { ry: 0.2 * h }); break; }
    case 'guard': { a('body', { y: 0.03 * ce }); a('head', { rx: -0.25 * ce }); a('earL', { rz: -0.15 * ce }); a('earR', { rz: 0.15 * ce }); a('wingL', { rz: 0.7 * ce }); a('wingR', { rz: -0.7 * ce }); if (P.tail) a('tail', { rx: -0.4 * ce }); break; }
    case 'jump': { const h = bell(cu); lift += 0.2 * h; a('earL', { rz: -0.3 * h }); a('earR', { rz: 0.3 * h }); a('wingL', { rz: 1.2 * h }); a('wingR', { rz: -1.2 * h }); break; }
    case 'freeze': break;
    case 'look': a('head', { ry: 0.7 * Math.sin(cu * TAU) * ce }); break;
    case 'headturn': a('head', { ry: (species === 'owl' ? 2.4 : 1.0) * Math.sin(cu * TAU) * ce }); break;
    case 'focus': a('head', { rx: -0.1 * ce }); break;
    case 'sniff': a('head', { rx: (0.45 + 0.08 * Math.sin(cT * 22)) * ce }); break;
    case 'sip': a('head', { rx: -0.3 * bell(cu) }); a('wingR', { rz: -1.0 * bell(cu) }); break;
    case 'groom': case 'lick': { a('head', { rx: 0.7 * ce, ry: 0.5 * ce }); a('jaw', { rx: 0.3 * Math.abs(Math.sin(cT * 10)) * ce }); a('tongue', { s: 1000 * (0.5 + 0.5 * Math.abs(Math.sin(cT * 10))) * ce || 1 }); a('legFL', { rx: -0.9 * ce }); break; }
    case 'tongue': { const on = cu > 0.25 && cu < 0.65 ? 1 : 0; if (on) a('tongue', { s: 1000 }); a('head', { rx: -0.15 * ce }); break; }
    case 'stretch': { const h = bell(cu); a('body', { rx: 0.22 * h, sz: 1 + 0.08 * h }); a('legFL', { rx: -0.6 * h }); a('legFR', { rx: -0.6 * h }); a('head', { rx: -0.3 * h }); a('wingL', { rz: 1.3 * h }); a('wingR', { rz: -1.3 * h }); if (P.tail) a('tail', { rx: -0.5 * h }); break; }
    case 'shake': { const s = (1 - cu) * Math.sin(cT * 34); a('body', { rz: 0.18 * s }); a('head', { rz: 0.3 * s }); a('earL', { rz: 0.4 * s }); a('earR', { rz: 0.4 * s }); break; }
    case 'roll': { a('body', { rz: TAU * ease(cu) }); lift += 0.1 * bell(cu); break; }
    case 'dig': { const s = Math.abs(Math.sin(cT * 16)) * ce; a('head', { rx: 0.5 * ce }); a('legFL', { rx: -0.8 * s }); a('legFR', { rx: -0.8 * (ce - s) }); break; }
    case 'tailwave': if (P.tail) for (const s of P.tail.userData.segs || []) s.rotation.y += 0.45 * Math.sin(cT * 4) * ce; break;
    case 'bask': a('head', { rx: -0.3 * ce }); a('body', { sy: 1 - 0.03 * ce }); break;
    case 'rub': a('body', { rz: 0.12 * Math.sin(cT * 5) * ce }); a('head', { rz: 0.25 * Math.sin(cT * 5) * ce }); break;
    case 'ability': {
      const h = bell(cu);
      lift += 0.12 * h; a('wingL', { rz: 1.6 * h }); a('wingR', { rz: -1.6 * h }); a('head', { rx: -0.35 * h });
      a('fan', { s: 1 + 0.25 * h }); a('tongue', { s: 1000 * h || 1 }); a('bud', { s: 1 + 0.6 * h }); a('flower', { s: 1 + 0.2 * h }); a('crest', { sy: 1 + 0.8 * h });
      if (P.tail) a('tail', { rx: -0.5 * h }); a('spout', { sy: 1 + 6 * h, s: 1 + 0.5 * h });
      break;
    }
  }
  return { lift, comp };
}

// türlere özgü bekleme hareketleri
function personality(st, a, t, mood) {
  const cyc = (period, x0, x1) => { const q = (t % period) / period; return q >= x0 && q <= x1 ? bell((q - x0) / (x1 - x0)) : 0; };
  const P = st.parts, sp = st.species;
  const tailSway = (amp, sp2) => { if (P.tail) (P.tail.userData.segs || []).forEach((s, i) => { s.rotation.y += amp * Math.sin(t * sp2 - i * 0.6); }); };
  if (sp === 'cat') { tailSway(0.16, 1.4); const nose = cyc(9, 0.18, 0.55); a('head', { rx: -0.25 * nose, rz: 0.1 * nose }); a('earR', { rz: -0.4 * cyc(7, 0.61, 0.66) }); }
  else if (sp === 'dog') { tailSway(0.1 + 0.3 * cyc(3.2, 0.6, 0.92), 9); a('head', { rz: -0.22 * cyc(10, 0.3, 0.56), rx: -0.18 * cyc(10, 0.66, 0.9) }); a('earL', { rz: 0.3 * cyc(6, 0.4, 0.56) }); a('earR', { rz: -0.3 * cyc(6, 0.62, 0.78) }); }
  else if (sp === 'chick') { const pk = cyc(3.4, 0.45, 0.72); a('head', { rx: 0.5 * pk, rz: 0.35 * cyc(5, 0.1, 0.4) - 0.3 * cyc(5, 0.55, 0.8) }); a('jaw', { rx: 0.4 * cyc(3.4, 0.55, 0.65) }); a('tuft', { rz: 0.15 * Math.sin(t * 3.7) }); a('wingL', { rz: 0.5 * cyc(4.2, 0.1, 0.28) }); a('wingR', { rz: -0.5 * cyc(4.2, 0.12, 0.3) }); a('fan', { s: 1 + 0.06 * cyc(7, 0.3, 0.7) }); }
  else if (sp === 'owl') { a('body', { rz: 0.03 * Math.sin(t * 1.05) }); a('head', { ry: -0.9 * cyc(11, 0.2, 0.42) + 0.8 * cyc(11, 0.44, 0.62), rz: 0.25 * cyc(13, 0.7, 0.85) }); }
  else if (sp === 'gecko') { tailSway(0.06, 0.7); const tg = cyc(6, 0.3, 0.38); if (tg > 0.2) a('tongue', { s: 1000 }); a('head', { ry: -0.35 * cyc(12, 0.62, 0.82) }); }
  else if (sp === 'plant') { a('body', { rz: 0.03 * Math.sin(t * 0.7) }); a('wingR', { rz: 0.06 * Math.sin(t * 0.7) }); a('wingL', { rz: -0.05 * Math.sin(t * 0.7) }); a('bud', { s: 1 + 0.08 * Math.sin(t * 1.25) }); a('flower', { rz: 0.06 * Math.sin(t * 0.9) }); }
  else if (sp === 'whale') { a('body', { rz: 0.05 * Math.sin(t * 0.6) }); a('head', { rx: -0.08 * cyc(9, 0.3, 0.7) }); a('spout', { sy: 1 + 3 * cyc(14, 0.4, 0.5) }); }
  else if (sp === 'doodle') { a('body', { rz: 0.04 * Math.sin(t * 0.4) }); a('head', { rx: 0.12 + 0.05 * Math.sin(t * 0.3) }); a('tuft', { ry: t * 0.6 }); a('wingL', { rz: -0.05 }); a('wingR', { rz: 0.05 }); }
  else if (sp === 'goat') { tailSway(0.4, 10 * cyc(5, 0.2, 0.3)); a('jaw', { rx: 0.08 * Math.abs(Math.sin(t * 6)) }); a('head', { ry: 0.35 * cyc(13, 0.1, 0.4), rx: 0.2 * cyc(13, 0.55, 0.8) }); a('earL', { rz: 0.15 * cyc(5, 0.6, 0.66) }); }
}

// ---------------------------------------------------------------- canlı pet
let uidSeq = 0;
export class Puppet {
  constructor(host) {
    this.uid = 'cp' + (++uidSeq);
    this.host = host || null;
    this.t = 0; this.ph = 0; this.dir = [1, 0]; this.run = false;
    this.base = 'idle'; this.clip = ''; this.clipT = 0; this.clipDur = 1; this.clipMs = 0;
    this.mood = 'idle'; this.cond = null;
    this.facing = 1; this.yaw = 0.35; this.headYaw = 0;
    this.blinkAt = 2; this.blinkT = -1; this.look = 0; this.lookTo = 0; this.lookAt = 1;
    this.species = ''; this.stage = -1; this.coat = 0;
    if (host) {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'pet-svg pet-live pet-3d';
      this.canvas.setAttribute('aria-hidden', 'true');
      host.appendChild(this.canvas);
      try { this.renderer = makeRenderer(this.canvas); } catch (e) { console.warn('[pet3d] WebGL yok', e); this.renderer = null; }
      const s = makeScene(); this.scene = s.scene; this.cam = s.cam; this.sh = s.sh;
      this.px = 0;
    }
  }
  setForm(species, stage, coat = 0) {
    stage = clamp(stage | 0, 0, 5);
    if (species === this.species && stage === this.stage && coat === this.coat) return;
    this.species = species; this.stage = stage; this.coat = coat | 0;
    if (this.model) this.scene?.remove(this.model.root);
    this.model = build(species, stage, coat);
    this.scene?.add(this.model.root);
  }
  setMood(m) { this.mood = m || 'idle'; }
  setCond(c) { this.cond = c || null; }
  setBase(name) {
    const b = ['idle', 'sit', 'walk', 'run', 'sleep', 'lie', 'dead', 'home', 'full'].includes(name) ? name : 'idle';
    if (b === this.base) return;
    this.base = b;
    if (b !== 'walk' && b !== 'run') { this.ph = 0; this.run = false; }
    else this.run = b === 'run';
  }
  play(name, ms) {
    const verb = VERB[name]; if (!verb) return false;
    this.clip = name; this.clipT = 0; this.clipDur = DUR[verb] || 1.2;
    this.clipMs = Math.max(ms || 0, this.clipDur * 1000);
    return true;
  }
  stop() { this.clip = ''; }
  get playing() { return this.clip; }
  pxPerUnit() { return (this.px || 132) / VIEW_W; }
  // yürürken alınan yol (px) → adım fazı; dx,dy yön
  travel(px, mode = 'walk', spritePx = 132, dx, dy) {
    if (!this.model) return;
    this.px = spritePx; this.run = mode === 'run';
    if (dx != null) { const m = Math.hypot(dx, dy) || 1; this.dir = [dx / m, dy / m]; }
    const meta = this.model.meta, pu = this.pxPerUnit();
    let cycle;
    if (meta.gait === 'walk') cycle = gaitDims(meta, this.run).D * pu * Math.max(0.35, Math.abs(Math.sin(this.yaw)));
    else if (meta.gait === 'hop') cycle = (this.run ? 1.4 : 1) * meta.hop * pu;
    else cycle = 90;
    this.ph = (this.ph + px / Math.max(1, cycle)) % 1;
  }
  face(f) { this.facing = f < 0 ? -1 : 1; }
  tick(dt) {
    if (!this.model) return;
    dt = clamp(dt, 0, 0.1); this.t += dt;
    if (this.clip) { this.clipT += dt; if (this.clipT * 1000 >= this.clipMs) this.clip = ''; else if (this.clipT >= this.clipDur && this.clipMs > this.clipDur * 1000) this.clipT -= this.clipDur * 0.999; }
    // göz kırpma, bakış
    this.blinkAt -= dt;
    if (this.blinkAt <= 0 && this.blinkT < 0) { this.blinkT = 0; this.blinkAt = 2.4 + Math.random() * 4.5; }
    let blink = 0;
    if (this.blinkT >= 0) { this.blinkT += dt; blink = bell(this.blinkT / 0.17); if (this.blinkT > 0.17) this.blinkT = -1; }
    this.lookAt -= dt;
    if (this.lookAt <= 0) { this.lookTo = Math.random() < 0.4 ? 0 : Math.random() * 2 - 1; this.lookAt = 1.4 + Math.random() * 3; }
    this.look += (this.lookTo - this.look) * Math.min(1, dt * 6);
    // yön: yürürken yana (biraz bize dönük), dururken bize 3/4, ara sıra tam karşıya bakar
    const moving = this.base === 'walk' || this.base === 'run';
    const asleep = this.base === 'sleep' || this.base === 'dead';
    const wander = Math.sin(this.t * 0.23) * 0.22 + (Math.sin(this.t * 0.11) > 0.6 ? -0.35 * Math.sign(this.facing) : 0);
    const target = moving ? this.facing * 1.25 : asleep ? this.facing * 0.55 : this.facing * 0.38 + wander;
    const prev = this.yaw;
    this.yaw += (target - this.yaw) * Math.min(1, dt * (moving ? 7 : 3));
    this.headYaw += (clamp((target - this.yaw) * 0.9, -0.9, 0.9) - this.headYaw) * Math.min(1, dt * 10);
    this.render({ blink, turnRate: (this.yaw - prev) / Math.max(dt, 1e-3) });
  }
  render(extra = {}) {
    const m = this.model; if (!m) return;
    resetPose(m.parts);
    const res = pose({ species: this.species, parts: m.parts, meta: m.meta, t: this.t, base: this.base, mood: this.mood, clip: this.clip, clipT: this.clipT, clipDur: this.clipDur,
      ph: this.ph, run: this.run, blink: extra.blink || 0, look: this.look });
    m.root.rotation.y = this.yaw;
    if (m.parts.head) m.parts.head.rotation.y += this.headYaw;
    if (Math.abs(extra.turnRate || 0) > 0.5) m.root.position.y = 0.015 * Math.min(1, Math.abs(extra.turnRate) / 6); else m.root.position.y = 0;
    m.root.position.y += res.lift;
    // gölge: yükseldikçe küçülür
    const h = m.root.position.y + (m.meta.hover || 0);
    const size = (m.meta.height || 1) * 0.7 * (1 - clamp(h / 1.5, 0, 0.55));
    this.sh.scale.set(size * 1.2, size * 0.85, 1); this.sh.material.opacity = 1 - clamp(h / 1.6, 0, 0.6);
    // zıplama telafisi: yerdeyken çizim geride kalır (CSS ile, sayfa koordinatında)
    if (this.canvas) {
      const L = m.meta.gait === 'hop' && (this.base === 'walk' || this.base === 'run') ? (this.run ? 1.4 : 1) * m.meta.hop * this.pxPerUnit() : 0;
      const ox = res.comp * L * this.dir[0], oy = res.comp * L * this.dir[1];
      const tf = L ? `translate(${ox.toFixed(1)}px, ${oy.toFixed(1)}px)` : '';
      if (this.canvas._tf !== tf) { this.canvas._tf = tf; this.canvas.style.transform = tf; }
      this.canvas.classList.toggle('is-dead', this.base === 'dead');
    }
    if (!this.renderer) return;
    const w = this.canvas.clientWidth || 132, hgt = this.canvas.clientHeight || 132;
    const dpr = Math.min(1.75, window.devicePixelRatio || 1);
    if (this.canvas.width !== Math.round(w * dpr) || this.canvas.height !== Math.round(hgt * dpr)) { this.renderer.setPixelRatio(dpr); this.renderer.setSize(w, hgt, false); this.px = w; }
    this.renderer.render(this.scene, this.cam);
  }
}

// ---------------------------------------------------------------- statik görüntü (seçim, bilgi, panel, ölüm)
let still = null;
const stillCache = new Map();
function stillKit() {
  if (still) return still;
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
  let renderer = null;
  try { renderer = makeRenderer(canvas, true); renderer.setSize(256, 256, false); } catch { renderer = null; }
  const s = makeScene();
  return (still = { canvas, renderer, ...s });
}
export function staticSVG(species, stage, opts = {}) {
  stage = clamp(stage | 0, 0, 5);
  const mood = opts.mood || 'idle';
  const base = mood === 'dead' ? 'dead' : mood === 'sleep' ? 'sleep' : (opts.pose === 'lie' || opts.pose === 'flat' || mood === 'full') ? 'lie' : 'idle';
  const key = [species, stage, opts.coat | 0, mood, base, opts.face || 1].join('|');
  let url = stillCache.get(key);
  if (!url) {
    const k = stillKit();
    if (!k.renderer) return `<div class="pet-svg pet-3d-missing"></div>`;
    const m = build(species, stage, opts.coat | 0);
    k.scene.add(m.root);
    resetPose(m.parts);
    const res = pose({ species, parts: m.parts, meta: m.meta, t: 0.8, base, mood, clip: '', clipT: 0, clipDur: 1, ph: 0, run: false, blink: 0, look: 0 });
    m.root.rotation.y = (opts.face || 1) * 0.45;
    m.root.position.y = res.lift;
    const size = (m.meta.height || 1) * 0.7; k.sh.scale.set(size * 1.2, size * 0.85, 1);
    k.renderer.render(k.scene, k.cam);
    url = k.canvas.toDataURL('image/png');
    k.scene.remove(m.root);
    stillCache.set(key, url);
  }
  return `<img class="pet-svg pet-img ${opts.cls || ''}${base === 'dead' ? ' is-dead' : ''}" src="${url}" alt="" draggable="false">`;
}
