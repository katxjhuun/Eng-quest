// dam-la — pet çizimleri (geometrik editoryal): her tür birkaç görünümden (oturuş/yürüyüş/uyku) oluşur.
// Görünüm = parça ağacı. Parça: { k: ad, p: [x, y] dönme/ölçek merkezi, s: SVG içeriği, kids: alt parçalar, min: en erken evre }.
// Motor (figure.js) parçaları adlarına göre oynatır: root, body, head, tail, legNB/legNF/legFB/legFF (yakın/uzak arka/ön),
// lid* (göz kapağı: sy 0 açık → 1 kapalı), pup* (göz bebeği: bakış), earL/earR, wingL/wingR, jaw, tongue, paw…
// Tüy renkleri kod renkleriyle yazılır (FUR…), tüy rengi seçilince yalnızca onlar değişir.

export const C = {
  paper: '#ECE2CC', black: '#1E1B1C', soot: '#2E2A2C', rust: '#B4532A', rustD: '#8A3B1E', ochre: '#C99A2E', ochreD: '#9E7620',
  olive: '#6E7A3A', oliveD: '#4E5828', teal: '#24585A', tealD: '#173E40', slate: '#4A6378', slateD: '#33475A',
  gray: '#9B9087', grayD: '#6F665E', sand: '#D8C5A0', sandD: '#B9A47C', salmon: '#D98B73', cream: '#F3EBD8',
};
// tüy kodları (yalnızca tüy için kullanılır)
const K = { cat: '#1E1B1D', catD: '#2E2A2D', dog: '#9B9088', dogD: '#33475B', gk: '#24585B', gkD: '#173E41' };

const P = (d, f, x = '') => `<path d="${d}" fill="${f}" ${x}/>`;
const B = (d, w, c, x = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${x}/>`;
const O = (cx, cy, r, f, x = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}" ${x}/>`;
const E = (cx, cy, rx, ry, f, x = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}" ${x}/>`;
const part = (k, p, s, kids = [], min = 0) => ({ k, p, s: Array.isArray(s) ? s.join('') : s, kids, min });

// ---------------------------------------------------------------- KEDİ
function catSit() {
  return [
    part('tail', [62, 182], B('M66 184 C36 184 26 168 36 154 C42 146 52 148 52 156', 11, K.cat)),
    part('body', [100, 186], [
      P('M58 186 C54 142 68 112 100 104 C122 98 136 112 140 132 L144 186 Z', K.cat),
      P('M120 108 C134 118 140 140 142 160 L144 186 L128 186 C130 160 128 132 120 108 Z', K.catD),
      B('M66 168 C70 146 86 136 102 142', 1.6, C.paper)], [
      part('paw', [127, 148], [P('M120 146 L134 144 L138 186 L122 186 Z', K.catD), B('M121 186 L122 150', 1.2, C.paper), P('M120 186 C120 181 140 181 140 186 Z', C.grayD)]),
      part('collar', [120, 108], [P('M100 102 C112 108 130 108 140 100 L142 106 C132 116 112 116 98 108 Z', C.rust), O(126, 116, 5, C.ochre), O(126, 116, 1.6, C.ochreD)], [], 2)]),
    part('head', [118, 104], [], [
      part('earL', [108, 60], [P('M102 66 L104 34 L122 56 Z', K.cat), P('M106 60 L107 42 L117 55 Z', C.rustD)]),
      part('earR', [140, 60], [P('M128 56 L144 32 L148 64 Z', K.cat), P('M133 55 L143 40 L145 59 Z', C.rust)]),
      part('skull', [122, 80], [O(122, 80, 26, K.cat), P('M136 74 C150 74 156 84 154 92 C150 98 140 98 132 94 Z', K.cat),
        P('M126 56 C142 62 150 76 148 92 C146 98 140 102 134 104 C142 88 140 70 126 56 Z', K.catD), P('M126 76 Q137 68 148 76 Q137 82 126 76 Z', C.ochre)]),
      part('pup', [137, 76], [P('M137 71 Q139 76 137 81 Q135 76 137 71 Z', C.black), O(132, 75, 0.9, C.cream)]),
      part('brow', [137, 72], P('M126 75 Q137 70 148 75 L148 72 Q137 66 126 72 Z', K.cat)),
      part('lid', [137, 70], P('M125 79 Q137 66 149 79 L149 70 L125 70 Z', K.cat)),
      part('nose', [153, 88], P('M151 86 L156 86 L154 90 Z', C.salmon)),
      part('jaw', [148, 94], B('M148 96 Q151 99 154 96', 1.2, C.salmon)),
      part('wsk', [148, 94], B('M148 92 L178 86 M148 94 L180 96 M147 96 L174 104', 0.9, C.cream, 'opacity=".8"'))]),
  ];
}
const leg = (k, x, y, len, w, col, paw) => part(k, [x, y], [P(`M${x - w / 2} ${y - 4} L${x + w / 2} ${y - 4} L${x + w / 2 - 1} ${y + len - 3} L${x - w / 2 + 1} ${y + len - 3} Z`, col), P(`M${x - w / 2 - 1} ${y + len} C${x - w / 2 - 1} ${y + len - 5} ${x + w / 2 + 3} ${y + len - 5} ${x + w / 2 + 3} ${y + len} Z`, paw)]);
function catWalk() {
  return [
    leg('legFB', 72, 146, 42, 11, K.catD, C.grayD), leg('legFF', 138, 146, 42, 11, K.catD, C.grayD),
    part('tail', [56, 124], B('M58 124 C38 120 30 100 40 84 C44 78 50 80 48 86', 9, K.cat)),
    part('body', [104, 150], [P('M52 130 C52 114 66 106 86 106 L130 106 C148 106 158 116 158 130 C158 144 146 152 130 152 L80 152 C62 152 52 144 52 130 Z', K.cat),
      P('M60 140 C70 150 120 154 152 140 C148 150 140 152 130 152 L80 152 C70 152 62 148 60 140 Z', K.catD), B('M62 136 C66 124 78 118 90 122', 1.5, C.paper)], [
      part('collar', [146, 112], [P('M140 100 L152 98 L156 120 L144 122 Z', C.rust), O(152, 124, 4, C.ochre)], [], 2)]),
    leg('legNB', 80, 146, 42, 12, K.cat, C.grayD), leg('legNF', 146, 146, 42, 12, K.cat, C.grayD),
    part('head', [146, 112], [], [
      part('earL', [146, 78], [P('M138 84 L140 54 L156 76 Z', K.cat), P('M142 79 L143 62 L152 75 Z', C.rustD)]),
      part('earR', [162, 76], [P('M158 76 L172 54 L174 86 Z', K.cat), P('M162 75 L171 61 L172 80 Z', C.rust)]),
      part('skull', [154, 98], [O(154, 98, 22, K.cat), P('M166 92 C178 92 184 100 182 108 C178 114 170 114 162 110 Z', K.cat), P('M160 78 C174 84 178 98 176 108 C170 116 164 118 158 120 C168 106 168 90 160 78 Z', K.catD),
        P('M158 94 Q167 87 176 94 Q167 99 158 94 Z', C.ochre)]),
      part('pup', [167, 94], [P('M167 89.5 Q168.8 94 167 98.5 Q165.2 94 167 89.5 Z', C.black), O(162.5, 93.2, 0.8, C.cream)]),
      part('lid', [167, 88], P('M157 97 Q167 85 177 97 L177 88 L157 88 Z', K.cat)),
      part('nose', [180, 103], P('M178 101 L183 101 L181 105 Z', C.salmon)),
      part('wsk', [176, 108], B('M176 106 L200 101 M176 108 L201 110 M175 110 L196 117', 0.9, C.cream, 'opacity=".8"'))]),
  ];
}
function catSleep() {
  return [
    part('body', [100, 186], [E(98, 164, 58, 24, K.cat), P('M98 140 C140 140 156 152 156 164 C156 176 140 188 98 188 C130 180 140 160 98 140 Z', K.catD), B('M54 170 C66 158 84 154 98 160', 1.5, C.paper)]),
    part('tail', [60, 176], B('M60 178 C80 190 130 190 150 180', 9, K.cat)),
    part('head', [140, 168], [], [
      part('earL', [132, 142], [P('M124 150 L128 126 L142 144 Z', K.cat)]), part('earR', [150, 142], [P('M146 142 L160 124 L160 152 Z', K.cat), P('M150 142 L158 130 L158 148 Z', C.rust)]),
      part('skull', [142, 160], [E(142, 160, 22, 18, K.cat), P('M140 160 Q146 164 152 160', 'none', `stroke="${C.ochre}" stroke-width="1.6" stroke-linecap="round"`), P('M160 164 L164 164 L162 167 Z', C.salmon)])]),
  ];
}

// ---------------------------------------------------------------- KÖPEK / KURT
function dogSit() {
  const eye = (x, lidC) => [part('pup' + x, [x, 66], [O(x, 66.5, 4, C.ochre), O(x, 66.5, 2, C.black), O(x - 1.4, 65.4, 0.7, C.cream)]),
    part('brow' + x, [x, 60], P(`M${x - 8} 66 C${x - 4} 62.5 ${x + 4} 62.5 ${x + 8} 66 L${x + 8} 58 L${x - 8} 58 Z`, lidC)),
    part('lid' + x, [x, 58], P(`M${x - 8} 58 L${x + 8} 58 L${x + 8} 71 L${x - 8} 71 Z`, lidC))];
  return [
    part('tail', [138, 172], P('M136 176 C158 178 176 170 182 156 C170 162 152 164 136 164 Z', C.grayD)),
    part('body', [100, 186], [P('M100 92 C130 92 146 130 146 160 L146 186 L54 186 L54 160 C54 130 70 92 100 92 Z', K.dog), P('M100 92 C130 92 146 130 146 160 L146 186 L100 186 Z', K.dogD)], [
      part('chest', [100, 112], [P('M76 112 L124 112 L118 150 L100 168 L82 150 Z', C.sand), P('M100 112 L124 112 L118 150 L100 168 Z', C.sandD),
        ...[122, 134, 146].map(y => P(`M${82 + (y - 122) / 4} ${y} L100 ${y + 8} L${118 - (y - 122) / 4} ${y}`, 'none', `stroke="${C.grayD}" stroke-width="1.6" stroke-linejoin="round"`))]),
      part('pawL', [85, 150], [P('M78 150 L92 150 L92 186 L76 186 Z', K.dog), P('M74 186 L94 186 L94 181 L76 181 Z', C.sandD)]),
      part('paw', [115, 150], [P('M108 150 L122 150 L124 186 L108 186 Z', K.dogD), P('M106 186 L126 186 L124 181 L108 181 Z', C.sandD)])]),
    part('head', [100, 112], [], [
      part('earL', [76, 50], [P('M70 56 L66 14 L92 44 Z', K.dog), P('M74 50 L72 26 L86 44 Z', C.rustD)]),
      part('earR', [124, 50], [P('M130 56 L134 14 L108 44 Z', K.dogD), P('M126 50 L128 26 L114 44 Z', C.rust)]),
      part('skull', [100, 76], [P('M68 52 L100 40 L132 52 L130 84 L100 112 L70 84 Z', K.dog), P('M100 40 L132 52 L130 84 L100 112 Z', K.dogD),
        P('M84 48 L100 42 L116 48 L100 72 Z', C.black, 'opacity=".55"'), P('M70 84 L86 80 L100 112 Z', C.sand), P('M130 84 L114 80 L100 112 Z', C.sandD),
        E(86, 66, 7, 5, C.cream), E(114, 66, 7, 5, C.cream)]),
      ...eye(86, K.dog), ...eye(114, K.dogD),
      part('nose', [100, 102], [P('M94 98 L106 98 L100 106 Z', C.black), B('M100 106 L100 110', 1.4, C.black)]),
      part('jaw', [100, 110], P('M95 109 L105 109 L100 114 Z', C.salmon, 'opacity="0"')),
      part('scarf', [100, 114], P('M90 112 L110 112 L100 122 Z', C.rust), [], 2)]),
  ];
}
function dogWalk() {
  return [
    leg('legFB', 66, 136, 48, 9, K.dogD, C.sandD), leg('legFF', 136, 136, 48, 9, K.dogD, C.sandD),
    part('tail', [50, 112], [P('M52 110 C34 102 20 108 14 124 C26 118 38 120 50 124 Z', K.dog), P('M14 124 C20 118 26 117 30 118 L24 124 Z', C.sand)]),
    part('body', [100, 140], [P('M46 118 C46 104 60 98 78 98 L132 98 C148 98 156 106 156 118 C156 132 146 140 130 140 L74 140 C56 140 46 132 46 118 Z', K.dog),
      P('M56 128 C70 140 120 144 152 128 C148 138 140 142 128 142 L74 142 C64 142 58 136 56 128 Z', C.sand), P('M70 100 C90 94 126 94 146 102 C134 110 116 110 100 106 C88 104 78 104 70 100 Z', K.dogD)], [
      part('scarf', [146, 108], [P('M140 98 L152 92 L158 112 L146 116 Z', C.rust), P('M150 112 L156 124 L146 118 Z', C.rustD)], [], 2)]),
    leg('legNB', 76, 136, 48, 10, K.dog, C.sandD), leg('legNF', 144, 136, 48, 10, K.dog, C.sandD),
    part('head', [148, 104], [], [
      part('neck', [148, 104], P('M136 106 L150 76 L168 80 L158 114 Z', K.dog)),
      part('earR', [160, 64], [P('M152 68 L158 38 L170 64 Z', K.dog), P('M156 64 L159 46 L166 62 Z', C.rustD)]),
      part('skull', [166, 74], [P('M146 74 C148 60 162 54 174 60 L196 74 C199 78 197 84 191 84 L162 92 C152 92 144 86 146 74 Z', K.dog), P('M160 88 L191 84 C195 84 196 88 192 90 L162 96 Z', C.sand),
        P('M150 62 C156 56 166 56 172 60 L162 72 Z', C.black, 'opacity=".5"'), E(166, 72, 5.5, 4, C.cream)]),
      part('pup', [166, 72], [O(167, 72.4, 3, C.ochre), O(167, 72.4, 1.5, C.black)]),
      part('lid', [166, 68], P('M160 68 L172 68 L172 77 L160 77 Z', K.dog)),
      part('brow', [166, 68], B('M159 67 L173 69', 1.8, K.dogD)),
      part('nose', [194, 78], E(194, 79, 3.6, 3, C.black)),
      part('jaw', [176, 90], P('M168 90 L192 87 L190 92 L168 95 Z', C.sandD))]),
  ];
}
function dogSleep() {
  return [
    part('tail', [46, 172], P('M48 176 C64 190 100 192 120 186 C96 184 70 180 52 166 Z', C.grayD)),
    part('body', [100, 186], [P('M40 166 C40 148 60 140 84 140 L134 140 C150 140 158 150 158 164 C158 178 150 186 136 186 L58 186 C46 186 40 178 40 166 Z', K.dog),
      P('M84 140 L134 140 C150 140 158 150 158 164 C150 150 120 146 84 140 Z', K.dogD), P('M52 178 C70 186 120 188 150 180 C148 184 144 186 136 186 L58 186 C54 186 52 182 52 178 Z', C.sand)]),
    part('head', [150, 168], [], [
      part('earR', [152, 140], [P('M146 148 L150 122 L164 142 Z', K.dog), P('M150 144 L152 130 L159 141 Z', C.rustD)]),
      part('skull', [166, 160], [P('M144 160 C144 146 156 140 168 144 L192 156 C196 160 194 166 188 168 L160 176 C150 176 144 170 144 160 Z', K.dog), P('M160 172 L188 168 C192 168 192 172 188 174 L162 180 Z', C.sand),
        B('M160 154 Q166 158 172 154', 1.6, C.black), E(192, 160, 3.4, 2.8, C.black)])]),
    part('paw', [150, 180], [P('M136 178 L176 176 L176 186 L136 186 Z', K.dog), P('M170 176 L178 176 L178 186 L170 186 Z', C.sandD)]),
  ];
}

// ---------------------------------------------------------------- CİVCİV
function chickSit() {
  const scales = [];
  for (let r = 0; r < 3; r++) for (let i = 0; i < 5 - r; i++) { const x = 66 + i * 12 + r * 6, y = 118 + r * 10; scales.push(P(`M${x - 5} ${y} A5 5 0 0 0 ${x + 5} ${y}`, 'none', `stroke="${C.ochreD}" stroke-width="1.6"`)); }
  return [
    part('body', [100, 188], [P('M50 150 C50 112 74 96 104 96 C134 96 150 116 150 150 Z', C.ochre), P('M104 96 C134 96 150 116 150 150 L112 150 C122 132 120 110 104 96 Z', C.ochreD), ...scales], [
      part('wingR', [96, 122], P('M92 120 C110 116 126 124 130 140 C116 142 102 138 92 120 Z', C.ochreD))]),
    part('shell', [100, 188], [
      P('M44 146 L56 156 L66 144 L78 156 L90 144 L102 156 L114 144 L126 156 L138 144 L150 156 L156 146 C154 172 130 188 100 188 C70 188 46 172 44 146 Z', C.cream),
      P('M114 144 L126 156 L138 144 L150 156 L156 146 C154 172 130 188 100 188 C126 178 132 160 114 144 Z', C.sand),
      ...[[70, 170, 1.8], [90, 178, 1.4], [62, 160, 1.2], [104, 170, 1.5]].map(([x, y, r]) => O(x, y, r, C.slate))]),
    part('head', [104, 100], [], [
      part('tuft', [108, 42], [P('M102 42 L96 22 L110 40 Z', C.ochre), P('M110 40 L112 18 L118 41 Z', C.ochreD)]),
      part('skull', [112, 70], [O(112, 70, 30, C.ochre), P('M112 40 A30 30 0 0 1 112 100 C130 86 132 56 112 40 Z', C.ochreD), O(124, 62, 9, C.cream)]),
      part('pup', [125, 61], [O(125, 61, 6, C.slate), O(125.5, 60.5, 3.2, C.black), O(123.5, 58.5, 1.1, C.cream)]),
      part('lid', [124, 52], P('M114 52 L134 52 L134 72 L114 72 Z', C.ochreD)),
      part('nose', [146, 74], P('M140 72 L154 70 L141 77 Z', C.rust)),
      part('jaw', [141, 78], P('M141 77 L152 76 L141 81 Z', C.rustD))]),
  ];
}

// ---------------------------------------------------------------- BAYKUŞ
function owlSit() {
  const scales = [];
  for (let r = 0; r < 4; r++) for (let i = 0; i < 5 - (r > 1 ? 1 : 0); i++) {
    const x = 80 + i * 10 + (r % 2) * 5 + (r > 1 ? 5 : 0), y = 108 + r * 11;
    scales.push(P(`M${x - 4} ${y} A4 4 0 0 0 ${x + 4} ${y} Z`, C.rust, 'opacity=".85"'));
  }
  const wing = (s, col) => { const x0 = s > 0 ? 150 : 50; return part(s > 0 ? 'wingR' : 'wingL', [x0 - s * 2, 94], [P(`M${x0} 90 C${x0 + s * 10} 110 ${x0 + s * 8} 140 ${x0 - s * 6} 158 C${x0 - s * 12} 140 ${x0 - s * 12} 112 ${x0} 90 Z`, col), B(`M${x0 - s * 2} 112 l${s * 7} 4 M${x0 - s * 4} 126 l${s * 8} 4 M${x0 - s * 5} 140 l${s * 7} 4`, 1.4, C.sand, 'opacity=".7"')]); };
  return [
    part('feet', [100, 164], B('M84 162 l-3 6 M88 162 l0 7 M92 162 l3 6 M108 162 l-3 6 M112 162 l0 7 M116 162 l3 6', 2, C.black)),
    part('body', [100, 164], [P('M100 40 C136 40 152 80 150 118 C148 148 128 164 100 164 C72 164 52 148 50 118 C48 80 64 40 100 40 Z', C.slate), P('M100 40 C136 40 152 80 150 118 C148 148 128 164 100 164 Z', C.slateD),
      P('M72 112 C72 96 128 96 128 112 C128 140 116 156 100 156 C84 156 72 140 72 112 Z', C.sand), ...scales], [wing(1, C.slateD), wing(-1, C.slate)]),
    part('head', [100, 104], [], [
      part('earL', [70, 52], P('M64 58 L58 30 L84 48 Z', C.slate)), part('earR', [130, 52], P('M136 58 L142 30 L116 48 Z', C.slateD)),
      part('skull', [100, 80], [O(80, 80, 20, C.ochre), O(120, 80, 20, C.ochreD), O(80, 80, 13, C.cream), O(80, 80, 9.5, C.rust), O(120, 80, 13, C.cream), O(120, 80, 9.5, C.rust)]),
      part('pup80', [80, 80], [O(80, 80, 5, C.black), O(78, 78.5, 1.2, C.cream)]), part('pup120', [120, 80], [O(120, 80, 5, C.black), O(118, 78.5, 1.2, C.cream)]),
      part('lid80', [80, 66], P('M66 66 L94 66 L94 79 C86 75 74 75 66 79 Z', C.ochre)), part('lid120', [120, 66], P('M106 66 L134 66 L134 79 C126 75 114 75 106 79 Z', C.ochreD)),
      part('nose', [100, 96], P('M95 90 L105 90 L100 104 Z', C.black))]),
  ];
}

// ---------------------------------------------------------------- GECKO
function geckoSide() {
  const toes = pts => pts.map(([x, y]) => O(x, y, 2.6, K.gk)).join('');
  return [
    part('legFB', [70, 142], B('M70 142 L62 150 L56 148', 5, K.gkD)), part('legFF', [128, 136], B('M128 136 L138 146 L146 146', 5, K.gkD)),
    part('tail', [56, 140], B('M58 140 C34 140 22 126 28 112 C32 102 46 102 48 112 C49 118 42 120 40 116', 10, K.gk)),
    part('body', [100, 146], [P('M52 136 C60 120 92 114 124 116 C140 118 148 124 150 132 C146 142 126 146 100 146 C78 146 60 144 52 136 Z', K.gk),
      P('M56 138 C72 146 112 148 148 134 C144 144 124 150 100 150 C80 150 64 146 56 138 Z', K.gkD)], [
      part('crest', [100, 118], P('M64 124 L70 112 L76 122 L82 110 L88 120 L94 108 L100 118 L106 108 L112 118 L118 110 L124 118 L130 112 L134 120 Z', C.rust)),
      part('spots', [100, 132], [[74, 132, 3.6], [92, 128, 4.2], [110, 130, 3.6], [126, 128, 3], [84, 140, 2.2], [102, 141, 2.4]].map(([x, y, r]) => O(x, y, r, C.ochre)).join(''), [], 1)]),
    part('legNB', [86, 144], [B('M86 144 L80 158 L70 160', 6, K.gk), toes([[66, 157], [65, 162], [70, 164]])]),
    part('legNF', [134, 140], [B('M134 140 L140 156 L150 158', 6, K.gk), toes([[154, 154], [155, 159], [151, 163]])]),
    part('head', [142, 128], [], [
      part('tongue', [186, 110], B('M186 110 L196 106 M196 106 l3 -3 M196 106 l4 1', 2.2, C.slate)),
      part('skull', [162, 114], [P('M136 124 C138 104 152 92 170 94 C182 96 188 104 186 112 C182 122 166 130 148 132 Z', K.gk), B('M154 124 C164 124 176 120 184 113', 1.4, K.gkD),
        O(160, 106, 8, C.cream), O(160.5, 106, 6, C.ochre)]),
      part('jaw', [166, 128], P('M148 132 C166 130 182 122 186 112 C180 126 166 134 150 136 Z', K.gkD)),
      part('pup', [160.5, 106], [P('M160.5 100.5 Q162.5 106 160.5 111.5 Q158.5 106 160.5 100.5 Z', C.black), O(158, 103.5, 0.9, C.cream)]),
      part('lid', [160, 98], P('M151 98 L169 98 L169 114 L151 114 Z', K.gk)),
      part('lick', [160, 104], B('M152 104 C156 98 166 98 168 104', 3, C.slate, 'opacity="0"'))]),
  ];
}

// ---------------------------------------------------------------- BİTKİ
function plantPot() {
  const eye = (x, lidC) => [part('pup' + x, [x, 86], O(x, 86.6, 2.6, C.black)), part('brow' + x, [x, 82], P(`M${x - 6} 86 C${x - 3} 83.6 ${x + 3} 83.6 ${x + 6} 86 L${x + 6} 80 L${x - 6} 80 Z`, lidC)),
    part('lid' + x, [x, 80], P(`M${x - 6} 80 L${x + 6} 80 L${x + 6} 91 L${x - 6} 91 Z`, lidC))];
  return [
    part('pot', [100, 188], [P('M58 142 L142 142 L132 188 L68 188 Z', C.rust), P('M112 142 L142 142 L132 188 L106 188 Z', C.rustD), P('M52 132 L148 132 L148 144 L52 144 Z', C.rustD),
      ...[76, 92, 108, 124].map(x => P(`M${x} 156 L${x + 6} 162 L${x} 168 L${x - 6} 162 Z`, C.ochre))]),
    part('body', [100, 134], [], [
      part('wingL', [80, 96], [P('M80 100 C62 100 52 88 54 70 C60 70 66 74 68 82 C70 88 76 90 82 90 Z', C.olive)], [
        part('bud', [56, 72], [E(56, 64, 6, 8, C.salmon), P('M56 56 A6 8 0 0 1 56 72 C59 68 59 60 56 56 Z', C.rust, 'opacity=".55"')], [], 1)]),
      part('wingR', [116, 100], [P('M114 94 C138 92 150 102 152 120 C147 123 142 118 140 112 C137 105 128 104 114 106 Z', C.sandD), B('M132 98 l3 -6 M142 104 l6 -3 M148 114 l7 1 M126 98 l0 -6', 1.2, C.grayD)], [], 2),
      part('head', [100, 134], [P('M78 134 C74 96 80 56 100 48 C120 56 126 96 122 134 Z', C.olive), P('M100 48 C120 56 126 96 122 134 L104 134 C112 104 112 70 100 48 Z', C.oliveD),
        ...[[86, 70], [90, 110], [112, 64], [114, 116], [84, 124], [108, 92]].map(([x, y]) => B(`M${x - 2} ${y - 2} l4 4 M${x + 2} ${y - 2} l-4 4`, 1, C.sand)),
        E(92, 86, 5, 4, C.cream), E(108, 86, 5, 4, C.cream)], [...eye(92, C.olive), ...eye(108, C.oliveD), part('jaw', [100, 96], B('M95 96 H105', 1.4, C.black))])]),
  ];
}

// ---------------------------------------------------------------- tür tanımları
// view: görünüm adı → parça listesi. gait: yürüme türü ('walk' bacaklı, 'hop' sıçrama), leg: bacak boyu (adım uzunluğu buradan).
// lid: göz kapağı ölçeği (açık / kapalı); owl'un doğal hâli yarı kapalıdır.
// coats: tüy rengi seçenekleri [ana, gölge] — FUR kodlarının yerine geçer.
export const FIGS = {
  cat: { views: { sit: catSit, walk: catWalk, sleep: catSleep }, side: true, gait: 'walk', leg: 42, food: 'fish',
    fur: [K.cat, K.catD], coats: [['#1E1B1D', '#2E2A2D'], ['#B4632E', '#8E4A20'], ['#8B847E', '#6C655F'], ['#D8C5A0', '#B9A47C'], ['#5A3E2E', '#432E22'], ['#E9DFCB', '#CDBFA4'], ['#4A5560', '#36404A'], ['#C99A2E', '#9E7620']] },
  dog: { views: { sit: dogSit, walk: dogWalk, sleep: dogSleep }, side: false, walkSide: true, gait: 'walk', leg: 48, food: 'bone',
    fur: [K.dog, K.dogD], coats: [['#9B9088', '#33475B'], ['#B07A4C', '#7A4E2E'], ['#D8C5A0', '#9E8A62'], ['#3A3436', '#1F1B1D'], ['#8C8E94', '#5A5C64'], ['#E6DCC6', '#B5A890'], ['#A06A4C', '#5E3A26'], ['#C99A5E', '#7E5A34']] },
  chick: { views: { sit: chickSit }, side: true, gait: 'hop', hop: 34, food: 'seed' },
  owl: { views: { sit: owlSit }, side: false, gait: 'hop', hop: 30, lid: [1, 1.9], food: 'mouse' },
  gecko: { views: { sit: geckoSide }, side: true, gait: 'walk', leg: 16, amp: 30, food: 'bug',
    fur: [K.gk, K.gkD], coats: [['#24585B', '#173E41'], ['#6E7A3A', '#4E5828'], ['#B4532A', '#8A3B1E'], ['#4A6378', '#33475A'], ['#C99A2E', '#9E7620'], ['#7A5A7E', '#563E5A'], ['#2E2A2C', '#1E1B1C'], ['#9B9087', '#6F665E']] },
  plant: { views: { sit: plantPot }, side: false, gait: 'hop', hop: 22, food: 'water' },
};
