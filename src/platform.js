// Platform katmanı: aynı kod hem telefondaki uygulamada (Capacitor) hem tarayıcıda (PWA) çalışır.
// Yerelde kalıcı kayıt, telefon sesi, yedek paylaşımı ve uzaktan güncelleme burada.
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { App } from '@capacitor/app';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { AppIcon } from '@capacitor-community/app-icon';
import { kokoroSpeak, stopKokoro, unlockAudio } from './kokoro.js';
import { UPDATE_MANIFEST_URL, APP_VERSION, BUILD_TIME, UPDATE_CHECK_INTERVAL_MS } from './config.js';
// update.json ile aynı deponun sürüm dosyaları: https://github.com/<kullanıcı>/<depo>/releases/download/
const UPDATE_ASSET_PREFIX = UPDATE_MANIFEST_URL.replace(/\/releases\/latest\/download\/.*$/, '/releases/download/').toLowerCase();
const trustedAsset = url => { try { const u = new URL(String(url)); return u.protocol === 'https:' && !u.username && !u.password && u.href.toLowerCase().startsWith(UPDATE_ASSET_PREFIX); } catch { return false; } };

const isNative = Capacitor.isNativePlatform();
const platformName = Capacitor.getPlatform(); // 'android' | 'ios' | 'web'

// Uygulama açılır açılmaz güncelleyiciye "bu paket sağlıklı çalıştı" bilgisi verilir.
// Verilmezse yeni paket 10 sn içinde otomatik olarak önceki çalışan sürüme geri alınır.
if (isNative) {
  try { CapacitorUpdater.notifyAppReady(); } catch (e) { console.warn('[updater] notifyAppReady', e); }
}

function withTimeout(promise, ms, label = 'İstek') {
  let t;
  return Promise.race([
    promise,
    new Promise((_, rej) => { t = setTimeout(() => rej(new Error(`${label} zaman aşımına uğradı.`)), ms); })
  ]).finally(() => clearTimeout(t));
}

// ---------------- Kalıcı kayıt ----------------
// localStorage hızlı ilk açılış için; Preferences (iOS UserDefaults / Android SharedPreferences)
// işletim sisteminin silmediği kalıcı kopya. Okurken en yeni "updatedAt" değeri kazanır.
const storage = {
  async get(key) {
    if (isNative) {
      try { const { value } = await Preferences.get({ key }); return value; } catch (e) { console.warn('[storage] get', e); }
    }
    try { return localStorage.getItem(key); } catch { return null; }
  },
  async set(key, value) {
    try { localStorage.setItem(key, value); } catch {}
    if (isNative) {
      try { await Preferences.set({ key, value }); } catch (e) { console.warn('[storage] set', e); throw e; }
    }
  },
  async remove(key) {
    try { localStorage.removeItem(key); } catch {}
    if (isNative) { try { await Preferences.remove({ key }); } catch {} }
  }
};

// ---------------- Seslendirme ----------------
// Android WebView tarayıcı sesini (speechSynthesis) desteklemez; uygulamada yerel TTS kullanılır.
// İngilizce için isteğe bağlı Kokoro AI sesleri; Türkçe metinler her zaman cihazın Türkçe sesiyle okunur.
let nativeVoices = null;
const tts = {
  async voices() {
    if (isNative) {
      if (!nativeVoices) {
        try { nativeVoices = (await TextToSpeech.getSupportedVoices()).voices || []; } catch { nativeVoices = []; }
      }
      return nativeVoices.map((v, index) => ({ id: v.voiceURI || v.name, name: v.name, lang: v.lang, index }));
    }
    let list = [];
    try { list = window.speechSynthesis?.getVoices?.() || []; } catch {}
    return list.map((v, index) => ({ id: v.voiceURI || v.name, name: v.name, lang: v.lang, index, raw: v }));
  },
  supported() {
    return isNative || ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window);
  },
  async stop() {
    stopKokoro();
    if (isNative) { try { await TextToSpeech.stop(); } catch {} return; }
    try { window.speechSynthesis?.cancel(); } catch {}
  },
  async speak(text, { rate = 0.85, voiceId = 'default', lang = 'en' } = {}) {
    text = String(text || '').trim();
    if (!text) return;
    const wantTr = /^tr/i.test(lang);
    if (!wantTr && String(voiceId).startsWith('kokoro:')) {
      unlockAudio();
      try { await tts.stop(); return await kokoroSpeak(text, voiceId, rate); }
      catch (e) { console.warn('[kokoro] cihaz sesine geçiliyor', e); try { window.dispatchEvent(new CustomEvent('dl:kokoro-fallback', { detail: String(e?.message || e) })); } catch {} }
    }
    const list = await tts.voices();
    const langRe = wantTr ? /^tr([_-]|$)/i : /^en([_-]|$)/i;
    const pool = list.filter(v => langRe.test(v.lang));
    const chosen = (!wantTr && list.find(v => v.id === voiceId))
      || (wantTr && pool.find(v => /yelda|filiz|emel|natural|enhanced|premium|google/i.test(v.name)))
      || (!wantTr && pool.find(v => /samantha|ava|serena|enhanced|natural|premium|aria|jenny|google us/i.test(v.name)))
      || (!wantTr && pool.find(v => /en[-_]US/i.test(v.lang)))
      || pool[0];
    const fallbackLang = wantTr ? 'tr-TR' : 'en-US';
    if (isNative) {
      await tts.stop();
      await TextToSpeech.speak({ text, lang: chosen?.lang || fallbackLang, rate: Math.max(0.5, Math.min(1.2, rate)), pitch: 1, volume: 1, voice: chosen ? chosen.index : undefined, category: 'playback', queueStrategy: 0 });
      return;
    }
    await new Promise(resolve => {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = chosen?.lang || fallbackLang;
        u.rate = rate;
        if (chosen?.raw) u.voice = chosen.raw;
        let done = false; const finish = () => { if (!done) { done = true; resolve(); } };
        u.onend = finish; u.onerror = finish;
        window.speechSynthesis.speak(u);
        setTimeout(finish, Math.min(25000, text.length * 220 + 3000));
      } catch { resolve(); }
    });
  },
  onVoicesChanged(cb) {
    if (!isNative && 'speechSynthesis' in window) window.speechSynthesis.addEventListener?.('voiceschanged', cb);
  }
};

// ---------------- Uygulama simgesi (doğum günü) ----------------
const appIcon = {
  supported: isNative,
  async set(birthday) {
    if (!isNative) return false;
    if (birthday) await AppIcon.change({ name: 'birthday', suppressNotification: true, disable: [] });
    else await AppIcon.reset({ suppressNotification: true, disable: ['birthday'] });
    return true;
  }
};

// ---------------- Ağ (CORS'suz yerel HTTP) ----------------
// Uygulamada istekler telefonun yerel HTTP katmanından gider; Deezer gibi CORS izni olmayan
// kaynaklar sunucuya gerek kalmadan okunabilir. Tarayıcıda normal fetch kullanılır.
async function getJson(url, timeoutMs = 8000) {
  if (isNative) {
    const res = await withTimeout(CapacitorHttp.get({ url, headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' }, responseType: 'json', connectTimeout: timeoutMs, readTimeout: timeoutMs }), timeoutMs + 1500, 'Bağlantı');
    if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);
    return typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
  }
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { cache: 'no-store', signal: ctl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally { clearTimeout(t); }
}

// ---------------- Yedek dışa / içe aktarma ----------------
const backup = {
  async exportJson(filename, jsonText) {
    if (isNative) {
      const written = await Filesystem.writeFile({ path: filename, data: jsonText, directory: Directory.Cache, encoding: Encoding.UTF8 });
      try {
        await Share.share({ title: 'dam-la yedeği', text: 'dam-la ilerleme yedeği', files: [written.uri], dialogTitle: 'Yedeği kaydet veya gönder' });
        return 'shared';
      } catch (e) {
        if (/cancel/i.test(String(e?.message || e))) return 'cancelled';
        // Paylaşım açılamazsa Belgeler klasörüne yaz.
        await Filesystem.writeFile({ path: filename, data: jsonText, directory: Directory.Documents, encoding: Encoding.UTF8 });
        return 'documents';
      }
    }
    const blob = new Blob([jsonText], { type: 'application/json' });
    const file = typeof File === 'function' ? new File([blob], filename, { type: 'application/json' }) : null;
    if (file && navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'dam-la yedeği' }); return 'shared'; } catch (e) { if (e?.name === 'AbortError') return 'cancelled'; }
    }
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return 'downloaded';
  }
};

// ---------------- Uygulama yaşam döngüsü ----------------
const lifecycle = {
  onBackButton(handler) {
    if (!isNative) return;
    App.addListener('backButton', ({ canGoBack }) => handler(canGoBack));
  },
  onPause(handler) {
    if (isNative) App.addListener('pause', handler);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') handler(); });
    window.addEventListener('pagehide', handler);
  },
  onResume(handler) {
    if (isNative) App.addListener('resume', handler);
  },
  exitApp() { if (isNative) App.exitApp(); }
};

// ---------------- Uzaktan güncelleme (OTA) ----------------
function parseVersion(v) {
  const m = String(v || '').trim().replace(/^v/i, '').match(/^(\d+)\.(\d+)\.(\d+)/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}
export function compareVersions(a, b) {
  const x = parseVersion(a), y = parseVersion(b);
  if (!x || !y) return 0;
  for (let i = 0; i < 3; i++) { if (x[i] !== y[i]) return x[i] > y[i] ? 1 : -1; }
  return 0;
}

let nativeInfo = null;
async function getNativeInfo() {
  if (!isNative) return { version: APP_VERSION, build: 'web' };
  if (!nativeInfo) { try { nativeInfo = await App.getInfo(); } catch { nativeInfo = { version: '0.0.0', build: '0' }; } }
  return nativeInfo;
}

const updates = {
  available: isNative,
  async info() {
    const native = await getNativeInfo();
    let bundle = { id: 'builtin', version: APP_VERSION };
    if (isNative) { try { bundle = (await CapacitorUpdater.current()).bundle || bundle; } catch {} }
    return { webVersion: APP_VERSION, buildTime: BUILD_TIME, nativeVersion: native.version, nativeBuild: native.build, bundleId: bundle.id, platform: platformName };
  },
  shouldAutoCheck(lastCheckAt) {
    return isNative && (!lastCheckAt || Date.now() - Number(lastCheckAt) > UPDATE_CHECK_INTERVAL_MS);
  },
  // Sonuç: { state: 'latest' | 'available' | 'needs-native' | 'error', manifest?, message }
  async check() {
    if (!isNative) return { state: 'web', message: 'Web sürümü her açılışta en yeni hâli otomatik yükler.' };
    let manifest;
    try {
      manifest = await getJson(`${UPDATE_MANIFEST_URL}${UPDATE_MANIFEST_URL.includes('?') ? '&' : '?'}t=${Date.now()}`, 12000);
    } catch (e) {
      return { state: 'error', message: `Güncelleme sunucusuna ulaşılamadı (${e.message || e}). İnternet bağlantını kontrol et.` };
    }
    if (!manifest || !manifest.version || !manifest.url) return { state: 'error', message: 'Güncelleme bilgisi okunamadı (update.json eksik veya bozuk).' };
    // Paket yalnızca bu deponun GitHub sürümlerinden ve SHA-256 özetiyle kabul edilir.
    if (!trustedAsset(manifest.url)) return { state: 'error', message: 'Güncelleme adresi beklenen GitHub sürüm adresi değil; güvenlik için indirilmedi.' };
    if (!/^[0-9a-f]{64}$/i.test(String(manifest.checksum || ''))) return { state: 'error', message: 'Güncelleme paketinin SHA-256 özeti eksik; güvenlik için indirilmedi.' };
    if (!/^\d+\.\d+\.\d+$/.test(String(manifest.version))) return { state: 'error', message: 'Güncelleme sürüm numarası geçersiz.' };
    if (compareVersions(manifest.version, APP_VERSION) <= 0) return { state: 'latest', manifest, message: `En güncel sürümü kullanıyorsun (${APP_VERSION}).` };
    const native = await getNativeInfo();
    if (manifest.minNativeVersion && compareVersions(native.version, manifest.minNativeVersion) < 0) {
      return { state: 'needs-native', manifest, message: `Sürüm ${manifest.version} yeni bir uygulama kurulumu gerektiriyor (en az ${manifest.minNativeVersion}). Kurulum rehberindeki adımlarla yeni APK/IPA'yı kur; ilerlemen korunur.` };
    }
    return { state: 'available', manifest, message: `Yeni sürüm var: ${manifest.version}${manifest.notes ? ' — ' + manifest.notes : ''}` };
  },
  async download(manifest, onProgress) {
    // Aynı sürüm daha önce indirildiyse tekrar indirme.
    try {
      const { bundles } = await CapacitorUpdater.list();
      const existing = (bundles || []).find(b => b.version === manifest.version && !/error|deleted/i.test(String(b.status)));
      if (existing) return existing;
    } catch {}
    let handle;
    try {
      if (onProgress) handle = await CapacitorUpdater.addListener('download', ev => onProgress(Number(ev?.percent) || 0));
      const options = { url: manifest.url, version: manifest.version };
      if (!trustedAsset(manifest.url) || !/^[0-9a-f]{64}$/i.test(String(manifest.checksum || ''))) throw new Error('Güvenli olmayan güncelleme paketi reddedildi.');
      options.checksum = String(manifest.checksum).toLowerCase();
      return await CapacitorUpdater.download(options);
    } finally { try { await handle?.remove(); } catch {} }
  },
  // Bir sonraki kapanış/arka plana alma sırasında uygula.
  async schedule(bundle) { return CapacitorUpdater.next({ id: bundle.id }); },
  // Hemen uygula (uygulama yeniden yüklenir).
  async applyNow(bundle) { return CapacitorUpdater.set({ id: bundle.id }); },
  // Sorun olursa: uygulamanın içinde gelen ilk sürüme dön.
  async resetToBuiltin() { return CapacitorUpdater.reset({ toLastSuccessful: false }); }
};

export const Platform = { isNative, platformName, storage, tts, getJson, backup, lifecycle, updates, appIcon, appVersion: APP_VERSION };
