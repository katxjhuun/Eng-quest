// Sesli tekrar (telepromter): doğru cevaplanan sorunun tam cümlesini kullanıcı mikrofonla 5 kez söyler.
// Söylenen kelimeler anında renklenir. Çok hızlı veya anlaşılmayan tekrarlar sayılmaz (hile engeli).
// Motor: Android/iOS uygulamasında @capacitor-community/speech-recognition, tarayıcıda Web Speech API.
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
export const DRILL_REPS = 5;
const MAX_WPS = 4.0;       // saniyede en çok kelime: bunun üstü "çok hızlı" sayılır
const MIN_MATCH = 0.85;    // kelimelerin en az bu oranı sırayla anlaşılmalı
const LATENCY = 0.6;       // tanıyıcının ilk kelimeyi geç bildirmesi için pay (sn)

const norm = w => String(w).toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z0-9']/g, '');
function sim(a, b) { // 0..1 benzerlik (küçük yazım/tanıma farkları için)
  if (a === b) return 1; if (!a || !b) return 0;
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[m][n] / Math.max(m, n);
}
const same = (a, b) => a === b || (a.length > 3 && b.length > 3 && sim(a, b) >= 0.8);

function nativePlugin() { try { return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('SpeechRecognition') ? SpeechRecognition : null; } catch { return null; } }
const WebSR = () => window.SpeechRecognition || window.webkitSpeechRecognition || null;
export function drillSupport() {
  if (nativePlugin()) return 'native';
  if (Capacitor.isNativePlatform()) return 'needs-update'; // yeni APK gerekir
  return WebSR() ? 'web' : 'none';
}

// tanınan cümleyi hedef kelimelere sırayla eşle → eşleşen indeksler kümesi
function align(targets, spoken) {
  const hit = new Set(); let p = 0;
  for (const s of spoken) {
    for (let k = p; k < Math.min(targets.length, p + 3); k++) if (same(targets[k], s)) { hit.add(k); p = k + 1; break; }
  }
  return { hit, last: p };
}

export function mountDrill(root, text, { start = 0, onProgress, onComplete, lang = 'en-US' } = {}) {
  const words = String(text).split(/\s+/).filter(Boolean), targets = words.map(norm);
  const total = targets.filter(Boolean).length || 1;
  let busy = false, count = Math.min(start, DRILL_REPS), active = false, stopped = false, rec = null, sessionStart = 0, tFirst = 0, hits = new Set(), listeners = [];
  const support = drillSupport();
  root.innerHTML = `<div class="dr-head"><b>🎤 Sesli tekrar</b><span class="dr-count"></span></div>
    <p class="dr-text" lang="en">${words.map((w, i) => `<span class="dw" data-i="${i}">${w.replace(/[<>&]/g, '')}</span>`).join(' ')}</p>
    <div class="dr-msg" role="status"></div>
    <div class="dr-row"><button type="button" class="primarybtn dr-go">🎤 Başla</button></div>`;
  const $c = root.querySelector('.dr-count'), $m = root.querySelector('.dr-msg'), $b = root.querySelector('.dr-go'), spans = [...root.querySelectorAll('.dw')];
  const say = (t, cls = '') => { $m.textContent = t; $m.className = 'dr-msg ' + cls; };
  const paint = () => { spans.forEach((s, i) => s.classList.toggle('on', hits.has(i))); };
  const dots = () => { $c.innerHTML = Array.from({ length: DRILL_REPS }, (_, i) => `<i class="${i < count ? 'on' : ''}"></i>`).join('') + ` <small>${count}/${DRILL_REPS}</small>`; };
  dots();
  if (count >= DRILL_REPS) { say('✅ 5 tekrar tamam!', 'ok'); $b.classList.add('hidden'); }
  if (support === 'none' || support === 'needs-update') {
    $b.disabled = true;
    say(support === 'needs-update' ? '🎤 Mikrofon için uygulamanın yeni sürümünü (APK) kurman gerekiyor.' : '🎤 Bu tarayıcı mikrofonla tanımayı desteklemiyor (Chrome kullan).', 'warn');
  }

  function handle(spokenText) {
    const spoken = String(spokenText).split(/\s+/).map(norm).filter(Boolean);
    if (!spoken.length) return;
    const now = performance.now();
    if (!tFirst) tFirst = now;
    const { hit, last } = align(targets, spoken);
    hit.forEach(i => hits.add(i)); paint();
    const matched = hits.size / total;
    if (last >= targets.length - 1 && matched >= MIN_MATCH) finishRep(now);
  }
  function finishRep(now) {
    const dur = Math.max(0.01, (now - tFirst) / 1000 + LATENCY), wps = total / dur;
    hits = new Set(); const wasFast = wps > MAX_WPS; tFirst = 0;
    if (wasFast) { say('⚠️ Çok hızlı! Cümleyi normal hızda, net söyle. Bu tekrar sayılmadı.', 'warn'); setTimeout(paint, 700); restart(); return; }
    count++; dots(); onProgress?.(count);
    setTimeout(paint, 500);
    if (count >= DRILL_REPS) { halt(); say('✅ 5 tekrar tamam! Aferin.', 'ok'); $b.classList.add('hidden'); onComplete?.(); return; }
    say(`✔ ${count}. tekrar sayıldı. Devam et!`, 'ok'); restart();
  }

  // ---- motor ----
  async function begin() {
    if (stopped || busy || count >= DRILL_REPS) return;
    busy = true;
    sessionStart = performance.now(); tFirst = 0;
    const N = nativePlugin();
    try {
      if (N) {
        const perm = await N.requestPermissions?.();
        if (perm && perm.speechRecognition && perm.speechRecognition !== 'granted') { say('🎤 Mikrofon izni verilmedi.', 'warn'); halt(); return; }
        const l = await N.addListener('partialResults', e => { if (!active) return; handle((e.matches || e.value || [])[0] || ''); });
        listeners.push(l);
        const l2 = await N.addListener('listeningState', e => { if (active && e.status === 'stopped' && !stopped) setTimeout(() => active && begin(), 250); });
        listeners.push(l2);
        await N.start({ language: lang, maxResults: 1, partialResults: true, popup: false });
      } else {
        const SR = WebSR(); rec = new SR(); rec.lang = lang; rec.continuous = true; rec.interimResults = true;
        rec.onresult = e => { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript + ' '; if (active) handle(t); };
        rec.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { say('🎤 Mikrofon izni verilmedi.', 'warn'); halt(); } };
        rec.onend = () => { if (active && !stopped) setTimeout(() => { if (active) begin(); }, 200); };
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
  async function restart() { await cleanup(); if (active && !stopped) setTimeout(begin, 150); }
  function halt() { active = false; cleanup(); $b.textContent = count ? '🎤 Devam et' : '🎤 Başla'; }
  $b.addEventListener('click', () => {
    if (active) { halt(); say('Durduruldu.'); return; }
    active = true; hits = new Set(); paint(); $b.textContent = '⏹ Durdur';
    say('Dinliyorum… cümleyi okurken kelimeler renklenecek.'); begin();
  });
  return { stop() { stopped = true; active = false; cleanup(); }, get count() { return count; } };
}
