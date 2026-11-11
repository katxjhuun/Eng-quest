// dam-la — pet görünüş setleri (skin). Aynı iskelet, aynı parça adları ve dönme noktaları; yalnızca boya ve gözler değişir.
// Bu yüzden bütün animasyonlar (yürüyüş, zıplama, göz kırpma, bakış, kliplere kadar) her sette aynen çalışır.
//  · classic — özgün geometrik editoryal çizim (değişmez)
//  · shadow  — "Gölge": düz kömür siyahı siluet, iri beyaz gözler; duygu göz kapağı ve bakışla anlatılır. Sarı yaşam alanı.
//  · cosmic  — "Kozmik": neon çivit → mor → pembe degrade gövde, yumuşak hale, ağır kapaklı uykulu gözler; yıldızlı uzay yaşam alanı,
//              hafif süzülme.
//  · toy     — "Oyuncak": pastel, köşeli düşük poligon oyuncak; her renk üstte açık, altta gölgeli keskin iki yüzle
//              (3B görünümü 2B maliyetiyle verir), küçük boncuk gözler, nane yeşili yaşam alanı.
// (Setler bizim petlerimizin özgün yorumlarıdır; başka karakterler kopyalanmaz.)
import { ANCH } from './acc.js';

export const SKINS = {
  classic: { name: 'Klasik', desc: 'Geometrik editoryal çizim' },
  shadow: { name: 'Gölge', desc: 'Kömür siyahı siluet, iri meraklı gözler' },
  cosmic: { name: 'Kozmik', desc: 'Neon degrade, yumuşak hale, uykulu gözler' },
  toy: { name: 'Oyuncak', desc: 'Pastel, köşeli düşük poligon; boncuk gözler' },
};
export const skinIds = () => Object.keys(SKINS);

const INK = '#18161C';
const HEX = /(fill|stroke)="(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})"/g;
const lum = h => { if (h.length === 4) h = '#' + [...h.slice(1)].map(c => c + c).join(''); const n = parseInt(h.slice(1), 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
// kozmik palet: koyu → çivit, orta → mor/pembe, açık → camgöbeği
const COSMIC = h => { const l = lum(h); return l < 0.22 ? 'url(#kzA)' : l < 0.5 ? 'url(#kzB)' : l < 0.75 ? 'url(#kzC)' : 'url(#kzD)'; };
const COSMIC_STROKE = h => { const l = lum(h); return l < 0.3 ? '#2A1572' : l < 0.6 ? '#B44CFF' : '#7FF7EE'; };

// oyuncak paleti: her kaynak renk en yakın pastel tona eşlenir; her ton keskin iki yüzlü degrade
const TOY = { cr: '#F6EBD3', sa: '#F2C98A', or: '#F2A65A', te: '#E07A5F', pk: '#F4A6B8', li: '#B9A6E8', sk: '#8CC8F0', mi: '#8FD9B6', gr: '#7BC67E', sl: '#8E9AAF', br: '#B07D5B', ch: '#55525F' };
const rgb = h => { if (h.length === 4) h = '#' + [...h.slice(1)].map(c => c + c).join(''); const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const TOY_RGB = Object.entries(TOY).map(([k, h]) => [k, rgb(h)]);
const toyKey = h => { const [r, g, b] = rgb(h).map(v => Math.min(255, v * 1.12 + 18)); let best = 'cr', bd = 1e9; for (const [k, [R2, G, B]] of TOY_RGB) { const d = (r - R2) ** 2 * 0.3 + (g - G) ** 2 * 0.59 + (b - B) ** 2 * 0.11; if (d < bd) { bd = d; best = k; } } return best; };
const shade = (h, f) => '#' + rgb(h).map(v => Math.max(0, Math.min(255, Math.round(v * f)))).map(v => v.toString(16).padStart(2, '0')).join('');
// boyama, tüy rengi uygulandıktan sonra yapılır (figure.js partsHTML)
export function paint(s, skin) {
  if (!s || skin === 'classic') return s;
  if (skin === 'shadow') return s.replace(HEX, (m, a) => `${a}="${INK}"`);
  if (skin === 'toy') return s.replace(HEX, (m, a, h) => a === 'fill' ? `fill="url(#qt${toyKey(h)})"` : `stroke="${shade(TOY[toyKey(h)], 0.82)}"`);
  return s.replace(HEX, (m, a, h) => `${a}="${a === 'fill' ? COSMIC(h) : COSMIC_STROKE(h)}"`);
}
// her svg'ye eklenen degradeler (aynı kimlikli eş tanımlar sorun çıkarmaz: hepsi aynı)
export function skinDefs(skin) {
  if (skin === 'toy') return `<defs>${Object.entries(TOY).map(([k, h]) => `<linearGradient id="qt${k}" x1="0.2" y1="0" x2="0.55" y2="1"><stop offset="0" stop-color="${shade(h, 1.1)}"/><stop offset=".46" stop-color="${shade(h, 1.1)}"/><stop offset=".46" stop-color="${h}"/><stop offset=".8" stop-color="${h}"/><stop offset=".8" stop-color="${shade(h, 0.86)}"/><stop offset="1" stop-color="${shade(h, 0.86)}"/></linearGradient>`).join('')}</defs>`;
  if (skin !== 'cosmic') return '';
  return `<defs><linearGradient id="kzA" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#5B3BFF"/><stop offset="1" stop-color="#2A16A8"/></linearGradient>
<linearGradient id="kzB" x1="0" y1="0" x2="0.5" y2="1"><stop offset="0" stop-color="#A24DFF"/><stop offset="1" stop-color="#FF5FC8"/></linearGradient>
<linearGradient id="kzC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7DF9F0"/><stop offset="1" stop-color="#3FB8FF"/></linearGradient>
<linearGradient id="kzD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3FF"/><stop offset="1" stop-color="#C8B6FF"/></linearGradient>
<radialGradient id="kzGlow"><stop offset="0" stop-color="#B46BFF" stop-opacity=".55"/><stop offset=".6" stop-color="#7A4BFF" stop-opacity=".18"/><stop offset="1" stop-color="#7A4BFF" stop-opacity="0"/></radialGradient></defs>`;
}
// petin arkasındaki yumuşak hale (yalnızca kozmik; sabit, animasyonsuz → ucuz)
export const skinBack = (skin, cx, cy, k) => skin === 'cosmic' ? `<ellipse cx="${cx}" cy="${cy - 62 * k}" rx="${78 * k}" ry="${70 * k}" fill="url(#kzGlow)"/>` : '';
export const skinShadowFill = skin => skin === 'cosmic' ? '#5B2BD8' : skin === 'toy' ? '#2E6B55' : '#1E1B1C';

function anchorW(species, view, stage) {
  const v = ANCH[species]?.[view] || ANCH[species]?.sit; if (!v) return 40;
  const a = Array.isArray(v[0]) || v[0] === null ? v[Math.max(0, Math.min(5, stage | 0))] : v;
  return a ? a[2] : 40;
}
// göz parçaları: pup* (bebek, bakışla kayar) ve lid* (kapak, sy 0 açık → 1 kapalı) yeniden çizilir; altına beyaz göz eklenir
function eyeKit(skin, R, side) {
  const white = skin === 'cosmic' ? '#F2FFFC' : '#FFFFFF', pupil = skin === 'cosmic' ? '#1B0E52' : INK, lid = skin === 'cosmic' ? 'url(#kzA)' : INK;
  return {
    sclera: (x, y) => `<circle cx="${x}" cy="${y}" r="${R}" fill="${white}"/>`,
    pupil: (x, y) => { const pr = R * (skin === 'cosmic' ? 0.5 : 0.56), dx = side ? R * 0.22 : 0; return `<circle cx="${(x + dx).toFixed(1)}" cy="${y}" r="${pr.toFixed(1)}" fill="${pupil}"/><circle cx="${(x + dx - pr * 0.35).toFixed(1)}" cy="${(y - pr * 0.38).toFixed(1)}" r="${(pr * 0.3).toFixed(1)}" fill="#fff" opacity=".9"/>`; },
    lid: (x, y) => `<circle cx="${x}" cy="${y}" r="${(R + 0.8).toFixed(1)}" fill="${lid}"/>`,
    // kozmik: gözün üstünde sabit ağır kapak (uykulu, dalgın bakış)
    heavy: (x, y) => skin === 'cosmic' ? `<path d="M${(x - R - 0.8).toFixed(1)} ${(y - R * 0.18).toFixed(1)} A${(R + 0.8).toFixed(1)} ${(R + 0.8).toFixed(1)} 0 0 1 ${(x + R + 0.8).toFixed(1)} ${(y - R * 0.18).toFixed(1)} Q${x} ${(y + R * 0.08).toFixed(1)} ${(x - R - 0.8).toFixed(1)} ${(y - R * 0.18).toFixed(1)}Z" fill="url(#kzA)"/>` : '',
  };
}

// parça ağacına seti uygular
export function applySkin(list, skin, species, view, stage) {
  if (!skin || skin === 'classic' || !SKINS[skin]) return list;
  const w = anchorW(species, view, stage);
  const mapPart = p => {
    const out = { ...p };
    out.kids = mapKids(p.kids);
    return out;
  };
  function mapKids(kids) {
    if (!kids || !kids.length) return kids || [];
    const pups = kids.filter(k => /^pup/.test(k.k));
    if (!pups.length) return kids.map(mapPart);
    const pts = pups.map(k => k.p);
    let spacing = Infinity;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) spacing = Math.min(spacing, Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]));
    const side = pts.length === 1;
    const toy = skin === 'toy';
    const R = toy ? Math.max(2.2, Math.min(w * 0.065, spacing * 0.3)) : Math.max(3, side ? w * 0.17 : Math.min(w * 0.15, spacing * 0.46));
    const E = eyeKit(skin, R, side);
    const near = p => pts.reduce((b, q) => (Math.hypot(q[0] - p[0], q[1] - p[1]) < Math.hypot(b[0] - p[0], b[1] - p[1]) ? q : b), pts[0]);
    const out = [];
    let sclDone = false;
    for (const k of kids) {
      if (/^pup/.test(k.k)) {
        if (!sclDone && !toy) { out.push({ k: 'scl', raw: 1, p: [0, 0], s: pts.map(([x, y]) => E.sclera(x, y)).join(''), kids: [], min: k.min }); sclDone = true; }
        out.push({ ...k, raw: 1, s: toy ? `<circle cx="${k.p[0]}" cy="${k.p[1]}" r="${R.toFixed(1)}" fill="#24212B"/><circle cx="${(k.p[0] - R * 0.3).toFixed(1)}" cy="${(k.p[1] - R * 0.35).toFixed(1)}" r="${(R * 0.32).toFixed(1)}" fill="#fff"/>` : E.pupil(k.p[0], k.p[1]), kids: mapKids(k.kids) });
      } else if (/^lid/.test(k.k)) {
        const [x, y] = near(k.p);
        out.push({ ...k, raw: 1, p: [x, y - R - 0.8], s: toy ? '' : E.lid(x, y), kids: mapKids(k.kids) });
      } else if (/^(eyes)$/.test(k.k)) {
        out.push({ ...k, s: '', kids: mapKids(k.kids) });
      } else out.push(mapPart(k));
    }
    if (skin === 'cosmic') out.push({ k: 'hlid', raw: 1, p: [0, 0], s: pts.map(([x, y]) => E.heavy(x, y)).join(''), kids: [], min: pups[0].min });
    return out;
  }
  return mapKids(list);
}
