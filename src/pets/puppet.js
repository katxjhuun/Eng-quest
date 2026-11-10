// Pet oynatıcısı: türün iskeletini seçer, klipleri oynatır, geçişleri harmanlar, yaylı ikincil hareketi
// (kuyruk, kulak, yaprak) hesaplar ve SVG'yi her karede yalnızca değişen özniteliklerle günceller.
import * as quad from './quad.js';
import * as bean from './bean.js';
import * as lizard from './lizard.js';
import { blend, Spring, EASE, clamp, r1, TAU, retro } from './anim.js';
import { propOps } from './props.js';
import { op } from './face.js';

const RIG = { cat: quad, dog: quad, chick: bean, plant: bean, owl: bean, gecko: lizard };
export const rigOf = species => RIG[species] || bean;
const NS = 'http://www.w3.org/2000/svg';
const G = 108;
let uidSeq = 0;

// ---------------------------------------------------------------- DOM uzlaştırıcı
function sync(parent, ops) {
  if (!parent._m) parent._m = new Map();
  const seen = new Set();
  let i = 0;
  for (const o of ops) {
    if (!o || seen.has(o.k)) continue;
    seen.add(o.k);
    let el = parent._m.get(o.k);
    if (!el || el._t !== o.t) {
      if (el) el.remove();
      el = document.createElementNS(NS, o.t); el._t = o.t; el._k = o.k; el._a = {};
      parent._m.set(o.k, el);
    }
    if (parent.childNodes[i] !== el) parent.insertBefore(el, parent.childNodes[i] || null);
    const a = o.a || {}, old = el._a;
    for (const k in a) {
      const v = a[k];
      if (v === null || v === undefined) { if (k in old) { el.removeAttribute(k); delete old[k]; } continue; }
      const s = typeof v === 'number' ? String(v) : v;
      if (old[k] !== s) { el.setAttribute(k, s); old[k] = s; }
    }
    for (const k in old) if (!(k in a) || a[k] == null) { el.removeAttribute(k); delete old[k]; }
    if (o.kids) sync(el, o.kids); else if (el._m && el._m.size) { el.textContent = ''; el._m.clear(); }
    i++;
  }
  while (parent.childNodes.length > i) {
    const c = parent.lastChild; if (c._k) parent._m.delete(c._k); parent.removeChild(c);
  }
}
const esc = v => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
function str(ops) {
  let s = '';
  for (const o of ops) {
    if (!o) continue;
    let at = '';
    for (const k in o.a || {}) { const v = o.a[k]; if (v !== null && v !== undefined) at += ` ${k}="${esc(v)}"`; }
    s += `<${o.t}${at}>${o.kids ? str(o.kids) : ''}</${o.t}>`;
  }
  return s;
}

// ---------------------------------------------------------------- editoryal baskı geçişi
// Naif / outsider art + retro editoryal illüstrasyon: risograf paleti, ince titrek mürekkep kontur,
// hacim için ışık alan/gölgede kalan iki-üç ton (2B çizim, 3B kütle), kâğıt dokusu ve hafif baskı kayması.
// Rig'ler şekilleri ve ayrıntıları çizer; bu geçiş renkleri baskı mürekkeplerine çevirir ve dolgulara kontur ekler.
const FILLS = new Set(['path', 'ellipse', 'circle', 'rect', 'polygon']);
const NO_INK = /^(e[LR]|mo$|tg|tgt|lk|bl[12]$|shadow|glow|tr1|sw$|dt\d|cv|sp\d|thorn|ribs|bark|down|fluff|fs\d|nost|wh|nz)/;
// Naif illüstrasyon dokusu: ana gövde parçalarının üstüne türe özgü el çizimi desen (tüy çizgileri, tüy kıvrımları,
// pul, yaprak damarı) bindirilir; bacak gibi çizgi-şekillere desen kontur olarak uygulanır.
const TEX_FILL = /^(body|skull|neck|haunch|belly|ruff|mz|bd|b|head|casque|crest|disc|discL|discR|mound|top|cr|c)$/;
const TEX_STROKE = /^(tail|neck|lg|leg|legs|ft|tb|ts|arm|wing)/;
function ink(ops, I, tex) {
  const out = [];
  for (const o of ops) {
    if (!o) continue;
    if (o.t === 'defs' || o.t === 'clipPath' || o.t === 'filter') { out.push(o); continue; }
    const a = o.a ? { ...o.a } : {};
    const opa = a.opacity != null ? Number(a.opacity) : 1;
    if (a.fill && a.fill !== 'none') a.fill = retro(a.fill);
    if (a.stroke && a.stroke !== 'none') a.stroke = retro(a.stroke);
    if (FILLS.has(o.t) && a.fill && a.fill !== 'none' && !a.stroke && opa >= 0.7 && !NO_INK.test(o.k)) {
      a.stroke = I; a['stroke-width'] = 1.05; a['vector-effect'] = 'non-scaling-stroke'; a['stroke-linejoin'] = 'round';
    }
    out.push(o.kids ? { ...o, a, kids: ink(o.kids, I, tex) } : { ...o, a });
    if (tex && opa >= 0.7 && FILLS.has(o.t)) {
      const filled = a.fill && a.fill !== 'none' && TEX_FILL.test(o.k);
      const stroked = (!a.fill || a.fill === 'none') && a.stroke && Number(a['stroke-width']) > 2.5 && TEX_STROKE.test(o.k);
      if (filled) out.push({ ...o, k: o.k + 'Tx', a: { ...a, fill: `url(#${tex})`, stroke: null, 'stroke-width': null, 'vector-effect': null } });
      else if (stroked) out.push({ ...o, k: o.k + 'Tx', a: { ...a, stroke: `url(#${tex})` } });
    }
  }
  return out;
}
// türe göre desen (12×12 birimlik, hafif eğik); koyu mürekkep, yarı saydam
const TEX = {
  fur: 'M1 2 q1.2 -1.4 2.4 0 M6.5 4.5 q1.2 -1.4 2.4 0 M2.5 8.5 q1.2 -1.4 2.4 0 M8 10.5 q1.2 -1.4 2.4 0',
  fluff: 'M2 3 q1 -1.6 2 0 q1 1.6 2 0 M7 8 q1 -1.6 2 0 q1 1.6 2 0',
  feather: 'M1 4 l2 2 l2 -2 M7 4 l2 2 l2 -2 M4 10 l2 2 l2 -2',
  scale: 'M0 6 a3 3 0 0 1 6 0 a3 3 0 0 1 6 0 M-3 12 a3 3 0 0 1 6 0 a3 3 0 0 1 6 0',
  vein: 'M1 3 l3 1.5 M6 8 l3 1.5 M3 10.5 l2 1',
};
function texDefs(id, kind, I) {
  return op('texdefs', 'defs', {}, [op('pat', 'pattern', { id, width: 12, height: 12, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(-18)' }, [
    op('p', 'path', { d: TEX[kind] || TEX.fur, fill: 'none', stroke: I, 'stroke-width': 0.55, 'stroke-linecap': 'round', opacity: 0.42 })])]);
}
const HATCH = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="5" height="5"><path d="M-1 4 L4 -1 M1 6 L6 1" stroke="#2A2230" stroke-width=".55" stroke-opacity=".55"/></svg>');
// 2B çizim + 3B kütle: siluetin bulanık alfasından kabartma ışığı üretilir, üç tona basamaklanır (cel/riso gölge),
// gövdeyle çarpılır; üstüne kâğıt grenı, dışına titrek mürekkep kontur ve kaymış ikinci baskı rengi.
function inkFilter(id, I, seed) {
  return op('inkdefs', 'defs', {}, [op('ink', 'filter', { id, x: '-14%', y: '-14%', width: '128%', height: '128%', 'color-interpolation-filters': 'sRGB' }, [
    op('b', 'feGaussianBlur', { in: 'SourceAlpha', stdDeviation: '4', result: 'bl' }),
    op('l', 'feDiffuseLighting', { in: 'bl', surfaceScale: '7', diffuseConstant: '1.2', 'lighting-color': '#FFFFFF', result: 'lt' }, [op('dl', 'feDistantLight', { azimuth: '225', elevation: '40' })]),
    // üç ton: gölge / yarı ton / ışık (+ tepe parıltısı)
    op('q', 'feComponentTransfer', { in: 'lt', result: 'band' }, [
      op('r', 'feFuncR', { type: 'discrete', tableValues: '0.5 0.74 0.95 1.08' }), op('g', 'feFuncG', { type: 'discrete', tableValues: '0.5 0.73 0.95 1.07' }), op('bb', 'feFuncB', { type: 'discrete', tableValues: '0.62 0.8 0.97 1.04' })]),
    op('mu', 'feBlend', { in: 'SourceGraphic', in2: 'band', mode: 'multiply', result: 'vol' }),
    op('vc', 'feComposite', { in: 'vol', in2: 'SourceAlpha', operator: 'in', result: 'v2' }),
    // gölge bölgesine el çizimi tarama (editoryal illüstrasyon taraması)
    op('sm', 'feComponentTransfer', { in: 'lt', result: 'smk' }, [op('sa', 'feFuncA', { type: 'discrete', tableValues: '1 0 0 0' }), op('sr', 'feFuncR', { type: 'linear', slope: '0', intercept: '0' })]),
    op('hi', 'feImage', { href: HATCH, x: '0', y: '0', width: '5', height: '5', result: 'h1' }),
    op('ht', 'feTile', { in: 'h1', result: 'h2' }),
    op('hc', 'feComposite', { in: 'h2', in2: 'smk', operator: 'in', result: 'h3' }),
    op('hk', 'feComposite', { in: 'h3', in2: 'SourceAlpha', operator: 'in', result: 'hatch' }),
    // kâğıt grenı (ince)
    op('gn', 'feTurbulence', { type: 'fractalNoise', baseFrequency: '0.9', numOctaves: '1', seed: '7', result: 'gr' }),
    op('gc', 'feColorMatrix', { in: 'gr', type: 'matrix', values: '0 0 0 0 0.16  0 0 0 0 0.12  0 0 0 0 0.1  0 0 0 0.32 -0.12', result: 'gk' }),
    op('gi', 'feComposite', { in: 'gk', in2: 'SourceAlpha', operator: 'in', result: 'gm' }),
    op('gm', 'feMerge', { result: 'tex' }, [op('a', 'feMergeNode', { in: 'v2' }), op('b3', 'feMergeNode', { in: 'hatch' }), op('b2', 'feMergeNode', { in: 'gm' })]),
    // mürekkep kontur + kaymış ikinci baskı (sıcak kırmızı, hafif sağ-alt)
    op('e', 'feMorphology', { in: 'SourceAlpha', operator: 'erode', radius: '0.7', result: 'er' }),
    op('d', 'feMorphology', { in: 'er', operator: 'dilate', radius: '1.85', result: 'dl' }),
    op('f', 'feFlood', { 'flood-color': I, result: 'fl' }),
    op('c', 'feComposite', { in: 'fl', in2: 'dl', operator: 'in', result: 'ol' }),
    op('mo', 'feOffset', { in: 'dl', dx: '1.6', dy: '1.2', result: 'mis' }),
    op('mf', 'feFlood', { 'flood-color': '#C8553D', 'flood-opacity': '0.45', result: 'mfl' }),
    op('mc', 'feComposite', { in: 'mfl', in2: 'mis', operator: 'in', result: 'reg' }),
    op('m', 'feMerge', { result: 'mg' }, [op('a', 'feMergeNode', { in: 'reg' }), op('b', 'feMergeNode', { in: 'ol' }), op('c3', 'feMergeNode', { in: 'tex' })]),
    op('t', 'feTurbulence', { type: 'fractalNoise', baseFrequency: '0.07', numOctaves: '2', seed: String(seed), result: 'n' }),
    op('x', 'feDisplacementMap', { in: 'mg', in2: 'n', scale: '1.4', xChannelSelector: 'R', yChannelSelector: 'G' }),
  ])]);
}
// baş gruplarını (yan görünüş) ayrıca döndürür: dönüşte baş gövdeden önce izleyiciye döner
function headTurn(ops, ratio) {
  if (Math.abs(ratio - 1) < 0.002) return ops;
  return ops.map(o => {
    if (o && o.t === 'g' && (o.k === 'head' || o.k === 'headG') && o.a?.transform) {
      const m = /translate\(([-\d.]+)/.exec(o.a.transform); const hx = m ? m[1] : 60;
      return { ...o, a: { ...o.a, transform: `translate(${hx} 0) scale(${r1(ratio * 1000) / 1000} 1) translate(${-hx} 0) ${o.a.transform}` } };
    }
    return o;
  });
}
// ön yüzlü gövdeler (civciv, bitki, baykuş): dönerken yüz gövdenin üstünde kayar — küre döner gibi
function faceSlide(ops, dx, sq) {
  if (!dx && sq === 1) return ops;
  return ops.map(o => {
    if (!o?.kids) return o;
    if (o.k === 'face' && o.t === 'g') return { ...o, a: { ...o.a, transform: `translate(${r1(dx)} 0) translate(60 0) scale(${r1(sq * 1000) / 1000} 1) translate(-60 0)` } };
    return { ...o, kids: faceSlide(o.kids, dx, sq) };
  });
}

// ---------------------------------------------------------------- bir karenin çizimi
// turn: { f: gövde yönü (-1..1), hf: baş yönü, yaw: 0..1 dönüş derinliği, seed }
function frameOps(rig, S, pose, T, uid, turn) {
  const { F, col, k } = S;
  const front = rig === bean;
  let kids = rig.draw(F, pose, col, T, uid);
  const I = col.dark ? '#EFE3CC' : '#2A2230';
  const tk = rig === lizard ? 'scale' : rig === bean ? (F.kind === 'owl' ? 'feather' : F.kind === 'plant' ? 'vein' : 'fluff') : 'fur';
  const texId = uid + 'tx';
  const back = [], fr = [], world = [];
  for (const pr of pose.props || []) (pr.world ? world : pr.back ? back : fr).push(pr);
  const f = turn.f * (pose.spin ?? 1);
  if (front && turn.yaw) kids = faceSlide(kids, -Math.sign(turn.f) * turn.yaw * (F.w || 40) * 0.32, 1 - 0.38 * turn.yaw);
  if (!front) kids = headTurn(kids, turn.hf / (Math.abs(f) < 0.05 ? 0.05 * Math.sign(f || 1) : f));
  const sx = (pose.sx ?? 1) * k, sy = (pose.sy ?? 1) * k;
  const root = op('root', 'g', { transform: `translate(${r1(60 + (pose.rx || 0) * k)} ${r1(G + (pose.ry || 0) * k)}) rotate(${r1(pose.rr || 0)}) scale(${r1(sx * 1000) / 1000} ${r1(sy * 1000) / 1000}) translate(-60 -${G})` },
    ink([...propOps(back, 'pb'), ...kids, ...propOps(fr, 'pf')], I, texId));
  // gölge: yerde kalır, yükseldikçe küçülür; dönüşün ortasında gövde izleyiciye döndüğü için kısalmaz
  const fp = rig.footprint(F, pose);
  const alt = clamp(-(pose.ry || 0) / 45, 0, 0.7);
  const shadow = op('shadow', 'ellipse', { cx: r1(60 + (fp.cx - 60 + (pose.rx || 0)) * k), cy: G + 1.4, rx: r1(fp.w * 0.5 * k * (1 - alt * 0.6) * (pose.sx ?? 1)), ry: r1(2.6 * (1 - alt * 0.5)), fill: '#1f1b24', opacity: r1((0.13 * (1 - alt)) * 100) / 100 });
  const wk = world.length ? [op('world', 'g', { transform: `translate(60 ${G}) scale(${k}) translate(-60 -${G})` }, ink(propOps(world, 'pw'), I))] : [];
  const fs = front ? Math.sign(f || 1) : f;
  const body = op('face', 'g', { transform: Math.abs(fs - 1) < 0.001 ? null : `translate(60 0) scale(${r1(fs * 1000) / 1000} 1) translate(-60 0)` }, [root, ...wk]);
  return [inkFilter(uid + 'ink', '#2A2230', turn.seed), texDefs(texId, tk, I), shadow, op('inkG', 'g', { filter: `url(#${uid}ink)` }, [body])];
}

// ---------------------------------------------------------------- oynatıcı
export class Puppet {
  constructor(host) {
    this.uid = 'pp' + (++uidSeq);
    this.host = host || null;
    this.svg = null;
    this.t = 0; this.ph = 0; this.mode = 'walk';
    this.base = 'idle'; this.baseT = 0;
    this.clip = null; this.clipT = 0; this.clipMs = 0; this.clipName = '';
    this.mood = 'idle';
    this.facing = 1; this.faceCur = 1; this.turnT = 1; this.turnFrom = 1;
    this.fadeFrom = null; this.fadeT = 1; this.fadeDur = 0.22;
    this.last = null;
    this.springs = {};
    this.blinkAt = 1.5 + Math.random() * 2; this.blinkT = -1; this.blinkDouble = false;
    this.lookT = 0; this.lookTarget = 0; this.lookCur = 0;
    this.prevRy = 0; this.prevVy = 0;
    this.species = ''; this.stage = -1; this.coat = 0;
    if (host) {
      this.svg = document.createElementNS(NS, 'svg');
      this.svg.setAttribute('viewBox', '0 0 120 120');
      this.svg.setAttribute('class', 'pet-svg pet-live');
      this.svg.setAttribute('aria-hidden', 'true');
      host.appendChild(this.svg);
    }
  }
  setForm(species, stage, coat = 0) {
    if (species === this.species && stage === this.stage && coat === this.coat) return;
    const first = !this.species;
    this.species = species; this.stage = stage; this.coat = coat;
    this.rig = rigOf(species);
    this.S = this.rig.setup(species, stage, coat);
    // açık tüylü kedi/köpek açık zeminde kaybolmasın: ince kontur (CSS)
    if (this.svg) this.svg.setAttribute('class', 'pet-svg pet-live');
    this.springs = {};
    if (!first) this.fade(0.3);
  }
  setMood(m) { this.mood = m || 'idle'; }
  // türe özel kalıcı hâl (bitkinin canlılığı, kuruluğu, toparlanma eğilimi…): her pozun üstüne yazılır
  setCond(c) { this.cond = c || null; }
  setBase(name) {
    const b = this.rig?.BASES[name] ? name : 'idle';
    if (b === this.base) return;
    this.base = b; this.baseT = 0;
    if (!this.clip) this.fade(b === 'walk' || b === 'run' ? 0.16 : 0.32);
  }
  // tek seferlik klip; ms verilirse en az o kadar sürer (tekrarlanabilirse tekrar eder)
  play(name, ms) {
    const def = this.clipDef(name);
    if (!def) return false;
    this.clip = def; this.clipName = name; this.clipT = 0;
    this.clipMs = Math.max(ms || 0, def.dur * 1000);
    this.fade(name === 'flinch' || name === 'shock' || name === 'poked' ? 0.08 : 0.18);
    return true;
  }
  stop() { if (this.clip) { this.clip = null; this.fade(0.25); } }
  get playing() { return this.clip ? this.clipName : ''; }
  clipDef(name) {
    if (!this.rig) return null;
    const C = this.rig.CLIPS;
    const alias = this.rig.ALIAS?.(name, this.S.F) || name;
    return C[alias] || null;
  }
  fade(d) { if (this.last) { this.fadeFrom = this.last; this.fadeT = 0; this.fadeDur = d; } }
  // yürürken kat edilen ekran mesafesi (px) → adım fazı
  travel(px, mode = 'walk', spritePx = 76) {
    if (!this.S) return;
    this.mode = mode;
    const unitPx = spritePx / 120 * this.S.k;
    this.ph = (this.ph + px / (this.rig.cycleLen(this.S.F, mode) * unitPx)) % 1;
  }
  face(f) {
    f = f < 0 ? -1 : 1;
    if (f === this.facing) return;
    this.turnFrom = Math.sign(this.faceCur) || 1; this.facing = f; this.turnT = 0;
  }
  ctx(T) { return { B: this.S.B, F: this.S.F, t: T, mood: this.mood, ph: this.ph, food: this.rig.food?.(this.S.F) || this.S.F.food || 'fish', stage: this.stage, species: this.species }; }
  pose(dt) {
    const c = this.ctx(this.t);
    const C = this.rig.CLIPS;
    let p;
    if (this.clip) {
      this.clipT += dt;
      const d = this.clip;
      const total = this.clipMs / 1000;
      if (this.clipT >= total) { this.clip = null; this.fade(0.28); }
      else {
        let u = this.clipT / d.dur;
        u = d.rep || d.loop ? u % 1 : Math.min(1, u);
        // yürüyüş/koşu klipleri fazı mesafeden alır; yerinde oynatılınca zamanla ilerler
        if (d.phase) { this.ph = (this.ph + dt * (d === C.run ? 2.2 : 1.4)) % 1; c.ph = this.ph; }
        p = d.f(u, c);
      }
    }
    if (!p) {
      this.baseT += dt;
      const bd = C[this.rig.BASES[this.base]] || C.idle;
      const u = bd.phase ? 0 : (this.baseT / bd.dur) % 1;
      p = this.rig.moodPose(bd.f(u, c), this.base === 'sleep' || this.base === 'dead' ? this.base : this.mood, this.S.F);
    }
    if (this.fadeT < 1) {
      this.fadeT = Math.min(1, this.fadeT + dt / this.fadeDur);
      p = blend(this.fadeFrom, p, EASE.sine(this.fadeT));
    }
    this.last = p;
    return p;
  }
  // yaylar + göz kırpma + bakış
  secondary(p, dt) {
    const o = { ...p };
    const SP = this.rig.SPRINGS, KK = this.rig.KICK || {};
    const vy = dt > 0 ? ((p.ry || 0) - this.prevRy) / dt : 0;
    const ay = dt > 0 ? (vy - this.prevVy) / dt : 0;
    this.prevRy = p.ry || 0; this.prevVy = vy;
    for (const ch in SP) {
      if (typeof p[ch] !== 'number') continue;
      let s = this.springs[ch];
      if (!s) s = this.springs[ch] = new Spring(SP[ch][0], SP[ch][1]);
      if (KK[ch] && dt > 0) s.kick(clamp(ay * KK[ch] * dt, -60, 60));
      o[ch] = s.step(p[ch], dt);
    }
    // göz kırpma (açık gözlerde)
    this.blinkAt -= dt;
    if (this.blinkAt <= 0 && this.blinkT < 0) { this.blinkT = 0; this.blinkDouble = Math.random() < 0.18; }
    let bl = 0;
    if (this.blinkT >= 0) {
      this.blinkT += dt;
      const d = 0.15;
      const q = this.blinkT / d;
      bl = q < 1 ? Math.sin(q * Math.PI) : 0;
      if (this.blinkDouble && q >= 1 && q < 2) bl = Math.sin((q - 1) * Math.PI) * 0.9;
      if (q >= (this.blinkDouble ? 2 : 1)) { this.blinkT = -1; this.blinkAt = 2.2 + Math.random() * 3.8; }
    }
    o.blink = Math.max(o.blink || 0, bl);
    // boşta ara sıra bakış kaydırma
    this.lookT -= dt;
    if (this.lookT <= 0) { this.lookT = 1.5 + Math.random() * 3; this.lookTarget = Math.random() < 0.55 ? 0 : (Math.random() < 0.5 ? -0.7 : 0.7); }
    this.lookCur += (this.lookTarget - this.lookCur) * Math.min(1, dt * 8);
    if (!this.clip && (this.base === 'idle' || this.base === 'sit')) o.look = (o.look || 0) + this.lookCur;
    return o;
  }
  tick(dt) {
    if (!this.S || !this.svg) return;
    dt = Math.min(0.1, Math.max(0, dt));
    this.t += dt;
    // 3B dönüş: önce baş izleyiciye döner, gövde onu izler; gövde ortada çizgiye inmez (önden görünüm)
    if (this.turnT < 1) { this.turnT = Math.min(1, this.turnT + dt / 0.42); }
    const u = EASE.io(this.turnT);
    const hu = EASE.io(clamp(this.turnT * 1.6, 0, 1));
    const side = (q, from, to, min) => { const c = Math.cos(q * Math.PI); return (q < 0.5 ? from : to) * Math.max(min, Math.abs(c)); };
    this.faceCur = this.turnT >= 1 ? this.facing : side(u, this.turnFrom, this.facing, 0.46);
    const hf = this.turnT >= 1 ? this.facing : side(hu, this.turnFrom, this.facing, 0.55);
    const yaw = this.turnT >= 1 ? 0 : Math.sin(u * Math.PI);
    let p = this.secondary(this.pose(dt), dt);
    if (this.cond) p = { ...p, ...this.cond };
    // dönerken ağırlık aktarımı: hafif yükselip yere geri oturur
    if (yaw) { p = { ...p, ry: (p.ry || 0) - 2.2 * yaw, sy: (p.sy ?? 1) * (1 + 0.035 * yaw) }; }
    const seed = 1 + (Math.floor(this.t * 4) % 3);   // retro: yavaş, elle çizilmiş titreme
    sync(this.svg, frameOps(this.rig, this.S, p, this.t, this.uid, { f: this.faceCur, hf, yaw, seed }));
  }
  // anlık durum (yönetici/test için)
  get state() { return { base: this.base, clip: this.clipName && this.clip ? this.clipName : '', mood: this.mood, facing: this.facing }; }
}

// ---------------------------------------------------------------- statik çizim (seçim ekranı, bilgi, panel)
let staticSeq = 0;
export function staticSVG(species, stage, opts = {}) {
  const rig = rigOf(species);
  const S = rig.setup(species, stage, opts.coat || 0);
  const mood = opts.mood || 'idle';
  const clipName = opts.clip || rig.STATIC[opts.pose] || (mood === 'dead' ? 'dead' : mood === 'sleep' ? 'sleep' : mood === 'full' ? 'lie' : 'idle');
  const def = rig.CLIPS[rig.ALIAS?.(clipName, S.F) || clipName] || rig.CLIPS.idle;
  const c = { B: S.B, F: S.F, t: opts.t || 0, mood, ph: 0.15, food: rig.food?.(S.F) || 'fish', stage, species };
  let p = def.f(opts.u ?? 0, c);
  if (['idle', 'sit', 'lie', 'walk'].includes(clipName) || !rig.CLIPS[clipName]) p = rig.moodPose(p, mood, S.F);
  if (opts.belly && rig.belly) p = rig.belly(p, opts.belly, S.F);
  if (opts.cond) p = { ...p, ...opts.cond };
  const uid = 'ps' + (++staticSeq);
  const ops = frameOps(rig, S, p, opts.t || 0, uid, { f: opts.face || 1, hf: opts.face || 1, yaw: 0, seed: 1 + (staticSeq % 4) });
  return `<svg class="pet-svg ${opts.cls || ''}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${str(ops)}</svg>`;
}

// tüm klip adları (test sayfası için)
export const clipNames = species => Object.keys(rigOf(species).CLIPS);
