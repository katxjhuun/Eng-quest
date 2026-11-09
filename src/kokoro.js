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
const inflight = new Map();
async function synth(text, voice, speed) {
  const key = `${voice}|${speed.toFixed(2)}|${text}`;
  const cached = await cacheGet(key);
  if (cached) return cached;
  if (inflight.has(key)) return inflight.get(key);
  const job = (async () => {
    await ensureKokoro();
    const { wav } = await call({ type: 'speak', text, voice, speed });
    const blob = new Blob([wav], { type: 'audio/wav' });
    cachePut(key, blob);
    return blob;
  })().finally(() => inflight.delete(key));
  inflight.set(key, job);
  return job;
}

let current = null;
export function stopKokoro() { if (current) { try { current.pause(); } catch {} current = null; } }
export async function kokoroSpeak(text, voiceId, rate = 0.85) {
  const voice = String(voiceId || '').replace(/^kokoro:/, '') || 'af_heart';
  const speed = Math.max(0.7, Math.min(1.25, rate / 0.85));
  stopKokoro();
  const blob = await synth(String(text).trim(), voice, speed);
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  current = audio;
  await new Promise((resolve, reject) => {
    audio.onended = resolve; audio.onerror = () => reject(new Error('Ses çalınamadı'));
    audio.play().catch(reject);
  }).finally(() => { URL.revokeObjectURL(url); if (current === audio) current = null; });
}
// Soru açılınca sesi arka planda hazırla (kullanıcı “dinle”ye bastığında beklemesin).
export function kokoroPrefetch(text, voiceId, rate = 0.85) {
  if (!(state.phase === 'ready' || state.phase === 'cached')) return;
  const voice = String(voiceId || '').replace(/^kokoro:/, '') || 'af_heart';
  synth(String(text).trim(), voice, Math.max(0.7, Math.min(1.25, rate / 0.85))).catch(() => {});
}
