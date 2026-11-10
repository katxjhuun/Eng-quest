import { C, P, B, O, E, wrap } from './common.js';
// Kurt-köpek — önden oturuyor, simetrik; sol yarı açık gri, sağ yarı arduvaz. Göğüste kat kat yele, ağır kapaklı amber gözler.
export function dog(id = 'dog') {
  const b = [];
  // kuyruk: yanda yerde
  b.push(P('M136 176 C158 178 176 170 182 156 C170 162 152 164 136 164 Z', C.grayD));
  // gövde (oturan, armut)
  b.push(P('M100 92 C130 92 146 130 146 160 L146 186 L54 186 L54 160 C54 130 70 92 100 92 Z', C.gray));
  b.push(P('M100 92 C130 92 146 130 146 160 L146 186 L100 186 Z', C.slateD));
  // göğüs yelesi: kat kat kamalar (kum)
  b.push(P('M76 112 L124 112 L118 150 L100 168 L82 150 Z', C.sand));
  b.push(P('M100 112 L124 112 L118 150 L100 168 Z', C.sandD));
  for (const y of [122, 134, 146]) b.push(P(`M${82 + (y - 122) / 4} ${y} L100 ${y + 8} L${118 - (y - 122) / 4} ${y}`, 'none', `stroke="${C.grayD}" stroke-width="1.6" stroke-linejoin="round"`));
  // ön bacaklar
  b.push(P('M78 150 L92 150 L92 186 L76 186 Z', C.gray), P('M108 150 L122 150 L124 186 L108 186 Z', C.slateD));
  b.push(P('M74 186 L94 186 L94 181 L76 181 Z', C.sandD), P('M106 186 L126 186 L124 181 L108 181 Z', C.sandD));
  // baş: ters ev biçimi + uzun burun üçgeni
  b.push(P('M68 52 L100 40 L132 52 L130 84 L100 112 L70 84 Z', C.gray));
  b.push(P('M100 40 L132 52 L130 84 L100 112 Z', C.slateD));
  // alın maskesi
  b.push(P('M84 48 L100 42 L116 48 L100 72 Z', C.black, 'opacity=".55"'));
  // yanaklar kum
  b.push(P('M70 84 L86 80 L100 112 Z', C.sand), P('M130 84 L114 80 L100 112 Z', C.sandD));
  // kulaklar: uzun üçgen
  b.push(P('M70 56 L66 14 L92 44 Z', C.gray), P('M74 50 L72 26 L86 44 Z', C.rustD));
  b.push(P('M130 56 L134 14 L108 44 Z', C.slateD), P('M126 50 L128 26 L114 44 Z', C.rust));
  // gözler: amber, ağır üst kapak
  for (const [x, lid] of [[86, C.gray], [114, C.slateD]]) {
    b.push(E(x, 66, 7, 5, C.cream), O(x, 66.5, 4, C.ochre), O(x, 66.5, 2, C.black), O(x - 1.4, 65.4, 0.7, C.cream));
    b.push(P(`M${x - 8} 66 C${x - 4} 62.5 ${x + 4} 62.5 ${x + 8} 66 L${x + 8} 58 L${x - 8} 58 Z`, lid));
  }
  // burun ve ağız
  b.push(P('M94 98 L106 98 L100 106 Z', C.black), B('M100 106 L100 110', 1.4, C.black));
  // fular düğümü (küçük)
  b.push(P('M90 112 L110 112 L100 122 Z', C.rust));
  return wrap(id, b.join(''));
}
