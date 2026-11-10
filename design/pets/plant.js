import { C, S, F, L, H, wrap } from './common.js';
// Bitki — sabır ve dayanıklılık; yarısı yeşil, yarısı kurumuş-dikenli. Ne umutlu ne umutsuz, sakin yüz.
export function plant(id = 'plant') {
  const b = [];
  b.push(`<ellipse cx="100" cy="188" rx="48" ry="5" fill="${C.ink}" opacity=".16"/>`);
  // saksı
  b.push(S('M62 140 L138 140 L130 186 L70 186 Z', C.brick));
  b.push(F('M118 140 L138 140 L130 186 L114 186 Z', C.brickD), H('M118 140 L138 140 L130 186 L114 186 Z', id));
  b.push(S('M56 130 L144 130 L144 142 L56 142 Z', C.ginger));
  b.push(L('M72 156 L128 156 M74 170 L126 170', 1.6, C.cream), `<circle cx="84" cy="163" r="2" fill="${C.mustard}"/><circle cx="100" cy="163" r="2" fill="${C.mustard}"/><circle cx="116" cy="163" r="2" fill="${C.mustard}"/>`);
  // toprak
  b.push(S('M60 131 C70 124 130 124 140 131 Z', C.barkD, 'stroke-width="1.6"'));
  // gövde (yüzü olan kalın sap/yumru)
  b.push(S('M80 130 C76 108 82 86 100 84 C118 86 124 108 120 130 Z', C.sage));
  b.push(F('M110 86 C120 92 124 112 120 130 L112 130 C116 112 116 98 110 86 Z', C.sageD), H('M110 86 C120 92 124 112 120 130 L112 130 C116 112 116 98 110 86 Z', id));
  // yüz: kapaklar yarı, sakin; ağız düz
  b.push(L('M88 104 C90 108 94 108 96 104 M104 104 C106 108 110 108 112 104', 2));
  b.push(L('M92 116 C96 118 104 118 108 116', 1.6), `<circle cx="86" cy="113" r="3.4" fill="${C.pink}" opacity=".5"/><circle cx="114" cy="113" r="3.4" fill="${C.pink}" opacity=".5"/>`);
  // sol taraf: canlı yapraklar
  b.push(S('M84 90 C66 84 50 66 52 46 C70 52 84 68 88 86 Z', C.sage), L('M86 86 C78 72 66 60 54 50 M70 66 l-8 0 M78 74 l-8 2 M66 58 l0 -8', 1.4, C.sageD));
  b.push(S('M92 84 C86 64 92 40 108 30 C112 48 106 70 96 84 Z', C.sage), L('M94 82 C98 64 102 48 106 34 M98 62 l-6 -4 M102 50 l-6 -4', 1.4, C.sageD));
  // tomurcuk (umut değil, sadece ihtimal)
  b.push(S('M106 32 C104 22 112 18 114 26 C116 20 122 24 118 30 C116 34 110 36 106 32 Z', C.pink));
  // sağ taraf: kurumuş, dikenli dal
  b.push(L('M112 88 C122 72 132 62 148 54', 3.4, C.bark), L('M124 74 l6 2 M132 66 l2 -6 M140 60 l6 2 M118 82 l-2 -6', 1.8, C.barkD));
  b.push(S('M148 54 C156 50 162 54 160 60 C154 62 150 60 148 54 Z', C.olive), S('M132 64 C134 56 140 54 142 58 C140 62 136 64 132 64 Z', C.olive));
  b.push(L('M150 58 l4 3 M136 60 l3 2', 1, C.barkD));
  // düşmüş kuru yaprak
  b.push(S('M146 182 C150 174 160 172 166 176 C160 182 152 184 146 182 Z', C.olive), L('M148 181 L164 176', 1, C.barkD));
  return wrap(id, b.join(''));
}
