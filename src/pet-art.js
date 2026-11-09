// dam-la petleri — tamamen özgün, kodla çizilmiş SVG karakterler.
// 5 tür × 6 evrim aşaması; yüz ifadeleri (ruh hali) ve süsler aynı çizim sisteminden üretilir.
// Koordinat sistemi: viewBox 0 0 120 120, zemin y≈110, gövde merkezi x=60.
import { quadSVG } from './pet-quad.js';

const OL = '#2b2230';           // çizgi rengi
const SW = 3.2;                 // çizgi kalınlığı
const BK = '#221d29';           // siluet rengi
let uidSeq = 0;

const st = (fill, extra = '') => `fill="${fill}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round"${extra}`;
const ln = (color = OL, w = SW) => `fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const E = (cx, cy, rx, ry, a) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${a}/>`;
const C = (cx, cy, r, a) => `<circle cx="${cx}" cy="${cy}" r="${r}" ${a}/>`;
const P = (d, a) => `<path d="${d}" ${a}/>`;

// ---------------------------------------------------------------- yüz
// style: 'dot' (yuvarlak siyah göz) | 'sil' (siyah gövdede beyaz göz)
function eyes(x, y, s, mood, style, look = 0, col = {}) {
  const g = 9.5 * s; // göz aralığı yarısı
  const L = x - g, R = x + g;
  const W = '#fff';
  const pair = fn => fn(L, -1) + fn(R, 1);
  if (style === 'dot') {
    switch (mood) {
      case 'happy': case 'love': case 'eat':
        return pair(ex => P(`M${ex - 4 * s} ${y + 1.5 * s} Q${ex} ${y - 4.5 * s} ${ex + 4 * s} ${y + 1.5 * s}`, ln(OL, 2.8 * s)));
      case 'full':
        return pair(ex => P(`M${ex - 4 * s} ${y - 1 * s} Q${ex} ${y + 3.5 * s} ${ex + 4 * s} ${y - 1 * s}`, ln(OL, 2.8 * s)));
      case 'sleep':
        return pair(ex => P(`M${ex - 4 * s} ${y} Q${ex} ${y + 3 * s} ${ex + 4 * s} ${y}`, ln(OL, 2.6 * s)));
      case 'groggy': case 'sleepy':
        return pair(ex => E(ex, y + 1.4 * s, 3.1 * s, 2 * s, `fill="${OL}"`) + P(`M${ex - 4.4 * s} ${y + 0.2 * s} L${ex + 4.4 * s} ${y + 0.2 * s}`, ln(OL, 2.4 * s)));
      case 'poked':
        return P(`M${L - 4 * s} ${y - 3.5 * s} L${L + 3 * s} ${y} L${L - 4 * s} ${y + 3.5 * s}`, ln(OL, 2.8 * s)) + P(`M${R + 4 * s} ${y - 3.5 * s} L${R - 3 * s} ${y} L${R + 4 * s} ${y + 3.5 * s}`, ln(OL, 2.8 * s));
      case 'dead':
        return pair(ex => P(`M${ex - 3.5 * s} ${y - 3.5 * s} L${ex + 3.5 * s} ${y + 3.5 * s} M${ex + 3.5 * s} ${y - 3.5 * s} L${ex - 3.5 * s} ${y + 3.5 * s}`, ln(OL, 2.6 * s)));
      case 'surprised':
        return pair(ex => E(ex, y, 4.2 * s, 5 * s, `fill="#fff" stroke="${OL}" stroke-width="${2.2 * s}"`) + C(ex, y, 1.9 * s, `fill="${OL}"`));
      case 'focus':
        return pair((ex, d) => E(ex, y + 0.6 * s, 3 * s, 3.4 * s, `fill="${OL}"`) + C(ex + 1 * s, y - 0.8 * s, 1 * s, `fill="#fff"`) + P(`M${ex - 4.5 * s * d} ${y - 4.2 * s} L${ex + 4 * s * d} ${y - 6.8 * s}`, ln(OL, 2.4 * s)));
      case 'sad':
        return pair((ex, d) => E(ex, y + 0.8 * s, 3 * s, 3.4 * s, `fill="${OL}"`) + C(ex + 1 * s, y - 0.4 * s, 1 * s, `fill="#fff"`) + P(`M${ex - 4.2 * s * d} ${y - 6.8 * s} L${ex + 3.6 * s * d} ${y - 4.2 * s}`, ln(OL, 2.2 * s)));
      default: { // idle / hungry
        const ly = mood === 'hungry' ? -1.6 * s : 0;
        return pair(ex => E(ex + look * 1.2 * s, y + ly, 3.1 * s, 3.7 * s, `fill="${OL}"`) + C(ex + look * 1.2 * s + 1.1 * s, y + ly - 1.3 * s, 1.15 * s, `fill="#fff"`));
      }
    }
  }
  // siluet (beyaz göz)
  const r = 6.2 * s, SC = col.white || '#fff', PU = col.pupil || BK, LN = col.line || '#fff';
  switch (mood) {
    case 'happy': case 'love': case 'eat':
      return pair(ex => P(`M${ex - 5 * s} ${y + 2 * s} Q${ex} ${y - 6 * s} ${ex + 5 * s} ${y + 2 * s}`, ln(LN, 3.4 * s)));
    case 'full':
      return pair(ex => P(`M${ex - 5 * s} ${y - 1 * s} Q${ex} ${y + 5 * s} ${ex + 5 * s} ${y - 1 * s}`, ln(LN, 3.2 * s)));
    case 'sleep':
      return pair(ex => P(`M${ex - 5 * s} ${y + 1 * s} Q${ex} ${y + 4.5 * s} ${ex + 5 * s} ${y + 1 * s}`, ln(LN, 3 * s)));
    case 'groggy': case 'sleepy':
      return pair(ex => P(`M${ex - r} ${y} A${r} ${r} 0 0 0 ${ex + r} ${y} Z`, `fill="${SC}"`) + C(ex, y + 2.6 * s, 2.3 * s, `fill="${PU}"`));
    case 'focus':
      return pair((ex, d) => P(`M${ex - r} ${y - 1 * s} L${ex + r} ${y - 1 * s - 2.4 * s * d * -1} A${r} ${r} 0 0 1 ${ex - r} ${y - 1 * s} Z`, `fill="${SC}"`) + C(ex, y + 2 * s, 2.4 * s, `fill="${PU}"`));
    case 'poked':
      return P(`M${L - 5 * s} ${y - 4.5 * s} L${L + 4 * s} ${y} L${L - 5 * s} ${y + 4.5 * s}`, ln(LN, 3.2 * s)) + P(`M${R + 5 * s} ${y - 4.5 * s} L${R - 4 * s} ${y} L${R + 5 * s} ${y + 4.5 * s}`, ln(LN, 3.2 * s));
    case 'dead':
      return pair(ex => P(`M${ex - 4.5 * s} ${y - 4.5 * s} L${ex + 4.5 * s} ${y + 4.5 * s} M${ex + 4.5 * s} ${y - 4.5 * s} L${ex - 4.5 * s} ${y + 4.5 * s}`, ln(LN, 3 * s)));
    case 'surprised':
      return pair(ex => C(ex, y, r * 1.18, `fill="${SC}"`) + C(ex, y, 1.8 * s, `fill="${PU}"`));
    case 'sad':
      return pair(ex => C(ex, y, r, `fill="${SC}"`) + C(ex, y + 2.6 * s, 2.6 * s, `fill="${PU}"`));
    default: {
      const py = mood === 'hungry' ? -2.4 * s : 0;
      return pair(ex => C(ex, y, r, `fill="${SC}"`) + C(ex + look * 2 * s, y + py, 2.7 * s, `fill="${PU}"`));
    }
  }
}

function mouth(x, y, s, mood, type, color = OL) {
  if (type === 'beak') {
    const open = ['happy', 'love', 'eat', 'surprised', 'poked', 'hungry'].includes(mood);
    if (open) return P(`M${x - 5.5 * s} ${y - 1 * s} Q${x} ${y - 5.5 * s} ${x + 5.5 * s} ${y - 1 * s} Z`, `fill="#F2994A"`) + P(`M${x - 4.5 * s} ${y + 0.6 * s} Q${x} ${y + 6 * s} ${x + 4.5 * s} ${y + 0.6 * s} Z`, `fill="#D9773A"`);
    return P(`M${x - 5.5 * s} ${y - 1.5 * s} Q${x} ${y - 4 * s} ${x + 5.5 * s} ${y - 1.5 * s} Q${x} ${y + 4.5 * s} ${x - 5.5 * s} ${y - 1.5 * s} Z`, `fill="#F2994A"`);
  }
  if (type === 'tiny') {
    const mc = color === OL ? '#3a2a30' : color;
    if (mood === 'happy' || mood === 'love' || mood === 'eat') return P(`M${x - 2.6 * s} ${y - 0.6 * s} Q${x} ${y + 2.6 * s} ${x + 2.6 * s} ${y - 0.6 * s}`, ln(mc, 1.7 * s));
    if (mood === 'surprised' || mood === 'poked') return E(x, y + 0.4 * s, 1.6 * s, 2.1 * s, `fill="${mc}"`);
    if (mood === 'sad' || mood === 'dead') return P(`M${x - 2.6 * s} ${y + 1.4 * s} Q${x} ${y - 1 * s} ${x + 2.6 * s} ${y + 1.4 * s}`, ln(mc, 1.6 * s));
    if (mood === 'hungry') return P(`M${x - 2 * s} ${y} L${x + 2 * s} ${y}`, ln(mc, 1.5 * s)) + P(`M${x + 2 * s} ${y + 1 * s} q1 3.5 0 5.5`, ln('#7cc6f5', 1.5 * s));
    return '';
  }
  if (type === 'none') {
    const mc = color === OL ? '#fff' : color;
    if (mood === 'happy' || mood === 'love' || mood === 'eat') return P(`M${x - 3.5 * s} ${y} Q${x - 1.7 * s} ${y + 2.5 * s} ${x} ${y} Q${x + 1.7 * s} ${y + 2.5 * s} ${x + 3.5 * s} ${y}`, ln(mc, 2 * s));
    if (mood === 'surprised' || mood === 'poked') return E(x, y + 1 * s, 2 * s, 2.6 * s, `fill="${mc}"`);
    if (mood === 'hungry') return P(`M${x - 3 * s} ${y} Q${x} ${y + 2 * s} ${x + 3 * s} ${y}`, ln(mc, 1.8 * s)) + P(`M${x + 2 * s} ${y + 1 * s} q1 4 0 6`, ln('#7cc6f5', 1.8 * s));
    if (mood === 'sad') return P(`M${x - 3 * s} ${y + 2 * s} Q${x} ${y - 1 * s} ${x + 3 * s} ${y + 2 * s}`, ln(mc, 1.8 * s));
    return color === OL ? '' : P(`M${x - 3 * s} ${y} Q${x - 1.5 * s} ${y + 2 * s} ${x} ${y} Q${x + 1.5 * s} ${y + 2 * s} ${x + 3 * s} ${y}`, ln(mc, 1.6 * s));
  }
  switch (mood) {
    case 'happy': case 'love':
      return P(`M${x - 4.5 * s} ${y - 1 * s} Q${x} ${y + 6.5 * s} ${x + 4.5 * s} ${y - 1 * s} Z`, st('#E55B6B', ` stroke-width="${2.2 * s}"`));
    case 'eat':
      return E(x, y + 1 * s, 3.6 * s, 2.6 * s, st('#E55B6B', ` stroke-width="${2.2 * s}"`));
    case 'sad': case 'dead':
      return P(`M${x - 4 * s} ${y + 2 * s} Q${x} ${y - 2 * s} ${x + 4 * s} ${y + 2 * s}`, ln(color, 2.2 * s));
    case 'surprised': case 'poked':
      return E(x, y + 1 * s, 2.6 * s, 3.2 * s, st('#E55B6B', ` stroke-width="${2 * s}"`));
    case 'sleep': case 'groggy': case 'sleepy':
      return E(x, y + 1 * s, 1.8 * s, 2.2 * s, st('#E55B6B', ` stroke-width="${1.8 * s}"`));
    case 'hungry':
      return P(`M${x - 4 * s} ${y} Q${x} ${y + 3 * s} ${x + 4 * s} ${y}`, ln(color, 2.2 * s)) + P(`M${x + 2.6 * s} ${y + 1.6 * s} q1.2 4 0 6.5`, ln('#7cc6f5', 2 * s));
    case 'focus':
      return P(`M${x - 3.5 * s} ${y + 1 * s} L${x + 3.5 * s} ${y + 1 * s}`, ln(color, 2.4 * s));
    default:
      return P(`M${x - 4 * s} ${y} Q${x - 2 * s} ${y + 3 * s} ${x} ${y} Q${x + 2 * s} ${y + 3 * s} ${x + 4 * s} ${y}`, ln(color, 2.2 * s));
  }
}

function cheeks(x, y, s, mood, color = '#FF9FA8') {
  const o = mood === 'love' || mood === 'poked' ? 0.85 : 0.5;
  return E(x - 15 * s, y + 5 * s, 4.4 * s, 2.6 * s, `fill="${color}" opacity="${o}"`) + E(x + 15 * s, y + 5 * s, 4.4 * s, 2.6 * s, `fill="${color}" opacity="${o}"`);
}

// --------------------------------------------------------------- türler
// Her aşama: { body (yüzün arkası), front (yüzün önü), face:{x,y,s}, style, mouth, cheek }
const SPECIES = {
  // ---------------------------------------------------------------- civciv → tavus kuşu
  chick: {
    label: 'Civciv', home: 'nest',
    stages: ['Yumurtacık', 'Pıtırcık', 'Tombiş', 'Kanatçık', 'Tavus Yavrusu', 'Tavus Kuşu'],
    draw(stage, u) {
      const f = c => `fill="${c}"`;
      const ORANGE = '#F2994A';
      const feet = (y = 108, dx = 10) => E(60 - dx, y, 6.5, 3, f(ORANGE)) + E(60 + dx, y, 6.5, 3, f(ORANGE));
      const legs = (c = ORANGE) => `<line x1="52" y1="100" x2="50" y2="107" ${ln(c, 3)}/><line x1="68" y1="100" x2="70" y2="107" ${ln(c, 3)}/>`;
      const dark = { white: '#fff', pupil: '#1f1b24', line: '#1f1b24' };
      if (stage === 0) return { // kabuktan bakan civciv, şapka gibi duran kabuk parçası
        body: feet(109, 9) + C(60, 56, 21, f('#FFD54A')) + E(52, 64, 5, 3, f('#FFE58C')) +
          P('M30 68 L36 62 L42 69 L49 61 L55 68 L61 60 L67 68 L73 61 L79 68 L85 62 L90 68 C92 92 80 108 60 108 C40 108 28 92 30 68 Z', f('#F6EBD8')) +
          P('M33 80 C35 96 46 104 58 105', ln('#E9D9BF', 3)) + E(76, 84, 3.4, 2.4, f('#E9D9BF')) + E(46, 92, 2.4, 1.8, f('#E9D9BF')) + E(70, 98, 2, 1.5, f('#E9D9BF')) +
          `<g class="p-leaf"><g transform="rotate(-14 60 34)">${P('M41 40 C42 26 51 18 61 18 C71 18 79 26 80 39 L74 34 L69 40 L63 33 L57 40 L51 33 L46 39 Z', f('#F6EBD8'))}${E(54, 26, 2.6, 1.8, f('#E9D9BF'))}</g></g>`,
        face: { x: 60, y: 51, s: 0.8 }, style: 'dot', mouth: 'beak', cheek: true,
      };
      if (stage === 1) return {
        body: feet() + C(60, 78, 30, f('#FFD54A')) + E(60, 90, 17, 12, f('#FFE58C')) +
          `<g class="p-leaf">${P('M55 48 C52 38 58 35 60 41 C61 34 68 35 65 47 Z', f('#FFD54A'))}</g>` + P('M88 74 C98 74 99 86 89 88 Z', f('#F5C232')),
        face: { x: 60, y: 74, s: 1 }, style: 'dot', mouth: 'beak', cheek: true,
      };
      if (stage === 2) return {
        body: feet(108, 13) + E(60, 76, 36, 32, f('#FFD54A')) + E(60, 90, 21, 13, f('#FFE58C')) +
          `<g class="p-leaf">${P('M51 46 C47 34 55 31 56 39 C56 28 66 28 64 39 C68 31 76 34 69 46 Z', f('#FFD54A'))}</g>` +
          P('M26 70 C14 72 14 88 28 88 Z', f('#F5C232')) + P('M94 70 C106 72 106 88 92 88 Z', f('#F5C232')),
        face: { x: 60, y: 72, s: 1.05 }, style: 'dot', mouth: 'beak', cheek: true,
      };
      // tavus tepeliği: ince saplar ve yuvarlak uçlar
      const crest = (c1, c2, y = 38) => `<g class="p-leaf">${[-8, 0, 8].map(dx => `<line x1="60" y1="${y + 6}" x2="${60 + dx}" y2="${y - 8 + Math.abs(dx) * 0.4}" ${ln(c1, 1.8)}/>` + E(60 + dx, y - 10 + Math.abs(dx) * 0.4, 2.8, 3.6, f(c2))).join('')}</g>`;
      // tavus tüyü: yeşil tüy, sarı-mavi göz lekesi
      const plume = (n, spread, R, cy, rx, ry, cG = '#3BA55C') => Array.from({ length: n }, (_, k) => {
        const a = -90 + (k - (n - 1) / 2) * spread, rad = a * Math.PI / 180, x = 60 + Math.cos(rad) * R, y = cy + Math.sin(rad) * R;
        const X = x.toFixed(1), Y = y.toFixed(1), Y2 = (y - ry * 0.27).toFixed(1);
        return `<g transform="rotate(${(a + 90).toFixed(1)} ${X} ${Y})">${`<line x1="${X}" y1="${(y + ry).toFixed(1)}" x2="${X}" y2="${(y + R * 0.55).toFixed(1)}" ${ln('#2F7D4A', 1.6)}/>`}${E(X, Y, rx, ry, f(cG))}${E(X, Y2, rx * 0.56, ry * 0.4, f('#E8C84A'))}${E(X, Y2, rx * 0.38, ry * 0.28, f('#1E7FA8'))}${C(X, (y - ry * 0.3).toFixed(1), rx * 0.2, f('#1B3F8F'))}</g>`;
      }).join('');
      if (stage === 3) return { // Kanatçık: tombiş civciv, ilk tavus tüyleri çıkıyor
        body: `<g class="p-fan">${plume(5, 24, 46, 90, 6.6, 12.5)}</g>` + feet(108, 12) +
          E(60, 76, 33, 31, f('#FFD54A')) + E(60, 89, 19, 12, f('#FFE58C')) +
          P('M28 70 C16 72 15 88 29 90 C31 84 31 76 28 70 Z', f('#F5C232')) + P('M92 70 C104 72 105 88 91 90 C89 84 89 76 92 70 Z', f('#F5C232')) +
          P('M22 84 C18 86 18 90 23 90 Z M98 84 C102 86 102 90 97 90 Z', f('#3FA3B5')) +
          crest('#2F8F9A', '#3FA3B5', 42),
        face: { x: 60, y: 70, s: 1.02 }, style: 'dot', mouth: 'beak', cheek: true,
      };
      if (stage === 4) return { // Tavus Yavrusu: küçük, yarı açık kuyruk
        body: `<g class="p-fan">${plume(7, 19, 38, 84, 7.2, 13)}</g>` + legs('#8C8C98') + feet(109, 10) +
          E(60, 82, 22, 24, f('#4A86DA')) + E(60, 93, 12, 9, f('#6A9FE6')) +
          P('M38 74 C29 82 32 98 43 98 C41 89 41 81 45 76 Z', f('#C29858')) + P('M82 74 C91 82 88 98 77 98 C79 89 79 81 75 76 Z', f('#C29858')) +
          C(60, 59, 16.5, f('#4A86DA')) + P('M49 66 C54 72 66 72 71 66 C66 69 54 69 49 66 Z', f('#3FA3B5')) + crest('#2E6FB8', '#3FA3B5', 38),
        face: { x: 60, y: 59, s: 0.88 }, style: 'sil', mouth: 'beak', eye: dark,
      };
      // 5: tavus kuşu, açılmış kuyruk
      const fan = Array.from({ length: 11 }, (_, k) => {
        const a = -90 + (k - 5) * 15, rad = a * Math.PI / 180, x = 60 + Math.cos(rad) * 44, y = 82 + Math.sin(rad) * 44;
        return `<g transform="rotate(${a + 90} ${x.toFixed(1)} ${y.toFixed(1)})">${E(x.toFixed(1), y.toFixed(1), 9, 15, f('#3BA55C'))}${E(x.toFixed(1), (y - 4).toFixed(1), 5, 6, f('#E8C84A'))}${E(x.toFixed(1), (y - 4).toFixed(1), 3.4, 4.2, f('#1E7FA8'))}${C(x.toFixed(1), (y - 4.5).toFixed(1), 1.8, f('#1B3F8F'))}</g>`;
      }).join('');
      return {
        body: `<g class="p-fan">${fan}</g>` + legs('#8C8C98') + feet(109, 11) +
          E(60, 80, 24, 27, f('#2E6FD1')) + E(60, 92, 13, 10, f('#4A8BE0')) +
          P('M36 72 C26 80 30 98 42 98 C40 88 40 80 44 74 Z', f('#B88A4A')) + P('M84 72 C94 80 90 98 78 98 C80 88 80 80 76 74 Z', f('#B88A4A')) +
          C(60, 56, 17, f('#2E6FD1')) + crest('#1E5DB8', '#2F9FC8', 34),
        face: { x: 60, y: 56, s: 0.9 }, style: 'sil', mouth: 'beak', eye: dark,
      };
    },
  },

  // ---------------------------------------------------------------- bitki: tohum → filiz → papatya → lale → kaktüs → ağaç
  // sade yüz (küçük göz, ağız yalnızca duygu anında), botanik çizgiler, yumuşak tonlar
  plant: {
    label: 'Bitki', home: 'pot',
    stages: ['Tohumcuk', 'Filizcik', 'Papatya', 'Lale', 'Kaktüs', 'Ulu Ağaç'],
    draw(stage, u) {
      const f = c => `fill="${c}"`;
      const LF = '#7DB872', LF2 = '#5C9A5A', VEIN = '#4E8A4E';
      const leaf = (x, y, rot, sc = 1, c = LF, v = VEIN) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})">${P('M0 0 C7 -10 22 -12 27 -4 C21 6 7 6 0 0 Z', f(c))}${P('M2 -0.5 C10 -3 18 -4.5 24 -4', ln(v, 1.3))}</g>`;
      const roots = (c, y = 106, dx = 9) => E(60 - dx, y, 5.5, 3.2, f(c)) + E(60 + dx, y, 5.5, 3.2, f(c));
      if (stage === 0) return { // toprakta yarı gömülü tohum
        body: E(60, 107, 34, 5.5, f('#8A6A4E')) + E(38, 106, 2, 1.4, f('#A88868')) + E(84, 107, 2.4, 1.5, f('#A88868')) +
          P('M60 56 C75 60 83 76 81 90 C79 102 70 107 60 107 C50 107 41 102 39 90 C37 76 45 60 60 56 Z', f('#B07A4A')) +
          P('M60 57 C55 70 54 90 58 106', ln('#9A6638', 1.6)) + E(50, 76, 3.2, 7, f('#C9935F')) +
          P('M60 56 C59 49 61 45 65 43', ln(LF2, 2.4)) + `<g class="p-leaf">${leaf(64.5, 43.5, -38, 0.42)}</g>`,
        face: { x: 61, y: 86, s: 0.72 }, style: 'sil', mouth: 'tiny', mouthColor: '#5a3a1e', eye: { pupil: '#3a2412', line: '#f6e6d2' },
      };
      if (stage === 1) return { // filiz: yumuşak soğancık gövde, iki yaprak
        body: roots('#C9D7A6') + P('M60 50 C77 50 86 66 86 82 C86 97 75 106 60 106 C45 106 34 97 34 82 C34 66 43 50 60 50 Z', f('#E6EDC9')) +
          P('M40 92 C46 102 56 105 66 104', ln('#D3DFAF', 3)) +
          `<line x1="60" y1="51" x2="60" y2="36" ${ln(LF2, 2.8)}/>` + `<g class="p-leaf">${leaf(60, 37, -152, 0.85)}${leaf(60, 37, -28, 0.95)}</g>`,
        face: { x: 60, y: 80, s: 0.82 }, style: 'dot', mouth: 'tiny',
      };
      if (stage === 2) return { // papatya: ince sap, iki kat taç yaprak, yüz göbekte
        body: roots(LF2, 107, 7) + P('M60 106 C59 96 61 88 60 78', ln(LF2, 4)) + `<g class="p-leaf">${leaf(59, 96, -160, 0.72)}${leaf(61, 90, -22, 0.78)}</g>` +
          `<g class="p-leaf">${Array.from({ length: 13 }, (_, k) => `<g transform="rotate(${k * 360 / 13 + 14} 60 52)">${E(60, 29, 5.6, 13, f('#EFE8DA'))}</g>`).join('')}` +
          `${Array.from({ length: 13 }, (_, k) => `<g transform="rotate(${k * 360 / 13} 60 52)">${E(60, 30, 5.4, 12.5, f('#FFFDF7'))}${P('M60 21 L60 37', ln('#EFE8DA', 1))}</g>`).join('')}</g>` +
          C(60, 52, 17, f('#F2BE45')) + C(60, 52, 13.5, f('#F7CB55')) +
          Array.from({ length: 10 }, (_, k) => { const a = k * 36 * Math.PI / 180; return C((60 + Math.cos(a) * 15).toFixed(1), (52 + Math.sin(a) * 15).toFixed(1), 0.9, f('#D9A030')); }).join(''),
        face: { x: 60, y: 51, s: 0.78 }, style: 'dot', mouth: 'tiny',
      };
      if (stage === 3) return { // lale: üç katlı çanak
        body: roots(LF2, 107, 7) + P('M60 106 L60 92', ln(LF2, 4)) +
          `<g class="p-leaf">${P('M58 105 C42 101 32 86 34 66 C44 78 52 90 58 105 Z', f(LF))}${P('M58 104 C48 96 41 84 38 72', ln(VEIN, 1.2))}${P('M62 105 C78 101 88 86 86 66 C76 78 68 90 62 105 Z', f(LF2))}</g>` +
          P('M36 52 C34 78 44 95 60 95 C76 95 86 78 84 52 C78 58 72 58 68 48 C64 56 56 56 52 48 C48 58 42 58 36 52 Z', f('#D9505E')) +
          P('M44 50 C42 74 48 92 60 95 C72 92 78 74 76 50 C70 56 64 52 60 40 C56 52 50 56 44 50 Z', f('#EC6B78')) +
          P('M53 60 C52 74 54 86 58 92', ln('#F49AA3', 2)),
        face: { x: 60, y: 74, s: 0.82 }, style: 'dot', mouth: 'tiny', mouthColor: '#5a1520',
      };
      if (stage === 4) return { // kaktüs: saksıda, oluklu gövde, tepede çiçek
        body: P('M38 95 L82 95 L78 112 L42 112 Z', f('#C9785A')) + P('M35 90 L85 90 L85 97 L35 97 Z', f('#D98B6C')) + E(60, 90.5, 24, 2.6, f('#7A5A40')) +
          P('M47 76 C36 76 31 70 31 56', `fill="none" stroke="#5E9E62" stroke-width="8.5" stroke-linecap="round"`) + P('M73 70 C84 70 89 64 89 51', `fill="none" stroke="#5E9E62" stroke-width="8.5" stroke-linecap="round"`) +
          P('M43 91 C41 68 43 47 60 40 C77 47 79 68 77 91 Z', f('#6BAF6E')) +
          P('M52 46 C49 60 49 76 50 90 M68 46 C71 60 71 76 70 90', ln('#5A9C5E', 1.6)) +
          [[47, 56], [73, 54], [46, 82], [74, 80], [31, 62], [89, 58], [60, 88]].map(([x, y]) => P(`M${x - 1.6} ${y} l3.2 0 M${x} ${y - 1.6} l0 3.2`, ln('#E8F2D8', 1))).join('') +
          `<g class="p-leaf">${[0, 72, 144, 216, 288].map(a => `<g transform="rotate(${a} 60 37)">${E(60, 30.5, 3.8, 6.4, f('#F28BB0'))}</g>`).join('')}${C(60, 37, 3.4, f('#F7D466'))}</g>`,
        face: { x: 60, y: 68, s: 0.82 }, style: 'dot', mouth: 'tiny',
      };
      return { // ulu ağaç: katmanlı taç, gövdede sade yüz
        body: P('M42 106 C36 108 30 109 27 108 M78 106 C84 108 90 109 93 108', ln('#7E5434', 3.2)) +
          P('M44 70 C42 90 41 103 36 108 L84 108 C79 103 78 90 76 70 Z', f('#94653F')) + P('M52 78 C51 90 52 100 50 106 M68 78 C69 90 68 100 70 106', ln('#80542F', 1.8)) +
          C(34, 50, 19, f('#4E8F55')) + C(86, 50, 19, f('#4E8F55')) + C(60, 66, 20, f('#4E8F55')) +
          C(40, 40, 18, f('#65A866')) + C(80, 40, 18, f('#65A866')) + C(60, 30, 22, f('#7DBB72')) + C(48, 56, 13, f('#65A866')) + C(72, 56, 13, f('#65A866')) +
          C(56, 22, 8, f('#93CB86')) + C(74, 30, 6, f('#93CB86')) +
          [[38, 36], [52, 18], [70, 20], [84, 40], [62, 44], [44, 58], [78, 58], [28, 52], [92, 50]].map(([x, y], k) => C(x, y, k % 3 ? 2.6 : 3.2, f(k % 2 ? '#F6C6D6' : '#EFA3BD')) + C(x, y, 0.9, f('#FFE58A'))).join(''),
        face: { x: 60, y: 86, s: 0.8 }, style: 'sil', mouth: 'tiny', mouthColor: '#4a2c14', eye: { pupil: '#2a1a0c', line: '#f3e2cc' },
      };
    },
  },

  // kedi ve köpek: yandan görünen, poz verebilen karakterler (pet-quad.js)
  cat: { label: 'Kedi', home: 'cushion', quad: true, stages: ['Minnoş', 'Tekir', 'Vaşak', 'Puma', 'Leopar', 'Kara Panter'] },
  dog: { label: 'Köpek', home: 'house', quad: true, stages: ['Tosbik', 'Hav', 'Çoban', 'Genç Kurt', 'Kurt', 'Alfa Kurt'] },
};

// ------------------------------------------------------------- süsler
function decor(mood, f, opts) {
  const { x, y, s } = f;
  let out = '';
  if (mood === 'sad') out += `<g class="p-tears">${P(`M${x - 10 * s} ${y + 4 * s} C${x - 12 * s} ${y + 12 * s} ${x - 9 * s} ${y + 22 * s} ${x - 11 * s} ${y + 30 * s}`, ln('#7CC6F5', 3.4 * s))}${P(`M${x + 10 * s} ${y + 4 * s} C${x + 12 * s} ${y + 12 * s} ${x + 9 * s} ${y + 22 * s} ${x + 11 * s} ${y + 30 * s}`, ln('#7CC6F5', 3.4 * s))}</g>`;
  if (mood === 'poked') out += P(`M${x + 18 * s} ${y - 20 * s} l3 -5 l3 5 M${x + 21 * s} ${y - 14 * s} l6 -2 M${x + 15 * s} ${y - 14 * s} l-6 -2`, ln('#E5534B', 2.4));
  if (mood === 'hungry' || mood === 'flee') out += P(`M${x + 22 * s} ${y - 12 * s} C${x + 26 * s} ${y - 4 * s} ${x + 18 * s} ${y - 2 * s} ${x + 20 * s} ${y - 10 * s} Z`, `fill="#9FDCFF"`);
  if (mood === 'focus') out += P(`M${x - 24 * s} ${y - 12 * s} Q${x} ${y - 18 * s} ${x + 24 * s} ${y - 12 * s} L${x + 24 * s} ${y - 6 * s} Q${x} ${y - 12 * s} ${x - 24 * s} ${y - 6 * s} Z`, `fill="#E5534B"`) + P(`M${x + 24 * s} ${y - 9 * s} l9 -5 l-2 7 l8 2 l-9 2 Z`, `fill="#E5534B"`);
  if (mood === 'love') out += [[x - 26 * s, y - 16 * s, 1], [x + 25 * s, y - 22 * s, 0.8]].map(([hx, hy, k]) => P(`M${hx} ${hy + 4 * k} C${hx - 7 * k} ${hy - 1 * k} ${hx - 3 * k} ${hy - 7 * k} ${hx} ${hy - 3 * k} C${hx + 3 * k} ${hy - 7 * k} ${hx + 7 * k} ${hy - 1 * k} ${hx} ${hy + 4 * k} Z`, `fill="#FF6B8A"`)).join('');
  if (mood === 'dead') out += E(x, y - 30 * s, 14 * s, 4 * s, `fill="none" stroke="#FFD86B" stroke-width="3"`);
  return out;
}

// Dışarıya açılan çizim fonksiyonu.
// opts: { mood, belly (0..1), look (-1..1), size }
export function petSVG(species, stage, opts = {}) {
  if (!Object.prototype.hasOwnProperty.call(SPECIES, species)) species = 'chick';
  const sp = SPECIES[species];
  stage = Math.max(0, Math.min(5, stage | 0));
  const mood = opts.mood || 'idle';
  const u = `${species[0]}${stage}${++uidSeq}`;
  if (sp.quad) return quadSVG(species, stage, opts, u);
  const d = sp.draw(stage, u);
  const f = d.face;
  const belly = Math.max(0, Math.min(1, opts.belly || 0));
  const bx = 1 + 0.2 * belly, by = 1 + 0.05 * belly;
  const bodyT = belly ? ` transform="translate(60 108) scale(${bx.toFixed(3)} ${by.toFixed(3)}) translate(-60 -108)"` : '';
  const fy = f.y + (belly ? 2 * belly : 0);
  const mouthY = d.mouthY ? d.mouthY : fy + (d.mouth === 'beak' ? 8 * f.s : d.mouth === 'none' ? 12 * f.s : d.mouth === 'tiny' ? 7.5 * f.s : 9 * f.s);
  const faceG = `<g class="p-face">` +
    (d.cheek || mood === 'love' || mood === 'poked' ? cheeks(f.x, fy, f.s, mood) : '') +
    `<g class="p-eyes">${eyes(f.x, fy, f.s, mood, d.style, opts.look || 0, d.eye || {})}</g>` +
    mouth(f.x, mouthY, f.s, mood, d.mouth, d.mouthColor || OL) + `</g>`;
  const bellyPatch = belly > 0.15 ? E(60, Math.min(98, fy + 22 * f.s), (11 + 8 * belly) * f.s, (7 + 5 * belly) * f.s, `fill="#fff" opacity="${(d.style === 'sil' ? 0.1 + 0.08 * belly : 0.22 + 0.18 * belly).toFixed(2)}"`) + (belly > 0.5 ? C(60, Math.min(98, fy + 22 * f.s), 1.4, `fill="${d.style === 'sil' ? '#fff' : OL}" opacity=".45"`) : '') : '';
  return `<svg class="pet-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
    (d.defs ? `<defs>${d.defs}</defs>` : '') +
    `<ellipse class="p-ground" cx="60" cy="110.5" rx="${(27 * (belly ? bx : 1)).toFixed(1)}" ry="3.4" fill="#1f1b24" opacity=".1"/>` +
    `<g class="p-body"${bodyT}>${d.body}${bellyPatch}</g>` + (d.front || '') + faceG + decor(mood, { x: f.x, y: fy, s: f.s }, opts) + `</svg>`;
}

export const PET_SPECIES = SPECIES;
export function speciesList() { return Object.keys(SPECIES); }
export function stageName(species, stage) { return (Object.prototype.hasOwnProperty.call(SPECIES, species) ? SPECIES[species] : SPECIES.chick).stages[Math.max(0, Math.min(5, stage | 0))]; }

// Yaşam alanı süsleri (pet evdeyken arkasında görünür)
export function homeSVG(species) {
  const h = (SPECIES[species] || SPECIES.chick).home;
  const body = {
    nest: P('M16 98 C22 114 98 114 104 98 C94 106 26 106 16 98 Z', 'fill="#D9B48A"') + P('M20 99 C42 94 78 94 100 99', ln('#C49A6C', 2)),
    pot: P('M28 96 L92 96 L87 116 L33 116 Z', 'fill="#E39A80"') + P('M24 90 L96 90 L96 97 L24 97 Z', 'fill="#EBAE98"'),
    cushion: P('M12 106 C12 96 108 96 108 106 C108 115 12 115 12 106 Z', 'fill="#CFC4F2"'),
    house: P('M86 112 L86 82 L101 70 L116 82 L116 112 Z', 'fill="#F2C47A"') + P('M82 84 L101 66 L120 84', ln('#D9634E', 4)) + P('M94 112 L94 98 C94 92 108 92 108 98 L108 112 Z', 'fill="#3a3340"'),
  }[h] || '';
  return `<svg class="pet-home-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
}
