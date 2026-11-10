import { C, P, B, O, E, G, wrapA } from './common.js';
// Kedi — kara kedi, profil, oturuyor. Bencil, cazibe merkezi.
// Hareket: kuyruk ucu tembel kıvrılır, nefes, baş arada bir burnunu kaldırır, kulak seğirir, yavaş göz kırpma (kedi öpücüğü değil, kibir).
export function cat(id = 'cat') {
  const tail = G('tail', B('M66 184 C36 184 26 168 36 154 C42 146 52 148 52 156', 11, C.black));
  const body = G('body',
    P('M58 186 C54 142 68 112 100 104 C122 98 136 112 140 132 L144 186 Z', C.black),
    P('M120 108 C134 118 140 140 142 160 L144 186 L128 186 C130 160 128 132 120 108 Z', C.soot),
    B('M66 168 C70 146 86 136 102 142', 1.6, C.paper),
    P('M120 146 L134 144 L138 186 L122 186 Z', C.soot), B('M121 186 L122 150', 1.2, C.paper), P('M120 186 C120 181 140 181 140 186 Z', C.grayD),
    P('M100 102 C112 108 130 108 140 100 L142 106 C132 116 112 116 98 108 Z', C.rust), G('tag', O(126, 116, 5, C.ochre), O(126, 116, 1.6, C.ochreD)));
  const head = G('head',
    G('earL', P('M102 66 L104 34 L122 56 Z', C.black), P('M106 60 L107 42 L117 55 Z', C.rustD)),
    G('earR', P('M128 56 L144 32 L148 64 Z', C.black), P('M133 55 L143 40 L145 59 Z', C.rust)),
    O(122, 80, 26, C.black), P('M136 74 C150 74 156 84 154 92 C150 98 140 98 132 94 Z', C.black),
    P('M126 56 C142 62 150 76 148 92 C146 98 140 102 134 104 C142 88 140 70 126 56 Z', C.soot),
    P('M126 76 Q137 68 148 76 Q137 82 126 76 Z', C.ochre),
    P('M137 71 Q139 76 137 81 Q135 76 137 71 Z', C.black), O(132, 75, 0.9, C.cream),
    P('M126 75 Q137 70 148 75 L148 72 Q137 66 126 72 Z', C.black),
    G('lid', P('M125 79 Q137 66 149 79 L149 70 L125 70 Z', C.black)),
    P('M151 86 L156 86 L154 90 Z', C.salmon),
    G('wsk', B('M148 92 L178 86 M148 94 L180 96 M147 96 L174 104', 0.9, C.cream, 'opacity=".8"')));
  const css = `
  .tail{transform-origin:62px 182px;animation:tl 5.2s ease-in-out infinite}
  @keyframes tl{0%,100%{transform:rotate(0)}30%{transform:rotate(-7deg)}55%{transform:rotate(3deg)}70%{transform:rotate(-4deg)}}
  .body{transform-origin:100px 186px;animation:br 3.6s ease-in-out infinite}
  @keyframes br{0%,100%{transform:scale(1,1)}50%{transform:scale(1.012,1.022)}}
  .head{transform-origin:118px 104px;animation:hd 9s ease-in-out infinite}
  @keyframes hd{0%,18%,100%{transform:translateY(0) rotate(0)}24%,46%{transform:translateY(-2px) rotate(-6deg)}52%{transform:translateY(0) rotate(1deg)}60%{transform:rotate(0)}}
  .earR{transform-origin:140px 60px;animation:er 7s linear infinite}
  @keyframes er{0%,61%,67%,100%{transform:rotate(0)}63%{transform:rotate(14deg)}65%{transform:rotate(-4deg)}}
  .lid{transform-origin:137px 70px;transform:scaleY(0);animation:bl 6.4s ease-in-out infinite}
  @keyframes bl{0%,40%,58%,100%{transform:scaleY(0)}46%,52%{transform:scaleY(1)}}
  .wsk{transform-origin:148px 94px;animation:wk 4s ease-in-out infinite}
  @keyframes wk{0%,100%{transform:rotate(0)}50%{transform:rotate(-3deg)}}`;
  return wrapA(id, tail + body + head, css);
}
