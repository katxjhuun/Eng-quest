// Kokoro (yapay zekâ İngilizce ses) — arayüzü dondurmamak için ayrı iş parçacığında çalışır.
// Model ilk kullanımda bir kez indirilir (~92 MB) ve cihazda saklanır.
let ttsPromise = null;

// Cache Storage yoksa (bazı iOS uygulama görünümleri) model dosyaları IndexedDB'de saklanır.
const DB_NAME = 'dl-kokoro-model', STORE = 'files';
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idb(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode), st = tx.objectStore(STORE), r = fn(st);
    tx.oncomplete = () => resolve(r && 'result' in r ? r.result : undefined);
    tx.onerror = () => reject(tx.error);
  });
}
const idbCache = {
  async match(key) {
    const blob = await idb('readonly', st => st.get(String(key)));
    return blob ? new Response(blob, { headers: { 'content-length': String(blob.size) } }) : undefined;
  },
  async put(key, response) {
    const blob = await response.blob();
    await idb('readwrite', st => st.put(blob, String(key)));
  }
};

async function hasCacheStorage() {
  try { if (!('caches' in self)) return false; await caches.open('dl-probe'); return true; } catch { return false; }
}

function load() {
  if (!ttsPromise) {
    ttsPromise = (async () => {
      const m = await import('./kokoro.web.js');
      const env = m.transformersEnv;
      if (env && !(await hasCacheStorage())) {
        env.useBrowserCache = false;
        env.useCustomCache = true;
        env.customCache = idbCache;
      }
      return m.KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
        dtype: 'q8',
        device: 'wasm',
        progress_callback: p => {
          if (p.status === 'progress' && /onnx/.test(p.file || '')) postMessage({ type: 'progress', progress: p.progress, loaded: p.loaded, total: p.total });
        }
      });
    })().catch(err => { ttsPromise = null; throw err; });
  }
  return ttsPromise;
}

self.onmessage = async e => {
  const { id, type, text, voice, speed } = e.data || {};
  try {
    if (type === 'load') { await load(); postMessage({ id, type: 'ready' }); return; }
    if (type === 'speak') {
      const tts = await load();
      const audio = await tts.generate(String(text || ''), { voice: voice || 'af_heart', speed: speed || 1 });
      const wav = audio.toWav();
      postMessage({ id, type: 'audio', wav }, [wav]);
    }
  } catch (err) {
    postMessage({ id, type: 'error', message: String(err && err.message || err) });
  }
};
