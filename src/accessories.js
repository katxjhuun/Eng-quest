// dam-la — pet aksesuarları: kazanma (şans, Altın Saat, doğum günü, ilerleme, boss) ve dolap (tak/çıkar).
// Aksesuarlar oyuncuya aittir (pet takasında yanında kalır). Her yuvaya (baş, yüz, boyun) bir tane takılır.
// Performans: aksesuar petin çiziminin içine bir kez eklenir; ek animasyon ya da kare başına iş yoktur.
import { ACCESSORIES, SLOTS, RARITY, accIconSVG } from './pets/acc.js';
import { petSVG } from './pet-art.js';
import { goldenNow } from './golden-time.js';
import { isBirthday } from './birthday.js';
import { setSkin } from './pets/figure.js';
import { SKINS } from './pets/skins.js';

const SLOT_NAME = { head: 'Baş', face: 'Yüz', neck: 'Boyun' };
const SRC_TEXT = { luck: '🍀 Doğru cevaplarda şansla düşer', golden: '✨ Yalnızca Altın Saat\'te düşer', birthday: '🎂 Doğum günü etkinliğinde', progress: '📈 İlerlemeyle', boss: '⚔️ Boss savaşından' };
const BOSS_NAME = { bossSayfa: 'Boş Sayfa', bossSaat: 'Son Gün', bossSinav: 'Sınav Ejderi', bossGolge: 'Gölge Hoca', bossBilinmez: 'Bilinmezlik', bossSonsuz: 'Sonsuz Soru' };
const LUCK_P = 1 / 40, GOLD_P = 1 / 18;
const WEIGHT = { common: 70, rare: 25, epic: 6, legendary: 2 };

export function initAccessories(core, pet) {
  const esc = core.esc;
  const st = () => { const a = core.app; if (!a.acc || typeof a.acc !== 'object') a.acc = {}; a.acc.own ||= {}; a.acc.eq ||= {}; return a.acc; };
  const owned = id => !!st().own[id];
  const equipped = () => SLOTS.map(s => st().eq[s]).filter(id => id && ACCESSORIES[id] && owned(id));
  const apply = () => pet.setAcc?.(equipped());
  // görünüş seti (Klasik / Gölge / Kozmik / Oyuncak): uygulamanın bütün pet çizimlerine uygulanır
  const skinNow = () => (SKINS[core.app.profile?.petSkin] ? core.app.profile.petSkin : 'classic');
  function useSkin(id, save) {
    if (!SKINS[id]) id = 'classic';
    setSkin(id);
    for (const k of Object.keys(SKINS)) document.body.classList.toggle('skin-' + k, k === id && k !== 'classic');
    if (save) { core.app.profile.petSkin = id; core.saveLocal(true); }
    pet.refreshSkin?.();
  }
  useSkin(skinNow(), false);

  // ---------- kazanma ----------
  const queue = [];
  function grant(id, why) {
    if (!ACCESSORIES[id] || owned(id)) return false;
    st().own[id] = Date.now(); st().fresh = { ...(st().fresh || {}), [id]: 1 };
    // boş yuvaya kendiliğinden takılır
    const slot = ACCESSORIES[id].slot; if (!st().eq[slot]) { st().eq[slot] = id; apply(); }
    core.saveLocal(true);
    queue.push({ id, why }); if (queue.length === 1) showDrop();
    return true;
  }
  function pickWeighted(pool) {
    const list = pool.filter(id => !owned(id)); if (!list.length) return null;
    const tot = list.reduce((s, id) => s + WEIGHT[ACCESSORIES[id].rarity], 0);
    let r = Math.random() * tot;
    for (const id of list) { r -= WEIGHT[ACCESSORIES[id].rarity]; if (r <= 0) return id; }
    return list[0];
  }
  const POOL = src => Object.keys(ACCESSORIES).filter(id => ACCESSORIES[id].src === src);
  function checkProgress() {
    const lvl = core.levelIndex?.() | 0, correct = core.statsSnapshot?.()?.correct | 0;
    for (const [id, a] of Object.entries(ACCESSORIES)) {
      if (a.src !== 'progress' || owned(id)) continue;
      if ((a.req.level == null || lvl >= a.req.level) && (a.req.correct == null || correct >= a.req.correct)) grant(id, a.hint ? `${a.hint}: başardın!` : 'İlerleme ödülü');
    }
  }
  window.addEventListener('dl:answer', e => {
    if (!e.detail?.right || !core.app.pet) return;
    setTimeout(checkProgress, 1500);
    if (goldenNow() && Math.random() < GOLD_P) { const id = pickWeighted(POOL('golden')); if (id) { grant(id, '✨ Altın Saat buluntusu!'); return; } }
    if (Math.random() < LUCK_P) { const id = pickWeighted(POOL('luck')); if (id) grant(id, '🍀 Şanslı bir doğru cevap!'); }
  });
  window.addEventListener('dl:boss-win', e => {
    const id = Object.keys(ACCESSORIES).find(k => ACCESSORIES[k].boss === e.detail?.mon);
    if (id) setTimeout(() => grant(id, `⚔️ ${BOSS_NAME[e.detail.mon] || 'Boss'} yenildi!`), 900);
  });
  setTimeout(() => { if (!core.app.pet) return; checkProgress(); if (isBirthday()) grant('party', '🎂 Doğum günü hediyesi!'); apply(); }, 2500);

  // ---------- yeni aksesuar penceresi ----------
  const pop = document.createElement('div');
  pop.className = 'acc-pop'; pop.setAttribute('role', 'dialog');
  document.body.appendChild(pop);
  function showDrop() {
    const it = queue[0]; if (!it) return;
    const a = ACCESSORIES[it.id], R = RARITY[a.rarity], p = core.app.pet;
    const preview = p ? petSVG(p.species, p.stage, { coat: p.coat, shiny: p.shiny, mood: 'happy', acc: [...equipped().filter(x => ACCESSORIES[x].slot !== a.slot), it.id] }) : accIconSVG(it.id);
    pop.innerHTML = `<div class="acc-card" style="--rc:${R.color}"><div class="acc-rays"></div><div class="eyebrow">🎁 YENİ AKSESUAR</div><div class="acc-prev">${preview}</div>
      <b>${esc(a.name)}</b><small class="acc-rar">${R.name} · ${SLOT_NAME[a.slot]}</small><p>${esc(it.why)}</p>
      <div class="acc-acts"><button class="secondarybtn" data-later>Sonra</button><button class="primarybtn" data-wear>Tak</button></div></div>`;
    pop.classList.add('show');
  }
  pop.addEventListener('click', e => {
    const w = e.target.closest('[data-wear]'), l = e.target.closest('[data-later]'); if (!w && !l && e.target !== pop) return;
    const it = queue.shift();
    if (w && it) { st().eq[ACCESSORIES[it.id].slot] = it.id; core.saveLocal(true); apply(); }
    pop.classList.remove('show');
    if (queue.length) setTimeout(showDrop, 300);
  });

  // ---------- dolap ----------
  const ov = document.createElement('div');
  ov.className = 'pet-overlay acc-ov'; ov.id = 'accOverlay'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
  ov.innerHTML = `<div class="pet-modal acc-modal"><div class="modal-head"><div><div class="eyebrow">DOLAP</div><h2>Görünüm ve aksesuarlar</h2></div><button class="closebtn" data-x aria-label="Kapat">×</button></div><div id="accBody"></div></div>`;
  document.body.appendChild(ov);
  let tab = 'head';
  function open() { if (!core.app.pet) { core.toast('Önce bir petin olmalı.'); return; } render(); ov.classList.add('show'); }
  function hint(id) {
    const a = ACCESSORIES[id];
    if (a.src === 'progress') return `📈 ${a.hint}`;
    if (a.src === 'boss') return `⚔️ ${BOSS_NAME[a.boss] || 'Boss'} bossunu yen`;
    return SRC_TEXT[a.src];
  }
  function render() {
    const p = core.app.pet, eq = st().eq, fresh = st().fresh || {};
    const ids = Object.keys(ACCESSORIES), have = ids.filter(owned).length;
    const list = ids.filter(id => ACCESSORIES[id].slot === tab).sort((x, y) => (owned(y) - owned(x)) || (Object.keys(RARITY).indexOf(ACCESSORIES[x].rarity) - Object.keys(RARITY).indexOf(ACCESSORIES[y].rarity)));
    ov.querySelector('#accBody').innerHTML = `<div class="acc-skins">${Object.entries(SKINS).map(([id, S]) => `<button class="acc-skin sk-${id}${skinNow() === id ? ' on' : ''}" data-skin="${id}"><span>${petSVG(p.species, p.stage, { coat: p.coat, shiny: p.shiny, mood: 'happy', skin: id })}</span><b>${esc(S.name)}</b></button>`).join('')}</div>
      <div class="acc-stage sk-${skinNow()}">${petSVG(p.species, p.stage, { coat: p.coat, shiny: p.shiny, mood: 'happy', acc: equipped() })}</div>
      <div class="acc-count">${have} / ${ids.length} aksesuar</div>
      <div class="acc-tabs">${SLOTS.map(s => `<button data-tab="${s}" class="${tab === s ? 'on' : ''}">${SLOT_NAME[s]}${eq[s] ? ' •' : ''}</button>`).join('')}</div>
      <div class="acc-grid">${list.map(id => { const a = ACCESSORIES[id], R = RARITY[a.rarity], has = owned(id), on = eq[a.slot] === id;
        return `<button class="acc-it${has ? '' : ' locked'}${on ? ' on' : ''}" data-it="${id}" style="--rc:${R.color}" ${has ? '' : 'aria-disabled="true"'}>${fresh[id] ? '<i class="acc-new">YENİ</i>' : ''}<span class="acc-ic">${accIconSVG(id)}</span><b>${has ? esc(a.name) : '???'}</b><small>${has ? `${R.name}${on ? ' · takılı' : ''}` : esc(hint(id))}</small></button>`; }).join('')}</div>
      <p class="acc-note">Aksesuarlar sende kalır: petini takas etsen bile yenisine takabilirsin. Her yuvaya bir tane.</p>`;
  }
  ov.addEventListener('click', e => {
    if (e.target === ov || e.target.closest('[data-x]')) { ov.classList.remove('show'); return; }
    const sk = e.target.closest('[data-skin]'); if (sk) { useSkin(sk.dataset.skin, true); render(); core.toast(`🎨 Görünüm: ${SKINS[sk.dataset.skin].name}`); return; }
    const t = e.target.closest('[data-tab]'); if (t) { tab = t.dataset.tab; render(); return; }
    const it = e.target.closest('[data-it]'); if (!it) return;
    const id = it.dataset.it, a = ACCESSORIES[id];
    if (!owned(id)) { core.toast(`${hint(id)}`); return; }
    const eq = st().eq; eq[a.slot] = eq[a.slot] === id ? null : id;
    if (st().fresh) delete st().fresh[id];
    core.saveLocal(true); apply(); render();
  });
  apply();
  return { open, grant, equipped, apply };
}
