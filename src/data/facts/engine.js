// dam-la — bilgi tablosundan soru üreten motor
// Sözel konularda (biyoloji, coğrafya, tarih…) sorular elle yazılmış doğrulanmış bilgi satırlarından türetilir:
// aynı satır hem "A'nın B'si nedir?" hem "B hangisinindir?" sorusunu verir; yanlış şıklar aynı tablonun
// diğer satırlarından seçildiği için hep aynı türden ve inandırıcıdır. Cevap her zaman satırın kendisidir.
//
// Tablo türleri
//   pair : rows [a, b, not?]       q(a) → b,  r(b) → a  (b'ler tabloda tekil olmalı; değilse r verme)
//   group: rows [a, grup, not?]    q(a) → grup, has(grup) → a, not(grup) → grubun dışındaki a
//   order: rows [etiket, sayı, not?] dört satırdan en küçüğü/en büyüğü (most: 'min' | 'max')
//   num  : rows [a, sayı, not?]    q(a) → sayı; yanlışlar yakın sayılardan
// Kimlik: "<konu>-g<tablo anahtarı><sıra>" — tablo anahtarı sabit kaldıkça kayıtlı ilerleme bozulmaz.
// Yeni satırları tablonun SONUNA, yeni tabloları listenin SONUNA ekle.

function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function sample(arr, n, r) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}
const uniq = a => [...new Set(a)];
const clean = s => String(s ?? '').trim();
const note = n => (n ? ' ' + clean(n) : '');
const tr = n => (typeof n === 'number' ? n.toLocaleString('tr-TR') : String(n));

function fromPair(t, key, r) {
  const out = [];
  const B = uniq(t.rows.map(x => x[1]));
  t.rows.forEach((row, i) => {
    const [a, b, n] = row;
    const wb = sample(B.filter(v => v !== b), 3, r);
    if (wb.length === 3 && t.q) out.push({ id: `${key}${i}`, q: t.q(a, row), a: b, o: wb, e: (t.e ? t.e(a, b, n) : `${a}: ${b}.`) + note(n) });
    if (t.r) {
      const wa = sample(t.rows.filter(x => x[1] !== b).map(x => x[0]), 3, r);
      if (wa.length === 3) out.push({ id: `${key}r${i}`, q: t.r(b, row), a, o: wa, e: (t.e ? t.e(a, b, n) : `${a}: ${b}.`) + note(n) });
    }
  });
  return out;
}

function fromGroup(t, key, r) {
  const out = [];
  const G = uniq(t.rows.map(x => x[1]));
  const extra = t.extra || [];
  const by = g => t.rows.filter(x => x[1] === g);
  const exp = (a, g, n) => (t.e ? t.e(a, g, n) : `${a} → ${g}.`) + note(n);
  t.rows.forEach((row, i) => {
    const [a, g, n] = row;
    if (t.q) {
      const w = sample(uniq([...G, ...extra]).filter(v => v !== g), 3, r);
      if (w.length === 3) out.push({ id: `${key}${i}`, q: t.q(a, row), a: g, o: w, e: exp(a, g, n) });
    }
    if (t.has && t.has(g)) {
      const w = sample(t.rows.filter(x => x[1] !== g && !(t.overlap && t.overlap(x[0], g))).map(x => x[0]), 3, r);
      if (w.length === 3) out.push({ id: `${key}h${i}`, q: t.has(g), a, o: w, e: exp(a, g, n) + (t.eHas ? ' ' + t.eHas(g, w) : '') });
    }
    if (t.not) {
      // "hangisi G değildir": doğru cevap bu satır, yanlışlar başka bir grubun üç üyesi
      const others = G.filter(x => x !== g && by(x).length >= 3 && t.not(x));
      if (others.length) {
        const g2 = others[Math.floor(r() * others.length)];
        const w = sample(by(g2).map(x => x[0]).filter(x => x !== a), 3, r);
        if (w.length === 3 && !(t.overlap && t.overlap(a, g2))) out.push({ id: `${key}n${i}`, q: t.not(g2), a, o: w, e: `${a} ${t.notE ? t.notE(g) : `→ ${g}`}; diğer üçü ${t.notE ? t.notE(g2) : `→ ${g2}`}.` + note(n) });
      }
    }
  });
  return out;
}

function fromOrder(t, key, r) {
  const out = [], seen = new Set();
  const rows = t.rows;
  const n = t.n || Math.min(rows.length * 2, 300);
  for (let i = 0, tries = 0; out.length < n && tries < n * 6; tries++) {
    const pick = sample(rows, 4, r);
    const vals = pick.map(x => x[1]);
    if (new Set(vals).size < 4) continue;
    const best = t.most === 'max' ? Math.max(...vals) : Math.min(...vals);
    const w = pick.find(x => x[1] === best);
    const sig = pick.map(x => x[0]).sort().join('|');
    if (seen.has(sig)) continue; seen.add(sig);
    const sorted = pick.slice().sort((x, y) => (t.most === 'max' ? y[1] - x[1] : x[1] - y[1]));
    out.push({ id: `${key}${i++}`, q: t.q, a: w[0], o: pick.filter(x => x !== w).map(x => x[0]),
      e: (t.lead ? t.lead + ' ' : '') + sorted.map(x => { const v = t.fmt ? t.fmt(x[1]) : tr(x[1]); return v ? `${x[0]} (${v})` : x[0]; }).join(t.most === 'max' ? ' > ' : ' → ') + '.' + (w[2] ? ` ${w[0]}: ${clean(w[2])}` : '') });
  }
  return out;
}

function fromNum(t, key, r) {
  const out = [];
  const sp = t.spread || [1, 2, 3, 5];
  const f = t.fmt || tr;
  t.rows.forEach((row, i) => {
    const [a, v, n] = row;
    const cand = uniq([...sp.map(d => v + d), ...sp.map(d => v - d)].filter(x => x !== v && (t.min == null || x >= t.min)));
    const w = sample(cand, 3, r).map(f);
    if (w.length === 3) out.push({ id: `${key}${i}`, q: t.q(a, row), a: f(v), o: w, e: (t.e ? t.e(a, v, n) : `${a}: ${f(v)}.`) + note(n) });
    if (t.r) {
      const others = t.rows.filter(x => x[1] !== v);
      const wa = sample(others.map(x => x[0]), 3, r);
      if (wa.length === 3) out.push({ id: `${key}r${i}`, q: t.r(f(v), row), a, o: wa, e: (t.e ? t.e(a, v, n) : `${a}: ${f(v)}.`) + note(n) });
    }
  });
  return out;
}

// pick: group gibi ama aynı bilgiden farklı şık setleriyle çok sayıda soru (has(g) metni null değilse)
function fromPick(t, key, r) {
  const out = [], seen = new Set();
  const G = uniq(t.rows.map(x => x[1])).filter(g => t.has(g));
  const n = t.n || 100;
  for (let i = 0, tries = 0; out.length < n && tries < n * 8; tries++) {
    const g = G[Math.floor(r() * G.length)];
    const ins = t.rows.filter(x => x[1] === g), outs = t.rows.filter(x => x[1] !== g);
    const row = ins[Math.floor(r() * ins.length)];
    const w = sample(outs, 3, r);
    if (w.length < 3) continue;
    const sig = g + '|' + row[0] + '|' + w.map(x => x[0]).sort().join('|');
    if (seen.has(sig)) continue; seen.add(sig);
    out.push({ id: `${key}${i++}`, q: t.has(g), a: row[0], o: w.map(x => x[0]), e: (t.e ? t.e(row[0], g, row[2]) : `${row[0]} → ${g}.`) + (t.eOthers ? ' ' + t.eOthers(w) : '') });
  }
  return out;
}
// mc: elle yazılmış tek soru — [soru, doğru, "yanlış1; yanlış2; yanlış3", açıklama]
function fromMc(t, key) {
  return t.rows.map((row, i) => ({ id: `${key}${i}`, q: row[0], a: row[1], o: row[2].split(';').map(x => x.trim()).filter(Boolean), e: row[3] || `${row[1]}.` }));
}

const KIND = { pair: fromPair, group: fromGroup, order: fromOrder, num: fromNum, pick: fromPick, mc: fromMc };

// tablolar → [{ n, d, row:[soru, cevap, [3 yanlış], açıklama, kaynak] }]; tablolar sırayla harmanlanır
export function buildFacts(cat, tables, target) {
  const lists = [];
  for (const [key, t] of Object.entries(tables)) {
    if (/\d$/.test(key)) throw new Error(`tablo anahtarı rakamla bitmemeli: ${cat}.${key}`);
    const r = rng(hash(`${cat}:${key}`));
    const items = (KIND[t.k] || (() => []))(t, key, r)
      .filter(x => x.o.length === 3 && !x.o.includes(x.a) && new Set(x.o.map(String)).size === 3)
      .map(x => ({ n: x.id, d: t.d || 2, u: t.k === 'order' || t.k === 'pick' ? x.o.slice().sort().join('|') : '', row: [x.q, String(x.a), x.o.map(String), x.e, t.src] }));
    // tablo içinde de karıştır: aynı tür sorular art arda gelmesin
    lists.push(sample(items, items.length, rng(hash(`${cat}:${key}:mix`))));
  }
  const out = [], seen = new Set();
  for (let i = 0; out.length < target; i++) {
    let any = false;
    for (const l of lists) {
      if (i >= l.length) continue; any = true;
      const it = l[i], k = it.row[0] + '|' + it.row[1] + '|' + it.u;
      if (seen.has(k)) continue; seen.add(k); delete it.u; out.push(it);
      if (out.length >= target) break;
    }
    if (!any) break;
  }
  return out;
}

// satır yazımı kısaltmaları: her satır "a | b | not"
export const L = s => s.trim().split('\n').map(l => l.trim()).filter(Boolean).map(l => l.split('|').map(x => x.trim()));
export const N = s => L(s).map(([a, b, n]) => [a, Number(b), n]);
