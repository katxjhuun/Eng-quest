// dam-la — sıfırdan çizilmiş üç pet ailesi (görünüş setleri). Klasik petlerin boyanmış hali DEĞİL: her setin kendi geometrisi var.
//  · shadow (Gölge)   — yumuşak, yuvarlak kömür siyahı siluetler; iri beyaz gözler; duygu kapak ve bakışla.
//  · cosmic (Kozmik)  — tombul, iri başlı, parlayan uzaylı-hayvanlar; neon degrade, anten/yıldız süsleri, ağır kapaklı gözler.
//  · toy (Oyuncak)    — köşeli düşük poligon oyuncaklar; her yüzey açık/gölge iki yüzlü; boncuk gözler.
// Animasyon motoru (figure.js) parçaları ADLARIYLA oynatır; bu yüzden her set aynı parça adlarını ve dönme noktalarını kullanır:
// root · body · head · tail · legNB/legNF/legFB/legFF · earL/earR · wingL/wingR · jaw · pup* · lid* · nose · tongue …
// Böylece yürüyüş, zıplama, süzülme, göz kırpma, bakış ve bütün klipler (stalk, fear, fly, spin…) her sette aynen çalışır.
// Koordinatlar: viewBox 0 0 200 200, yer çizgisi y=186, orta x=100. Yandan bakanlar sağa bakar.

const part = (k, p, s, kids = [], min = 0) => ({ k, p, s: Array.isArray(s) ? s.join('') : s, kids, min, raw: 1 });
const only = (st, k, p, s, kids = []) => part(k, p, s, kids, st);
const f1 = n => Math.round(n * 10) / 10;

// ---------------------------------------------------------------- stil çekirdeği
// tonlar: b (gövde), d (koyu/uzak taraf), l (açık: karın/ağız), a (vurgu), n (burun/gaga), e (göz beyazı), p (göz bebeği)
const PAL = {
  shadow: () => ({ b: '#19171D', d: '#121015', l: '#19171D', a: '#19171D', n: '#19171D', e: '#FFFFFF', p: '#19171D', lid: '#19171D' }),
  cosmic: sp => ({ b: `url(#c${sp}B)`, d: `url(#c${sp}D)`, l: '#F7E8FF', a: COSMIC_ACC[sp] || '#7FF7EE', n: '#FF7AD9', e: '#F2FFFC', p: '#1B0E52', lid: `url(#c${sp}B)` }),
  toy: (sp, coat) => { const c = toyColors(sp, coat), id = `t${sp}${coat | 0}`; return { b: `url(#${id}B)`, d: `url(#${id}D)`, l: `url(#${id}L)`, a: `url(#${id}A)`, n: c.n, e: '#24212B', p: '#24212B', lid: c.b }; },
};
// kozmik: tür başına iki tonlu degrade
const COSMIC_GRAD = {
  cat: ['#B66BFF', '#5A2BE0'], dog: ['#5FE6FF', '#3B6BFF'], chick: ['#FFE45C', '#FF7A3D'], owl: ['#FF7AD9', '#8A3CFF'], gecko: ['#B8FF5C', '#1FB8A8'],
  goat: ['#E6D6FF', '#9B7BFF'], whale: ['#6FE0FF', '#3A2BD8'], doodle: ['#FFB04D', '#FF4FA0'], plant: ['#7DFFB0', '#1FA8C8'],
};
const COSMIC_ACC = { cat: '#7FF7EE', dog: '#FF7AD9', chick: '#7FF7EE', owl: '#FFE45C', gecko: '#FF7AD9', goat: '#FFE45C', whale: '#FF7AD9', doodle: '#7FF7EE', plant: '#FF5FC8' };
// oyuncak: tür başına pastel taban; kedi/köpek tüy rengine göre
const TOY_BASE = {
  cat: ['#F2A65A', '#8E9AAF', '#F6EBD3', '#55525F', '#E07A5F', '#F2C98A', '#B9A6E8', '#B07D5B'], dog: ['#C98E5A', '#F2C98A', '#8E9AAF', '#55525F', '#F6EBD3', '#B07D5B', '#E07A5F', '#A9B8C8'],
  chick: ['#F7D35C'], owl: ['#B07D5B'], gecko: ['#7BC67E'], goat: ['#F3EEE3'], whale: ['#7BA7E0'], doodle: ['#F28C5A'], plant: ['#7BC67E'],
};
const rgb = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const shade = (h, f) => '#' + rgb(h).map(v => Math.max(0, Math.min(255, Math.round(v * f)))).map(v => v.toString(16).padStart(2, '0')).join('');
function toyColors(sp, coat = 0) {
  const list = TOY_BASE[sp] || ['#F2C98A']; const b = list[(coat | 0) % list.length];
  const l = sp === 'goat' ? '#FFFFFF' : '#FBF3E2';
  return { b, d: shade(b, 0.78), l, a: sp === 'plant' ? '#F4A6B8' : sp === 'chick' ? '#F2A65A' : shade(b, 0.62), n: sp === 'chick' || sp === 'owl' ? '#F2A65A' : '#E8828F' };
}
// svg başına tanımlar (degradeler). Aynı kimlikli eş tanımlar aynı içerikte olduğundan sorun çıkarmaz.
export function setDefs(style, sp, coat) {
  coat = coatOf(sp, coat);
  if (style === 'cosmic') {
    const [a, b] = COSMIC_GRAD[sp] || COSMIC_GRAD.cat;
    return `<defs><linearGradient id="c${sp}B" x1="0.2" y1="0" x2="0.6" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><linearGradient id="c${sp}D" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${shade(b, 0.85)}"/><stop offset="1" stop-color="${shade(b, 0.55)}"/></linearGradient><radialGradient id="cGlow${sp}"><stop offset="0" stop-color="${a}" stop-opacity=".5"/><stop offset=".6" stop-color="${b}" stop-opacity=".16"/><stop offset="1" stop-color="${b}" stop-opacity="0"/></radialGradient></defs>`;
  }
  if (style === 'toy') {
    const c = toyColors(sp, coat);
    const g = (id, h) => `<linearGradient id="t${sp}${coat | 0}${id}" x1="0.15" y1="0" x2="0.6" y2="1"><stop offset="0" stop-color="${shade(h, 1.12)}"/><stop offset=".44" stop-color="${shade(h, 1.12)}"/><stop offset=".44" stop-color="${h}"/><stop offset=".78" stop-color="${h}"/><stop offset=".78" stop-color="${shade(h, 0.84)}"/><stop offset="1" stop-color="${shade(h, 0.84)}"/></linearGradient>`;
    return `<defs>${g('B', c.b)}${g('D', c.d)}${g('L', c.l)}${g('A', c.a)}</defs>`;
  }
  return '';
}
export const setBack = (style, sp, k) => style === 'cosmic' ? `<ellipse cx="100" cy="${f1(186 - 64 * k)}" rx="${f1(84 * k)}" ry="${f1(72 * k)}" fill="url(#cGlow${sp})"/>` : '';

// ---------------------------------------------------------------- şekil ilkeleri (stile göre: yuvarlak ya da köşeli)
const coatOf = (sp, coat) => (sp === 'cat' || sp === 'dog' ? coat | 0 : 0);
function G(style, sp, coat) {
  coat = coatOf(sp, coat);
  const P = PAL[style](sp, coat);
  const poly = style === 'toy';
  const fill = t => P[t] || t;
  const ln = 'stroke-linejoin="round"';
  const S = {
    P, poly, style,
    // elips: köşeli stilde n köşeli çokgen
    E(cx, cy, rx, ry, t, rot = 0, n = 7) {
      if (!poly) return `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${fill(t)}"${rot ? ` transform="rotate(${rot} ${f1(cx)} ${f1(cy)})"` : ''}/>`;
      const a0 = -Math.PI / 2 + 0.35, r = rot * Math.PI / 180;
      const pts = Array.from({ length: n }, (_, i) => { const a = a0 + i * 2 * Math.PI / n, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return `${f1(cx + x * Math.cos(r) - y * Math.sin(r))},${f1(cy + x * Math.sin(r) + y * Math.cos(r))}`; });
      return `<polygon points="${pts.join(' ')}" fill="${fill(t)}" ${ln}/>`;
    },
    // serbest çokgen / yol
    Pg(pts, t) { return `<polygon points="${pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' ')}" fill="${fill(t)}" ${ln}/>`; },
    Path(d, t) { return `<path d="${d}" fill="${fill(t)}"/>`; },
    // kalın çizgi (kuyruk, bacak, sap): köşeli stilde kırık çizgi
    Line(pts, w, t) {
      if (poly) return `<polyline points="${pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' ')}" fill="none" stroke="${fill(t)}" stroke-width="${w}" stroke-linejoin="bevel" stroke-linecap="square"/>`;
      let d = `M${pts[0][0]} ${pts[0][1]}`;
      if (pts.length === 2) d += ` L${pts[1][0]} ${pts[1][1]}`;
      else for (let i = 1; i < pts.length - 1; i++) { const [x, y] = pts[i], [nx, ny] = pts[i + 1]; const ex = i === pts.length - 2 ? nx : (x + nx) / 2, ey = i === pts.length - 2 ? ny : (y + ny) / 2; d += ` Q${x} ${y} ${f1(ex)} ${f1(ey)}`; }
      return `<path d="${d}" fill="none" stroke="${fill(t)}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    },
    // bacak: üstten (dönme noktası) aşağı yuvarlak uçlu dikdörtgen
    Leg(x, y, len, w, t) {
      if (poly) return S.Pg([[x - w / 2, y - 3], [x + w / 2, y - 3], [x + w / 2 - 1, y + len - 2], [x + w / 2 + 2, y + len], [x - w / 2 - 1, y + len], [x - w / 2 + 1, y + len - 2]], t);
      return `<rect x="${f1(x - w / 2)}" y="${f1(y - 4)}" width="${f1(w)}" height="${f1(len + 4)}" rx="${f1(w / 2)}" fill="${fill(t)}"/>`;
    },
    Tri(a, b, c, t) { return S.Pg([a, b, c], t); },
  };
  return S;
}
// gözler: setin dili. two: iki göz (önden), tek göz (yandan)
function eyes(S, list, R, { lidMin = 0 } = {}) {
  const st = S.style, kids = [];
  if (st === 'toy') {
    list.forEach(([k, x, y]) => kids.push(part('pup' + k, [x, y], `<circle cx="${x}" cy="${y}" r="${f1(R * 0.42)}" fill="#24212B"/><circle cx="${f1(x - R * 0.14)}" cy="${f1(y - R * 0.16)}" r="${f1(R * 0.13)}" fill="#fff"/>`)));
    return kids;
  }
  const white = S.P.e, pup = S.P.p, lid = S.P.lid;
  kids.push(part('scl', [100, 100], list.map(([, x, y]) => `<circle cx="${x}" cy="${y}" r="${f1(R)}" fill="${white}"/>`).join('')));
  list.forEach(([k, x, y, side]) => { const pr = R * (st === 'cosmic' ? 0.48 : 0.56), dx = side ? R * 0.25 : 0; kids.push(part('pup' + k, [x, y], `<circle cx="${f1(x + dx)}" cy="${y}" r="${f1(pr)}" fill="${pup}"/><circle cx="${f1(x + dx - pr * 0.35)}" cy="${f1(y - pr * 0.4)}" r="${f1(pr * 0.3)}" fill="#fff" opacity=".9"/>`)); });
  list.forEach(([k, x, y]) => kids.push(part('lid' + k, [x, y - R - 0.8], `<circle cx="${x}" cy="${y}" r="${f1(R + 0.9)}" fill="${lid}"/>`)));
  if (st === 'cosmic') kids.push(part('hlid', [100, 100], list.map(([, x, y]) => `<path d="M${f1(x - R - 0.9)} ${f1(y - R * 0.12)} A${f1(R + 0.9)} ${f1(R + 0.9)} 0 0 1 ${f1(x + R + 0.9)} ${f1(y - R * 0.12)} Q${x} ${f1(y + R * 0.12)} ${f1(x - R - 0.9)} ${f1(y - R * 0.12)}Z" fill="${lid}"/>`).join('')));
  return kids;
}
// kozmik süsler: anten (başın tepesinde) ve küçük yıldızlar
const antenna = (S, x, y, h = 16) => S.style !== 'cosmic' ? '' : `<path d="M${x} ${y} Q${x + 4} ${y - h * 0.6} ${x + 1} ${y - h}" fill="none" stroke="${S.P.a}" stroke-width="2" stroke-linecap="round"/><circle cx="${x + 1}" cy="${y - h}" r="3.2" fill="${S.P.a}"/>`;
const star = (x, y, r, c) => { let d = ''; for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + i * Math.PI / 4, rr = i % 2 ? r * 0.42 : r; d += `${i ? 'L' : 'M'}${f1(x + Math.cos(a) * rr)} ${f1(y + Math.sin(a) * rr)}`; } return `<path d="${d}Z" fill="${c}"/>`; };

// ---------------------------------------------------------------- dört ayaklılar (yandan, sağa bakar): kedi, köpek, keçi, gecko, doodle
// q: tür ölçüleri. Kalça noktaları: arka x=hb, ön x=hf, y=hy; bacak boyu L (hy+L = 186)
const QUAD = {
  cat: { hb: 80, hf: 124, hy: 150, L: 36, lw: 9, body: [102, 140, 33, 17], neck: [128, 126], head: [148, 110, 20, 18.5], ear: 'point', tail: 'curl', snout: 0 },
  dog: { hb: 78, hf: 126, hy: 148, L: 38, lw: 11, body: [102, 136, 35, 19], neck: [128, 122], head: [150, 105, 21, 18.5], ear: 'flop', tail: 'up', snout: 9 },
  goat: { hb: 80, hf: 124, hy: 146, L: 40, lw: 9, body: [102, 132, 34, 17], neck: [126, 118], head: [147, 97, 16, 18], ear: 'side', tail: 'stub', snout: 6, horns: 1, beard: 1 },
  gecko: { hb: 82, hf: 122, hy: 172, L: 14, lw: 7, body: [102, 166, 30, 10], neck: [128, 162], head: [146, 156, 18, 12.5], ear: 'none', tail: 'long', snout: 4 },
  doodle: { hb: 86, hf: 116, hy: 150, L: 36, lw: 14, body: [100, 132, 28, 24], neck: [114, 112], head: [118, 95, 23, 21], ear: 'nub', tail: 'none', snout: 0 },
};
function quadStand(style, sp, coat, st) {
  const S = G(style, sp, coat), q = QUAD[sp], { P } = S;
  const [bx, by, brx, bry] = q.body, [hx, hy, hrx, hry] = q.head;
  const R = style === 'toy' ? 7.5 : sp === 'gecko' ? 7.5 : sp === 'doodle' ? 11 : 9;
  const out = [];
  // kuyruk
  const tailPts = { curl: [[bx - brx + 4, by - 4], [bx - brx - 16, by - 14], [bx - brx - 18, by - 38], [bx - brx - 6, by - 44]], up: [[bx - brx + 4, by - 6], [bx - brx - 10, by - 22], [bx - brx - 8, by - 36]], stub: [[bx - brx + 4, by - 8], [bx - brx - 6, by - 16]], long: [[bx - brx + 6, by], [bx - brx - 18, by + 6], [bx - brx - 40, by + 2], [bx - brx - 50, by - 10]] }[q.tail];
  if (tailPts) out.push(part('tail', tailPts[0], S.Line(tailPts, sp === 'gecko' ? 9 : sp === 'goat' ? 8 : 7, 'b') + (style === 'cosmic' && q.tail === 'curl' ? star(tailPts.at(-1)[0], tailPts.at(-1)[1], 5, P.a) : '')));
  // uzak bacaklar
  out.push(part('legFB', [q.hb + 6, q.hy], S.Leg(q.hb + 6, q.hy, q.L, q.lw, 'd')), part('legFF', [q.hf + 6, q.hy], S.Leg(q.hf + 6, q.hy, q.L, q.lw, 'd')));
  // gövde
  const bodyS = [S.E(bx, by, brx, bry, 'b', 0, 8)];
  if (style !== 'shadow') bodyS.push(S.E(bx + 4, by + bry * 0.42, brx * 0.7, bry * 0.45, 'l', 0, 6));
  const bodyKids = [];
  if (sp === 'cat') bodyKids.push(only(4, 'spots', [bx, by], style === 'shadow' ? '' : [[-14, -6], [0, -9], [14, -5], [-6, 2], [8, 3]].map(([x, y]) => S.E(bx + x, by + y, 3.4, 2.6, 'd', 0, 5)).join('')));
  if (sp === 'gecko') bodyKids.push(only(2, 'bspots', [bx, by], [[-16, -4], [-4, -6], [8, -5], [20, -3]].map(([x, y]) => S.E(bx + x, by + y, 2.6, 2, style === 'shadow' ? 'b' : 'a', 0, 5)).join('')));
  if (sp === 'gecko') bodyKids.push(only(3, 'crest', [bx, by - bry], style === 'shadow' ? '' : [[-20], [-8], [4], [16]].map(([x]) => S.Tri([bx + x - 4, by - bry + 2], [bx + x, by - bry - 7], [bx + x + 4, by - bry + 2], 'a')).join('')));
  if (sp === 'dog' || sp === 'cat') bodyKids.push(only(2, 'collar', [q.neck[0], q.neck[1]], style === 'shadow' ? '' : S.E(q.neck[0] + 2, q.neck[1] + 6, 4, 9, 'a', -20, 5)));
  out.push(part('body', [bx, by], bodyS, bodyKids));
  // yakın bacaklar
  out.push(part('legNB', [q.hb, q.hy], S.Leg(q.hb, q.hy, q.L, q.lw, 'b')), part('legNF', [q.hf, q.hy], S.Leg(q.hf, q.hy, q.L, q.lw, 'b')));
  // baş
  const hk = [];
  if (q.ear === 'point') {
    hk.push(part('earL', [hx - 6, hy - hry + 4], S.Tri([hx - 14, hy - hry + 6], [hx - 10, hy - hry - 16], [hx - 1, hy - hry + 2], 'd')));
    hk.push(part('earR', [hx + 5, hy - hry + 3], S.Tri([hx - 3, hy - hry + 4], [hx + 6, hy - hry - 18], [hx + 12, hy - hry + 5], 'b') + (style === 'cosmic' ? S.Tri([hx + 1, hy - hry + 2], [hx + 6, hy - hry - 10], [hx + 9, hy - hry + 3], 'n') : style === 'toy' ? S.Tri([hx + 1, hy - hry + 2], [hx + 6, hy - hry - 10], [hx + 9, hy - hry + 3], 'n') : '')));
  } else if (q.ear === 'flop') {
    hk.push(part('earL', [hx - 8, hy - hry + 4], S.E(hx - 12, hy - hry + 10, 6, 12, 'd', 20, 6)));
    hk.push(part('earR', [hx - 2, hy - hry + 2], S.E(hx - 6, hy - hry + 12, 6.5, 13, 'd', 14, 6)));
  } else if (q.ear === 'side') {
    hk.push(part('earL', [hx - 8, hy - 6], S.E(hx - 16, hy - 8, 9, 4, 'd', -18, 5)));
    hk.push(part('earR', [hx + 2, hy - 8], S.E(hx - 6, hy - 10, 9, 4, 'b', -28, 5)));
  } else if (q.ear === 'nub') {
    hk.push(part('earL', [hx - 8, hy - hry], S.E(hx - 8, hy - hry + 2, 6, 6, 'd', 0, 5)));
    hk.push(part('earR', [hx + 6, hy - hry], S.E(hx + 6, hy - hry + 1, 6, 6, 'b', 0, 5)));
  }
  if (q.horns) hk.push(only(2, 'horns', [hx - 4, hy - hry], S.Line([[hx - 2, hy - hry + 4], [hx - 6, hy - hry - 10], [hx - 16, hy - hry - 16], [hx - 20, hy - hry - 8]], st >= 4 ? 6 : 4.5, style === 'shadow' ? 'b' : style === 'cosmic' ? P.a : 'a')));
  const skull = [S.E(hx, hy, hrx, hry, 'b', 0, 8)];
  if (q.snout) skull.push(S.E(hx + hrx * 0.8, hy + hry * 0.25, q.snout + 2, q.snout * 0.75, style === 'shadow' ? 'b' : 'l', 0, 6));
  if (sp === 'doodle' && style !== 'shadow') skull.push(S.E(hx + 4, hy + 8, 10, 4, 'l', 0, 5));
  hk.push(part('skull', [hx, hy], skull));
  if (q.beard) hk.push(only(1, 'beard', [hx + 4, hy + hry], S.Tri([hx + 2, hy + hry - 3], [hx + 7, hy + hry + 10], [hx + 10, hy + hry - 3], style === 'shadow' ? 'b' : 'l')));
  // göz: yandan tek göz (doodle: tek iri göz, kozmikte üç göz ileri evrede)
  const ex = sp === 'doodle' ? hx + 6 : hx + hrx * 0.3, ey = hy - hry * 0.18;
  hk.push(...eyes(S, [['', ex, ey, true]], R));
  if (style === 'cosmic' && st >= 5 && sp !== 'doodle') hk.push(part('eye3', [ex - 10, ey - 8], `<circle cx="${ex - 10}" cy="${ey - 9}" r="3.4" fill="${P.e}"/><circle cx="${ex - 9.5}" cy="${ey - 9}" r="1.6" fill="${P.p}"/>`));
  hk.push(part('nose', [hx + hrx + q.snout, hy + 1], style === 'shadow' ? '' : S.E(hx + hrx + q.snout * 0.9, hy + (q.snout ? 0 : 2), 2.4, 1.8, 'n', 0, 5)));
  hk.push(part('jaw', [hx + hrx * 0.7, hy + hry * 0.55], style === 'shadow' ? '' : `<path d="M${f1(hx + hrx * 0.45)} ${f1(hy + hry * 0.5)} q4 3 8 0" fill="none" stroke="${style === 'cosmic' ? '#2A1572' : '#3a2f35'}" stroke-width="1.4" stroke-linecap="round"/>`));
  if (style === 'cosmic') hk.push(part('ant', [hx - 4, hy - hry], antenna(S, hx - 2, hy - hry + 2, sp === 'doodle' ? 18 : 14)));
  out.push(part('head', q.neck, [], hk));
  return out;
}
function quadLie(style, sp, coat, st) {
  const S = G(style, sp, coat), q = QUAD[sp];
  const [bx, , brx, bry] = q.body, [, , hrx, hry] = q.head;
  const by = 186 - bry * 0.9, hx = bx + brx * 0.85, hy = 186 - hry * 0.95;
  const R = style === 'toy' ? 6 : 7;
  const out = [];
  if (q.tail !== 'none') out.push(part('tail', [bx - brx + 4, by + 4], S.Line([[bx - brx + 4, by + 6], [bx - brx - 12, by + 12], [bx - brx + 6, by + bry * 0.9]], 6, 'b')));
  out.push(part('body', [bx, by], [S.E(bx, by, brx * 1.04, bry * 0.92, 'b', 0, 8)]));
  const hk = [];
  if (q.ear === 'point') hk.push(part('earR', [hx + 4, hy - hry], S.Tri([hx - 4, hy - hry + 4], [hx + 4, hy - hry - 14], [hx + 10, hy - hry + 5], 'b')));
  else if (q.ear !== 'none') hk.push(part('earR', [hx - 4, hy - hry + 3], S.E(hx - 6, hy - hry + 8, 6, 10, 'd', 30, 6)));
  hk.push(part('skull', [hx, hy], S.E(hx, hy, hrx, hry * 0.9, 'b', 0, 8)));
  hk.push(...eyes(S, [['', hx + hrx * 0.3, hy - 2, true]], R));
  out.push(part('head', [hx - 6, hy + 4], [], hk));
  return out;
}

// ---------------------------------------------------------------- kuşlar (önden): civciv, baykuş
function bird(style, sp, coat, st) {
  const S = G(style, sp, coat), { P } = S, owl = sp === 'owl';
  const out = [];
  // civciv evre 0: yumurta
  if (!owl && st === 0) {
    out.push(part('body', [100, 160], [S.E(100, 156, 26, 32, style === 'shadow' ? 'b' : 'l', 0, 9)]));
    out.push(part('head', [100, 150], [], [part('skull', [100, 150], style === 'shadow' ? '' : S.Pg([[76, 152], [86, 146], [94, 154], [104, 145], [114, 153], [124, 147], [126, 160], [74, 160]], 'b')), ...eyes(S, [['L', 92, 152], ['R', 108, 152]], style === 'toy' ? 6 : 5)]));
    return out;
  }
  const by = owl ? 148 : 152, bR = owl ? 33 : 26, hy = owl ? 112 : 116, hR = owl ? 26 : 21;
  // tavus kuyruğu (civciv 4-5)
  if (!owl && st >= 4) {
    const n = st === 5 ? 9 : 7, fan = [];
    for (let i = 0; i < n; i++) { const a = Math.PI + (i + 0.5) * Math.PI / n, x = 100 + Math.cos(a) * 58, y = 150 + Math.sin(a) * 58; fan.push(S.Line([[100, 150], [x, y]], 3, 'd'), S.E(x, y, 6, 6, style === 'shadow' ? 'b' : 'a', 0, 6), style === 'shadow' ? '' : S.E(x, y, 2.6, 2.6, 'd', 0, 5)); }
    out.push(part('tail', [100, 150], fan));
  } else out.push(part('tail', [100, by + 6], S.Tri([86, by + 16], [72, by + 4], [94, by + 2], 'd')));
  out.push(part('legs', [100, 180], [S.Line([[92, by + bR - 4], [92, 184]], 3, style === 'shadow' ? 'b' : 'n'), S.Line([[108, by + bR - 4], [108, 184]], 3, style === 'shadow' ? 'b' : 'n'), S.Line([[86, 185], [96, 185]], 3, style === 'shadow' ? 'b' : 'n'), S.Line([[104, 185], [114, 185]], 3, style === 'shadow' ? 'b' : 'n')]));
  const body = [S.E(100, by, bR, bR * 1.02, 'b', 0, 8)];
  if (style !== 'shadow') body.push(S.E(100, by + 8, bR * 0.62, bR * 0.7, 'l', 0, 7));
  const bk = [];
  if (owl && style !== 'shadow') bk.push(part('bspots', [100, by], [[-8, 2], [0, 6], [8, 2], [-4, 12], [4, 12]].map(([x, y]) => S.Path(`M${100 + x - 3} ${by + y} q3 3 6 0`, 'none').replace('fill="none"', `fill="none" stroke="${style === 'cosmic' ? '#8A3CFF' : shade(toyColors(sp).b, 0.7)}" stroke-width="1.6"`)).join('')));
  out.push(part('body', [100, by], body, bk));
  out.push(part('wingL', [100 - bR + 4, by - 8], S.E(100 - bR + 2, by + 4, 9, 18, 'd', 14, 6)), part('wingR', [100 + bR - 4, by - 8], S.E(100 + bR - 2, by + 4, 9, 18, 'd', -14, 6)));
  const hk = [];
  if (owl) {
    hk.push(part('earL', [86, hy - hR + 4], S.Tri([78, hy - hR + 8], [80, hy - hR - 12], [92, hy - hR + 2], 'b'), [], 0));
    hk.push(part('earR', [114, hy - hR + 4], S.Tri([122, hy - hR + 8], [120, hy - hR - 12], [108, hy - hR + 2], 'b'), [], 0));
  } else {
    hk.push(part('tuft', [100, hy - hR], S.Line([[100, hy - hR + 3], [98, hy - hR - 8], [104, hy - hR - 12]], 3.4, style === 'shadow' ? 'b' : 'a')));
    if (st >= 4) hk.push(part('crown', [100, hy - hR], [[-6], [0], [6]].map(([x]) => S.Line([[100, hy - hR + 2], [100 + x * 1.4, hy - hR - 16]], 1.6, 'd') + S.E(100 + x * 1.4, hy - hR - 17, 2.4, 2.4, style === 'shadow' ? 'b' : 'a', 0, 5)).join('')));
  }
  const skull = [S.E(100, hy, hR, hR * 0.95, 'b', 0, 8)];
  if (owl && style !== 'shadow') skull.push(S.E(90, hy + 2, 11, 11, 'l', 0, 7), S.E(110, hy + 2, 11, 11, 'l', 0, 7));
  hk.push(part('skull', [100, hy], skull));
  const R = style === 'toy' ? (owl ? 11 : 8) : owl ? 9.5 : 7;
  hk.push(...eyes(S, [['L', owl ? 90 : 92, hy + (owl ? 2 : -2)], ['R', owl ? 110 : 108, hy + (owl ? 2 : -2)]], R));
  hk.push(part('nose', [100, hy + 10], S.Tri([95, hy + (owl ? 9 : 6)], [105, hy + (owl ? 9 : 6)], [100, hy + (owl ? 16 : 14)], style === 'shadow' ? 'b' : 'n')));
  if (style === 'cosmic') hk.push(part('ant', [100, hy - hR], owl ? '' : antenna(S, 108, hy - hR + 4, 12)));
  if (owl && st >= 5 && style === 'cosmic') hk.push(part('glow', [100, hy - hR - 14], star(100, hy - hR - 14, 7, P.a)));
  out.push(part('head', [100, hy + hR * 0.6], [], hk));
  return out;
}

// ---------------------------------------------------------------- balina (yandan, yüzer)
function whale(style, sp, coat, st) {
  const S = G(style, sp, coat), { P } = S;
  const out = [];
  out.push(part('tail', [52, 150], [S.Line([[64, 150], [44, 146]], 10, 'b'), S.Tri([46, 146], [26, 130], [32, 150], 'b'), S.Tri([46, 148], [28, 166], [34, 150], 'd')]));
  out.push(part('wingL', [112, 160], S.E(108, 166, 12, 5, 'd', 30, 5)));
  const body = [S.E(104, 150, 54, 22, 'b', 0, 9)];
  if (style !== 'shadow') body.push(S.Path('M62 156 C80 170 130 174 156 156 C150 166 132 172 104 172 C82 172 68 166 62 156 Z', 'l'));
  const bk = [];
  if (style !== 'shadow') bk.push(only(3, 'belly', [104, 162], [0, 1, 2, 3, 4].map(i => `<path d="M${84 + i * 12} 160 l0 9" stroke="${style === 'cosmic' ? '#B44CFF' : '#9BB9D8'}" stroke-width="1.6"/>`).join('')));
  out.push(part('body', [104, 150], body, bk));
  out.push(part('wingR', [118, 162], S.E(116, 168, 13, 5.5, 'b', 28, 5)));
  const hk = [];
  hk.push(...eyes(S, [['', 140, 146, true]], style === 'toy' ? 6 : 6.4));
  hk.push(part('jaw', [148, 158], style === 'shadow' ? '' : `<path d="M132 158 q10 4 22 -2" fill="none" stroke="${style === 'cosmic' ? '#2A1572' : '#3a3f55'}" stroke-width="1.6" stroke-linecap="round"/>`));
  hk.push(only(2, 'spout', [124, 126], S.Line([[124, 128], [124, 116], [116, 110]], 3, style === 'shadow' ? 'b' : style === 'cosmic' ? P.a : 'l') + S.Line([[124, 116], [132, 110]], 3, style === 'shadow' ? 'b' : style === 'cosmic' ? P.a : 'l')));
  if (style === 'cosmic' && st >= 4) hk.push(part('ant', [128, 128], antenna(S, 126, 130, 14)));
  out.push(part('head', [150, 146], [], hk));
  return out;
}

// ---------------------------------------------------------------- bitki (önden, saksıda)
function plant(style, sp, coat, st) {
  const S = G(style, sp, coat), { P } = S;
  const out = [];
  const potCol = style === 'shadow' ? 'b' : style === 'cosmic' ? 'd' : 'a';
  out.push(part('pot', [100, 176], [S.Pg([[76, 160], [124, 160], [118, 186], [82, 186]], potCol), S.Pg([[72, 154], [128, 154], [128, 162], [72, 162]], style === 'toy' ? 'n' : potCol)]));
  const top = [154, 146, 128, 118, 112, 104][st];
  const bodyS = [];
  if (st === 4) bodyS.push(S.E(100, 128, 14, 26, 'b', 0, 8));
  else if (st === 5) bodyS.push(S.Line([[100, 154], [100, 126]], 9, style === 'shadow' ? 'b' : style === 'toy' ? 'n' : 'd'));
  else if (st >= 1) bodyS.push(S.Line([[100, 154], [100, top + 8]], 3.4, 'b'));
  out.push(part('body', [100, 154], bodyS));
  if (st >= 1 && st !== 5) {
    out.push(part('wingL', [100, st === 4 ? 132 : 146], st === 4 ? S.E(84, 128, 6, 12, 'b', -20, 6) : S.E(88, 142, 11, 5, 'b', -24, 6)));
    out.push(part('wingR', [100, st === 4 ? 122 : 140], st === 4 ? S.E(116, 118, 6, 11, 'b', 20, 6) : S.E(112, 136, 11, 5, 'b', 24, 6)));
  }
  const hk = [];
  const hy = st === 0 ? 156 : st === 5 ? 98 : top;
  if (st === 0) hk.push(part('skull', [100, hy], S.E(100, hy, 12, 8, 'b', 0, 7)));
  else if (st === 2) hk.push(part('petals', [100, hy], [...Array(8)].map((_, i) => { const a = i * Math.PI / 4; return S.E(100 + Math.cos(a) * 15, hy + Math.sin(a) * 15, 7, 4, style === 'shadow' ? 'b' : 'l', i * 45, 5); }).join('') + S.E(100, hy, 11, 11, style === 'shadow' ? 'b' : 'a', 0, 7)));
  else if (st === 3) hk.push(part('skull', [100, hy], [S.Pg([[86, hy - 4], [90, hy - 20], [96, hy - 8], [100, hy - 22], [104, hy - 8], [110, hy - 20], [114, hy - 4], [112, hy + 10], [88, hy + 10]], style === 'shadow' ? 'b' : 'a')]));
  else if (st === 5) hk.push(part('skull', [100, hy], [S.E(84, hy + 6, 18, 16, 'b', 0, 8), S.E(116, hy + 4, 18, 16, 'b', 0, 8), S.E(100, hy - 10, 22, 18, 'b', 0, 8), style === 'shadow' ? '' : S.E(104, hy - 14, 3, 3, 'a', 0, 5) + S.E(90, hy + 4, 3, 3, 'a', 0, 5)]));
  else if (st === 4) hk.push(part('bud', [100, hy - 2], S.E(100, hy - 4, 5, 5, style === 'shadow' ? 'b' : 'a', 0, 6)));
  else hk.push(part('skull', [100, hy], S.E(100, hy, 9, 8, 'b', 0, 7)));
  const ey = st === 4 ? 126 : st === 5 ? 136 : hy, R = style === 'toy' ? 5.6 : st >= 4 ? 5.2 : 4.4;
  const gap = st >= 4 ? 6.5 : 4.6;
  hk.push(...eyes(S, [['L', 100 - gap, ey], ['R', 100 + gap, ey]], R));
  if (style === 'cosmic' && st >= 1) hk.push(part('ant', [100, hy - 10], st === 2 ? '' : antenna(S, 100, (st === 4 ? 102 : hy - 6), 12)));
  out.push(part('head', [100, st >= 4 ? 140 : hy + 8], [], hk));
  return out;
}

// ---------------------------------------------------------------- set tanımları (figure.js FIGS ile aynı biçim)
const FORM_Q = [{ head: 1.22, leg: 0.8, body: 0.88, tail: 0.85 }, { head: 1.1, leg: 0.9 }, {}, { leg: 1.04, body: 1.04 }, { leg: 1.06, body: 1.06, tail: 1.08 }, { head: 1.04, leg: 1.08, body: 1.1, tail: 1.12 }];
function buildSet(style) {
  const q = sp => ({ sit: st => quadStand(style, sp, 0, st), walk: st => quadStand(style, sp, 0, st), sleep: st => quadLie(style, sp, 0, st) });
  const defs = {
    cat: { views: q('cat'), side: true, gait: 'walk', leg: 36, food: 'fish', form: FORM_Q },
    dog: { views: q('dog'), side: true, gait: 'walk', leg: 38, food: 'bone', form: FORM_Q },
    goat: { views: q('goat'), side: true, gait: 'walk', leg: 40, food: 'grass', form: FORM_Q },
    gecko: { views: { sit: st => quadStand(style, 'gecko', 0, st), walk: st => quadStand(style, 'gecko', 0, st) }, side: true, gait: 'walk', leg: 14, amp: 30, food: 'bug', form: [{ head: 1.2, tail: 0.7 }, { head: 1.08 }, {}, { body: 1.04 }, { tail: 1.12 }, { body: 1.06, tail: 1.1 }] },
    doodle: { views: { sit: st => quadStand(style, 'doodle', 0, st), walk: st => quadStand(style, 'doodle', 0, st) }, side: true, gait: 'walk', leg: 36, amp: 20, food: 'crumb', form: [{ body: 0.86 }, { body: 0.92 }, {}, {}, { body: 1.04 }, { body: 1.08 }] },
    chick: { views: { sit: st => bird(style, 'chick', 0, st) }, side: false, gait: 'hop', hop: 34, food: 'seed', form: [{}, {}, {}, {}, {}, {}] },
    owl: { views: { sit: st => bird(style, 'owl', 0, st) }, side: false, gait: 'hop', hop: 30, food: 'mouse', form: [{ ear: 0.5, head: 1.1 }, { ear: 0.7 }, { ear: 0.85 }, {}, { ear: 1.3 }, { ear: 1.2, body: 1.04 }] },
    whale: { views: { sit: st => whale(style, 'whale', 0, st) }, side: true, gait: 'float', hover: 34, food: 'krill', form: [{}, {}, {}, {}, {}, {}] },
    plant: { views: { sit: st => plant(style, 'plant', 0, st) }, side: false, gait: 'hop', hop: 22, food: 'water', form: [{}, {}, {}, {}, {}, {}] },
  };
  for (const [sp, d] of Object.entries(defs)) { d.scale = sp === 'plant' ? 1.3 : sp === 'whale' ? 1.15 : 1.24; d.anch = (view, st) => anchorFor(sp, view, st); d.set = style; d.sp = sp; d.defs = coat => setDefs(style, sp, coat); d.back = k => setBack(style, sp, k); d.coatViews = coat => (coat && (sp === 'cat' || sp === 'dog') ? Object.fromEntries(Object.entries(d.views).map(([v]) => [v, st => (v === 'sleep' ? quadLie : quadStand)(style, sp, coat, st)])) : d.views); }
  // kedi/köpek oyuncak setinde tüy rengine göre ayrı renk (degrade tanımı tür başına; tüye göre görünüm)
  return defs;
}
// aksesuar takılma noktaları: [tepeX, tepeY, başGenişliği, başAltıY, gözX, gözY, gözAralığı] (baş parçasının kendi koordinatlarında)
function anchorFor(sp, view, st) {
  const q = QUAD[sp];
  if (q) {
    const [hx, hy, hrx, hry] = q.head;
    if (view === 'sleep') { const [bx, , brx] = q.body; const x = bx + brx * 0.85, y = 186 - hry * 0.95; return [x, y - hry * 0.9, hrx * 2, y + hry * 0.9, x + hrx * 0.3, y - 2, 4]; }
    const ex = sp === 'doodle' ? hx + 6 : hx + hrx * 0.3;
    return [hx, hy - hry, hrx * 2.1, hy + hry, ex, hy - hry * 0.18, 4];
  }
  if (sp === 'chick') return st === 0 ? [100, 128, 44, 160, 100, 152, 16] : [100, 116 - 21, 42, 116 + 21, 100, 114, 16];
  if (sp === 'owl') return [100, 112 - 26, 52, 112 + 26, 100, 114, 20];
  if (sp === 'whale') return [134, 130, 30, 158, 140, 146, 3];
  if (sp === 'plant') { const hy = st === 0 ? 156 : st === 5 ? 98 : [154, 146, 128, 118, 112, 104][st]; return [100, hy - (st === 5 ? 26 : 12), st === 5 ? 40 : 22, (st >= 4 ? 140 : hy + 10), 100, st === 4 ? 126 : st === 5 ? 136 : hy, st >= 4 ? 13 : 9]; }
  return null;
}
export const SETS = { shadow: buildSet('shadow'), cosmic: buildSet('cosmic'), toy: buildSet('toy') };
export const SET_IDS = Object.keys(SETS);
