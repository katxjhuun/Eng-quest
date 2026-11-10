// Kelime oyunlarının ortak sözlüğü. Dil başına bir kez kurulur.
// all: geçerli kelimeler (tahmin doğrulama, bonus), common: cevap olmaya uygun yaygın kelimeler, byLen: uzunluğa göre.
const cache = {};
export const lower = (s, lang) => s.toLocaleLowerCase(lang === 'tr' ? 'tr' : 'en');
export const upper = (s, lang) => s.toLocaleUpperCase(lang === 'tr' ? 'tr' : 'en');
export const letters = w => [...w];
export const ALPHABET = { tr: 'abcçdefgğhıijklmnoöprsştuüvyz', en: 'abcdefghijklmnopqrstuvwxyz' };

export async function lexicon(lang) {
  if (cache[lang]) return cache[lang];
  const [{ GROUPS }, data] = await Promise.all([import('./data/groups.js'), lang === 'en' ? import('./data/words-en.js') : import('./data/words-tr.js')]);
  const raw = lang === 'en' ? data.EN_WORDS : data.TR_WORDS;
  const commonSet = lang === 'en' ? data.EN_COMMON : data.TR_COMMON;
  const re = new RegExp(`^[${ALPHABET[lang]}]+$`);
  const all = new Set();
  for (const w of raw.split(/\s+/)) { const x = lower(w.trim(), lang); if (x && re.test(x)) all.add(x); }
  // tema kelimeleri de sözlüğe girer
  for (const g of GROUPS[lang]) for (const w of g.words) { const x = lower(w, lang); if (re.test(x)) all.add(x); }
  // isteğe bağlı büyük sözlük (ayrı parça; varsa yüklenir)
  let ranked = [];
  try { const big = await (lang === 'en' ? import('./data/big-en.js') : import('./data/big-tr.js')); if (big.WORDS) for (const w of big.WORDS.split(' ')) all.add(w); if (big.RANKED) ranked = big.RANKED.split(' '); } catch {}
  const byLen = new Map();
  for (const w of all) { const n = letters(w).length; if (!byLen.has(n)) byLen.set(n, []); byLen.get(n).push(w); }
  for (const arr of byLen.values()) arr.sort();
  // yaygınlık sırası: önce elle seçilmiş kelimeler, sonra sıklık listesi
  const seen = new Set(), common = [];
  for (const w of [...[...commonSet].map(x => lower(x, lang)), ...ranked]) if (!seen.has(w) && re.test(w)) { seen.add(w); common.push(w); all.add(w); }
  return (cache[lang] = { lang, all, byLen, common, groups: GROUPS[lang], re });
}

// bir kelimenin harfleri verilen harf çokluğundan oluşturulabiliyor mu
export function canMake(word, pool) {
  const m = new Map(); for (const c of pool) m.set(c, (m.get(c) || 0) + 1);
  for (const c of letters(word)) { const v = m.get(c); if (!v) return false; m.set(c, v - 1); }
  return true;
}
