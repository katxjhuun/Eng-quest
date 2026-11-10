// Pet oynatıcısı: türün iskeletini seçer, klipleri oynatır, geçişleri harmanlar, yaylı ikincil hareketi
// (kuyruk, kulak, yaprak) hesaplar ve SVG'yi her karede yalnızca değişen özniteliklerle günceller.
import * as quad from './quad.js';
import * as bean from './bean.js';
import * as lizard from './lizard.js';
import { blend, Spring, EASE, clamp, r1, TAU } from './anim.js';
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

// ---------------------------------------------------------------- bir karenin çizimi
function frameOps(rig, S, pose, T, uid, face) {
  const { F, col, k } = S;
  const kids = rig.draw(F, pose, col, T, uid);
  const front = [], back = [], world = [];
  for (const pr of pose.props || []) (pr.world ? world : pr.back ? back : front).push(pr);
  const sx = (pose.sx ?? 1) * k, sy = (pose.sy ?? 1) * k;
  const root = op('root', 'g', { transform: `translate(${r1(60 + (pose.rx || 0) * k)} ${r1(G + (pose.ry || 0) * k)}) rotate(${r1(pose.rr || 0)}) scale(${r1(sx * 1000) / 1000} ${r1(sy * 1000) / 1000}) translate(-60 -${G})`, filter: `url(#${uid}gr)` },
    [...propOps(back, 'pb'), ...kids, ...propOps(front, 'pf')]);
  // lo-fi doku: gövdenin üstüne ince, durağan film greni (yalnızca çizili alana)
  const grain = op('grdefs', 'defs', {}, [op('gr', 'filter', { id: uid + 'gr', x: '-5%', y: '-5%', width: '110%', height: '110%', 'color-interpolation-filters': 'sRGB' }, [
    op('t', 'feTurbulence', { type: 'fractalNoise', baseFrequency: '2.4', numOctaves: '1', seed: '7', result: 'n' }),
    op('m', 'feColorMatrix', { in: 'n', type: 'matrix', values: '0 0 0 0 0.16  0 0 0 0 0.13  0 0 0 0 0.12  0 0 0 0.34 -0.14', result: 'g' }),
    op('c', 'feComposite', { in: 'g', in2: 'SourceGraphic', operator: 'in', result: 'gi' }),
    op('o', 'feMerge', {}, [op('a', 'feMergeNode', { in: 'SourceGraphic' }), op('b', 'feMergeNode', { in: 'gi' })]),
  ])]);
  // gölge: yerde kalır, yükseldikçe küçülür
  const fp = rig.footprint(F, pose);
  const alt = clamp(-(pose.ry || 0) / 45, 0, 0.7);
  const shadow = op('shadow', 'ellipse', { cx: r1(60 + (fp.cx - 60 + (pose.rx || 0)) * k), cy: G + 1.4, rx: r1(fp.w * 0.5 * k * (1 - alt * 0.6) * (pose.sx ?? 1)), ry: r1(2.6 * (1 - alt * 0.5)), fill: '#1f1b24', opacity: r1((0.13 * (1 - alt)) * 100) / 100 });
  const f = face * (pose.spin ?? 1);
  const wk = world.length ? [op('world', 'g', { transform: `translate(60 ${G}) scale(${k}) translate(-60 -${G})` }, propOps(world, 'pw'))] : [];
  return [grain, op('face', 'g', { transform: Math.abs(f - 1) < 0.001 ? null : `translate(60 0) scale(${r1(f * 1000) / 1000} 1) translate(-60 0)` }, [shadow, root, ...wk])];
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
    if (this.svg) this.svg.setAttribute('class', `pet-svg pet-live${this.S.col.light ? ' coat-light' : ''}`);
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
    this.turnFrom = this.faceCur; this.facing = f; this.turnT = 0;
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
    if (this.turnT < 1) { this.turnT = Math.min(1, this.turnT + dt / 0.22); }
    const u = EASE.io(this.turnT);
    this.faceCur = this.turnT >= 1 ? this.facing : this.turnFrom + (this.facing - this.turnFrom) * u;
    let p = this.secondary(this.pose(dt), dt);
    if (this.cond) p = { ...p, ...this.cond };
    // dönerken hafif sıçrama
    if (this.turnT < 1) { p = { ...p, ry: (p.ry || 0) - 2.5 * Math.sin(u * Math.PI), sy: (p.sy ?? 1) * (1 + 0.04 * Math.sin(u * Math.PI)) }; }
    const face = Math.abs(this.faceCur) < 0.08 ? 0.08 * Math.sign(this.faceCur || 1) : this.faceCur;
    sync(this.svg, frameOps(this.rig, this.S, p, this.t, this.uid, face));
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
  const ops = frameOps(rig, S, p, opts.t || 0, uid, opts.face || 1);
  return `<svg class="pet-svg ${opts.cls || ''}${S.col.light ? ' coat-light' : ''}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${str(ops)}</svg>`;
}

// tüm klip adları (test sayfası için)
export const clipNames = species => Object.keys(rigOf(species).CLIPS);
