import { C, S, F, L, H, wrap } from './common.js';
// Gecko — güneşte taşın üstünde hareketsiz; farklı, tarif edilemez. Petrol yeşili pul, hardal benekler, mercan sırt.
export function gecko(id = 'gecko') {
  const b = [];
  // sıcak taş
  b.push(S('M18 172 C22 150 60 140 104 142 C150 144 182 152 186 172 C150 182 54 182 18 172 Z', C.ashL));
  b.push(F('M120 146 C158 150 182 158 186 172 C170 176 150 178 130 178 C140 168 138 156 120 146 Z', C.ash), H('M120 146 C158 150 182 158 186 172 C170 176 150 178 130 178 C140 168 138 156 120 146 Z', id));
  b.push(L('M50 160 c10 -3 20 -3 30 0 M100 154 c8 -2 16 -1 22 2', 1.3, C.ashD));
  // güneş
  b.push(`<circle cx="164" cy="38" r="14" fill="${C.mustard}" stroke="${C.ink}" stroke-width="2"/>`, L('M164 16 v-6 M164 66 v-6 M186 38 h6 M136 38 h6 M180 22 l4 -4 M144 58 l-4 4 M180 54 l4 4 M144 22 l-4 -4', 2, C.mustardD));
  // kuyruk (kıvrık, sarmal)
  b.push(S('M58 146 C40 146 24 138 24 124 C24 112 36 108 44 114 C50 119 46 128 40 126 C38 122 42 120 42 118 C36 116 32 122 34 128 C38 136 50 138 62 136 Z', C.teal));
  b.push(L('M30 124 l4 2 M36 132 l4 0 M46 136 l2 -3', 1.3, C.tealD));
  // arka bacaklar
  b.push(S('M64 138 C58 128 50 126 46 130 C52 134 56 140 60 146 Z', C.tealD), L('M46 130 l-6 -4 M46 130 l-7 1 M46 130 l-5 5', 2, C.tealD));
  b.push(S('M86 146 C84 156 76 160 70 162 L74 166 C84 164 92 158 96 148 Z', C.teal), L('M70 162 l-7 -2 M70 162 l-6 4 M70 162 l-2 7', 2, C.tealD));
  // gövde
  b.push(S('M54 140 C62 124 90 118 116 120 C134 122 146 128 150 136 C146 146 130 150 112 150 C88 152 66 150 54 140 Z', C.teal));
  b.push(F('M56 140 C70 150 100 152 130 148 C140 146 146 142 150 136 C146 146 130 152 110 152 C86 154 64 150 56 140 Z', C.tealD), H('M70 146 C96 152 128 150 146 140 C140 148 124 152 106 152 C90 152 78 150 70 146 Z', id));
  // sırt pulları ve benekler
  b.push(L('M66 128 l4 -5 l4 5 l4 -6 l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -5 l4 5', 1.8, C.brick));
  for (const [x, y, r] of [[72, 136, 3], [86, 132, 3.6], [100, 138, 2.6], [112, 130, 3.2], [126, 136, 2.8], [62, 134, 2.2], [94, 144, 2], [118, 144, 2]]) b.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${C.mustard}" stroke="${C.ink}" stroke-width="1"/>`);
  // ön bacaklar (yapışkan parmaklar)
  b.push(S('M124 146 C124 156 120 162 114 164 L118 168 C126 166 132 158 134 148 Z', C.teal));
  for (const [x, y] of [[112, 164], [116, 169], [120, 170]]) b.push(`<circle cx="${x}" cy="${y}" r="2.4" fill="${C.tealD}" stroke="${C.ink}" stroke-width="1"/>`);
  b.push(S('M140 140 C146 150 150 156 156 158 L156 162 C148 162 140 154 136 144 Z', C.tealD));
  // baş (geniş, yassı) — başını güneşe kaldırmış
  b.push(S('M138 130 C142 116 156 108 172 110 C186 112 194 120 192 128 C190 136 178 142 160 142 C150 142 142 138 138 130 Z', C.teal));
  b.push(F('M140 132 C150 140 172 142 186 136 C180 142 168 144 156 143 C148 142 142 138 140 132 Z', C.tealD));
  b.push(L('M160 138 C170 140 180 138 188 132', 1.5));
  b.push(`<circle cx="186" cy="122" r="1.2" fill="${C.ink}"/>`);
  // tek büyük göz: altın iris, dikey yarık, gözü kırpmayan bakış
  b.push(`<circle cx="164" cy="120" r="9" fill="${C.cream}" stroke="${C.ink}" stroke-width="1.8"/>
    <circle cx="165" cy="120" r="7" fill="${C.mustard}" stroke="${C.ink}" stroke-width="1"/>
    <path d="M165 113 C163 116 163 124 165 127 C167 124 167 116 165 113 Z" fill="${C.ink}"/>
    <circle cx="162" cy="117" r="1.4" fill="#FFFDF6"/>`);
  b.push(L('M152 112 C158 106 170 106 176 111', 2.2));
  // dil (mavinin tadını alıyor)
  b.push(S('M190 130 C196 130 198 128 200 124 C200 130 198 134 192 134 Z', C.cobalt, 'stroke-width="1.4"'));
  return wrap(id, b.join(''));
}
