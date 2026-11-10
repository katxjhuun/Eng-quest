import { C, P, B, O, E, wrap } from './common.js';
// Gecko — profil, taşta güneşleniyor, başı güneşe kalkık; sırtta üçgen diken dizisi, halka göz, sarmal kuyruk.
export function gecko(id = 'gecko') {
  const b = [];
  // taş
  b.push(P('M10 186 C14 160 50 146 100 146 C150 146 186 160 190 186 Z', C.sand));
  b.push(P('M100 146 C150 146 186 160 190 186 L120 186 C132 170 124 154 100 146 Z', C.sandD));
  // güneş
  b.push(O(168, 34, 18, C.ochre), O(168, 34, 11, C.ochreD, 'opacity=".4"'));
  // kuyruk: sarmal bant
  b.push(B('M58 140 C34 140 22 126 28 112 C32 102 46 102 48 112 C49 118 42 120 40 116', 10, C.teal));
  // uzak bacaklar
  b.push(B('M70 142 L62 150 L56 148', 5, C.tealD), B('M128 136 L138 146 L146 146', 5, C.tealD));
  // gövde
  b.push(P('M52 136 C60 120 92 114 124 116 C140 118 148 124 150 132 C146 142 126 146 100 146 C78 146 60 144 52 136 Z', C.teal));
  b.push(P('M56 138 C72 146 112 148 148 134 C144 144 124 150 100 150 C80 150 64 146 56 138 Z', C.tealD));
  // diken dizisi
  b.push(P('M64 124 L70 112 L76 122 L82 110 L88 120 L94 108 L100 118 L106 108 L112 118 L118 110 L124 118 L130 112 L134 120 Z', C.rust));
  // benekler
  for (const [x, y, r] of [[74, 132, 3.6], [92, 128, 4.2], [110, 130, 3.6], [126, 128, 3], [84, 140, 2.2], [102, 141, 2.4]]) b.push(O(x, y, r, C.ochre));
  // yakın bacaklar + yuvarlak parmaklar
  b.push(B('M86 144 L80 158 L70 160', 6, C.teal)); for (const [x, y] of [[66, 157], [65, 162], [70, 164]]) b.push(O(x, y, 2.6, C.teal));
  b.push(B('M134 140 L140 156 L150 158', 6, C.teal)); for (const [x, y] of [[154, 154], [155, 159], [151, 163]]) b.push(O(x, y, 2.6, C.teal));
  // baş: güneşe kalkık geniş kama
  b.push(P('M136 124 C138 104 152 92 170 94 C182 96 188 104 186 112 C182 122 166 130 148 132 Z', C.teal));
  b.push(P('M148 132 C166 130 182 122 186 112 C180 126 166 134 150 136 Z', C.tealD));
  b.push(B('M154 124 C164 124 176 120 184 113', 1.4, C.tealD));
  // göz: halka, dikey yarık, gözü kırpmayan
  b.push(O(160, 106, 8, C.cream), O(160.5, 106, 6, C.ochre), P('M160.5 100.5 Q162.5 106 160.5 111.5 Q158.5 106 160.5 100.5 Z', C.black), O(158, 103.5, 0.9, C.cream));
  // dil: mavi
  b.push(B('M186 110 L196 106', 2.2, C.slate));
  return wrap(id, b.join(''));
}
