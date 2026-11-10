import { C, P, B, O, E, G, wrapA } from './common.js';
// Civciv — kabukta; saf, meraklı, habersiz. Hareket: baş merakla öne-yukarı uzanıp gagalar, hızlı göz kırpma,
// kanat çırpıştırma, tepe tüyü titrer, kabuk hafif sallanır.
export function chick(id = 'chick') {
  const scales = [];
  for (let r = 0; r < 3; r++) for (let i = 0; i < 5 - r; i++) { const x = 66 + i * 12 + r * 6, y = 118 + r * 10; scales.push(P(`M${x - 5} ${y} A5 5 0 0 0 ${x + 5} ${y}`, 'none', `stroke="${C.ochreD}" stroke-width="1.6"`)); }
  const body = G('bd', P('M50 150 C50 112 74 96 104 96 C134 96 150 116 150 150 Z', C.ochre), P('M104 96 C134 96 150 116 150 150 L112 150 C122 132 120 110 104 96 Z', C.ochreD), ...scales,
    G('wing', P('M92 120 C110 116 126 124 130 140 C116 142 102 138 92 120 Z', C.ochreD)));
  const head = G('hd', G('tuft', P('M102 42 L96 22 L110 40 Z', C.ochre), P('M110 40 L112 18 L118 41 Z', C.ochreD)),
    O(112, 70, 30, C.ochre), P('M112 40 A30 30 0 0 1 112 100 C130 86 132 56 112 40 Z', C.ochreD),
    O(124, 62, 9, C.cream), G('pup', O(125, 61, 6, C.slate), O(125.5, 60.5, 3.2, C.black), O(123.5, 58.5, 1.1, C.cream)),
    G('lid', P('M114 52 L134 52 L134 72 L114 72 Z', C.ochreD)),
    G('beak', P('M140 72 L154 70 L141 77 Z', C.rust), G('jaw', P('M141 77 L152 76 L141 81 Z', C.rustD))));
  const shell = G('sh',
    P('M44 146 L56 156 L66 144 L78 156 L90 144 L102 156 L114 144 L126 156 L138 144 L150 156 L156 146 C154 172 130 188 100 188 C70 188 46 172 44 146 Z', C.cream),
    P('M114 144 L126 156 L138 144 L150 156 L156 146 C154 172 130 188 100 188 C126 178 132 160 114 144 Z', C.sand),
    ...[[70, 170, 1.8], [90, 178, 1.4], [62, 160, 1.2], [104, 170, 1.5]].map(([x, y, r]) => O(x, y, r, C.slate)));
  const css = `
  .sh,.bd{transform-origin:100px 188px;animation:rk 2.8s ease-in-out infinite}
  @keyframes rk{0%,100%{transform:rotate(0)}25%{transform:rotate(-2.2deg)}75%{transform:rotate(2.2deg)}}
  .hd{transform-origin:104px 100px;animation:pk 3.4s cubic-bezier(.5,0,.4,1) infinite}
  @keyframes pk{0%,40%,100%{transform:rotate(0) translate(0,0)}50%{transform:rotate(-8deg) translate(2px,-5px)}58%{transform:rotate(14deg) translate(4px,2px)}62%{transform:rotate(16deg) translate(5px,3px)}70%{transform:rotate(0)}84%{transform:rotate(-4deg)}}
  .lid{transform-origin:124px 52px;transform:scaleY(0);animation:bl 2.6s linear infinite}
  @keyframes bl{0%,70%,78%,100%{transform:scaleY(0)}73%,75%{transform:scaleY(1)}}
  .wing{transform-origin:96px 122px;animation:fl 3.4s ease-in-out infinite}
  @keyframes fl{0%,10%,30%,100%{transform:rotate(0)}14%,22%{transform:rotate(-16deg)}18%,26%{transform:rotate(-4deg)}}
  .tuft{transform-origin:108px 42px;animation:tu 1.7s ease-in-out infinite}
  @keyframes tu{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(6deg)}}
  .jaw{transform-origin:141px 78px;animation:jw 3.4s ease-in-out infinite}
  @keyframes jw{0%,54%,66%,100%{transform:rotate(0)}58%,62%{transform:rotate(16deg)}}
  .pup{animation:lp 3.4s ease-in-out infinite}
  @keyframes lp{0%,40%,100%{transform:translate(0,0)}46%{transform:translate(1px,-1.6px)}56%,66%{transform:translate(1.4px,1.4px)}}`;
  return wrapA(id, body + shell + head, css);
}
