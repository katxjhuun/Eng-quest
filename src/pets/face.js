// Gözler ve ağızlar (lo-fi, yetişkin dili: parıltısız, küçük, kapaklı gözler; allık yok).
//  'dot'  — açık renk gövdede küçük, koyu, hafif kapaklı göz (civciv, bitki)
//  'ring' — kedi/köpek: renkli iris; kedide dikey yarık göz bebeği, köpekte koyu yuvarlak
//  'owl'  — baykuş: iri yuvarlak amber iris, kalın koyu çerçeve
// Her fonksiyon çizim komutları (op) döndürür: { k: anahtar, t: etiket, a: öznitelikler }
import { r1, P, clamp } from './anim.js';

export const op = (k, t, a, kids) => (kids ? { k, t, a, kids } : { k, t, a });

// ruh hali → göz biçimi
export const MOOD_EYE = {
  idle: 'open', happy: 'happy', love: 'happy', eat: 'happy', sad: 'sad', sleep: 'closed', full: 'half',
  groggy: 'half', sleepy: 'half', poked: 'squint', surprised: 'wide', hungry: 'up', focus: 'focus', dead: 'x', angry: 'angry',
};

const stroke = (c, w) => ({ fill: 'none', stroke: c, 'stroke-width': r1(w), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });

// tek göz: merkez (x,y), yarıçap r, d = -1 sol / +1 sağ göz
function eye(fam, k, x, y, r, style, blink, lx, ly, col, d) {
  const W = col.white, PU = col.pupil, LN = col.line;
  const out = [];
  const ring = fam === 'ring';
  // kırpma: göz kapanırken dikey ölçek
  const open = clamp(1 - blink, 0, 1);
  if (open < 0.18 && !['happy', 'closed', 'x', 'squint'].includes(style)) style = 'blinkline';
  switch (style) {
    case 'happy':
      out.push(op(k, 'path', { d: `M${P(x - r, y + r * 0.35)} Q${P(x, y - r * 1.25)} ${P(x + r, y + r * 0.35)}`, ...stroke(LN, r * 0.62) }));
      break;
    case 'closed':
      out.push(op(k, 'path', { d: `M${P(x - r, y - r * 0.05)} Q${P(x, y + r * 0.95)} ${P(x + r, y - r * 0.05)}`, ...stroke(LN, r * 0.55) }));
      break;
    case 'blinkline':
      out.push(op(k, 'path', { d: `M${P(x - r * 0.95, y + r * 0.1)} Q${P(x, y + r * 0.35)} ${P(x + r * 0.95, y + r * 0.1)}`, ...stroke(LN, r * 0.5) }));
      break;
    case 'x':
      out.push(op(k, 'path', { d: `M${P(x - r * 0.8, y - r * 0.8)} L${P(x + r * 0.8, y + r * 0.8)} M${P(x + r * 0.8, y - r * 0.8)} L${P(x - r * 0.8, y + r * 0.8)}`, ...stroke(LN, r * 0.5) }));
      break;
    case 'squint': {
      const s = d < 0 ? 1 : -1; // gözler içe bakan > <
      out.push(op(k, 'path', { d: `M${P(x - r * 0.8 * s, y - r * 0.8)} L${P(x + r * 0.7 * s, y)} L${P(x - r * 0.8 * s, y + r * 0.8)}`, ...stroke(LN, r * 0.52) }));
      break;
    }
    default: {
      // dolu göz: biçime göre üst kapak kesilir
      let lid = 0, tilt = 0, R = r, pr = r * (ring ? 0.56 : 1), px = lx * r * 0.32, py = ly * r * 0.3;
      if (style === 'wide') { R = r * 1.22; pr = ring ? r * 0.3 : r * 0.82; }
      if (style === 'half') { lid = 0.5; py += r * 0.28; }
      // tilt > 0: kapak gözün iç tarafında (buruna yakın) daha aşağı → kararlı/kızgın; < 0: dış tarafta → üzgün
      if (style === 'focus') { lid = 0.3; tilt = -0.2 * d; py += r * 0.15; }
      if (style === 'sad') { lid = 0.3; tilt = 0.45 * d; py += r * 0.3; }
      if (style === 'angry') { lid = 0.36; tilt = -0.48 * d; }
      if (style === 'up') { py -= r * 0.32; }
      const ry = R * open;
      const yy = y + (R - ry) * 0.35;
      // Naif / retro editoryal: krem renkli badem göz, renkli iris, siyah göz bebeği, tek beyaz ışık noktası,
      // kalın üst kapak çizgisi (göz kalemi gibi) ve alt kirpik. İfade kapak eğimi, bakış ve göz bebeği boyutuyla verilir.
      const INK = '#2A2230', SCL = '#F4EAD6';
      const big = fam === 'owl' ? 1.2 : ring ? 1.55 : 1.45;
      const ax = R * big * (fam === 'owl' ? 1 : 1.18), ay = Math.max(0.3, ry * big * (fam === 'owl' ? 1 : 0.86));
      const rot = fam === 'owl' ? 0 : -6 * d;
      const T = rot ? `rotate(${rot} ${r1(x)} ${r1(yy)})` : null;
      const iris = col.iris || (fam === 'dot' ? '#4E6B8A' : '#B8862F');
      out.push(op(k + 'w', 'ellipse', { cx: r1(x), cy: r1(yy), rx: r1(ax), ry: r1(ay), fill: SCL, stroke: INK, 'stroke-width': r1(Math.max(0.35, R * 0.16)), transform: T }));
      if (open > 0.3) {
        const ir = Math.min(ax, ay) * (style === 'wide' ? 0.62 : 0.78);
        const ix = x + px * 0.55, iy = yy + py * 0.45;
        out.push(op(k + 'i', 'circle', { cx: r1(ix), cy: r1(iy), r: r1(ir), fill: iris, stroke: INK, 'stroke-width': r1(Math.max(0.25, R * 0.08)) }));
        // göz bebeği: korkuda/şaşkınlıkta küçülür, sevgide büyür; kedi ve geckoda dikey yarık
        const pk = style === 'wide' ? 0.32 : style === 'happy-open' ? 0.7 : 0.52;
        if (col.slit && style !== 'wide') out.push(op(k + 'p', 'ellipse', { cx: r1(ix), cy: r1(iy), rx: r1(ir * 0.24), ry: r1(ir * 0.86), fill: '#141014' }));
        else out.push(op(k + 'p', 'circle', { cx: r1(ix), cy: r1(iy), r: r1(ir * pk), fill: '#141014' }));
        out.push(op(k + 'h', 'circle', { cx: r1(ix - ir * 0.36), cy: r1(iy - ir * 0.38), r: r1(Math.max(0.35, ir * 0.24)), fill: '#FFFDF6' }));
      }
      // üst kapak çizgisi (göz kalemi) ve dış köşede küçük kirpik
      if (fam !== 'owl') {
        const ux = ax * 1.08;
        out.push(op(k + 'u', 'path', { d: `M${P(x - ux * d, yy + ay * 0.15)} Q${P(x, yy - ay * 1.55)} ${P(x + ux * d, yy - ay * 0.1)} l${r1(ax * 0.32 * d)} ${r1(-ay * 0.3)}`, fill: 'none', stroke: INK, 'stroke-width': r1(Math.max(0.5, R * 0.26)), 'stroke-linecap': 'round', transform: T }));
      }
      if (lid > 0 && open > 0.25) {
        // kapak: gövde renginde bir parça gözün üstünü örter
        const top = yy - ry - 0.6, cut = yy - ry + ry * 2 * lid;
        const yl = cut - tilt * R, yr = cut + tilt * R;
        const E = R * 1.35, tp = yy - ry * 1.4;
        out.push(op(k + 'l', 'path', { d: `M${P(x - E, tp)} L${P(x + E, tp)} L${P(x + E, yr)} L${P(x - E, yl)} Z`, fill: col.lid }));
        out.push(op(k + 'll', 'path', { d: `M${P(x - E * 0.92, yl + tilt * R * 0.08)} L${P(x + E * 0.92, yr - tilt * R * 0.08)}`, fill: 'none', stroke: col.dark ? '#F3EDF6' : '#141016', 'stroke-width': r1(Math.max(0.6, R * 0.22)), 'stroke-linecap': 'round' }));
      }
    }
  }
  return out;
}

// çift göz
export function eyes(fam, x1, x2, y, r, style, blink = 0, lx = 0, ly = 0, col) {
  return [...eye(fam, 'eL', x1, y, r, style, blink, lx, ly, col, -1), ...eye(fam, 'eR', x2, y, r, style, blink, lx, ly, col, 1)];
}

// ağız: open 0..1, kind: 'cat' | 'dog' | 'beak' | 'tiny'
export function mouth(kind, x, y, s, mood, open = 0, tongue = 0, col = {}) {
  const out = [];
  const dark = col.mouth || '#5a2a34';
  if (kind === 'beak') {
    const o = clamp(open, 0, 1) * 4.5 * s;
    out.push(op('bkU', 'path', { d: `M${P(x - 5 * s, y - 0.6 * s)} Q${P(x, y - 4.6 * s)} ${P(x + 5 * s, y - 0.6 * s)} Q${P(x, y + 1.2 * s - o * 0.2)} ${P(x - 5 * s, y - 0.6 * s)} Z`, fill: col.beak || '#F2994A' }));
    out.push(op('bkL', 'path', { d: `M${P(x - 4 * s, y + 0.4 * s)} Q${P(x, y + 4 * s + o)} ${P(x + 4 * s, y + 0.4 * s)} Q${P(x, y + 1 * s)} ${P(x - 4 * s, y + 0.4 * s)} Z`, fill: col.beak2 || '#D9773A' }));
    return out;
  }
  if (open > 0.08) {
    const w = (kind === 'tiny' ? 2.2 : 2.6) * s, h = (0.6 + open * 3) * s;
    out.push(op('mo', 'ellipse', { cx: r1(x), cy: r1(y + h * 0.4), rx: r1(w * (0.7 + open * 0.3)), ry: r1(h), fill: dark }));
    if (tongue > 0.1) out.push(op('tg', 'ellipse', { cx: r1(x + 0.3 * s), cy: r1(y + h * 0.9), rx: r1(w * 0.62), ry: r1(h * 0.55 * tongue + 0.4), fill: '#F27C8E' }));
    return out;
  }
  if (tongue > 0.1) {
    // dil dışarıda (köpek mutlu)
    out.push(op('tg', 'path', { d: `M${P(x - 1.6 * s, y)} C${P(x - 1.8 * s, y + 4.6 * s * tongue)} ${P(x + 2.4 * s, y + 4.8 * s * tongue)} ${P(x + 2.2 * s, y)} Z`, fill: '#F27C8E' }));
    return out;
  }
  if (kind === 'tiny' && col.smile) {
    const c = col.line || '#3a2a30';
    if (['happy', 'love', 'eat'].includes(mood)) out.push(op('mo', 'path', { d: `M${P(x - 2.6 * s, y - 0.5 * s)} Q${P(x, y + 2.6 * s)} ${P(x + 2.6 * s, y - 0.5 * s)}`, ...stroke(c, 1.5 * s) }));
    else if (['sad', 'dead', 'hungry'].includes(mood)) out.push(op('mo', 'path', { d: `M${P(x - 2.4 * s, y + 1.3 * s)} Q${P(x, y - 0.8 * s)} ${P(x + 2.4 * s, y + 1.3 * s)}`, ...stroke(c, 1.4 * s) }));
    else out.push(op('mo', 'path', { d: `M${P(x - 2.4 * s, y)} Q${P(x - 1.2 * s, y + 1.6 * s)} ${P(x, y)} Q${P(x + 1.2 * s, y + 1.6 * s)} ${P(x + 2.4 * s, y)}`, ...stroke(c, 1.3 * s) }));
  }
  return out;
}

// yanak allığı (açık gövdeler)
export function blush(x1, x2, y, s, a = 0.5, c = '#D99A8E') {
  return [op('bl1', 'ellipse', { cx: r1(x1), cy: r1(y), rx: r1(3.6 * s), ry: r1(2.1 * s), fill: c, opacity: a.toFixed(2) }),
    op('bl2', 'ellipse', { cx: r1(x2), cy: r1(y), rx: r1(3.6 * s), ry: r1(2.1 * s), fill: c, opacity: a.toFixed(2) })];
}
