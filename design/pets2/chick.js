import { C, P, B, O, E, wrap } from './common.js';
// Civciv — profil, kabuktan yeni çıkmış, habersiz; tek nokta göz yukarı bakıyor.
export function chick(id = 'chick') {
  const b = [];
  // bacaklar
  b.push(B('M92 170 L90 186 M90 186 l-7 0 M90 186 l6 0 M106 170 L108 186 M108 186 l-6 0 M108 186 l7 0', 2.2, C.rust));
  // gövde (iki yarım daire düzlemi)
  b.push(O(100, 132, 40, C.ochre));
  b.push(P('M100 92 A40 40 0 0 1 100 172 C118 160 124 124 100 92 Z', C.ochreD));
  // kanat: üç kat kama
  b.push(P('M80 124 C90 120 104 124 110 134 C100 140 88 140 78 136 Z', C.ochreD));
  // baş
  b.push(O(112, 82, 22, C.ochre), P('M112 60 A22 22 0 0 1 112 104 C124 94 126 72 112 60 Z', C.ochreD));
  // tepe tüyü: üç ince kama
  b.push(P('M106 62 L104 48 L110 60 Z', C.ochre), P('M110 60 L112 44 L115 60 Z', C.ochreD), P('M114 61 L120 48 L118 62 Z', C.ochre));
  // gaga
  b.push(P('M132 80 L148 84 L132 88 Z', C.rust), P('M132 84 L148 84 L132 88 Z', C.rustD));
  // göz: nokta + kâğıt halka, yukarı
  b.push(O(122, 76, 4.2, C.cream), O(123, 75, 2.8, C.black), O(122.2, 74, 0.8, C.cream));
  // kabuk: kırık yumurta yarımı, kâğıt beyazı + ince mavi benek
  b.push(P('M60 140 C62 170 80 184 100 184 C120 184 138 170 140 140 L130 150 L122 138 L112 152 L102 138 L92 150 L82 138 L72 150 Z', C.cream));
  b.push(P('M120 140 L122 138 L130 150 L140 140 C138 170 120 184 100 184 C118 176 126 160 120 140 Z', C.sand));
  b.push(O(86, 164, 1.6, C.slate), O(108, 172, 1.4, C.slate), O(96, 158, 1.1, C.slate));
  return wrap(id, b.join(''));
}
