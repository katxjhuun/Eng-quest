import { C, S, F, L, H, wrap } from './common.js';
// Kedi — yetişkin, oturan, 3/4 sağa dönük. Zencefil tekir.
export function cat(id = 'cat') {
  const b = [];
  b.push(`<ellipse cx="104" cy="187" rx="62" ry="6" fill="${C.ink}" opacity=".16"/>`);
  // arka uyluk + gövde
  b.push(S('M70 182 C52 176 50 140 62 118 C70 102 90 96 108 98 C128 100 142 116 146 140 C150 162 146 180 134 184 Z', C.ginger));
  b.push(F('M128 104 C142 116 148 140 146 162 C145 174 140 182 134 184 L126 184 C134 160 134 128 122 106 Z', C.gingerD));
  b.push(H('M128 104 C142 116 148 140 146 162 C145 174 140 182 134 184 L126 184 C134 160 134 128 122 106 Z', id));
  b.push(L('M76 110 C84 118 82 126 74 132', 3.4, C.gingerD), L('M90 102 C97 110 97 118 90 125', 3.4, C.gingerD), L('M66 124 C72 128 72 136 66 140', 3, C.gingerD));
  b.push(S('M56 162 C54 142 64 130 78 134 C92 138 94 160 88 176 C84 186 64 186 58 178 Z', C.ginger));
  b.push(L('M60 148 C68 150 72 156 70 164', 3, C.gingerD), L('M62 162 C68 164 72 170 70 177', 3, C.gingerD));
  // kuyruk gövdenin önünden, patilerin arkasından dolanır
  b.push(S('M60 172 C34 176 34 198 66 194 C88 192 116 192 140 190 C150 189 152 182 146 180 C140 184 128 185 116 185 C96 186 80 188 70 186 C58 184 54 178 62 176 Z', C.ginger));
  b.push(L('M50 180 l2 8 M62 186 l2 7 M80 187 l1 6 M98 186 l1 6 M116 186 l1 5', 3, C.gingerD));
  b.push(F('M140 182 C146 181 150 184 146 188 C142 190 140 190 138 189 Z', C.cream));
  // göğüs önlüğü
  b.push(S('M100 110 C116 110 128 128 126 152 C124 172 112 184 100 184 C90 168 86 140 90 122 C92 114 96 111 100 110 Z', C.cream));
  b.push(L('M94 120 l3 4 l3 -5 l3 5 l3 -5 l3 5 l3 -4', 1.2, C.ashD));
  // ön bacaklar + patiler
  b.push(S('M94 146 C92 164 92 176 90 184 L110 184 C110 172 110 158 108 146 Z', C.ginger));
  b.push(S('M116 146 C120 162 122 176 122 184 L140 184 C140 170 136 156 128 144 Z', C.ginger));
  b.push(F('M128 144 C136 156 140 170 140 184 L132 184 C132 170 130 156 124 146 Z', C.gingerD));
  b.push(L('M95 160 c4 1 8 1 12 0 M95 170 c4 1 8 1 12 0', 2.6, C.gingerD), L('M120 160 c4 1 8 0 12 -2 M121 170 c4 1 9 0 13 -2', 2.6, C.gingerD));
  b.push(S('M86 189 C86 180 112 180 113 189 Z', C.cream), L('M95 183 V189 M103 183 V189', 1.3));
  b.push(S('M118 189 C118 180 143 180 144 189 Z', C.cream), L('M126 183 V189 M134 183 V189', 1.3));
  // tasma
  b.push(S('M86 104 C100 114 128 114 144 102 L146 110 C130 122 100 122 84 112 Z', C.teal));
  b.push(L('M92 110 l2 2 M102 114 l2 2 M114 115 l2 2 M126 113 l2 2 M136 108 l2 2', 1.6, C.mustard));
  b.push(`<circle cx="116" cy="124" r="6" fill="${C.mustard}" stroke="${C.ink}" stroke-width="2"/>`, L('M113 125 h6', 1.2));
  // kulaklar
  b.push(S('M82 60 L76 20 C90 24 100 34 106 46 Z', C.ginger), F('M84 54 L81 30 C90 34 96 40 99 46 Z', C.pink), L('M84 50 l5 -8 M87 52 l5 -9 M86 46 l3 -9', 1.1, C.cream));
  b.push(S('M122 46 C128 34 140 24 152 20 L148 60 Z', C.ginger), F('M127 45 C133 36 140 30 146 28 L144 52 Z', C.pinkD), L('M140 50 l4 -9 M137 48 l4 -8', 1.1, C.cream));
  // baş
  b.push(S('M80 76 C78 54 92 40 112 40 C134 40 150 54 150 74 C150 84 154 90 160 94 C152 96 148 102 142 106 C132 114 92 114 82 106 C76 102 72 96 64 94 C72 90 80 86 80 76 Z', C.ginger));
  b.push(F('M138 46 C150 56 152 72 150 84 C150 92 154 92 158 94 C150 98 146 102 140 106 C142 92 144 66 138 46 Z', C.gingerD), H('M138 46 C150 56 152 72 150 84 C150 92 154 92 158 94 C150 98 146 102 140 106 C142 92 144 66 138 46 Z', id));
  b.push(L('M102 46 L105 57 M112 43 V56 M121 45 L118 57', 2.8, C.gingerD), L('M84 82 l-8 2 M85 88 l-9 4', 2.6, C.gingerD), L('M146 78 l7 0 M146 84 l7 3', 2.6, C.gingerD));
  // ağız bölgesi
  b.push(S('M98 88 C100 79 124 79 128 88 C132 98 122 106 113 106 C104 106 94 98 98 88 Z', C.cream, 'stroke-width="1.6"'));
  b.push(`<circle cx="92" cy="92" r="5" fill="${C.pink}" opacity=".55"/><circle cx="136" cy="90" r="4" fill="${C.pink}" opacity=".5"/>`);
  // gözler: badem, hardal iris, yarık bebek, ışık
  const eye = (cx, cy, rx, ry, rot) => `<g transform="rotate(${rot} ${cx} ${cy})">
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${C.cream}" stroke="${C.ink}" stroke-width="1.8"/>
    <circle cx="${cx + 1}" cy="${cy}" r="${ry - 0.6}" fill="${C.mustard}" stroke="${C.ink}" stroke-width="1"/>
    <circle cx="${cx + 1}" cy="${cy}" r="${ry - 2.6}" fill="${C.olive}" opacity=".55"/>
    <ellipse cx="${cx + 1}" cy="${cy}" rx="1.5" ry="${ry - 1.2}" fill="${C.ink}"/>
    <circle cx="${cx - 1.4}" cy="${cy - 2.4}" r="1.5" fill="#FFFDF6"/>
    <path d="M${cx - rx - 1} ${cy + 1} Q${cx} ${cy - ry * 1.9} ${cx + rx + 1} ${cy - 1} l3 -3" fill="none" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round"/></g>`;
  b.push(eye(98, 71, 9.5, 7, -8), eye(129, 69, 8.5, 6.6, 6));
  // burun, ağız, bıyık
  b.push(S('M108 86 L119 86 L113.5 92 Z', C.pink, 'stroke-width="1.6"'));
  b.push(L('M113.5 92 V96 M113.5 96 C110 100 106 99 105 96 M113.5 96 C117 100 121 99 122 96', 1.5));
  b.push(L('M100 93 L68 88 M100 96 L66 98 M101 99 L70 107', 1.1), L('M126 91 L158 84 M127 95 L160 95 M126 98 L154 106', 1.1));
  b.push(`<circle cx="104" cy="94" r=".9" fill="${C.ink}"/><circle cx="107" cy="97" r=".9" fill="${C.ink}"/><circle cx="121" cy="93" r=".9" fill="${C.ink}"/><circle cx="119" cy="97" r=".9" fill="${C.ink}"/>`);
  return wrap(id, b.join(''));
}
