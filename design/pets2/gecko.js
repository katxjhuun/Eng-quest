import { C, P, B, O, E, G, wrapA } from './common.js';
// Gecko — taşta güneşleniyor; çoğunlukla kıpırtısız. Hareket: boğazda nefes, ara sıra dil çıkarma (mavinin tadı),
// gözünü diliyle temizler, kuyruk ucu yavaşça kıvrılır, güneş döner; arada bir ani donma-baş çevirme.
export function gecko(id = 'gecko') {
  const rock = G('rk', P('M10 186 C14 160 50 146 100 146 C150 146 186 160 190 186 Z', C.sand), P('M100 146 C150 146 186 160 190 186 L120 186 C132 170 124 154 100 146 Z', C.sandD));
  const sun = G('sun', O(168, 34, 18, C.ochre), ...[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<rect x="166" y="6" width="4" height="7" fill="${C.ochre}" transform="rotate(${a} 168 34)"/>`), O(168, 34, 11, C.ochreD, 'opacity=".4"'));
  const tail = G('tl', B('M58 140 C34 140 22 126 28 112 C32 102 46 102 48 112 C49 118 42 120 40 116', 10, C.teal));
  const far = [B('M70 142 L62 150 L56 148', 5, C.tealD), B('M128 136 L138 146 L146 146', 5, C.tealD)];
  const toes = (pts) => pts.map(([x, y]) => O(x, y, 2.6, C.teal));
  const body = G('bd',
    P('M52 136 C60 120 92 114 124 116 C140 118 148 124 150 132 C146 142 126 146 100 146 C78 146 60 144 52 136 Z', C.teal),
    P('M56 138 C72 146 112 148 148 134 C144 144 124 150 100 150 C80 150 64 146 56 138 Z', C.tealD),
    P('M64 124 L70 112 L76 122 L82 110 L88 120 L94 108 L100 118 L106 108 L112 118 L118 110 L124 118 L130 112 L134 120 Z', C.rust),
    ...[[74, 132, 3.6], [92, 128, 4.2], [110, 130, 3.6], [126, 128, 3], [84, 140, 2.2], [102, 141, 2.4]].map(([x, y, r]) => O(x, y, r, C.ochre)));
  const legs = [B('M86 144 L80 158 L70 160', 6, C.teal), ...toes([[66, 157], [65, 162], [70, 164]]), B('M134 140 L140 156 L150 158', 6, C.teal), ...toes([[154, 154], [155, 159], [151, 163]])];
  const head = G('hd',
    G('tg', B('M186 110 L196 106 M196 106 l3 -3 M196 106 l4 1', 2.2, C.slate)),
    P('M136 124 C138 104 152 92 170 94 C182 96 188 104 186 112 C182 122 166 130 148 132 Z', C.teal),
    G('throat', P('M148 132 C166 130 182 122 186 112 C180 126 166 134 150 136 Z', C.tealD)),
    B('M154 124 C164 124 176 120 184 113', 1.4, C.tealD),
    O(160, 106, 8, C.cream), O(160.5, 106, 6, C.ochre), G('slit', P('M160.5 100.5 Q162.5 106 160.5 111.5 Q158.5 106 160.5 100.5 Z', C.black)), O(158, 103.5, 0.9, C.cream),
    G('lk', B('M152 104 C156 98 166 98 168 104', 3, C.slate)));
  const css = `
  .sun{transform-origin:168px 34px;animation:sn 30s linear infinite}
  @keyframes sn{to{transform:rotate(360deg)}}
  .tl{transform-origin:56px 140px;animation:tl 9s ease-in-out infinite}
  @keyframes tl{0%,100%{transform:rotate(0)}50%{transform:rotate(5deg)}}
  .bd{transform-origin:100px 146px;animation:br 5s ease-in-out infinite}
  @keyframes br{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.03)}}
  .throat{transform-origin:166px 128px;animation:th 1.4s ease-in-out infinite}
  @keyframes th{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.35)}}
  .hd{transform-origin:142px 128px;animation:hd 12s cubic-bezier(.7,0,.2,1) infinite}
  @keyframes hd{0%,62%,100%{transform:rotate(0)}64%,80%{transform:rotate(-9deg)}82%{transform:rotate(0)}}
  .tg{transform-origin:186px 110px;transform:scaleX(0);animation:tg 6s linear infinite}
  @keyframes tg{0%,30%,40%,100%{transform:scaleX(0)}33%,37%{transform:scaleX(1)}}
  .lk{transform-origin:160px 104px;opacity:0;animation:lk 12s linear infinite}
  @keyframes lk{0%,86%,94%,100%{opacity:0;transform:translateY(-8px)}88%{opacity:1;transform:translateY(-6px)}90%{opacity:1;transform:translateY(4px)}92%{opacity:1;transform:translateY(-4px)}}
  .slit{transform-origin:160.5px 106px;animation:sl 12s linear infinite}
  @keyframes sl{0%,62%,82%,100%{transform:scaleX(1)}64%,80%{transform:scaleX(2.2)}}`;
  return wrapA(id, rock + sun + tail + far.join('') + body + legs.join('') + head, css);
}
