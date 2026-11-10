import { C, P, B, O, E, G, wrapA } from './common.js';
// Kurt-köpek — önden oturuyor, simetrik. Hareket: derin nefes (göğüs yelesi), kuyruk yerde ağır vuruş,
// kulaklar sırayla döner (dinliyor), baş hafif yana yatar, ağır göz kırpma; arada başını kaldırıp ufka bakar.
export function dog(id = 'dog') {
  const tail = G('tail', P('M136 176 C158 178 176 170 182 156 C170 162 152 164 136 164 Z', C.grayD));
  const chev = [122, 134, 146].map(y => P(`M${82 + (y - 122) / 4} ${y} L100 ${y + 8} L${118 - (y - 122) / 4} ${y}`, 'none', `stroke="${C.grayD}" stroke-width="1.6" stroke-linejoin="round"`));
  const body = G('bd',
    P('M100 92 C130 92 146 130 146 160 L146 186 L54 186 L54 160 C54 130 70 92 100 92 Z', C.gray),
    P('M100 92 C130 92 146 130 146 160 L146 186 L100 186 Z', C.slateD),
    G('ch', P('M76 112 L124 112 L118 150 L100 168 L82 150 Z', C.sand), P('M100 112 L124 112 L118 150 L100 168 Z', C.sandD), ...chev),
    P('M78 150 L92 150 L92 186 L76 186 Z', C.gray), P('M108 150 L122 150 L124 186 L108 186 Z', C.slateD),
    P('M74 186 L94 186 L94 181 L76 181 Z', C.sandD), P('M106 186 L126 186 L124 181 L108 181 Z', C.sandD));
  const eyes = [[86, C.gray], [114, C.slateD]].map(([x, lid]) => [E(x, 66, 7, 5, C.cream), G('pup', O(x, 66.5, 4, C.ochre), O(x, 66.5, 2, C.black), O(x - 1.4, 65.4, 0.7, C.cream)),
    P(`M${x - 8} 66 C${x - 4} 62.5 ${x + 4} 62.5 ${x + 8} 66 L${x + 8} 58 L${x - 8} 58 Z`, lid), G(`bl b${x}`, P(`M${x - 8} 58 L${x + 8} 58 L${x + 8} 71 L${x - 8} 71 Z`, lid))]).flat();
  const head = G('hd',
    G('eL', P('M70 56 L66 14 L92 44 Z', C.gray), P('M74 50 L72 26 L86 44 Z', C.rustD)),
    G('eR', P('M130 56 L134 14 L108 44 Z', C.slateD), P('M126 50 L128 26 L114 44 Z', C.rust)),
    P('M68 52 L100 40 L132 52 L130 84 L100 112 L70 84 Z', C.gray), P('M100 40 L132 52 L130 84 L100 112 Z', C.slateD),
    P('M84 48 L100 42 L116 48 L100 72 Z', C.black, 'opacity=".55"'),
    P('M70 84 L86 80 L100 112 Z', C.sand), P('M130 84 L114 80 L100 112 Z', C.sandD), ...eyes,
    P('M94 98 L106 98 L100 106 Z', C.black), B('M100 106 L100 110', 1.4, C.black), P('M90 112 L110 112 L100 122 Z', C.rust));
  const css = `
  .tail{transform-origin:138px 172px;animation:th 3.2s ease-in-out infinite}
  @keyframes th{0%,60%,100%{transform:rotate(0)}68%{transform:rotate(-12deg)}76%{transform:rotate(0)}84%{transform:rotate(-9deg)}92%{transform:rotate(0)}}
  .bd{transform-origin:100px 186px;animation:br 4.2s ease-in-out infinite}
  @keyframes br{0%,100%{transform:scale(1,1)}45%{transform:scale(1.018,1.012)}}
  .ch{transform-origin:100px 112px;animation:chb 4.2s ease-in-out infinite}
  @keyframes chb{0%,100%{transform:scale(1)}45%{transform:scale(1.04)}}
  .hd{transform-origin:100px 112px;animation:hd 10s ease-in-out infinite}
  @keyframes hd{0%,30%,100%{transform:rotate(0) translateY(0)}36%,50%{transform:rotate(-7deg)}56%{transform:rotate(0)}70%,82%{transform:translateY(-4px) rotate(0)}88%{transform:translateY(0)}}
  .eL{transform-origin:76px 50px;animation:ea 6s ease-in-out infinite}.eR{transform-origin:124px 50px;animation:ea 6s ease-in-out 1.3s infinite}
  @keyframes ea{0%,40%,56%,100%{transform:rotate(0)}44%,52%{transform:rotate(-9deg)}}
  .bl{transform:scaleY(0);animation:bl 5.6s ease-in-out infinite}.b86{transform-origin:86px 58px}.b114{transform-origin:114px 58px}
  @keyframes bl{0%,62%,72%,100%{transform:scaleY(0)}66%,68%{transform:scaleY(1)}}
  .pup{animation:lk 10s ease-in-out infinite}
  @keyframes lk{0%,64%,100%{transform:translateY(0)}70%,82%{transform:translateY(-1.5px)}}`;
  return wrapA(id, tail + body + head, css);
}
