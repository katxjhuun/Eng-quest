// dam-la — yönetici paneli bağlantısı (Firebase Realtime Database + anonim giriş)
// Kullanıcı profil açmaz: cihaz ilk açılışta anonim bir Firebase kimliği ve kısa bir dam-la kimliği (DL-XXXXX) alır.
// Firebase ayarı (config.js) boşsa bu modül hiçbir şey yapmaz; uygulama tamamen çevrimdışı çalışır.
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

  let liveTimer = null, statsTimer = null, lastLive = '', F = null;
  (async () => {
    try {
      state.shortId = await restoreUserId();
      F = await import('./cloud-fb.js');
      const fb = F.initializeApp(FIREBASE_CONFIG);
      // iOS uygulama görünümünde getAuth() takılabildiği için kalıcılığı açıkça veriyoruz.
      const auth = F.initializeAuth(fb, { persistence: [F.indexedDBLocalPersistence, F.browserLocalPersistence, F.inMemoryPersistence] });
      const db = F.getDatabase(fb); state.db = db;
      F.onAuthStateChanged(auth, async user => {
        if (!user) { try { await F.signInAnonymously(auth); } catch (e) { state.status = 'error'; state.error = e.code || e.message; emit(); } return; }
        state.uid = user.uid; state.status = 'online'; emit();
        const base = `users/${user.uid}`;
        await F.update(F.ref(db, base + '/profile'), { shortId: state.shortId, platform: Platform.platformName, appVersion: APP_VERSION, lastOpen: F.serverTimestamp() }).catch(() => {});
        // çevrimiçi / çevrimdışı
        const statusRef = F.ref(db, base + '/status');
        F.onValue(F.ref(db, '.info/connected'), snap => {
          if (snap.val() !== true) { state.status = 'reconnecting'; emit(); return; }
          F.onDisconnect(statusRef).set({ state: 'offline', last: F.serverTimestamp() }).then(() => F.set(statusRef, { state: 'online', last: F.serverTimestamp() }));
          state.status = 'online'; emit();
        });
        api.pushStats(true);
        // yöneticiden gelen kutu (ödül, mesaj, XP, seviye, pet komutu)
        F.onChildAdded(F.ref(db, base + '/inbox'), async snap => {
          const msg = { id: snap.key, ...(snap.val() || {}) };
          try { await core.handleAdminMessage(msg); } catch (e) { console.warn('[cloud] mesaj işlenemedi', e); }
          await F.set(F.ref(db, `history/${user.uid}/${snap.key}`), { ...msg, id: null, seenAt: F.serverTimestamp() }).catch(() => {});
          await F.remove(snap.ref).catch(() => {});
        });
        Platform.lifecycle.onPause(() => { F.set(statusRef, { state: 'offline', last: F.serverTimestamp() }).finally(() => F.goOffline(db)); });
        Platform.lifecycle.onResume(() => { F.goOnline(db); });
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') F.goOnline(db); });
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
    liveTimer = setTimeout(() => F.update(F.ref(state.db, `users/${state.uid}/live`), { ...info, at: F.serverTimestamp() }).catch(() => {}), 400);
  };
  api.pushStats = (now = false) => {
    if (!state.uid || !state.db) return;
    clearTimeout(statsTimer);
    statsTimer = setTimeout(() => {
      const s = core.statsSnapshot();
      F.update(F.ref(state.db, `users/${state.uid}/stats`), { ...s, updatedAt: F.serverTimestamp() }).catch(() => {});
      // pet durumu (panelde gösterilir; pet yoksa kayıt silinir)
      let pet = null; try { pet = core.petSnapshot?.() ?? null; } catch {}
      F.set(F.ref(state.db, `users/${state.uid}/pet`), pet ? { ...pet, updatedAt: F.serverTimestamp() } : null).catch(() => {});
    }, now ? 50 : 2500);
  };
  api.event = ev => { if (ev?.type === 'answer') api.pushStats(); };
  // ---- arena: herkese açık pet savaş kartı (arkadaş ekleme ve oyunculara meydan okuma) ----
  const okCode = c => /^DL-[A-Z0-9]{5}$/.test(String(c || ''));
  api.ready = () => !!(state.uid && state.db);
  api.myCode = () => state.shortId;
  let lastCard = '';
  api.arenaPublish = pet => {
    if (!state.uid || !state.db || !okCode(state.shortId)) return Promise.resolve(false);
    const r = F.ref(state.db, `arena/${state.shortId}`);
    if (!pet) { lastCard = ''; return F.remove(r).then(() => true).catch(() => false); }
    const key = JSON.stringify(pet); if (key === lastCard) return Promise.resolve(true); lastCard = key;
    const { wins, ...pp } = pet;
    return F.set(r, { uid: state.uid, code: state.shortId, pet: pp, wins: wins | 0, at: F.serverTimestamp() }).then(() => true).catch(e => { lastCard = ''; console.warn('[arena]', e); return false; });
  };
  // web bildirimleri: abonelik + vakti gelince gönderilecek notlar (GitHub'daki zamanlanmış iş okur ve gönderir)
  api.pushSet = (sub, notes, prefs = {}) => {
    if (!state.uid || !state.db) return Promise.resolve(false);
    const r = F.ref(state.db, `push/${state.uid}`);
    if (!sub) return F.remove(r).then(() => true).catch(() => false);
    const clean = { endpoint: String(sub.endpoint || ''), keys: { p256dh: String(sub.keys?.p256dh || ''), auth: String(sub.keys?.auth || '') } };
    const list = {}; (notes || []).slice(0, 6).forEach((n, i) => { list['n' + i] = { at: Math.round(n.at), title: String(n.title).slice(0, 80), body: String(n.body).slice(0, 200) }; });
    return F.set(r, { sub: clean, notes: list, loud: !!prefs.loud, golden: prefs.golden !== false, upd: prefs.upd !== false, updatedAt: F.serverTimestamp() }).then(() => true).catch(e => { console.warn('[push]', e); return false; });
  };
  // ---- duyuru şeridi: herkese açık başarı akışı ve çözülen soru sıralaması ----
  api.feedPost = e => {
    if (!state.uid || !state.db || !okCode(state.shortId)) return Promise.resolve(false);
    const r = F.push(F.ref(state.db, 'feed'));
    const clean = { uid: state.uid, code: state.shortId, kind: String(e.kind), tier: Math.max(1, Math.min(3, e.tier | 0)), at: F.serverTimestamp() };
    for (const k of ['name', 'species', 'level']) if (e[k] != null) clean[k] = String(e[k]).slice(0, k === 'level' ? 12 : 16);
    for (const k of ['stage', 'coat', 'stars']) if (e[k] != null) clean[k] = Math.max(0, e[k] | 0);
    if (e.shiny != null) clean.shiny = !!e.shiny;
    return F.set(r, clean).then(() => true).catch(err => { console.warn('[feed]', err); return false; });
  };
  let feedOff = null;
  api.feedListen = (cb, n = 30) => {
    feedOff?.(); feedOff = null;
    if (!state.db) return () => {};
    feedOff = F.onValue(F.query(F.ref(state.db, 'feed'), F.orderByChild('at'), F.limitToLast(n)), snap => {
      const out = []; snap.forEach(c => { const v = c.val(); if (v && typeof v === 'object') out.push({ ...v, id: c.key }); }); cb(out);
    }, () => cb([]));
    return () => { feedOff?.(); feedOff = null; };
  };
  let lastBoard = '';
  api.boardSet = b => {
    if (!state.uid || !state.db || !okCode(state.shortId)) return Promise.resolve(false);
    const v = { uid: state.uid, code: state.shortId, n: Math.max(0, b.n | 0), name: String(b.name || '').slice(0, 16), species: b.species || null, stage: b.stage | 0, shiny: !!b.shiny, coat: b.coat | 0 };
    const key = JSON.stringify(v); if (key === lastBoard) return Promise.resolve(true); lastBoard = key;
    return F.set(F.ref(state.db, `board/${state.shortId}`), { ...v, at: F.serverTimestamp() }).then(() => true).catch(() => { lastBoard = ''; return false; });
  };
  // sıralama: benden çok soru çözenlerin sayısı + 1
  api.boardRank = async n => {
    if (!state.db) return null;
    const snap = await F.get(F.query(F.ref(state.db, 'board'), F.orderByChild('n'), F.startAt((n | 0) + 1))).catch(() => null);
    return snap ? snap.size + 1 : null;
  };
  api.arenaGet = async code => {
    code = String(code || '').trim().toUpperCase();
    if (!okCode(code) || !state.db) return null;
    const snap = await F.get(F.ref(state.db, `arena/${code}`)).catch(() => null);
    return snap && snap.exists() ? snap.val() : null;
  };
  api.arenaList = async (n = 30) => {
    if (!state.db) return [];
    const snap = await F.get(F.query(F.ref(state.db, 'arena'), F.orderByChild('at'), F.limitToLast(n))).catch(() => null);
    const out = []; snap?.forEach(c => { const v = c.val(); if (v && v.code !== state.shortId) out.push(v); });
    return out;
  };
  return api;
}
