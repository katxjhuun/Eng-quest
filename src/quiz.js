// dam-la — konu sekmeleri, öğrenme biçimi döngüsü, pop quiz (çoktan seçmeli / yazarak / dinleyerek / karışık)
import { SUBJECTS, SUBJECT_ORDER } from './data/subjects.js';
import { generated, factsPending, loadFacts, onFactsLoaded } from './data/gen.js';
import { DEPARTMENTS, DEPARTMENT_ORDER } from './data/departments.js';

export const MODES = [
  { id: 'type', icon: '✍️', label: 'Yazarak', hint: 'Cevabı harf kutularına yaz' },
  { id: 'quiz', icon: '🎯', label: 'Pop Quiz', hint: 'Seçeneklerden doğruyu bul' },
  { id: 'listen', icon: '🎧', label: 'Dinleyerek', hint: 'Soruyu dinle, sonra seç' },
  { id: 'mix', icon: '🔀', label: 'Karışık', hint: 'Her soru farklı biçimde' },
];
export const MODE_TAG = { type: 'YAZARAK', quiz: 'POP QUIZ', listen: 'DİNLEYEREK', mix: 'KARIŞIK' };
// Üç kategori (track): Akademik (bölüme göre hazırlık + ana dersler), Genel (eski sekmeler), İngilizce Hazırlık (Empower B1)
export const TRACKS = [
  { id: 'akademik', icon: '🎓', label: 'Akademik', def: 'akh' },
  { id: 'genel', icon: '🧭', label: 'Genel', def: 'en' },
  { id: 'hazirlik', icon: '📘', label: 'İngilizce Hazırlık', def: 'ep' },
];
export const CATS = [
  { id: 'mix', icon: '🔀', label: 'Karışık', track: 'genel' },
  { id: 'en', icon: '🇬🇧', label: 'İngilizce', track: 'genel' },
  ...SUBJECT_ORDER.map(id => ({ id, icon: SUBJECTS[id].icon, label: SUBJECTS[id].label, track: 'genel' })),
  { id: 'akh', icon: '🧱', label: 'Hazırlık', track: 'akademik' },
  { id: 'aka', icon: '🎓', label: 'Ana dersler', track: 'akademik' },
  { id: 'akm', icon: '🔀', label: 'Karışık', track: 'akademik' },
  { id: 'ep', icon: '📘', label: 'Empower B1', track: 'hazirlik' },
];
const EXTRA_CATS = ['akh', 'aka', 'akm', 'ep'];
const trackOf = cat => (CATS.find(c => c.id === cat) || {}).track || 'genel';
export const CAT_XP_STEP = 40, MIX_XP_STEP = 100;
const XP = { quiz: 4, listen: 4, type: 5, typeHinted: 3, wrong: -2 };
const MAX_TRIES = 3;
const REVIEW_STEPS = [0, 1, 3, 7, 14, 30].map(d => d * 86400000);

export function catLabel(id) { return (CATS.find(c => c.id === id) || CATS[1]).label; }
export function deptOptions() { return DEPARTMENT_ORDER.map(id => ({ id, label: DEPARTMENTS[id].label })); }

// ---- yardımcılar ----
function hash(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function seededShuffle(arr, seed) { const a = arr.slice(); let s = seed || 1; for (let i = a.length - 1; i > 0; i--) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function fold(s) { return String(s || '').replace(/İ/g, 'i').replace(/I/g, 'ı').toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, ''); }
const SLOT_RE = /[\p{L}\p{Nd}]/u;
function typeable(ans) {
  const s = String(ans || '');
  if (!/^[A-Za-zÇĞİÖŞÜçğıöşüÂâÎîÛû0-9\s.,'’\-–−:/()]+$/.test(s)) return false;
  const n = [...s].filter(c => SLOT_RE.test(c)).length;
  return n > 0 && n <= 28;
}
function similarity(a, b) {
  a = fold(a).replace(/[^\p{L}\p{Nd}]/gu, ''); b = fold(b).replace(/[^\p{L}\p{Nd}]/gu, '');
  if (!a || !b) return 0;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return Math.max(0, Math.round((1 - dp[a.length][b.length] / Math.max(a.length, b.length)) * 100));
}

// ---- XP uçma animasyonu (cevap kutusundan XP barına) ----
// Soru değişirken sayfa kısalırsa tarayıcı kaydırmayı yukarı çeker. Bunu önlemek için ana görünüm eski
// yüksekliğinde tutulur; kullanıcı yukarı kaydırdıkça fazlalık kendiliğinden erir. Ekran hiç zıplamaz.
export function holdScroll(fn) {
  const view = document.querySelector('#gameView');
  if (!view) { fn(); return; }
  holdScroll.off?.();
  const y = window.scrollY;
  view.style.minHeight = '';
  const top = view.getBoundingClientRect().top + y;
  const prev = view.offsetHeight;
  const tail = Math.max(0, document.documentElement.scrollHeight - (top + prev)); // görünümün altındaki alan
  view.style.minHeight = prev + 'px';            // önce kilitle: içerik kısalsa da sayfa boyu değişmez
  fn();
  if (Math.abs(window.scrollY - y) > 1) window.scrollTo({ top: y, behavior: 'instant' });
  // yalnızca ekranı yerinde tutmaya yetecek kadar yükseklik kalsın
  const need = () => Math.max(0, window.scrollY + window.innerHeight - top - tail + 16); // küçük pay: kırpma döngüsüne girmesin
  // doğal yükseklik min-height kaldırılmadan ölçülür (kaldırmak tarayıcının kaydırmayı hemen kırpmasına yol açar)
  const natural = () => { const vt = view.getBoundingClientRect().top; let m = 0; for (const c of view.children) { const r = c.getBoundingClientRect(); if (r.height) m = Math.max(m, r.bottom - vt + (parseFloat(getComputedStyle(c).marginBottom) || 0)); } return m + (parseFloat(getComputedStyle(view).paddingBottom) || 0); };
  const shrink = () => {
    const h = Math.min(prev, need());
    if (h <= natural()) { view.style.minHeight = ''; holdScroll.off?.(); return; }
    if (h <= natural) { holdScroll.off?.(); return; }
    view.style.minHeight = h + 'px';
  };
  shrink();
  if (Math.abs(window.scrollY - y) > 1) window.scrollTo({ top: y, behavior: 'instant' });
  if (!view.style.minHeight) return;
  window.addEventListener('scroll', shrink, { passive: true });
  holdScroll.off = () => { window.removeEventListener('scroll', shrink); holdScroll.off = null; };
}

export function flyXp(fromEl, delta, { target = '#xpNumber', onLand } = {}) {
  return new Promise(res => {
    // Uygulama arka plana alınırsa animasyon olayları gelmeyebilir: en geç 3 sn sonra bar güncellenir ve akış sürer.
    let landed = false, finished = false;
    const userLand = onLand;
    onLand = () => { if (!landed) { landed = true; userLand?.(); } };
    const resolve = () => { if (!finished) { finished = true; onLand(); res(); } };
    setTimeout(resolve, 3000);
    const tgt = document.querySelector(target);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!fromEl || !tgt || !delta || reduce) { onLand?.(); setTimeout(resolve, reduce ? 150 : 0); return; }
    const a = fromEl.getBoundingClientRect(), b = tgt.getBoundingClientRect();
    if (!a.width && !a.height) { onLand?.(); resolve(); return; }
    // Hedef ekranda görünmüyorsa önce progress kartını görünür yap.
    const visible = b.top >= 0 && b.bottom <= window.innerHeight;
    const go = (seen = true) => {
      const r2 = tgt.getBoundingClientRect();
      const b2 = seen ? r2 : { left: r2.left, width: r2.width, top: r2.bottom < 0 ? 4 : window.innerHeight - 40, height: 24 };
      const el = document.createElement('div');
      el.className = 'xp-fly ' + (delta > 0 ? 'pos' : 'neg');
      el.textContent = `${delta > 0 ? '+' : '−'}${Math.abs(delta)} XP`;
      const sx = a.left + a.width / 2, sy = a.top + a.height / 2;
      el.style.left = sx + 'px'; el.style.top = sy + 'px';
      document.body.append(el);
      const dx = b2.left + b2.width / 2 - sx, dy = b2.top + b2.height / 2 - sy;
      const anim = el.animate([
        { transform: 'translate(-50%,-50%) scale(.5)', opacity: 0 },
        { transform: 'translate(-50%,-50%) translate(0px,-34px) scale(1.25)', opacity: 1, offset: 0.18 },
        { transform: `translate(-50%,-50%) translate(${dx * 0.35}px,${dy * 0.35 - 70}px) scale(1.05)`, opacity: 1, offset: 0.5 },
        { transform: `translate(-50%,-50%) translate(${dx}px,${dy}px) scale(.45)`, opacity: 0.85 },
      ], { duration: 1050, easing: 'cubic-bezier(.45,.05,.35,1)' });
      for (let i = 0; i < 5; i++) {
        const sp = document.createElement('i'); sp.className = 'xp-spark ' + (delta > 0 ? 'pos' : 'neg');
        sp.style.left = sx + 'px'; sp.style.top = sy + 'px'; document.body.append(sp);
        const ang = (Math.PI * 2 * i) / 5, r = 26 + Math.random() * 16;
        sp.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(-50%,-50%) translate(${Math.cos(ang) * r}px,${Math.sin(ang) * r}px) scale(.2)`, opacity: 0 }], { duration: 520, easing: 'ease-out' }).onfinish = () => sp.remove();
      }
      anim.onfinish = () => {
        el.remove();
        const panel = tgt.closest('.progress-panel') || tgt;
        panel.classList.remove('xp-hit', 'xp-hit-neg'); void panel.offsetWidth;
        panel.classList.add(delta > 0 ? 'xp-hit' : 'xp-hit-neg');
        onLand?.();
        setTimeout(() => { panel.classList.remove('xp-hit', 'xp-hit-neg'); resolve(); }, 650);
      };
    };
    // ekranı kaydırmadan uç: hedef görünmüyorsa XP ekranın üst kenarına doğru uçar
    go(visible);
  });
}

export function initQuiz(core) {
  const $ = s => document.querySelector(s);
  const esc = core.esc;
  const A = () => core.app;
  function Q() {
    const app = A();
    app.quiz = app.quiz || {};
    const q = app.quiz;
    q.items = q.items || {}; q.catXp = q.catXp || {}; q.cur = q.cur || {}; q.recent = q.recent || [];
    q.correct = q.correct || 0; q.wrong = q.wrong || 0; q.streak = q.streak || 0; q.rewardCount = q.rewardCount || 0;
    if (!app.cat || !CATS.some(c => c.id === app.cat)) app.cat = 'en';
    // İçe aktarılan yedek dosyası güvenilmez olabilir: bozuk/yabancı soru durumlarını at.
    for (const [k, c] of Object.entries(q.cur)) {
      const ok = c && typeof c === 'object' && (c.legacy === true || (typeof c.id === 'string' && Array.isArray(c.order) && c.order.every(n => Number.isInteger(n) && n >= 0 && n <= 9) && MODES.some(m => m.id === c.style) && Array.isArray(c.hints) && c.hints.every(Number.isInteger) && (c.typed == null || typeof c.typed === 'string')));
      if (!ok || !CATS.some(x => x.id === k)) delete q.cur[k];
    }
    for (const [k, v] of Object.entries(q.catXp)) if ((!SUBJECTS[k] && !EXTRA_CATS.includes(k)) || !Number.isFinite(v)) delete q.catXp[k];
    for (const k of ['correct', 'wrong', 'streak', 'rewardCount']) if (!Number.isFinite(q[k])) q[k] = 0;
    const legacyStyle = { logic: 'type', example: 'type', context: 'type', audio: 'listen' };
    if (!MODES.some(m => m.id === app.profile.mode)) app.profile.mode = legacyStyle[app.profile.style] || app.calibration?.mode || 'type';
    if (!DEPARTMENTS[app.profile.dept]) app.profile.dept = ({ biomedical: 'biyomedikal', prep: 'genel', general: 'genel' })[app.profile.goal] || 'genel';
    return q;
  }

  // ---- soru havuzları ----
  const subjectCache = {};
  onFactsLoaded(() => { for (const k of Object.keys(subjectCache)) delete subjectCache[k]; try { render(); } catch {} });
  function subjectItems(cat) {
    // elle yazılmış sorular (6. alan zorluk, yoksa 2) + kalıptan üretilen sorular (zorluk 1–5)
    const mk = (id, it, d) => ({ id, cat, d, q: it[0], a: it[1], opts: it[2], exp: it[3], src: it[4],
      lang: 'tr', optLang: 'tr', speak: { text: it[0], lang: 'tr' }, typeable: typeable(it[1]) });
    if (subjectCache[cat]) return subjectCache[cat];
    const list = [
      ...SUBJECTS[cat].items.map((it, i) => mk(`${cat}-${i}`, it, it[5] || 2)),
      ...generated(cat).map(g => mk(`${cat}-g${g.n}`, g.row, g.d)),
    ];
    if (!factsPending(cat)) subjectCache[cat] = list; // tablolar yüklenmeden önbelleğe alma
    return list;
  }
  let enCache = null;
  const LV = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  function englishItems() {
    if (enCache) return enCache;
    const qs = core.questions;
    enCache = [];
    qs.forEach((q, qi) => q.variants.forEach((v, j) => {
      const lvl = v.level || LV[j];
      const meaning = q.passageTr || q.prompt.replace(/\s*$/, '');
      // 2 çeldirici aynı sorunun farklı seviyelerinden (aynı anlam, başka seviye), 1 tanesi başka bir sorudan.
      const same = q.variants.map((x, k) => ({ x, k })).filter(({ x, k }) => k !== j && x.answer.toLowerCase() !== v.answer.toLowerCase());
      const far = same.filter(({ k }) => Math.abs(k - j) >= 2), near = same.filter(({ k }) => Math.abs(k - j) < 2);
      const pickSame = [...seededShuffle(far, hash(q.id + j + 's')), ...seededShuffle(near, hash(q.id + j + 'n'))].slice(0, 2);
      const otherPool = qs.filter((o, oi) => oi !== qi && o.variants[j]).map(o => ({ o, x: o.variants[j] }));
      const other = seededShuffle(otherPool, hash(q.id + j + 'o')).find(({ x }) => x.answer.toLowerCase() !== v.answer.toLowerCase());
      const notes = {};
      pickSame.forEach(({ x, k }) => {
        const xl = x.level || LV[k];
        notes[x.answer] = `Seçtiğin “${x.answer}” de aynı anlamı taşır ama ${xl} seviyesindedir; soru ${lvl} seviyesindeki ifadeyi soruyordu. ${k > j ? 'Daha ileri seviye: ' : 'Daha temel seviye: '}${x.clue}`;
      });
      if (other) notes[other.x.answer] = `Seçtiğin “${other.x.answer}” başka bir anlama gelir: ${other.o.passageTr || other.o.prompt.replace(/\s*$/, '')}`;
      const opts = [...pickSame.map(({ x }) => x.answer), ...(other ? [other.x.answer] : [])];
      enCache.push({
        id: `en-${q.id}-${j}`, cat: 'en', kind: 'en',
        q: q.passage ? `Boşluğu doldur (${lvl}): ${q.passage}` : `${q.prompt.replace(/\s*$/, '')} — ${lvl} seviyesindeki ifade hangisi?`,
        sub: `İpucu: ${v.clue}${q.passageTr ? ' · Türkçesi: ' + q.passageTr : ''}`,
        a: v.answer, opts, notes, lang: 'tr', optLang: 'en',
        speak: q.passage ? { text: q.passage.replace(/_{2,}/g, '…'), lang: 'en' } : { text: q.audioPrompt || q.prompt, lang: q.audioPrompt ? 'en' : 'tr' },
        exp: `“${v.answer}” ${lvl} seviyesinde bu anlamı verir: ${v.clue} Aynı anlamı her seviyede nasıl söyleyeceğin aşağıda; yukarı çıktıkça kelime seçimi zenginleşir ve ton resmîleşir.`,
        ladder: q.variants.map((x, k) => ({ level: x.level || LV[k], text: x.answer, clue: x.clue, on: k === j })),
        meaning, src: 'dam-la İngilizce soru bankası · CEFR A1–C2 seviye merdiveni', typeable: false,
      });
    }));
    return enCache;
  }
  const vocabCache = {};
  function vocabItems(dept) {
    if (vocabCache[dept]) return vocabCache[dept];
    const d = DEPARTMENTS[dept] || DEPARTMENTS.genel, terms = d.terms;
    const filler = dept === 'genel' ? [] : DEPARTMENTS.genel.terms;
    const out = [];
    terms.forEach((t, i) => {
      const [term, meaning, example, note] = t;
      const othersMean = seededShuffle([...terms, ...filler].filter(x => x[0] !== term).map(x => x[1]), hash(dept + i + 'm')).slice(0, 3);
      const othersTerm = seededShuffle([...terms, ...filler].filter(x => x[0] !== term).map(x => x[0]), hash(dept + i + 't')).slice(0, 3);
      const exp = `${term} — ${meaning}. ${note} Örnek: “${example}”`;
      const src = `${d.label} · ileri seviye İngilizce terimler`;
      out.push({ id: `dv-${dept}-${i}-a`, cat: 'en', kind: 'vocab', dept, q: `“${term}” ne anlama gelir?`, sub: `${d.label} terimi`, a: meaning, opts: othersMean, exp, src, lang: 'tr', optLang: 'tr', speak: { text: `${term}. ${example}`, lang: 'en' }, typeable: false, example });
      out.push({ id: `dv-${dept}-${i}-b`, cat: 'en', kind: 'vocab', dept, q: `“${meaning}” anlamına gelen İngilizce terim hangisi?`, sub: `${d.label} terimi`, a: term, opts: othersTerm, exp, src, lang: 'tr', optLang: 'en', speak: { text: meaning, lang: 'tr' }, typeable: typeable(term), example });
    });
    vocabCache[dept] = out;
    return out;
  }
  function vocabPool() {
    const dept = A().profile.dept || 'genel';
    return dept === 'genel' ? vocabItems('genel') : [...vocabItems(dept), ...vocabItems('genel')];
  }
  // ---- Akademik ve İngilizce Hazırlık bankaları: yalnızca o kategori açılınca yüklenir ----
  let ACAD = null, EP = null, acadP = null, epP = null;
  const acadCache = {};
  let epCache = null;
  function loadAcad() { if (!acadP) acadP = import('./data/academic/index.js').then(m => { ACAD = m.ACADEMIC; render(); }).catch(e => { acadP = null; console.warn('[akademik]', e); }); return acadP; }
  // Empower bankası uygulama dosyalarında yoktur: Firebase'de, yalnızca sınıf koduyla katılan öğrencilere açıktır.
  // İndirilen kopya cihazda saklanır (çevrimdışı çalışır); sürüm değişince yenilenir.
  const BANK_KEY = 'dl-prep-bank';
  let epGate = '';          // '' | 'join' | 'offline' | 'empty'
  const wait = ms => new Promise(r => setTimeout(r, ms));
  function loadEp() {
    if (epP) return epP;
    epP = (async () => {
      let cached = null;
      try { cached = JSON.parse(localStorage.getItem(BANK_KEY) || 'null'); } catch {}
      // render sırasında çağrılır: yeniden çizimi bir sonraki tura bırak (iç içe render dıştakini ezmesin)
      if (cached && cached.bank && !EP) { EP = cached.bank; epCache = null; setTimeout(() => render(), 0); }
      let P = null;
      for (let i = 0; i < 50; i++) { P = core.prep?.(); if (P && P.ready()) break; await wait(200); }
      if (!P || !P.ready()) { if (!EP) { epGate = 'offline'; render(); } return; }
      const m = await P.member();
      if (m === false) { EP = null; epCache = null; try { localStorage.removeItem(BANK_KEY); } catch {} epGate = 'join'; render(); return; }
      if (m == null) { if (!EP) { epGate = 'offline'; render(); } return; }
      const v = await P.ver();
      if (EP && cached && cached.ver === v) return;
      const b = await P.bank();
      if (!b) { if (!EP) { epGate = 'empty'; render(); } return; }
      EP = b; epCache = null; epGate = '';
      try { localStorage.setItem(BANK_KEY, JSON.stringify({ ver: v, bank: b })); } catch {}
      render();
    })().finally(() => { setTimeout(() => { epP = null; }, 60000); });
    return epP;
  }
  function renderGate() {
    const T = {
      join: ['🔒 Bu bölüm sınıfına özel', 'İngilizce Hazırlık soruları yalnızca sınıftaki öğrencilere açık. Öğretmeninin verdiği sınıf kodunu gir.'],
      offline: ['📶 İnternet gerekli', 'Hazırlık soruları ilk kez indirilirken bağlantı gerekir. Bağlanınca kendiliğinden yüklenir.'],
      empty: ['📭 Henüz soru yok', 'Öğretmenin soruları henüz yüklemedi. Biraz sonra tekrar dene.'],
    }[epGate] || ['Sorular yükleniyor…', ''];
    showLegacy(false);
    $('#qzTag').textContent = '📘 İNGİLİZCE HAZIRLIK';
    $('#qzCount').textContent = '';
    $('#qzTitle').textContent = T[0]; $('#qzTitle').classList.remove('qz-hidden');
    $('#qzSub').textContent = T[1]; $('#qzSub').classList.remove('qz-hidden');
    $('#qzReveal').classList.add('hidden');
    $('#qzTyped').classList.add('hidden');
    $('#qzOptions').classList.remove('hidden');
    $('#qzOptions').innerHTML = epGate === 'join' ? `<form class="prep-join" data-join><input id="prepCode" class="setting-input" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="32" placeholder="Sınıf kodu" aria-label="Sınıf kodu"><button class="primarybtn" type="submit">Katıl ↗</button><div class="prep-join-msg" id="prepJoinMsg" role="status"></div></form>` : '';
    const ex = $('#qzExplain'); if (ex) ex.innerHTML = '';
  }
  const pendingFor = cat => ((cat === 'akh' || cat === 'aka' || cat === 'akm') && !ACAD) || (cat === 'ep' && !EP);
  function loadFor(cat) { if (cat === 'ep') loadEp(); else if (cat === 'akh' || cat === 'aka' || cat === 'akm') loadAcad(); }
  const acadDept = () => (ACAD && ACAD[A().profile.dept] ? A().profile.dept : 'genel');
  function acadItems(kind, dept = acadDept()) {
    if (!ACAD) return [];
    const key = kind + dept;
    if (acadCache[key]) return acadCache[key];
    const d = ACAD[dept] || ACAD.genel, cat = kind === 'haz' ? 'akh' : 'aka';
    const list = (d[kind] || []).map((it, i) => ({ id: `${cat}-${dept}-${i}`, cat, d: it[5] || 2, q: it[0], a: it[1], opts: it[2], exp: it[3], src: it[4],
      sub: `${d.label} · ${kind === 'haz' ? 'hazırlık' : 'ana ders'} · ${it[6] || ''}`.replace(/ · $/, ''), lang: 'tr', optLang: 'tr', speak: { text: it[0], lang: 'tr' }, typeable: typeable(it[1]) }));
    acadCache[key] = list;
    return list;
  }
  // 1. seviye barı: Empower B1 (Pre-intermediate, 1. baskı) Workbook · 2. seviye barı: Empower B1 2. baskı Student's Book.
  // Kitaplar birbirine karışmaz; ünite sırasıyla. Biçim: [bölüm, tür, soru, cevap, [3 yanlış], açıklama, (sesli metin)]
  const KIND = { gr: 'Dilbilgisi', vo: 'Kelime', ee: 'Gündelik İngilizce', wp: 'Wordpower', pr: 'Telaffuz' };
  const BOOK = { wb: 'Empower B1 · Workbook', sb: "Empower B1 2. baskı · Student's Book" };
  const BOOK_SHORT = { wb: 'Empower B1', sb: 'Empower B1 2nd' };
  // Soruyu dinlerken cevap söylenmez: boşluk “…” olarak okunur; tırnaklı İngilizce kısım varsa yalnız o okunur.
  const TRC = /[çğıöşüÇĞİÖŞÜ]/;
  function questionSpeech(q) {
    const blank = t => t.replace(/_{2,}/g, ' … ');
    const quoted = q.match(/“([^”]+)”/);
    if (quoted && !TRC.test(quoted[1])) return { text: blank(quoted[1]), lang: 'en' };
    const sort = q.match(/^Kelimeleri sırala:\s*(.+)$/);
    if (sort) return { text: sort[1].replace(/\s*\/\s*/g, ', ').replace(/\s*\?$/, ''), lang: 'en' };
    const core0 = q.replace(/\s*\([^)]*[çğıöşüÇĞİÖŞÜ][^)]*\)\s*/g, ' ').trim();
    return TRC.test(core0) ? { text: q.replace(/_{2,}/g, ' boşluk '), lang: 'tr' } : { text: blank(core0), lang: 'en' };
  }
  function epItems() {
    if (epCache) return epCache;
    if (!EP) return [];
    const out = [];
    for (const b of ['wb', 'sb']) (EP[b] || []).forEach(un => un.items.forEach((it, i) => {
      const [sec, kind, q, a, opts, exp, say] = it;
      const en = /[a-z]/i.test(a) && !/[çğıöşüÇĞİÖŞÜ]/.test(a);
      out.push({ id: `ep-${b}-${un.u}-${i}`, cat: 'ep', b, u: un.u, ord: out.length, q, a, opts, exp,
        sub: `${BOOK[b]} · Ünite ${un.u} ${un.t} · ${sec} · ${KIND[kind] || ''}`,
        src: `${b === 'wb' ? 'Empower B1 (Pre-intermediate) Workbook' : "Empower B1 2nd edition Student's Book"} · Ünite ${un.u} (${sec}) · ${KIND[kind] || ''}`,
        lang: 'tr', optLang: en ? 'en' : 'tr', speak: questionSpeech(q), ans: say ? { text: say, lang: 'en' } : { text: a, lang: en ? 'en' : 'tr' }, full: say || null, typeable: typeable(a) });
    }));
    return (epCache = out);
  }
  // ilerleme: soru en az bir kez doğru bilindiyse öğrenildi; ünitenin %80'i öğrenilince sıradaki ünite açılır
  function epProgress() {
    const items = epItems(), q = Q(), units = { sb: {}, wb: {} };
    for (const it of items) { const u = units[it.b][it.u] || (units[it.b][it.u] = { n: 0, ok: 0, t: '' }); u.n++; if (q.items[it.id]?.c > 0) u.ok++; }
    const done = (b, u) => units[b][u] && units[b][u].ok / units[b][u].n >= 0.8;
    const list = b => Object.keys(units[b]).map(Number).sort((x, y) => x - y);
    let book = list('wb').every(u => done('wb', u)) && list('sb').length ? 'sb' : 'wb';
    const us = list(book), unit = us.find(u => !done(book, u)) ?? us[us.length - 1];
    const tot = us.reduce((s, u) => s + units[book][u].n, 0), ok = us.reduce((s, u) => s + units[book][u].ok, 0);
    return { book, unit, units: units[book], order: us, pct: tot ? ok / tot : 0, allDone: book === 'sb' && us.every(u => done('sb', u)) };
  }
  function pickEp() {
    const items = epItems(), q = Q(), now = Date.now(), recent = new Set(q.recent.slice(-6));
    const P = epProgress();
    const due = items.filter(it => q.items[it.id] && q.items[it.id].due <= now && !recent.has(it.id) && (it.b !== P.book || it.u < P.unit || P.allDone));
    if (due.length && (Math.random() < 0.25 || P.allDone)) return due.sort((x, y) => q.items[x.id].due - q.items[y.id].due)[0];
    const here = items.filter(it => it.b === P.book && it.u === P.unit && !recent.has(it.id));
    // kitaptaki sırayla: henüz görülmemiş ilk soru; hepsi görüldüyse henüz bilinemeyenler
    return here.find(it => !q.items[it.id]) || here.filter(it => !(q.items[it.id]?.c > 0)).sort((x, y) => (q.items[x.id]?.due || 0) - (q.items[y.id]?.due || 0))[0] || due[0] || here[0] || items.find(it => !recent.has(it.id)) || items[0];
  }
  function poolFor(cat) {
    if (cat === 'ep') return epItems();
    if (cat === 'akh') return acadItems('haz');
    if (cat === 'aka') return acadItems('ana');
    if (cat === 'akm') return [...acadItems('haz'), ...acadItems('ana')];
    if (cat === 'en') return [...englishItems(), ...vocabPool()];
    if (SUBJECTS[cat]) return subjectItems(cat);
    return [];
  }
  function findItem(id) {
    if (!id) return null;
    if (id.startsWith('ep-')) return epItems().find(x => x.id === id) || null;
    if (id.startsWith('akh-') || id.startsWith('aka-')) { const [k, dept] = id.split('-'); return acadItems(k === 'akh' ? 'haz' : 'ana', dept).find(x => x.id === id) || null; }
    if (id.startsWith('en-')) return englishItems().find(x => x.id === id);
    if (id.startsWith('dv-')) { const dept = id.split('-')[1]; return vocabItems(dept).find(x => x.id === id); }
    const cat = id.split('-')[0];
    return SUBJECTS[cat] ? subjectItems(cat).find(x => x.id === id) : null;
  }

  // ---- seçim (aralıklı tekrar) ----
  // Zorluk geçişi: konunun seviyesi yükseldikçe daha zor sorular gelir (her 2 seviyede bir kademe, en çok 5).
  // Yeni sorular çoğunlukla bulunduğun kademeden, bazen bir alttan (pekiştirme) ve ara sıra bir üstten (meydan okuma) seçilir.
  function tierFor(cat) { const lv = Math.floor(catXp(cat) / CAT_XP_STEP) + 1; return Math.min(5, 1 + Math.floor((lv - 1) / 2)); }
  function pickFrom(pool, cat) {
    const q = Q(), now = Date.now(), recent = new Set(q.recent.slice(-6));
    if (cat && SUBJECTS[cat] && pool.length > 60) {
      const tier = tierFor(cat), roll = Math.random();
      const want = roll < 0.15 ? Math.min(5, tier + 1) : roll < 0.4 ? Math.max(1, tier - 1) : tier;
      const band = pool.filter(it => (it.d || 2) === want && !q.items[it.id] && !recent.has(it.id));
      const dueAny = pool.some(it => q.items[it.id] && q.items[it.id].due <= now);
      if (band.length && !(dueAny && Math.random() < 0.5)) return band[Math.floor(Math.random() * band.length)];
    }
    const cand = pool.filter(it => !recent.has(it.id));
    const list = cand.length ? cand : pool;
    const due = list.filter(it => q.items[it.id] && q.items[it.id].due <= now).sort((x, y) => q.items[x.id].due - q.items[y.id].due);
    if (due.length && Math.random() < 0.7) return due[0];
    const unseen = list.filter(it => !q.items[it.id]);
    if (unseen.length) return unseen[Math.floor(Math.random() * Math.min(unseen.length, 8))];
    return list.slice().sort((x, y) => (q.items[x.id]?.due || 0) - (q.items[y.id]?.due || 0))[Math.floor(Math.random() * Math.min(3, list.length))];
  }
  function pickNext(cat) {
    if (cat === 'ep') return pickEp();
    if (cat === 'mix') {
      const cats = CATS.filter(c => c.id !== 'mix' && c.track === 'genel').map(c => c.id);
      const c = cats[Math.floor(Math.random() * cats.length)];
      return pickNext(c);
    }
    if (cat === 'en') {
      const usePool = Math.random() < 0.5 ? vocabPool() : englishItems();
      return pickFrom(usePool.length ? usePool : poolFor('en'));
    }
    return pickFrom(poolFor(cat), cat);
  }
  function resolveStyle(item, mode) {
    if (mode !== 'mix') return mode === 'type' && !item.typeable ? 'quiz' : mode;
    const opts = ['quiz', 'listen'].concat(item.typeable ? ['type'] : []);
    return opts[Math.floor(Math.random() * opts.length)];
  }
  function newCur(cat, forceItem) {
    const app = A(), mode = app.profile.mode;
    if (cat === 'en' && !forceItem) {
      if (mode === 'type') return { legacy: true };
      if (mode === 'mix' && Math.random() < 0.35) return { legacy: true };
    }
    const item = forceItem || pickNext(cat);
    const style = resolveStyle(item, mode);
    const seen = Q().items[item.id];
    return { id: item.id, style, done: false, choice: null, typed: '', hints: [], tries: 0, order: seededShuffle([0, ...item.opts.map((_, i) => i + 1)], hash(item.id + Date.now())), revealed: style !== 'listen', rep: !!(seen && (seen.c + seen.w) > 0), at: Date.now() };
  }
  function cur(cat = A().cat) {
    const q = Q();
    let c = q.cur[cat];
    // banka henüz yüklenmediyse yarım soruyu silme; yüklenince sürer
    if (pendingFor(cat)) { loadFor(cat); return c && !c.legacy ? c : { pending: true }; }
    const mode = A().profile.mode;
    if (cat === 'en' && mode === 'type' && c && !c.legacy && !c.done) c = q.cur[cat] = { legacy: true };
    if (cat === 'en' && mode !== 'type' && mode !== 'mix' && c?.legacy) c = q.cur[cat] = newCur(cat);
    // bilgi tabloları henüz yüklenmediyse yarım kalan soruyu silme; yüklenince kaldığı yerden sürer
    if (c && !c.legacy && factsPending(cat) && /-g/.test(c.id || '') && !findItem(c.id)) return c;
    if (!c || (!c.legacy && !findItem(c.id))) c = q.cur[cat] = newCur(cat);
    return c;
  }

  // ---- XP ----
  function catXp(cat) { if (cat === 'akm') return (Q().catXp.akh || 0) + (Q().catXp.aka || 0); return cat === 'en' ? A().xp : (Q().catXp[cat] || 0); }
  function totalXp() { const q = Q(); return A().xp + Object.values(q.catXp).reduce((s, v) => s + (v || 0), 0); }
  let frozen = null; // animasyon sürerken bar eski değeri gösterir
  function addXp(cat, delta) {
    const app = A();
    if (cat === 'en') { const old = core.levelIndex(); app.xp = Math.max(0, app.xp + delta); core.attemptLevelUp(old); return; }
    const q = Q(), before = q.catXp[cat] || 0, after = Math.max(0, before + delta);
    q.catXp[cat] = after;
    if (Math.floor(after / CAT_XP_STEP) > Math.floor(before / CAT_XP_STEP)) core.celebrateText(`✨ ${catLabel(cat)} · Seviye ${Math.floor(after / CAT_XP_STEP) + 1}!`);
  }

  // ---- ilerleme kartı (İngilizce dışındaki sekmeler) ----
  function renderProgressOverride() {
    const app = A(), cat = app.cat;
    if (!cat || cat === 'en') return false;
    if (cat === 'ep' && EP) {
      const P = epProgress(), U = P.order;
      $('#topLevel').textContent = `📘 ${P.book === 'wb' ? '1' : '2'}·Ü${P.unit}`;
      $('#levelCaption').textContent = `Seviye ${P.book === 'wb' ? '1 · Empower B1' : '2 · Empower B1 2nd edition'}${P.allDone ? ' · tamamlandı' : ''}`;
      const u = P.units[P.unit] || { n: 1, ok: 0 };
      $('#xpCaption').textContent = P.allDone ? 'İki kitap da bitti: artık tekrar soruları geliyor.' : `Ünite ${P.unit}: ${u.ok}/${u.n} öğrenildi · %80'de sıradaki ünite açılır${P.book === 'wb' ? ' · sonra Seviye 2 (Empower B1 2nd)' : ''}`;
      $('#xpNumber').textContent = `%${Math.round(P.pct * 100)}`;
      $('#cefrTrack').innerHTML = U.map(n => { const x = P.units[n], f = x.ok / x.n; return `<span class="${f >= 0.8 ? 'active' : n === P.unit ? 'current' : ''}" style="--fill:${Math.round(Math.min(1, f / 0.8) * 100)}%"></span>`; }).join('');
      $('#cefrLabels').innerHTML = U.map(n => `<span class="${n === P.unit ? 'on' : ''}">${n}</span>`).join('');
      return true;
    }
    const isMix = cat === 'mix', step = isMix ? MIX_XP_STEP : CAT_XP_STEP;
    const xp = frozen && frozen.cat === cat ? frozen.value : (isMix ? totalXp() : catXp(cat));
    const level = Math.floor(xp / step) + 1, within = xp % step, pct = Math.round((within / step) * 100);
    const start = level - ((level - 1) % 6);
    const c = CATS.find(x => x.id === cat);
    $('#topLevel').textContent = `${c.icon} Sv ${level}`;
    $('#levelCaption').textContent = isMix ? `Genel seviye ${level}` : `${c.label} · Seviye ${level}`;
    $('#xpCaption').textContent = `${step - within} XP sonra Seviye ${level + 1}${isMix ? ' · tüm konuların toplamı' : ''}`;
    $('#xpNumber').textContent = `${xp} XP`;
    $('#cefrTrack').innerHTML = Array.from({ length: 6 }, (_, j) => { const lv = start + j; return `<span class="${lv < level ? 'active' : lv === level ? 'current' : ''}" style="${lv === level ? `--fill:${pct}%` : ''}"></span>`; }).join('');
    $('#cefrLabels').innerHTML = Array.from({ length: 6 }, (_, j) => `<span class="${start + j === level ? 'on' : ''}">Sv ${start + j}</span>`).join('');
    return true;
  }
  core.setProgressOverride(renderProgressOverride);

  // ---- arayüz ----
  function headline() {
    const cat = A().cat, c = CATS.find(x => x.id === cat);
    const h1 = $('#mainTitle'), p = $('#mainLead');
    if (!h1) return;
    if (cat === 'ep') { const P = EP ? epProgress() : null; h1.textContent = 'İngilizce hazırlık.'; p.textContent = P ? `${BOOK_SHORT[P.book]} · Ünite ${P.unit}. Kitaptaki sırayla öğren; her cevaptan sonra ayrıntılı açıklama gelir.` : 'Empower B1 kitaplarını sırasıyla öğren.'; return; }
    if (cat === 'akh' || cat === 'aka' || cat === 'akm') { const lb = (ACAD && (ACAD[acadDept()] || {}).label) || 'Bölümün'; h1.textContent = `${lb}.`; p.textContent = cat === 'akh' ? 'Hazırlık: bölümüne başlamadan önce sağlam olması gereken temel konular.' : cat === 'aka' ? 'Ana dersler: bölümün çekirdek konuları, ayrıntılı açıklamalarla.' : 'Hazırlık ve ana ders sorularından karışık.'; return; }
    if (cat === 'en') { h1.textContent = 'İngilizceyi çöz.'; p.textContent = 'Aynı anlamı farklı seviyelerde söyle, bölümüne özel ileri seviye terimleri öğren.'; }
    else if (cat === 'mix') { h1.textContent = 'Karışık pop quiz.'; p.textContent = 'Her soru farklı bir konudan gelir. Doğru da bilsen yanlış da, açıklamayı oku: asıl öğrenme orada.'; }
    else { h1.textContent = `${c.label} pop quiz.`; p.textContent = 'Seç ya da yaz; her cevaptan sonra güvenilir kaynaklara dayanan ayrıntılı açıklama gelir.'; }
  }
  function renderTabs() {
    const box = $('#catTabs'); if (!box) return;
    const cat = A().cat;
    const tr = trackOf(cat);
    const sw = $('#trackSw');
    if (sw) sw.querySelectorAll('[data-track]').forEach(b => { const on = b.dataset.track === tr; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    const list = CATS.filter(c => c.track === tr);
    box.classList.toggle('hidden', list.length < 2);
    box.innerHTML = list.map(c => `<button role="tab" class="cat-tab${c.id === cat ? ' on' : ''}" data-cat="${c.id}" aria-selected="${c.id === cat}"><span>${c.icon}</span>${esc(c.label)}</button>`).join('');
    const on = box.querySelector('.on'); // yalnızca sekme şeridini yatay kaydır; sayfa dikeyde hiç oynamasın
    if (on) { const l = on.offsetLeft - (box.clientWidth - on.offsetWidth) / 2; if (Math.abs(box.scrollLeft - l) > 4) box.scrollTo({ left: Math.max(0, l), behavior: 'smooth' }); }
  }
  function renderModeBtn() {
    const m = MODES.find(x => x.id === A().profile.mode) || MODES[0];
    const b = $('#modeBtn'); if (!b) return;
    b.querySelector('.mode-ico').textContent = m.icon;
    b.querySelector('strong').textContent = m.label;
    b.querySelector('small').textContent = m.hint;
    b.dataset.mode = m.id;
  }
  function showLegacy(show) {
    $('#legacyBlock')?.classList.toggle('hidden', !show);
    $('#quizCard')?.classList.toggle('hidden', show);
    $('#mixLegacyNote')?.classList.toggle('hidden', !(show && A().profile.mode === 'mix'));
  }

  // Açıklamayı okunur kıl: kural kutusu + madde madde cümleler, kısa etiketler kalın.
  function splitSentences(t) { return t.split(/(?<=[.!?…])\s+(?=[A-ZÇĞİÖŞÜ“"(])|\s+·\s+/).map(x => x.trim()).filter(Boolean); }
  function lineHtml(t) { const m = t.match(/^([^:]{2,30}):\s+(.+)$/s); return m ? `<b>${esc(m[1])}:</b> ${esc(m[2])}` : esc(t); }
  function formatExp(exp) {
    return String(exp || '').split(/\n\n+/).map((para, i) => {
      const rule = para.match(/^📘\s*([^:]{1,80}):\s*([\s\S]+)$/);
      if (rule) return `<div class="qx-rule"><div class="qx-rule-h">📘 ${esc(rule[1])}</div><ul>${splitSentences(rule[2]).map(l => `<li>${lineHtml(l)}</li>`).join('')}</ul></div>`;
      const parts = para.length > 200 ? splitSentences(para) : [para];
      return parts.map(t => `<p class="qx-body${i === 0 && parts.length === 1 ? ' qx-lead' : ''}">${i === 0 && parts.length === 1 ? '💡 ' : ''}${lineHtml(t)}</p>`).join('');
    }).join('');
  }
  function speakable(t) { return String(t || '').replace(/[📘💡✅❌🔊]/gu, '').replace(/\/[^/\s][^/]{0,14}\//g, '').replace(/[“”]/g, '"').replace(/\s*·\s*/g, '. ').replace(/\s+/g, ' ').trim(); }
  function optionText(item, idx) { return idx === 0 ? item.a : item.opts[idx - 1]; }
  let shownId = null;
  function render({ speak = false } = {}) {
    const app = A(), cat = app.cat;
    headline(); renderTabs(); renderModeBtn();
    const c = cur(cat);
    if (c.pending && cat === 'ep' && epGate) { renderGate(); core.renderProgress(); return; }
    if (c.pending) { showLegacy(false); $('#qzTitle').textContent = 'Sorular yükleniyor…'; $('#qzSub').textContent = ''; $('#qzOptions').innerHTML = ''; $('#qzExplain') && ($('#qzExplain').innerHTML = ''); core.renderProgress(); return; }
    if (c.legacy) { showLegacy(true); core.renderLegacy(); core.renderProgress(); notifyLive(null); return; }
    showLegacy(false);
    const item = findItem(c.id), q = Q();
    if (!item) { $('#qzTitle').textContent = 'Sorular yükleniyor…'; $('#qzOptions').innerHTML = ''; loadFacts(); return; }
    if (shownId !== c.id && !c.done) { shownId = c.id; setTimeout(() => window.dispatchEvent(new CustomEvent('dl:question', { detail: { id: c.id, cat: item.cat, style: c.style } })), 0); }
    const catOfItem = item.cat, catInfo = CATS.find(x => x.id === catOfItem);
    const m = MODES.find(x => x.id === c.style);
    $('#qzTag').textContent = `${catInfo.icon} ${catInfo.label.toLocaleUpperCase('tr')} · ${MODE_TAG[m.id] || m.label}`;
    $('#qzCount').textContent = `✓ ${q.correct} · ✗ ${q.wrong} · 🔥 ${q.streak}${c.rep ? ' · 🔁 tekrar' : ''}`;
    $('#qzCount').title = `Doğru ${q.correct} · Yanlış ${q.wrong} · Seri ${q.streak}`;
    const title = $('#qzTitle');
    title.textContent = item.q;
    title.classList.toggle('qz-hidden', !c.revealed);
    $('#qzSub').textContent = item.sub || (cat === 'mix' ? `Konu: ${catInfo.label}` : '');
    $('#qzSub').classList.toggle('qz-hidden', !c.revealed);
    $('#qzReveal').classList.toggle('hidden', c.revealed);
    $('#qzListen').textContent = c.style === 'listen' ? '🎧 Soruyu tekrar dinle' : '▶ Soruyu dinle';
    // seçenekler
    const optBox = $('#qzOptions'), typedBox = $('#qzTyped');
    optBox.classList.toggle('hidden', c.style === 'type');
    typedBox.classList.toggle('hidden', c.style !== 'type');
    if (c.style !== 'type') {
      optBox.innerHTML = c.order.map((idx, k) => {
        const text = optionText(item, idx);
        let cls = 'quiz-opt';
        const out = !c.done && Array.isArray(c.elim) && c.elim.includes(idx);
        if (c.done) { if (idx === 0) cls += ' right'; else if (c.choice === idx) cls += ' wrong'; else cls += ' dim'; }
        else if (out) cls += ' elim';
        const speakBtn = (c.style === 'listen' || item.optLang === 'en') ? `<span class="opt-say" role="button" tabindex="0" data-say="${k}" aria-label="Seçeneği dinle">🔊</span>` : '';
        return `<button class="${cls}" data-opt="${Number(idx) | 0}" ${c.done || out ? 'aria-disabled="true"' : ''}><span class="opt-key">${'ABCD'[k]}</span><span class="opt-text" lang="${item.optLang}">${esc(text)}</span>${speakBtn}</button>`;
      }).join('');
    } else renderTyped(item, c);
    // açıklama
    const ex = $('#qzExplain');
    if (c.done) {
      const ok = c.result === 'right';
      ex.className = 'quiz-explain ' + (ok ? 'good' : 'bad');
      const d = c.delta || 0;
      const chosen = c.choice != null && c.choice !== 0 && c.style !== 'type' ? optionText(item, c.choice) : null;
      const note = !ok && chosen && item.notes?.[chosen] ? `<p class="qx-note">${esc(item.notes[chosen])}</p>` : '';
      const ladder = item.ladder ? `<ol class="qx-ladder">${item.ladder.map(l => `<li class="${l.on ? 'on' : ''}${chosen && l.text === chosen ? ' picked' : ''}"><b>${l.level}</b><span><span lang="en">${esc(l.text)}</span><small>${esc(l.clue)}</small></span></li>`).join('')}</ol>` : '';
      ex.innerHTML = `<div class="qx-head">${ok ? '✅ Doğru!' : '❌ Yanlış'} <span class="qx-xp ${d > 0 ? 'pos' : d < 0 ? 'neg' : 'zero'}">${d === 0 ? 'XP değişmedi' : `${d > 0 ? '+' : '−'}${Math.abs(d)} XP`}</span></div>`
        + (ok ? '' : `<p class="qx-answer">Doğru cevap: <strong lang="${item.optLang}">${esc(item.a)}</strong>${c.choice != null && c.choice !== 0 && c.style !== 'type' ? ` · Senin seçimin: <s>${esc(optionText(item, c.choice))}</s>` : ''}${c.style === 'type' && c.typedFinal ? ` · Senin cevabın: <s>${esc(c.typedFinal)}</s>` : ''}</p>`)
        + note
        + (item.full && item.full !== item.a ? `<p class="qx-full"><span>Tam cümle</span><b lang="en">${esc(item.full)}</b></p>` : '')
        + formatExp(item.exp) + ladder
        + `<div class="qx-listen"><button class="mini-btn" data-say-ans="1">🔊 Cevabı dinle</button>${item.example ? `<button class="mini-btn" data-say-example="1">🔊 Örnek cümle</button>` : ''}<button class="mini-btn" data-say-exp="1">🔊 Açıklamayı dinle</button></div>`
        + `<p class="qx-src">📚 Kaynak: ${esc(item.src || '—')}</p>`;
      ex.classList.remove('hidden');
    } else ex.classList.add('hidden');
    $('#qzNext').classList.toggle('hidden', !c.done);
    core.renderProgress();
    notifyLive(item, c);
    if (speak && c.style === 'listen' && !c.done) setTimeout(() => sayItem(item), 250);
    core.prefetchVoice?.(item.speak?.lang === 'en' ? item.speak.text : null);
  }

  // ---- yazarak (harf kutuları) ----
  function groupWords(chars, parts, gapCls, wordCls) {
    let out = '', word = '';
    chars.forEach((ch, i) => {
      if (ch === ' ') { if (word) out += `<span class="${wordCls}">${word}</span>`; word = ''; out += `<span class="${gapCls}" aria-hidden="true"></span>`; }
      else word += parts[i];
    });
    if (word) out += `<span class="${wordCls}">${word}</span>`;
    return out;
  }
  function renderTyped(item, c) {
    const chars = [...item.a];
    const hintSet = new Set(c.hints);
    const typed = [...(c.typed || '')];
    let ti = 0, activeSet = false;
    const html = chars.map((ch, i) => {
      if (!SLOT_RE.test(ch)) return ch === ' ' ? '<span class="qslot gap"></span>' : `<span class="qslot fixed">${esc(ch)}</span>`;
      if (hintSet.has(i)) return `<span class="qslot hint">${esc(ch)}</span>`;
      const v = typed[ti++];
      if (c.done) return `<span class="qslot ${c.result === 'right' ? 'ok' : 'reveal'}">${esc(ch)}</span>`;
      if (v) return `<span class="qslot filled">${esc(v)}</span>`;
      const cls = activeSet ? 'qslot' : 'qslot active'; activeSet = true;
      return `<span class="${cls}"></span>`;
    });
    // kelimeler bölünmez: her kelime tek parça kalır, kelime araları belirgin boşlukla ayrılır
    $('#qzSlots').innerHTML = groupWords(chars, html, 'qslot gap', 'qword');
    const left = MAX_TRIES - (c.tries || 0);
    $('#qzTries').textContent = c.done ? '' : `${left} deneme hakkın var · ipucu ${c.hints.length}/${maxHints(item)}`;
    $('#qzHint').disabled = c.done || c.hints.length >= maxHints(item);
    hintLabel();
    $('#qzSubmit').disabled = c.done;
    const fb = $('#qzTypedFb'); fb.textContent = c.fb || ''; fb.className = 'quiz-typed-fb ' + (c.fbType || '');
  }
  function slotPositions(item) { return [...item.a].map((ch, i) => SLOT_RE.test(ch) ? i : -1).filter(i => i >= 0); }
  function maxHints(item) { return Math.max(1, Math.ceil(slotPositions(item).length / 3)); }
  function composeTyped(item, c) {
    const typed = [...(c.typed || '')]; const hint = new Set(c.hints); let ti = 0;
    return [...item.a].map((ch, i) => !SLOT_RE.test(ch) ? ch : hint.has(i) ? ch : (typed[ti++] || '')).join('');
  }
  function freeSlotCount(item, c) { return slotPositions(item).length - c.hints.length; }
  function onTypedInput() {
    const c = cur(), item = findItem(c.id); if (!item || c.done) return;
    const input = $('#qzInput');
    const clean = [...input.value].filter(ch => SLOT_RE.test(ch)).join('').slice(0, freeSlotCount(item, c));
    if (!composing && input.value !== clean) input.value = clean;
    c.typed = clean; c.fb = ''; renderTyped(item, c);
  }
  let composing = false;
  function giveHint() {
    const c = cur(), item = findItem(c.id); if (!item || c.done || c.hints.length >= maxHints(item)) return;
    if (A().hintLock) { core.toast('🔒 İpuçların yönetici tarafından kapatıldı.'); return; }
    const free = slotPositions(item).filter(i => !c.hints.includes(i));
    // yazılmış harfleri koru: ipucunu yazılmamış kısımdan ver
    const typedLen = [...(c.typed || '')].length;
    const pick = free.slice(typedLen)[Math.floor(Math.random() * Math.max(1, free.length - typedLen))] ?? free[free.length - 1];
    if (pick == null) return;
    c.hints.push(pick); c.hints.sort((a, b) => a - b);
    c.typed = [...(c.typed || '')].slice(0, freeSlotCount(item, c)).join('');
    $('#qzInput').value = c.typed;
    const credit = (A().hintCredits | 0) > 0;
    if (credit) { A().hintCredits--; c.freeHints = (c.freeHints || 0) + 1; }
    c.fb = credit ? `🎁 Bedava ipucu: bir harf açıldı, XP’n düşmez. Kalan bedava ipucu: ${A().hintCredits}.` : 'İpucu: bir harf açıldı. İpucuyla bulunan cevap daha az XP kazandırır.'; c.fbType = 'hint';
    hintLabel();
    renderTyped(item, c); core.saveLocal(false);
  }
  function submitTyped() {
    const c = cur(), item = findItem(c.id); if (!item || c.done) return;
    const need = freeSlotCount(item, c), have = [...(c.typed || '')].length;
    if (have < need) { c.fb = `${need - have} boş kutu kaldı.`; c.fbType = 'hint'; renderTyped(item, c); return; }
    const answer = composeTyped(item, c);
    const exact = answer.toLocaleLowerCase('tr') === item.a.toLocaleLowerCase('tr');
    const close = fold(answer) === fold(item.a);
    if (exact || close) {
      const delta = c.hints.length > (c.freeHints || 0) ? XP.typeHinted : XP.type;
      if (!exact) c.note = 'Türkçe karakterlere dikkat';
      finish(item, c, true, delta, $('#qzSlots'));
      return;
    }
    c.tries = (c.tries || 0) + 1;
    if (c.tries >= MAX_TRIES) { c.typedFinal = answer; finish(item, c, false, XP.wrong, $('#qzSlots')); return; }
    c.fb = `Olmadı · benzerlik %${similarity(answer, item.a)} · ${MAX_TRIES - c.tries} hakkın kaldı.`; c.fbType = 'bad';
    $('#qzSlots').classList.remove('shake'); void $('#qzSlots').offsetWidth; $('#qzSlots').classList.add('shake');
    renderTyped(item, c); core.saveLocal(false);
  }

  // ---- cevaplama ----
  function choose(idx, btn) {
    const c = cur(), item = findItem(c.id); if (!item || c.done) return;
    c.choice = idx;
    finish(item, c, idx === 0, idx === 0 ? (c.style === 'listen' ? XP.listen : XP.quiz) : XP.wrong, btn);
  }
  function finish(item, c, right, delta, fromEl) {
    const q = Q(), app = A(), now = Date.now();
    const st = q.items[item.id] || { c: 0, w: 0, box: 0, due: 0 };
    if (right) { st.c++; st.box = Math.min(st.box + 1, REVIEW_STEPS.length - 1); st.due = now + REVIEW_STEPS[st.box]; q.correct++; q.streak++; }
    else { st.w++; st.box = 0; st.due = now + 4 * 60000; q.wrong++; q.streak = 0; }
    st.last = now; q.items[item.id] = st;
    q.recent.push(item.id); if (q.recent.length > 12) q.recent.shift();
    c.done = true; c.result = right ? 'right' : 'wrong'; c.revealed = true;
    const targetCat = A().cat === 'mix' ? item.cat : item.cat;
    // Uçuş bitene kadar bar eski değeri göstersin
    const viewCat = app.cat;
    const before = viewCat === 'en' ? app.xp : (viewCat === 'mix' ? totalXp() : catXp(viewCat));
    const realBefore = catXp(targetCat);
    if (delta > 0 && core.xpMod) delta = core.xpMod(targetCat, delta, right);
    addXp(targetCat, delta);
    c.delta = catXp(targetCat) - realBefore;
    if (viewCat === 'en') core.freezeXp(before); else frozen = { cat: viewCat, value: before };
    core.saveLocal(true);
    render();
    const src = fromEl && document.body.contains(fromEl) ? fromEl : document.querySelector(right ? '.quiz-opt.right' : '.quiz-opt.wrong') || $('#qzExplain');
    let rewardNow = false;
    if (right && c.delta > 0) {
      const mode = app.profile.rewardMode || 'every';
      q.rewardCount++;
      rewardNow = mode === 'every' || (mode === 'question' && q.rewardCount % 5 === 0);
    }
    core.cloudEvent?.({ type: 'answer', cat: item.cat, right, delta: c.delta, q: item.q });
    window.dispatchEvent(new CustomEvent('dl:answer', { detail: { right, cat: targetCat, kind: c.style === 'type' ? 'type' : 'quiz', id: item.id, delta: c.delta } }));
    flyXp(src, c.delta, { onLand: () => { core.unfreezeXp(); frozen = null; core.renderProgress(); } })
      .then(() => { if (rewardNow) core.showRewardPopup(c.delta); });
  }
  function next({ speak = true } = {}) {
    const cat = A().cat, q = Q();
    q.cur[cat] = newCur(cat);
    core.saveLocal(false);
    holdScroll(() => render({ speak }));
  }

  // ---- ses ----
  function sayItem(item) { if (item?.speak) core.speak(item.speak.text, item.speak.lang); }

  // ---- yönetici paneli için anlık soru ----
  function notifyLive(item, c) {
    const app = A();
    if (!core.cloudLive) return;
    if (!item) { const lq = core.questions[app.index]; core.cloudLive({ cat: app.cat, catLabel: catLabel(app.cat), mode: 'Yazarak (İngilizce)', question: lq ? lq.prompt : '', answer: '' }); return; }
    core.cloudLive({ cat: item.cat, catLabel: catLabel(item.cat), mode: (MODES.find(m => m.id === c.style) || {}).label, question: item.q, answer: item.a, options: c.style === 'type' ? [] : c.order.map(i => optionText(item, i)), state: c.done ? (c.result === 'right' ? 'doğru cevapladı' : 'yanlış cevapladı') : 'cevaplıyor' });
  }

  // ---- olaylar ----
  $('#catTabs').addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    core.stopAudio(); A().cat = b.dataset.cat; core.saveLocal(false); render();
  });
  // sınıf koduyla katılma
  $('#qzOptions').addEventListener('submit', async e => {
    const f = e.target.closest('[data-join]'); if (!f) return;
    e.preventDefault();
    const code = ($('#prepCode')?.value || '').trim(), msg = $('#prepJoinMsg');
    if (code.length < 6) { msg.textContent = 'Kod en az 6 karakter.'; return; }
    msg.textContent = 'Denetleniyor…';
    const r = await core.prep?.()?.join(code);
    if (r === 'ok') { msg.textContent = '✓ Katıldın! Sorular indiriliyor…'; epGate = ''; epP = null; loadEp(); }
    else msg.textContent = r === 'offline' ? 'Bağlantı yok; biraz sonra tekrar dene.' : 'Kod yanlış. Öğretmeninden kontrol etmesini iste.';
  });
  // kategori anahtarı: her kategoride en son açık olan sekme hatırlanır
  $('#trackSw')?.addEventListener('click', e => {
    const b = e.target.closest('[data-track]'); if (!b) return;
    const app = A(), from = trackOf(app.cat), to = b.dataset.track;
    if (from === to) return;
    app.profile.trackCat = { ...(app.profile.trackCat || {}), [from]: app.cat };
    const remembered = app.profile.trackCat[to];
    core.stopAudio(); app.cat = CATS.some(c => c.id === remembered && c.track === to) ? remembered : TRACKS.find(t => t.id === to).def;
    core.saveLocal(false); render();
  });
  $('#modeBtn').addEventListener('click', () => {
    const app = A(), i = MODES.findIndex(m => m.id === app.profile.mode);
    app.profile.mode = MODES[(i + 1) % MODES.length].id;
    const q = Q(), c = q.cur[app.cat];
    // cevaplanmamış soruyu yeni biçimle yeniden başlat
    if (c && !c.done) {
      if (app.cat === 'en' && (app.profile.mode === 'type') ) q.cur.en = { legacy: true };
      else if (c.legacy) q.cur[app.cat] = newCur(app.cat);
      else { const item = findItem(c.id); q.cur[app.cat] = newCur(app.cat, item); }
    }
    core.saveLocal(false);
    const m = MODES.find(x => x.id === app.profile.mode);
    core.toast(`${m.icon} Öğrenme biçimi: ${m.label}`);
    const btn = $('#modeBtn'); btn.classList.remove('spin'); void btn.offsetWidth; btn.classList.add('spin');
    render({ speak: true });
  });
  $('#qzOptions').addEventListener('click', e => {
    const say = e.target.closest('[data-say]');
    const c = cur(), item = findItem(c.id);
    if (say) { e.stopPropagation(); const idx = c.order[+say.dataset.say]; core.speak(optionText(item, idx), item.optLang === 'en' ? 'en' : 'tr'); return; }
    const b = e.target.closest('[data-opt]'); if (!b || b.classList.contains('elim')) return;
    if (!c.revealed && c.style === 'listen') c.revealed = true;
    choose(+b.dataset.opt, b);
  });
  $('#qzListen').addEventListener('click', () => { const c = cur(); if (c.legacy) return; sayItem(findItem(c.id)); });
  $('#qzReveal').addEventListener('click', () => { const c = cur(); c.revealed = true; render(); });
  $('#qzNext').addEventListener('click', () => next());
  $('#qzExplain').addEventListener('click', e => {
    const c = cur(), item = c && !c.pending && !c.legacy ? findItem(c.id) : null; if (!item) return;
    if (e.target.closest('[data-say-example]')) { if (item.example) core.speak(item.example, 'en'); return; }
    if (e.target.closest('[data-say-ans]')) { const a = item.ans || { text: item.a, lang: item.optLang === 'en' ? 'en' : 'tr' }; core.speak(a.text, a.lang); return; }
    if (e.target.closest('[data-say-exp]')) core.speak(speakable(String(item.exp).split(/\n\n+/)[0]), 'tr');
  });
  const input = $('#qzInput');
  $('#qzSlots').addEventListener('click', () => { try { input.focus({ preventScroll: true }); } catch {} });
  input.addEventListener('compositionstart', () => { composing = true; });
  input.addEventListener('compositionend', () => { composing = false; onTypedInput(); });
  input.addEventListener('input', onTypedInput);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submitTyped(); } });
  $('#qzHint').addEventListener('click', giveHint);
  // bedava ipucu sayısı ve kilit düğmede görünür
  function hintLabel() {
    const b = $('#qzHint'); if (!b) return;
    if (!b.dataset.base) b.dataset.base = b.innerHTML;
    const n = A().hintCredits | 0;
    b.innerHTML = A().hintLock ? '🔒 İpucu kapalı' : b.dataset.base + (n ? ` <span class="hint-free">🎁${n}</span>` : '');
    b.classList.toggle('locked', !!A().hintLock);
  }
  window.addEventListener('dl:hints', hintLabel);
  $('#qzSubmit').addEventListener('click', submitTyped);
  // Karışık modda İngilizce yazma sorusundan sonra rastgele pop quiz’e geçiş
  $('#nextQuestion')?.addEventListener('click', () => {
    const app = A();
    if (app.cat === 'en' && app.profile.mode === 'mix' && Q().cur.en?.legacy && Math.random() < 0.5) setTimeout(() => next(), 60);
  });

  return {
    render, next, catXp, totalXp, poolSize: cat => poolFor(cat).length,
    stats: () => { const q = Q(); return { correct: q.correct, wrong: q.wrong, streak: q.streak, catXp: { ...q.catXp }, total: totalXp() }; },
    addXpExternal(cat, delta, fromEl) {
      const app = A(), viewCat = app.cat;
      const before = viewCat === 'en' ? app.xp : (viewCat === 'mix' ? totalXp() : catXp(viewCat));
      addXp(cat, delta); core.saveLocal(true);
      if (viewCat === 'en') core.freezeXp(before); else frozen = { cat: viewCat, value: before };
      core.renderProgress();
      return flyXp(fromEl, delta, { onLand: () => { core.unfreezeXp(); frozen = null; core.renderProgress(); } });
    },
    // ---- pet yetenekleri için ----
    petTarget() {
      const c = cur(); if (!c || c.legacy || c.done) return null;
      const item = findItem(c.id); return item ? { item, c, style: c.style } : null;
    },
    eliminate(n) {
      const t = this.petTarget(); if (!t || t.style === 'type') return 0;
      const c = t.c; c.elim = Array.isArray(c.elim) ? c.elim : [];
      const wrong = c.order.filter(i => i !== 0 && !c.elim.includes(i));
      // en az bir yanlış şık kalsın (tamamen bedava olmasın)
      const pick = seededShuffle(wrong, hash(t.item.id + Date.now())).slice(0, Math.min(n, Math.max(0, wrong.length - 1)));
      c.elim.push(...pick); core.saveLocal(false); render(); return pick.length;
    },
    freeHint() {
      const t = this.petTarget(); if (!t || t.style !== 'type') return false;
      const c = t.c, before = c.hints.length;
      const max = slotPositions(t.item).length; if (c.hints.length >= max - 1) return false;
      const free = slotPositions(t.item).filter(i => !c.hints.includes(i));
      const typedLen = [...(c.typed || '')].length;
      const pick = free.slice(typedLen)[0] ?? free[free.length - 1]; if (pick == null) return false;
      c.hints.push(pick); c.hints.sort((a, b) => a - b); c.freeHints = (c.freeHints || 0) + 1;
      c.typed = [...(c.typed || '')].slice(0, freeSlotCount(t.item, c)).join(''); $('#qzInput').value = c.typed;
      c.fb = 'Petin bir harf açtı (XP cezası yok).'; c.fbType = 'hint';
      core.saveLocal(false); render(); return c.hints.length > before;
    },
    skip() { const t = this.petTarget(); if (!t) return false; next({ speak: true }); return true; },
    answerHint() {
      const t = this.petTarget(); if (!t) return null;
      const a = String(t.item.a); const letters = [...a].filter(ch => SLOT_RE.test(ch)).length;
      const wrongOpts = t.style === 'type' ? [] : t.c.order.filter(i => i !== 0 && !(t.c.elim || []).includes(i)).map(i => t.item.opts[i - 1]);
      return { first: a.trim()[0] || '', last: a.trim().slice(-1), letters, words: a.trim().split(/\s+/).length, text: a, style: t.style, wrongOpts, cat: t.item.cat, tries: t.c.tries || 0 };
    },
    renderAll() { render(); },
    resetDeptCache() { Object.keys(vocabCache).forEach(k => delete vocabCache[k]); const q = Q(); if (q.cur.en && !q.cur.en.legacy && String(q.cur.en.id).startsWith('dv-') && !q.cur.en.done) q.cur.en = newCur('en'); },
  };
}
