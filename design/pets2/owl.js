import { C, P, B, O, E, wrap } from './common.js';
// Baykuş — önden, dalda; eş merkezli halka gözler (yarı kapalı kapak), pul pul göğüs, katmanlı kanat.
export function owl(id = 'owl') {
  const b = [];
  // dal
  b.push(P('M0 164 L200 156 L200 168 L0 176 Z', C.grayD), P('M150 158 C158 146 170 142 182 144 C176 152 164 158 150 158 Z', C.olive));
  // gövde: yuvarlatılmış üçgen, iki düzlem
  b.push(P('M100 40 C136 40 152 80 150 118 C148 148 128 164 100 164 C72 164 52 148 50 118 C48 80 64 40 100 40 Z', C.slate));
  b.push(P('M100 40 C136 40 152 80 150 118 C148 148 128 164 100 164 Z', C.slateD));
  // kulak tüyleri
  b.push(P('M64 58 L58 30 L84 48 Z', C.slate), P('M136 58 L142 30 L116 48 Z', C.slateD));
  // göğüs: kum zemin + sıra sıra pul (yarım daire)
  b.push(P('M72 112 C72 96 128 96 128 112 C128 140 116 156 100 156 C84 156 72 140 72 112 Z', C.sand));
  for (let r = 0; r < 4; r++) for (let i = 0; i < 5 - (r > 1 ? 1 : 0); i++) {
    const x = 80 + i * 10 + (r % 2) * 5 + (r > 1 ? 5 : 0), y = 108 + r * 11;
    b.push(P(`M${x - 4} ${y} A4 4 0 0 0 ${x + 4} ${y} Z`, C.rust, 'opacity=".85"'));
  }
  // kanatlar: üst üste üç bant
  for (const [s, col] of [[1, C.slateD], [-1, C.slate]]) {
    const x0 = s > 0 ? 150 : 50;
    b.push(P(`M${x0} 90 C${x0 + s * 10} 110 ${x0 + s * 8} 140 ${x0 - s * 6} 158 C${x0 - s * 12} 140 ${x0 - s * 12} 112 ${x0} 90 Z`, col));
    b.push(B(`M${x0 - s * 2} 112 l${s * 7} 4 M${x0 - s * 4} 126 l${s * 8} 4 M${x0 - s * 5} 140 l${s * 7} 4`, 1.4, C.sand, 'opacity=".7"'));
  }
  // yüz diski: iki daire
  b.push(O(80, 80, 20, C.ochre), O(120, 80, 20, C.ochreD));
  // gözler: eş merkezli halkalar + kapak (yarı kapalı)
  for (const x of [80, 120]) {
    b.push(O(x, 80, 13, C.cream), O(x, 80, 9.5, C.rust), O(x, 80, 5, C.black), O(x - 2, 78.5, 1.2, C.cream));
    b.push(P(`M${x - 14} 80 A14 14 0 0 1 ${x + 14} 80 L${x + 14} 78 C${x + 6} 74 ${x - 6} 74 ${x - 14} 78 Z`, x < 100 ? C.ochre : C.ochreD));
    b.push(P(`M${x - 14} 66 L${x + 14} 66 L${x + 14} 78 C${x + 6} 74 ${x - 6} 74 ${x - 14} 78 Z`, x < 100 ? C.ochre : C.ochreD));
  }
  // gaga
  b.push(P('M95 90 L105 90 L100 104 Z', C.black));
  // pençeler
  b.push(B('M84 162 l-3 6 M88 162 l0 7 M92 162 l3 6 M108 162 l-3 6 M112 162 l0 7 M116 162 l3 6', 2, C.black));
  return wrap(id, b.join(''));
}
