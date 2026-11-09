// dam-la pet sistemi: bakıma muhtaç, evrimleşen, ekranda dolaşan küçük arkadaş.
// Durum app.pet içinde saklanır (yedeğe ve kalıcı kayda otomatik girer).
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { petSVG, homeSVG, stageName, PET_SPECIES } from './pet-art.js';
import { CAT_XP_STEP, catLabel } from './quiz.js';
import { SUBJECT_ORDER } from './data/subjects.js';

const HOUR = 3600e3;
const ORDER = ['plant', 'chick', 'cat', 'dog'];
export const PET_SPECS = {
  plant: {
    name: 'Filiz', hp: 100, food: 140, energy: 100, foodLabel: 'Su', foodIcon: '💧', treat: '💧', perk: 'Büyük su deposu',
    passive: { name: 'Fotosentez', desc: 'Gündüz (08–18) susuzluğu ve enerji kaybı yarı hızda.' },
    active: { id: 'weed', name: 'Ayıkla', cost: 20, desc: 'Seçenekli soruda 2 yanlış şıkkı eler; yazmalı soruda XP cezası olmadan 1 harf açar.' },
    love: ['Yapraklarım titredi 🌿', 'Güneş gibisin ☀️', 'Kökümden mutluyum 🌱'],
  },
  chick: {
    name: 'Pıtırcık', hp: 100, food: 100, energy: 140, foodLabel: 'Yem', foodIcon: '🌾', treat: '🌾', perk: 'Ekstra enerji',
    passive: { name: 'Erken Kuş', desc: 'Sabah 06–12 arasında doğru cevaplar %25 fazla XP verir.' },
    active: { id: 'peek', name: 'Cik İpucu', cost: 15, desc: 'Cevabın ilk harfini, harf ve kelime sayısını fısıldar.' },
    love: ['Cik cik! 💛', 'Tüylerim kabardı 🐣', 'En sevdiğim sensin!'],
  },
  cat: {
    name: 'Mırnav', hp: 130, food: 100, energy: 100, foodLabel: 'Mama', foodIcon: '🐟', treat: '🐟', perk: 'Ekstra can',
    passive: { name: 'Dokuz Can', desc: 'Günde bir kez ölümcül bir yanlışta 1 canla kurtulur.' },
    active: { id: 'skip', name: 'Pati Atla', cost: 25, desc: 'Soruyu cezasız ve serini bozmadan geçer.' },
    love: ['Mırr… 😽', 'Biraz daha kaşı 🐾', 'Tamam, seni seviyorum. Kimseye söyleme 😼'],
  },
  dog: {
    name: 'Hav', hp: 115, food: 115, energy: 100, foodLabel: 'Mama', foodIcon: '🦴', treat: '🦴', perk: 'Can + mama dengesi',
    passive: { name: 'Sadık Dost', desc: 'Her 5 doğruluk seride 10 can yeniler.' },
    active: { id: 'sniff', name: 'İz Sür', cost: 20, desc: '1 yanlış şıkkı eler ve bu soruda yanlış yaparsan canını korur.' },
    love: ['Hav hav! 🐶', 'Kuyruğum duramıyor!', 'En iyi arkadaşım sensin 💛'],
  },
};

const LINES = {
  greet: { dawn: ['Erkencisin… 🌅'], morning: ['Günaydın! ☀️ Bir soruyla uyanalım mı?', 'Kahve yok mu? ☕ O zaman bir soru!'], day: ['Hadi bir tane daha!', 'Bugün ne öğreniyoruz? 🤓'], evening: ['Akşam oldu… birkaç soru, sonra uyku 😪'], night: ['Zzz…'] },
  cheer: ['Sen yaparsın! 💪', 'Küçük adımlar, büyük ilerleme 🌱', 'Bugün harika gidiyorsun ✨', 'Bir soru daha, sonra mola? 😊', 'Merak etmek en güzel yetenek 🧠', 'Seninle öğrenmek çok güzel 💛'],
  wrong: ['Olsun, açıklamayı birlikte okuyalım 📖', 'Hata yapmak öğrenmenin parçası 🌱', 'Bir dahakine kesin bilirsin!', 'Derin nefes… devam 💪'],
  hungry: { plant: ['Susadım… 💧 Doğru cevaplar beni sular', 'Toprağım kurudu 🥀'], other: ['Karnım guruldadı… 🍖 Doğru cevaplar beni doyurur', 'Acıktım… bir soru çözsek mi? 🥺'] },
  full: ['Çok yedim… biraz mayıştım 😌', 'Karnım davul gibi 🥁', 'Bir şekerleme yapsam mı… 😴'],
  flow: ['Odaklandık! 🎯', 'Akıştasın, bozmayalım 🌊', 'Sessizce yanındayım 🤫', 'Bu tempo efsane 🔥'],
  low: ['Canım azaldı… dikkatli olalım 🥺', 'Biraz yaralıyım, açıklamaları iyi okuyalım 🩹'],
  missed: ['Seni özledim! 🥺 Neredeydin?', 'Döndün! 💛 Çok bekledim.'],
  tapped: ['Hey! 😤', 'Dürtme beni!', 'Ay! Gıdıklanıyor 😆', 'Ne var ne var? 👀'],
  flee: ['Yakalayamazsın! 💨', 'Kaç kaç! 🏃'],
  woke: ['Hıı? Uyuyordum… 😴', 'Beş dakika daha…', 'Gece gece ne oldu? 🌙'],
};

const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function initPet(core, quiz) {
  const $ = s => document.querySelector(s);
  const esc = core.esc;
  const A = () => core.app;
  const P = () => A().pet;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const notifyAvailable = () => { try { return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('LocalNotifications'); } catch { return false; } };

  // ---------- zaman ----------
  function clockNow() {
    try { const o = localStorage.getItem('dl-pet-clock'); if (o) { const [h, m] = o.split(':').map(Number); const d = new Date(); d.setHours(h, m || 0, 0, 0); return d; } } catch {}
    return new Date();
  }
  function phaseOf(d) {
    const m = d.getHours() * 60 + d.getMinutes();
    if (m >= 23 * 60 || m < 6 * 60) return 'night';
    if (m < 7 * 60 + 30) return 'dawn';
    if (m < 10 * 60) return 'morning';
    if (m < 20 * 60) return 'day';
    return 'evening';
  }
  const phase = () => phaseOf(clockNow());
  const isDaytime = d => d.getHours() >= 8 && d.getHours() < 18;
  const todayKey = () => new Date().toISOString().slice(0, 10);

  // ---------- durum ----------
  function maxes(p = P()) {
    const s = PET_SPECS[p.species], k = 1 + 0.06 * p.stage;
    return { hp: Math.round(s.hp * k), food: Math.round(s.food * k), energy: Math.round(s.energy * k) };
  }
  function normalize() {
    const app = A(); let p = app.pet;
    if (!app.petCatchUp || typeof app.petCatchUp !== 'object') app.petCatchUp = {};
    if (!app.petLevels || typeof app.petLevels !== 'object') app.petLevels = null;
    if (!Array.isArray(app.petMemorial)) app.petMemorial = [];
    if (!p || typeof p !== 'object' || !PET_SPECS[p.species]) { app.pet = null; return null; }
    const n = (v, d) => (Number.isFinite(+v) ? +v : d);
    p.stage = clamp(Math.floor(n(p.stage, 0)), 0, 5); p.stars = clamp(Math.floor(n(p.stars, 0)), 0, 999);
    const mx = maxes(p);
    p.hp = clamp(n(p.hp, mx.hp), 0, mx.hp); p.food = clamp(n(p.food, mx.food), 0, mx.food); p.energy = clamp(n(p.energy, mx.energy), 0, mx.energy);
    p.stuffed = clamp(n(p.stuffed, 0), 0, 100);
    p.name = String(p.name || PET_SPECS[p.species].name).slice(0, 16);
    p.alive = p.alive !== false; p.lastTick = n(p.lastTick, Date.now()); p.lastSeen = n(p.lastSeen, Date.now());
    p.flow = !!p.flow; p.flowCount = n(p.flowCount, 0); p.answers = n(p.answers, 0); p.correct = n(p.correct, 0); p.streak = n(p.streak, 0);
    p.roam = p.roam !== false; p.notify = p.notify !== false;
    if (p.death && typeof p.death !== 'object') p.death = null;
    return p;
  }
  function save(touch = false) { core.saveLocal(touch); }

  function tick() {
    const p = P(); if (!p) return;
    const now = Date.now();
    let t = Math.max(now - 14 * 24 * HOUR, p.lastTick || now);
    if (!p.alive || now <= t) { p.lastTick = now; return; }
    const mx = maxes(p);
    while (t < now) {
      const step = Math.min(HOUR / 2, now - t), h = step / HOUR, d = new Date(t + step / 2), ph = phaseOf(d);
      const asleep = ph === 'night' || ph === 'dawn' || p.energy <= 0;
      const foodRate = p.species === 'plant' && isDaytime(d) ? 2 : 4;
      p.food = clamp(p.food - foodRate * h, 0, mx.food);
      p.energy = clamp(p.energy + (asleep ? 20 : 8) * h, 0, mx.energy);
      p.stuffed = clamp(p.stuffed - 30 * h, 0, 100);
      if (p.food <= 0) { if (p.hp > mx.hp * 0.2) p.hp = Math.max(mx.hp * 0.2, p.hp - 3 * h); }
      else if (p.food > mx.food * 0.5) p.hp = clamp(p.hp + 4 * h, 0, mx.hp);
      t += step;
    }
    p.lastTick = now;
  }

  // ---------- seviye → evrim ----------
  function levelsNow() {
    const o = { en: core.levelIndex() };
    for (const id of SUBJECT_ORDER) o[id] = Math.floor((quiz.catXp(id) || 0) / CAT_XP_STEP);
    return o;
  }
  function checkLevels() {
    const app = A(), p = P(); const now = levelsNow();
    if (!app.petLevels) { app.petLevels = now; save(); return 0; }
    let gains = 0;
    for (const [k, v] of Object.entries(now)) {
      const prev = app.petLevels[k];
      if (prev == null) { app.petLevels[k] = v; continue; }
      if (v > prev) { gains += v - prev; app.petLevels[k] = v; }
    }
    checkCatchUp();
    if (gains && p && p.alive) evolveBy(gains);
    else if (gains) save();
    return gains;
  }
  const evoQueue = []; let evolving = false, deathPending = false;
  function evolveBy(n) {
    const p = P();
    for (let i = 0; i < n; i++) {
      if (p.stage < 5) { const from = p.stage; p.stage++; const mx = maxes(p); p.hp = Math.min(mx.hp, p.hp + mx.hp * 0.25); p.energy = Math.min(mx.energy, p.energy + 20); evoQueue.push({ type: 'evo', from, to: p.stage }); }
      else { p.stars++; evoQueue.push({ type: 'star', stars: p.stars }); }
    }
    p.evolvedAt = Date.now(); save(true);
    setTimeout(runEvoQueue, 1150);
  }

  // ---------- telafi (catch-up) ----------
  function catXpOf(cat) { return cat === 'en' ? A().xp : (quiz.catXp(cat) || 0); }
  function checkCatchUp() {
    const app = A(); if (!app.petCatchUp) app.petCatchUp = {}; const cu = app.petCatchUp;
    for (const [cat, info] of Object.entries(cu)) {
      if (catXpOf(cat) >= (info.target || 0)) {
        if (cat === 'en' && info.floor != null) app.levelFloor = info.floor;
        delete cu[cat];
        if (P()) say(`Telafi tamamlandı! ${catLabel(cat)} eski yerine döndü 🎉`, 4200);
      }
    }
  }
  function xpMod(cat, delta, right) {
    const p = P(); if (!(delta > 0)) return delta;
    let m = 1;
    const cu = A().petCatchUp?.[cat];
    if (cu && catXpOf(cat) < cu.target) m *= 2;
    if (p && p.alive && p.energy > 0) {
      if (p.species === 'chick') { const h = clockNow().getHours(); if (h >= 6 && h < 12) m *= 1.25; }
    }
    return Math.round(delta * m);
  }
  core.setXpMod(xpMod);
  core.setRewardBlock(() => !!(P()?.flow) || evoQueue.length > 0 || evolving || deathPending);

  // ---------- DOM: yuva paneli ----------
  const home = document.createElement('section');
  home.className = 'pet-home hidden'; home.id = 'petHome'; home.setAttribute('aria-label', 'Petin');
  home.innerHTML = `
    <div class="pet-hab" id="petHab" title="Petini çağır"><div class="pet-hab-bg" id="petHabBg"></div><div class="pet-away" id="petAway">🐾 Dolaşıyor · dokun, gelsin</div></div>
    <div class="pet-info">
      <div class="pet-title"><button class="pet-name" id="petNameBtn" aria-label="Pet bilgisi"><span id="petName">Pet</span> <span class="pet-stars" id="petStars"></span></button><span class="pet-form" id="petForm"></span></div>
      <div class="pet-status" id="petStatus"></div>
      <div class="pet-bars">
        <div class="pbar hp"><span class="pbi">❤️</span><div class="pbt"><i id="pbHp"></i></div><b id="pbHpT"></b></div>
        <div class="pbar food" id="pbFoodRow"><span class="pbi" id="pbFoodI">🍖</span><div class="pbt"><i id="pbFood"></i></div><b id="pbFoodT"></b></div>
        <div class="pbar energy" id="pbEnergyRow"><span class="pbi">⚡</span><div class="pbt"><i id="pbEnergy"></i><em class="resist" aria-hidden="true"></em></div><b id="pbEnergyT"></b></div>
      </div>
      <div class="pet-catchup hidden" id="petCatch"></div>
      <div class="pet-actions">
        <button class="pet-abil" id="petAbility"><span>✨</span><span class="pa-txt"><strong id="petAbilName">Yetenek</strong><small id="petAbilCost"></small></span></button>
        <button class="flow-btn" id="flowBtn" aria-pressed="false"><span class="flow-ico">🌊</span><span class="pa-txt"><strong>Flow</strong><small id="flowSmall">kapalı</small></span></button>
      </div>
    </div>`;
  const bar = document.querySelector('.quiz-bar');
  (bar ? bar.parentNode.insertBefore(home, bar.nextSibling) : document.querySelector('main')?.prepend(home));

  // ---------- DOM: dolaşan pet ----------
  const actorEl = document.createElement('div');
  actorEl.className = 'pet-actor hidden'; actorEl.id = 'petActor';
  actorEl.innerHTML = `<div class="pet-shadow"></div><div class="pet-sprite" id="petSprite"></div><div class="pet-fx" id="petFx"></div><div class="pet-bubble" id="petBubble" role="status" aria-live="polite"></div>`;
  document.body.appendChild(actorEl);
  const sprite = actorEl.querySelector('#petSprite'), fx = actorEl.querySelector('#petFx'), bubble = actorEl.querySelector('#petBubble');

  // ---------- DOM: katmanlar ----------
  const layer = (id, cls, html) => { const d = document.createElement('div'); d.className = `pet-overlay ${cls}`; d.id = id; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.innerHTML = html; document.body.appendChild(d); return d; };
  const chooser = layer('petChooser', 'chooser', `<div class="pet-modal"><div class="eyebrow">YENİ ARKADAŞIN</div><h2 id="pcTitle">Bir pet seç</h2><p id="pcLead">Doğru cevaplar onu besler, yanlışlar canını yakar. Her seviye atladığında evrimleşir. Ona iyi bak!</p><div class="pc-grid" id="pcGrid"></div><div class="pc-name hidden" id="pcNameBox"><label for="pcName">Adı ne olsun?</label><div class="pc-row"><input id="pcName" maxlength="16" autocomplete="off"><button class="primarybtn" id="pcAdopt">Sahiplen 🐾</button></div></div></div>`);
  const evoEl = layer('petEvo', 'evo', `<div class="evo-box"><div class="evo-stage"><div class="evo-rays"></div><div class="evo-old" id="evoOld"></div><div class="evo-new" id="evoNew"></div><div class="evo-sparks" id="evoSparks"></div></div><h2 id="evoTitle">Bir şeyler oluyor…</h2><p id="evoSub"></p><button class="primarybtn" id="evoOk" disabled>Harika!</button></div><div class="evo-flash"></div>`);
  const deathEl = layer('petDeath', 'death', `<div class="pet-modal"><div class="death-scene"><div class="death-ghost" id="deathPet"></div><div class="death-grave">🪦</div></div><h2 id="deathTitle"></h2><p id="deathLead"></p><div class="death-opts"><button class="death-opt" id="petRevive"><b>💫 Canlandır</b><span id="reviveTxt"></span></button><button class="death-opt" id="petNew"><b>🥚 Yeni pet</b><span id="newTxt"></span></button></div></div>`);
  const infoEl = layer('petInfo', 'info', `<div class="pet-modal"><div class="modal-head"><div><div class="eyebrow">PETİN</div><h2 id="piTitle"></h2></div><button class="closebtn" id="piClose" aria-label="Kapat">×</button></div><div class="pi-line" id="piLine"></div><div class="pi-skills" id="piSkills"></div><div class="pi-stats" id="piStats"></div><label class="field-label" for="piName">Adı</label><div class="pc-row"><input id="piName" class="setting-input" maxlength="16"><button class="secondarybtn" id="piSave">Kaydet</button></div><label class="toggle-row"><span>Ekranda dolaşsın<small>Kapalıysa yuvasında kalır.</small></span><input type="checkbox" id="piRoam"></label><label class="toggle-row" id="piNotifyRow"><span>Acıkınca bildirim gönder<small>Uzun süre girmezsen telefonuna haber verir.</small></span><input type="checkbox" id="piNotify"></label><div class="setting-note" id="piMemorial"></div></div>`);

  // ayarlara kısa yol
  const setGrid = document.querySelector('#settingsOverlay .settings-grid');
  if (setGrid) {
    const sec = document.createElement('section'); sec.className = 'setting-section'; sec.id = 'petSettings';
    sec.innerHTML = `<h3>Petin</h3><p>Ad, dolaşma, bildirimler ve evrim çizgisi.</p><button class="secondarybtn" id="openPetInfo" style="width:100%">🐾 Pet bilgisi ve ayarları</button>`;
    setGrid.insertBefore(sec, setGrid.children[1] || null);
    sec.querySelector('#openPetInfo').addEventListener('click', () => openInfo());
  }

  // ---------- çizim ----------
  let tempMood = null, tempUntil = 0, animCls = '', animUntil = 0, artKey = '';
  function currentMood() {
    const p = P(); if (!p) return 'idle';
    if (!p.alive) return 'dead';
    if (tempMood && Date.now() < tempUntil) return tempMood;
    if (isSleeping()) return 'sleep';
    if (p.flow) return 'focus';
    const mx = maxes(p);
    if (p.stuffed >= 30) return 'full';
    if (p.food < mx.food * 0.2) return 'hungry';
    if (p.hp < mx.hp * 0.3) return 'sad';
    const ph = phase();
    if (ph === 'morning' || p.energy < mx.energy * 0.2) return 'groggy';
    if (ph === 'evening') return dozing ? 'sleep' : 'sleepy';
    return 'idle';
  }
  let awakeUntil = 0, dozing = false;
  function isSleeping() {
    const p = P(); if (!p || !p.alive) return false;
    if (p.energy <= 0) return true;
    const ph = phase();
    if (ph === 'night' || ph === 'dawn') return Date.now() >= awakeUntil;
    return false;
  }
  function drawSprite(force = false) {
    const p = P(); if (!p) return;
    const mood = currentMood(), belly = clamp(p.stuffed / 100, 0, 1);
    const key = `${p.species}|${p.stage}|${mood}|${Math.round(belly * 4)}`;
    if (!force && key === artKey) return;
    artKey = key;
    sprite.innerHTML = petSVG(p.species, p.stage, { mood, belly: Math.round(belly * 4) / 4 });
    sprite.dataset.mood = mood;
  }
  function statusText(p) {
    if (!p.alive) return '🕊️ Öldü';
    const mx = maxes(p), parts = [];
    if (isSleeping()) parts.push(p.energy <= 0 ? '😵 Bitkin, uyuyor' : '😴 Uyuyor');
    else if (p.flow) parts.push('🎯 Odaklanmış');
    else { const ph = phase(); if (ph === 'morning') parts.push('☕ Mahmur'); else if (ph === 'evening') parts.push('🌙 Uykusu geliyor'); else parts.push('😊 Keyifli'); }
    if (p.stuffed >= 30) parts.push('😌 Mayışmış');
    else if (p.food < mx.food * 0.2) parts.push(p.species === 'plant' ? '🥀 Susuz' : '🍖 Aç');
    if (p.hp < mx.hp * 0.3) parts.push('🩹 Canı az');
    return parts.join(' · ');
  }
  function renderPanel() {
    const p = P();
    home.classList.toggle('hidden', !p);
    if (!p) return;
    const sp = PET_SPECS[p.species], mx = maxes(p);
    $('#petName').textContent = p.name;
    $('#petStars').textContent = p.stars ? '⭐'.repeat(Math.min(5, p.stars)) + (p.stars > 5 ? `×${p.stars}` : '') : '';
    $('#petForm').textContent = `${stageName(p.species, p.stage)} · ${PET_SPECIES[p.species].label} · Form ${p.stage + 1}/6`;
    $('#petStatus').textContent = statusText(p);
    const setBar = (id, v, m) => { $(id).style.width = `${clamp((v / m) * 100, 0, 100)}%`; $(id + 'T').textContent = `${Math.round(v)}/${m}`; };
    setBar('#pbHp', p.hp, mx.hp); setBar('#pbFood', p.food, mx.food); setBar('#pbEnergy', p.energy, mx.energy);
    $('#pbFoodI').textContent = sp.foodIcon; $('#pbFoodRow').classList.toggle('water', p.species === 'plant');
    $('#pbFoodRow').title = sp.foodLabel;
    $('#pbHp').parentElement.parentElement.classList.toggle('low', p.hp < mx.hp * 0.3);
    $('#pbEnergyRow').classList.toggle('resisting', p.flow);
    $('#petAbilName').textContent = sp.active.name;
    $('#petAbilCost').textContent = `${sp.active.cost}⚡ enerji`;
    $('#petAbility').disabled = !p.alive || p.energy < sp.active.cost;
    $('#flowBtn').classList.toggle('on', p.flow); $('#flowBtn').setAttribute('aria-pressed', String(p.flow));
    $('#flowSmall').textContent = p.flow ? 'açık · odak' : 'kapalı';
    $('#flowBtn').title = p.flow ? `Enerji ${10 - (p.flowCount % 10)} soru sonra azalacak` : 'Flow: ödül pencereleri kapanır, enerji 10 soruda bir azalır';
    document.body.classList.toggle('pet-flow', p.flow);
    const ph = phase(); document.body.classList.toggle('pet-night', ph === 'night' || ph === 'dawn'); document.body.classList.toggle('pet-evening', ph === 'evening');
    const cu = Object.entries(A().petCatchUp || {});
    const box = $('#petCatch');
    box.classList.toggle('hidden', !cu.length);
    box.innerHTML = cu.map(([cat, i]) => `<span>🔁 ${esc(catLabel(cat))}: 2× XP · ${Math.max(0, Math.round(i.target - catXpOf(cat)))} XP kaldı</span>`).join('');
    $('#petHabBg').innerHTML = homeSVG(p.species);
    $('#petAway').classList.toggle('show', mode !== 'home' && !actorEl.classList.contains('hidden'));
    drawSprite();
  }

  // ---------- konuşma balonu ve efektler ----------
  let bubbleTimer = 0, lastSay = 0;
  function say(text, ms = 3200) {
    if (!P() || actorEl.classList.contains('hidden')) return;
    bubble.textContent = text; bubble.classList.add('show'); lastSay = Date.now();
    placeBubble();
    clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => bubble.classList.remove('show'), ms);
  }
  function placeBubble() {
    const vw = window.innerWidth;
    bubble.classList.toggle('left', pos.x < 90); bubble.classList.toggle('right', pos.x > vw - 150);
    bubble.classList.toggle('below', pos.y < 90);
  }
  function spawn(char, cls = '', n = 1) {
    if (reduced && n > 2) n = 2;
    for (let i = 0; i < n; i++) {
      const e = document.createElement('span'); e.className = `pfx ${cls}`; e.textContent = char;
      e.style.left = `${20 + Math.random() * 40}%`; e.style.animationDelay = `${i * 0.12}s`;
      e.style.setProperty('--dx', `${(Math.random() - 0.5) * 40}px`);
      fx.appendChild(e); setTimeout(() => e.remove(), 1900 + i * 120);
    }
  }
  function react(mood, ms = 1200, anim = '') {
    tempMood = mood; tempUntil = Date.now() + ms;
    if (anim) { setAnim(anim, ms); }
    drawSprite();
    setTimeout(() => drawSprite(), ms + 30);
  }
  function setAnim(cls, ms) {
    animCls = cls; animUntil = Date.now() + ms;
    sprite.className = 'pet-sprite a-' + cls;
  }

  // ---------- hareket motoru ----------
  const W = 66, H = 66;
  const pos = { x: -200, y: -200 }, target = { x: 0, y: 0 };
  let mode = 'home', moving = false, speed = 70, facing = 1, nextThink = 0, lastTs = 0, onArrive = null, visible = false;
  function homeAnchor() {
    const r = $('#petHab')?.getBoundingClientRect();
    if (!r || !r.width) return { x: -300, y: -300 };
    return { x: r.left + r.width / 2 - W / 2, y: r.bottom - H - 6 };
  }
  function habVisible() { const r = $('#petHab')?.getBoundingClientRect(); return r && r.bottom > 40 && r.top < window.innerHeight - 40 && !home.classList.contains('hidden'); }
  function blocked() {
    return !!document.querySelector('.overlay.show, .pet-overlay.show') || document.visibilityState === 'hidden';
  }
  function busyRects() {
    return [...document.querySelectorAll('button, input, select, textarea, .quiz-opt, .slot-tray, .level-card, .cat-tab')]
      .map(e => e.getBoundingClientRect()).filter(r => r.width && r.bottom > 0 && r.top < window.innerHeight);
  }
  function freeSpot() {
    const vw = window.innerWidth, vh = window.innerHeight, rects = busyRects();
    let best = null;
    for (let i = 0; i < 8; i++) {
      const x = 8 + Math.random() * Math.max(10, vw - W - 16), y = Math.max(80, vh * 0.16) + Math.random() * Math.max(10, vh - H - 90 - Math.max(80, vh * 0.16));
      const hit = rects.some(r => x < r.right && x + W > r.left && y < r.bottom && y + H > r.top);
      best = { x, y }; if (!hit) return best;
    }
    return best;
  }
  function walkTo(t, spd, done) {
    target.x = t.x; target.y = t.y; speed = spd; moving = true; onArrive = done || null;
    if (Math.abs(t.x - pos.x) > 4) facing = t.x > pos.x ? 1 : -1;
  }
  function baseSpeed() {
    const m = currentMood(), p = P();
    if (p.flow) return 85;
    if (m === 'full') return 30; if (m === 'groggy' || m === 'sleepy') return 40; if (m === 'hungry' || m === 'sad') return 48;
    return 72;
  }
  function goHome() {
    if (mode === 'home') return;
    if (!habVisible()) {
      // yuva ekranda değilse o yöne doğru yürüyüp ekrandan çıkar
      const r = $('#petHab')?.getBoundingClientRect();
      const above = !r || r.bottom < window.innerHeight / 2;
      mode = 'exit'; walkTo({ x: pos.x, y: above ? -H - 20 : window.innerHeight + 20 }, baseSpeed() * 1.3, () => { mode = 'home'; });
      return;
    }
    mode = 'walkHome'; walkTo(homeAnchor(), baseSpeed() * 1.3, () => { mode = 'home'; });
  }
  function leaveHome() {
    if (!P()?.roam || reduced) return;
    if (habVisible()) { const a = homeAnchor(); pos.x = a.x; pos.y = a.y; }
    else {
      // yuva ekran dışındaysa en yakın kenardan içeri girer
      const r = $('#petHab')?.getBoundingClientRect(), a = homeAnchor();
      pos.x = clamp(a.x, 8, window.innerWidth - W - 8); pos.y = !r || r.bottom < 0 ? -H : window.innerHeight + 4;
    }
    mode = 'roam';
    walkTo(freeSpot(), baseSpeed());
  }
  function idleAct() {
    const p = P(), m = currentMood();
    if (m === 'full' && Math.random() < 0.45) { setAnim('roll', 4200); return; }
    if (m === 'sleepy') { dozing = true; drawSprite(); setAnim('doze', 3200); setTimeout(() => { dozing = false; drawSprite(); }, 3200); return; }
    if (m === 'groggy' && Math.random() < 0.5) { setAnim('yawn', 1800); return; }
    const r = Math.random();
    if (r < 0.25) { facing *= -1; setAnim('look', 1400); }
    else if (r < 0.45) setAnim('stretch', 1600);
    else if (r < 0.6) setAnim('hop', 900);
    else setAnim('sit', 2600);
    if (p.flow && Math.random() < 0.4) setAnim('focus', 2200);
  }
  function think(now) {
    const p = P();
    if (!p.alive) { nextThink = now + 4000; return; }
    const sleeping = isSleeping();
    if (sleeping || !p.roam || reduced) {
      if (mode !== 'home') goHome();
      else if (sleeping) setAnim('sleep', 4000);
      else idleAct();
      if (sleeping && Math.random() < 0.6) spawn('z', 'zz', 2);
      nextThink = now + 3200; return;
    }
    const lazy = p.stuffed >= 30 || ['groggy', 'sleepy'].includes(currentMood());
    if (mode === 'home') { if (Math.random() < (p.flow ? 0.35 : 0.55)) leaveHome(); else idleAct(); }
    else {
      const r = Math.random();
      if (r < 0.14) goHome();
      else if (r < (lazy ? 0.4 : 0.6)) walkTo(freeSpot(), baseSpeed());
      else idleAct();
    }
    // ara sıra moral
    const sinceSay = now - lastSay;
    if (sinceSay > (p.flow ? 70000 : 110000) && Math.random() < 0.35) {
      const mx = maxes(p);
      if (p.flow) say(pick(LINES.flow));
      else if (p.food < mx.food * 0.25) say(pick(p.species === 'plant' ? LINES.hungry.plant : LINES.hungry.other));
      else if (p.stuffed >= 50) say(pick(LINES.full));
      else if (p.hp < mx.hp * 0.3) say(pick(LINES.low));
      else say(pick(LINES.cheer));
    }
    nextThink = now + (2600 + Math.random() * 3800) * (lazy ? 1.5 : 1);
  }
  function frame(ts) {
    requestAnimationFrame(frame);
    const p = P();
    const dt = Math.min(0.05, (ts - (lastTs || ts)) / 1000); lastTs = ts;
    const show = !!p && !blocked();
    if (show !== visible) { visible = show; actorEl.classList.toggle('hidden', !show); if (show) renderPanel(); }
    if (!show) return;
    const now = Date.now();
    if (mode === 'home') { const a = homeAnchor(); pos.x = a.x; pos.y = a.y; }
    else if (moving) {
      const dx = target.x - pos.x, dy = target.y - pos.y, dist = Math.hypot(dx, dy);
      if (mode === 'walkHome') { const a = homeAnchor(); target.x = a.x; target.y = a.y; }
      if (dist < 2) { moving = false; const f = onArrive; onArrive = null; f?.(); }
      else { const s = Math.min(dist, speed * dt); pos.x += (dx / dist) * s; pos.y += (dy / dist) * s; if (Math.abs(dx) > 3) facing = dx > 0 ? 1 : -1; }
    }
    // pencere küçülürse ekranda kalsın
    if (mode === 'roam' && !moving) { pos.x = clamp(pos.x, 0, window.innerWidth - W); pos.y = clamp(pos.y, 40, window.innerHeight - H - 6); }
    actorEl.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`;
    actorEl.style.setProperty('--face', facing);
    const walking = moving && mode !== 'home';
    if (mode === 'exit' || mode === 'walkHome') actorEl.classList.add('leaving'); else actorEl.classList.remove('leaving');
    if (walking) { if (!sprite.classList.contains('a-walk') && !sprite.classList.contains('a-flee')) sprite.className = 'pet-sprite a-walk'; }
    else if (animCls && now > animUntil) { animCls = ''; sprite.className = 'pet-sprite ' + (isSleeping() ? 'a-sleep' : 'a-idle'); }
    else if (!animCls && !/a-(idle|sleep)/.test(sprite.className)) sprite.className = 'pet-sprite ' + (isSleeping() ? 'a-sleep' : 'a-idle');
    actorEl.classList.toggle('at-home', mode === 'home');
    if (now > nextThink && !moving && p) think(now);
  }

  // ---------- etkileşim ----------
  let pressTimer = 0, pressed = false;
  actorEl.addEventListener('pointerdown', e => {
    if (!P()?.alive) return;
    e.preventDefault(); e.stopPropagation(); pressed = true;
    pressTimer = setTimeout(() => { pressed = false; pet(); }, 550);
  });
  actorEl.addEventListener('pointerup', e => {
    e.stopPropagation(); clearTimeout(pressTimer);
    if (!pressed) return; pressed = false; tap();
  });
  actorEl.addEventListener('pointerleave', () => { clearTimeout(pressTimer); pressed = false; });
  actorEl.addEventListener('click', e => e.stopPropagation());
  function pet() {
    const p = P(); if (!p?.alive) return;
    if (isSleeping()) awakeUntil = Date.now() + 45000;
    react('love', 2200, 'love'); spawn('♥', 'heart', 4); say(pick(PET_SPECS[p.species].love));
  }
  function tap() {
    const p = P(); if (!p?.alive) return;
    if (isSleeping()) { awakeUntil = Date.now() + 45000; react('poked', 1500, 'poked'); say(pick(LINES.woke)); return; }
    const r = Math.random();
    if (r < 0.3 && p.roam && !reduced) {
      react('surprised', 1300, 'flee'); spawn('•', 'sweat', 2);
      if (mode === 'home') { const a = homeAnchor(); pos.x = a.x; pos.y = a.y; mode = 'roam'; }
      const vw = window.innerWidth, vh = window.innerHeight;
      const t = { x: pos.x < vw / 2 ? vw - W - 12 - Math.random() * 60 : 12 + Math.random() * 60, y: clamp(pos.y + (Math.random() - 0.5) * vh * 0.5, 90, vh - H - 20) };
      walkTo(t, 260, () => react('happy', 900, 'hop'));
      sprite.className = 'pet-sprite a-flee';
      if (Math.random() < 0.5) say(pick(LINES.flee), 1800);
    } else if (r < 0.65) { react('poked', 1200, 'poked'); if (Math.random() < 0.6) say(pick(LINES.tapped), 1800); }
    else { react('love', 1800, 'love'); spawn('♥', 'heart', 3); if (Math.random() < 0.6) say(pick(PET_SPECS[p.species].love), 2200); }
  }
  $('#petHab').addEventListener('click', () => {
    const p = P(); if (!p?.alive) return;
    if (mode === 'home') { react('happy', 900, 'hop'); say(pick(LINES.cheer), 2200); return; }
    goHome(); say('Geliyorum! 🐾', 1500);
  });
  $('#petNameBtn').addEventListener('click', () => openInfo());
  $('#flowBtn').addEventListener('click', () => {
    const p = P(); if (!p) return;
    p.flow = !p.flow; p.flowCount = 0; save(true);
    if (p.flow) { react('focus', 1600, 'focus'); spawn('✦', 'spark', 2); say('Flow açık! Ödül pencereleri kapalı, enerjim 10 soruda bir azalır 🌊', 3600); core.toast('🌊 Flow modu açık · ödül pencereleri kapandı'); }
    else { react('happy', 1000, 'hop'); say('Güzel bir akıştı! Biraz dinlenelim mi? 😊', 2600); core.toast('Flow modu kapandı'); }
    renderPanel();
  });
  $('#petAbility').addEventListener('click', useAbility);

  function useAbility() {
    const p = P(); if (!p?.alive) return;
    const sp = PET_SPECS[p.species], ab = sp.active;
    if (p.energy < ab.cost) { say('Enerjim yetmiyor… biraz dinlenmem lazım 😪'); return; }
    if (isSleeping()) awakeUntil = Date.now() + 60000;
    const t = quiz.petTarget();
    if (!t) { core.toast('Yetenekler pop quiz kartındaki cevaplanmamış sorularda çalışır.'); say('Bir soru açalım, sonra yardım ederim 🤓', 2400); return; }
    let ok = false, msg = '';
    if (ab.id === 'weed') {
      if (t.style === 'type') { ok = quiz.freeHint(); msg = 'Bir harfi senin için açtım 🌱'; }
      else { const n = quiz.eliminate(2); ok = n > 0; msg = `${n} yanlış şıkkı ayıkladım 🌿`; }
    } else if (ab.id === 'peek') {
      const h = quiz.answerHint(); if (h) { ok = true; msg = `Cik! “${h.first.toLocaleUpperCase('tr')}” ile başlıyor · ${h.letters} ${/\d/.test(h.text) ? 'karakter' : 'harf'}${h.words > 1 ? ` · ${h.words} kelime` : ''} 🐣`; }
    } else if (ab.id === 'skip') { ok = quiz.skip(); msg = 'Bu soruyu sonraya sakladım 🐾'; }
    else if (ab.id === 'sniff') {
      const n = t.style === 'type' ? 0 : quiz.eliminate(1); p.shieldFor = t.item.id; ok = true;
      msg = n ? 'Kokladım: bir şık yanlış! Bu soruda seni koruyorum 🛡️' : 'Bu soruda seni koruyorum, yanlışta canım gitmez 🛡️';
    }
    if (!ok) { say('Şu an bunu yapamam 🤔', 2000); return; }
    p.energy = Math.max(0, p.energy - ab.cost); save(true);
    react('happy', 1100, 'hop'); spawn('✦', 'spark', 3); say(msg, 4600); renderPanel();
  }

  // ---------- cevaplar ----------
  window.addEventListener('dl:answer', e => onAnswer(e.detail || {}));
  function onAnswer(d) {
    const p = P(); if (!p) return;
    tick();
    const gains = checkLevels();
    if (!p.alive) return;
    const mx = maxes(p), sp = PET_SPECS[p.species], now = clockNow();
    p.answers++;
    // enerji
    const photo = p.species === 'plant' && isDaytime(now) ? 0.5 : 1;
    if (p.flow) { p.flowCount++; if (p.flowCount % 10 === 0) { p.energy = Math.max(0, p.energy - 5 * photo); spawn('✦', 'spark', 1); } }
    else p.energy = Math.max(0, p.energy - 2 * photo);
    const ph = phase();
    if (ph === 'dawn') awakeUntil = Date.now() + 30 * 60000;
    const asleep = isSleeping();
    if (d.right) {
      p.correct++; p.streak++;
      const feed = 7;
      if (p.food + feed > mx.food) p.stuffed = clamp(p.stuffed + 9, 0, 100);
      p.food = clamp(p.food + feed, 0, mx.food);
      if (p.food > mx.food * 0.3) p.hp = clamp(p.hp + 2, 0, mx.hp);
      if (p.species === 'dog' && p.streak % 5 === 0) { p.hp = clamp(p.hp + 10, 0, mx.hp); setTimeout(() => say('Sadık dost: +10 can 🐶'), 1300); }
      if (p.shieldFor === d.id) p.shieldFor = null;
      if (asleep) { spawn('z', 'zz', 1); if (Math.random() < 0.25) say('Zzz… aferin… zzz', 1800); }
      else {
        react('eat', 900, 'eat');
        if (p.species === 'plant') spawn('•', 'rain', 4); else spawn('•', 'crumb', 3);
        setTimeout(() => { react('happy', 1100, 'hop'); spawn('✦', 'spark', 2); }, 950);
        if ([3, 5, 10, 20].includes(p.streak)) setTimeout(() => say({ 3: 'Seri başladı! 🔥', 5: '5’te 5! Harikasın! 🤩', 10: 'On doğru üst üste! Efsanesin 🏆', 20: 'Yirmi! Ben bile şaşırdım 😮' }[p.streak], 2600), 900);
        else if (p.stuffed >= 50 && Math.random() < 0.3) setTimeout(() => say(pick(LINES.full)), 1200);
      }
    } else {
      p.streak = 0;
      let dmg = d.kind === 'legacy-miss' ? 5 : d.kind === 'legacy-fail' ? 8 : 14;
      if (p.shieldFor && p.shieldFor === d.id) { dmg = 0; p.shieldFor = null; react('focus', 1300, 'hop'); spawn('✦', 'spark', 1); say('Seni korudum! 🛡️ Açıklamaya bakalım.', 2600); }
      if (dmg > 0) {
        if (p.hp - dmg <= 0 && p.species === 'cat' && p.nineLivesDay !== todayKey()) {
          p.hp = 1; p.nineLivesDay = todayKey(); react('surprised', 1500, 'poked'); say('Dokuz candan birini kullandım! 😼 Dikkat!', 3600);
        } else {
          p.hp = Math.max(0, p.hp - dmg);
          if (p.hp <= 0) { die(d.cat); save(true); renderPanel(); return; }
          if (asleep) spawn('•', 'tear', 1);
          else {
            react('sad', 1500, 'sad'); spawn('•', 'tear', 2);
            if (p.hp < mx.hp * 0.3 && Math.random() < 0.7) setTimeout(() => say(pick(LINES.low), 2800), 700);
            else if (Math.random() < 0.4) setTimeout(() => say(pick(LINES.wrong), 2600), 700);
          }
        }
      }
    }
    if (gains) setTimeout(() => react('happy', 1200, 'hop'), 300);
    save(true); renderPanel();
  }

  // ---------- evrim gösterisi ----------
  function runEvoQueue() {
    if (evolving || !evoQueue.length) return;
    if (deathPending) return;
    if (document.querySelector('#rewardOverlay.show')) { setTimeout(runEvoQueue, 800); return; }
    const ev = evoQueue.shift(), p = P(); if (!p) { evoQueue.length = 0; return; }
    evolving = true;
    const oldEl = $('#evoOld'), newEl = $('#evoNew'), title = $('#evoTitle'), sub = $('#evoSub'), ok = $('#evoOk');
    evoEl.classList.remove('done', 'flashing', 'star'); ok.disabled = true;
    if (ev.type === 'star') {
      evoEl.classList.add('star', 'done');
      oldEl.innerHTML = ''; newEl.innerHTML = petSVG(p.species, p.stage, { mood: 'happy' });
      title.textContent = `⭐ ${p.name} bir yıldız kazandı!`;
      sub.textContent = `Son formuna ulaştı; her yeni seviye bir yıldız ekler. Toplam: ${ev.stars} ⭐`;
      evoEl.classList.add('show'); sparkBurst(); ok.disabled = false; return;
    }
    const fromName = stageName(p.species, ev.from), toName = stageName(p.species, ev.to);
    oldEl.innerHTML = petSVG(p.species, ev.from, { mood: 'surprised' });
    newEl.innerHTML = petSVG(p.species, ev.to, { mood: 'happy' });
    title.textContent = 'Bir şeyler oluyor…'; sub.textContent = `${p.name} parlıyor!`;
    evoEl.classList.add('show', 'flicker');
    oldEl.classList.add('on'); newEl.classList.remove('on');
    const steps = reduced ? [] : [420, 380, 330, 290, 250, 210, 180, 150, 130, 110, 95, 85, 75, 65, 60, 55, 50];
    let i = 0;
    const flick = () => {
      if (i < steps.length) { const showNew = i % 2 === 0; oldEl.classList.toggle('on', !showNew); newEl.classList.toggle('on', showNew); setTimeout(flick, steps[i++]); return; }
      evoEl.classList.add('flashing');
      setTimeout(() => {
        evoEl.classList.remove('flicker'); oldEl.classList.remove('on'); newEl.classList.add('on'); evoEl.classList.add('done');
        title.textContent = `${p.name} evrimleşti!`;
        sub.textContent = `${fromName} → ${toName}. Can, ${PET_SPECS[p.species].foodLabel.toLocaleLowerCase('tr')} ve enerji sınırları büyüdü.`;
        sparkBurst(); ok.disabled = false; ok.focus({ preventScroll: true });
        drawSprite(true); renderPanel();
      }, 380);
    };
    setTimeout(flick, 700);
  }
  function sparkBurst() {
    const box = $('#evoSparks'); box.innerHTML = '';
    for (let k = 0; k < 18; k++) {
      const s = document.createElement('i'); const a = (k / 18) * Math.PI * 2;
      s.style.setProperty('--tx', `${Math.cos(a) * (90 + Math.random() * 40)}px`); s.style.setProperty('--ty', `${Math.sin(a) * (90 + Math.random() * 40)}px`);
      s.textContent = ['✨', '⭐', '💫'][k % 3]; box.appendChild(s);
    }
  }
  $('#evoOk').addEventListener('click', () => {
    evoEl.classList.remove('show', 'done', 'flashing', 'flicker', 'star'); evolving = false;
    react('happy', 1400, 'hop'); spawn('✦', 'spark', 3);
    if (evoQueue.length) setTimeout(runEvoQueue, 300);
    renderPanel();
  });

  // ---------- ölüm ----------
  function die(cat) {
    const p = P();
    p.alive = false; p.hp = 0; p.flow = false; p.death = { cat: cat || 'en', at: Date.now() };
    deathPending = true; evoQueue.length = 0;
    tempMood = null; drawSprite(true); setAnim('dead', 99999);
    setTimeout(openDeath, 1500);
  }
  function catLevelText(cat) {
    if (cat === 'en') { const i = core.levelIndex(); return core.LEVELS[i]; }
    return `Sv ${Math.floor((quiz.catXp(cat) || 0) / CAT_XP_STEP) + 1}`;
  }
  function openDeath() {
    const p = P(); if (!p || p.alive) { deathPending = false; return; }
    const cat = p.death?.cat || 'en', label = catLabel(cat), lv = catLevelText(cat);
    $('#deathPet').innerHTML = petSVG(p.species, p.stage, { mood: 'dead' });
    $('#deathTitle').textContent = `${p.name} öldü…`;
    $('#deathLead').textContent = `Canı ${label} sorusunda tükendi. Ona ne olsun istersin?`;
    $('#reviveTxt').innerHTML = `${esc(label)} seviyen sıfırlanır (${esc(lv)} → ${cat === 'en' ? 'A1' : 'Sv 1'}). Telafi: eski XP’ne (${catXpOf(cat)} XP) ulaşana kadar bu konuda <b>2× XP</b>. ${esc(p.name)} aynı formuyla geri döner.`;
    $('#newTxt').innerHTML = `${esc(p.name)} anı köşesine uğurlanır; yeni bir pet seçip baştan beslersin. ${esc(label)} seviyen <b>düşmez</b>, yalnızca bu seviyedeki XP çubuğu sıfırlanır.`;
    deathEl.classList.add('show');
  }
  $('#petRevive').addEventListener('click', () => {
    const app = A(), p = P(); if (!p) return;
    const cat = p.death?.cat || 'en';
    const oldXp = catXpOf(cat);
    if (cat === 'en') { const oldFloor = Number.isInteger(app.levelFloor) ? app.levelFloor : null; app.xp = 0; app.levelFloor = 0; if (oldXp > 0) app.petCatchUp.en = { target: oldXp, floor: oldFloor }; }
    else { app.quiz.catXp[cat] = 0; if (oldXp > 0) app.petCatchUp[cat] = { target: oldXp }; }
    const mx = maxes(p);
    p.alive = true; p.hp = Math.round(mx.hp * 0.5); p.food = Math.max(p.food, mx.food * 0.4); p.energy = Math.max(p.energy, mx.energy * 0.4); p.death = null; p.revives = (p.revives || 0) + 1;
    // seviye anlık görüntüsünü düşür: tekrar tırmanırken evrim sayılmasın (en yüksek değer korunur)
    deathPending = false; deathEl.classList.remove('show');
    tempMood = null; animCls = ''; sprite.className = 'pet-sprite a-idle'; drawSprite(true);
    save(true); core.renderProgress(); quiz.renderAll(); renderPanel();
    react('happy', 1600, 'hop'); spawn('✦', 'spark', 4);
    setTimeout(() => say('Geri döndüm! Bu sefer daha dikkatli olalım 💪', 3600), 400);
    core.toast(`💫 ${p.name} canlandı · ${catLabel(cat)} sıfırlandı · telafi 2× XP`);
  });
  $('#petNew').addEventListener('click', () => {
    const app = A(), p = P(); if (!p) return;
    const cat = p.death?.cat || 'en';
    if (cat === 'en') app.xp = core.levelStartXp();
    else app.quiz.catXp[cat] = Math.floor((app.quiz.catXp[cat] || 0) / CAT_XP_STEP) * CAT_XP_STEP;
    app.petMemorial = [...(app.petMemorial || []), { name: p.name, species: p.species, stage: p.stage, stars: p.stars, at: Date.now() }].slice(-12);
    app.pet = null; deathPending = false; deathEl.classList.remove('show');
    save(true); core.renderProgress(); quiz.renderAll(); renderPanel();
    openChooser(true);
  });

  // ---------- pet seçimi ----------
  let chosen = null;
  function openChooser(afterDeath = false) {
    $('#pcTitle').textContent = afterDeath ? 'Yeni bir arkadaş seç' : 'Bir pet seç';
    $('#pcLead').textContent = afterDeath ? 'Yeni petin sıfırdan başlar ve her seviye atladığında evrimleşir.' : 'Doğru cevaplar onu besler, yanlışlar canını yakar. Her seviye atladığında evrimleşir. Ona iyi bak!';
    const bar = (v, c) => `<span class="pcb"><i style="width:${Math.round(v / 140 * 100)}%;background:${c}"></i></span>`;
    $('#pcGrid').innerHTML = ORDER.map(id => {
      const s = PET_SPECS[id];
      return `<button class="pc-card" data-sp="${id}"><div class="pc-art">${petSVG(id, 1, { mood: 'happy' })}</div><strong>${esc(s.name)} <small>${esc(PET_SPECIES[id].label)}</small></strong>
        <div class="pc-stats"><span>❤️${bar(s.hp, '#E5534B')}</span><span>${s.foodIcon}${bar(s.food, id === 'plant' ? '#4FA6EA' : '#F0A04B')}</span><span>⚡${bar(s.energy, '#E9C23C')}</span></div>
        <div class="pc-skill"><b>${esc(s.passive.name)}</b> ${esc(s.passive.desc)}</div><div class="pc-skill act"><b>✨ ${esc(s.active.name)}</b> ${esc(s.active.desc)}</div>
        <div class="pc-evo">${[0, 2, 5].map(st => `<span>${petSVG(id, st)}</span>`).join('<em>›</em>')}</div></button>`;
    }).join('');
    $('#pcNameBox').classList.add('hidden'); chosen = null;
    chooser.classList.add('show');
  }
  $('#pcGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-sp]'); if (!b) return;
    chosen = b.dataset.sp;
    [...$('#pcGrid').children].forEach(x => x.classList.toggle('sel', x === b));
    $('#pcName').value = PET_SPECS[chosen].name; $('#pcNameBox').classList.remove('hidden');
    $('#pcAdopt').textContent = `${PET_SPECS[chosen].name}’i sahiplen 🐾`;
    $('#pcNameBox').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
  $('#pcName').addEventListener('input', () => { if (chosen) $('#pcAdopt').textContent = `${$('#pcName').value.trim() || PET_SPECS[chosen].name}’i sahiplen 🐾`; });
  $('#pcAdopt').addEventListener('click', () => {
    if (!chosen) return;
    const app = A(), now = Date.now();
    const p = { v: 1, species: chosen, name: ($('#pcName').value.trim() || PET_SPECS[chosen].name).slice(0, 16), stage: 0, stars: 0, hp: 0, food: 0, energy: 0, stuffed: 0, alive: true, born: now, lastTick: now, lastSeen: now, flow: false, flowCount: 0, answers: 0, correct: 0, streak: 0, roam: true, notify: true };
    app.pet = p; const mx = maxes(p); p.hp = mx.hp; p.food = Math.round(mx.food * 0.7); p.energy = mx.energy;
    if (!app.petLevels) app.petLevels = levelsNow();
    else { const now2 = levelsNow(); for (const [k, v] of Object.entries(now2)) app.petLevels[k] = Math.max(app.petLevels[k] ?? v, v); }
    chooser.classList.remove('show'); save(true);
    mode = 'home'; artKey = ''; renderPanel();
    setTimeout(() => { react('happy', 1500, 'hop'); spawn('♥', 'heart', 3); say(`Merhaba! Ben ${p.name}. Doğru cevaplarla ${p.species === 'plant' ? 'sulanırım 💧' : 'beslenirim 🍖'}`, 4200); }, 500);
    if (notifyAvailable()) LocalNotifications.requestPermissions().catch(() => {});
    $('#petHome')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });

  // ---------- bilgi ----------
  function openInfo() {
    const p = P(); if (!p) { openChooser(); return; }
    const sp = PET_SPECS[p.species], mx = maxes(p);
    $('#piTitle').textContent = `${p.name} · ${stageName(p.species, p.stage)}`;
    $('#piLine').innerHTML = [0, 1, 2, 3, 4, 5].map(st => `<div class="pi-stage ${st < p.stage ? 'past' : st === p.stage ? 'now' : 'future'}">${petSVG(p.species, st)}<small>${st <= p.stage ? esc(stageName(p.species, st)) : '???'}</small></div>`).join('');
    $('#piSkills').innerHTML = `<div><b>🌀 ${esc(sp.passive.name)} (pasif)</b><span>${esc(sp.passive.desc)}</span></div><div><b>✨ ${esc(sp.active.name)} (aktif · ${sp.active.cost}⚡)</b><span>${esc(sp.active.desc)}</span></div><div><b>💪 Güçlü yanı</b><span>${esc(sp.perk)}</span></div>`;
    $('#piStats').innerHTML = `<span>❤️ ${Math.round(p.hp)}/${mx.hp}</span><span>${sp.foodIcon} ${Math.round(p.food)}/${mx.food}</span><span>⚡ ${Math.round(p.energy)}/${mx.energy}</span><span>✅ ${p.correct} doğru</span><span>⭐ ${p.stars}</span><span>💫 ${p.revives || 0} kez canlandı</span>`;
    $('#piName').value = p.name; $('#piRoam').checked = p.roam; $('#piNotify').checked = p.notify;
    $('#piNotifyRow').classList.toggle('hidden', !notifyAvailable());
    const mem = A().petMemorial || [];
    $('#piMemorial').innerHTML = mem.length ? `<b>🕊️ Anı köşesi:</b> ${mem.map(m => `${esc(m.name)} (${esc(stageName(m.species, m.stage))})`).join(', ')}` : 'Her seviye atlamada evrimleşir. Son formdan sonra her seviye bir ⭐ ekler. Gece uyur, sabah mahmurdur; çok soru çözünce karnı şişip mayışır.';
    document.querySelector('#settingsOverlay.show') && document.querySelector('#closeSettings')?.click();
    infoEl.classList.add('show');
  }
  $('#piClose').addEventListener('click', () => infoEl.classList.remove('show'));
  infoEl.addEventListener('click', e => { if (e.target === infoEl) infoEl.classList.remove('show'); });
  $('#piSave').addEventListener('click', () => { const p = P(); if (!p) return; p.name = ($('#piName').value.trim() || p.name).slice(0, 16); save(true); renderPanel(); openInfo(); core.toast('Adı kaydedildi'); });
  $('#piRoam').addEventListener('change', e => { const p = P(); if (!p) return; p.roam = e.target.checked; if (!p.roam) goHome(); save(); });
  $('#piNotify').addEventListener('change', e => { const p = P(); if (!p) return; p.notify = e.target.checked; save(); if (p.notify && notifyAvailable()) LocalNotifications.requestPermissions().catch(() => {}); });

  // ---------- bildirimler ----------
  const NOTE_IDS = [7101, 7102, 7103, 7104];
  function quietShift(t) {
    const d = new Date(t), h = d.getHours() + d.getMinutes() / 60;
    if (h >= 22) { d.setDate(d.getDate() + 1); d.setHours(9, 30, 0, 0); return d.getTime(); }
    if (h < 9.5) { d.setHours(9, 30, 0, 0); return d.getTime(); }
    return t;
  }
  async function schedule() {
    const p = P(); if (!p || !p.alive || !p.notify || !notifyAvailable()) return;
    try {
      await LocalNotifications.cancel({ notifications: NOTE_IDS.map(id => ({ id })) }).catch(() => {});
      const now = Date.now(), mx = maxes(p), rate = p.species === 'plant' ? 3 : 4, plant = p.species === 'plant', icon = PET_SPECS[p.species].foodIcon;
      const list = [];
      if (p.food > mx.food * 0.3) list.push({ id: 7101, at: now + ((p.food - mx.food * 0.3) / rate) * HOUR, title: `${p.name} ${plant ? 'susadı' : 'acıktı'} ${icon}`, body: plant ? 'Toprağım kurudu… birkaç doğru cevapla beni sular mısın? 💧' : 'Karnım guruldadı… birkaç soru çözüp beni besler misin?' });
      list.push({ id: 7102, at: now + Math.max(2, p.food / rate) * HOUR, title: `${p.name} çok ${plant ? 'susuz' : 'aç'}! 🥺`, body: 'Seni bekliyorum… güçten düşmeye başladım.' });
      list.push({ id: 7103, at: now + 24 * HOUR, title: `${p.name} seni özledi 💛`, body: 'Bugün birlikte bir pop quiz çözelim mi?' });
      list.push({ id: 7104, at: now + 72 * HOUR, title: `${p.name} seni bekliyor…`, body: 'Üç gündür görüşmedik. Bir soru bile yeter!' });
      const used = new Set();
      const notes = list.map(n => { let at = quietShift(n.at); while (used.has(Math.round(at / 60000))) at += 30 * 60000; used.add(Math.round(at / 60000)); return { ...n, at }; })
        .filter(n => n.at > now + 60000)
        .map(n => ({ id: n.id, title: n.title, body: n.body, schedule: { at: new Date(n.at), allowWhileIdle: true }, smallIcon: 'ic_stat_pet', iconColor: '#E86FA0' }));
      if (notes.length) await LocalNotifications.schedule({ notifications: notes });
    } catch (e) { console.warn('[pet] bildirim planlanamadı', e); }
  }
  function cancelNotes() { if (notifyAvailable()) LocalNotifications.cancel({ notifications: NOTE_IDS.map(id => ({ id })) }).catch(() => {}); }

  // ---------- yaşam döngüsü ----------
  function greetIfAway() {
    const p = P(); if (!p || !p.alive) return;
    const away = Date.now() - (p.lastSeen || Date.now());
    p.lastSeen = Date.now();
    if (away > 8 * HOUR) setTimeout(() => { react('love', 2000, 'love'); spawn('♥', 'heart', 3); say(pick(LINES.missed), 3600); }, 1200);
    else if (away > 40 * 60000) setTimeout(() => say(pick(LINES.greet[phase()] || LINES.greet.day), 3000), 1500);
  }
  function ensure() {
    normalize();
    if (!A().calibrated) return;
    if (!P()) { if (!chooser.classList.contains('show') && !deathEl.classList.contains('show')) openChooser(); return; }
    renderPanel();
  }
  function reload() { normalize(); tick(); artKey = ''; if (P() && !P().alive) { deathPending = true; setTimeout(openDeath, 600); } renderPanel(); }

  normalize(); tick(); checkLevels();
  if (P() && !P().alive) { deathPending = true; setTimeout(openDeath, 1200); }
  renderPanel(); greetIfAway();
  requestAnimationFrame(frame);
  setInterval(() => { const p = P(); if (!p) return; tick(); checkLevels(); p.lastSeen = Date.now(); renderPanel(); }, 30000);
  setInterval(() => { if (P() && !evolving) checkLevels(); }, 5000);
  window.addEventListener('resize', () => { if (mode !== 'home') walkTo(freeSpot(), baseSpeed()); });

  return {
    ensure, reload, render: renderPanel, openChooser, openInfo, xpMod,
    onPause() { const p = P(); if (p) { tick(); p.lastSeen = Date.now(); save(); schedule(); } },
    onResume() { cancelNotes(); tick(); greetIfAway(); renderPanel(); },
    debug: { die: () => { const p = P(); if (p) { p.hp = 1; } }, evolve: n => evolveBy(n || 1), phase, react, say, tick },
  };
}
