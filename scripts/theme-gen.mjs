// styles.css içindeki renkleri CSS değişkenlerine çevirir ve her tema için değişken setleri üretir.
import { THEMES } from '../src/themes.js';

const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(?:,\s*[\d.]+\s*)?\)/g;

function parse(c) {
  if (c.startsWith('#')) {
    let h = c.slice(1);
    if (h.length === 3 || h.length === 4) h = [...h].map(x => x + x).join('');
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }
  const n = c.match(/[\d.]+/g).map(Number);
  return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
}
function toHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}
function fromHsl(h, s, l) {
  h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(100, s)) / 100; l = Math.max(0, Math.min(100, l)) / 100;
  const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map(v => Math.round(v * 255));
}
function out(rgb, a) {
  if (a >= 0.999) return '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');
  return `rgba(${rgb.join(',')},${+a.toFixed(3)})`;
}
function relLum([r, g, b]) {
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
// Ton değişince algılanan parlaklık da değişir (sarı, mordan çok daha parlaktır).
// Aynı ton/doygunlukta, hedef parlaklığı veren HSL açıklığını bulur.
function matchLum(h, s, target) {
  let lo = 0, hi = 100;
  for (let i = 0; i < 22; i++) { const mid = (lo + hi) / 2; if (relLum(fromHsl(h, s, mid)) < target) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
const CENTER = { accent: 252, green: 150, gold: 42, coral: 10, blue: 220 };
function family({ h, s, l }) {
  if (s < 14 || l > 93 || l < 9 || (s < 30 && l > 84)) return 'neutral';
  if (h >= 235 && h < 330) return 'accent';
  if (h >= 85 && h < 190) return 'green';
  if (h >= 28 && h < 85) return 'gold';
  if (h >= 190 && h < 235) return 'blue';
  return 'coral';
}
function transform(color, t) {
  const p = parse(color), hsl = toHsl(p), fam = family(hsl);
  let { h, s, l } = hsl; const a = p.a;
  const Y0 = relLum([p.r, p.g, p.b]);
  const isShadow = a < 0.6 && l < 35;
  if (fam === 'neutral') {
    if (t.contrast) { s = 0; l = l > 70 ? 100 : l < 35 ? Math.max(0, l - 12) : l - 8; }
    else {
      h = t.nh; s = Math.min(s * t.ns, t.dark ? 26 : 58);
      if (!t.dark) l = matchLum(h, s, Y0);
    }
    if (t.dark && !isShadow) l = l > 55 ? 4 + (100 - l) * 0.95 : Math.min(94, 100 - l + (l < 30 ? 0 : 12));
    if (t.dark && isShadow) l = Math.max(0, l - 10);
  } else {
    h = h + ((t[fam] ?? CENTER[fam]) - CENTER[fam]);
    if (fam === 'accent' && t.accentSat) s = Math.min(100, s * t.accentSat);
    if (!t.dark) {
      // Açık temalarda özgün temanın parlaklık (dolayısıyla kontrast) ilişkileri aynen korunur.
      l = matchLum(h, s, Y0);
      if (t.contrast && l < 60) l = Math.max(14, l - 10);
    } else if (!isShadow) {
      // Koyu temada açık dolgular koyulaşır, koyu yazılar/vurgular açılır: her çiftin kontrastı korunur.
      const neon = t.id === 'neon';
      let L = l >= 58 ? 100 - l + (neon ? 4 : 6) : Math.max(100 - l - 6, neon ? 66 : 63);
      if (neon) s = Math.min(100, s * 1.2);
      l = matchLum(h, s, relLum(fromHsl(0, 0, L)));
    }
  }
  return out(fromHsl(h, s, l), a);
}

export function buildThemedCss(css) {
  const map = new Map();
  const replaceInBlock = body => body.replace(COLOR_RE, m => {
    const key = m.toLowerCase().replace(/\s+/g, '');
    if (!map.has(key)) map.set(key, `--k${map.size.toString(36)}`);
    return `var(${map.get(key)})`;
  });
  // Yalnızca bildirim bloklarının içini dönüştür (seçicilerdeki #id’lere dokunma).
  let prev, result = css;
  const marker = '\u0001';
  do {
    prev = result;
    result = result.replace(/\{([^{}]*)\}/g, (_, body) => marker + 'O' + replaceInBlock(body) + marker + 'C');
  } while (result !== prev);
  result = result.split(marker + 'O').join('{').split(marker + 'C').join('}');
  const rootVars = [...map].map(([c, v]) => `${v}:${c}`).join(';');
  // Ayarlardaki tema önizleme kutuları için ana renkler
  const sw = { bg: '#f4f0e8', card: '#fffdf8', accent: '#4f3bd4', gold: '#f4cf70', ink: '#201d23' };
  const swatch = '.theme-preview{' + Object.entries(sw).map(([k, c]) => map.has(c) ? `--sw-${k}:var(${map.get(c)})` : `--sw-${k}:${c}`).join(';') + '}';
  const themes = THEMES.filter(t => t.id !== 'krem').map(t => {
    const vars = [...map].map(([c, v]) => `${v}:${transform(c, t)}`).join(';');
    const scheme = t.dark ? 'color-scheme:dark;' : '';
    return `html[data-theme="${t.id}"],.theme-preview[data-theme="${t.id}"]{${scheme}${vars}}`;
  }).join('\n');
  return { css: `:root{${rootVars}}\n${result}\n${swatch}`, themes, count: map.size };
}
