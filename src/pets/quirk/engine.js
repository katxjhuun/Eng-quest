// dam-la — Set 3 "Oyuncak" 3B motoru. Yalnızca bu set seçildiğinde yüklenir (ayrı parça; three.js burada).
// · Tek paylaşılan WebGL çizici; her canlı pet kendi küçük tuvaline kopyalanır (bağlam sınırına takılmaz).
// · Gerçek Quirky modelleri (Omabuarts Studio, CC BY): serçe → civciv, kertenkele → kertenkele, pudu → keçi.
//   18 özgün klip (Attack, Bounce, Clicked, Death, Eat, Fear, Fly, Hit, Idle A/B/C, Jump, Roll, Run, Sit, Spin, Swim, Walk)
//   ve göz şekil anahtarları (blink, happy, sad, sleep, annoyed, squint, shrink, dead, spin, cry, gözyaşı, ter) kullanılır.
// · Diğer türler models.js'teki aynı tarzdaki kendi modellerimizdir.
// · Yürüyüş/koşu klibi zamana değil kat edilen yola kilitlidir: adım uzunluğu klipten ölçülür → ayak kaymaz.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { buildProc, animateProc } from './models.js';
import { intent, eyeState, clamp, lerp, damp } from '../rigs/kit.js';
import { accSVG } from '../acc.js';

const REAL = {
  chick: { file: 'sparrow', fit: 'h', size: 74, feet: ['feetL', 'feetR'], head: 'hair01' },
  gecko: { file: 'gecko', fit: 'len', size: 104, feet: ['legFL', 'legBL', 'legFR', 'legBR'], head: 'body' },
  goat: { file: 'pudu', fit: 'h', size: 96, feet: ['legFL', 'legBL', 'legFR', 'legBR'], head: 'earL' },
};
// gerçek 3B modellerde (göz konumu bilinmiyor) baş/göz/boyun düzeltmeleri, baş genişliği (W) cinsinden
const TOY_FIX = { chick: { ty: -0.06, ex: 0.22, ey: 0.24, ew: 0.42, ny: 0.55 }, gecko: { tx: 0.95, ex: 1.05, ey: -0.02, ny: 0.45 }, goat: { ty: -0.25, ey: 0.22, ex: 0.3, ny: 0.6 } };
const SPEED = { Idle_A: 0.32, Idle_B: 0.36, Idle_C: 0.36, Sit: 0.28, Walk: 1, Run: 1, Eat: 0.55, Attack: 0.7, Bounce: 0.55, Clicked: 0.6, Death: 0.45, Fear: 0.7, Fly: 0.6, Hit: 0.7, Jump: 0.6, Roll: 0.5, Spin: 0.6, Swim: 0.5 };
const VMAP = { hop: 'Bounce', eat: 'Eat', sad: 'Sit', cry: 'Sit', doze: 'Sit', lunge: 'Attack', bite: 'Attack', pounce: 'Attack', swat: 'Attack', guard: 'Idle_C', jump: 'Jump', freeze: 'Idle_A',
  look: 'Idle_B', headturn: 'Idle_B', focus: 'Idle_C', sniff: 'Eat', sip: 'Idle_C', groom: 'Idle_C', lick: 'Idle_C', tongue: 'Idle_B', stretch: 'Sit', shake: 'Hit', roll: 'Roll', dig: 'Eat',
  tailwave: 'Idle_B', bask: 'Sit', rub: 'Clicked', fear: 'Fear', fly: 'Fly', hit: 'Hit', spin: 'Spin', stalk: 'Walk', float: 'Swim', wobble: 'Clicked', ability: 'Jump' };
const ONCE = new Set(['Death']);

const gltfs = {};
let loading = null;
export function preload(base = 'pets3d/') {
  if (loading) return loading;
  const L = new GLTFLoader();
  loading = Promise.all(Object.values(REAL).map(r => L.loadAsync(base + r.file + '.glb').then(g => { gltfs[r.file] = g; }))).then(() => true);
  return loading;
}
export const ready = () => Object.keys(gltfs).length === Object.keys(REAL).length;

// ---------------------------------------------------------------- paylaşılan çizici + kamera
let R = null;
function renderer() {
  if (!R) {
    R = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power', preserveDrawingBuffer: false });
    R.setPixelRatio(1); R.outputColorSpace = THREE.SRGBColorSpace; R.setClearColor(0x000000, 0);
  }
  return R;
}
// pet birimleri: 200×200 kutu, yer çizgisi y=188 (svg). Hafif yukarıdan bakan ortografik kamera.
const ELEV = 14 * Math.PI / 180;
const CAM = new THREE.OrthographicCamera(-100, 100, 100, -100, -600, 600);
{ const ty = 88 / Math.cos(ELEV); CAM.position.set(0, ty + Math.sin(ELEV) * 300, Math.cos(ELEV) * 300); CAM.lookAt(0, ty, 0); CAM.updateMatrixWorld(); }
const v3 = new THREE.Vector3();
const toSvg = p => { v3.copy(p).project(CAM); return [100 + v3.x * 100, 100 - v3.y * 100]; };

function makeScene() {
  const s = new THREE.Scene();
  s.add(new THREE.HemisphereLight(0xffffff, 0x9fb0c0, 2.1));
  const d = new THREE.DirectionalLight(0xffffff, 1.5); d.position.set(-60, 160, 120); s.add(d);
  return s;
}

// ---------------------------------------------------------------- pet
export class Pet3D {
  constructor(species, stage, coat, scale = 1) {
    this.sp = species; this.stage = stage; this.scene = makeScene();
    this.wrap = new THREE.Group(); this.scene.add(this.wrap);
    this.yaw = -0.55; this.facing = 1; this.air = 0; this.morphW = {}; this.idleT = 0; this.idleClip = 'Idle_A'; this.ox = 0;
    const u = stage / 5, rd = REAL[species];
    if (rd && gltfs[rd.file]) {
      const g = gltfs[rd.file], model = skClone(g.scene);
      const inner = new THREE.Group(); inner.add(model); model.rotation.y = Math.PI / 2;   // ileri yön +X
      inner.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(inner), size = box.getSize(new THREE.Vector3());
      const k = (rd.fit === 'h' ? rd.size / size.y : rd.size / Math.max(size.x, size.z)) * lerp(0.6, 1, u) * scale;
      inner.scale.setScalar(k); inner.position.y = -box.min.y * k;
      this.wrap.add(inner);
      this.model = model; this.inner = inner;
      this.mixer = new THREE.AnimationMixer(model);
      this.actions = Object.fromEntries(g.animations.map(c => [c.name, this.mixer.clipAction(c)]));
      this.morphs = []; model.traverse(o => { if (o.morphTargetDictionary) this.morphs.push(o); if (o.isMesh) o.frustumCulled = false; });
      this.headBone = model.getObjectByName(rd.head) || model;
      this.cur = null; this.play('Idle_A');
      this.strides = { Walk: this.measure('Walk', rd.feet), Run: this.measure('Run', rd.feet) };
      this.real = true;
    } else {
      // boyut ölçeği ayrı bir ebeveynde (kökün kendi ölçeği ezilip uzama için her karede yazılır)
      this.M = buildProc(species, stage); this.ps = scale * (species === 'whale' ? 1.25 : species === 'plant' ? 1.45 : 1.6) * (species === 'plant' ? 1 : lerp(0.66, 1, u));
      const sg = new THREE.Group(); sg.scale.setScalar(this.ps); sg.add(this.M.root); this.wrap.add(sg);
      this.real = false;
    }
  }
  // klipten adım uzunluğu: ayak kemiklerinin ileri eksendeki gidiş-dönüş aralığı (pet birimi)
  measure(name, feet) {
    const a = this.actions[name]; if (!a) return 30;
    const bones = feet.map(n => this.model.getObjectByName(n)).filter(Boolean); if (!bones.length) return 30;
    this.mixer.stopAllAction(); a.reset().play();
    const d = a.getClip().duration, mins = bones.map(() => 1e9), maxs = bones.map(() => -1e9);
    for (let i = 0; i <= 16; i++) { this.mixer.setTime(d * i / 16 * 0.999); this.wrap.updateMatrixWorld(true); bones.forEach((b, j) => { b.getWorldPosition(v3); mins[j] = Math.min(mins[j], v3.x); maxs[j] = Math.max(maxs[j], v3.x); }); }
    a.stop(); this.cur = null; this.play('Idle_A');
    const r = bones.map((b, j) => maxs[j] - mins[j]).reduce((x, y) => x + y, 0) / bones.length;
    return Math.max(8, r);
  }
  cycle(run) { return this.real ? this.strides[run ? 'Run' : 'Walk'] : (this.M.cycleLen ? this.M.cycleLen(run) * this.ps : 40); }
  play(name, fade = 0.18) {
    if (this.cur === name || !this.actions[name]) return;
    const next = this.actions[name];
    next.reset(); next.setLoop(ONCE.has(name) ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); next.clampWhenFinished = true;
    next.timeScale = SPEED[name] || 0.5;
    if (this.cur && this.actions[this.cur]) { next.play(); this.actions[this.cur].crossFadeTo(next, fade, false); } else next.play();
    this.cur = name;
  }
  update(S, dt) {
    const I = intent(S.verb, S.cu, S.cT, S.ce, S.mood, S.t), eye = eyeState(S.mood, I, S.lidV, S.base);
    // yön: sağ/sol 3/4 açı; dönerken yüzünü kameraya göstererek döner
    const front = !this.real && this.M.frontEyes;
    const tgt = front ? (this.facing > 0 ? -1.2 : -1.94) : (this.facing > 0 ? -0.55 : -Math.PI + 0.55);
    this.yaw = S.still ? tgt : damp(this.yaw, tgt, dt, 7);
    this.wrap.rotation.y = this.yaw; this.wrap.position.x = this.ox;
    if (this.real) this.updReal(S, I, eye, dt); else { animateProc(this.M, S, I, dt); this.air = this.M.air || 0; this.M.eyes.forEach((e, i) => e.set(eye, S.lidV, 0.4 + S.look * 0.6, 0.3 * I.headDown, S.t, I.tears)); }
  }
  updReal(S, I, eye, dt) {
    let name, lock = false;
    const verbClip = S.verb !== 'none' && S.ce > 0.01 ? VMAP[S.verb] : null;
    if (S.base === 'dead') name = 'Death';
    else if (S.moving) { name = S.run ? 'Run' : 'Walk'; lock = true; }
    else if (verbClip) name = verbClip;
    else if (S.asleep || S.base === 'lie' || S.base === 'full') name = 'Sit';
    else { this.idleT -= dt; if (this.idleT <= 0) { this.idleClip = this.idleClip === 'Idle_A' && Math.random() < 0.45 ? (Math.random() < 0.5 ? 'Idle_B' : 'Idle_C') : 'Idle_A'; this.idleT = this.idleClip === 'Idle_A' ? 5 + Math.random() * 5 : 2.4; } name = this.idleClip; }
    if (S.still) { this.mixer.stopAllAction(); this.cur = null; }
    this.play(name);
    const a = this.actions[this.cur];
    if (lock && a) { a.timeScale = 0; a.time = (S.ph % 1) * a.getClip().duration; this.mixer.update(0); }
    else if (S.still && a) { a.time = a.getClip().duration * (name === 'Death' ? 0.999 : 0.3); this.mixer.update(0); }
    else this.mixer.update(dt);
    if (S.verb === 'stalk' && a) a.timeScale = 0.45;
    // göz şekil anahtarları
    const W = {};
    const set = (k, v) => { W[k] = Math.max(W[k] || 0, v); };
    set('eyes.blink', eye === 'open' || eye === 'wide' ? S.lidV : 0);
    if (eye === 'closed') set('eyes.sleep', 1);
    if (eye === 'happy') set('eyes.happy', 1);
    if (eye === 'sad') set('eyes.sad', 1);
    if (eye === 'angry') set('eyes.annoyed', 1);
    if (eye === 'squint') set('eyes.squint', 1);
    if (eye === 'sleepy') { set('eyes.squint', 0.6); set('eyes.blink', 0.45); }
    if (eye === 'wide') set('eyes.shrink', 1);
    if (eye === 'x') set('eyes.dead', 1);
    if (eye === 'dizzy') set('eyes.spin-1', 1);
    if (eye === 'hurt') set('eyes.trauma', 1);
    if (S.mood === 'love' || S.verb === 'hop') set('eyes.excited-1', 0.8);
    if (I.tears > 0.1) { set('eyes.cry-1', 1); set('teardrop-1.L', 1); set('teardrop-1.R', 1); }
    if (S.verb === 'fear') { set('sweat-1.L', 1); set('sweat-1.R', 1); }
    for (const m of this.morphs) {
      const dict = m.morphTargetDictionary, inf = m.morphTargetInfluences;
      for (const k in dict) { const tgt = W[k] || 0; inf[dict[k]] = S.still ? tgt : damp(inf[dict[k]], tgt, dt, 16); }
    }
    this.air = 0;
  }
  // aksesuar dayanağı (svg pet birimleri): baş tepesi, genişlik, göz merkezi
  anchor() {
    this.wrap.updateMatrixWorld(true);
    let head, top, w, eyeP;
    if (this.real) { this.headBone.getWorldPosition(v3); head = v3.clone(); const s = this.inner.scale.x; top = head.clone().add(new THREE.Vector3(0, (this.sp === 'gecko' ? 10 : 6) * s / 0.6 * 0.6, 0)); w = (this.sp === 'goat' ? 34 : this.sp === 'chick' ? 40 : 30) * s / (REAL[this.sp].size / 100); }
    else { const M = this.M; M.head.getWorldPosition(v3); head = v3.clone(); const hr = M.headR * this.ps; top = head.clone().add(new THREE.Vector3(0, hr * (M.kind === 'plant' ? 1.8 : 0.95), 0)); w = hr * 2; }
    const [tx, ty] = toSvg(top), [hx, hy] = toSvg(head);
    const W = Math.min(60, Math.max(14, w));
    // gözlük: kendi çizdiğimiz modellerde gerçek göz konumları ekrana izdüşürülür (profilde öndeki göz, yandan gözlük)
    if (!this.real && this.M.eyes?.length >= 2) {
      const P2 = this.M.eyes.map(e => { e.mesh.getWorldPosition(v3); return { s: toSvg(v3.clone()), z: v3.z }; });
      const gap = Math.abs(P2[0].s[0] - P2[1].s[0]) + Math.abs(P2[0].s[1] - P2[1].s[1]);
      if (gap >= W * 0.3) return [tx, ty, W, hy + W * 0.35, (P2[0].s[0] + P2[1].s[0]) / 2, (P2[0].s[1] + P2[1].s[1]) / 2, gap];
      const f = P2[0].z >= P2[1].z ? P2[0] : P2[1];
      return [tx, ty, W, hy + W * 0.35, f.s[0], f.s[1], gap];
    }
    const T = TOY_FIX[this.sp] || {};
    const sideX = (this.facing > 0 ? 1 : -1) * W * (T.ex ?? 0.15);
    return [tx + (T.tx || 0) * W, ty + (T.ty || 0) * W, W * (T.w || 1), hy + W * (T.ny ?? 0.35), hx + sideX, hy + W * (T.ey ?? -0.05), W * (T.ew ?? 0.55)];
  }
  draw(canvas) {
    const r = renderer(), px = canvas.width;
    if (r.domElement.width !== px) r.setSize(px, px, false);
    r.render(this.scene, CAM);
    const c = canvas.getContext('2d'); c.clearRect(0, 0, px, px); c.drawImage(r.domElement, 0, 0);
  }
  dispose() { this.mixer?.stopAllAction(); this.scene.clear(); }
}

// ---------------------------------------------------------------- statik görüntü (listeler, kartlar): önbellekli
const snaps = new Map();
export function snapshot(species, stage, S, scale = 1, px = 256) {
  const key = [species, stage, S.mood, S.base, scale, px].join('|');
  if (snaps.has(key)) return snaps.get(key);
  const p = new Pet3D(species, stage, 0, scale);
  p.update({ ...S, still: true }, 1);
  const cv = document.createElement('canvas'); cv.width = cv.height = px;
  p.draw(cv);
  const url = cv.toDataURL('image/png'), out = { url, anchor: p.anchor(), air: p.air };
  p.dispose(); snaps.set(key, out);
  if (snaps.size > 120) snaps.delete(snaps.keys().next().value);
  return out;
}
export { accSVG };
