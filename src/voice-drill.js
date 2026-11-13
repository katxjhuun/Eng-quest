// Sesli tekrar (telepromter): doğru cevaplanan sorunun tam cümlesini kullanıcı mikrofonla 5 kez söyler.
// Söylenen kelimeler anında renklenir. Okumadan geçilen (aşırı hızlı) veya anlaşılmayan tekrarlar sayılmaz (hile engeli).
// Motor: Android/iOS uygulamasında @capacitor-community/speech-recognition, tarayıcıda Web Speech API.
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
export const DRILL_REPS = 5;
const MAX_WPS = 4.5;       // saniyede en çok kelime (ölçüm cömert: tanıyıcı gecikmesi eklenir). Akıcı konuşma ölçümde ~2.5–3.5 çıkar
const SPEED_MIN_WORDS = 6; // kısa cümlelerde zaman ölçümü güvenilmez: hız denetimi yapılmaz
const LEAD_MS = 1500;      // tanıyıcı ilk kelimeyi geç ve toplu bildirir: konuşma bu kadar önce başlamış sayılır
const MIN_COVER = 0.7;     // cümle sonuna ulaşıldıysa kelimelerin en az %70'i yeter
const FULL_COVER = 0.9;    // sona ulaşılmasa da %90 anlaşıldıysa sayılır
const COOLDOWN_MS = 2000;  // her tekrardan sonra mikrofon tamamen kapanıp yeniden hazırlanır (eski ses/sonuç karışmasın)

// ---- metni karşılaştırılabilir kelime dizisine çevir (iki taraf da aynı yoldan geçer) ----
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function numWords(n) {
  if (n < 20) return [ONES[n]];
  if (n < 100) return [TENS[Math.floor(n / 10)], ...(n % 10 ? [ONES[n % 10]] : [])];
  if (n < 1000) return [ONES[Math.floor(n / 100)], 'hundred', ...(n % 100 ? numWords(n % 100) : [])];
  if (n < 10000) return [...numWords(Math.floor(n / 1000)), 'thousand', ...(n % 1000 ? numWords(n % 1000) : [])];
  return [String(n)];
}
const CONTR = [[/\b(i)'m\b/g, '$1 am'], [/\b(it|he|she|that|what|there|here|who|where|how)'s\b/g, '$1 is'], [/\bcan't\b/g, 'can not'], [/\bwon't\b/g, 'will not'], [/\bshan't\b/g, 'shall not'],
  [/n't\b/g, ' not'], [/'re\b/g, ' are'], [/'ve\b/g, ' have'], [/'ll\b/g, ' will'], [/'d\b/g, ' would'],
  // tanıyıcı kesme işaretini yutabilir: im, dont, theyre …
  [/\bim\b/g, 'i am'], [/\b(do|does|did|is|are|was|were|has|have|had|could|would|should|must)nt\b/g, '$1 not'], [/\bcant\b/g, 'can not'], [/\b(you|we|they)re\b/g, '$1 are'], [/\b(i|you|we|they)ve\b/g, '$1 have'], [/\b(it|that|what|there|he|she)s\b/g, '$1 is'],
  [/\bgonna\b/g, 'going to'], [/\bwanna\b/g, 'want to'], [/\bgotta\b/g, 'got to']];
function tokens(text) {
  let t = String(text).toLowerCase().replace(/[’‘`´]/g, "'").replace(/&/g, ' and ').replace(/%/g, ' percent ').replace(/(\d),(\d{3})/g, '$1$2');
  for (const [re, to] of CONTR) t = t.replace(re, to);
  const out = [];
  for (let w of t.split(/[\s\-–—\/]+/)) {
    w = w.replace(/[^a-z0-9']/g, '').replace(/'/g, '');
    if (!w) continue;
    if (/^\d+$/.test(w)) out.push(...numWords(+w)); else out.push(w);
  }
  return out;
}
function sim(a, b) { // 0..1 benzerlik (küçük yazım/tanıma farkları için)
  if (a === b) return 1; if (!a || !b) return 0;
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[m][n] / Math.max(m, n);
}
const stem = w => w.length > 4 ? w.replace(/(ing|ed|es|s)$/, '') : w.replace(/s$/, '');
function same(a, b) {
  if (a === b) return true;
  if (stem(a) === stem(b)) return true;                 // car/cars, walk/walked
  const L = Math.min(a.length, b.length);
  if (L >= 3 && sim(a, b) >= (L >= 6 ? 0.7 : 0.66)) return true; // tanıyıcının küçük harf hataları
  return false;
}
// tanınan kelimeleri hedefe sırayla eşle (aradaki kaçan/fazla kelimeleri atla) → eşleşen hedef indeksleri
function align(targets, spoken) {
  const hit = new Set(); let p = 0;
  for (const s of spoken) {
    for (let k = p; k < Math.min(targets.length, p + 5); k++) if (same(targets[k], s)) { hit.add(k); p = k + 1; break; }
  }
  return { hit, last: p };
}

function nativePlugin() { try { return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('SpeechRecognition') ? SpeechRecognition : null; } catch { return null; } }
const WebSR = () => window.SpeechRecognition || window.webkitSpeechRecognition || null;
export function drillSupport() {
  if (nativePlugin()) return 'native';
  if (Capacitor.isNativePlatform()) return 'needs-update'; // yeni APK gerekir
  return WebSR() ? 'web' : 'none';
}

export function mountDrill(root, text, { start = 0, onProgress, onComplete, lang = 'en-US' } = {}) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const targets = [], owner = []; // her hedef kelimenin ekrandaki kelime indeksi
  words.forEach((w, i) => tokens(w).forEach(t => { targets.push(t); owner.push(i); }));
  const total = targets.length || 1;
  let busy = false, count = Math.min(start, DRILL_REPS), active = false, stopped = false, rec = null, repStart = 0, tFirst = 0, updates = 0, hits = new Set(), listeners = [], cooling = false, coolT = 0, tickT = 0;
  const support = drillSupport();
  root.innerHTML = `<div class="dr-head"><b>🎤 Sesli tekrar</b><span class="dr-count"></span></div>
    <p class="dr-text" lang="en">${words.map((w, i) => `<span class="dw" data-i="${i}">${w.replace(/[<>&]/g, '')}</span>`).join(' ')}</p>
    <div class="dr-msg" role="status"></div>
    <div class="dr-row"><button type="button" class="primarybtn dr-go">🎤 Başla</button></div>`;
  const $c = root.querySelector('.dr-count'), $m = root.querySelector('.dr-msg'), $b = root.querySelector('.dr-go'), spans = [...root.querySelectorAll('.dw')];
  const say = (t, cls = '') => { $m.textContent = t; $m.className = 'dr-msg ' + cls; };
  const paint = () => { const on = new Set([...hits].map(k => owner[k])); spans.forEach((s, i) => s.classList.toggle('on', on.has(i))); };
  const dots = () => { $c.innerHTML = Array.from({ length: DRILL_REPS }, (_, i) => `<i class="${i < count ? 'on' : ''}"></i>`).join('') + ` <small>${count}/${DRILL_REPS}</small>`; };
  dots();
  if (count >= DRILL_REPS) { say('✅ 5 tekrar tamam!', 'ok'); $b.classList.add('hidden'); }
  if (support === 'none' || support === 'needs-update') {
    $b.disabled = true;
    const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    say(support === 'needs-update' ? (ios ? '🎤 Mikrofon için uygulamanın yeni iPhone sürümünü (IPA) kurman gerekiyor.' : '🎤 Mikrofon için uygulamanın yeni sürümünü (APK) kurman gerekiyor.')
      : ios ? '🎤 iPhone’da ana ekrana eklenen web sürümü mikrofonla tanımayı desteklemiyor. Uygulamanın iPhone sürümünü (IPA) kur ya da Safari’de aç.' : '🎤 Bu tarayıcı mikrofonla tanımayı desteklemiyor (Chrome kullan).', 'warn');
  }

  // birden çok tanıma adayı gelir: hedefe en çok uyanı kullan
  function handle(candidates) {
    if (cooling) return; // hazırlık süresinde gelen (önceki tekrara ait) sonuçlar yok sayılır
    let best = null;
    for (const c of candidates) {
      const spoken = tokens(c); if (!spoken.length) continue;
      const r = align(targets, spoken);
      if (!best || r.hit.size > best.hit.size || (r.hit.size === best.hit.size && r.last > best.last)) best = r;
    }
    if (!best) return;
    const now = performance.now();
    if (best.hit.size) { if (!tFirst) tFirst = now; updates++; }
    best.hit.forEach(i => hits.add(i)); paint();
    const cover = hits.size / total, reachedEnd = hits.has(total - 1) || (total >= 6 && hits.has(total - 2)); // son kelime(ler) söylenmeli
    if ((reachedEnd && cover >= MIN_COVER) || cover >= FULL_COVER) finishRep(now);
  }
  function finishRep(now) {
    // konuşmanın başı: ilk kelime bildiriminden biraz önce (tanıyıcı gecikmesi), ama bu tekrarın dinlemesi başlamadan önce değil
    // tanıyıcı ara sonuç göndermediyse (yalnız son sonuç) ilk bildirim zamanı güvenilmez: mikrofonun açıldığı an esas alınır
    const begun = updates >= 3 ? Math.max(repStart, tFirst - LEAD_MS) : (repStart || now - LEAD_MS);
    const dur = Math.max(0.3, (now - begun) / 1000), wps = words.length / dur;
    hits = new Set(); tFirst = 0; updates = 0;
    if (words.length >= SPEED_MIN_WORDS && wps > MAX_WPS) { cooldown('⚠️ Çok hızlı geçtin. Doğal hızınla, tam söyle. Bu tekrar sayılmadı.', 'warn'); return; }
    count++; dots(); onProgress?.(count);
    if (count >= DRILL_REPS) { setTimeout(paint, 500); halt(); say('✅ 5 tekrar tamam! Aferin.', 'ok'); $b.classList.add('hidden'); onComplete?.(); return; }
    cooldown(`✔ ${count}. tekrar sayıldı.`, 'ok');
  }
  // tekrar arası 2 sn: mikrofon kapanır, eski sonuçlar temizlenir, geri sayımdan sonra temiz bir dinleme başlar
  async function cooldown(msg, cls) {
    cooling = true; clearTimeout(coolT); clearInterval(tickT);
    hits = new Set(); tFirst = 0; updates = 0;
    const until = performance.now() + COOLDOWN_MS;
    const draw = () => { const left = Math.max(0, Math.ceil((until - performance.now()) / 1000));
      $m.className = 'dr-msg ' + cls; $m.innerHTML = `${msg} <span class="dr-cd">🎤 Mikrofon hazırlanıyor… ${left}</span><span class="dr-cdbar" style="animation-duration:${COOLDOWN_MS}ms"></span>`; };
    draw(); tickT = setInterval(draw, 250);
    await cleanup();
    coolT = setTimeout(() => {
      clearInterval(tickT); cooling = false; repStart = 0; paint();
      if (!active || stopped) return;
      say('🎤 Hazır! Şimdi cümleyi tekrar söyle.', 'go'); begin();
    }, Math.max(0, until - performance.now()));
  }

  // ---- motor ----
  async function begin() {
    if (stopped || busy || cooling || count >= DRILL_REPS) return;
    busy = true;
    if (!repStart) repStart = performance.now(); // motor yeniden başlasa da tekrarın başlangıcı korunur
    const N = nativePlugin();
    try {
      if (N) {
        const perm = await N.requestPermissions?.();
        if (perm && perm.speechRecognition && perm.speechRecognition !== 'granted') { say('🎤 Mikrofon izni verilmedi.', 'warn'); halt(); return; }
        listeners.forEach(x => { try { x.remove(); } catch {} }); listeners = []; // yeniden başlarken dinleyiciler çoğalmasın
        const l = await N.addListener('partialResults', e => { if (!active) return; handle([].concat(e.matches || e.value || [])); });
        listeners.push(l);
        const l2 = await N.addListener('listeningState', e => { if (active && !cooling && e.status === 'stopped' && !stopped) setTimeout(() => active && !cooling && begin(), 250); });
        listeners.push(l2);
        await N.start({ language: lang, maxResults: 5, partialResults: true, popup: false });
      } else {
        const SR = WebSR(); rec = new SR(); rec.lang = lang; rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 5;
        rec.onresult = e => { if (!active) return; const alts = [];
          for (let k = 0; k < 5; k++) { let t = ''; for (let i = 0; i < e.results.length; i++) { const r = e.results[i]; t += (r[Math.min(k, r.length - 1)]?.transcript || '') + ' '; } alts.push(t); }
          handle(alts); };
        rec.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { say('🎤 Mikrofon izni verilmedi.', 'warn'); halt(); } };
        rec.onend = () => { if (active && !cooling && !stopped) setTimeout(() => { if (active && !cooling) begin(); }, 200); };
        rec.start();
      }
    } catch (e) { say('🎤 Mikrofon açılamadı: ' + (e?.message || e), 'warn'); halt(); }
    finally { busy = false; }
  }
  async function cleanup() {
    const N = nativePlugin();
    try { if (N) { await N.stop?.(); } else rec?.stop(); } catch {}
    listeners.forEach(l => { try { l.remove(); } catch {} }); listeners = []; rec = null;
  }
  function halt() { active = false; cooling = false; clearTimeout(coolT); clearInterval(tickT); cleanup(); $b.textContent = count ? '🎤 Devam et' : '🎤 Başla'; }
  $b.addEventListener('click', () => {
    if (active) { halt(); say('Durduruldu.'); return; }
    active = true; hits = new Set(); tFirst = 0; updates = 0; repStart = 0; paint(); $b.textContent = '⏹ Durdur';
    say('Dinliyorum… cümleyi okurken kelimeler renklenecek.'); begin();
  });
  return { stop() { stopped = true; active = false; clearTimeout(coolT); clearInterval(tickT); cleanup(); }, get count() { return count; } };
}
