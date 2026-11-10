import { C, P, B, O, E, wrap } from './common.js';
// Kedi — kara kedi, profil, oturuyor. Bencil, cazibe merkezi: dik duruş, yarı kapalı hardal göz, burnu havada.
export function cat(id = 'cat') {
  const b = [];
  // kuyruk: yerde dönen kalın bant
  b.push(B('M66 184 C36 184 26 168 36 154 C42 146 52 148 52 156', 11, C.black));
  // gövde (iki düzlem)
  b.push(P('M58 186 C54 142 68 112 100 104 C122 98 136 112 140 132 L144 186 Z', C.black));
  b.push(P('M120 108 C134 118 140 140 142 160 L144 186 L128 186 C130 160 128 132 120 108 Z', C.soot));
  // arka uyluğu ayıran kâğıt çizgisi
  b.push(B('M66 168 C70 146 86 136 102 142', 1.6, C.paper));
  // ön bacak
  b.push(P('M120 146 L134 144 L138 186 L122 186 Z', C.soot), B('M121 186 L122 150', 1.2, C.paper));
  b.push(P('M120 186 C120 181 140 181 140 186 Z', C.grayD));
  // tasma + madalyon
  b.push(P('M100 102 C112 108 130 108 140 100 L142 106 C132 116 112 116 98 108 Z', C.rust), O(126, 116, 5, C.ochre), O(126, 116, 1.6, C.ochreD));
  // baş: daire + öne çıkan ağız
  b.push(O(122, 80, 26, C.black));
  b.push(P('M136 74 C150 74 156 84 154 92 C150 98 140 98 132 94 Z', C.black));
  b.push(P('M126 56 C142 62 150 76 148 92 C146 98 140 102 134 104 C142 88 140 70 126 56 Z', C.soot));
  // kulaklar (üçgen) + iç kulak
  b.push(P('M102 66 L104 34 L122 56 Z', C.black), P('M106 60 L107 42 L117 55 Z', C.rustD));
  b.push(P('M128 56 L144 32 L148 64 Z', C.black), P('M133 55 L143 40 L145 59 Z', C.rust));
  // göz: yarı kapalı hardal badem, dikey yarık
  b.push(P('M126 76 Q137 68 148 76 Q137 82 126 76 Z', C.ochre));
  b.push(P('M126 75 Q137 70 148 75 L148 72 Q137 66 126 72 Z', C.black));
  b.push(P('M137 71 Q139 76 137 81 Q135 76 137 71 Z', C.black), O(132, 75, 0.9, C.cream));
  // burun, bıyık
  b.push(P('M151 86 L156 86 L154 90 Z', C.salmon));
  b.push(B('M148 92 L178 86 M148 94 L180 96 M147 96 L174 104', 0.9, C.cream, 'opacity=".8"'));
  return wrap(id, b.join(''));
}
