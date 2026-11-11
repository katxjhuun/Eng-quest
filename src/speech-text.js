// Seslendirilen metinlerin ortak tanımı: uygulama ve hazır ses üreticisi (scripts/) aynı kuralları kullanır,
// böylece "dinle"ye basıldığında aranan anahtar ile önceden üretilen ses dosyasının anahtarı birebir aynı olur.
export const TRC = /[çğıöşüÇĞİÖŞÜ]/;
export function questionSpeech(q) {
  const blank = t => t.replace(/_{2,}/g, ' … ');
  const quoted = q.match(/“([^”]+)”/);
  if (quoted && !TRC.test(quoted[1])) return { text: blank(quoted[1]), lang: 'en' };
  const sort = q.match(/^Kelimeleri sırala:\s*(.+)$/);
  if (sort) return { text: sort[1].replace(/\s*\/\s*/g, ', ').replace(/\s*\?$/, ''), lang: 'en' };
  const core0 = q.replace(/\s*\([^)]*[çğıöşüÇĞİÖŞÜ][^)]*\)\s*/g, ' ').trim();
  return TRC.test(core0) ? { text: q.replace(/_{2,}/g, ' boşluk '), lang: 'tr' } : { text: blank(core0), lang: 'en' };
}
export const normText = t => String(t || '').replace(/\s+/g, ' ').trim();
// 64 bit (iki farklı 32 bit karma) — on binlerce cümlede çakışma olmaz; Firebase anahtarı olarak güvenli (hex)
export function audioKey(text) {
  const s = normText(text);
  let h1 = 0x811c9dc5, h2 = 5381;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = (Math.imul(h2, 33) + c) >>> 0;
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
}
// Hazırlık bankasındaki bir sorunun İngilizce seslendirilebilen tüm metinleri (soru, tam cümle/cevap, şıklar)
export function epSpeechTexts(it) {
  const [, , q, a, opts, , say] = it;
  const en = /[a-z]/i.test(a) && !TRC.test(a);
  const out = [];
  const qs = questionSpeech(q); if (qs.lang === 'en') out.push(qs.text);
  if (say) out.push(say); else if (en) out.push(a);
  if (en) { out.push(a); (opts || []).forEach(o => out.push(o)); }
  return out.map(normText).filter(t => t && !TRC.test(t));
}
// Hazır seslerin üretildiği AI sesleri
export const PACK_VOICES = ['am_michael', 'bf_emma', 'bf_isabella', 'am_puck'];
