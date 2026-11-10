import { C, P, B, O, E, wrap } from './common.js';
// Gecko — üstten görünüş, sıcak taşta güneşleniyor; geometrik benek deseni, yuvarlak parmak uçları.
export function gecko(id = 'gecko') {
  const b = [];
  // taş: düz kum lekesi, gölge düzlemi
  b.push(P('M30 120 C30 70 80 40 120 44 C166 48 184 92 176 132 C168 170 120 186 80 176 C44 168 30 150 30 120 Z', C.sand));
  b.push(P('M120 44 C166 48 184 92 176 132 C168 170 120 186 80 176 C130 168 160 110 120 44 Z', C.sandD));
  // kuyruk: sarmal, incelen
  b.push(B('M100 132 C102 152 92 166 76 166 C62 166 56 154 62 146 C66 140 74 142 74 148', 9, C.teal));
  b.push(B('M74 148 C74 152 70 152 69 150', 5, C.teal));
  // bacaklar + yuvarlak parmaklar
  const leg = (d, toes) => { b.push(B(d, 6, C.tealD)); for (const [x, y] of toes) b.push(O(x, y, 2.6, C.tealD)); };
  leg('M88 82 L74 74 L68 62', [[62, 60], [66, 56], [72, 57]]);
  leg('M112 82 L126 74 L132 62', [[128, 57], [134, 56], [138, 60]]);
  leg('M90 122 L76 132 L70 144', [[64, 146], [68, 150], [74, 149]]);
  leg('M110 122 L124 132 L130 144', [[126, 149], [132, 150], [136, 146]]);
  // gövde: elips + baş
  b.push(E(100, 102, 16, 30, C.teal));
  b.push(P('M100 72 A16 30 0 0 1 100 132 C108 116 108 88 100 72 Z', C.tealD));
  b.push(P('M86 64 C86 48 92 40 100 40 C108 40 114 48 114 64 C114 72 108 76 100 76 C92 76 86 72 86 64 Z', C.teal));
  b.push(P('M100 40 C108 40 114 48 114 64 C114 72 108 76 100 76 C106 66 106 50 100 40 Z', C.tealD));
  // gözler: yanlarda altın, yarık
  for (const x of [87, 113]) b.push(O(x, 54, 4, C.ochre), P(`M${x} 50.5 Q${x + 1} 54 ${x} 57.5 Q${x - 1} 54 ${x} 50.5 Z`, C.black));
  // sırt deseni: hardal daireler + pas kamalar
  for (const [y, r] of [[84, 3.4], [96, 4], [108, 3.6], [120, 3]]) b.push(O(100, y, r, C.ochre));
  for (const y of [90, 102, 114]) b.push(P(`M88 ${y} L93 ${y - 3} L93 ${y + 3} Z`, C.rust), P(`M112 ${y} L107 ${y - 3} L107 ${y + 3} Z`, C.rust));
  b.push(O(100, 140, 2.4, C.ochre), O(96, 150, 2, C.ochre));
  // güneş: köşede düz daire
  b.push(O(170, 30, 16, C.ochre), O(170, 30, 10, C.ochreD, 'opacity=".35"'));
  return wrap(id, b.join(''));
}
