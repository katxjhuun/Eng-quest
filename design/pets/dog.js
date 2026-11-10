import { C, S, F, L, H, wrap } from './common.js';
// Köpek-kurt — ayakta, yan profil sola bakarken başını izleyiciye çevirmiş. Kül-krem kurt postu, kırmızı fular.
export function dog(id = 'dog') {
  const b = [];
  b.push(`<ellipse cx="100" cy="186" rx="74" ry="6" fill="${C.ink}" opacity=".16"/>`);
  // kuyruk (gür, aşağı-yukarı kıvrık)
  b.push(S('M150 112 C170 110 184 124 182 146 C181 156 176 162 170 160 C174 148 170 130 160 126 C156 124 152 122 150 120 Z', C.ash));
  b.push(F('M176 132 C182 140 182 152 176 160 C173 150 172 140 170 134 Z', C.cream), L('M164 122 l4 8 M170 128 l3 8 M174 138 l2 7', 1.4, C.ashD));
  // uzak bacaklar (koyu)
  b.push(S('M138 128 C152 128 156 142 152 152 C150 158 146 162 148 170 L150 182 L140 182 C140 174 138 166 136 160 C132 150 130 134 138 128 Z', C.ashD));
  b.push(S('M74 140 C74 158 72 170 70 182 L82 182 C84 168 86 154 88 142 Z', C.ashD));
  // gövde
  b.push(S('M62 112 C66 96 92 90 120 92 C144 94 160 104 160 122 C160 140 150 150 128 152 C104 154 80 152 68 146 C58 140 58 124 62 112 Z', C.ash));
  b.push(F('M64 132 C80 148 120 152 150 144 C146 150 138 152 128 152 C104 154 80 152 68 146 C62 142 62 138 64 132 Z', C.cream));
  b.push(F('M90 94 C110 90 140 92 152 104 C138 98 112 98 92 102 Z', C.ashD), H('M118 96 C140 96 156 106 158 120 C150 110 136 104 118 102 Z', id));
  b.push(L('M96 104 l-3 7 M106 102 l-2 8 M116 102 l-1 8 M126 103 l1 8 M136 106 l2 7', 1.5, C.ashD));
  // yakın bacaklar + patiler
  b.push(S('M118 118 C138 114 148 132 142 148 C138 156 132 160 134 168 L138 182 L124 182 C124 174 122 166 120 158 C112 146 106 124 118 118 Z', C.ash), L('M124 128 C132 128 138 134 138 142', 1.4, C.ashD));
  b.push(S('M84 140 C86 156 86 170 84 182 L98 182 C100 168 102 154 102 142 Z', C.ash));
  b.push(L('M88 156 h10 M122 156 h12', 1.4, C.ashD));
  for (const x of [84, 124, 70, 140]) b.push(S(`M${x - 3} 188 C${x - 3} 180 ${x + 15} 180 ${x + 15} 188 Z`, x === 70 || x === 140 ? C.ashL : C.cream), L(`M${x + 3} 183 V188 M${x + 9} 183 V188`, 1.2));
  // boyun: baştan gövdeye
  b.push(S('M50 84 C52 104 64 116 80 118 C92 118 98 110 96 96 L88 84 Z', C.ash));
  // fular
  b.push(S('M48 100 C58 112 76 114 86 104 L90 112 C82 126 60 126 46 112 Z', C.brick));
  b.push(S('M64 116 L58 138 L74 128 Z', C.brick), `<circle cx="58" cy="110" r="1.6" fill="${C.cream}"/><circle cx="70" cy="116" r="1.6" fill="${C.cream}"/><circle cx="80" cy="112" r="1.6" fill="${C.cream}"/><circle cx="66" cy="128" r="1.4" fill="${C.cream}"/>`);
  // boyun yelesi + baş (3/4 izleyiciye)
  b.push(S('M44 104 C36 90 40 70 54 60 L84 64 C92 76 92 94 86 104 C74 112 56 112 44 104 Z', C.ash));
  b.push(L('M48 98 l-6 4 M52 104 l-5 6 M80 102 l5 5 M86 94 l6 3', 1.6, C.ashD));
  // kulaklar
  b.push(S('M44 52 L38 18 C50 22 60 32 64 44 Z', C.ash), F('M46 46 L43 27 C50 30 56 36 58 42 Z', C.pinkD));
  b.push(S('M74 42 C80 30 90 22 100 20 L96 54 Z', C.ash), F('M78 42 C83 33 89 28 94 27 L92 48 Z', C.pinkD));
  // kafa
  b.push(S('M38 66 C36 50 50 38 68 38 C88 38 100 50 100 66 C100 74 98 80 94 84 L86 96 C78 102 58 102 50 96 L42 84 C38 80 38 72 38 66 Z', C.ash));
  b.push(F('M86 44 C98 52 100 66 98 76 C96 82 92 88 88 94 C92 78 92 60 86 44 Z', C.ashD), H('M86 44 C98 52 100 66 98 76 C96 82 92 88 88 94 C92 78 92 60 86 44 Z', id));
  // kurt maskesi: alın koyu, yanaklar ve ağız krem
  b.push(F('M56 40 C62 50 66 58 69 66 C72 58 76 50 82 40 C74 38 64 38 56 40 Z', C.ashD));
  b.push(S('M50 72 C54 66 62 64 69 70 C76 64 84 66 88 72 C92 82 86 96 69 98 C52 96 46 82 50 72 Z', C.cream, 'stroke-width="1.6"'));
  b.push(S('M58 86 C58 80 80 80 80 86 C80 92 74 96 69 96 C64 96 58 92 58 86 Z', C.ashL, 'stroke-width="1.4"'));
  // gözler (amber, yuvarlak bebek), kaş
  const eye = (cx, cy, rx, ry, rot) => `<g transform="rotate(${rot} ${cx} ${cy})">
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${C.cream}" stroke="${C.ink}" stroke-width="1.8"/>
    <circle cx="${cx}" cy="${cy + 0.4}" r="${ry - 0.4}" fill="${C.mustardD}" stroke="${C.ink}" stroke-width="1"/>
    <circle cx="${cx}" cy="${cy + 0.4}" r="${ry * 0.42}" fill="${C.ink}"/>
    <circle cx="${cx - 1.6}" cy="${cy - 1.6}" r="1.3" fill="#FFFDF6"/>
    <path d="M${cx - rx - 1} ${cy - 1} Q${cx} ${cy - ry * 2} ${cx + rx + 1} ${cy - 2}" fill="none" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round"/></g>`;
  b.push(eye(56, 60, 7.5, 5.6, 8), eye(82, 60, 7.5, 5.6, -8));
  b.push(L('M48 50 C52 48 58 48 62 50 M76 50 C80 48 86 48 90 50', 2.2, C.ashD));
  // burun, ağız, dil
  b.push(S('M62 78 C62 73 76 73 76 78 C76 82 72 85 69 85 C66 85 62 82 62 78 Z', C.ink, 'stroke-width="1.4"'), `<ellipse cx="66" cy="76.5" rx="2.2" ry="1.2" fill="#FFFDF6" opacity=".7"/>`);
  b.push(L('M69 85 V89 M69 89 C66 93 60 92 59 89 M69 89 C72 93 78 92 79 89', 1.5));
  b.push(S('M64 91 C64 99 74 99 74 91 Z', C.pink, 'stroke-width="1.4"'), L('M69 92 V96', 1, C.pinkD));
  return wrap(id, b.join(''));
}
