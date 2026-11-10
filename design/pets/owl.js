import { C, S, F, L, H, wrap } from './common.js';
// Baykuş — gece kuşu; dalda, gözler yarı kapalı ama tetikte. Kobalt-krem tüy, büyük yüz diski, kahve fincanı yanında.
export function owl(id = 'owl') {
  const b = [];
  // dal
  b.push(S('M8 166 C50 160 120 164 192 156 L192 168 C130 176 60 174 8 178 Z', C.bark), L('M30 170 l12 -1 M80 169 l14 0 M140 166 l12 -1', 1.3, C.barkD));
  b.push(S('M160 160 C166 148 176 144 186 146 C180 154 170 160 160 160 Z', C.sage), L('M162 159 L183 148', 1, C.sageD));
  // kuyruk
  b.push(S('M88 150 L80 178 L96 172 L100 182 L106 172 L120 178 L112 150 Z', C.cobaltD));
  // gövde
  b.push(S('M58 110 C54 74 74 46 100 46 C126 46 146 74 142 110 C140 140 124 160 100 160 C76 160 60 140 58 110 Z', C.cobalt));
  b.push(F('M126 58 C142 76 146 100 142 120 C138 144 124 158 108 160 C130 140 136 96 126 58 Z', C.cobaltD), H('M126 58 C142 76 146 100 142 120 C138 144 124 158 108 160 C130 140 136 96 126 58 Z', id));
  // göğüs: krem, ok tüyler
  b.push(S('M76 112 C78 96 122 96 124 112 C126 136 114 152 100 152 C86 152 74 136 76 112 Z', C.cream, 'stroke-width="1.6"'));
  for (const [x, y] of [[88, 110], [100, 108], [112, 110], [84, 122], [96, 120], [108, 120], [118, 122], [90, 132], [102, 132], [114, 132], [96, 143], [108, 143]]) b.push(L(`M${x - 3} ${y} l3 3 l3 -3`, 1.3, C.brick));
  // kanatlar
  b.push(S('M58 100 C46 112 46 140 62 156 C70 146 72 124 68 106 Z', C.cobaltD), L('M54 122 l8 2 M54 132 l9 2 M57 142 l8 1', 1.2, C.cream));
  b.push(S('M142 100 C154 112 154 140 138 156 C130 146 128 124 132 106 Z', C.cobaltD), L('M146 122 l-8 2 M146 132 l-9 2 M143 142 l-8 1', 1.2, C.cream));
  // kulak tüyleri
  b.push(S('M66 64 L54 34 L82 54 Z', C.cobalt), S('M134 64 L146 34 L118 54 Z', C.cobaltD));
  // yüz diski
  b.push(S('M64 80 C64 58 84 54 100 66 C116 54 136 58 136 80 C136 100 118 106 100 98 C82 106 64 100 64 80 Z', C.mustard));
  b.push(L('M70 70 l4 3 M70 88 l4 -2 M130 70 l-4 3 M130 88 l-4 -2 M100 70 v6', 1.2, C.mustardD));
  // gözler: büyük, yarı kapaklı (gündüz uykulu ama izliyor)
  const eye = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="13" fill="${C.cream}" stroke="${C.ink}" stroke-width="2"/>
    <circle cx="${cx + 1}" cy="${cy + 2}" r="9" fill="${C.ginger}" stroke="${C.ink}" stroke-width="1"/>
    <circle cx="${cx + 1}" cy="${cy + 2}" r="5" fill="${C.ink}"/><circle cx="${cx - 2}" cy="${cy + 0.5}" r="1.6" fill="#FFFDF6"/>
    <path d="M${cx - 14} ${cy - 1} C${cx - 8} ${cy - 3} ${cx + 8} ${cy - 3} ${cx + 14} ${cy - 1} L${cx + 14} ${cy - 14} L${cx - 14} ${cy - 14} Z" fill="${C.mustard}"/>
    <path d="M${cx - 13} ${cy - 1} C${cx - 7} ${cy - 3.4} ${cx + 7} ${cy - 3.4} ${cx + 13} ${cy - 1}" fill="none" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round"/>`;
  b.push(eye(84, 80), eye(116, 80));
  b.push(L('M72 66 C78 62 86 62 92 66 M108 66 C114 62 122 62 128 66', 2, C.mustardD));
  // gaga
  b.push(S('M95 88 C97 84 103 84 105 88 L100 100 Z', C.ginger, 'stroke-width="1.6"'));
  // pençeler
  b.push(L('M86 158 l-4 8 M90 158 l0 9 M94 158 l4 8 M106 158 l-4 8 M110 158 l0 9 M114 158 l4 8', 2.4, C.brickD));
  // kahve fincanı (kısır döngü)
  b.push(S('M150 140 L170 140 L167 160 L153 160 Z', C.cream), L('M170 145 c6 0 6 9 0 9', 2), L('M154 150 h12', 1.2, C.brick));
  b.push(L('M156 134 c-3 -4 3 -6 0 -10 M164 134 c-3 -4 3 -6 0 -10', 1.2, C.ashD));
  return wrap(id, b.join(''));
}
