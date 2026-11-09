// dam-la — yönetici paneli bağlantısı (Firebase Realtime Database + anonim giriş)
// Kullanıcı profil açmaz: cihaz ilk açılışta anonim bir Firebase kimliği ve kısa bir dam-la kimliği (DL-XXXXX) alır.
// Firebase ayarı (config.js) boşsa bu modül hiçbir şey yapmaz; uygulama tamamen çevrimdışı çalışır.
import { initializeApp } from 'firebase/app';
import { initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, inMemoryPersistence, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, onDisconnect, serverTimestamp, onChildAdded, remove, goOffline, goOnline } from 'firebase/database';
import { FIREBASE_CONFIG, APP_VERSION } from './config.js';
import { Platform } from './platform.js';

const ID_KEY = 'dl-user-id';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function localUserId() {
  let id = null;
  try { id = localStorage.getItem(ID_KEY); } catch {}
  if (!id) {
    const bytes = new Uint8Array(6); (crypto?.getRandomValues ? crypto.getRandomValues(bytes) : bytes.forEach((_, i) => bytes[i] = Math.random() * 256));
    id = 'DL-' + [...bytes].slice(0, 5).map(b => ALPHABET[b % ALPHABET.length]).join('');
    try { localStorage.setItem(ID_KEY, id); } catch {}
    Platform.storage.set(ID_KEY, id).catch(() => {});
  }
  return id;
}
export async function restoreUserId() {
  // Önce kalıcı depodan oku (localStorage silinmiş olabilir)
  try { const v = await Platform.storage.get(ID_KEY); if (v) { try { localStorage.setItem(ID_KEY, v); } catch {} return v; } } catch {}
  return localUserId();
}

export function cloudConfigured() { return !!(FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.databaseURL); }

export function initCloud(core) {
  const state = { status: cloudConfigured() ? 'connecting' : 'off', uid: null, db: null, shortId: localUserId() };
  const listeners = new Set();
  const emit = () => listeners.forEach(fn => { try { fn({ ...state }); } catch {} });
  const api = {
    get state() { return { ...state }; },
    onState(fn) { listeners.add(fn); fn({ ...state }); return () => listeners.delete(fn); },
    live() {}, pushStats() {}, event() {},
  };
  if (!cloudConfigured()) return api;

  let liveTimer = null, statsTimer = null, lastLive = '';
  (async () => {
    try {
      state.shortId = await restoreUserId();
      const fb = initializeApp(FIREBASE_CONFIG);
      // iOS uygulama görünümünde getAuth() takılabildiği için kalıcılığı açıkça veriyoruz.
      const auth = initializeAuth(fb, { persistence: [indexedDBLocalPersistence, browserLocalPersistence, inMemoryPersistence] });
      const db = getDatabase(fb); state.db = db;
      onAuthStateChanged(auth, async user => {
        if (!user) { try { await signInAnonymously(auth); } catch (e) { state.status = 'error'; state.error = e.code || e.message; emit(); } return; }
        state.uid = user.uid; state.status = 'online'; emit();
        const base = `users/${user.uid}`;
        await update(ref(db, base + '/profile'), { shortId: state.shortId, platform: Platform.platformName, appVersion: APP_VERSION, lastOpen: serverTimestamp() }).catch(() => {});
        // çevrimiçi / çevrimdışı
        const statusRef = ref(db, base + '/status');
        onValue(ref(db, '.info/connected'), snap => {
          if (snap.val() !== true) { state.status = 'reconnecting'; emit(); return; }
          onDisconnect(statusRef).set({ state: 'offline', last: serverTimestamp() }).then(() => set(statusRef, { state: 'online', last: serverTimestamp() }));
          state.status = 'online'; emit();
        });
        api.pushStats(true);
        // yöneticiden gelen kutu (ödül, mesaj, XP, seviye, pet komutu)
        onChildAdded(ref(db, base + '/inbox'), async snap => {
          const msg = { id: snap.key, ...(snap.val() || {}) };
          try { await core.handleAdminMessage(msg); } catch (e) { console.warn('[cloud] mesaj işlenemedi', e); }
          await set(ref(db, `history/${user.uid}/${snap.key}`), { ...msg, id: null, seenAt: serverTimestamp() }).catch(() => {});
          await remove(snap.ref).catch(() => {});
        });
        Platform.lifecycle.onPause(() => { set(statusRef, { state: 'offline', last: serverTimestamp() }).finally(() => goOffline(db)); });
        Platform.lifecycle.onResume(() => { goOnline(db); });
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') goOnline(db); });
      });
    } catch (e) {
      console.warn('[cloud] başlatılamadı', e);
      state.status = 'error'; state.error = e.message; emit();
    }
  })();

  api.live = info => {
    if (!state.uid || !state.db) return;
    const key = JSON.stringify(info);
    if (key === lastLive) return; lastLive = key;
    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => update(ref(state.db, `users/${state.uid}/live`), { ...info, at: serverTimestamp() }).catch(() => {}), 400);
  };
  api.pushStats = (now = false) => {
    if (!state.uid || !state.db) return;
    clearTimeout(statsTimer);
    statsTimer = setTimeout(() => {
      const s = core.statsSnapshot();
      update(ref(state.db, `users/${state.uid}/stats`), { ...s, updatedAt: serverTimestamp() }).catch(() => {});
      // pet durumu (panelde gösterilir; pet yoksa kayıt silinir)
      let pet = null; try { pet = core.petSnapshot?.() ?? null; } catch {}
      set(ref(state.db, `users/${state.uid}/pet`), pet ? { ...pet, updatedAt: serverTimestamp() } : null).catch(() => {});
    }, now ? 50 : 2500);
  };
  api.event = ev => { if (ev?.type === 'answer') api.pushStats(); };
  return api;
}
