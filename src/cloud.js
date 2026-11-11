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
  // ---- yönetici etkileşimleri: soru yanıtları, canlı savaş özeti ve komutları ----
  api.reply = (msgId, obj) => {
    if (!state.uid || !state.db || !/^[A-Za-z0-9_-]{1,40}$/.test(String(msgId))) return Promise.resolve(false);
    return F.set(F.ref(state.db, `users/${state.uid}/replies/${msgId}`), { ...obj, at: F.serverTimestamp() }).then(() => true).catch(e => { console.warn('[reply]', e); return false; });
  };
  api.battlePublish = s => {
    if (!state.uid || !state.db) return;
    F.set(F.ref(state.db, `users/${state.uid}/battle`), s ? { ...s, at: F.serverTimestamp() } : null).catch(() => {});
  };
  api.onBattleCmd = cb => {
    if (!state.uid || !state.db) return () => {};
    const r = F.ref(state.db, `users/${state.uid}/battleCmd`);
    return F.onChildAdded(r, snap => { const v = snap.val() || {}; F.remove(snap.ref).catch(() => {}); if (Date.now() - (v.at || 0) < 10 * 60000) cb({ id: snap.key, ...v }); });
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
  // canlı dinlemek yerine arada bir çekmek: telefon sürekli bağlantı ve yeniden çizimle uğraşmaz
  api.feedFetch = async (n = 30) => {
    if (!state.db) return null;
    const snap = await F.get(F.query(F.ref(state.db, 'feed'), F.orderByChild('at'), F.limitToLast(n))).catch(() => null);
    if (!snap) return null;
    const out = []; snap.forEach(c => { const v = c.val(); if (v && typeof v === 'object') out.push({ ...v, id: c.key }); }); return out;
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
  // ---------- Sosyal: arkadaşlık, engelleme, mesajlaşma, pet takası ----------
  // Arkadaşlık iki yönlüdür: A istek gönderir (soc/req/B/A), B kabul edince kendi listesine A'yı ekler ve A'ya haber bırakır
  // (soc/acc/A/B); A'nın uygulaması bunu görünce B'yi kendi listesine ekler. Mesaj yazmak için karşı tarafın listesinde olmak
  // ve engellenmemiş olmak gerekir (kurallar denetler). Sohbet kimliği iki uid'in sıralı birleşimidir.
  const soc = {};
  const R = p => F.ref(state.db, 'soc/' + p);
  const cidOf = other => [state.uid, other].sort().join('_');
  const ok = () => !!(F && state.uid && state.db);
  soc.me = () => ({ uid: state.uid, code: state.shortId });
  soc.ready = ok;
  soc.cid = cidOf;
  soc.dirSet = card => {
    if (!ok() || !okCode(state.shortId)) return Promise.resolve(false);
    const v = { uid: state.uid, code: state.shortId, name: String(card?.name || 'Oyuncu').slice(0, 16), at: F.serverTimestamp() };
    if (card?.species) { v.species = card.species; v.stage = card.stage | 0; v.shiny = !!card.shiny; if (Number.isInteger(card.coat)) v.coat = card.coat; }
    return F.set(R('dir/' + state.shortId), v).then(() => true).catch(() => false);
  };
  soc.lookup = async code => {
    code = String(code || '').trim().toUpperCase();
    if (!ok() || !okCode(code)) return null;
    const snap = await F.get(R('dir/' + code)).catch(() => null);
    return snap && snap.exists() ? snap.val() : null;
  };
  const meCard = name => ({ code: state.shortId, name: String(name || 'Oyuncu').slice(0, 16), at: F.serverTimestamp() });
  soc.request = (to, myName) => ok() && to !== state.uid ? F.set(R(`req/${to}/${state.uid}`), meCard(myName)).then(() => true).catch(() => false) : Promise.resolve(false);
  soc.cancelRequest = to => ok() ? F.remove(R(`req/${to}/${state.uid}`)).catch(() => {}) : null;
  soc.onRequests = cb => { if (!ok()) return () => {}; return F.onValue(R('req/' + state.uid), s => cb(s.val() || {}), () => cb({})); };
  soc.accept = async (from, info, myName) => {
    if (!ok()) return false;
    try {
      await F.set(R(`fr/${state.uid}/${from}`), { code: info.code, name: String(info.name || 'Oyuncu').slice(0, 16), at: F.serverTimestamp() });
      await F.set(R(`acc/${from}/${state.uid}`), meCard(myName));
      await F.remove(R(`req/${state.uid}/${from}`));
      return true;
    } catch (e) { console.warn('[soc]', e); return false; }
  };
  soc.decline = from => ok() ? F.remove(R(`req/${state.uid}/${from}`)).catch(() => {}) : null;
  // kabul haberleri: karşı taraf kabul ettiyse kendi listeme eklerim
  soc.onAccepts = cb => {
    if (!ok()) return () => {};
    return F.onValue(R('acc/' + state.uid), async s => {
      const v = s.val() || {};
      for (const [uid, info] of Object.entries(v)) {
        await F.set(R(`fr/${state.uid}/${uid}`), { code: info.code, name: String(info.name || 'Oyuncu').slice(0, 16), at: F.serverTimestamp() }).catch(() => {});
        await F.remove(R(`acc/${state.uid}/${uid}`)).catch(() => {});
        cb?.(uid, info);
      }
    });
  };
  soc.onFriends = cb => { if (!ok()) return () => {}; return F.onValue(R('fr/' + state.uid), s => cb(s.val() || {}), () => cb({})); };
  soc.rename = (uid, info) => ok() ? F.update(R(`fr/${state.uid}/${uid}`), { name: String(info.name || 'Oyuncu').slice(0, 16) }).catch(() => {}) : null;
  soc.unfriend = uid => ok() ? F.remove(R(`fr/${state.uid}/${uid}`)).catch(() => {}) : null;
  soc.block = async uid => {
    if (!ok()) return;
    await F.set(R(`blk/${state.uid}/${uid}`), true).catch(() => {});
    await F.remove(R(`fr/${state.uid}/${uid}`)).catch(() => {});
    await F.remove(R(`req/${state.uid}/${uid}`)).catch(() => {});
  };
  soc.unblock = uid => ok() ? F.remove(R(`blk/${state.uid}/${uid}`)).catch(() => {}) : null;
  soc.onBlocks = cb => { if (!ok()) return () => {}; return F.onValue(R('blk/' + state.uid), s => cb(s.val() || {}), () => cb({})); };
  // mesaj gönder (k: 'msg' | 'trade'); alıcıya küçük bir "yeni mesaj" işareti bırakılır
  soc.send = async (to, m) => {
    if (!ok()) return null;
    const v = { f: state.uid, to, k: m.k || 'msg', at: F.serverTimestamp() };
    if (m.t) v.t = String(m.t).slice(0, 500);
    if (m.pet) v.pet = m.pet;
    try {
      const r = F.push(R(`ch/${cidOf(to)}/m`));
      await F.set(r, v);
      F.set(R(`ping/${to}/${state.uid}`), F.serverTimestamp()).catch(() => {});
      return r.key;
    } catch (e) { console.warn('[soc]', e); return null; }
  };
  // açık sohbet: son 60 mesaj + takas sonuçları + karşı tarafın okuma zamanı
  soc.openChat = (other, { onMsg, onTrade, onRead }) => {
    if (!ok()) return () => {};
    const cid = cidOf(other);
    const offs = [
      F.onChildAdded(F.query(R(`ch/${cid}/m`), F.limitToLast(60)), s => onMsg({ id: s.key, ...s.val() })),
      F.onValue(R(`ch/${cid}/x`), s => onTrade(s.val() || {})),
      F.onValue(R(`ch/${cid}/r/${other}`), s => onRead(s.val() || 0)),
    ];
    return () => offs.forEach(o => o());
  };
  soc.markRead = other => ok() ? F.set(R(`ch/${cidOf(other)}/r/${state.uid}`), F.serverTimestamp()).catch(() => {}) : null;
  soc.lastMsg = async other => {
    if (!ok()) return null;
    const s = await F.get(F.query(R(`ch/${cidOf(other)}/m`), F.limitToLast(1))).catch(() => null);
    let out = null; s?.forEach(c => { out = { id: c.key, ...c.val() }; }); return out;
  };
  soc.readAt = async other => { if (!ok()) return 0; const s = await F.get(R(`ch/${cidOf(other)}/r/${state.uid}`)).catch(() => null); return (s && s.val()) || 0; };
  soc.trade = async (other, id, accept, pet) => {
    if (!ok()) return false;
    const v = { by: state.uid, ok: !!accept, at: F.serverTimestamp() }; if (accept && pet) v.pet = pet;
    try { await F.set(R(`ch/${cidOf(other)}/x/${id}`), v); F.set(R(`ping/${other}/${state.uid}`), F.serverTimestamp()).catch(() => {}); return true; } catch (e) { console.warn('[soc]', e); return false; }
  };
  soc.tradeResult = async (other, id) => { if (!ok()) return null; const s = await F.get(R(`ch/${cidOf(other)}/x/${id}`)).catch(() => null); return s && s.exists() ? s.val() : null; };
  // tek dinleyici: kimden yeni mesaj geldi (uygulama genelinde rozet ve bildirim için)
  soc.onPings = cb => { if (!ok()) return () => {}; return F.onValue(R('ping/' + state.uid), s => cb(s.val() || {})); };
  soc.report = (aboutCode, other, text) => ok() ? F.set(F.push(R('rep')), { from: state.uid, about: String(aboutCode || '').slice(0, 8), cid: other ? cidOf(other) : '', text: String(text || '').slice(0, 600), at: F.serverTimestamp() }).then(() => true).catch(() => false) : Promise.resolve(false);
  api.soc = soc;
  // İngilizce Hazırlık bankası: sınıf koduyla katılma; banka yalnızca üyelere açık (kurallar denetler)
  api.prep = {
    ready: () => !!(F && state.uid && state.db),
    member: async () => { if (!api.prep.ready()) return null; try { return (await F.get(F.ref(state.db, 'prep/members/' + state.uid))).exists(); } catch { return null; } },
    join: async code => { if (!api.prep.ready()) return 'offline'; try { await F.set(F.ref(state.db, 'prep/members/' + state.uid), String(code).trim().toUpperCase()); return 'ok'; } catch { return 'bad'; } },
    ver: async () => { try { return (await F.get(F.ref(state.db, 'prep/ver'))).val() || 0; } catch { return 0; } },
    bank: async () => { try { const s2 = await F.get(F.ref(state.db, 'prep/bank')); return s2.exists() ? s2.val() : null; } catch { return null; } },
  };

  return api;
}
