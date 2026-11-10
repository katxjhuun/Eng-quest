import { C, P, B, O, E, wrap } from './common.js';
// Bitki — saksıda kürek kaktüs figürü; bir kolu yeşil ve tomurcuklu, öbürü kurumuş-dikenli. Ağır kapaklı sakin gözler.
export function plant(id = 'plant') {
  const b = [];
  // saksı
  b.push(P('M58 142 L142 142 L132 188 L68 188 Z', C.rust), P('M112 142 L142 142 L132 188 L106 188 Z', C.rustD));
  b.push(P('M52 132 L148 132 L148 144 L52 144 Z', C.rustD));
  for (const x of [76, 92, 108, 124]) b.push(P(`M${x} 156 L${x + 6} 162 L${x} 168 L${x - 6} 162 Z`, C.ochre));
  // gövde: uzun kürek
  b.push(P('M78 134 C74 96 80 56 100 48 C120 56 126 96 122 134 Z', C.olive));
  b.push(P('M100 48 C120 56 126 96 122 134 L104 134 C112 104 112 70 100 48 Z', C.oliveD));
  // sol kol: canlı, yukarı, tomurcuk
  b.push(P('M80 100 C62 100 52 88 54 70 C60 70 66 74 68 82 C70 88 76 90 82 90 Z', C.olive));
  b.push(E(56, 64, 6, 8, C.salmon), P('M56 56 A6 8 0 0 1 56 72 C59 68 59 60 56 56 Z', C.rust, 'opacity=".55"'));
  // sağ kol: kurumuş, aşağı sarkık, dikenli
  b.push(P('M114 94 C138 92 150 102 152 120 C147 123 142 118 140 112 C137 105 128 104 114 106 Z', C.sandD));
  b.push(B('M132 98 l3 -6 M142 104 l6 -3 M148 114 l7 1 M126 98 l0 -6', 1.2, C.grayD));
  // dikenler (gövde): küçük çapraz çizgiler
  for (const [x, y] of [[86, 70], [90, 110], [112, 64], [114, 116], [84, 124], [108, 92]]) b.push(B(`M${x - 2} ${y - 2} l4 4 M${x + 2} ${y - 2} l-4 4`, 1, C.sand));
  // yüz: ağır kapaklı iki göz, düz ağız
  for (const [x, lid] of [[92, C.olive], [108, C.oliveD]]) {
    b.push(E(x, 86, 5, 4, C.cream), O(x, 86.6, 2.6, C.black));
    b.push(P(`M${x - 6} 86 C${x - 3} 83.6 ${x + 3} 83.6 ${x + 6} 86 L${x + 6} 80 L${x - 6} 80 Z`, lid));
  }
  b.push(B('M95 96 H105', 1.4, C.black));
  // düşmüş kuru parça
  b.push(P('M150 186 C154 180 162 178 168 182 C162 188 156 188 150 186 Z', C.sandD));
  return wrap(id, b.join(''));
}
