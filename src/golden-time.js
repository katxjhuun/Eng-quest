// Altın Saat takvimi (saf hesap; uygulama ve bildirim göndericisi aynı dosyayı kullanır).
// 11 Kasım 2026'dan itibaren 72 ay boyunca her gün, Türkiye saatiyle 10:00–22:00 arasında rastgele iki tane,
// ikişer saatlik pencere. Rastgelelik tarihten üretilir: herkes aynı anda aynı Altın Saat'i görür, sunucu gerekmez.
export const GOLDEN_MS = 2 * 3600 * 1000;
const TR_OFFSET = 3 * 3600 * 1000;            // Türkiye: UTC+3 (yaz/kış saati yok)
export const GOLDEN_FROM = Date.UTC(2026, 10, 11) - TR_OFFSET;   // 11.11.2026 00:00 TR
export const GOLDEN_UNTIL = Date.UTC(2032, 10, 11) - TR_OFFSET;  // +72 ay
const Q = 15 * 60 * 1000;

function rng(str) {
  let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  let a = h >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// Türkiye takvimine göre gün başlangıcı (ms)
const dayStart = t => { const d = new Date(t + TR_OFFSET); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - TR_OFFSET; };
const dayKey = t => new Date(t + TR_OFFSET).toISOString().slice(0, 10);

// o günün iki penceresi: [{start, end}]
export function windowsOfDay(t) {
  const d0 = dayStart(t);
  if (d0 < GOLDEN_FROM || d0 >= GOLDEN_UNTIL) return [];
  const r = rng('altin-saat:' + dayKey(t));
  // başlangıç 10:00–20:00 arası, çeyrek saat adımlı; iki pencere arasında en az 1 saat boşluk
  const lo = 40, hi = 80;
  let a = 0, b = 0;
  for (let k = 0; k < 50; k++) { a = lo + Math.floor(r() * (hi - lo + 1)); b = lo + Math.floor(r() * (hi - lo + 1)); if (Math.abs(a - b) >= 12) break; }
  if (Math.abs(a - b) < 12) { a = 44; b = 72; }
  return [Math.min(a, b), Math.max(a, b)].map(q => ({ start: d0 + q * Q, end: d0 + q * Q + GOLDEN_MS }));
}
export function goldenNow(t = Date.now()) { return windowsOfDay(t).find(w => t >= w.start && t < w.end) || null; }
export function goldenNext(t = Date.now(), days = 3) {
  for (let i = 0; i <= days; i++) { const w = windowsOfDay(t + i * 864e5).find(x => x.start > t); if (w) return w; }
  return null;
}
export function goldenUpcoming(t = Date.now(), days = 7) {
  const out = [];
  for (let i = 0; i <= days; i++) for (const w of windowsOfDay(t + i * 864e5)) if (w.start > t && !out.some(o => o.start === w.start)) out.push(w);
  return out;
}
