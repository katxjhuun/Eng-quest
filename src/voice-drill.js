// Sesli tekrar (telepromter): doğru cevaplanan sorunun tam cümlesini kullanıcı mikrofonla 5 kez söyler.
// Söylenen kelimeler anında renklenir. Her tekrardan sonra 2 sn'lik yarı saydam sayaç çıkar; mikrofon açık kalır, sıradaki okumaya hazırlanır.
// Motor: Android/iOS uygulamasında @capacitor-community/speech-recognition, tarayıcıda Web Speech API.
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
export const DRILL_REPS = 5;
const MIN_COVER = 0.6;     // cümle sonuna ulaşıldıysa kelimelerin %60'ı yeter
const FULL_COVER = 0.85;   // sona ulaşılmasa da %85 anlaşıldıysa sayılır
const PAUSE_MS = 2000;     // tekrar arası yarı saydam sayaç (mikrofon kapanmaz; eski sonuçlar atlanır)

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
  if (WebSR() && !iosStandalone()) return 'web';
  // konuşma tanıma yoksa (ör. iPhone'da ana ekrana eklenen uygulama): mikrofonun ses düzeyiyle sesli tekrar
  return navigator.mediaDevices?.getUserMedia && (window.AudioContext || window.webkitAudioContext) ? 'vad' : 'none';
}
// iPhone'da ana ekrandan açılan web uygulamasında webkitSpeechRecognition görünür ama çalışmaz (Apple kısıtı)
function iosStandalone() {
  const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return ios && (navigator.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches);
}
// ---- ses düzeyi modu (VAD): kelime tanımaz; cümlenin yüksek sesle, uygun sürede ve doğal hızda söylendiğini ölçer ----
const VAD = { secPerWord: 0.3, minVoiced: 0.5, endSilence: 750, minRms: 0.012 };

export function mountDrill(root, text, { start = 0, onProgress, onComplete, lang = 'en-US' } = {}) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const targets = [], owner = []; // her hedef kelimenin ekrandaki kelime indeksi
  words.forEach((w, i) => tokens(w).forEach(t => { targets.push(t); owner.push(i); }));
  const total = targets.length || 1;
  let busy = false, count = Math.min(start, DRILL_REPS), active = false, stopped = false, rec = null, hits = new Set(), listeners = [], pausing = false, pauseT = 0, tickT = 0;
  // mikrofon tekrarlar arasında açık kalır: önceki okumanın sonuçlarını atlamak için taban noktaları
  let listening = false, webBase = 0, webLen = 0, natSkip = 0, natLast = [];
  const support = drillSupport();
  root.classList.add('dr-root');
  root.innerHTML = `<div class="dr-head"><b>🎤 Sesli tekrar</b><span class="dr-count"></span></div>
    <p class="dr-text" lang="en">${words.map((w, i) => `<span class="dw" data-i="${i}">${w.replace(/[<>&]/g, '')}</span>`).join(' ')}</p>
    <div class="dr-msg" role="status"></div>
    <div class="dr-row"><button type="button" class="primarybtn dr-go">🎤 Başla</button></div>
    <div class="dr-ov hidden" aria-hidden="true"><div class="dr-ov-ring"><b class="dr-ov-n">2</b></div><div class="dr-ov-t"></div><div class="dr-ov-s">Sıradaki okumaya hazırlan…</div></div>`;
  const $c = root.querySelector('.dr-count'), $m = root.querySelector('.dr-msg'), $b = root.querySelector('.dr-go'), spans = [...root.querySelectorAll('.dw')];
  const $ov = root.querySelector('.dr-ov'), $ovN = root.querySelector('.dr-ov-n'), $ovT = root.querySelector('.dr-ov-t'), $ring = root.querySelector('.dr-ov-ring');
  const say = (t, cls = '') => { $m.textContent = t; $m.className = 'dr-msg ' + cls; };
  const paint = () => { const on = new Set([...hits].map(k => owner[k])); spans.forEach((s, i) => s.classList.toggle('on', on.has(i))); };
  const dots = () => { $c.innerHTML = Array.from({ length: DRILL_REPS }, (_, i) => `<i class="${i < count ? 'on' : ''}"></i>`).join('') + ` <small>${count}/${DRILL_REPS}</small>`; };
  dots();
  if (count >= DRILL_REPS) { say('✅ 5 tekrar tamam!', 'ok'); $b.classList.add('hidden'); }
  if (support === 'none' || support === 'needs-update') {
    $b.disabled = true;
    say(support === 'needs-update' ? '🎤 Mikrofon için uygulamanın yeni sürümünü kurman gerekiyor.' : '🎤 Bu tarayıcı mikrofonu desteklemiyor.', 'warn');
  }

  // birden çok tanıma adayı gelir: hedefe en çok uyanı kullan
  function handle(candidates) {
    if (pausing) return; // sayaç sırasında gelen sonuçlar sayılmaz
    let best = null;
    for (const c of candidates) {
      const spoken = typeof c === 'string' ? tokens(c) : c; if (!spoken.length) continue;
      const r = align(targets, spoken);
      if (!best || r.hit.size > best.hit.size || (r.hit.size === best.hit.size && r.last > best.last)) best = r;
    }
    if (!best) return;
    best.hit.forEach(i => hits.add(i)); paint();
    const cover = hits.size / total, reachedEnd = hits.has(total - 1) || (total >= 6 && hits.has(total - 2));
    if ((reachedEnd && cover >= MIN_COVER) || cover >= FULL_COVER) finishRep();
  }
  function finishRep() {
    hits = new Set();
    count++; dots(); onProgress?.(count);
    if (count >= DRILL_REPS) { setTimeout(paint, 500); halt(); say('✅ 5 tekrar tamam! Aferin.', 'ok'); $b.classList.add('hidden'); onComplete?.(); return; }
    pause(`✔ ${count}. tekrar sayıldı`);
  }
  // tekrar arası: büyük yarı saydam 2 sn sayaç; mikrofon açık kalır, sayaç bitince önceki sonuçlar atlanır
  function pause(msg) {
    pausing = true; clearTimeout(pauseT); clearInterval(tickT);
    if (support === 'vad') stopVad();
    const until = performance.now() + PAUSE_MS;
    $ovT.textContent = msg; $ring.style.animation = 'none'; void $ring.offsetWidth; $ring.style.animation = `drRing ${PAUSE_MS}ms linear forwards`;
    const draw = () => { $ovN.textContent = Math.max(1, Math.ceil((until - performance.now()) / 1000)); };
    draw(); tickT = setInterval(draw, 100);
    $ov.classList.remove('hidden');
    say(msg, 'ok');
    pauseT = setTimeout(() => {
      clearInterval(tickT); $ov.classList.add('hidden');
      // önceki okumanın sonuçlarını atla
      webBase = webLen; natSkip = natLast.reduce((m, c) => Math.max(m, tokens(c).length), 0);
      hits = new Set(); paint(); pausing = false;
      if (!active || stopped) return;
      say('🎤 Hazır! Şimdi cümleyi baştan oku.', 'go');
      if (support === 'vad' || !listening) begin();
    }, PAUSE_MS);
  }

  // ---- ses düzeyi motoru ----
  let vad = null;
  async function startVad() {
    if (!vad?.stream) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      const AC = window.AudioContext || window.webkitAudioContext, ctx = new AC();
      const src = ctx.createMediaStreamSource(stream), an = ctx.createAnalyser(); an.fftSize = 1024; src.connect(an);
      vad = { stream, ctx, an, buf: new Float32Array(an.fftSize), floor: 0, raf: 0 };
    }
    if (vad.ctx.state === 'suspended') await vad.ctx.resume();
    const expect = Math.max(1.2, words.length * VAD.secPerWord); // bu cümle doğal hızda yaklaşık bu kadar sürer
    let calib = performance.now() + 350, floorSum = 0, floorN = 0, voiced = 0, first = 0, lastVoice = 0, prev = performance.now();
    const loop = now => {
      if (!vad || pausing || !active) return;
      vad.an.getFloatTimeDomainData(vad.buf); let e = 0; for (const x of vad.buf) e += x * x; const rms = Math.sqrt(e / vad.buf.length);
      const dt = (now - prev) / 1000; prev = now;
      if (now < calib) { floorSum += rms; floorN++; }
      else {
        if (!vad.floor) vad.floor = floorN ? floorSum / floorN : 0.005;
        const on = rms > Math.max(VAD.minRms, vad.floor * 2.6);
        if (on) { if (!first) first = now; voiced += dt; lastVoice = now; }
        else if (!first) vad.floor = vad.floor * 0.98 + rms * 0.02; // sessizken gürültü tabanını izle
        const k = Math.min(total, Math.floor((voiced / expect) * total * 1.05)); // telepromter: süreye göre kelimeleri yak
        if (k !== hits.size) { hits = new Set(Array.from({ length: k }, (_, i) => i)); paint(); }
        if (first && now - lastVoice > VAD.endSilence) { // konuşma bitti
          if (voiced >= expect * VAD.minVoiced) { hits = new Set(); paint(); finishRep(); return; }
          if ((lastVoice - first) / 1000 > 0.25) say('🎤 Cümlenin tamamını yüksek sesle söyle.', 'warn');
          first = 0; voiced = 0; hits = new Set(); paint();
        }
      }
      vad.raf = requestAnimationFrame(loop);
    };
    say('🎤 Dinliyorum… cümleyi yüksek sesle söyle (bu cihazda ses düzeyiyle ölçülüyor).');
    vad.raf = requestAnimationFrame(loop);
  }
  function stopVad(full) {
    if (!vad) return; cancelAnimationFrame(vad.raf);
    if (full) { try { vad.stream.getTracks().forEach(t => t.stop()); vad.ctx.close(); } catch {} vad = null; }
  }

  // ---- motor ----
  async function begin() {
    if (stopped || busy || !active || count >= DRILL_REPS) return;
    busy = true;
    const N = nativePlugin();
    try {
      if (support === 'vad') { await startVad(); return; }
      if (N) {
        const perm = await N.requestPermissions?.();
        if (perm && perm.speechRecognition && perm.speechRecognition !== 'granted') { say('🎤 Mikrofon izni verilmedi.', 'warn'); halt(); return; }
        listeners.forEach(x => { try { x.remove(); } catch {} }); listeners = []; // yeniden başlarken dinleyiciler çoğalmasın
        natSkip = 0; natLast = []; // yeni oturum: sonuçlar sıfırdan gelir
        const l = await N.addListener('partialResults', e => {
          if (!active) return; natLast = [].concat(e.matches || e.value || []);
          handle(natLast.map(c => tokens(c).slice(natSkip)));
        });
        listeners.push(l);
        // Android konuşma bitince oturumu kapatır: açık tutmak için hemen yeniden başlat (sayaç sırasında da)
        const l2 = await N.addListener('listeningState', e => { if (e.status === 'stopped') { listening = false; if (active && !stopped) setTimeout(() => active && !listening && begin(), 150); } });
        listeners.push(l2);
        await N.start({ language: lang, maxResults: 5, partialResults: true, popup: false });
        listening = true;
      } else {
        const SR = WebSR(), r = new SR(); rec = r; r.lang = lang; r.continuous = true; r.interimResults = true; r.maxAlternatives = 5;
        webBase = 0; webLen = 0;
        r.onresult = e => { if (!active || rec !== r) return; webLen = e.results.length; const alts = [];
          for (let k = 0; k < 5; k++) { let t = ''; for (let i = webBase; i < e.results.length; i++) { const x = e.results[i]; t += (x[Math.min(k, x.length - 1)]?.transcript || '') + ' '; } alts.push(t); }
          handle(alts); };
        r.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { say('🎤 Mikrofon izni verilmedi.', 'warn'); halt(); } };
        r.onend = () => { if (rec !== r) return; listening = false; rec = null; if (active && !stopped) setTimeout(() => { if (active && !listening) begin(); }, 150); };
        r.start(); listening = true;
      }
    } catch (e) { say(e?.name === 'NotAllowedError' ? '🎤 Mikrofon izni verilmedi. Ayarlar’dan dam-la (ya da Safari) için mikrofona izin ver.' : '🎤 Mikrofon açılamadı: ' + (e?.message || e), 'warn'); halt(); }
    finally { busy = false; }
  }
  async function cleanup() {
    const N = nativePlugin(); listening = false;
    stopVad();
    const r = rec; rec = null;
    try { if (support === 'vad') {} else if (N) { await N.stop?.(); } else r?.stop(); } catch {}
    listeners.forEach(l => { try { l.remove(); } catch {} }); listeners = [];
  }
  function stopAll() { active = false; pausing = false; clearTimeout(pauseT); clearInterval(tickT); $ov.classList.add('hidden'); cleanup(); stopVad(true); }
  function halt() { stopAll(); $b.textContent = count ? '🎤 Devam et' : '🎤 Başla'; }
  $b.addEventListener('click', () => {
    if (active) { halt(); say('Durduruldu.'); return; }
    active = true; hits = new Set(); paint(); $b.textContent = '⏹ Durdur';
    say('Dinliyorum… cümleyi okurken kelimeler renklenecek.'); begin();
  });
  return { stop() { stopped = true; stopAll(); }, get count() { return count; } };
}
