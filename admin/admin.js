// dam-la yönetici paneli — uygulamadan bağımsız web sayfası.
// Uygulama her cihazda anonim bir Firebase kimliğiyle users/{uid} altına durumunu yazar;
// bu panel Google ile giriş yapan yöneticiye (database.rules.json) tümünü canlı gösterir
// ve users/{uid}/inbox altına XP, seviye, ödül ve mesaj gönderir.
import { initializeApp } from 'firebase/app';
import { initializeAuth, browserSessionPersistence, browserPopupRedirectResolver, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from 'firebase/auth';
import { getDatabase, ref, onValue, push, set, update, remove, serverTimestamp, query, limitToLast, get } from 'firebase/database';
import { FIREBASE_CONFIG } from '../src/config.js';
import { SUBJECTS, SUBJECT_ORDER } from '../src/data/subjects.js';
import { DEPARTMENTS } from '../src/data/departments.js';
import { THEMES } from '../src/themes.js';
import { petSVG, stageName, PET_SPECIES } from '../src/pet-art.js';

// Başka bir sitenin paneli görünmez çerçeve içinde açıp tıklatmasını engelle (clickjacking).
if (window.top !== window.self) { document.documentElement.style.display = 'none'; try { window.top.location = window.self.location.href; } catch {} }

const $ = s => document.querySelector(s);
// Kullanıcı cihazından gelen her değer güvenilmezdir: metinler kaçışlanır, sayılar sayıya zorlanır.
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = v => { const n = Number(v); return Number.isFinite(n) ? Math.round(n) : 0; };
const safeKey = k => /^[A-Za-z0-9_-]{1,128}$/.test(k);
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LEVEL_LABELS = ['Başlangıç', 'Temel', 'Orta', 'Orta-üst', 'İleri', 'Uzman'];
const THRESHOLDS = [0, 36, 84, 132, 180, 228];
const CAT_XP_STEP = 40;
const CATS = [{ id: 'en', icon: '🇬🇧', label: 'İngilizce' }, ...SUBJECT_ORDER.map(id => ({ id, icon: SUBJECTS[id].icon, label: SUBJECTS[id].label }))];
const catInfo = id => CATS.find(c => c.id === id) || (id === 'mix' ? { id, icon: '🔀', label: 'Karışık' } : { id, icon: '•', label: id || '—' });
const MODE_LABEL = { type: 'Yazarak', quiz: 'Pop Quiz', listen: 'Dinleyerek', mix: 'Karışık' };
const TYPE_ICON = { message: '✉️', xp: '⭐', level: '🎓', reward: '🎁', pet: '🐾' };
// ---- pet ----
const PET_KINDS = { plant: { label: 'Bitki', food: '💧', foodLabel: 'Su' }, chick: { label: 'Civciv', food: '🌾', foodLabel: 'Yem' }, cat: { label: 'Kedi', food: '🐟', foodLabel: 'Mama' }, dog: { label: 'Köpek', food: '🦴', foodLabel: 'Mama' } };
const PET_MOODS = ['idle', 'happy', 'love', 'sad', 'sleep', 'groggy', 'sleepy', 'poked', 'surprised', 'hungry', 'focus', 'full', 'eat', 'dead'];
const MOOD_TR = { idle: 'keyifli', happy: 'mutlu', love: 'sevgi dolu', sad: 'üzgün', sleep: 'uyuyor', groggy: 'mahmur', sleepy: 'uykulu', poked: 'dürtülmüş', surprised: 'şaşkın', hungry: 'aç', focus: 'odaklanmış', full: 'mayışmış', eat: 'yiyor', dead: 'öldü' };
const PET_ACT = { heal: '❤️ Can dolduruldu', feed: '🍖 Beslendi', energy: '⚡ Enerji dolduruldu', restore: '✨ Hepsi dolduruldu', revive: '💫 Canlandırıldı', set: '🛠️ Değerler ayarlandı', stage: '🧬 Form', name: '🏷️ Ad', species: '🔄 Tür', flow: '🌊 Flow', roam: '🐾 Dolaşma', say: '💬 Konuştu', react: '🎭 Tepki', reset: '🐾 Pet sıfırlandı' };
const REACT_TR = { love: 'sevgi', joy: 'sevinç', dance: 'dans', shock: 'irkilme', sad: 'hüzün', sleep: 'uyuklama' };
// Cihazdan gelen pet kaydı güvenilmez: her alan doğrulanır.
function validPet(p) {
  if (!p || typeof p !== 'object' || typeof p.species !== 'string' || !Object.prototype.hasOwnProperty.call(PET_KINDS, p.species)) return null;
  const n = (v, max = 100000) => Math.max(0, Math.min(max, num(v)));
  return {
    species: p.species, stage: n(p.stage, 5), stars: n(p.stars, 9999), name: String(p.name || 'Pet').slice(0, 16), alive: p.alive !== false,
    hp: n(p.hp), hpMax: Math.max(1, n(p.hpMax)), food: n(p.food), foodMax: Math.max(1, n(p.foodMax)), energy: n(p.energy), energyMax: Math.max(1, n(p.energyMax)),
    stuffed: n(p.stuffed, 100), flow: p.flow === true, roam: p.roam !== false, mood: PET_MOODS.includes(p.mood) ? p.mood : 'idle',
    streak: n(p.streak), correct: n(p.correct), answers: n(p.answers), revives: n(p.revives), memorial: n(p.memorial, 100), catchUp: n(p.catchUp, 20),
    deathCat: /^[a-z]{2,6}$/.test(p.deathCat || '') ? p.deathCat : '', updatedAt: n(p.updatedAt, 1e13),
  };
}
const pct = (v, m) => Math.round(Math.max(0, Math.min(1, v / m)) * 100);
const icon = t => Object.prototype.hasOwnProperty.call(TYPE_ICON, t) ? TYPE_ICON[t] : '•';

let db, auth, me = null, serverOffset = 0;
let users = {}, labels = {}, filter = 'all', selected = null, histUnsub = null, history = [];
const now = () => Date.now() + serverOffset;

function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2600); }
function ago(ts) {
  ts = num(ts);
  if (!ts) return '—';
  const s = Math.max(0, Math.round((now() - ts) / 1000));
  if (s < 45) return 'az önce';
  if (s < 3600) return `${Math.round(s / 60)} dk önce`;
  if (s < 86400) return `${Math.round(s / 3600)} sa önce`;
  const d = Math.round(s / 86400);
  return d < 30 ? `${d} gün önce` : new Date(ts).toLocaleDateString('tr-TR');
}
const isOnline = u => u?.status?.state === 'online';
const lastSeen = u => Math.max(num(u?.status?.last), num(u?.live?.at), num(u?.stats?.updatedAt), num(u?.profile?.lastOpen));
const isToday = u => { const t = lastSeen(u); if (!t) return false; const d = new Date(t), n = new Date(now()); return d.toDateString() === n.toDateString(); };
const shortId = (u, uid) => String(u?.profile?.shortId || u?.stats?.shortId || uid.slice(0, 6)).slice(0, 12);
const catXpOf = (u, cat) => num(cat === 'en' ? u?.stats?.xp : u?.stats?.catXp?.[cat]);

// ---------------- başlangıç ----------------
const configured = !!(FIREBASE_CONFIG?.apiKey && FIREBASE_CONFIG?.databaseURL);
if (!configured) {
  $('#loginCard').classList.add('hidden'); $('#setupCard').classList.remove('hidden');
} else {
  // Ayrı uygulama adı: aynı alan adındaki dam-la web uygulamasının anonim oturumuyla karışmaz.
  // Oturum yalnızca bu sekmede tutulur; sekme kapanınca çıkış yapılmış olur (paylaşılan bilgisayarda güvenli).
  const app = initializeApp(FIREBASE_CONFIG, 'dam-la-admin');
  auth = initializeAuth(app, { persistence: browserSessionPersistence, popupRedirectResolver: browserPopupRedirectResolver });
  db = getDatabase(app);
  onValue(ref(db, '.info/serverTimeOffset'), s => { serverOffset = s.val() || 0; });
  getRedirectResult(auth).catch(e => showLoginError(e));
  onAuthStateChanged(auth, user => {
    if (!user || user.isAnonymous) { me = null; showLogin(); return; }
    me = user; startDashboard();
  });
}
fillCatSelects();

$('#signIn').addEventListener('click', async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  $('#loginNote').textContent = '';
  try { await signInWithPopup(auth, provider); }
  catch (e) {
    if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment'].includes(e.code)) {
      // Yönlendirmeli giriş, panel ile giriş alanı farklı sitelerde olduğundan bazı tarayıcılarda sessizce başarısız olur;
      // bu yüzden kendiliğinden yönlendirmek yerine kullanıcıya seçenek sunulur.
      $('#loginNote').innerHTML = 'Tarayıcı Google giriş penceresini engelledi. Bu site için <b>açılır pencerelere izin ver</b> ve tekrar dene; ya da paneli Chrome/Safari’de aç. <button class="ghost small" id="redirectSignIn" type="button">Yönlendirmeyle dene</button>';
      $('#redirectSignIn').onclick = () => signInWithRedirect(auth, provider);
      return;
    }
    if (e.code === 'auth/cancelled-popup-request') return;
    showLoginError(e);
  }
});
$('#signOut').addEventListener('click', () => signOut(auth));

function showLoginError(e) {
  const map = { 'auth/unauthorized-domain': 'Bu alan adı Firebase’de yetkili değil (Authentication › Ayarlar › Yetkili alan adları).', 'auth/popup-closed-by-user': 'Giriş penceresi kapatıldı.', 'auth/operation-not-allowed': 'Firebase’de Google ile giriş açık değil.' };
  $('#loginNote').textContent = map[e?.code] || (e?.message || String(e));
}
function showLogin() {
  $('#loginCard').classList.remove('hidden'); $('#dash').classList.add('hidden'); $('#who').classList.add('hidden');
  closeSheet(); stopListeners();
}

let unsubs = [];
function stopListeners() { unsubs.forEach(u => u()); unsubs = []; users = {}; }
function startDashboard() {
  $('#loginCard').classList.add('hidden'); $('#who').classList.remove('hidden');
  $('#whoEmail').textContent = me.email || me.uid;
  stopListeners();
  unsubs.push(onValue(ref(db, 'users'), snap => {
    users = Object.fromEntries(Object.entries(snap.val() || {}).filter(([k, v]) => safeKey(k) && v && typeof v === 'object'));
    $('#dash').classList.remove('hidden');
    renderList(); if (selected) renderSheet();
  }, err => {
    $('#dash').classList.add('hidden'); $('#loginCard').classList.remove('hidden');
    $('#loginNote').innerHTML = `<b>${esc(me.email)}</b> hesabının yönetici yetkisi yok.<br>Yetki vermek için Firebase konsolunda <b>Realtime Database › Data</b> altında <code>admins</code> › <code>${esc(me.uid)}</code> = <code>true</code> kaydı ekle, sonra sayfayı yenile.`;
  }));
  unsubs.push(onValue(ref(db, 'admin/labels'), snap => { labels = snap.val() || {}; renderList(); if (selected) renderSheet(); }, () => {}));
}
// "x dk önce" yazıları güncel kalsın
setInterval(() => { if (me && Object.keys(users).length) { renderList(); if (selected) renderMeta(); } }, 30000);

// ---------------- liste ----------------
$('#search').addEventListener('input', renderList);
$('#filterSeg').addEventListener('click', e => {
  const b = e.target.closest('[data-f]'); if (!b) return;
  filter = b.dataset.f; [...$('#filterSeg').children].forEach(x => x.classList.toggle('on', x === b)); renderList();
});
function liveLine(u) {
  const l = u.live; if (!l?.question) return '';
  const c = catInfo(l.cat);
  const st = l.state ? ` <i>(${esc(l.state)})</i>` : '';
  return `<div class="u-live">${isOnline(u) ? '<b>Şu an:</b>' : '<b>Son soru:</b>'} ${c.icon} ${esc(c.label)} · ${esc(l.mode || '')} — “${esc(String(l.question).slice(0, 140))}”${st}</div>`;
}
function petLine(u) {
  const p = validPet(u.pet); if (!p) return '';
  const k = PET_KINDS[p.species];
  if (!p.alive) return `<div class="u-pet dead">🕊️ ${esc(p.name)} öldü · ${esc(stageName(p.species, p.stage))}</div>`;
  const m = (ic, v, mx) => { const x = pct(v, mx); return `<span class="pm ${x < 25 ? 'low' : ''}">${ic} ${x}%</span>`; };
  return `<div class="u-pet">🐾 <b>${esc(p.name)}</b> · ${esc(stageName(p.species, p.stage))}${p.stars ? ` · ${p.stars}⭐` : ''} ${m('❤️', p.hp, p.hpMax)} ${m(k.food, p.food, p.foodMax)} ${m('⚡', p.energy, p.energyMax)}</div>`;
}
function renderList() {
  const q = $('#search').value.trim().toLocaleLowerCase('tr');
  const entries = Object.entries(users).map(([uid, u]) => ({ uid, u, on: isOnline(u), seen: lastSeen(u) }));
  $('#sumTotal').textContent = entries.length;
  $('#sumOnline').textContent = entries.filter(e => e.on).length;
  $('#sumToday').textContent = entries.filter(e => isToday(e.u)).length;
  const list = entries
    .filter(e => filter === 'all' || (filter === 'online' ? e.on : isToday(e.u)))
    .filter(e => !q || `${shortId(e.u, e.uid)} ${labels[e.uid] || ''} ${e.uid}`.toLocaleLowerCase('tr').includes(q))
    .sort((a, b) => (b.on - a.on) || (b.seen - a.seen));
  $('#emptyList').classList.toggle('hidden', list.length > 0);
  $('#userList').innerHTML = list.map(({ uid, u, on, seen }) => {
    const s = u.stats || {}, p = u.profile || {};
    return `<button class="u" data-uid="${esc(uid)}">
      <div class="u-top"><span class="dot ${on ? 'on' : ''}"></span><span class="u-id">${esc(shortId(u, uid))}</span><span class="u-name">${esc(labels[uid] || '')}</span>
      <span class="u-lvl">${esc(s.level || 'A1')} · ${num(s.total ?? s.xp)} XP</span></div>
      <div class="u-meta">${on ? 'Çevrimiçi' : 'Çevrimdışı · ' + ago(seen)} · ${esc(p.platform || '?')} · v${esc(p.appVersion || '?')}${s.correct != null ? ` · ✓${num(s.correct)} ✗${num(s.wrong)} 🔥${num(s.streak)}` : ''}</div>
      ${petLine(u)}${liveLine(u)}
    </button>`;
  }).join('');
}
$('#userList').addEventListener('click', e => { const b = e.target.closest('[data-uid]'); if (b) openSheet(b.dataset.uid); });

// ---------------- ayrıntı ----------------
function openSheet(uid) {
  selected = uid; history = [];
  $('#dLabel').value = labels[uid] || '';
  $('#sheet').classList.add('show'); $('#sheet').setAttribute('aria-hidden', 'false');
  histUnsub?.();
  histUnsub = onValue(query(ref(db, `history/${uid}`), limitToLast(40)), snap => {
    const v = snap.val() || {};
    history = Object.entries(v).filter(([id, m]) => safeKey(id) && m && typeof m === 'object').map(([id, m]) => ({ ...m, id })).sort((a, b) => (b.seenAt || 0) - (a.seenAt || 0));
    renderMsgs();
  }, () => { history = []; renderMsgs(); });
  renderSheet(); updateLevelForm(); fillPetForm();
}
function closeSheet() { selected = null; histUnsub?.(); histUnsub = null; $('#sheet').classList.remove('show'); $('#sheet').setAttribute('aria-hidden', 'true'); }
$('#sheetClose').addEventListener('click', closeSheet);
$('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') closeSheet(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeSheet(); $('#bcModal').classList.add('hidden'); } });

function renderMeta() {
  const u = users[selected]; if (!u) return;
  const p = u.profile || {};
  $('#dDot').className = 'dot' + (isOnline(u) ? ' on' : '');
  $('#dMeta').textContent = `${isOnline(u) ? 'Çevrimiçi' : 'Çevrimdışı · son görülme ' + ago(lastSeen(u))} · ${p.platform || '?'} · v${p.appVersion || '?'} · son açılış ${ago(p.lastOpen)}`;
}
function renderSheet() {
  const u = users[selected];
  if (!u) { closeSheet(); return; }
  const s = u.stats || {};
  $('#dId').textContent = shortId(u, selected);
  renderMeta();
  // canlı soru
  const l = u.live, live = $('#dLive');
  if (l?.question) {
    const c = catInfo(l.cat);
    live.innerHTML = `<div class="lh"><span>${isOnline(u) ? '● Şu an çözüyor' : 'Son çözdüğü soru'}</span><span>${ago(l.at)}</span></div>
      <div class="lq">${esc(l.question)}</div>
      ${Array.isArray(l.options) && l.options.length ? `<ol>${l.options.map(o => `<li class="${o === l.answer ? 'ans' : ''}">${esc(o)}</li>`).join('')}</ol>` : `<div class="ls">Doğru cevap: <b>${esc(l.answer || '—')}</b></div>`}
      <div class="ls">${c.icon} ${esc(c.label)} · ${esc(l.mode || '')} · ${esc(l.state || '')}</div>`;
    live.classList.remove('hidden');
  } else live.classList.add('hidden');
  // istatistikler
  const dept = DEPARTMENTS[s.dept]?.label || s.dept || '—';
  const theme = THEMES.find(t => t.id === s.theme)?.name || s.theme || '—';
  const cells = [
    [`${s.level || 'A1'} · ${s.levelLabel || LEVEL_LABELS[0]}`, 'İngilizce seviyesi'], [`${num(s.total)} XP`, 'Toplam XP'], [`${num(s.xp)} XP`, 'İngilizce XP'],
    [`${num(s.correct)} / ${num(s.wrong)}`, 'Doğru / yanlış'], [`${num(s.streak)} 🔥`, 'Seri'], [num(s.badges), 'Ödül rozeti'],
    [MODE_LABEL[s.mode] || s.mode || '—', 'Öğrenme biçimi'], [catInfo(s.cat).label, 'Açık sekme'], [theme, 'Tema'],
  ];
  $('#dStats').innerHTML = cells.map(([b, sm]) => `<div class="stat"><b>${esc(b)}</b><small>${esc(sm)}</small></div>`).join('')
    + `<div class="stat" style="grid-column:1/-1"><b style="font-size:14px">${esc(dept)}</b><small>Bölüm (kalibrasyon)</small></div>`;
  const cx = s.catXp || {};
  $('#dCats').innerHTML = SUBJECT_ORDER.map(id => {
    const xp = num(cx[id]);
    return `<span>${SUBJECTS[id].icon} ${esc(SUBJECTS[id].label)} · <b>Sv ${Math.floor(xp / CAT_XP_STEP) + 1}</b> · ${xp} XP</span>`;
  }).join('');
  renderPet();
  renderMsgs(); updateLevelForm();
}
function renderPet() {
  const u = users[selected]; if (!u) return;
  const p = validPet(u.pet), box = $('#dPet');
  $('#petNone').classList.toggle('hidden', !!p);
  if (!p) {
    box.className = 'petcard empty';
    box.textContent = 'Pet bilgisi yok. Kullanıcı henüz pet seçmemiş ya da uygulaması 2.2.3’ten eski (güncellenince burada görünür).';
  } else {
    const k = PET_KINDS[p.species];
    const bar = (cls, ic, v, mx) => `<div class="pbar ${cls}"><span>${ic}</span><div class="t"><i style="width:${pct(v, mx)}%"></i></div><b>${v}/${mx}</b></div>`;
    const chips = [
      p.alive ? `<span>${esc(MOOD_TR[p.mood] || p.mood)}</span>` : `<span class="bad">🕊️ öldü${p.deathCat ? ' · ' + esc(catInfo(p.deathCat).label) : ''}</span>`,
      p.flow ? '<span class="on">🌊 flow</span>' : '', !p.roam ? '<span>🏠 yuvada</span>' : '', p.stuffed >= 30 ? '<span>😌 tok</span>' : '',
      p.streak ? `<span>🔥 ${p.streak} seri</span>` : '', `<span>✅ ${p.correct} doğru</span>`, p.revives ? `<span>💫 ${p.revives} canlanma</span>` : '',
      p.catchUp ? `<span class="on">🔁 ${p.catchUp} telafi</span>` : '', p.memorial ? `<span>🕊️ ${p.memorial} anı</span>` : '',
    ].join('');
    box.className = 'petcard' + (p.alive ? '' : ' isdead');
    // çizim yalnızca doğrulanmış tür/aşama/ruh hali ile üretilir
    box.innerHTML = `<div class="pa">${petSVG(p.species, p.stage, { mood: p.alive ? p.mood : 'dead', pose: p.alive ? (p.mood === 'sleep' ? 'loaf' : 'sit') : 'flat', belly: p.stuffed / 100 })}</div>
      <div><div class="pn">${esc(p.name)}${p.stars ? ` <small>${p.stars}⭐</small>` : ''}</div><div class="pf">${esc(stageName(p.species, p.stage))} · ${esc(k.label)} · Form ${p.stage + 1}/6</div>
      <div class="chips">${chips}</div>
      ${bar('hp', '❤️', p.hp, p.hpMax)}${bar(p.species === 'plant' ? 'water' : 'food', k.food, p.food, p.foodMax)}${bar('en', '⚡', p.energy, p.energyMax)}
      <small class="upd">Güncellendi: ${ago(p.updatedAt)}</small></div>`;
  }
  // işlem formundaki durum yazıları
  const f = $('#fPet'), kind = PET_KINDS[p?.species] || PET_KINDS.cat;
  $('#paFeed').textContent = p?.species === 'plant' ? '💧 Sula' : `${kind.food} Besle`;
  $('#pFoodLbl').textContent = `${kind.food} ${kind.foodLabel}`;
  $('#paRevive').disabled = !!p && p.alive;
  $('#paFlow').textContent = p?.flow ? '🌊 Flow’u kapat' : '🌊 Flow’u aç';
  $('#paRoam').textContent = p && !p.roam ? '🐾 Dolaşmayı aç' : '🐾 Dolaşmayı kapat';
  const sp = p?.species || f.species.value || 'cat';
  if (f.dataset.sp !== sp || !f.stage.options.length) {
    f.stage.innerHTML = [0, 1, 2, 3, 4, 5].map(i => `<option value="${i}">${i + 1} · ${esc(stageName(sp, i))}</option>`).join('');
    f.dataset.sp = sp;
  }
  if (!f.species.options.length) f.species.innerHTML = Object.entries(PET_KINDS).map(([id, k2]) => `<option value="${id}">${esc(k2.label)}</option>`).join('');
}
// form alanlarını kullanıcının petiyle doldur (yalnızca kişi değişince ya da sekme açılınca)
function fillPetForm() {
  const u = users[selected], p = validPet(u?.pet), f = $('#fPet'); if (!f) return;
  renderPet();
  const set = (name, v) => { const el = f[name]; el.value = v; const o = el.parentElement.querySelector('output'); if (o) o.textContent = v + '%'; };
  set('hp', p ? Math.max(1, pct(p.hp, p.hpMax)) : 100); set('food', p ? pct(p.food, p.foodMax) : 100); set('energy', p ? pct(p.energy, p.energyMax) : 100);
  f.stage.value = String(p ? p.stage : 0); f.stars.value = p ? p.stars : 0;
  f.name.value = p ? p.name : ''; f.species.value = p ? p.species : 'cat';
}
function msgLine(m) {
  if (m.type === 'xp') return `${num(m.amount) > 0 ? '+' : ''}${num(m.amount)} XP · ${catInfo(m.cat).label}${m.text ? ' — ' + m.text : ''}`;
  if (m.type === 'level') return `Seviye → ${m.cat && m.cat !== 'en' ? catInfo(m.cat).label + ' ' : ''}${m.level || m.catLevel}${m.text ? ' — ' + m.text : ''}`;
  if (m.type === 'pet') {
    const a = PET_ACT[m.action] || '🐾 Pet komutu';
    if (m.action === 'set') return `${a}: ❤️ ${num(m.hp)}% · yemek ${num(m.food)}% · ⚡ ${num(m.energy)}%`;
    if (m.action === 'stage') return `${a} → ${num(m.stage) + 1}${m.stars != null ? ` · ${num(m.stars)}⭐` : ''}`;
    if (m.action === 'name') return `${a} → ${m.name || ''}`;
    if (m.action === 'species') return `${a} → ${PET_KINDS[m.species]?.label || ''}`;
    if (m.action === 'flow' || m.action === 'roam') return `${a} ${m.on ? 'açıldı' : 'kapandı'}`;
    if (m.action === 'say') return `${a}: “${m.text || ''}”${m.emote ? ' + emote' : ''}`;
    if (m.action === 'react') return `${a}: ${REACT_TR[m.emote] || m.emote || ''}`;
    return a + (m.broadcast ? ' (herkese)' : '');
  }
  if (m.type === 'reward') return `${m.emoji || '🎁'} ${m.title || 'Ödül'}${num(m.amount) ? ` · ${num(m.amount) > 0 ? '+' : ''}${num(m.amount)} XP` : ''}${m.text ? ' — ' + m.text : ''}`;
  return `${m.title ? m.title + ': ' : ''}${m.text || ''}`;
}
function renderMsgs() {
  const u = users[selected]; if (!u) return;
  const pending = Object.entries(u.inbox || {}).filter(([id, m]) => safeKey(id) && m && typeof m === 'object').map(([id, m]) => ({ ...m, id })).sort((a, b) => (b.at || 0) - (a.at || 0));
  $('#dPending').innerHTML = pending.length ? pending.map(m => `<div class="msg"><span class="mi">${icon(m.type)}</span><div class="mb">${esc(msgLine(m))}<small>${ago(m.at)} gönderildi</small></div><button data-cancel="${esc(m.id)}">İptal</button></div>`).join('') : '<div class="none">Bekleyen gönderi yok.</div>';
  $('#dHistory').innerHTML = history.length ? history.map(m => `<div class="msg"><span class="mi">${icon(m.type)}</span><div class="mb">${esc(msgLine(m))}<small>${ago(m.seenAt)} teslim edildi${m.at ? ' · gönderim ' + ago(m.at) : ''}</small></div></div>`).join('') : '<div class="none">Henüz teslim edilen yok.</div>';
}
$('#dPending').addEventListener('click', async e => {
  const b = e.target.closest('[data-cancel]'); if (!b || !selected) return;
  await remove(ref(db, `users/${selected}/inbox/${b.dataset.cancel}`)).then(() => toast('Gönderi iptal edildi')).catch(err => toast('Olmadı: ' + err.code));
});
$('#dLabelSave').addEventListener('click', async () => {
  if (!selected) return;
  const v = $('#dLabel').value.trim().slice(0, 60);
  await set(ref(db, `admin/labels/${selected}`), v || null).then(() => toast('İsim kaydedildi')).catch(err => toast('Olmadı: ' + err.code));
});
$('#dDelete').addEventListener('click', async () => {
  if (!selected) return;
  const id = shortId(users[selected], selected);
  if (!confirm(`${id} kaydı panelden silinsin mi? (Uygulama tekrar açılırsa yeniden görünür; cihazdaki ilerleme silinmez.)`)) return;
  const uid = selected; closeSheet();
  await update(ref(db), { [`users/${uid}`]: null, [`history/${uid}`]: null, [`admin/labels/${uid}`]: null }).then(() => toast('Kayıt silindi')).catch(err => toast('Olmadı: ' + err.code));
});

// ---------------- işlemler ----------------
function fillCatSelects() {
  document.querySelectorAll('.catSel').forEach(sel => { sel.innerHTML = CATS.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join(''); });
}
$('#actTabs').addEventListener('click', e => {
  const b = e.target.closest('[data-t]'); if (!b) return;
  [...$('#actTabs').children].forEach(x => x.classList.toggle('on', x === b));
  document.querySelectorAll('form.act').forEach(f => f.classList.toggle('hidden', f.dataset.t !== b.dataset.t));
  if (b.dataset.t === 'pet') fillPetForm();
});
document.querySelector('#fXp .quick').addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (b) $('#fXp').amount.value = b.dataset.q; });

async function send(uid, msg) {
  const r = push(ref(db, `users/${uid}/inbox`));
  await set(r, { ...msg, at: serverTimestamp(), by: 'yönetici' }); // e-posta kullanıcıya gönderilmez
  return r.key;
}
async function sendSelected(msg, okText) {
  if (!selected) return;
  try { await send(selected, msg); toast(`${okText} · ${isOnline(users[selected]) ? 'hemen teslim edilecek' : 'uygulama açılınca teslim edilecek'}`); }
  catch (e) { toast('Gönderilemedi: ' + (e.code || e.message)); }
}
$('#fXp').addEventListener('submit', e => {
  e.preventDefault(); const f = e.target;
  const amount = Math.round(Number(f.amount.value) || 0); if (!amount) return toast('Miktar 0 olamaz');
  sendSelected({ type: 'xp', amount, cat: f.cat.value, text: f.text.value.trim() }, `${amount > 0 ? '+' : ''}${amount} XP gönderildi`);
  f.text.value = '';
});
function updateLevelForm() {
  const f = $('#fLevel'), u = users[selected]; if (!f || !u) return;
  const cat = f.cat.value, sel = $('#levelSel'), prev = sel.value;
  if (cat === 'en') {
    const cur = LEVELS.indexOf(u.stats?.level || 'A1');
    sel.innerHTML = LEVELS.map((l, i) => `<option value="${l}" ${i === cur ? 'selected' : ''}>${l} · ${LEVEL_LABELS[i]}</option>`).join('');
    $('#levelNote').textContent = `Şu an: ${LEVELS[Math.max(0, cur)]}. Seviye düşürülse de en az bu seviyede kalır; İngilizce XP’si seviyenin başlangıcına ayarlanır.`;
  } else {
    const xp = catXpOf(u, cat), cur = Math.floor(xp / CAT_XP_STEP) + 1;
    sel.innerHTML = Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${i + 1 === cur ? 'selected' : ''}>Seviye ${i + 1}</option>`).join('');
    $('#levelNote').textContent = `Şu an: Seviye ${cur} (${xp} XP). Her seviye ${CAT_XP_STEP} XP; fark XP olarak gönderilir.`;
  }
  if (prev && [...sel.options].some(o => o.value === prev) && f.dataset.cat === cat) sel.value = prev;
  f.dataset.cat = cat;
}
$('#fLevel').cat.addEventListener('change', updateLevelForm);
$('#fLevel').addEventListener('submit', e => {
  e.preventDefault(); const f = e.target, u = users[selected]; if (!u) return;
  const cat = f.cat.value, text = f.text.value.trim();
  if (cat === 'en') return sendSelected({ type: 'level', cat: 'en', level: f.level.value, text }, `Seviye ${f.level.value} olarak gönderildi`);
  const target = Number(f.level.value), delta = (target - 1) * CAT_XP_STEP - catXpOf(u, cat);
  if (!delta) return toast('Zaten bu seviyede');
  sendSelected({ type: 'xp', amount: delta, cat, catLevel: target, text: text || `${catInfo(cat).label} seviyen ${target} olarak ayarlandı` }, `${catInfo(cat).label} → Seviye ${target}`);
});
$('#fReward').addEventListener('submit', e => {
  e.preventDefault(); const f = e.target;
  sendSelected({ type: 'reward', emoji: f.emoji.value.trim() || '🎁', title: f.title.value.trim(), text: f.text.value.trim(), amount: Math.round(Number(f.amount.value) || 0), cat: f.cat.value, music: f.music.checked }, 'Ödül gönderildi');
});
$('#fMessage').addEventListener('submit', e => {
  e.preventDefault(); const f = e.target;
  sendSelected({ type: 'message', title: f.title.value.trim(), text: f.text.value.trim() }, 'Mesaj gönderildi');
  f.text.value = '';
});

// ---------------- pet işlemleri ----------------
$('#fPet').addEventListener('submit', e => e.preventDefault());
$('#fPet').addEventListener('input', e => { if (e.target.type === 'range') { const o = e.target.parentElement.querySelector('output'); if (o) o.textContent = e.target.value + '%'; } });
$('#fPet').addEventListener('change', e => { if (e.target.name === 'species') renderPet(); });
$('#fPet').addEventListener('click', e => {
  const b = e.target.closest('[data-pa],[data-pr]'); if (!b || !selected) return;
  const f = $('#fPet'), p = validPet(users[selected]?.pet), name = p ? p.name : 'Pet';
  const pet = (o, ok) => sendSelected({ type: 'pet', ...o }, ok);
  if (b.dataset.pr) return pet({ action: 'react', emote: b.dataset.pr }, `${name}: ${REACT_TR[b.dataset.pr]} tepkisi`);
  const a = b.dataset.pa;
  switch (a) {
    case 'heal': return pet({ action: a }, p && !p.alive ? `${name} canlandırılıyor` : `${name} canı dolduruluyor`);
    case 'feed': return pet({ action: a }, p?.species === 'plant' ? `${name} sulanıyor` : `${name} besleniyor`);
    case 'energy': return pet({ action: a }, `${name} enerjisi dolduruluyor`);
    case 'restore': return pet({ action: a }, `${name} tamamen tazeleniyor`);
    case 'revive': return pet({ action: a }, `${name} canlandırılıyor`);
    case 'set': return pet({ action: a, hp: Math.max(1, num(f.hp.value)), food: num(f.food.value), energy: num(f.energy.value) }, 'Değerler gönderildi');
    case 'stage': {
      const stage = Math.max(0, Math.min(5, num(f.stage.value))), stars = Math.max(0, Math.min(999, num(f.stars.value)));
      return pet({ action: a, stage, stars }, `Form ${stage + 1} · ${stars}⭐ gönderildi`);
    }
    case 'name': {
      const n = f.name.value.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16);
      if (!n) return toast('Ad boş olamaz');
      return pet({ action: a, name: n }, `Ad → ${n}`);
    }
    case 'species': {
      const s2 = f.species.value; if (!Object.prototype.hasOwnProperty.call(PET_KINDS, s2)) return;
      if (p && p.species === s2) return toast('Zaten bu tür');
      if (!confirm(`${name} ${PET_KINDS[s2].label.toLocaleLowerCase('tr')} olsun mu? Form numarası korunur.`)) return;
      return pet({ action: a, species: s2 }, `Tür → ${PET_KINDS[s2].label}`);
    }
    case 'flow': { const on = !(p?.flow); return pet({ action: a, on }, `Flow ${on ? 'açılıyor' : 'kapanıyor'}`); }
    case 'roam': { const on = p ? !p.roam : false; return pet({ action: a, on }, `Dolaşma ${on ? 'açılıyor' : 'kapanıyor'}`); }
    case 'say': {
      const text = f.say.value.trim().slice(0, 200), emote = f.emote.value;
      if (!text && !emote) return toast('Bir şey yaz ya da emote seç');
      const msg = { action: a }; if (text) msg.text = text; if (emote) msg.emote = emote;
      f.say.value = '';
      return pet(msg, `${name} konuşacak`);
    }
    case 'reset':
      if (!confirm(`${name} anı köşesine uğurlansın ve kullanıcıya yeni pet seçtirilsin mi? Seviyeler etkilenmez.`)) return;
      return pet({ action: a }, 'Pet sıfırlama gönderildi');
  }
});

// ---------------- herkese gönder ----------------
let bcType = 'message';
$('#broadcastBtn').addEventListener('click', () => $('#bcModal').classList.remove('hidden'));
$('#bcCancel').addEventListener('click', () => $('#bcModal').classList.add('hidden'));
$('#bcType').addEventListener('click', e => {
  const b = e.target.closest('[data-t]'); if (!b) return; bcType = b.dataset.t;
  [...$('#bcType').children].forEach(x => x.classList.toggle('on', x === b));
  document.querySelectorAll('.bc-reward').forEach(x => x.classList.toggle('hidden', bcType !== 'reward'));
  document.querySelectorAll('.bc-text').forEach(x => x.classList.toggle('hidden', bcType === 'pet'));
  document.querySelectorAll('.bc-pet').forEach(x => x.classList.toggle('hidden', bcType !== 'pet'));
  ['title', 'text'].forEach(n => { $('#fBroadcast')[n].required = bcType !== 'pet'; });
});
$('#fBroadcast').addEventListener('submit', async e => {
  e.preventDefault(); const f = e.target;
  const targets = Object.keys(users).filter(uid => (!f.onlineOnly.checked || isOnline(users[uid])) && (bcType !== 'pet' || validPet(users[uid].pet)));
  if (!targets.length) return toast('Gönderilecek kullanıcı yok');
  if (!confirm(`${targets.length} kullanıcıya gönderilsin mi?`)) return;
  const msg = bcType === 'pet' ? { type: 'pet', action: 'restore' } : bcType === 'reward'
    ? { type: 'reward', emoji: f.emoji.value.trim() || '🎉', title: f.title.value.trim(), text: f.text.value.trim(), amount: Math.round(Number(f.amount.value) || 0), cat: f.cat.value, music: true }
    : { type: 'message', title: f.title.value.trim(), text: f.text.value.trim() };
  const patch = {};
  targets.forEach(uid => { patch[`users/${uid}/inbox/${push(ref(db, `users/${uid}/inbox`)).key}`] = { ...msg, at: serverTimestamp(), by: 'yönetici', broadcast: true }; });
  try { await update(ref(db), patch); toast(`${targets.length} kullanıcıya gönderildi`); $('#bcModal').classList.add('hidden'); }
  catch (err) { toast('Gönderilemedi: ' + (err.code || err.message)); }
});
