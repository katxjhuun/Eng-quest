import { C, P, B, O, E, G, wrapA } from './common.js';
// Baykuş — dalda; gündüz ağır kapaklı ama tetikte. Hareket: baş yana yatar (kafa çevirme), yavaş ve ağır göz kırpma,
// gövde hafif sallanma, kulak tüyleri tetikte kalkar, nadiren hızlı bir "uyanış" (kapaklar açılır).
export function owl(id = 'owl') {
  const branch = G('br', P('M0 164 L200 156 L200 168 L0 176 Z', C.grayD), G('leaf', P('M150 158 C158 146 170 142 182 144 C176 152 164 158 150 158 Z', C.olive)));
  const scales = [];
  for (let r = 0; r < 4; r++) for (let i = 0; i < 5 - (r > 1 ? 1 : 0); i++) {
    const x = 80 + i * 10 + (r % 2) * 5 + (r > 1 ? 5 : 0), y = 108 + r * 11;
    scales.push(P(`M${x - 4} ${y} A4 4 0 0 0 ${x + 4} ${y} Z`, C.rust, 'opacity=".85"'));
  }
  const wing = (s, col) => { const x0 = s > 0 ? 150 : 50; return G(s > 0 ? 'wR' : 'wL', P(`M${x0} 90 C${x0 + s * 10} 110 ${x0 + s * 8} 140 ${x0 - s * 6} 158 C${x0 - s * 12} 140 ${x0 - s * 12} 112 ${x0} 90 Z`, col), B(`M${x0 - s * 2} 112 l${s * 7} 4 M${x0 - s * 4} 126 l${s * 8} 4 M${x0 - s * 5} 140 l${s * 7} 4`, 1.4, C.sand, 'opacity=".7"')); };
  const eyes = [80, 120].map(x => [O(x, 80, 13, C.cream), O(x, 80, 9.5, C.rust), G('pup', O(x, 80, 5, C.black), O(x - 2, 78.5, 1.2, C.cream))]).flat();
  const lids = [80, 120].map(x => G(x < 100 ? 'lid lidL' : 'lid lidR', P(`M${x - 14} 66 L${x + 14} 66 L${x + 14} 79 C${x + 6} 75 ${x - 6} 75 ${x - 14} 79 Z`, x < 100 ? C.ochre : C.ochreD)));
  const body = G('bd',
    P('M100 40 C136 40 152 80 150 118 C148 148 128 164 100 164 C72 164 52 148 50 118 C48 80 64 40 100 40 Z', C.slate),
    P('M100 40 C136 40 152 80 150 118 C148 148 128 164 100 164 Z', C.slateD),
    P('M72 112 C72 96 128 96 128 112 C128 140 116 156 100 156 C84 156 72 140 72 112 Z', C.sand), ...scales,
    wing(1, C.slateD), wing(-1, C.slate),
    G('hd',
      G('tfL', P('M64 58 L58 30 L84 48 Z', C.slate)), G('tfR', P('M136 58 L142 30 L116 48 Z', C.slateD)),
      O(80, 80, 20, C.ochre), O(120, 80, 20, C.ochreD), ...eyes, ...lids, P('M95 90 L105 90 L100 104 Z', C.black)));
  const feet = B('M84 162 l-3 6 M88 162 l0 7 M92 162 l3 6 M108 162 l-3 6 M112 162 l0 7 M116 162 l3 6', 2, C.black);
  const css = `
  .bd{transform-origin:100px 164px;animation:sw 6s ease-in-out infinite}
  @keyframes sw{0%,100%{transform:rotate(0)}50%{transform:rotate(1.6deg)}}
  .hd{transform-origin:100px 104px;animation:tilt 11s ease-in-out infinite}
  @keyframes tilt{0%,20%,100%{transform:rotate(0)}26%,40%{transform:rotate(-11deg)}46%,58%{transform:rotate(9deg)}64%{transform:rotate(0)}}
  .lid{transform:scaleY(1);animation:lid 8s ease-in-out infinite}
  .lidL{transform-origin:80px 66px}.lidR{transform-origin:120px 66px}
  @keyframes lid{0%,100%{transform:scaleY(1)}12%,16%{transform:scaleY(1.9)}22%{transform:scaleY(1)}70%{transform:scaleY(1)}74%,82%{transform:scaleY(.25)}88%{transform:scaleY(1)}}
  .pup{animation:look 11s ease-in-out infinite}
  @keyframes look{0%,20%,100%{transform:translate(0,0)}26%,40%{transform:translate(-2.5px,1px)}46%,58%{transform:translate(2.5px,1px)}}
  .tfL{transform-origin:70px 52px;animation:tf 8s ease-in-out infinite}.tfR{transform-origin:130px 52px;animation:tf 8s ease-in-out infinite}
  @keyframes tf{0%,70%,92%,100%{transform:rotate(0)}74%,86%{transform:rotate(0) translateY(-3px)}}
  .leaf{transform-origin:150px 158px;animation:lf 4.5s ease-in-out infinite}
  @keyframes lf{0%,100%{transform:rotate(0)}50%{transform:rotate(-6deg)}}`;
  return wrapA(id, branch + body + feet, css);
}
