import { C, P, B, O, E, wrap } from './common.js';
// Kurt-köpek — profil, ayakta, sola bakıyor; uzun ince bacaklar, kama burun, eyer deseni, tüy kuyruk.
export function dog(id = 'dog') {
  const b = [];
  // kuyruk: üst üste kamalar
  b.push(P('M150 108 C170 110 182 128 178 152 L168 146 C170 132 162 120 150 118 Z', C.gray));
  b.push(P('M170 136 L178 152 L166 150 Z', C.sand));
  // uzak bacaklar
  b.push(P('M140 142 L148 142 L150 186 L143 186 Z', C.grayD), P('M74 144 L82 144 L80 186 L73 186 Z', C.grayD));
  // gövde: alt kum, üst gri, sırt eyeri
  b.push(P('M60 116 C62 100 90 94 120 96 C146 98 158 108 156 124 C154 140 140 148 116 148 L80 148 C66 146 58 132 60 116 Z', C.gray));
  b.push(P('M64 132 C74 146 100 150 120 148 C138 148 150 142 154 132 C150 146 138 152 116 152 L82 152 C70 150 64 142 64 132 Z', C.sand));
  b.push(P('M86 98 C104 92 134 94 150 104 C144 112 128 112 116 108 C104 104 94 104 86 98 Z', C.slateD));
  // yakın bacaklar (ince, eklemli)
  b.push(P('M126 140 L138 140 L136 160 L140 186 L132 186 L128 162 Z', C.gray));
  b.push(P('M86 140 L98 140 L96 186 L88 186 Z', C.gray));
  b.push(P('M86 186 L98 186 L100 182 L88 182 Z', C.sandD), P('M131 186 L142 186 L143 182 L132 182 Z', C.sandD));
  // boyun yelesi: zikzak kamalar
  b.push(P('M50 108 L60 90 L76 86 L88 104 L82 122 L74 116 L70 126 L64 116 L58 124 L56 112 Z', C.gray));
  b.push(P('M56 112 L58 124 L64 116 L70 126 L74 116 L82 122 L80 128 L54 128 Z', C.sand));
  // fular
  b.push(P('M60 104 L86 108 L84 116 L58 112 Z', C.rust), P('M70 112 L78 114 L72 128 Z', C.rustD));
  // baş: kama
  b.push(P('M58 92 C56 72 68 60 84 62 C92 64 96 72 94 82 L92 90 Z', C.gray));
  b.push(P('M60 78 L26 90 C24 96 28 100 34 100 L66 98 Z', C.gray));
  b.push(P('M28 96 L34 100 L66 98 L64 94 Z', C.sand));
  b.push(P('M72 62 C86 60 96 70 94 82 L92 90 L84 88 C88 78 84 68 72 62 Z', C.slateD));
  // kulaklar
  b.push(P('M70 64 L74 36 L88 62 Z', C.gray), P('M74 60 L76 46 L84 60 Z', C.slateD));
  b.push(P('M80 64 L92 40 L96 68 Z', C.slate));
  // göz: küçük amber, ciddi kaş çizgisi
  b.push(P('M56 78 Q62 73 68 78 Q62 81 56 78 Z', C.ochre), O(62, 77.5, 1.8, C.black), O(61.2, 76.6, 0.6, C.cream));
  b.push(B('M54 74 L68 72', 1.8, C.slateD));
  // burun, ağız çizgisi
  b.push(E(26, 91, 4, 3, C.black), B('M30 98 C40 100 50 98 58 94', 1.2, C.slateD));
  return wrap(id, b.join(''));
}
