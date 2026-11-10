import { C, P, B, O, E, wrap } from './common.js';
// Civciv — profil, kabukta oturuyor; büyük baş, halka göz (saf, habersiz), tüy pulları, küçük gaga.
export function chick(id = 'chick') {
  const b = [];
  // gövde: yarım daire, iki düzlem
  b.push(P('M50 150 C50 112 74 96 104 96 C134 96 150 116 150 150 Z', C.ochre));
  b.push(P('M104 96 C134 96 150 116 150 150 L112 150 C122 132 120 110 104 96 Z', C.ochreD));
  // tüy pulları
  for (let r = 0; r < 3; r++) for (let i = 0; i < 5 - r; i++) {
    const x = 66 + i * 12 + r * 6, y = 118 + r * 10;
    b.push(P(`M${x - 5} ${y} A5 5 0 0 0 ${x + 5} ${y}`, 'none', `stroke="${C.ochreD}" stroke-width="1.6"`));
  }
  // kanat kaması
  b.push(P('M92 120 C110 116 126 124 130 140 C116 142 102 138 92 120 Z', C.ochreD));
  // baş: büyük daire
  b.push(O(112, 70, 30, C.ochre));
  b.push(P('M112 40 A30 30 0 0 1 112 100 C130 86 132 56 112 40 Z', C.ochreD));
  // tepe tüyleri
  b.push(P('M102 42 L96 22 L110 40 Z', C.ochre), P('M110 40 L112 18 L118 41 Z', C.ochreD));
  // göz: halka, tam açık, yukarı
  b.push(O(124, 62, 9, C.cream), O(125, 61, 6, C.slate), O(125.5, 60.5, 3.2, C.black), O(123.5, 58.5, 1.1, C.cream));
  // gaga: küçük, hafif açık
  b.push(P('M140 72 L154 70 L141 77 Z', C.rust), P('M141 77 L152 76 L141 81 Z', C.rustD));
  // kabuk
  b.push(P('M44 146 L56 156 L66 144 L78 156 L90 144 L102 156 L114 144 L126 156 L138 144 L150 156 L156 146 C154 172 130 188 100 188 C70 188 46 172 44 146 Z', C.cream));
  b.push(P('M114 144 L126 156 L138 144 L150 156 L156 146 C154 172 130 188 100 188 C126 178 132 160 114 144 Z', C.sand));
  for (const [x, y, r] of [[70, 170, 1.8], [90, 178, 1.4], [62, 160, 1.2], [104, 170, 1.5]]) b.push(O(x, y, r, C.slate));
  return wrap(id, b.join(''));
}
