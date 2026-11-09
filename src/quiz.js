// dam-la — konu sekmeleri, öğrenme biçimi döngüsü, pop quiz (çoktan seçmeli / yazarak / dinleyerek / karışık)
import { SUBJECTS, SUBJECT_ORDER } from './data/subjects.js';
import { DEPARTMENTS, DEPARTMENT_ORDER } from './data/departments.js';

export const MODES = [
  { id: 'type', icon: '✍️', label: 'Yazarak', hint: 'Cevabı harf kutularına yaz' },
  { id: 'quiz', icon: '🎯', label: 'Pop Quiz', hint: 'Seçeneklerden doğruyu bul' },
  { id: 'listen', icon: '🎧', label: 'Dinleyerek', hint: 'Soruyu dinle, sonra seç' },
  { id: 'mix', icon: '🔀', label: 'Karışık', hint: 'Her soru farklı biçimde' },
];
export const MODE_TAG = { type: 'YAZARAK', quiz: 'POP QUIZ', listen: 'DİNLEYEREK', mix: 'KARIŞIK' };
export const CATS = [
  { id: 'mix', icon: '🔀', label: 'Karışık' },
  { id: 'en', icon: '🇬🇧', label: 'İngilizce' },
  ...SUBJECT_ORDER.map(id => ({ id, icon: SUBJECTS[id].icon, label: SUBJECTS[id].label })),
];
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
export function flyXp(fromEl, delta, { target = '#xpNumber', onLand } = {}) {
  return new Promise(resolve => {
    const tgt = document.querySelector(target);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!fromEl || !tgt || !delta || reduce) { onLand?.(); setTimeout(resolve, reduce ? 150 : 0); return; }
    const a = fromEl.getBoundingClientRect(), b = tgt.getBoundingClientRect();
    if (!a.width && !a.height) { onLand?.(); resolve(); return; }
    // Hedef ekranda görünmüyorsa önce progress kartını görünür yap.
    const visible = b.top >= 0 && b.bottom <= window.innerHeight;
    const go = () => {
      const b2 = tgt.getBoundingClientRect();
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
    if (visible) go(); else { tgt.closest('.progress-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(go, 420); }
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
    const legacyStyle = { logic: 'type', example: 'type', context: 'type', audio: 'listen' };
    if (!MODES.some(m => m.id === app.profile.mode)) app.profile.mode = legacyStyle[app.profile.style] || app.calibration?.mode || 'type';
    if (!DEPARTMENTS[app.profile.dept]) app.profile.dept = ({ biomedical: 'biyomedikal', prep: 'genel', general: 'genel' })[app.profile.goal] || 'genel';
    return q;
  }

  // ---- soru havuzları ----
  const subjectCache = {};
  function subjectItems(cat) {
    if (!subjectCache[cat]) subjectCache[cat] = SUBJECTS[cat].items.map((it, i) => ({
      id: `${cat}-${i}`, cat, q: it[0], a: it[1], opts: it[2], exp: it[3], src: it[4],
      lang: 'tr', optLang: 'tr', speak: { text: it[0], lang: 'tr' }, typeable: typeable(it[1]),
    }));
    return subjectCache[cat];
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
  function poolFor(cat) {
    if (cat === 'en') return [...englishItems(), ...vocabPool()];
    if (SUBJECTS[cat]) return subjectItems(cat);
    return [];
  }
  function findItem(id) {
    if (!id) return null;
    if (id.startsWith('en-')) return englishItems().find(x => x.id === id);
    if (id.startsWith('dv-')) { const dept = id.split('-')[1]; return vocabItems(dept).find(x => x.id === id); }
    const cat = id.split('-')[0];
    return SUBJECTS[cat] ? subjectItems(cat).find(x => x.id === id) : null;
  }

  // ---- seçim (aralıklı tekrar) ----
  function pickFrom(pool) {
    const q = Q(), now = Date.now(), recent = new Set(q.recent.slice(-6));
    const cand = pool.filter(it => !recent.has(it.id));
    const list = cand.length ? cand : pool;
    const due = list.filter(it => q.items[it.id] && q.items[it.id].due <= now).sort((x, y) => q.items[x.id].due - q.items[y.id].due);
    if (due.length && Math.random() < 0.7) return due[0];
    const unseen = list.filter(it => !q.items[it.id]);
    if (unseen.length) return unseen[Math.floor(Math.random() * Math.min(unseen.length, 8))];
    return list.slice().sort((x, y) => (q.items[x.id]?.due || 0) - (q.items[y.id]?.due || 0))[Math.floor(Math.random() * Math.min(3, list.length))];
  }
  function pickNext(cat) {
    if (cat === 'mix') {
      const cats = CATS.filter(c => c.id !== 'mix').map(c => c.id);
      const c = cats[Math.floor(Math.random() * cats.length)];
      return pickNext(c);
    }
    if (cat === 'en') {
      const usePool = Math.random() < 0.5 ? vocabPool() : englishItems();
      return pickFrom(usePool.length ? usePool : poolFor('en'));
    }
    return pickFrom(poolFor(cat));
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
    const mode = A().profile.mode;
    if (cat === 'en' && mode === 'type' && c && !c.legacy && !c.done) c = q.cur[cat] = { legacy: true };
    if (cat === 'en' && mode !== 'type' && mode !== 'mix' && c?.legacy) c = q.cur[cat] = newCur(cat);
    if (!c || (!c.legacy && !findItem(c.id))) c = q.cur[cat] = newCur(cat);
    return c;
  }

  // ---- XP ----
  function catXp(cat) { return cat === 'en' ? A().xp : (Q().catXp[cat] || 0); }
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
    if (cat === 'en') { h1.textContent = 'İngilizceyi çöz.'; p.textContent = 'Aynı anlamı farklı seviyelerde söyle, bölümüne özel ileri seviye terimleri öğren.'; }
    else if (cat === 'mix') { h1.textContent = 'Karışık pop quiz.'; p.textContent = 'Her soru farklı bir konudan gelir. Doğru da bilsen yanlış da, açıklamayı oku: asıl öğrenme orada.'; }
    else { h1.textContent = `${c.label} pop quiz.`; p.textContent = 'Seç ya da yaz; her cevaptan sonra güvenilir kaynaklara dayanan ayrıntılı açıklama gelir.'; }
  }
  function renderTabs() {
    const box = $('#catTabs'); if (!box) return;
    const cat = A().cat;
    box.innerHTML = CATS.map(c => `<button role="tab" class="cat-tab${c.id === cat ? ' on' : ''}" data-cat="${c.id}" aria-selected="${c.id === cat}"><span>${c.icon}</span>${esc(c.label)}</button>`).join('');
    const on = box.querySelector('.on'); if (on) on.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
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

  function optionText(item, idx) { return idx === 0 ? item.a : item.opts[idx - 1]; }
  function render({ speak = false } = {}) {
    const app = A(), cat = app.cat;
    headline(); renderTabs(); renderModeBtn();
    const c = cur(cat);
    if (c.legacy) { showLegacy(true); core.renderLegacy(); core.renderProgress(); notifyLive(null); return; }
    showLegacy(false);
    const item = findItem(c.id), q = Q();
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
        if (c.done) { if (idx === 0) cls += ' right'; else if (c.choice === idx) cls += ' wrong'; else cls += ' dim'; }
        const speakBtn = (c.style === 'listen' || item.optLang === 'en') ? `<span class="opt-say" role="button" tabindex="0" data-say="${k}" aria-label="Seçeneği dinle">🔊</span>` : '';
        return `<button class="${cls}" data-opt="${idx}" ${c.done ? 'aria-disabled="true"' : ''}><span class="opt-key">${'ABCD'[k]}</span><span class="opt-text" lang="${item.optLang}">${esc(text)}</span>${speakBtn}</button>`;
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
        + `<p class="qx-body">${esc(item.exp)}</p>` + ladder
        + (item.example ? `<button class="mini-btn qx-say" data-say-example="1">▶ Örnek cümleyi dinle</button>` : '')
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
    }).join('');
    $('#qzSlots').innerHTML = html;
    const left = MAX_TRIES - (c.tries || 0);
    $('#qzTries').textContent = c.done ? '' : `${left} deneme hakkın var · ipucu ${c.hints.length}/${maxHints(item)}`;
    $('#qzHint').disabled = c.done || c.hints.length >= maxHints(item);
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
    const free = slotPositions(item).filter(i => !c.hints.includes(i));
    // yazılmış harfleri koru: ipucunu yazılmamış kısımdan ver
    const typedLen = [...(c.typed || '')].length;
    const pick = free.slice(typedLen)[Math.floor(Math.random() * Math.max(1, free.length - typedLen))] ?? free[free.length - 1];
    if (pick == null) return;
    c.hints.push(pick); c.hints.sort((a, b) => a - b);
    c.typed = [...(c.typed || '')].slice(0, freeSlotCount(item, c)).join('');
    $('#qzInput').value = c.typed;
    c.fb = 'İpucu: bir harf açıldı. İpucuyla bulunan cevap daha az XP kazandırır.'; c.fbType = 'hint';
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
      const delta = c.hints.length ? XP.typeHinted : XP.type;
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
    flyXp(src, c.delta, { onLand: () => { core.unfreezeXp(); frozen = null; core.renderProgress(); } })
      .then(() => { if (rewardNow) core.showRewardPopup(c.delta); });
  }
  function next({ speak = true } = {}) {
    const cat = A().cat, q = Q();
    q.cur[cat] = newCur(cat);
    core.saveLocal(false);
    render({ speak });
    $('#quizCard')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
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
    const b = e.target.closest('[data-opt]'); if (!b) return;
    if (!c.revealed && c.style === 'listen') c.revealed = true;
    choose(+b.dataset.opt, b);
  });
  $('#qzListen').addEventListener('click', () => { const c = cur(); if (c.legacy) return; sayItem(findItem(c.id)); });
  $('#qzReveal').addEventListener('click', () => { const c = cur(); c.revealed = true; render(); });
  $('#qzNext').addEventListener('click', () => next());
  $('#qzExplain').addEventListener('click', e => { if (e.target.closest('[data-say-example]')) { const c = cur(), item = findItem(c.id); if (item?.example) core.speak(item.example, 'en'); } });
  const input = $('#qzInput');
  $('#qzSlots').addEventListener('click', () => { try { input.focus({ preventScroll: true }); } catch {} });
  input.addEventListener('compositionstart', () => { composing = true; });
  input.addEventListener('compositionend', () => { composing = false; onTypedInput(); });
  input.addEventListener('input', onTypedInput);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submitTyped(); } });
  $('#qzHint').addEventListener('click', giveHint);
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
    resetDeptCache() { Object.keys(vocabCache).forEach(k => delete vocabCache[k]); const q = Q(); if (q.cur.en && !q.cur.en.legacy && String(q.cur.en.id).startsWith('dv-') && !q.cur.en.done) q.cur.en = newCur('en'); },
  };
}
