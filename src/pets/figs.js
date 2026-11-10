// dam-la — pet çizimleri (geometrik editoryal): her tür birkaç görünümden (oturuş/yürüyüş/uyku) oluşur.
// Görünüm = parça ağacı. Parça: { k: ad, p: [x, y] dönme/ölçek merkezi, s: SVG içeriği, kids: alt parçalar, min: en erken evre }.
// Motor (figure.js) parçaları adlarına göre oynatır: root, body, head, tail, legNB/legNF/legFB/legFF (yakın/uzak arka/ön),
// lid* (göz kapağı: sy 0 açık → 1 kapalı), pup* (göz bebeği: bakış), earL/earR, wingL/wingR, jaw, tongue, paw…
// Tüy renkleri kod renkleriyle yazılır (FUR…), tüy rengi seçilince yalnızca onlar değişir.

export const C = {
  paper: '#ECE2CC', black: '#1E1B1C', soot: '#2E2A2C', rust: '#B4532A', rustD: '#8A3B1E', ochre: '#C99A2E', ochreD: '#9E7620',
  olive: '#6E7A3A', oliveD: '#4E5828', teal: '#24585A', tealD: '#173E40', slate: '#4A6378', slateD: '#33475A',
  gray: '#9B9087', grayD: '#6F665E', sand: '#D8C5A0', sandD: '#B9A47C', salmon: '#D98B73', cream: '#F3EBD8',
  bark: '#7E5A3C', barkD: '#58402C',
};
// tüy kodları (yalnızca tüy için kullanılır)
const K = { cat: '#1E1B1D', catD: '#2E2A2D', dog: '#9B9088', dogD: '#33475B', gk: '#24585B', gkD: '#173E41', ow: '#4A6379', owD: '#33475C', ds: '#C99A2F', dsD: '#9E7621', ir: '#B4532B' };
const MK = '#1E1B1C';   // desen mürekkebi (yarı saydam; her tüy renginde görünür)

const P = (d, f, x = '') => `<path d="${d}" fill="${f}" ${x}/>`;
const B = (d, w, c, x = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${x}/>`;
const O = (cx, cy, r, f, x = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}" ${x}/>`;
const E = (cx, cy, rx, ry, f, x = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}" ${x}/>`;
const part = (k, p, s, kids = [], min = 0) => ({ k, p, s: Array.isArray(s) ? s.join('') : s, kids, min });
// yalnızca belirli evrelerde görünen parça
const only = (st, k, p, s, kids = []) => part(k, p, s, kids, st);

// ---------------------------------------------------------------- KEDİ
function catSit() {
  return [
    part('tail', [62, 182], B('M66 184 C36 184 26 168 36 154 C42 146 52 148 52 156', 11, K.cat)),
    part('body', [100, 186], [
      P('M58 186 C54 142 68 112 100 104 C122 98 136 112 140 132 L144 186 Z', K.cat),
      P('M120 108 C134 118 140 140 142 160 L144 186 L128 186 C130 160 128 132 120 108 Z', K.catD),
      B('M66 168 C70 146 86 136 102 142', 1.6, C.paper)], [
      only([1], 'stripes', [100, 150], B('M76 118 C82 126 80 134 74 140 M90 108 C96 116 96 126 90 132 M66 136 C72 140 72 148 66 154 M66 158 C72 160 74 166 72 172 M64 170 C70 172 72 178 70 184', 3.2, MK, 'opacity=".35"')),
      only([2], 'spots', [100, 150], [[76, 124], [88, 116], [70, 140], [82, 136], [72, 158], [84, 152], [96, 128], [66, 172]].map(([x, y]) => O(x, y, 2, MK, 'opacity=".45"')).join('')),
      only([3], 'chestL', [120, 140], P('M118 110 C130 124 134 150 132 186 L122 186 C124 160 122 132 118 110 Z', C.sand, 'opacity=".55"')),
      only([4, 5], 'ros', [100, 150], [[76, 124], [92, 114], [70, 142], [86, 136], [74, 162], [90, 156], [104, 130], [64, 176]].map(([x, y]) => O(x, y, 3.4, 'none', `stroke="${MK}" stroke-width="1.8" opacity="${'{{RO}}'}"`)).join('')),
      part('paw', [127, 148], [P('M120 146 L134 144 L138 186 L122 186 Z', K.catD), B('M121 186 L122 150', 1.2, C.paper), P('M120 186 C120 181 140 181 140 186 Z', C.grayD)]),
      part('collar', [120, 108], [P('M100 102 C112 108 130 108 140 100 L142 106 C132 116 112 116 98 108 Z', C.rust), O(126, 116, 5, C.ochre), O(126, 116, 1.6, C.ochreD)], [], 2)]),
    part('head', [118, 104], [], [
      part('earL', [108, 60], [P('M102 66 L104 34 L122 56 Z', K.cat), P('M106 60 L107 42 L117 55 Z', C.rustD)], [only([2], 'tuftL', [104, 34], B('M104 35 L102 22', 2.2, C.black))]),
      part('earR', [140, 60], [P('M128 56 L144 32 L148 64 Z', K.cat), P('M133 55 L143 40 L145 59 Z', C.rust)], [only([2], 'tuftR', [144, 33], B('M144 33 L148 20', 2.2, C.black))]),
      part('skull', [122, 80], [O(122, 80, 26, K.cat), P('M136 74 C150 74 156 84 154 92 C150 98 140 98 132 94 Z', K.cat),
        P('M126 56 C142 62 150 76 148 92 C146 98 140 102 134 104 C142 88 140 70 126 56 Z', K.catD), P('M126 76 Q137 68 148 76 Q137 82 126 76 Z', C.ochre)]),
      only([1], 'hstripes', [124, 60], B('M114 60 l2 8 M122 57 V65 M130 59 l-2 8', 2.6, MK, 'opacity=".35"')),
      only([2], 'ruff', [118, 100], P('M100 92 L92 108 L104 100 L104 110 L114 102 L118 112 L124 102 L130 108 L132 98 Z', K.cat)),
      only([3], 'muzzle', [146, 90], P('M136 86 C146 82 156 86 154 94 C150 98 140 98 134 94 Z', C.sand, 'opacity=".8"')),
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
      only([1], 'stripes', [104, 130], B('M78 108 C82 116 82 124 78 130 M94 106 C98 114 98 124 94 130 M110 106 C114 114 114 124 110 130 M126 106 C130 114 130 122 126 128', 3.2, MK, 'opacity=".35"')),
      only([2], 'spots', [104, 130], [[72, 118], [88, 114], [104, 118], [120, 114], [136, 120], [80, 132], [96, 130], [112, 134], [128, 132]].map(([x, y]) => O(x, y, 2, MK, 'opacity=".45"')).join('')),
      only([3], 'chestL', [104, 140], P('M64 142 C80 150 130 152 154 136 C150 148 140 152 130 152 L80 152 C70 152 66 148 64 142 Z', C.sand, 'opacity=".6"')),
      only([4, 5], 'ros', [104, 130], [[70, 120], [86, 114], [102, 120], [118, 114], [134, 120], [78, 134], [94, 132], [110, 136], [126, 132], [142, 132]].map(([x, y]) => O(x, y, 3.4, 'none', `stroke="${MK}" stroke-width="1.8" opacity="${'{{RO}}'}"`)).join('')),
      part('collar', [146, 112], [P('M140 100 L152 98 L156 120 L144 122 Z', C.rust), O(152, 124, 4, C.ochre)], [], 2)]),
    leg('legNB', 80, 146, 42, 12, K.cat, C.grayD), leg('legNF', 146, 146, 42, 12, K.cat, C.grayD),
    part('head', [146, 112], [], [
      part('earL', [146, 78], [P('M138 84 L140 54 L156 76 Z', K.cat), P('M142 79 L143 62 L152 75 Z', C.rustD)], [only([2], 'tuftL', [140, 55], B('M140 55 L138 42', 2.2, C.black))]),
      part('earR', [162, 76], [P('M158 76 L172 54 L174 86 Z', K.cat), P('M162 75 L171 61 L172 80 Z', C.rust)], [only([2], 'tuftR', [172, 55], B('M172 55 L176 42', 2.2, C.black))]),
      part('skull', [154, 98], [O(154, 98, 22, K.cat), P('M166 92 C178 92 184 100 182 108 C178 114 170 114 162 110 Z', K.cat), P('M160 78 C174 84 178 98 176 108 C170 116 164 118 158 120 C168 106 168 90 160 78 Z', K.catD),
        P('M158 94 Q167 87 176 94 Q167 99 158 94 Z', C.ochre)]),
      only([2], 'ruff', [150, 116], P('M134 108 L130 124 L140 116 L142 126 L150 118 L154 128 L160 118 L166 124 L166 112 Z', K.cat)),
      only([3], 'muzzle', [174, 106], P('M166 102 C174 98 184 102 182 108 C178 112 170 112 164 110 Z', C.sand, 'opacity=".8"')),
      part('pup', [167, 94], [P('M167 89.5 Q168.8 94 167 98.5 Q165.2 94 167 89.5 Z', C.black), O(162.5, 93.2, 0.8, C.cream)]),
      part('lid', [167, 88], P('M157 97 Q167 85 177 97 L177 88 L157 88 Z', K.cat)),
      part('nose', [180, 103], P('M178 101 L183 101 L181 105 Z', C.salmon)),
      part('wsk', [176, 108], B('M176 106 L200 101 M176 108 L201 110 M175 110 L196 117', 0.9, C.cream, 'opacity=".8"'))]),
  ];
}
function catSleep() {
  return [
    part('body', [100, 186], [E(98, 164, 58, 24, K.cat), P('M98 140 C140 140 156 152 156 164 C156 176 140 188 98 188 C130 180 140 160 98 140 Z', K.catD), B('M54 170 C66 158 84 154 98 160', 1.5, C.paper)], [
      only([1], 'stripes', [98, 164], B('M70 146 C74 154 74 162 70 168 M86 142 C90 150 90 160 86 166 M102 141 C106 150 106 158 102 164', 3, MK, 'opacity=".35"')),
      only([2], 'spots', [98, 164], [[66, 156], [80, 150], [96, 148], [112, 152], [74, 170], [92, 166], [108, 168]].map(([x, y]) => O(x, y, 2, MK, 'opacity=".45"')).join('')),
      only([4, 5], 'ros', [98, 164], [[66, 156], [82, 150], [98, 148], [114, 152], [74, 170], [92, 166], [110, 168], [126, 164]].map(([x, y]) => O(x, y, 3.2, 'none', `stroke="${MK}" stroke-width="1.7" opacity="${'{{RO}}'}"`)).join(''))]),
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
      only([2], 'mask', [100, 96], P('M86 80 L114 80 L106 104 L100 112 L94 104 Z', C.black, 'opacity=".72"')),
      only([5], 'scar', [114, 64], B('M110 54 L120 76', 1.6, C.cream, 'opacity=".85"')),
      part('nose', [100, 102], [P('M94 98 L106 98 L100 106 Z', C.black), B('M100 106 L100 110', 1.4, C.black)]),
      part('jaw', [100, 110], P('M95 109 L105 109 L100 114 Z', C.salmon, 'opacity="0"')),
      only([1, 3, 4], 'scarf', [100, 114], P('M90 112 L110 112 L100 122 Z', C.rust)),
      only([2], 'collar', [100, 114], [P('M80 108 L120 108 L118 116 L82 116 Z', C.black), ...[84, 92, 100, 108, 116].map(x => P(`M${x - 3} 116 L${x} 122 L${x + 3} 116 Z`, C.gray))]),
      only([5], 'mane', [100, 112], [P('M70 84 L60 102 L74 98 L72 114 L86 106 L90 120 L100 110 L110 120 L114 106 L128 114 L126 98 L140 102 L130 84 L100 112 Z', K.dogD)])]),
  ];
}
function dogWalk() {
  return [
    leg('legFB', 66, 136, 48, 9, K.dogD, C.sandD), leg('legFF', 136, 136, 48, 9, K.dogD, C.sandD),
    part('tail', [50, 112], [P('M52 110 C34 102 20 108 14 124 C26 118 38 120 50 124 Z', K.dog), P('M14 124 C20 118 26 117 30 118 L24 124 Z', C.sand)]),
    part('body', [100, 140], [P('M46 118 C46 104 60 98 78 98 L132 98 C148 98 156 106 156 118 C156 132 146 140 130 140 L74 140 C56 140 46 132 46 118 Z', K.dog),
      P('M56 128 C70 140 120 144 152 128 C148 138 140 142 128 142 L74 142 C64 142 58 136 56 128 Z', C.sand), P('M70 100 C90 94 126 94 146 102 C134 110 116 110 100 106 C88 104 78 104 70 100 Z', K.dogD)], [
      only([1, 3, 4], 'scarf', [146, 108], [P('M140 98 L152 92 L158 112 L146 116 Z', C.rust), P('M150 112 L156 124 L146 118 Z', C.rustD)]),
      only([2], 'collar', [146, 108], [P('M140 98 L152 92 L158 112 L146 116 Z', C.black), ...[[150, 118], [156, 112]].map(([x, y]) => P(`M${x - 3} ${y} L${x} ${y + 6} L${x + 3} ${y} Z`, C.gray))]),
      only([5], 'mane', [140, 104], P('M128 98 L134 84 L140 96 L146 80 L150 96 L158 86 L158 112 L136 114 Z', K.dogD))]),
    leg('legNB', 76, 136, 48, 10, K.dog, C.sandD), leg('legNF', 144, 136, 48, 10, K.dog, C.sandD),
    part('head', [148, 104], [], [
      part('neck', [148, 104], P('M136 106 L150 76 L168 80 L158 114 Z', K.dog)),
      part('earR', [160, 64], [P('M152 68 L158 38 L170 64 Z', K.dog), P('M156 64 L159 46 L166 62 Z', C.rustD)]),
      part('skull', [166, 74], [P('M146 74 C148 60 162 54 174 60 L196 74 C199 78 197 84 191 84 L162 92 C152 92 144 86 146 74 Z', K.dog), P('M160 88 L191 84 C195 84 196 88 192 90 L162 96 Z', C.sand),
        P('M150 62 C156 56 166 56 172 60 L162 72 Z', C.black, 'opacity=".5"'), E(166, 72, 5.5, 4, C.cream)]),
      only([2], 'mask', [180, 84], P('M166 76 L196 74 C199 78 197 84 191 84 L164 90 Z', C.black, 'opacity=".65"')),
      only([5], 'scar', [166, 70], B('M160 60 L170 82', 1.4, C.cream, 'opacity=".85"')),
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
    part('body', [100, 164], [P('M100 40 C136 40 152 80 150 118 C148 148 128 164 100 164 C72 164 52 148 50 118 C48 80 64 40 100 40 Z', K.ow), P('M100 40 C136 40 152 80 150 118 C148 148 128 164 100 164 Z', K.owD),
      P('M72 112 C72 96 128 96 128 112 C128 140 116 156 100 156 C84 156 72 140 72 112 Z', C.sand), ...scales], [wing(1, K.owD), wing(-1, K.ow),
      only([2], 'bspots', [100, 110], [[60, 100], [64, 120], [140, 100], [136, 122], [62, 140], [138, 140]].map(([x, y]) => O(x, y, 2, C.cream)).join(''))]),
    part('head', [100, 104], [], [
      part('earL', [70, 52], P('M64 58 L58 30 L84 48 Z', K.ow)), part('earR', [130, 52], P('M136 58 L142 30 L116 48 Z', K.owD)),
      only([0], 'down', [100, 46], [P('M88 46 L92 34 L96 46 Z', K.ow), P('M98 44 L102 30 L106 44 Z', K.owD), P('M106 46 L110 36 L113 47 Z', K.owD)]),
      only([2], 'hspots', [100, 56], [[82, 52], [92, 48], [104, 48], [114, 52], [88, 58], [110, 58]].map(([x, y]) => O(x, y, 1.6, C.cream)).join('')),
      part('skull', [100, 80], [O(80, 80, 20, K.ds), O(120, 80, 20, K.dsD), O(80, 80, 13, C.cream), O(80, 80, 9.5, K.ir), O(120, 80, 13, C.cream), O(120, 80, 9.5, K.ir)]),
      part('pup80', [80, 80], [O(80, 80, 5, C.black), O(78, 78.5, 1.2, C.cream)]), part('pup120', [120, 80], [O(120, 80, 5, C.black), O(118, 78.5, 1.2, C.cream)]),
      part('lid80', [80, 66], P('M66 66 L94 66 L94 79 C86 75 74 75 66 79 Z', K.ds)), part('lid120', [120, 66], P('M106 66 L134 66 L134 79 C126 75 114 75 106 79 Z', K.dsD)),
      only([3], 'heart', [100, 80], B('M100 64 C88 52 58 56 60 82 C62 102 84 108 100 112 C116 108 138 102 140 82 C142 56 112 52 100 64 Z', 2.2, C.sandD)),
      only([5], 'glow', [100, 80], [O(80, 80, 15, 'none', `stroke="${C.ochre}" stroke-width="1.6" opacity=".55"`), O(120, 80, 15, 'none', `stroke="${C.ochre}" stroke-width="1.6" opacity=".55"`)]),
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
      only([3, 4, 5], 'crest', [100, 118], P('M64 124 L70 112 L76 122 L82 110 L88 120 L94 108 L100 118 L106 108 L112 118 L118 110 L124 118 L130 112 L134 120 Z', C.rust)),
      only([1, 5], 'spots', [100, 132], [[74, 132, 3.6], [92, 128, 4.2], [110, 130, 3.6], [126, 128, 3], [84, 140, 2.2], [102, 141, 2.4]].map(([x, y, r]) => O(x, y, r, C.ochre)).join('')),
      only([2], 'bspots', [100, 132], [[68, 130], [78, 126], [90, 124], [104, 126], [118, 124], [130, 128], [74, 138], [96, 136], [112, 140], [140, 132]].map(([x, y]) => O(x, y, 2.4, C.black)).join('')),
      only([3], 'bands', [100, 132], B('M72 124 L70 142 M90 120 L88 144 M108 120 L106 146 M126 122 L124 142', 3, MK, 'opacity=".35"')),
      only([4], 'stripe', [100, 136], B('M60 138 C80 132 120 134 146 128', 3, C.sand, 'opacity=".7"'))]),
    part('legNB', [86, 144], [B('M86 144 L80 158 L70 160', 6, K.gk), toes([[66, 157], [65, 162], [70, 164]])]),
    part('legNF', [134, 140], [B('M134 140 L140 156 L150 158', 6, K.gk), toes([[154, 154], [155, 159], [151, 163]])]),
    part('head', [142, 128], [], [
      part('tongue', [186, 110], B('M186 110 L196 106 M196 106 l3 -3 M196 106 l4 1', 2.2, C.slate)),
      only([4], 'casque', [160, 96], P('M144 106 C146 84 166 76 180 90 L168 100 Z', K.gkD)),
      only([5], 'horns', [166, 96], [P('M160 98 L166 78 L170 98 Z', C.sand), P('M172 100 L182 84 L180 102 Z', C.sandD)]),
      part('skull', [162, 114], [P('M136 124 C138 104 152 92 170 94 C182 96 188 104 186 112 C182 122 166 130 148 132 Z', K.gk), B('M154 124 C164 124 176 120 184 113', 1.4, K.gkD),
        O(160, 106, 8, C.cream), O(160.5, 106, 6, C.ochre)]),
      part('jaw', [166, 128], P('M148 132 C166 130 182 122 186 112 C180 126 166 134 150 136 Z', K.gkD), [
        only([5], 'beard', [166, 132], P('M150 134 L152 146 L158 136 L162 148 L166 134 L172 144 L174 130 Z', C.rust))]),
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


// civciv evreleri: yumurta → (kabukta civciv) → tombiş → kanatçık → tavus yavrusu → tavus kuşu
function chickEgg() {
  return [
    part('body', [100, 188], [P('M100 70 C130 70 148 120 146 150 C144 174 126 188 100 188 C74 188 56 174 54 150 C52 120 70 70 100 70 Z', C.cream),
      P('M100 70 C130 70 148 120 146 150 C144 174 126 188 100 188 C126 176 132 120 100 70 Z', C.sand), ...[[76, 156, 2], [92, 172, 1.6], [70, 136, 1.4], [118, 160, 1.8], [84, 94, 1.3]].map(([x, y, r]) => O(x, y, r, C.slate))]),
    part('head', [100, 130], [P('M70 112 L80 104 L90 114 L100 102 L110 114 L120 104 L130 112 L126 130 L74 130 Z', C.soot)], [
      part('skull', [94, 118], O(94, 118, 6, C.cream)),
      part('pup', [94, 118], [O(95, 118, 3.4, C.black), O(93.6, 116.6, 1, C.cream)]),
      part('lid', [94, 111], P('M87 111 L101 111 L101 125 L87 125 Z', C.soot)),
      part('nose', [112, 122], P('M106 120 L118 123 L106 126 Z', C.rust)),
      part('tuft', [100, 102], [P('M96 104 L98 94 L102 104 Z', C.ochre)])]),
  ];
}
function chickStand(st) {
  const big = st >= 3;
  const scales = [];
  for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) { const x = 78 + i * 12 + r * 6, y = 128 + r * 10; scales.push(P(`M${x - 5} ${y} A5 5 0 0 0 ${x + 5} ${y}`, 'none', `stroke="${C.ochreD}" stroke-width="1.6"`)); }
  return [
    part('legFB', [92, 164], B(`M92 164 L90 ${186} M90 186 l-7 0 M90 186 l6 0`, 2.4, C.rust)),
    part('legNB', [108, 164], B('M108 164 L110 186 M110 186 l-6 0 M110 186 l7 0', 2.4, C.rust)),
    ...(big ? [part('tail', [62, 138], [P('M66 136 L40 118 L46 132 L36 130 L50 142 Z', C.ochreD), P('M66 140 L44 142 L56 150 Z', C.rust, 'opacity=".7"')])] : []),
    part('body', [100, 168], [big ? E(100, 138, 40, 30, C.ochre) : O(100, 134, 38, C.ochre), P(big ? 'M100 108 A40 30 0 0 1 100 168 C120 158 124 120 100 108 Z' : 'M100 96 A38 38 0 0 1 100 172 C122 160 126 112 100 96 Z', C.ochreD),
      E(98, big ? 146 : 144, big ? 22 : 24, big ? 14 : 18, C.cream), ...scales], [
      part('wingR', [92, 126], big ? [P('M84 124 C108 116 132 124 140 146 C118 150 96 144 84 124 Z', C.ochreD), B('M100 130 l26 8 M98 138 l28 8', 1.4, C.rust, 'opacity=".7"')] : P('M88 128 C104 122 120 130 124 144 C110 146 96 142 88 128 Z', C.ochreD))]),
    part('head', [112, 112], [], [
      part('tuft', [112, 56], big ? [P('M106 58 L102 40 L112 56 Z', C.rust), P('M112 56 L116 36 L120 57 Z', C.rustD)] : [P('M106 60 L100 46 L112 58 Z', C.ochre), P('M112 58 L114 42 L119 59 Z', C.ochreD)]),
      part('skull', [116, 84], [O(116, 84, big ? 24 : 27, C.ochre), P(big ? 'M116 60 A24 24 0 0 1 116 108 C130 98 132 72 116 60 Z' : 'M116 57 A27 27 0 0 1 116 111 C132 100 134 70 116 57 Z', C.ochreD), O(126, 78, big ? 7 : 8, C.cream)]),
      part('pup', [127, 77], [O(127, 77, big ? 4.6 : 5.2, C.slate), O(127.5, 76.6, 2.6, C.black), O(125.8, 75, 0.9, C.cream)]),
      part('lid', [126, 69], P('M117 69 L135 69 L135 87 L117 87 Z', C.ochreD)),
      part('nose', [146, 88], P(big ? 'M138 84 L156 86 L138 92 Z' : 'M140 86 L154 85 L141 91 Z', C.rust)),
      part('jaw', [140, 92], P('M140 90 L152 90 L140 95 Z', C.rustD))]),
  ];
}
function peafowl(st) {
  const adult = st >= 5;
  const body = adult ? '#2E5A8A' : '#B9A47C', bodyD = adult ? '#1F3F66' : '#9E8A62', neck = adult ? '#24585A' : '#6E8A7A';
  const fan = [];
  const n = adult ? 11 : 5, R = adult ? 70 : 34, cx = 80, cy = 146;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * (0.98 + 0.66 * i / (n - 1)) + (adult ? -0.1 : 0.15);
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R * 0.95;
    fan.push(B(`M${cx} ${cy} L${x.toFixed(1)} ${y.toFixed(1)}`, adult ? 7 : 5, adult ? C.teal : C.sandD));
    fan.push(E(x, y, adult ? 7 : 4.5, adult ? 9 : 5.5, adult ? C.ochre : C.sand), O(x, y + 0.6, adult ? 4.4 : 2.6, adult ? C.teal : C.olive), O(x, y + 1, adult ? 2.2 : 1.3, adult ? '#2E5A8A' : C.oliveD));
  }
  return [
    part('tail', [cx, cy], fan.join('')),
    part('legFB', [94, 160], B('M94 160 L92 186 M92 186 l-7 0 M92 186 l6 0', 2.4, C.grayD)),
    part('legNB', [108, 160], B('M108 160 L110 186 M110 186 l-6 0 M110 186 l7 0', 2.4, C.grayD)),
    part('body', [100, 166], [E(100, 142, 34, 24, body), P('M100 118 A34 24 0 0 1 100 166 C116 158 120 128 100 118 Z', bodyD)], [
      part('wingR', [96, 132], [P('M84 132 C104 124 124 132 130 148 C112 152 94 148 84 132 Z', bodyD), B('M96 138 l24 6', 1.4, C.sand, 'opacity=".6"')])]),
    part('head', [122, 124], [], [
      part('neck', [122, 124], P('M112 128 C112 104 118 90 124 80 L136 82 C132 96 128 110 128 130 Z', neck)),
      part('tuft', [130, 64], [B('M128 70 L122 52 M130 69 L130 50 M132 70 L138 52', 1.2, neck), ...[[122, 52], [130, 50], [138, 52]].map(([x, y]) => O(x, y, 2.2, adult ? C.teal : C.olive))]),
      part('skull', [132, 78], [O(132, 78, 10, neck), P('M126 76 Q132 72 138 76', 'none', `stroke="${C.cream}" stroke-width="1.6"`)]),
      part('pup', [134, 77], [O(134, 77, 2.4, C.black), O(133.3, 76.3, 0.7, C.cream)]),
      part('lid', [134, 73], P('M130 73 L138 73 L138 81 L130 81 Z', neck)),
      part('nose', [144, 80], P('M141 78 L150 80 L141 83 Z', C.sandD))]),
  ];
}
// bitki evreleri: tohum → filiz → papatya → lale → kaktüs → ulu ağaç
const potPart = () => part('pot', [100, 188], [P('M58 142 L142 142 L132 188 L68 188 Z', C.rust), P('M112 142 L142 142 L132 188 L106 188 Z', C.rustD), P('M52 132 L148 132 L148 144 L52 144 Z', C.rustD),
  ...[76, 92, 108, 124].map(x => P(`M${x} 156 L${x + 6} 162 L${x} 168 L${x - 6} 162 Z`, C.ochre))]);
const pEye = (x, y, lidC, r = 3.4) => [part('pup' + x, [x, y], O(x, y + 0.5, r * 0.62, C.black)),
  part('lid' + x, [x, y - r], P(`M${x - r - 1} ${y - r} L${x + r + 1} ${y - r} L${x + r + 1} ${y + r + 0.6} L${x - r - 1} ${y + r + 0.6} Z`, lidC))];
const pFace = (x1, x2, y, lidC, r = 3.4) => [E(x1, y, r + 1, r, C.cream), E(x2, y, r + 1, r, C.cream)];
function plantSeed() {
  return [potPart(), part('body', [100, 132], [P('M60 132 C70 124 130 124 140 132 Z', C.barkD)], [
    part('head', [100, 132], [E(100, 122, 18, 13, '#8A5A3A'), P('M100 109 A18 13 0 0 1 100 135 C110 128 110 116 100 109 Z', '#6A4228'), ...pFace(94, 106, 122, '#8A5A3A', 2.8)],
      [...pEye(94, 122, '#8A5A3A', 2.8), ...pEye(106, 122, '#8A5A3A', 2.8)]),
    part('bud', [101, 110], B('M100 110 C100 100 108 96 110 102', 2.4, C.olive))])];
}
function plantSprout() {
  return [potPart(), part('body', [100, 134], [P('M60 132 C70 124 130 124 140 132 Z', C.barkD), B('M100 132 L100 98', 4, C.oliveD)], [
    part('wingL', [100, 108], P('M100 108 C88 96 72 96 64 104 C74 114 90 114 100 108 Z', C.olive)),
    part('wingR', [100, 104], P('M100 104 C112 92 128 92 136 100 C126 110 110 110 100 104 Z', C.oliveD)),
    part('head', [100, 98], [O(100, 86, 13, C.olive), P('M100 73 A13 13 0 0 1 100 99 C108 92 108 80 100 73 Z', C.oliveD), ...pFace(95, 105, 86, C.olive, 2.8)], [...pEye(95, 86, C.olive, 2.8), ...pEye(105, 86, C.oliveD, 2.8)])])];
}
function plantDaisy() {
  const petals = Array.from({ length: 12 }, (_, i) => `<ellipse cx="100" cy="44" rx="5" ry="12" fill="${i % 2 ? C.cream : '#E6DCC6'}" transform="rotate(${i * 30} 100 64)"/>`).join('');
  return [potPart(), part('body', [100, 134], [P('M60 132 C70 124 130 124 140 132 Z', C.barkD), B('M100 132 L100 76', 4, C.oliveD)], [
    part('wingL', [100, 118], P('M100 118 C86 104 68 104 60 112 C72 124 90 124 100 118 Z', C.olive)),
    part('wingR', [100, 110], P('M100 110 C114 96 132 96 140 104 C128 116 112 116 100 110 Z', C.oliveD)),
    part('head', [100, 78], [petals, O(100, 64, 14, C.ochre), P('M100 50 A14 14 0 0 1 100 78 C108 72 108 56 100 50 Z', C.ochreD), ...pFace(95, 105, 63, C.ochre, 2.8)],
      [...pEye(95, 63, C.ochre, 2.8), ...pEye(105, 63, C.ochreD, 2.8), part('jaw', [100, 70], B('M97 70 H103', 1.2, C.black))])])];
}
function plantTulip() {
  return [potPart(), part('body', [100, 134], [P('M60 132 C70 124 130 124 140 132 Z', C.barkD), B('M100 132 L100 84', 4, C.oliveD)], [
    part('wingL', [100, 128], P('M100 128 C88 112 80 90 84 70 C94 88 100 108 100 128 Z', C.olive)),
    part('wingR', [100, 126], P('M100 126 C112 110 122 94 124 76 C112 90 104 108 100 126 Z', C.oliveD)),
    part('head', [100, 86], [P('M82 50 L86 76 C88 88 112 88 114 76 L118 50 L109 60 L100 46 L91 60 Z', C.rust), P('M100 46 L109 60 L118 50 L114 76 C112 84 106 88 100 88 Z', C.rustD), ...pFace(94, 106, 70, C.rust, 3)],
      [...pEye(94, 70, C.rust, 3), ...pEye(106, 70, C.rustD, 3), part('jaw', [100, 78], B('M97 78 H103', 1.2, C.black))])])];
}
function plantTree() {
  const canopy = [[74, 70, 24], [100, 50, 28], [86, 40, 18], [64, 92, 16]].map(([x, y, r], i) => O(x, y, r, i % 2 ? C.oliveD : C.olive)).join('');
  return [potPart(), part('body', [100, 134], [], [
    part('wingL', [96, 92], [canopy, ...[[70, 64], [96, 44], [84, 72]].map(([x, y]) => P(`M${x} ${y} l4 -6 l4 6 Z`, C.oliveD))], [part('bud', [92, 58], [O(92, 58, 4, C.salmon), O(76, 80, 3.4, C.salmon)], [], 0)]),
    part('wingR', [106, 92], [B('M106 92 L130 70 M120 80 L134 82 M128 72 L132 58 M114 86 L122 96', 3, C.bark), P('M134 82 C140 78 146 80 146 84 C142 86 138 86 134 82 Z', C.sandD), P('M132 58 C134 52 140 50 142 54 C140 58 136 60 132 58 Z', C.sandD)]),
    part('head', [100, 134], [P('M90 134 L92 98 L84 84 L90 82 L97 94 L100 76 L106 76 L105 96 L112 84 L117 87 L108 102 L110 134 Z', C.bark), P('M100 76 L106 76 L105 96 L112 84 L117 87 L108 102 L110 134 L100 134 Z', C.barkD),
      B('M94 124 l4 -4 M104 118 l3 3', 1, C.barkD), ...pFace(96, 104, 112, C.bark, 2.8)], [...pEye(96, 112, C.bark, 2.8), ...pEye(104, 112, C.barkD, 2.8), part('jaw', [100, 120], B('M97 120 H103', 1.2, C.black))])])];
}

// ---------------------------------------------------------------- tür tanımları
// view: görünüm adı → parça listesi. gait: yürüme türü ('walk' bacaklı, 'hop' sıçrama), leg: bacak boyu (adım uzunluğu buradan).
// lid: göz kapağı ölçeği (açık / kapalı); owl'un doğal hâli yarı kapalıdır.
// coats: tüy rengi seçenekleri [ana, gölge] — FUR kodlarının yerine geçer.
// stagePal: evreye özgü tüy renkleri (kedi Vaşak'tan, köpek Çoban'dan itibaren türün kendi rengini alır; öncesinde seçilen tüy rengi).
// form: evreye göre oran (head baş, leg bacak, body gövde, tail kuyruk, ear kulak ölçeği; earRot: yavru köpeğin düşük kulakları).
export const FIGS = {
  cat: { views: { sit: catSit, walk: catWalk, sleep: catSleep }, side: true, gait: 'walk', leg: 42, food: 'fish',
    fur: [K.cat, K.catD], coats: [['#1E1B1D', '#2E2A2D'], ['#B4632E', '#8E4A20'], ['#8B847E', '#6C655F'], ['#D8C5A0', '#B9A47C'], ['#5A3E2E', '#432E22'], ['#E9DFCB', '#CDBFA4'], ['#4A5560', '#36404A'], ['#C99A2E', '#9E7620']],
    stagePal: { 2: ['#A8957A', '#7E6E58'], 3: ['#B9874E', '#8E6438'], 4: ['#D2A040', '#A87A26'], 5: ['#16141A', '#24212A'] }, ro: { 4: 0.55, 5: 0.22 },
    form: [{ head: 1.2, leg: 0.78, body: 0.9, tail: 0.85, ear: 1.08 }, { head: 1.07, leg: 0.92 }, { tail: 0.45, ear: 1.12 }, { head: 0.93, leg: 1.08, body: 1.06 }, { head: 0.94, leg: 1.06, body: 1.08 }, { head: 0.95, leg: 1.1, body: 1.12, tail: 1.1 }] },
  dog: { views: { sit: dogSit, walk: dogWalk, sleep: dogSleep }, side: false, walkSide: true, gait: 'walk', leg: 48, food: 'bone',
    fur: [K.dog, K.dogD], coats: [['#D8C5A0', '#B9A47C'], ['#B07A4C', '#7A4E2E'], ['#9B9088', '#5F6670'], ['#3A3436', '#1F1B1D'], ['#8C8E94', '#5A5C64'], ['#E6DCC6', '#B5A890'], ['#A06A4C', '#5E3A26'], ['#C99A5E', '#7E5A34']],
    stagePal: { 2: ['#D9B98A', '#9E7A50'], 3: ['#A8A29A', '#5F6670'], 4: ['#9B9088', '#33475B'], 5: ['#4A4448', '#24212A'] },
    form: [{ head: 1.24, leg: 0.7, body: 0.86, ear: 0.72, earRot: 118, tail: 0.7 }, { head: 1.1, leg: 0.86, ear: 0.9, earRot: 28 }, { head: 1.02 }, { head: 0.95, leg: 1.06, body: 0.96 }, {}, { head: 1.04, leg: 1.04, body: 1.08, tail: 1.15 }] },
  chick: { views: { sit: st => [chickEgg, chickSit, chickStand, chickStand, peafowl, peafowl][st](st) }, side: true, gait: 'hop', hop: 34, food: 'seed',
    form: [{}, {}, {}, {}, {}, {}] },
  owl: { views: { sit: owlSit }, side: false, gait: 'hop', hop: 30, lid: [1, 1.9], food: 'mouse',
    fur: [K.ow, K.owD, K.ds, K.dsD, K.ir],
    stagePal: { 0: ['#C9C1B4', '#A39B8E', '#E6DECF', '#CFC6B5', '#4A6378'], 1: ['#9B9087', '#6F665E', '#D8C5A0', '#B9A47C', '#C99A2E'], 2: ['#8A6A4A', '#6A4E34', '#D8C5A0', '#B9A47C', '#C99A2E'],
      3: ['#C99A5E', '#9E7640', '#F3EBD8', '#E2D6BE', '#1E1B1C'], 4: ['#7A5A3C', '#58402C', '#B9874E', '#9E6E3A', '#D9772E'], 5: ['#2E3B4E', '#1F2A38', '#4A5560', '#36404A', '#E2B13A'] },
    form: [{ ear: 0, head: 1.12, body: 1.06 }, { ear: 0.5 }, { ear: 0 }, { ear: 0 }, { ear: 1.4 }, { ear: 1.1, body: 1.04 }] },
  gecko: { views: { sit: geckoSide }, side: true, gait: 'walk', leg: 16, amp: 30, food: 'bug',
    fur: [K.gk, K.gkD], coats: [['#8FB89A', '#6A947A'], ['#B9AC98', '#8E826E'], ['#B4532A', '#8A3B1E'], ['#4A6378', '#33475A'], ['#C99A2E', '#9E7620'], ['#7A5A7E', '#563E5A'], ['#2E2A2C', '#1E1B1C'], ['#9B9087', '#6F665E']],
    stagePal: { 2: ['#D8B44A', '#B08E2E'], 3: ['#8C7A5A', '#6A5A40'], 4: ['#6E9A4A', '#4E7A32'], 5: ['#24585B', '#173E41'] },
    form: [{ head: 1.25, tail: 0.7, leg: 0.85, body: 0.9 }, { head: 1.08 }, {}, { body: 1.04 }, { tail: 1.12, head: 1.04 }, { head: 1.06, body: 1.06, tail: 1.08 }] },
  plant: { views: { sit: st => [plantSeed, plantSprout, plantDaisy, plantTulip, plantPot, plantTree][st]() }, side: false, gait: 'hop', hop: 22, food: 'water',
    form: [{}, {}, {}, {}, {}, {}] },
};
