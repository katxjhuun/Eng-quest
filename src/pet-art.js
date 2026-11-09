// dam-la petleri — tamamen özgün, kodla çizilmiş SVG karakterler.
// 5 tür × 6 evrim aşaması; yüz ifadeleri (ruh hali) ve süsler aynı çizim sisteminden üretilir.
// Koordinat sistemi: viewBox 0 0 120 120, zemin y≈110, gövde merkezi x=60.

const OL = '#2b2230';           // çizgi rengi
const SW = 3.2;                 // çizgi kalınlığı
const BK = '#221d29';           // kedi/köpek siluet rengi
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
      if (stage === 0) return {
        body: feet(109, 9) + P('M60 38 C82 38 90 64 90 80 C90 98 77 108 60 108 C43 108 30 98 30 80 C30 64 38 38 60 38 Z', f('#F6EBD8')) +
          E(45, 56, 3.2, 4, f('#E9D9BF')) + E(76, 96, 4.2, 3, f('#E9D9BF')) + E(80, 70, 2.4, 3, f('#E9D9BF')) +
          P('M32 66 L39 60 L45 67 L52 59 L60 66 L67 58 L74 66 L81 59 L88 65', ln('#8a7560', 2.4)),
        face: { x: 60, y: 82, s: 0.85 }, style: 'dot', mouth: 'beak', cheek: true,
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
      if (stage === 3) return {
        body: legs() + feet(109, 11) + P('M32 84 C16 86 14 98 24 100 C28 96 32 94 36 94 Z', f('#C9B24A')) +
          E(60, 72, 30, 34, f('#E8C84A')) + E(60, 86, 17, 14, f('#F4E08E')) + crest('#B89A2E', '#6FB0A0', 38) +
          P('M33 62 C18 64 18 84 34 86 Z', f('#C9B24A')) + P('M87 62 C102 64 102 84 86 86 Z', f('#C9B24A')),
        face: { x: 60, y: 64, s: 1 }, style: 'dot', mouth: 'beak', cheek: true,
      };
      if (stage === 4) return {
        body: P('M60 90 C30 70 26 40 40 34 C50 50 56 64 60 74 C64 64 70 50 80 34 C94 40 90 70 60 90 Z', f('#4E9A6A')) +
          [[44, 44], [60, 40], [76, 44]].map(([x, y]) => E(x, y, 3.4, 4.2, f('#2F6E8F')) + C(x, y, 1.6, f('#E8C84A'))).join('') +
          legs('#B8865A') + feet(109, 11) +
          E(60, 76, 28, 31, f('#A88C62')) + E(60, 90, 16, 11, f('#C9B08A')) + P('M38 58 C46 50 74 50 82 58 C78 72 42 72 38 58 Z', f('#3FA39A')) +
          C(60, 56, 20, f('#3FA39A')) + crest('#2F6E8F', '#2F8FB0', 30),
        face: { x: 60, y: 56, s: 0.95 }, style: 'sil', mouth: 'beak', eye: dark,
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
  plant: {
    label: 'Bitki', home: 'pot',
    stages: ['Tohumcuk', 'Filizcik', 'Papatya', 'Lale', 'Kaktüs', 'Ulu Ağaç'],
    draw(stage, u) {
      const f = c => `fill="${c}"`;
      const LF = '#6CC070', LF2 = '#4FA05A';
      const leaf = (x, y, rot, sc = 1, c = LF) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})">${P('M0 0 C6 -10 22 -12 26 -4 C20 6 6 6 0 0 Z', f(c))}</g>`;
      const feet = (c, y = 106, dx = 10) => E(60 - dx, y, 6, 3.6, f(c)) + E(60 + dx, y, 6, 3.6, f(c));
      if (stage === 0) return {
        body: E(60, 107, 36, 6, f('#9A7556')) +
          P('M60 54 C76 58 84 76 82 90 C80 102 70 108 60 108 C50 108 40 102 38 90 C36 76 44 58 60 54 Z', f('#B9834F')) +
          E(52, 74, 4, 8, f('#CC9A66')) + P('M60 54 C59 47 62 43 66 41', ln(LF2, 2.6)) + `<g class="p-leaf">${leaf(65, 42, -35, 0.45)}</g>`,
        face: { x: 60, y: 86, s: 0.85 }, style: 'sil', mouth: 'none', mouthColor: '#5a3a1e', eye: { pupil: '#3a2412', line: '#3a2412' },
      };
      if (stage === 1) return {
        body: feet('#9FCF7A') + E(60, 80, 28, 29, f('#B6E08E')) + E(60, 90, 15, 10, f('#C9EAA8')) +
          `<line x1="60" y1="51" x2="60" y2="33" ${ln(LF2, 3)}/>` + `<g class="p-leaf">${leaf(60, 34, -155, 0.95)}${leaf(60, 34, -25, 0.75)}</g>`,
        face: { x: 60, y: 78, s: 0.95 }, style: 'dot', mouth: 'mouth', cheek: true,
      };
      if (stage === 2) return { // papatya: yüz çiçeğin sarı göbeğinde
        body: feet(LF2) + P('M44 106 C40 92 44 82 60 80 C76 82 80 92 76 106 Z', f(LF)) + `<g class="p-leaf">${leaf(40, 96, -150, 0.8)}${leaf(80, 96, -30, 0.8)}</g>` +
          `<g class="p-leaf">${Array.from({ length: 14 }, (_, k) => `<g transform="rotate(${k * 360 / 14} 60 58)">${E(60, 30, 6, 13, f('#FFFFFF'))}</g>`).join('')}</g>` +
          C(60, 58, 21, f('#FFC93C')) + C(60, 58, 17, f('#FFD45A')),
        face: { x: 60, y: 57, s: 0.9 }, style: 'dot', mouth: 'mouth', cheek: true,
      };
      if (stage === 3) return { // lale: gövde lale çanağı
        body: feet(LF2) + `<line x1="60" y1="96" x2="60" y2="106" ${ln(LF2, 5)}/>` + `<g class="p-leaf">${P('M58 104 C40 100 30 84 32 70 C42 80 52 90 58 104 Z', f(LF))}${P('M62 104 C80 100 90 84 88 70 C78 80 68 90 62 104 Z', f(LF2))}</g>` +
          P('M36 54 C36 82 44 98 60 98 C76 98 84 82 84 54 C76 60 70 56 66 44 C62 54 58 54 54 44 C50 56 44 60 36 54 Z', f('#E8505B')) +
          P('M48 62 C48 82 52 94 60 96 C54 86 52 74 54 58 Z', f('#F2737C')),
        face: { x: 60, y: 76, s: 0.95 }, style: 'sil', mouth: 'none', mouthColor: '#7a1f2a', eye: { pupil: '#3a0d14', line: '#5a1520' },
      };
      if (stage === 4) return { // kaktüs, saksıda, çiçekli
        body: P('M38 96 L82 96 L78 112 L42 112 Z', f('#D9805F')) + E(60, 96, 24, 4, f('#C46A4B')) +
          P('M46 78 C34 78 30 72 30 58', `fill="none" stroke="#4E9E52" stroke-width="9" stroke-linecap="round"`) + P('M74 72 C86 72 90 66 90 52', `fill="none" stroke="#4E9E52" stroke-width="9" stroke-linecap="round"`) +
          P('M42 96 C40 70 42 48 60 40 C78 48 80 70 78 96 Z', f('#5DB560')) +
          [[48, 60], [72, 58], [46, 84], [74, 82], [60, 92]].map(([x, y]) => P(`M${x - 2} ${y} l4 0 M${x} ${y - 2} l0 4`, ln('#2F6E35', 1.4))).join('') +
          `<g class="p-leaf">${[0, 72, 144, 216, 288].map(a => `<g transform="rotate(${a} 60 36)">${E(60, 29, 4.2, 7, f('#FF7EB0'))}</g>`).join('')}${C(60, 36, 4, f('#FFD45A'))}</g>`,
        face: { x: 60, y: 70, s: 0.95 }, style: 'dot', mouth: 'mouth', cheek: true,
      };
      return { // ulu ağaç: gövdede yüz, çiçekli taç
        body: P('M40 106 C34 110 28 110 26 108 M80 106 C86 110 92 110 94 108', ln('#8A5A36', 3.4)) +
          P('M42 72 C40 90 42 104 60 106 C78 104 80 90 78 72 Z', f('#9C6B43')) + P('M50 80 C50 90 52 98 50 104 M70 80 C70 90 68 98 70 104', ln('#83552F', 2)) +
          C(34, 46, 21, f('#4FA05A')) + C(86, 46, 21, f('#4FA05A')) + C(60, 32, 26, f('#6CC070')) + C(46, 56, 14, f('#6CC070')) + C(74, 56, 14, f('#6CC070')) +
          [[36, 38], [52, 22], [70, 18], [84, 36], [62, 46], [44, 58], [80, 56], [26, 52], [94, 50]].map(([x, y], k) => C(x, y, k % 3 ? 3.2 : 4, f(k % 2 ? '#FFB3CF' : '#FF8FB8')) + C(x, y, 1.2, f('#FFE27A'))).join('') +
          C(88, 64, 4, f('#E8504A')) + `<line x1="88" y1="60" x2="88" y2="57" ${ln('#4F3A20', 1.4)}/>`,
        face: { x: 60, y: 86, s: 0.9 }, style: 'sil', mouth: 'none', mouthColor: '#4a2c14', eye: { pupil: '#2a1a0c', line: '#3a2412' },
      };
    },
  },

  // ---------------------------------------------------------------- kedi → kara panter
  cat: {
    label: 'Kedi', home: 'cushion',
    stages: ['Minnoş', 'Tekir', 'Vaşak', 'Puma', 'Leopar', 'Kara Panter'],
    draw(stage, u) {
      const pal = [
        { b: '#F2A14A', l: '#FBD7A8', d: '#D97F2A' }, // turuncu yavru
        { b: '#E8913A', l: '#F8CF9C', d: '#B9661E' }, // tekir
        { b: '#C9A57B', l: '#EFDDC4', d: '#5A4632' }, // vaşak
        { b: '#C6884C', l: '#EFD2AE', d: '#7A5230' }, // puma
        { b: '#E3B34C', l: '#F7E2A8', d: '#6B4A1E' }, // leopar
        { b: '#26222B', l: '#33303A', d: '#3C3844' }, // kara panter
      ][stage];
      const f = c => `fill="${c}"`;
      const eyeDark = { white: '#fff', pupil: '#2a1d14', line: '#3a2a1c' };
      const eyePanther = { white: '#E9CF4E', pupil: '#16131a', line: '#E9CF4E' };
      if (stage === 0) return {
        body: `<g class="p-tail">${P('M78 98 C94 98 98 84 92 80 C88 86 84 92 76 92', `fill="none" stroke="${pal.b}" stroke-width="7" stroke-linecap="round"`)}</g>` +
          E(60, 92, 22, 16, f(pal.b)) + E(60, 96, 11, 9, f(pal.l)) + E(48, 106, 5, 4, f(pal.b)) + E(72, 106, 5, 4, f(pal.b)) +
          P('M40 60 L42 40 L56 52 Z', f(pal.b)) + P('M80 60 L78 40 L64 52 Z', f(pal.b)) + P('M44 54 L45 46 L51 51 Z M76 54 L75 46 L69 51 Z', f('#F7B9A8')) +
          C(60, 66, 22, f(pal.b)) + E(60, 75, 8, 5.5, f(pal.l)) + P('M54 48 l2 6 M60 46 l0 6 M66 48 l-2 6', ln(pal.d, 2)),
        face: { x: 60, y: 64, s: 1.05 }, style: 'sil', mouth: 'none', mouthColor: '#7a4a2a', mouthY: 76, eye: eyeDark,
      };
      const head = stage >= 3 ? 50 : 51, hr = stage >= 3 ? 22 : 20.5;
      const tailCol = pal.b;
      const tail = stage === 2
        ? `<g class="p-tail">${P('M80 100 C92 100 96 94 94 86', `fill="none" stroke="${tailCol}" stroke-width="7" stroke-linecap="round"`)}${C(94, 85, 4, f(pal.d))}</g>`
        : `<g class="p-tail">${P(stage >= 3 ? 'M80 100 C102 100 106 82 98 64' : 'M80 100 C100 100 104 80 94 66', `fill="none" stroke="${tailCol}" stroke-width="${stage >= 3 ? 8 : 7}" stroke-linecap="round"`)}${stage === 3 ? C(98, 63, 4.4, f(pal.d)) : ''}</g>`;
      const ears = P(`M40 ${head - 4} L40 ${head - 26} L56 ${head - 12} Z`, f(pal.b)) + P(`M80 ${head - 4} L80 ${head - 26} L64 ${head - 12} Z`, f(pal.b)) +
        (stage < 5 ? P(`M43 ${head - 9} L43 ${head - 20} L51 ${head - 13} Z M77 ${head - 9} L77 ${head - 20} L69 ${head - 13} Z`, f(stage === 2 ? '#3a2e24' : '#F2B6A3')) : '') +
        (stage === 2 ? P(`M40 ${head - 26} l-2 -7 l4 3 Z M80 ${head - 26} l2 -7 l-4 3 Z`, f(pal.d)) : '');
      let marks = '';
      if (stage === 1) marks = P(`M53 ${head - 17} l2 6 M60 ${head - 19} l0 7 M67 ${head - 17} l-2 6`, ln(pal.d, 2.4)) + P('M38 84 q6 3 10 0 M36 94 q6 3 10 0 M82 84 q-6 3 -10 0 M84 94 q-6 3 -10 0', ln(pal.d, 2.4));
      if (stage === 2) marks = P(`M38 ${head + 2} L32 ${head + 8} L40 ${head + 9} L34 ${head + 15} L44 ${head + 12} Z M82 ${head + 2} L88 ${head + 8} L80 ${head + 9} L86 ${head + 15} L76 ${head + 12} Z`, f(pal.l)) + [[44, 82], [76, 86], [48, 96]].map(([x, y]) => C(x, y, 2, f('#9C7C58'))).join('');
      if (stage === 4 || stage === 5) marks = [[44, 80], [76, 78], [42, 96], [78, 96], [52, 104], [68, 104], [60, head - 15]].map(([x, y]) => C(x, y, 3.2, `fill="none" stroke="${pal.d}" stroke-width="1.8"`) + C(x, y, 1.1, f(pal.d))).join('');
      const muzzleCol = stage === 5 ? '#302C36' : pal.l;
      return {
        body: tail + P(`M60 ${head + 10} C78 ${head + 10} 86 84 86 98 C86 106 80 108 74 108 L46 108 C40 108 34 106 34 98 C34 84 42 ${head + 10} 60 ${head + 10} Z`, f(pal.b)) +
          E(60, 92, 13, 14, f(stage === 5 ? pal.b : pal.l)) + E(47, 107, 6, 4, f(pal.b)) + E(73, 107, 6, 4, f(pal.b)) + ears + C(60, head, hr, f(pal.b)) +
          E(60, head + 9, 9.5, 6.5, f(muzzleCol)) + E(60, head + 5.5, 2.4, 1.7, f(stage === 5 ? '#4a4452' : '#D97A70')) + marks,
        face: { x: 60, y: head - 2, s: 1 }, style: 'sil', mouth: 'none', mouthColor: stage === 5 ? '#8a8494' : '#7a4a2a', mouthY: head + 10,
        eye: stage === 5 ? eyePanther : eyeDark,
      };
    },
  },

  // ---------------------------------------------------------------- köpek → alfa kurt
  dog: {
    label: 'Köpek', home: 'house',
    stages: ['Tosbik', 'Hav', 'Çoban', 'Genç Kurt', 'Kurt', 'Alfa Kurt'],
    draw(stage, u) {
      const pal = [
        { b: '#C98B55', l: '#F1D9BC', d: '#9C6334' },
        { b: '#D9A15A', l: '#F6E2C0', d: '#A8702F' },
        { b: '#C98A4B', l: '#EBCB9F', d: '#2F2A2C' },
        { b: '#9A8F86', l: '#D9D2CA', d: '#6E655D' },
        { b: '#7D8590', l: '#E4E7EB', d: '#55606C' },
        { b: '#4E5661', l: '#D7DDE4', d: '#353C46' },
      ][stage];
      const f = c => `fill="${c}"`;
      const eye = stage >= 3 ? { white: '#F2C14E', pupil: '#1b1a1f', line: '#2b2f36' } : { white: '#fff', pupil: '#2a1d14', line: '#3a2a1c' };
      const floppy = (y, c) => `<g class="p-ear">${P(`M42 ${y - 10} C30 ${y - 12} 28 ${y + 8} 34 ${y + 16} C38 ${y + 12} 42 ${y + 4} 44 ${y - 2} Z`, f(c))}${P(`M78 ${y - 10} C90 ${y - 12} 92 ${y + 8} 86 ${y + 16} C82 ${y + 12} 78 ${y + 4} 76 ${y - 2} Z`, f(c))}</g>`;
      const pointy = (y, c, inner) => P(`M40 ${y + 4} L32 ${y - 20} L54 ${y - 8} Z`, f(c)) + P(`M80 ${y + 4} L88 ${y - 20} L66 ${y - 8} Z`, f(c)) + P(`M40 ${y - 1} L36 ${y - 13} L48 ${y - 7} Z M80 ${y - 1} L84 ${y - 13} L72 ${y - 7} Z`, f(inner));
      const ruff = (y, c) => P(`M40 ${y - 6} L30 ${y} L38 ${y + 3} L30 ${y + 10} L40 ${y + 10} L36 ${y + 17} L46 ${y + 12} Z`, f(c)) + P(`M80 ${y - 6} L90 ${y} L82 ${y + 3} L90 ${y + 10} L80 ${y + 10} L84 ${y + 17} L74 ${y + 12} Z`, f(c));
      if (stage === 0) return {
        body: `<g class="p-tail">${P('M80 94 C88 92 92 86 90 80', `fill="none" stroke="${pal.b}" stroke-width="6" stroke-linecap="round"`)}</g>` +
          E(60, 94, 23, 15, f(pal.b)) + E(60, 98, 11, 8, f(pal.l)) + E(48, 107, 5.5, 4, f(pal.b)) + E(72, 107, 5.5, 4, f(pal.b)) +
          C(60, 68, 22, f(pal.b)) + E(60, 80, 10, 7, f(pal.l)) + floppy(66, pal.d) + E(60, 77, 3.4, 2.4, f('#3a2a20')),
        face: { x: 60, y: 66, s: 1.05 }, style: 'sil', mouth: 'none', mouthColor: '#6a4024', mouthY: 82, eye,
      };
      const head = 50, wolf = stage >= 3;
      const tail = wolf
        ? `<g class="p-tail">${P('M82 100 C100 98 106 84 100 70 C96 80 92 86 84 90', f(pal.b))}${P('M98 74 C101 80 101 86 98 90', ln(pal.l, 3))}</g>`
        : `<g class="p-tail">${P('M82 98 C94 96 100 86 98 76', `fill="none" stroke="${pal.b}" stroke-width="7" stroke-linecap="round"`)}</g>`;
      let extra = '';
      if (stage === 2) extra = P('M36 92 C34 80 42 66 52 62 L68 62 C78 66 86 80 84 92 C78 84 70 80 60 80 C50 80 42 84 36 92 Z', f(pal.d)) + P('M44 70 L76 70 L74 75 L46 75 Z', f('#D9534F'));
      if (wolf) extra = P('M48 74 L52 84 L56 76 L60 88 L64 76 L68 84 L72 74 C66 70 54 70 48 74 Z', f(pal.l));
      if (stage === 5) extra += P(`M44 ${head - 14} C50 ${head - 22} 70 ${head - 22} 76 ${head - 14}`, ln(pal.l, 3)) + P('M38 78 C40 70 46 66 52 66 M82 78 C80 70 74 66 68 66', ln(pal.l, 3));
      return {
        body: tail + P(`M60 ${head + 12} C78 ${head + 12} 84 84 84 98 C84 106 78 108 72 108 L48 108 C42 108 36 106 36 98 C36 84 42 ${head + 12} 60 ${head + 12} Z`, f(pal.b)) +
          E(60, 94, 12, 13, f(pal.l)) + extra + E(47, 107, 6.5, 4, f(pal.b)) + E(73, 107, 6.5, 4, f(pal.b)) +
          (wolf ? pointy(head - 6, pal.b, pal.d) + ruff(head + 2, pal.l) + E(60, head, 22, 20, f(pal.b)) : stage === 2 ? pointy(head - 6, pal.d, '#4a3a30') + C(60, head, 21, f(pal.b)) : C(60, head, 21, f(pal.b))) +
          (stage === 2 ? P(`M44 ${head - 8} C50 ${head - 20} 70 ${head - 20} 76 ${head - 8} C70 ${head - 12} 50 ${head - 12} 44 ${head - 8} Z`, f(pal.d)) : '') +
          (wolf ? P(`M49 ${head + 4} C49 ${head + 24} 71 ${head + 24} 71 ${head + 4} Z`, f(pal.l)) : E(60, head + 13, 11, 8, f(pal.l))) +
          E(60, head + (wolf ? 8 : 9), 4.4, 3, f('#2a2226')) + (stage < 2 ? floppy(head - 2, pal.d) : ''),
        face: { x: 60, y: head - 4, s: 0.95 }, style: 'sil', mouth: 'none', mouthColor: '#4a3020', mouthY: head + (wolf ? 15 : 16), eye,
      };
    },
  },
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
  const sp = SPECIES[species] || SPECIES.chick;
  stage = Math.max(0, Math.min(5, stage | 0));
  const mood = opts.mood || 'idle';
  const u = `${species[0]}${stage}${++uidSeq}`;
  const d = sp.draw(stage, u);
  const f = d.face;
  const belly = Math.max(0, Math.min(1, opts.belly || 0));
  const bx = 1 + 0.2 * belly, by = 1 + 0.05 * belly;
  const bodyT = belly ? ` transform="translate(60 108) scale(${bx.toFixed(3)} ${by.toFixed(3)}) translate(-60 -108)"` : '';
  const fy = f.y + (belly ? 2 * belly : 0);
  const mouthY = d.mouthY ? d.mouthY : fy + (d.mouth === 'beak' ? 8 * f.s : d.mouth === 'none' ? 12 * f.s : 9 * f.s);
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
export function stageName(species, stage) { return (SPECIES[species] || SPECIES.chick).stages[Math.max(0, Math.min(5, stage | 0))]; }

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
