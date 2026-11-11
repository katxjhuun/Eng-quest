// AI sesleri: önceden üretilmiş (Kokoro) hazır ses dosyaları. Telefonda canlı üretim çok yavaş olduğu için
// sesler bir kez sunucuda üretilir; uygulama "dinle"de hazır dosyayı (önce cihaz önbelleği, sonra Firebase) anında çalar.
// Hazır sesi olmayan cümleler cihaz sesiyle okunur.
import { PACK_VOICES, audioKey, normText } from './speech-text.js';
const INFO = { am_michael: ['Michael', 'Amerikan', 'Erkek'], bf_emma: ['Emma', 'İngiliz', 'Kadın'], bf_isabella: ['Isabella', 'İngiliz', 'Kadın'], am_puck: ['Puck', 'Amerikan', 'Erkek'] };
export const KOKORO_VOICES = PACK_VOICES.map(id => ({ id: 'kokoro:' + id, voice: id, name: INFO[id][0], accent: INFO[id][1], gender: INFO[id][2] }));
// eski sürümlerde seçilmiş başka bir AI sesi: en yakın hazır sese eşle
export function packVoice(voiceId) {
  const v = String(voiceId || '').replace(/^kokoro:/, '');
  if (PACK_VOICES.includes(v)) return v;
  return /^[ab]f_/.test(v) ? 'bf_emma' : 'am_michael';
}
// eski arayüz uyumluluğu (indirme kutusu artık yok)
const state = { phase: 'ready', progress: 100 };
export function onKokoroState(fn) { fn(state); return () => {}; }
export function kokoroState() { return state; }
export async function ensureKokoro() {}

let packSource = null; // (voice, key) => Promise<base64|null>
export function setPackSource(fn) { packSource = fn; }

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
function b64ToBlob(b64) { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type: 'audio/mpeg' }); }
async function getPack(voice, text) {
  const key = audioKey(text), ck = `pack|${voice}|${key}`;
  const cached = await cacheGet(ck); if (cached) return cached;
  if (inflight.has(ck)) return inflight.get(ck);
  const job = (async () => {
    const b64 = packSource ? await packSource(voice, key) : null;
    if (!b64) return null;
    const blob = b64ToBlob(b64); cachePut(ck, blob); return blob;
  })().catch(() => null).finally(() => inflight.delete(ck));
  inflight.set(ck, job); return job;
}
export function hasPackSource() { return !!packSource; }

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
export function kokoroDiag() { return lastDiag; }
const sleep2 = ms => new Promise(r => setTimeout(r, ms));
export async function kokoroSpeak(text, voiceId) {
  unlockAudio(); // dokunuş anında (await'ten önce)
  const voice = packVoice(voiceId);
  stopKokoro();
  const my = ++speakSeq, t0 = performance.now();
  const blob = await Promise.race([getPack(voice, normText(text)), sleep2(8000).then(() => null)]);
  if (my !== speakSeq) return; // bu arada başka bir şey dinlenmek istendi
  const ms = Math.round(performance.now() - t0);
  if (!blob) { lastDiag = `bu cümlenin hazır AI sesi yok (${ms} ms)`; throw new Error('hazır ses yok'); }
  let how = 'webaudio';
  try { if (!(await playViaContext(blob))) { how = 'audio'; await playViaElement(blob); } }
  catch (e) { lastDiag = `hazır ses ${ms} ms'de geldi · çalma hatası (${how}): ${e?.message || e}`; throw e; }
  lastDiag = `hazır ses ${ms} ms'de geldi · çalındı (${how})`;
}
// soru açılınca sesleri arka planda indir (dinle'ye basınca anında çalsın)
export function kokoroPrefetch(text, voiceId) { if (text) getPack(packVoice(voiceId), normText(text)).catch(() => {}); }
