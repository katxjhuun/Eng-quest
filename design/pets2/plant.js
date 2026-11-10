import { C, P, B, O, E, wrap } from './common.js';
// Bitki — saksıda; simetrik badem yapraklar, yarısı yeşil yarısı kurumuş (kâğıt damarlar), tek tomurcuk, kapalı göz.
export function plant(id = 'plant') {
  const b = [];
  // saksı: yamuk, iki düzlem + bant
  b.push(P('M64 140 L136 140 L128 186 L72 186 Z', C.rust), P('M112 140 L136 140 L128 186 L106 186 Z', C.rustD));
  b.push(P('M58 130 L142 130 L142 142 L58 142 Z', C.rustD));
  b.push(B('M74 160 L126 160', 1.4, C.ochre), B('M76 170 L124 170', 1.4, C.ochre));
  // sap
  b.push(B('M100 130 L100 50', 5, C.oliveD));
  // yapraklar: badem şekiller, damar = kâğıt çizgi
  const leaf = (x, y, ang, len, fill, vein) => {
    b.push(`<g transform="translate(${x} ${y}) rotate(${ang})">${P(`M0 0 C${len * 0.3} ${-len * 0.22} ${len * 0.75} ${-len * 0.2} ${len} 0 C${len * 0.75} ${len * 0.2} ${len * 0.3} ${len * 0.22} 0 0 Z`, fill)}${B(`M2 0 L${len - 4} 0`, 1.2, vein)}${B(`M${len * 0.3} 0 l${len * 0.12} ${-len * 0.1} M${len * 0.5} 0 l${len * 0.12} ${-len * 0.09} M${len * 0.3} 0 l${len * 0.12} ${len * 0.1} M${len * 0.5} 0 l${len * 0.12} ${len * 0.09}`, 0.9, vein)}</g>`);
  };
  // sol: canlı
  leaf(100, 116, 200, 44, C.olive, C.paper); leaf(100, 92, 205, 40, C.olive, C.paper); leaf(100, 68, 215, 34, C.olive, C.paper);
  // sağ: kurumuş, kuru-kahve, damar koyu, uçları kırık
  leaf(100, 112, -20, 42, C.sandD, C.grayD); leaf(100, 88, -28, 36, C.gray, C.grayD);
  b.push(B('M100 64 L122 46 M114 52 l2 -7 M118 49 l6 1', 2, C.grayD));
  // tomurcuk
  b.push(E(100, 44, 6, 9, C.salmon), P('M100 35 A6 9 0 0 1 100 53 C103 48 103 40 100 35 Z', C.rust, 'opacity=".6"'));
  // yüz: sapta küçük oval levha + iki kapalı göz çizgisi (sakin, ne umutlu ne umutsuz)
  b.push(E(100, 124, 13, 9, C.olive), B('M93 123 q2.5 2 5 0 M102 123 q2.5 2 5 0', 1.3, C.black), B('M97 128 h6', 1.1, C.black));
  // düşmüş yaprak
  b.push(P('M146 184 C150 178 158 176 164 180 C158 186 152 186 146 184 Z', C.sandD));
  return wrap(id, b.join(''));
}
