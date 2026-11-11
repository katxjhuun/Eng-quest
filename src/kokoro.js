// Kokoro AI sesleri: istemci tarafı (iş parçacığı yönetimi, ses önbelleği, oynatma).
export const KOKORO_VOICES = [
  // [kimlik, ad, aksan, cinsiyet] — Kokoro'nun kalite sıralamasında üstte olanlar önce
  ['af_heart', 'Heart', 'Amerikan', 'Kadın'], ['af_bella', 'Bella', 'Amerikan', 'Kadın'],
  ['af_nicole', 'Nicole (fısıltılı)', 'Amerikan', 'Kadın'], ['af_aoede', 'Aoede', 'Amerikan', 'Kadın'],
  ['af_kore', 'Kore', 'Amerikan', 'Kadın'], ['af_sarah', 'Sarah', 'Amerikan', 'Kadın'],
  ['af_nova', 'Nova', 'Amerikan', 'Kadın'], ['af_alloy', 'Alloy', 'Amerikan', 'Kadın'],
  ['af_sky', 'Sky', 'Amerikan', 'Kadın'], ['af_jessica', 'Jessica', 'Amerikan', 'Kadın'], ['af_river', 'River', 'Amerikan', 'Kadın'],
  ['am_fenrir', 'Fenrir', 'Amerikan', 'Erkek'], ['am_michael', 'Michael', 'Amerikan', 'Erkek'],
  ['am_puck', 'Puck', 'Amerikan', 'Erkek'], ['am_echo', 'Echo', 'Amerikan', 'Erkek'], ['am_eric', 'Eric', 'Amerikan', 'Erkek'],
  ['am_liam', 'Liam', 'Amerikan', 'Erkek'], ['am_onyx', 'Onyx', 'Amerikan', 'Erkek'], ['am_adam', 'Adam', 'Amerikan', 'Erkek'], ['am_santa', 'Santa', 'Amerikan', 'Erkek'],
  ['bf_emma', 'Emma', 'İngiliz', 'Kadın'], ['bf_isabella', 'Isabella', 'İngiliz', 'Kadın'],
  ['bf_alice', 'Alice', 'İngiliz', 'Kadın'], ['bf_lily', 'Lily', 'İngiliz', 'Kadın'],
  ['bm_george', 'George', 'İngiliz', 'Erkek'], ['bm_fable', 'Fable', 'İngiliz', 'Erkek'],
  ['bm_lewis', 'Lewis', 'İngiliz', 'Erkek'], ['bm_daniel', 'Daniel', 'İngiliz', 'Erkek'],
].map(([id, name, accent, gender]) => ({ id: 'kokoro:' + id, voice: id, name, accent, gender }));

let worker = null, seq = 0;
const pending = new Map();
const listeners = new Set();
let state = { phase: (safeGet('dl-kokoro-ready') === '1') ? 'cached' : 'idle', progress: 0 };
function safeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function emit(patch) { state = { ...state, ...patch }; listeners.forEach(fn => { try { fn(state); } catch {} }); }
export function onKokoroState(fn) { listeners.add(fn); fn(state); return () => listeners.delete(fn); }
export function kokoroState() { return state; }

function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL('./vendor/kokoro-worker.js', document.baseURI), { type: 'module' });
  worker.onmessage = e => {
    const msg = e.data || {};
    if (msg.type === 'progress') { emit({ phase: 'downloading', progress: Math.round(msg.progress || 0) }); return; }
    const p = pending.get(msg.id); if (!p) return; pending.delete(msg.id);
    if (msg.type === 'error') p.reject(new Error(msg.message)); else p.resolve(msg);
  };
  worker.onerror = e => { emit({ phase: 'error', error: e.message || 'Ses motoru başlatılamadı' }); pending.forEach(p => p.reject(new Error('worker'))); pending.clear(); worker = null; };
  return worker;
}
function call(msg) {
  return new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); getWorker().postMessage({ ...msg, id }); });
}

export async function ensureKokoro() {
  if (state.phase === 'ready') return;
  emit({ phase: state.phase === 'cached' ? 'loading' : 'downloading', progress: state.progress || 0 });
  try {
    await call({ type: 'load' });
    try { localStorage.setItem('dl-kokoro-ready', '1'); } catch {}
    emit({ phase: 'ready', progress: 100 });
  } catch (err) { emit({ phase: 'error', error: err.message }); throw err; }
}

// ---- Üretilen ses önbelleği (IndexedDB) ----
function audioDb() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open('dl-kokoro-audio', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('wav');
    r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
  });
}
async function cacheGet(key) {
  try { const db = await audioDb(); return await new Promise(res => { const q = db.transaction('wav').objectStore('wav').get(key); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); }); } catch { return null; }
}
async function cachePut(key, blob) {
  try { const db = await audioDb(); db.transaction('wav', 'readwrite').objectStore('wav').put(blob, key); } catch {}
}
// ---- Üretim kuyruğu ----
// Telefonda bir cümlenin üretimi saniyeler sürer. İşler tek tek yapılır; kullanıcının bastığı ses kuyruğun en önüne geçer,
// bekleyen eski istekler ve önceden hazırlama (prefetch) işleri atılır. Prefetch yalnızca kuyruk boşken eklenir.
const jobs = new Map(); // key -> { key, text, voice, speed, promise, resolve, reject, prio }
const queue = []; let running = null;
function enqueue(text, voice, speed, prio) {
  const key = `${voice}|${speed.toFixed(2)}|${text}`;
  let job = jobs.get(key);
  if (!job) {
    job = { key, text, voice, speed, prio };
    job.promise = new Promise((res, rej) => { job.resolve = res; job.reject = rej; });
    job.promise.catch(() => {});
    jobs.set(key, job);
  } else if (prio > job.prio) job.prio = prio;
  if (running !== job) {
    const i = queue.indexOf(job); if (i >= 0) queue.splice(i, 1);
    if (prio > 0) {
      // kullanıcı isteği: bekleyen diğer işleri at, bunu öne al
      queue.splice(0).forEach(j => { jobs.delete(j.key); j.reject(new Error('iptal')); });
      queue.unshift(job);
    } else queue.push(job);
  }
  pump();
  return job.promise;
}
async function pump() {
  if (running || !queue.length) return;
  const job = running = queue.shift();
  try {
    await ensureKokoro();
    const { wav } = await call({ type: 'speak', text: job.text, voice: job.voice, speed: job.speed });
    const blob = new Blob([wav], { type: 'audio/wav' });
    cachePut(job.key, blob);
    job.resolve(blob);
  } catch (e) { job.reject(e); }
  finally { jobs.delete(job.key); running = null; pump(); }
}
async function synth(text, voice, speed, prio = 1) {
  const cached = await cacheGet(`${voice}|${speed.toFixed(2)}|${text}`);
  if (cached) return cached;
  return enqueue(text, voice, speed, prio);
}
// ---- Oynatma ----
// Telefonlar (iOS ve Android WebView) dokunuştan saniyeler sonra başlayan sesi engeller; ses üretimi ise
// birkaç saniye sürer. Bu yüzden ses kanalı dokunuş anında Web Audio ile açılır, üretilen ses aynı kanaldan çalınır.
let actx = null, current = null;
export function unlockAudio() {
  try { if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch {}
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    if (!actx || actx.state === 'closed') actx = new AC();
    if (actx.state !== 'running') actx.resume().catch(() => {});
    const b = actx.createBuffer(1, 1, 22050), src = actx.createBufferSource();
    src.buffer = b; src.connect(actx.destination); src.start(0);
  } catch {}
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
export function stopKokoro() { speakSeq++; if (current) { try { current.stop(); } catch {} current = null; } }
async function playViaContext(blob) {
  if (!actx) return false;
  if (actx.state !== 'running') { try { await Promise.race([actx.resume(), sleep(1500)]); } catch {} }
  if (actx.state !== 'running') return false;
  const buf = await actx.decodeAudioData(await blob.arrayBuffer());
  await new Promise(resolve => {
    const src = actx.createBufferSource(); src.buffer = buf; src.connect(actx.destination);
    const me = { stop: () => { try { src.stop(); } catch {} resolve(); } };
    current = me; src.onended = () => { if (current === me) current = null; resolve(); };
    src.start(0);
  });
  return true;
}
async function playViaElement(blob) {
  const url = URL.createObjectURL(blob), audio = new Audio(url);
  const me = { stop: () => { try { audio.pause(); } catch {} } };
  current = me;
  try {
    await new Promise((resolve, reject) => {
      audio.onended = resolve; audio.onpause = resolve; audio.onerror = () => reject(new Error('Ses çalınamadı'));
      const t = setTimeout(() => reject(new Error('Ses çalma engellendi')), 4000);
      audio.play().then(() => clearTimeout(t), e => { clearTimeout(t); reject(e); });
    });
  } finally { URL.revokeObjectURL(url); if (current === me) current = null; }
}
let lastDiag = '', speakSeq = 0;
const WAIT_MS = 9000;
export function kokoroDiag() { return lastDiag; }
export async function kokoroSpeak(text, voiceId, rate = 0.85, maxWait = WAIT_MS) {
  unlockAudio(); // dokunuş anında (await'ten önce)
  const voice = String(voiceId || '').replace(/^kokoro:/, '') || 'af_heart';
  const speed = Math.max(0.7, Math.min(1.25, rate / 0.85));
  stopKokoro();
  const my = ++speakSeq;
  const t0 = performance.now();
  const slow = setTimeout(() => { try { window.dispatchEvent(new CustomEvent('dl:kokoro-busy')); } catch {} }, 1500);
  let blob;
  // en fazla WAIT_MS beklenir; yetişmezse bu okuma cihaz sesiyle yapılır, AI sesi arka planda hazırlanıp saklanır
  try { blob = await Promise.race([synth(String(text).trim(), voice, speed, 1), sleep(maxWait).then(() => { throw new Error('yavaş: AI sesi bu cihazda geç hazırlanıyor'); })]); }
  catch (e) { if (my !== speakSeq) return; throw e; } // eskimiş istek: sessizce bırak
  finally { clearTimeout(slow); }
  if (my !== speakSeq) return; // bu arada başka bir şey dinlenmek istendi: eski sesi çalma
  const gen = ((performance.now() - t0) / 1000).toFixed(1);
  let how = 'webaudio';
  try { if (!(await playViaContext(blob))) { how = 'audio'; await playViaElement(blob); } }
  catch (e) { lastDiag = `üretim ${gen} sn · çalma hatası (${how}): ${e?.message || e}`; throw e; }
  lastDiag = `üretim ${gen} sn · çalındı (${how}, ses kanalı: ${actx?.state || 'yok'})`;
}
// Soru açılınca sesi arka planda hazırla (kullanıcı “dinle”ye bastığında beklemesin).
export function kokoroPrefetch(text, voiceId, rate = 0.85) {
  if (!(state.phase === 'ready' || state.phase === 'cached')) return;
  const voice = String(voiceId || '').replace(/^kokoro:/, '') || 'af_heart';
  if (running || queue.length) return; // telefonu yormamak için yalnızca boşta iken
  synth(String(text).trim(), voice, Math.max(0.7, Math.min(1.25, rate / 0.85)), 0).catch(() => {});
}
