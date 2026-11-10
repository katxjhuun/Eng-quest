// dam-la — pet motoru (geometrik editoryal çizimler için, sıfırdan)
// Çizimler figs.js'teki parça ağaçlarıdır; bu dosya onları oynatır. Kayma yok: yürüyen petin ayakları kat edilen yola
// göre yere basar (adım uzunluğu = bacak boyu × salınım açısından hesaplanır), yürüyemeyen pet zıplar ve yalnızca
// havadayken ilerler (yerdeyken çizim, sayfadaki konum ilerlemesine karşı geri kaydırılır).
// Dış arayüz eski Puppet ile aynıdır: setForm, setMood, setCond, setBase, play, stop, travel, face, tick, playing, staticSVG.

import { FIGS } from './figs.js';

const NS = 'http://www.w3.org/2000/svg';
const GROUND = 188, MIDX = 100;
const STAGE_K = [0.8, 0.85, 0.9, 0.94, 0.97, 1];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const r2 = v => Math.round(v * 100) / 100;
const TAU = Math.PI * 2;
const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const bell = u => Math.sin(Math.PI * clamp(u, 0, 1));          // 0 → 1 → 0
const env = (u, a = 0.15, b = 0.2) => clamp(Math.min(u / a, (1 - u) / b), 0, 1);  // giriş/çıkış zarfı
let uidSeq = 0;

// ---------------------------------------------------------------- isim → hareket fiili
// Uygulamanın kullandığı tüm klip adları burada bir fiile bağlanır.
const VERB = {
  idle: 'none', sit: 'none', home: 'none',
  happy: 'hop', love: 'hop', hop: 'hop', note: 'hop', star: 'hop', chase: 'hop', play: 'hop', petals: 'look', mirror: 'look', photo: 'bask', bask: 'bask',
  eat: 'eat', peck: 'eat', hungry: 'sad', sad: 'sad', cry: 'cry', groggy: 'doze', doze: 'doze', sleepy: 'doze',
  angry: 'lunge', bite: 'bite', snap: 'bite', knock: 'swat', swat: 'swat', pounce: 'pounce', guard: 'guard', protect: 'guard',
  surprised: 'jump', poked: 'jump', shock: 'jump', flinch: 'jump', freeze: 'freeze',
  look: 'look', headturn: 'headturn', focus: 'focus', sniff: 'sniff', coffee: 'sip',
  groom: 'groom', lick: 'lick', tongue: 'tongue', stretch: 'stretch', shake: 'shake', roll: 'roll', dig: 'dig', tailwave: 'tailwave',
  ability: 'ability', rub: 'rub', cuddle: 'rub', full: 'none', lie: 'none', sleep: 'none', dead: 'none', wake: 'jump', flee: 'none',
};
const DUR = { hop: 1.2, eat: 1.6, sad: 2, cry: 2.2, doze: 2.6, lunge: 0.9, bite: 0.8, swat: 0.8, pounce: 1.2, guard: 2, jump: 0.7, freeze: 2.4, look: 1.7,
  headturn: 2.4, focus: 2, sniff: 1.8, sip: 3, groom: 2.6, lick: 1.8, tongue: 1.4, stretch: 2, shake: 1.2, roll: 1.4, dig: 1.6, tailwave: 2.4, ability: 1.6, rub: 1.6, bask: 3.6, none: 1 };
export const clipNames = () => Object.keys(VERB);

// ---------------------------------------------------------------- çizim
function coatSwap(s, def, coat) {
  if (!def.fur || !def.coats || !coat) return s;
  const c = def.coats[coat % def.coats.length];
  return s.split(def.fur[0]).join(c[0]).split(def.fur[1]).join(c[1]);
}
function tf(p, ch) {
  if (!ch) return '';
  const { r = 0, x = 0, y = 0, sx = 1, sy = 1 } = ch;
  if (!r && !x && !y && sx === 1 && sy === 1) return '';
  const [px, py] = p;
  let s = '';
  if (x || y) s += `translate(${r2(x)} ${r2(y)}) `;
  if (r) s += `rotate(${r2(r)} ${px} ${py}) `;
  if (sx !== 1 || sy !== 1) s += `translate(${px} ${py}) scale(${r2(sx * 1000) / 1000} ${r2(sy * 1000) / 1000}) translate(${-px} ${-py})`;
  return s.trim();
}
function partsHTML(list, stage, def, coat, pose) {
  let out = '';
  for (const pt of list) {
    if (pt.min > stage) continue;
    const ch = pose?.[pt.k], t = tf(pt.p, ch);
    out += `<g data-k="${pt.k}"${t ? ` transform="${t}"` : ''}${ch?.o != null ? ` opacity="${r2(ch.o)}"` : ''}>${coatSwap(pt.s, def, coat)}${partsHTML(pt.kids, stage, def, coat, pose)}</g>`;
  }
  return out;
}
function filterDefs(id) {
  return `<defs><filter id="${id}" x="-4%" y="-4%" width="108%" height="108%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.5" xChannelSelector="R" yChannelSelector="G" result="w"/>
<feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="3" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0.93 0 0 0 0 0.89 0 0 0 0 0.8 0 0 0 0.9 -0.52" result="sp"/>
<feComposite in="sp" in2="w" operator="in" result="sq"/><feMerge><feMergeNode in="w"/><feMergeNode in="sq"/></feMerge></filter></defs>`;
}
function viewOf(def, base) {
  const v = def.views;
  if ((base === 'walk' || base === 'run') && v.walk) return 'walk';
  if ((base === 'sleep' || base === 'lie' || base === 'dead') && v.sleep) return 'sleep';
  return 'sit';
}

// ---------------------------------------------------------------- poz hesabı
// st: { def, view, t, base, clip, clipT, clipDur, mood, ph, gaitMode, faceCur, hf, yaw, blink, look, k, dir }
function computePose(st) {
  const { def, view, t, base, mood } = st;
  const pose = {};
  const A = (k, c) => {
    const o = pose[k] || (pose[k] = { r: 0, x: 0, y: 0, sx: 1, sy: 1 });
    if (c.r) o.r += c.r; if (c.x) o.x += c.x; if (c.y) o.y += c.y;
    if (c.sx) o.sx *= c.sx; if (c.sy) o.sy *= c.sy; if (c.o != null) o.o = c.o;
  };
  const side = view === 'walk' ? true : def.side;          // yan görünüş mü (baş dönüşü yön işareti)
  const verb = st.clip ? VERB[st.clip] || 'none' : 'none';
  const cu = st.clip ? clamp(st.clipT / st.clipDur, 0, 1) : 0, cT = st.clipT || 0, ce = st.clip ? env(cu) : 0;
  const moving = base === 'walk' || base === 'run';
  const asleep = base === 'sleep' || base === 'dead' || mood === 'sleep';
  const frozen = verb === 'freeze' || base === 'dead';
  let outer = { x: 0, y: 0 };

  // --- göz kapağı (ruh hâli + göz kırpma)
  const LID = { idle: 0, happy: 0.3, love: 0.35, sad: 0.45, hungry: 0.35, cry: 0.55, groggy: 0.65, sleepy: 0.65, focus: 0.3, angry: 0.4, surprised: 0, full: 0.5, sleep: 1, dead: 1, bored: 0.4 };
  let lidV = asleep ? 1 : (LID[mood] ?? 0);
  if (verb === 'doze') lidV = Math.max(lidV, 0.55 + 0.45 * bell(cu));
  if (verb === 'jump' || verb === 'guard') lidV = 0;
  if (verb === 'bask') lidV = Math.max(lidV, 0.6);
  if (!asleep) lidV = Math.max(lidV, st.blink);
  const [lo, lc] = def.lid || [0, 1];
  const lidSy = lerp(lo, lc, lidV);
  for (const k of st.keys) {
    if (k.startsWith('lid')) A(k, { sy: Math.max(0.001, lidSy) });
    if (k.startsWith('pup')) A(k, { x: st.look * 1.6, y: (verb === 'look' || verb === 'headturn' ? -0.6 : 0) + (mood === 'sad' ? 0.8 : 0), ...(mood === 'surprised' || verb === 'jump' ? { sx: 0.75, sy: 0.75 } : {}) });
  }

  // --- nefes
  const br = asleep ? 0.03 * Math.sin(t * 1.4) : 0.014 * Math.sin(t * 2.1);
  if (base !== 'dead') A('body', { sy: 1 + br, sx: 1 + br * 0.4 });

  // --- yürüyüş / koşu (ayaklar yolla eşlenir) ya da zıplama
  if (moving) {
    const ph = st.ph, run = base === 'run';
    if (def.gait === 'walk') {
      // duruş/salınım döngüsü: duruşta ayak yerde sabit (gövde hızıyla geriye kayar), bacak boyu açıya göre uzar;
      // salınımda ayak kalkar ve öne gelir.
      const g = gaitDims(def, run), L = def.leg;
      const offs = run ? { legNB: 0, legFB: 0.1, legNF: 0.5, legFF: 0.6 } : { legNB: 0, legFF: 0, legNF: 0.5, legFB: 0.5 };
      for (const [k, o] of Object.entries(offs)) {
        const q = (ph + o) % 1;
        let xr, lift = 0;
        if (q < g.beta) xr = g.S / 2 - g.S * (q / g.beta);
        else { const sw = (q - g.beta) / (1 - g.beta); xr = -g.S / 2 + g.S * ease(sw); lift = bell(sw); }
        const a = Math.asin(clamp(xr / L, -0.95, 0.95));
        A(k, { r: -a * 180 / Math.PI, sy: (1 / Math.cos(a)) * (1 - (run ? 0.3 : 0.22) * lift) });
      }
      const bob = Math.abs(Math.sin(TAU * ph)) * (run ? 3 : 1.4);
      A('root', { y: -bob });
      A('head', { r: (run ? 3 : 1.5) * Math.sin(TAU * ph * 2) });
      A('tail', { r: (run ? 10 : 6) * Math.sin(TAU * ph) });
      if (run) A('body', { r: 2.5 * Math.sin(TAU * ph) });
    } else {
      // zıplama: yerde (u<.28) çömelir, havada ilerler
      const u = ph, air = u > 0.28 ? bell((u - 0.28) / 0.72) : 0, ground = u <= 0.28 ? bell(u / 0.28) : 0;
      const h = run ? 20 : 13;
      A('root', { y: -air * h, sy: 1 - 0.1 * ground + 0.05 * air, sx: 1 + 0.08 * ground - 0.03 * air });
      A('wingL', { r: -34 * air }); A('wingR', { r: (def.side ? -24 : 34) * air });
      A('head', { y: 2 * ground });
      // görsel ilerleme ↔ gerçek ilerleme farkı: yerdeyken geride tut
      const v = u <= 0.28 ? 0 : ease((u - 0.28) / 0.72);
      const L = (run ? 1.4 : 1) * def.hop * st.k;
      outer = { x: (v - u) * L * st.dir[0], y: (v - u) * L * st.dir[1] };
    }
  } else if (!asleep && !frozen && !st.clip) {
    idlePersonality(def, st, A, t, mood, side);
  }

  // --- ruh hâli duruşu (yerinde)
  if (!moving && base !== 'dead') {
    if (mood === 'sad' || mood === 'hungry' || mood === 'cry') { A('head', side ? { r: 7, y: 2 } : { y: 4 }); A('earL', { r: -14 }); A('earR', { r: 14 }); A('tail', { r: 10 }); A('wingL', { r: 4 }); A('wingR', { r: -4 }); }
    if (mood === 'happy' || mood === 'love') { A('tail', { r: -6 + 7 * Math.sin(t * 7) }); A('earL', { r: -3 }); A('earR', { r: 3 }); A('head', side ? { r: -3 } : { r: 4 * Math.sin(t * 1.2) }); }
    if (mood === 'angry') { A('earL', { r: side ? -22 : -24 }); A('earR', { r: side ? -22 : 24 }); A('head', side ? { r: 4, y: 2 } : { y: 3 }); A('tail', { r: 3 * Math.sin(t * 14) }); }
    if (mood === 'groggy' || mood === 'sleepy') A('head', side ? { r: 4 + 3 * Math.sin(t * 0.8), y: 1 } : { y: 2 + 1.5 * Math.sin(t * 0.8), r: 3 * Math.sin(t * 0.5) });
    if (mood === 'focus') A('head', side ? { r: -2 } : {});
    if (mood === 'full') A('body', { sx: 1.04 });
  }
  if (asleep && base !== 'dead') { A('head', side ? { r: 9, y: 3 } : { y: 6 }); A('earL', { r: -8 }); A('earR', { r: 8 }); A('wingL', { r: 3 }); A('wingR', { r: -3 }); }
  if (base === 'dead') { A('root', { sy: 0.95 }); A('head', side ? { r: 14, y: 5 } : { y: 8, r: 8 }); A('earL', { r: -20 }); A('earR', { r: 20 }); A('tail', { r: 18 }); }

  // --- tek seferlik hareketler
  const hd = side ? 1 : 0;   // yan görünüşte baş eğme yönü
  switch (verb) {
    case 'hop': { const n = 2, q = (cu * n) % 1, a = bell(q); A('root', { y: -14 * a, sy: 1 - 0.07 * bell(q < 0.2 ? q / 0.2 : 0) }); A('tail', { r: -8 + 10 * Math.sin(cT * 16) }); A('earL', { r: -6 * a }); A('earR', { r: 6 * a }); A('wingL', { r: -28 * a }); A('wingR', { r: 28 * a }); A('head', { r: (hd ? -5 : 6 * Math.sin(cT * 6)) * ce }); break; }
    case 'eat': { const peck = Math.pow(Math.abs(Math.sin(cT * 7)), 2); A('head', side ? { r: (18 + 10 * peck) * ce, y: 6 * ce } : { y: (8 + 5 * peck) * ce }); A('jaw', { r: 14 * peck * ce, y: peck * ce }); A('tail', { r: 6 * Math.sin(cT * 9) * ce }); break; }
    case 'sad': case 'cry': { A('head', side ? { r: 10 * ce, y: 3 * ce } : { y: 6 * ce }); A('earL', { r: -16 * ce }); A('earR', { r: 16 * ce }); A('root', { sy: 1 - 0.04 * ce }); if (verb === 'cry') A('body', { x: 0.8 * Math.sin(cT * 30) * ce }); break; }
    case 'doze': { A('head', side ? { r: 10 * bell(cu) } : { y: 7 * bell(cu) }); break; }
    case 'lunge': case 'bite': case 'pounce': {
      const k = verb === 'pounce' ? 1.4 : 1, wind = cu < 0.35 ? bell(cu / 0.7) : 0, hit = cu >= 0.35 ? bell((cu - 0.35) / 0.65) : 0;
      A('root', { x: (side ? 10 * hit - 4 * wind : 0) * k, y: (verb === 'pounce' ? -16 * hit : 0) + 3 * wind, sy: 1 - 0.06 * wind });
      A('head', side ? { r: -6 * hit + 3 * Math.sin(cT * 30) * hit } : { y: -4 * hit, sx: 1 + 0.06 * hit, sy: 1 + 0.06 * hit });
      A('jaw', { r: 22 * hit, y: 2 * hit }); A('earL', { r: -24 * ce }); A('earR', { r: side ? -24 * ce : 24 * ce }); break;
    }
    case 'swat': { const a = bell(cu); A('paw', { r: -55 * a, y: -6 * a }); A('legNF', { r: -60 * a }); A('head', { r: hd ? -4 * a : 0 }); A('earL', { r: -10 * a }); break; }
    case 'guard': { A('root', { sy: 1 + 0.05 * ce, y: -2 * ce }); A('head', side ? { r: -6 * ce } : { y: -3 * ce }); A('earL', { r: 6 * ce }); A('earR', { r: -6 * ce }); A('tail', { r: -12 * ce }); A('wingL', { r: -22 * ce }); A('wingR', { r: 22 * ce }); break; }
    case 'jump': { const a = bell(cu); A('root', { y: -16 * a, sy: 1 + 0.06 * a }); A('earL', { r: 10 * a }); A('earR', { r: -10 * a }); A('wingL', { r: -40 * a }); A('wingR', { r: 40 * a }); A('tail', { r: -16 * a }); break; }
    case 'freeze': { A('root', { sy: 1.02 }); break; }
    case 'look': case 'petals': { A('head', side ? { r: -10 * Math.sin(cu * TAU) * ce } : { r: 12 * Math.sin(cu * TAU) * ce }); break; }
    case 'headturn': { A('head', { r: 26 * Math.sin(cu * TAU) * ce }); break; }
    case 'focus': { A('head', side ? { r: -4 * ce } : { y: -2 * ce }); break; }
    case 'sniff': { A('head', side ? { r: (12 + 4 * Math.sin(cT * 22)) * ce, y: 4 * ce } : { y: (5 + 1.5 * Math.sin(cT * 22)) * ce }); A('nose', { sx: 1 + 0.15 * Math.abs(Math.sin(cT * 22)) * ce }); break; }
    case 'sip': { A('head', side ? { r: -8 * bell(cu) } : { r: -6 * bell(cu), y: -2 * bell(cu) }); A('wingR', { r: 30 * bell(cu) }); break; }
    case 'groom': case 'lick': { A('head', side ? { r: 26 * ce, y: 8 * ce } : { y: 8 * ce, r: 10 * ce }); A('jaw', { r: 16 * Math.abs(Math.sin(cT * 10)) * ce }); A('paw', { r: -30 * ce }); A('tongue', { sx: 1 + Math.abs(Math.sin(cT * 10)) * ce }); A('lick', { o: verb === 'lick' ? ce : 0, y: 4 * Math.sin(cT * 12) }); break; }
    case 'tongue': { const a = cu > 0.3 && cu < 0.6 ? 1 : 0; A('tongue', { sx: 1 + 1.4 * a }); A('head', { r: -4 * ce }); break; }
    case 'stretch': { const a = bell(cu); A('body', { sx: 1 + 0.1 * a, sy: 1 - 0.06 * a }); A('head', side ? { r: -10 * a } : { y: -4 * a }); A('tail', { r: -18 * a }); A('wingL', { r: -50 * a }); A('wingR', { r: 50 * a }); A('legNF', { r: -20 * a }); A('legFF', { r: -20 * a }); break; }
    case 'shake': { const a = (1 - cu) * Math.sin(cT * 34); A('root', { r: 7 * a }); A('earL', { r: 12 * a }); A('earR', { r: -12 * a }); A('tail', { r: 14 * a }); break; }
    case 'roll': { A('root', { r: 360 * ease(cu) * (side ? 1 : 0), y: -10 * bell(cu) }); if (!side) A('root', { sx: Math.cos(cu * TAU) }); break; }
    case 'dig': { const a = Math.abs(Math.sin(cT * 16)) * ce; A('head', side ? { r: 18 * ce, y: 6 * ce } : { y: 7 * ce }); A('paw', { r: -28 * a }); A('legNF', { r: -36 * a }); A('root', { y: a }); break; }
    case 'tailwave': { A('tail', { r: 16 * Math.sin(cT * 4) * ce }); break; }
    case 'bask': { A('head', side ? { r: -8 * ce } : { y: -2 * ce }); A('body', { sy: 1 - 0.02 * ce }); break; }
    case 'rub': { A('root', { r: (side ? 0 : 5) * Math.sin(cT * 5) * ce, x: (side ? 3 : 0) * Math.sin(cT * 5) * ce }); A('head', { r: (side ? 8 : 10) * Math.sin(cT * 5) * ce }); A('tail', { r: -10 * ce }); break; }
    case 'ability': {
      const a = bell(cu);
      A('root', { y: -8 * a, sy: 1 + 0.04 * a }); A('wingL', { r: -60 * a }); A('wingR', { r: 60 * a }); A('tongue', { sx: 1 + 2 * a });
      A('bud', { sx: 1 + 0.5 * a, sy: 1 + 0.5 * a }); A('head', side ? { r: -12 * a } : { y: -6 * a }); A('earL', { r: -8 * a }); A('earR', { r: 8 * a }); A('tail', { r: -20 * a });
      break;
    }
  }

  // --- 3B dönüş (yan görünüş): baş gövdeden önce döner
  if (side || view === 'walk') {
    A('root', { sx: st.faceCur });
    if (Math.abs(st.faceCur) > 0.05 && Math.abs(st.hf - st.faceCur) > 0.002) A('head', { sx: st.hf / st.faceCur });
    if (st.yaw) A('root', { y: -2 * st.yaw });
  }
  pose.__outer = outer;
  return pose;
}

// yürüyüş ölçüleri: S = duruşta ayağın gövdeye göre süpürdüğü yol, beta = duruş oranı, D = bir döngüde gövdenin aldığı yol
function gaitDims(def, run) {
  const amp = (def.amp || 22) * (run ? 1.45 : 1) * Math.PI / 180, beta = run ? 0.45 : 0.62;
  const S = 2 * def.leg * Math.sin(amp);
  return { S, beta, D: S / beta };
}
// kişiliğe göre bekleme hareketleri (tasarım animasyonlarından)
function idlePersonality(def, st, A, t, mood, side) {
  const sp = st.species;
  const cyc = (period, a, b) => { const q = (t % period) / period; return q >= a && q <= b ? bell((q - a) / (b - a)) : 0; };
  if (sp === 'cat') {
    A('tail', { r: -6 * Math.sin(t * 1.2) + 3 * Math.sin(t * 2.7) });
    const nose = cyc(9, 0.18, 0.55); A('head', { r: -6 * nose, y: -2 * nose });
    A('earR', { r: 14 * cyc(7, 0.61, 0.66) }); A('wsk', { r: -3 * Math.sin(t * 1.6) });
  } else if (sp === 'dog') {
    A('tail', { r: -12 * cyc(3.2, 0.6, 0.76) - 9 * cyc(3.2, 0.78, 0.92) });
    A('chest', { sx: 1 + 0.03 * Math.sin(t * 1.5), sy: 1 + 0.03 * Math.sin(t * 1.5) });
    A('head', { r: -7 * cyc(10, 0.3, 0.56), y: -4 * cyc(10, 0.66, 0.9) });
    A('earL', { r: -9 * cyc(6, 0.4, 0.56) }); A('earR', { r: 9 * cyc(6, 0.62, 0.78) });
  } else if (sp === 'chick') {
    const pk = cyc(3.4, 0.4, 0.75); A('head', { r: 14 * pk - 6 * cyc(3.4, 0.25, 0.42), x: 3 * pk, y: 2 * pk });
    A('jaw', { r: 16 * cyc(3.4, 0.52, 0.66) }); A('tuft', { r: 6 * Math.sin(t * 3.7) });
    A('wingR', { r: -14 * cyc(3.4, 0.1, 0.3) }); A('root', { r: 2 * Math.sin(t * 2.2) });
  } else if (sp === 'owl') {
    A('body', { r: 1.6 * Math.sin(t * 1.05) });
    const tl = cyc(11, 0.2, 0.42), tr = cyc(11, 0.44, 0.62); A('head', { r: -11 * tl + 9 * tr });
    st.lookBias = -tl + tr;
    A('earL', { y: -3 * cyc(8, 0.7, 0.9) }); A('earR', { y: -3 * cyc(8, 0.7, 0.9) });
  } else if (sp === 'gecko') {
    A('tail', { r: 4 * Math.sin(t * 0.7) });
    A('jaw', { sy: 1 + 0.3 * Math.abs(Math.sin(t * 2.2)) });
    const tg = cyc(6, 0.3, 0.38); A('tongue', { sx: 1 + 1.2 * (tg > 0.2 ? 1 : 0) });
    const lk = cyc(12, 0.86, 0.94); A('lick', { o: lk > 0.05 ? 1 : 0, y: 6 * Math.sin(t * 14) * lk });
    const turn = cyc(12, 0.62, 0.82); A('head', { r: -9 * turn }); A('pup', { sx: 1 + 1.2 * turn });
  } else if (sp === 'plant') {
    A('body', { r: 1.4 * Math.sin(t * 0.7) });
    A('wingR', { r: 5 * Math.sin(t * 0.7) }); A('wingL', { r: -2 * Math.sin(t * 0.7) });
    A('bud', { sx: 1 + 0.08 * Math.sin(t * 1.25), sy: 1 + 0.08 * Math.sin(t * 1.25) });
  }
}

// ---------------------------------------------------------------- canlı pet
export class Puppet {
  constructor(host) {
    this.uid = 'fg' + (++uidSeq);
    this.host = host || null;
    this.t = 0; this.ph = 0; this.dir = [1, 0]; this.mode = 'walk';
    this.base = 'idle'; this.clip = ''; this.clipT = 0; this.clipDur = 1; this.clipMs = 0;
    this.mood = 'idle'; this.cond = null;
    this.facing = 1; this.faceCur = 1; this.turnT = 1; this.turnFrom = 1;
    this.blinkAt = 2; this.blinkT = -1; this.look = 0; this.lookTo = 0; this.lookAt = 1;
    this.species = ''; this.stage = -1; this.coat = 0; this.view = '';
    this.els = {}; this.parts = {};
    if (host) {
      this.svg = document.createElementNS(NS, 'svg');
      this.svg.setAttribute('viewBox', '0 0 200 200');
      this.svg.setAttribute('class', 'pet-svg pet-live');
      this.svg.setAttribute('aria-hidden', 'true');
      host.appendChild(this.svg);
    }
  }
  setForm(species, stage, coat = 0) {
    if (!FIGS[species]) species = 'chick';
    if (species === this.species && stage === this.stage && coat === this.coat) return;
    this.species = species; this.stage = clamp(stage | 0, 0, 5); this.coat = coat | 0;
    this.def = FIGS[species]; this.k = STAGE_K[this.stage];
    this.view = ''; this.build();
  }
  build() {
    if (!this.svg || !this.def) return;
    const v = viewOf(this.def, this.base);
    if (v === this.view && this.svg.firstChild) return;
    this.view = v;
    const list = this.def.views[v]();
    this.parts = {};
    const walk = l => l.forEach(p => { this.parts[p.k] = p; walk(p.kids); });
    walk(list);
    this.svg.innerHTML = `${filterDefs(this.uid + 'g')}<ellipse data-k="shadow" cx="${MIDX}" cy="${GROUND + 1}" rx="${46 * this.k}" ry="4" fill="#1E1B1C" opacity=".14"/><g data-k="outer"><g data-k="root" filter="url(#${this.uid}g)">${partsHTML(list, this.stage, this.def, this.coat)}</g></g>`;
    this.els = {};
    this.svg.querySelectorAll('[data-k]').forEach(el => { this.els[el.dataset.k] = el; });
    this.keys = Object.keys(this.parts);
  }
  setMood(m) { this.mood = m || 'idle'; }
  setCond(c) { this.cond = c || null; }
  setBase(name) {
    const b = ['idle', 'sit', 'walk', 'run', 'sleep', 'lie', 'dead', 'home', 'full'].includes(name) ? name : 'idle';
    if (b === this.base) return;
    this.base = b;
    if (b !== 'walk' && b !== 'run') this.ph = 0;
    this.build();
  }
  play(name, ms) {
    const verb = VERB[name];
    if (!verb) return false;
    this.clip = name; this.clipT = 0;
    this.clipDur = DUR[verb] || 1.2;
    this.clipMs = Math.max(ms || 0, this.clipDur * 1000);
    return true;
  }
  stop() { this.clip = ''; }
  get playing() { return this.clip; }
  // yürürken kat edilen yol (px) → adım fazı. dx,dy: hareket yönü (birim vektör)
  travel(px, mode = 'walk', spritePx = 132, dx, dy) {
    if (!this.def) return;
    this.mode = mode;
    if (dx != null) { const m = Math.hypot(dx, dy) || 1; this.dir = [dx / m, dy / m]; }
    const units = px * 200 / spritePx;           // dış koordinat birimi
    const run = mode === 'run';
    let cycle;
    if (this.def.gait === 'walk') cycle = gaitDims(this.def, run).D * this.k;   // ayak yerde sabit kalır
    else cycle = (run ? 1.4 : 1) * this.def.hop * this.k;
    this.ph = (this.ph + units / Math.max(1, cycle)) % 1;
  }
  face(f) {
    f = f < 0 ? -1 : 1;
    if (f === this.facing) return;
    this.turnFrom = Math.sign(this.faceCur) || 1; this.facing = f; this.turnT = 0;
  }
  state(dt) {
    // göz kırpma ve bakış
    this.blinkAt -= dt;
    if (this.blinkAt <= 0 && this.blinkT < 0) { this.blinkT = 0; this.blinkAt = 2.4 + Math.random() * 4.5; }
    let blink = 0;
    if (this.blinkT >= 0) { this.blinkT += dt; blink = bell(this.blinkT / 0.18); if (this.blinkT > 0.18) this.blinkT = -1; }
    this.lookAt -= dt;
    if (this.lookAt <= 0) { this.lookTo = Math.random() < 0.4 ? 0 : (Math.random() * 2 - 1); this.lookAt = 1.4 + Math.random() * 3; }
    this.look += (this.lookTo - this.look) * Math.min(1, dt * 6);
    // dönüş
    if (this.turnT < 1) this.turnT = Math.min(1, this.turnT + dt / 0.4);
    const u = ease(this.turnT), hu = ease(clamp(this.turnT * 1.6, 0, 1));
    const side = (q, from, to, min) => (q < 0.5 ? from : to) * Math.max(min, Math.abs(Math.cos(q * Math.PI)));
    this.faceCur = this.turnT >= 1 ? this.facing : side(u, this.turnFrom, this.facing, 0.32);
    const hf = this.turnT >= 1 ? this.facing : side(hu, this.turnFrom, this.facing, 0.45);
    return { def: this.def, species: this.species, view: this.view, keys: this.keys, t: this.t, base: this.base, mood: this.mood,
      clip: this.clip, clipT: this.clipT, clipDur: this.clipDur, ph: this.ph, faceCur: this.faceCur, hf, yaw: this.turnT < 1 ? Math.sin(u * Math.PI) : 0,
      blink, look: this.look, k: this.k, dir: this.dir };
  }
  tick(dt) {
    if (!this.def || !this.svg) return;
    dt = clamp(dt, 0, 0.1);
    this.t += dt;
    if (this.clip) { this.clipT += dt; if (this.clipT * 1000 >= this.clipMs) this.clip = ''; else if (this.clipT >= this.clipDur && this.clipMs > this.clipDur * 1000) this.clipT -= this.clipDur * 0.999; }
    const st = this.state(dt);
    const pose = computePose(st);
    if (st.lookBias) for (const k of this.keys) if (k.startsWith('pup')) { pose[k] = pose[k] || { r: 0, x: 0, y: 0, sx: 1, sy: 1 }; pose[k].x += st.lookBias * 2.5; }
    this.apply(pose);
  }
  apply(pose) {
    const k = this.k;
    const root = pose.root || {};
    // kök: evre ölçeği + yön + gövde hareketi, yer çizgisine göre
    const rx = (root.x || 0) * k, ry = (root.y || 0) * k;
    const sx = (root.sx ?? 1) * k, sy = (root.sy ?? 1) * k;
    this.els.root?.setAttribute('transform', `translate(${r2(rx)} ${r2(ry)}) translate(${MIDX} ${GROUND}) rotate(${r2(root.r || 0)}) scale(${r2(sx * 1000) / 1000} ${r2(sy * 1000) / 1000}) translate(${-MIDX} ${-GROUND})`);
    const o = pose.__outer || { x: 0, y: 0 };
    this.els.outer?.setAttribute('transform', o.x || o.y ? `translate(${r2(o.x)} ${r2(o.y)})` : '');
    const air = clamp(-(root.y || 0) / 30, 0, 0.6);
    if (this.els.shadow) { this.els.shadow.setAttribute('rx', r2(46 * k * (1 - air * 0.5))); this.els.shadow.setAttribute('cx', r2(MIDX + o.x)); }
    for (const key of this.keys) {
      const el = this.els[key]; if (!el) continue;
      const ch = pose[key], t = tf(this.parts[key].p, ch);
      if (el._t !== t) { el._t = t; t ? el.setAttribute('transform', t) : el.removeAttribute('transform'); }
      const op = ch?.o;
      if (el._o !== op) { el._o = op; op == null ? el.removeAttribute('opacity') : el.setAttribute('opacity', r2(op)); }
    }
    this.svg.classList.toggle('is-dead', this.base === 'dead');
  }
}

// ---------------------------------------------------------------- statik çizim (seçim, bilgi, panel, ölüm)
let staticSeq = 0;
export function staticSVG(species, stage, opts = {}) {
  if (!FIGS[species]) species = 'chick';
  const def = FIGS[species];
  stage = clamp(stage | 0, 0, 5);
  const mood = opts.mood || 'idle';
  const base = mood === 'dead' ? 'dead' : mood === 'sleep' ? 'sleep' : (opts.pose === 'lie' || opts.pose === 'flat' || mood === 'full') ? 'lie' : 'idle';
  const view = viewOf(def, base);
  const list = def.views[view]();
  const keys = []; const walk = l => l.forEach(p => { keys.push(p.k); walk(p.kids); }); walk(list);
  const k = STAGE_K[stage];
  const pose = computePose({ def, species, view, keys, t: opts.t || 0.6, base, mood, clip: '', clipT: 0, clipDur: 1, ph: 0, faceCur: opts.face || 1, hf: opts.face || 1, yaw: 0, blink: 0, look: 0, k, dir: [1, 0] });
  const root = pose.root || {};
  const id = 'fs' + (++staticSeq);
  const rt = `translate(${MIDX} ${GROUND}) scale(${r2((root.sx ?? 1) * k * 1000) / 1000} ${r2((root.sy ?? 1) * k * 1000) / 1000}) translate(${-MIDX} ${-GROUND})`;
  return `<svg class="pet-svg ${opts.cls || ''}${base === 'dead' ? ' is-dead' : ''}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${filterDefs(id)}<ellipse cx="${MIDX}" cy="${GROUND + 1}" rx="${r2(46 * k)}" ry="4" fill="#1E1B1C" opacity=".14"/><g transform="${rt}" filter="url(#${id})">${partsHTML(list, stage, def, opts.coat | 0, pose)}</g></svg>`;
}
