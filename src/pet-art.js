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
function eyes(x, y, s, mood, style, look = 0) {
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
  const r = 6.2 * s;
  switch (mood) {
    case 'happy': case 'love': case 'eat':
      return pair(ex => P(`M${ex - 5 * s} ${y + 2 * s} Q${ex} ${y - 6 * s} ${ex + 5 * s} ${y + 2 * s}`, ln(W, 3.4 * s)));
    case 'full':
      return pair(ex => P(`M${ex - 5 * s} ${y - 1 * s} Q${ex} ${y + 5 * s} ${ex + 5 * s} ${y - 1 * s}`, ln(W, 3.2 * s)));
    case 'sleep':
      return pair(ex => P(`M${ex - 5 * s} ${y + 1 * s} Q${ex} ${y + 4.5 * s} ${ex + 5 * s} ${y + 1 * s}`, ln(W, 3 * s)));
    case 'groggy': case 'sleepy':
      return pair(ex => P(`M${ex - r} ${y} A${r} ${r} 0 0 0 ${ex + r} ${y} Z`, `fill="${W}"`) + C(ex, y + 2.6 * s, 2.3 * s, `fill="${BK}"`));
    case 'focus':
      return pair((ex, d) => P(`M${ex - r} ${y - 1 * s} L${ex + r} ${y - 1 * s - 2.4 * s * d * -1} A${r} ${r} 0 0 1 ${ex - r} ${y - 1 * s} Z`, `fill="${W}"`) + C(ex, y + 2 * s, 2.4 * s, `fill="${BK}"`));
    case 'poked':
      return P(`M${L - 5 * s} ${y - 4.5 * s} L${L + 4 * s} ${y} L${L - 5 * s} ${y + 4.5 * s}`, ln(W, 3.2 * s)) + P(`M${R + 5 * s} ${y - 4.5 * s} L${R - 4 * s} ${y} L${R + 5 * s} ${y + 4.5 * s}`, ln(W, 3.2 * s));
    case 'dead':
      return pair(ex => P(`M${ex - 4.5 * s} ${y - 4.5 * s} L${ex + 4.5 * s} ${y + 4.5 * s} M${ex + 4.5 * s} ${y - 4.5 * s} L${ex - 4.5 * s} ${y + 4.5 * s}`, ln(W, 3 * s)));
    case 'surprised':
      return pair(ex => C(ex, y, r * 1.18, `fill="${W}"`) + C(ex, y, 1.8 * s, `fill="${BK}"`));
    case 'sad':
      return pair(ex => C(ex, y, r, `fill="${W}"`) + C(ex, y + 2.6 * s, 2.6 * s, `fill="${BK}"`));
    default: {
      const py = mood === 'hungry' ? -2.4 * s : 0;
      return pair(ex => C(ex, y, r, `fill="${W}"`) + C(ex + look * 2 * s, y + py, 2.7 * s, `fill="${BK}"`));
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
    if (mood === 'happy' || mood === 'love' || mood === 'eat') return P(`M${x - 3.5 * s} ${y} Q${x - 1.7 * s} ${y + 2.5 * s} ${x} ${y} Q${x + 1.7 * s} ${y + 2.5 * s} ${x + 3.5 * s} ${y}`, ln('#fff', 2 * s));
    if (mood === 'surprised' || mood === 'poked') return E(x, y + 1 * s, 2 * s, 2.6 * s, `fill="#fff"`);
    if (mood === 'hungry') return P(`M${x - 3 * s} ${y} Q${x} ${y + 2 * s} ${x + 3 * s} ${y}`, ln('#fff', 1.8 * s)) + P(`M${x + 2 * s} ${y + 1 * s} q1 4 0 6`, ln('#9fd8ff', 1.8 * s));
    return '';
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
  chick: {
    label: 'Civciv', home: 'nest',
    stages: ['Yumurtacık', 'Pıtırcık', 'Tombiş', 'Kanatçık', 'Alevkuş', 'Anka'],
    draw(stage, u) {
      const col = [BK, BK, BK, BK, '#3A2026', '#2E1E33'][stage];
      const f = (c = col) => `fill="${c}"`;
      const BEAK = '#F2994A', FEET = '#F2994A';
      const feet = (y = 108, dx = 10) => E(60 - dx, y, 6.5, 3, f(FEET)) + E(60 + dx, y, 6.5, 3, f(FEET));
      if (stage === 0) return {
        body: feet(109, 9) + P('M60 38 C82 38 90 64 90 80 C90 98 77 108 60 108 C43 108 30 98 30 80 C30 64 38 38 60 38 Z', f('#EFE4D2')) +
          P('M32 66 L39 60 L45 67 L52 59 L60 66 L67 58 L74 66 L81 59 L88 65', ln(BK, 2.4)),
        face: { x: 60, y: 82, s: 0.85 }, style: 'dot', mouth: 'beak',
      };
      const crest = stage >= 3
        ? `<g class="p-leaf">${P('M52 40 C48 26 54 22 58 32 C58 18 68 18 66 32 C70 24 78 28 70 40 Z', `fill="${stage >= 4 ? `url(#g${u}f)` : '#F2994A'}"`)}</g>`
        : `<g class="p-leaf">${P(stage === 2 ? 'M52 46 C48 34 56 32 57 40 C57 29 66 29 64 40 C68 33 75 36 69 46 Z' : 'M55 48 C52 38 58 35 60 41 C61 34 68 35 65 47 Z', f())}</g>`;
      const wing = (side, big = 0) => side < 0
        ? P(`M${33 - big} 72 C${20 - big * 2} 72 ${20 - big * 2} ${88 + big} ${34} ${88}`, f())
        : P(`M${87 + big} 72 C${100 + big * 2} 72 ${100 + big * 2} ${88 + big} ${86} ${88}`, f());
      if (stage === 1) return { body: feet() + C(60, 78, 30, f()) + crest + wing(1), face: { x: 60, y: 74, s: 1 }, style: 'sil', mouth: 'beak' };
      if (stage === 2) return { body: feet(108, 13) + E(60, 76, 36, 32, f()) + crest + wing(-1, 2) + wing(1, 2), face: { x: 60, y: 72, s: 1.05 }, style: 'sil', mouth: 'beak' };
      const legs = `<line x1="52" y1="100" x2="50" y2="107" ${ln(FEET, 3)}/><line x1="68" y1="100" x2="70" y2="107" ${ln(FEET, 3)}/>`;
      if (stage === 3) return {
        body: legs + feet(109, 11) + P('M32 86 C16 88 14 98 24 100 C28 96 32 94 36 94 Z', f()) + E(60, 72, 30, 34, f()) + crest + wing(-1, 6) + wing(1, 6),
        face: { x: 60, y: 66, s: 1 }, style: 'sil', mouth: 'beak',
      };
      const flame = `<linearGradient id="g${u}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE27A"/><stop offset=".6" stop-color="#FF9A3D"/><stop offset="1" stop-color="#E8553C"/></linearGradient>`;
      if (stage === 4) return {
        body: legs + feet(109, 11) +
          P('M34 86 C12 88 8 102 22 106 C20 98 28 94 36 94 C26 102 32 110 40 102 Z', `fill="url(#g${u}f)"`) +
          P('M86 60 C110 52 116 76 100 82 C106 72 96 72 88 84 Z', f()) + P('M34 60 C10 52 4 76 20 82 C14 72 24 72 32 84 Z', f()) +
          P('M104 66 C110 70 108 78 102 80', ln('#FF9A3D', 3)) + P('M16 66 C10 70 12 78 18 80', ln('#FF9A3D', 3)) +
          E(60, 72, 30, 34, f()) + crest,
        defs: flame, face: { x: 60, y: 66, s: 1 }, style: 'sil', mouth: 'beak',
      };
      return {
        body: C(60, 64, 52, `fill="url(#g${u}r)"`) +
          P('M42 92 C28 106 32 118 46 114 C40 108 42 102 50 98 Z', `fill="url(#g${u}f)"`) + P('M78 92 C92 106 88 118 74 114 C80 108 78 102 70 98 Z', `fill="url(#g${u}f)"`) +
          P('M86 58 C112 36 124 64 110 76 C118 62 106 60 98 70 C110 74 102 88 88 82 Z', f()) + P('M34 58 C8 36 -4 64 10 76 C2 62 14 60 22 70 C10 74 18 88 32 82 Z', f()) +
          P('M108 44 C116 52 116 64 110 72', ln('#FFC94A', 3)) + P('M12 44 C4 52 4 64 10 72', ln('#FFC94A', 3)) +
          legs + feet(109, 11) + E(60, 72, 30, 34, f()) +
          P('M44 42 C34 20 46 12 52 28 C50 6 70 6 68 28 C74 12 86 20 76 42 Z', `fill="url(#g${u}f)"`),
        defs: flame + `<radialGradient id="g${u}r"><stop offset=".5" stop-color="#FFD86B" stop-opacity=".35"/><stop offset="1" stop-color="#FFD86B" stop-opacity="0"/></radialGradient>`,
        face: { x: 60, y: 66, s: 1 }, style: 'sil', mouth: 'beak',
      };
    },
  },

  plant: {
    label: 'Bitki', home: 'pot',
    stages: ['Tohumcuk', 'Filizcik', 'Fidancık', 'Tomurcuk', 'Çiçek Perisi', 'Kadim Ağaç'],
    draw(stage, u) {
      const col = [ '#3B2B24', BK, BK, BK, '#26222E', '#2E2620'][stage];
      const f = (c = col) => `fill="${c}"`;
      const LF = '#6CC070', LF2 = '#4FA05A', PINK = '#F58BB0';
      const leaf = (x, y, rot, sc = 1, c = LF) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})">${P('M0 0 C6 -10 22 -12 26 -4 C20 6 6 6 0 0 Z', f(c))}</g>`;
      const legs = (y = 103, dx = 10) => E(60 - dx, y + 4, 6, 4, f()) + E(60 + dx, y + 4, 6, 4, f());
      const stem = (y1, y2) => `<line x1="60" y1="${y1}" x2="60" y2="${y2}" ${ln(LF2, 3)}/>`;
      if (stage === 0) return {
        body: E(60, 107, 36, 6, f('#8B6A4E')) +
          P('M60 54 C76 58 84 76 82 90 C80 102 70 108 60 108 C50 108 40 102 38 90 C36 76 44 58 60 54 Z', f()) +
          P('M60 54 C59 47 62 43 66 41', ln(LF2, 2.6)) + `<g class="p-leaf">${leaf(65, 42, -35, 0.45)}</g>`,
        face: { x: 60, y: 84, s: 0.85 }, style: 'sil', mouth: 'none',
      };
      if (stage === 1) return {
        body: legs() + E(60, 80, 28, 29, f()) + stem(51, 32) + `<g class="p-leaf">${leaf(60, 33, -155, 0.95)}${leaf(60, 33, -25, 0.75)}</g>`,
        face: { x: 60, y: 78, s: 0.95 }, style: 'sil', mouth: 'none',
      };
      if (stage === 2) return {
        body: legs() + P('M34 80 C24 76 20 66 26 62 C32 66 34 72 34 80 Z', f(LF)) + P('M86 80 C96 76 100 66 94 62 C88 66 86 72 86 80 Z', f(LF)) +
          E(60, 77, 29, 32, f()) + stem(45, 26) + `<g class="p-leaf">${leaf(60, 27, -160, 0.95)}${leaf(60, 27, -20, 0.95)}${leaf(60, 25, -90, 0.8, LF2)}</g>`,
        face: { x: 60, y: 75, s: 1 }, style: 'sil', mouth: 'none',
      };
      if (stage === 3) return {
        body: legs() + P('M33 78 C22 74 18 64 24 60 C30 64 33 70 33 78 Z', f(LF)) + P('M87 78 C98 74 102 64 96 60 C90 64 87 70 87 78 Z', f(LF)) +
          E(60, 77, 29, 32, f()) + P('M40 52 C48 57 54 53 60 47 C66 53 72 57 80 52 C76 60 68 60 60 57 C52 60 44 60 40 52 Z', f(LF)) + stem(47, 32) +
          `<g class="p-leaf">${P('M60 8 C72 16 72 30 60 34 C48 30 48 16 60 8 Z', f(PINK))}${P('M53 31 C55 36 60 36 60 34 C60 36 65 36 67 31 Z', f(LF2))}</g>`,
        face: { x: 60, y: 76, s: 1 }, style: 'sil', mouth: 'none',
      };
      if (stage === 4) return {
        body: `<g class="p-leaf">${[0, 60, 120, 180, 240, 300].map(a => `<g transform="rotate(${a} 60 48)">${P('M60 48 C52 36 54 20 60 16 C66 20 68 36 60 48 Z', f(PINK))}</g>`).join('')}${C(60, 48, 7, f('#FFD86B'))}</g>` +
          P('M28 70 C14 60 14 46 22 44 C30 50 32 60 28 70 Z', f('#9ED89A')) + P('M92 70 C106 60 106 46 98 44 C90 50 88 60 92 70 Z', f('#9ED89A')) +
          E(60, 73, 27, 30, f()) + P('M34 92 C38 102 46 108 52 104 C54 110 66 110 68 104 C74 108 82 102 86 92 C78 96 70 96 60 94 C50 96 42 96 34 92 Z', f(LF)) + legs(102, 9),
        face: { x: 60, y: 74, s: 0.95 }, style: 'sil', mouth: 'none',
      };
      return {
        body: C(60, 58, 54, `fill="url(#g${u}g)"`) +
          P('M40 104 C36 110 30 110 28 108 M80 104 C84 110 90 110 92 108', ln(col, 3.4)) +
          P('M36 70 C34 90 38 104 60 106 C82 104 86 90 84 70 Z', f()) +
          C(36, 42, 20, f(LF2)) + C(84, 42, 20, f(LF2)) + C(60, 30, 24, f(LF)) + C(48, 50, 12, f(LF)) + C(72, 50, 12, f(LF)) +
          C(40, 34, 3.2, f(PINK)) + C(78, 26, 3.2, f(PINK)) + C(86, 46, 4, f('#E8504A')) + C(58, 18, 3.2, f('#FFE27A')),
        defs: `<radialGradient id="g${u}g"><stop offset=".5" stop-color="#B8F0A8" stop-opacity=".4"/><stop offset="1" stop-color="#B8F0A8" stop-opacity="0"/></radialGradient>`,
        face: { x: 60, y: 76, s: 0.95 }, style: 'sil', mouth: 'none',
      };
    },
  },

  cat: {
    label: 'Kedi', home: 'cushion',
    stages: ['Minnoş', 'Mırnav', 'Pati Ustası', 'Pars', 'Aslan', 'Gök Aslanı'],
    draw(stage, u) {
      const col = [BK, BK, BK, '#3A3F52', '#2E2632', '#2D2358'][stage];
      const s = (a = '') => `fill="${col}"${a}`;
      const ears = (y, w = 1) => P(`M${44 - 4 * w} ${y + 8} L${42 - 2 * w} ${y - 12} L${56} ${y + 2} Z`, s(' stroke-linejoin="round"')) + P(`M${76 + 4 * w} ${y + 8} L${78 + 2 * w} ${y - 12} L${64} ${y + 2} Z`, s(' stroke-linejoin="round"'));
      if (stage === 0) return {
        body: P('M78 98 C94 98 98 84 92 80 C88 86 84 92 76 92', `fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round"`) +
          E(60, 92, 22, 16, s()) + E(48, 106, 5, 4, s()) + E(72, 106, 5, 4, s()) +
          ears(52, 1) + C(60, 66, 22, s()),
        face: { x: 60, y: 66, s: 1.05 }, style: 'sil', mouth: 'none', look: 0,
      };
      const head = stage >= 4 ? 52 : 50;
      let extra = '', behind = '';
      if (stage === 2) extra = P('M42 70 C50 76 70 76 78 70 L78 76 C70 82 50 82 42 76 Z', `fill="#E5534B"`) + P('M70 78 L76 92 L66 90 Z', `fill="#E5534B"`);
      if (stage === 3) extra = [[46, 86], [70, 92], [58, 100], [76, 78], [44, 98]].map(([x, y]) => E(x, y, 3.6, 2.6, `fill="#232733"`)).join('');
      if (stage === 4 || stage === 5) {
        const mc = stage === 4 ? '#C9853C' : '#5B4BC4', n = 14;
        behind = P(Array.from({ length: n * 2 }, (_, i) => { const a = (i / (n * 2)) * Math.PI * 2, r = i % 2 ? 26 : 33; return `${i ? 'L' : 'M'}${(60 + Math.cos(a) * r).toFixed(1)} ${(head + Math.sin(a) * r).toFixed(1)}`; }).join(' ') + ' Z', `fill="${mc}"`);
        if (stage === 5) behind = C(60, 60, 54, `fill="url(#g${u}s)"`) + behind + [[36, 34], [86, 40], [40, 72], [82, 70], [60, 22]].map(([x, y]) => C(x, y, 2, 'fill="#FFE27A"')).join('');
        extra = stage === 5 ? P('M56 32 A6 6 0 1 0 64 32 A4.5 4.5 0 1 1 56 32 Z', 'fill="#FFE27A"') : '';
      }
      const tail = stage >= 4
        ? `<g class="p-tail">${P('M80 100 C98 100 104 88 100 76', `fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round"`)}${C(100, 74, 6, `fill="${stage === 4 ? '#C9853C' : '#5B4BC4'}"`)}</g>`
        : `<g class="p-tail">${P('M80 100 C100 100 104 80 94 66', `fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round"`)}</g>`;
      return {
        body: behind + tail + P(`M60 ${head + 10} C78 ${head + 10} 86 84 86 98 C86 106 80 108 74 108 L46 108 C40 108 34 106 34 98 C34 84 42 ${head + 10} 60 ${head + 10} Z`, s()) +
          E(47, 107, 6, 4, s()) + E(73, 107, 6, 4, s()) + ears(head - 14, 1.1) + C(60, head, 21, s()) + extra,
        defs: stage === 5 ? `<radialGradient id="g${u}s"><stop offset=".45" stop-color="#8F7CFF" stop-opacity=".45"/><stop offset="1" stop-color="#8F7CFF" stop-opacity="0"/></radialGradient>` : '',
        face: { x: 60, y: head + 2, s: 1 }, style: 'sil', mouth: 'none',
      };
    },
  },

  dog: {
    label: 'Köpek', home: 'house',
    stages: ['Tosbik', 'Hav', 'İzci', 'Kurtçuk', 'Ay Kurdu', 'Yıldız Kurdu'],
    draw(stage, u) {
      const col = [BK, BK, BK, '#4A4F5C', '#3B4A6E', '#232C58'][stage];
      const s = (a = '') => `fill="${col}"${a}`;
      const floppy = (y) => `<g class="p-ear">${P(`M42 ${y - 10} C30 ${y - 12} 28 ${y + 8} 34 ${y + 16} C38 ${y + 12} 42 ${y + 4} 44 ${y - 2} Z`, s())}${P(`M78 ${y - 10} C90 ${y - 12} 92 ${y + 8} 86 ${y + 16} C82 ${y + 12} 78 ${y + 4} 76 ${y - 2} Z`, s())}</g>`;
      const pointy = (y) => P(`M40 ${y + 4} L30 ${y - 20} L54 ${y - 8} Z`, s()) + P(`M80 ${y + 4} L90 ${y - 20} L66 ${y - 8} Z`, s()) +
        P(`M36 ${y - 12} L34 ${y - 15} L40 ${y - 12} Z M84 ${y - 12} L86 ${y - 15} L80 ${y - 12} Z`, 'fill="#ffffff" opacity=".25"');
      const ruff = (y, c) => P(`M40 ${y - 6} L30 ${y} L38 ${y + 3} L30 ${y + 10} L40 ${y + 10} L36 ${y + 17} L46 ${y + 12} Z`, `fill="${c}"`) +
        P(`M80 ${y - 6} L90 ${y} L82 ${y + 3} L90 ${y + 10} L80 ${y + 10} L84 ${y + 17} L74 ${y + 12} Z`, `fill="${c}"`);
      if (stage === 0) return {
        body: `<g class="p-tail">${P('M80 94 C88 92 92 86 90 80', `fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round"`)}</g>` +
          E(60, 94, 23, 15, s()) + E(48, 107, 5.5, 4, s()) + E(72, 107, 5.5, 4, s()) +
          C(60, 68, 22, s()) + E(60, 80, 9, 6.5, s()) + floppy(66) + E(60, 79, 3.2, 2.2, 'fill="#5a5260"'),
        face: { x: 60, y: 66, s: 1.05 }, style: 'sil', mouth: 'none',
      };
      const head = 50;
      let extra = '', behind = '';
      if (stage === 2) extra = P('M42 72 L78 72 L60 90 Z', 'fill="#FFC93C"') + C(60, 75, 2, 'fill="#fff"') + C(52, 75, 1.4, 'fill="#fff"') + C(68, 75, 1.4, 'fill="#fff"');
      if (stage >= 3) extra += P('M48 74 L52 84 L56 76 L60 88 L64 76 L68 84 L72 74 C66 70 54 70 48 74 Z', `fill="${['', '', '', '#7C8291', '#6F7FA8', '#3E4F94'][stage]}"`);
      if (stage === 4) extra += P('M56 34 A6 6 0 1 0 64 34 A4.5 4.5 0 1 1 56 34 Z', 'fill="#FFE07A"');
      if (stage === 5) {
        behind = C(60, 62, 54, `fill="url(#g${u}w)"`);
        extra += `<path d="M44 88 L52 96 L60 92 L70 100 L78 90" ${ln('#9FD8FF', 1.4)} opacity=".8"/>` + [[44, 88], [52, 96], [60, 92], [70, 100], [78, 90], [60, 32]].map(([x, y]) => C(x, y, 2.2, 'fill="#CFF0FF"')).join('');
      }
      const tail = stage >= 3
        ? `<g class="p-tail">${P('M82 100 C100 98 106 84 100 70 C96 80 92 86 84 90', s())}</g>`
        : `<g class="p-tail">${P('M82 98 C94 96 100 86 98 76', `fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round"`)}</g>`;
      const snoutCol = stage >= 3 ? ['', '', '', '#5B6070', '#4C5C85', '#2E3A70'][stage] : col;
      return {
        body: behind + tail + P(`M60 ${head + 12} C78 ${head + 12} 84 84 84 98 C84 106 78 108 72 108 L48 108 C42 108 36 106 36 98 C36 84 42 ${head + 12} 60 ${head + 12} Z`, s()) +
          E(47, 107, 6.5, 4, s()) + E(73, 107, 6.5, 4, s()) + (stage >= 3 ? pointy(head - 6) + ruff(head + 2, col) : '') + (stage >= 3 ? E(60, head, 22, 20, s()) : C(60, head, 21, s())) +
          (stage >= 3 ? P(`M50 ${head + 6} C50 ${head + 24} 70 ${head + 24} 70 ${head + 6} Z`, `fill="${snoutCol}"`) + E(60, head + 9, 4.6, 3.2, 'fill="#15121a"') + E(59, head + 8, 1.4, 0.9, 'fill="#fff" opacity=".6"')
            : E(60, head + 13, 10, 7.5, `fill="${snoutCol}"`) + E(60, head + 10, 3.6, 2.6, 'fill="#5a5260"')) + (stage < 3 ? floppy(head - 2) : '') + extra,
        defs: stage === 5 ? `<radialGradient id="g${u}w"><stop offset=".45" stop-color="#7FC8FF" stop-opacity=".45"/><stop offset="1" stop-color="#7FC8FF" stop-opacity="0"/></radialGradient>` : '',
        face: { x: 60, y: head - 4, s: 0.95 }, style: 'sil', mouth: 'none', mouthY: head + 17,
      };
    },
  }
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
    `<g class="p-eyes">${eyes(f.x, fy, f.s, mood, d.style, opts.look || 0)}</g>` +
    mouth(f.x, mouthY, f.s, mood, d.mouth) + `</g>`;
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
