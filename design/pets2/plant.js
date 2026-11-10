import { C, P, B, O, E, G, wrapA } from './common.js';
// Bitki — saksıda kürek kaktüs; sabırlı, ne umutlu ne umutsuz. Hareket: çok yavaş salınım (sabır), tomurcuk nefes alır,
// kuru kol ağırca sarkar, kuru parça arada düşer, uzun aralıklı ağır göz kırpma.
export function plant(id = 'plant') {
  const pot = G('pot', P('M58 142 L142 142 L132 188 L68 188 Z', C.rust), P('M112 142 L142 142 L132 188 L106 188 Z', C.rustD), P('M52 132 L148 132 L148 144 L52 144 Z', C.rustD),
    ...[76, 92, 108, 124].map(x => P(`M${x} 156 L${x + 6} 162 L${x} 168 L${x - 6} 162 Z`, C.ochre)));
  const eyes = [[92, C.olive], [108, C.oliveD]].map(([x, lid]) => [E(x, 86, 5, 4, C.cream), O(x, 86.6, 2.6, C.black),
    P(`M${x - 6} 86 C${x - 3} 83.6 ${x + 3} 83.6 ${x + 6} 86 L${x + 6} 80 L${x - 6} 80 Z`, lid), G(`bl b${x}`, P(`M${x - 6} 80 L${x + 6} 80 L${x + 6} 91 L${x - 6} 91 Z`, lid))]).flat();
  const plant = G('pl',
    G('armL', P('M80 100 C62 100 52 88 54 70 C60 70 66 74 68 82 C70 88 76 90 82 90 Z', C.olive), G('bud', E(56, 64, 6, 8, C.salmon), P('M56 56 A6 8 0 0 1 56 72 C59 68 59 60 56 56 Z', C.rust, 'opacity=".55"'))),
    G('armR', P('M114 94 C138 92 150 102 152 120 C147 123 142 118 140 112 C137 105 128 104 114 106 Z', C.sandD), B('M132 98 l3 -6 M142 104 l6 -3 M148 114 l7 1 M126 98 l0 -6', 1.2, C.grayD)),
    P('M78 134 C74 96 80 56 100 48 C120 56 126 96 122 134 Z', C.olive), P('M100 48 C120 56 126 96 122 134 L104 134 C112 104 112 70 100 48 Z', C.oliveD),
    ...[[86, 70], [90, 110], [112, 64], [114, 116], [84, 124], [108, 92]].map(([x, y]) => B(`M${x - 2} ${y - 2} l4 4 M${x + 2} ${y - 2} l-4 4`, 1, C.sand)),
    ...eyes, B('M95 96 H105', 1.4, C.black));
  const fall = G('fall', P('M148 116 C152 110 160 108 166 112 C160 118 154 118 148 116 Z', C.sandD));
  const css = `
  .pl{transform-origin:100px 134px;animation:sw 9s ease-in-out infinite}
  @keyframes sw{0%,100%{transform:rotate(-1.4deg)}50%{transform:rotate(1.4deg)}}
  .bud{transform-origin:56px 72px;animation:bd 5s ease-in-out infinite}
  @keyframes bd{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
  .armR{transform-origin:116px 100px;animation:dr 9s ease-in-out infinite}
  @keyframes dr{0%,100%{transform:rotate(0)}50%{transform:rotate(5deg)}}
  .armL{transform-origin:80px 96px;animation:al 9s ease-in-out infinite}
  @keyframes al{0%,100%{transform:rotate(1deg)}50%{transform:rotate(-2deg)}}
  .bl{transform:scaleY(0);animation:bl 9s ease-in-out infinite}.b92{transform-origin:92px 80px}.b108{transform-origin:108px 80px}
  @keyframes bl{0%,44%,60%,100%{transform:scaleY(0)}49%,55%{transform:scaleY(1)}}
  .fall{opacity:0;animation:fa 14s ease-in infinite}
  @keyframes fa{0%,58%{opacity:0;transform:translate(0,0) rotate(0)}60%{opacity:1;transform:translate(0,0)}70%{transform:translate(4px,24px) rotate(40deg)}80%{transform:translate(-2px,48px) rotate(-20deg)}88%{opacity:1;transform:translate(2px,68px) rotate(10deg)}96%{opacity:1;transform:translate(2px,68px) rotate(10deg)}100%{opacity:0;transform:translate(2px,68px)}}`;
  return wrapA(id, pot + plant + fall, css);
}
