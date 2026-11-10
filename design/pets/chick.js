import { C, S, F, L, H, wrap } from './common.js';
// Civciv — saf, meraklı; yumurta kabuğu hâlâ kıçında. Hardal tüy, kısa kanat, büyük meraklı gözler.
export function chick(id = 'chick') {
  const b = [];
  b.push(`<ellipse cx="100" cy="186" rx="52" ry="6" fill="${C.ink}" opacity=".16"/>`);
  // bacaklar
  b.push(L('M88 160 L86 178 M86 178 l-8 6 M86 178 l0 8 M86 178 l7 6', 3, C.brickD), L('M112 160 L114 178 M114 178 l-7 6 M114 178 l0 8 M114 178 l8 6', 3, C.brickD));
  // gövde (armut)
  b.push(S('M62 128 C58 96 76 70 100 70 C124 70 142 96 138 128 C136 150 122 166 100 166 C78 166 64 150 62 128 Z', C.mustard));
  b.push(F('M124 82 C138 96 142 116 138 132 C134 152 122 164 104 166 C124 150 132 112 124 82 Z', C.mustardD), H('M124 82 C138 96 142 116 138 132 C134 152 122 164 104 166 C124 150 132 112 124 82 Z', id));
  b.push(L('M78 92 q3 -3 6 0 M90 84 q3 -3 6 0 M110 86 q3 -3 6 0 M80 110 q3 -3 6 0 M118 104 q3 -3 6 0 M96 98 q3 -3 6 0', 1.3, C.mustardD));
  // karın tüyü
  b.push(S('M80 128 C82 114 118 114 120 128 C122 146 112 158 100 158 C88 158 78 146 80 128 Z', C.cream, 'stroke-width="1.6"'));
  b.push(L('M86 128 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4', 1, C.mustardD));
  // kabuk parçası (alt)
  b.push(S('M64 140 C66 160 82 172 100 172 C118 172 134 160 136 140 L128 148 L120 140 L112 150 L104 140 L96 150 L88 140 L80 150 L72 140 Z', C.cream));
  b.push(L('M76 160 c4 -2 8 0 10 -3 M110 162 c4 0 8 -2 10 -5', 1.1, C.ashD), `<circle cx="92" cy="164" r="1.5" fill="${C.cobalt}"/><circle cx="118" cy="156" r="1.3" fill="${C.cobalt}"/><circle cx="84" cy="154" r="1.1" fill="${C.cobalt}"/>`);
  // kanatlar
  b.push(S('M64 112 C54 116 50 128 56 138 C62 134 66 126 68 118 Z', C.mustard), L('M58 126 l5 -2 M58 132 l5 -2', 1.1, C.mustardD));
  b.push(S('M136 112 C146 116 150 128 144 138 C138 134 134 126 132 118 Z', C.mustardD));
  // tepe tüyü
  b.push(S('M94 72 C90 58 96 52 100 60 C102 50 110 50 106 64 C112 58 116 62 108 72 Z', C.mustard));
  // gözler: iri, merakla yukarı
  const eye = (cx, cy) => `<ellipse cx="${cx}" cy="${cy}" rx="9" ry="10" fill="${C.cream}" stroke="${C.ink}" stroke-width="1.8"/>
    <circle cx="${cx + 1}" cy="${cy - 1.6}" r="6.4" fill="${C.cobalt}" stroke="${C.ink}" stroke-width="1"/>
    <circle cx="${cx + 1}" cy="${cy - 1.6}" r="3.6" fill="${C.ink}"/><circle cx="${cx - 1.6}" cy="${cy - 4.4}" r="1.8" fill="#FFFDF6"/><circle cx="${cx + 3}" cy="${cy + 1}" r=".9" fill="#FFFDF6"/>`;
  b.push(eye(86, 98), eye(114, 98));
  b.push(L('M77 84 C80 82 86 82 90 85 M110 85 C114 82 120 82 123 84', 1.6));
  b.push(`<circle cx="76" cy="112" r="5" fill="${C.pink}" opacity=".6"/><circle cx="124" cy="112" r="5" fill="${C.pink}" opacity=".6"/>`);
  // gaga (hafif açık, şaşkın)
  b.push(S('M92 108 C96 104 104 104 108 108 L100 116 Z', C.ginger, 'stroke-width="1.6"'), S('M94 113 L106 113 L100 120 Z', C.gingerD, 'stroke-width="1.4"'));
  return wrap(id, b.join(''));
}
