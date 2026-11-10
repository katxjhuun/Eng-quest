// dam-la — savaş ekranı ve arena: takım kurma, sıra tabanlı savaş arayüzü, ödüller.
// Pet kayar gibi hareket etmez: saldırırken yerinde gerilip öne atılır (esneme), vurulunca sarsılır; uzak saldırılar mermiyle gider.
import { createBattle, nextActor, act, aiChoose, movesOf, targetKind, validTargets, botTeam } from './engine.js';
import { MONSTERS, COMMON, BOSS_FOR_STAGE, monsterSVG } from './monsters.js';
import { TYPES, ROLES, STANCES, ROLE_IDS } from '../pets/codex.js';

const TALK = {
  logic: ['Az önce kendinle çeliştin.', 'Kanıtın nerede? Bende var.', 'Bu mantıkla kendi gölgeni bile yenemezsin.', 'Sorayım: neden savaşıyoruz?'],
  flatter: ['Senin gibi biri kavgaya tenezzül etmez.', 'Bu kadar görkemli biri… bırak ben ezileyim.', 'Gerçek ustalar kılıç çekmez, değil mi?', 'Senin yerinde olsam çoktan kazandım sayardım.'],
  feel: ['Yorgunsun, biliyorum. Bırak bugün bitsin.', 'Kimse seni dinlemedi. Ben dinliyorum.', 'Bu kavga senin için değil, biliyorsun.', 'İçindeki sesi bir dinle.'],
};
const KIND_ICON = { attack: '⚔️', talk: '💬', heal: '✚', buff: '✨', guard: '🛡️', dive: '🌊', replay: '♟️' };
const MAX_ROSTER = 12;
const pick = a => a[Math.floor(Math.random() * a.length)];
const wait = ms => new Promise(r => setTimeout(r, ms));

export function initBattleUI({ core, petSVG, getPet, onChange }) {
  const $ = s => document.querySelector(s);
  const esc = core.esc;
  const A = () => core.app;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const T = ms => (reduced ? Math.min(ms, 120) : ms);

  function state() {
    const app = A();
    if (!app.battle || typeof app.battle !== 'object') app.battle = {};
    const s = app.battle;
    if (!Array.isArray(s.roster)) s.roster = [];
    if (!Array.isArray(s.team)) s.team = [];
    s.wins = s.wins | 0; s.losses = s.losses | 0; s.bossWins = s.bossWins | 0;
    s.roster = s.roster.filter(r => r && r.kind === 'mon' && MONSTERS[r.mon] && !MONSTERS[r.mon].boss).slice(0, MAX_ROSTER);
    s.team = s.team.filter(id => s.roster.some(r => r.id === id) || String(id).startsWith('f:')).slice(0, 2);
    if (!Array.isArray(s.friends)) s.friends = [];
    return s;
  }
  function petDef() {
    const p = getPet(); if (!p) return null;
    return { kind: 'pet', species: p.species, stage: p.stage, stars: p.stars, role: p.role, shiny: p.shiny, coat: p.coat, name: p.name, owner: 'sen' };
  }
  function allyDefs() {
    const s = state();
    return s.team.map(id => {
      const r = s.roster.find(x => x.id === id); if (r) return { ...r };
      const f = s.friends.find(x => 'f:' + x.code === id); if (f && f.pet) return { kind: 'pet', ...f.pet, owner: f.label || f.code };
      return null;
    }).filter(Boolean);
  }
  const artOf = d => (d.kind === 'mon' ? monsterSVG(d.mon) : petSVG(d.species, d.stage, { coat: d.coat, shiny: d.shiny, mood: 'idle' }));
  const typeChip = t => (TYPES[t] ? `<span class="bt-type" style="--tc:${TYPES[t].color}" title="${esc(TYPES[t].name)}">${TYPES[t].icon}</span>` : '');

  // ---------- DOM ----------
  const root = document.createElement('div');
  root.className = 'bt-overlay'; root.id = 'battleOverlay'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
  root.innerHTML = `<div class="bt-arena" id="btArena">
    <div class="bt-head"><div><div class="eyebrow" id="btEye">SAVAŞ</div><b id="btTitle"></b></div><div class="bt-round" id="btRound"></div><button class="closebtn" id="btFlee" aria-label="Kaç">🏳️</button></div>
    <div class="bt-row foe" id="btFoe"></div>
    <div class="bt-log" id="btLog" aria-live="polite"></div>
    <div class="bt-row ally" id="btAlly"></div>
    <div class="bt-panel" id="btPanel"></div>
    <div class="bt-fx" id="btFx"></div>
  </div>`;
  document.body.appendChild(root);
  const hub = document.createElement('div');
  hub.className = 'pet-overlay arena'; hub.id = 'arenaHub'; hub.setAttribute('role', 'dialog'); hub.setAttribute('aria-modal', 'true');
  hub.innerHTML = `<div class="pet-modal arena-modal"><div class="modal-head"><div><div class="eyebrow">ARENA</div><h2>Takımın</h2></div><button class="closebtn" id="arClose" aria-label="Kapat">×</button></div><div id="arBody"></div></div>`;
  document.body.appendChild(hub);

  // ---------- arena (takım kurma) ----------
  function openArena() {
    const p = getPet();
    const s = state();
    if (!p) { core.toast('Arena için önce bir petin olmalı.'); return; }
    const team = [petDef(), ...allyDefs()];
    const slot = (d, i) => d ? `<div class="ar-slot ${i === 0 ? 'me' : ''}" ${i ? `data-rm="${i - 1}"` : ''}>${artOf(d)}<b>${esc(d.name || '')}</b><small>${ROLES[d.role]?.icon || ''} ${esc(ROLES[d.role]?.name || '')} ${typeChip(d.kind === 'mon' ? MONSTERS[d.mon].type : null) || ''}</small>${i ? '<i>çıkar</i>' : ''}</div>` : `<div class="ar-slot empty"><span>+</span><small>Boş yer</small></div>`;
    const rosterHtml = s.roster.length ? s.roster.map(r => `<button class="ar-pick ${s.team.includes(r.id) ? 'on' : ''}" data-add="${r.id}">${monsterSVG(r.mon)}<b>${esc(MONSTERS[r.mon].name)}</b><small>${ROLES[r.role].icon} Evre ${r.stage + 1}</small></button>`).join('') : '<p class="ar-empty">Henüz yanına katılan yok. Antrenmanda yendiğin canavarlardan biri takımına katılabilir.</p>';
    const friendsHtml = s.friends.length ? s.friends.map(f => f.pet ? `<button class="ar-pick ${s.team.includes('f:' + f.code) ? 'on' : ''}" data-add="f:${f.code}">${petSVG(f.pet.species, f.pet.stage, { coat: f.pet.coat, shiny: f.pet.shiny })}<b>${esc(f.pet.name)}</b><small>${esc(f.label || f.code)}</small></button>` : '').join('') : '';
    $('#arBody').innerHTML = `<div class="ar-team">${[0, 1, 2].map(i => slot(team[i], i)).join('')}</div>
      <p class="ar-note">Savaş üç kişilik takımla daha kolaydır. Takımın yalnızca kendi petinden oluşabilir; diğer iki yere yendiğin canavarları ya da arkadaşlarının petlerini ödünç koyabilirsin.</p>
      <div class="ar-actions"><button class="primarybtn" id="arTrain">⚔️ Antrenman savaşı</button></div>
      <div class="ar-stats">🏆 ${s.wins} galibiyet · 💀 ${s.losses} yenilgi · 👑 ${s.bossWins} boss</div>
      <h3 class="ar-h">Yanına katılanlar</h3><div class="ar-grid">${rosterHtml}</div>
      ${friendsHtml ? `<h3 class="ar-h">Arkadaşların</h3><div class="ar-grid">${friendsHtml}</div>` : ''}
      <div id="arExtra"></div>`;
    hub.classList.add('show');
    onChange?.('arena-open', { body: $('#arExtra') });
  }
  hub.addEventListener('click', e => {
    if (e.target === hub || e.target.closest('#arClose')) { hub.classList.remove('show'); return; }
    const s = state();
    const add = e.target.closest('[data-add]');
    if (add) {
      const id = add.dataset.add;
      if (s.team.includes(id)) s.team = s.team.filter(x => x !== id);
      else if (s.team.length < 2) s.team.push(id);
      else { s.team.shift(); s.team.push(id); }
      core.saveLocal(false); openArena(); return;
    }
    const rm = e.target.closest('[data-rm]');
    if (rm) { s.team.splice(+rm.dataset.rm, 1); core.saveLocal(false); openArena(); return; }
    if (e.target.closest('#arTrain')) { hub.classList.remove('show'); training(); }
  });

  async function training() {
    const p = getPet(); if (!p) return;
    if (!p.alive) { core.toast('Petin şu an savaşamaz.'); return; }
    const team = [petDef(), ...allyDefs()];
    const size = Math.max(1, Math.min(3, team.length + (Math.random() < 0.4 ? 0 : -0)));
    const foes = botTeam(p.stage, size, COMMON);
    const res = await fight(team, foes, { title: 'Antrenman', eye: 'ARENA', canFlee: true });
    const s = state();
    if (res.winner === 'A') {
      s.wins++;
      const beaten = res.foes.filter(u => u.kind === 'mon' && !u.boss);
      if (beaten.length) await offerRecruit(beaten);
    } else if (res.winner === 'B') s.losses++;
    core.saveLocal(true); onChange?.('battle-end', res);
  }

  // yenilen canavarlardan biri takıma katılmak ister
  function offerRecruit(beaten) {
    return new Promise(resolve => {
      const s = state();
      $('#btPanel').innerHTML = `<div class="bt-result"><h3>Kazandın! 🏆</h3><p>Yendiğin canavarlardan biri sana katılmak istiyor. Birini seç ya da geç.</p>
        <div class="ar-grid">${beaten.map(u => `<button class="ar-pick" data-join="${u.uid}">${monsterSVG(u.mon)}<b>${esc(u.name)}</b><small>${ROLES[u.role].icon} ${esc(ROLES[u.role].name)} · Evre ${u.stage + 1}</small></button>`).join('')}</div>
        <button class="secondarybtn" data-join="">Geç</button>${s.roster.length >= MAX_ROSTER ? '<p class="ar-note">Listen dolu; seçersen en eski üye ayrılır.</p>' : ''}</div>`;
      const h = e => {
        const b = e.target.closest('[data-join]'); if (!b) return;
        $('#btPanel').removeEventListener('click', h);
        const u = beaten.find(x => x.uid === b.dataset.join);
        if (u) {
          s.roster.push({ id: 'm' + Date.now().toString(36), kind: 'mon', mon: u.mon, role: u.role, stage: u.stage, name: u.name });
          while (s.roster.length > MAX_ROSTER) { const old = s.roster.shift(); s.team = s.team.filter(x => x !== old.id); }
          core.toast(`${u.name} takımına katıldı.`);
        }
        close(); resolve();
      };
      $('#btPanel').addEventListener('click', h);
    });
  }

  // boss: evrim kapısı. sonuç: 'win' | 'lose'
  async function boss(stageTo) {
    const p = getPet(); if (!p) return 'win';
    const id = BOSS_FOR_STAGE[Math.min(BOSS_FOR_STAGE.length - 1, Math.max(0, stageTo - 1))];
    const M = MONSTERS[id];
    const foes = [{ kind: 'mon', mon: id, stage: Math.max(0, stageTo - 1), role: M.role, boss: true }];
    if (stageTo >= 2) foes.push(...botTeam(Math.max(0, stageTo - 2), stageTo >= 4 ? 2 : 1, COMMON));
    const team = [petDef(), ...allyDefs()];
    const res = await fight(team, foes, { title: M.name, eye: 'BOSS · EVRİM KAPISI', canFlee: false, intro: M.desc });
    const s = state();
    if (res.winner === 'A') { s.bossWins++; s.wins++; } else s.losses++;
    core.saveLocal(true);
    return res.winner === 'A' ? 'win' : 'lose';
  }

  // ---------- savaş döngüsü ----------
  let B = null, resolveFight = null, picking = null;
  function close() { root.classList.remove('show'); document.body.classList.remove('bt-open'); }

  function cardHTML(u) {
    const art = u.kind === 'mon' ? monsterSVG(u.mon) : petSVG(u.species, u.stage, { coat: u.coat, shiny: u.shiny, mood: 'idle' });
    const st = STANCES[u.stance];
    return `<div class="bt-card ${u.boss ? 'boss' : ''}" data-uid="${u.uid}">
      <div class="bt-art">${art}</div>
      <div class="bt-name">${typeChip(u.type)}<b>${esc(u.name)}</b><span title="${esc(ROLES[u.role].name)}">${ROLES[u.role].icon}</span></div>
      <div class="bt-bar hp"><i></i></div><div class="bt-bar will" title="İrade"><i></i></div>
      <div class="bt-st"><span class="bt-stance" title="${esc(st.name)}">${st.icon}</span><span class="bt-fxs"></span></div></div>`;
  }
  function render() {
    const f = B.units.filter(u => u.side === 'B'), a = B.units.filter(u => u.side === 'A');
    $('#btFoe').innerHTML = f.map(cardHTML).join(''); $('#btFoe').dataset.n = f.length;
    $('#btAlly').innerHTML = a.map(cardHTML).join(''); $('#btAlly').dataset.n = a.length;
    refresh();
  }
  function refresh() {
    for (const u of B.units) {
      const el = root.querySelector(`[data-uid="${u.uid}"]`); if (!el) continue;
      el.querySelector('.hp i').style.width = `${Math.max(0, u.hp / u.maxHp * 100)}%`;
      el.querySelector('.will i').style.width = `${Math.max(0, u.will / u.maxWill * 100)}%`;
      el.classList.toggle('down', !u.alive); el.classList.toggle('persuaded', u.out === 'persuaded');
      el.classList.toggle('dive', !!u.fx.dive);
      const st = STANCES[u.stance]; const sEl = el.querySelector('.bt-stance'); sEl.textContent = `${st.icon} ${st.name}`; sEl.title = `${st.name}: ${st.line}`;
      const fx = []; if (u.fx.taunt) fx.push('🛡️'); if (u.fx.atkUp) fx.push('💪'); if (u.fx.focus) fx.push('🎯'); if (u.fx.dodge) fx.push('💨'); if (u.fx.ward) fx.push('♟️'); if (u.fx.mirror) fx.push('🪞'); if (u.fx.dot) fx.push('🔥'); if (u.fx.defDown) fx.push('🔻'); if (u.fx.atkDown) fx.push('⬇️'); if (u.fx.spdUp) fx.push('⚡');
      el.querySelector('.bt-fxs').textContent = fx.join('');
    }
    $('#btRound').textContent = `Tur ${B.round}`;
  }
  const cardOf = uid => root.querySelector(`[data-uid="${uid}"]`);
  const nameOf = uid => B.units.find(u => u.uid === uid)?.name || '';
  function log(html) { $('#btLog').innerHTML = html; }
  function floatText(uid, text, cls) {
    const el = cardOf(uid); if (!el) return;
    const f = document.createElement('div'); f.className = `bt-float ${cls || ''}`; f.textContent = text; el.appendChild(f);
    setTimeout(() => f.remove(), 1100);
  }
  function bubble(uid, text, cls = '') {
    const el = cardOf(uid); if (!el) return;
    el.querySelector('.bt-bub')?.remove();
    const b = document.createElement('div'); b.className = `bt-bub ${cls}`; b.textContent = text; el.appendChild(b);
    setTimeout(() => b.remove(), T(1900));
  }
  async function projectile(from, to, kind) {
    const a = cardOf(from), t = cardOf(to); if (!a || !t || reduced) return;
    const ra = a.getBoundingClientRect(), rt = t.getBoundingClientRect(), box = $('#btArena').getBoundingClientRect();
    const p = document.createElement('i'); p.className = `bt-shot ${kind}`;
    p.style.left = `${ra.left - box.left + ra.width / 2}px`; p.style.top = `${ra.top - box.top + ra.height / 3}px`;
    $('#btFx').appendChild(p);
    await wait(16);
    p.style.transform = `translate(${rt.left - ra.left}px, ${rt.top - ra.top}px)`;
    await wait(300); p.remove();
  }
  async function animate(events) {
    for (const ev of events) {
      if (ev.type === 'use') {
        const u = B.units.find(x => x.uid === ev.from);
        cardOf(ev.from)?.classList.add('acting');
        log(`<b>${esc(u.name)}</b> · ${KIND_ICON[ev.kind] || ''} ${esc(ev.move)}`);
        await wait(T(380));
        cardOf(ev.from)?.classList.remove('acting');
      } else if (ev.type === 'say') { log(`<b>${esc(nameOf(ev.from))}</b>: ${esc(ev.text)}`); await wait(T(700)); }
      else if (ev.type === 'hit') {
        const u = B.units.find(x => x.uid === ev.from);
        if (u && ['ranger', 'magician'].includes(u.role) && !ev.reflect && !ev.counter) await projectile(ev.from, ev.to, u.role);
        const el = cardOf(ev.to);
        if (ev.miss) { floatText(ev.to, 'Iska!', 'miss'); await wait(T(420)); continue; }
        el?.classList.remove('hit'); void el?.offsetWidth; el?.classList.add('hit');
        floatText(ev.to, `−${ev.dmg}${ev.crit ? '!' : ''}`, ev.mult > 1 ? 'super' : ev.mult < 1 ? 'weak' : '');
        if (ev.reflect) log(`🪞 Ayna, darbenin yarısını geri yansıttı.`);
        else if (ev.counter) log(`↩️ ${esc(nameOf(ev.from))} karşılık verdi!`);
        else if (ev.mult > 1) log(`${esc(nameOf(ev.to))}: <b>Çok etkili!</b>${ev.crit ? ' Kritik!' : ''}`);
        else if (ev.mult < 1) log(`${esc(nameOf(ev.to))}: pek etkili değil…`);
        else if (ev.crit) log('Kritik vuruş!');
        refresh(); await wait(T(460));
      } else if (ev.type === 'talk') {
        bubble(ev.from, pick(TALK[ev.arg]), 'talk');
        await wait(T(900));
        const st = STANCES[ev.stance];
        bubble(ev.to, ev.good ? pick(['…haklı olabilirsin.', 'Bunu düşünmemiştim.', 'Hmm…', 'Belki de…']) : st.line, ev.good ? 'soft' : '');
        floatText(ev.to, `−${ev.amt} irade`, ev.good ? 'super' : 'weak');
        log(ev.good ? `💬 <b>İsabetli argüman!</b> ${esc(st.name)} rakip sarsıldı.` : `💬 ${esc(st.name)} rakibe pek işlemedi.`);
        refresh(); await wait(T(800));
      } else if (ev.type === 'retort') { floatText(ev.to, `−${ev.amt} irade`, 'weak'); bubble(ev.to, 'Laf yedim…'); refresh(); await wait(T(500)); }
      else if (ev.type === 'heal') { floatText(ev.to, `+${ev.amt}`, 'heal'); refresh(); await wait(T(380)); }
      else if (ev.type === 'buff') { floatText(ev.to, ev.text, 'buff'); refresh(); await wait(T(380)); }
      else if (ev.type === 'recoil' || ev.type === 'dot') { floatText(ev.to, `−${ev.dmg}`, ev.fatigue ? 'weak' : ''); refresh(); await wait(T(320)); }
      else if (ev.type === 'ko') { log(`💥 ${esc(nameOf(ev.to))} yere serildi.`); refresh(); await wait(T(600)); }
      else if (ev.type === 'persuaded') { bubble(ev.to, 'Tamam… ikna oldum. Gidiyorum.', 'soft'); log(`🕊️ ${esc(nameOf(ev.to))} ikna oldu ve savaştan çekildi.`); refresh(); await wait(T(900)); }
    }
  }

  function showMoves(u) {
    const ms = movesOf(u);
    $('#btPanel').innerHTML = `<div class="bt-turn">Sıra: <b>${esc(u.name)}</b> ${ROLES[u.role].icon}</div><div class="bt-moves">${ms.map(m => `<button class="bt-move" data-mv="${m.id}" ${m.ready === false ? 'disabled' : ''}><b>${KIND_ICON[m.kind] || ''} ${esc(m.name)}</b><small>${esc(m.desc || '')}</small>${m.ready === false ? `<em>${m.cdLeft} tur</em>` : ''}</button>`).join('')}</div>`;
  }
  function chooseFor(u) {
    return new Promise(resolve => {
      picking = { u, resolve, move: null };
      showMoves(u);
      cardOf(u.uid)?.classList.add('turn');
    });
  }
  root.addEventListener('click', e => {
    if (e.target.closest('#btFlee')) {
      if (!B || !B.opts.canFlee) { core.toast('Boss savaşından kaçılmaz.'); return; }
      if (picking) { const r = picking.resolve; picking = null; r({ flee: true }); }
      return;
    }
    if (!picking) return;
    const mv = e.target.closest('[data-mv]');
    if (mv && !mv.disabled) {
      const m = movesOf(picking.u).find(x => x.id === mv.dataset.mv);
      const tk = targetKind(m);
      if (tk === 'none') { done(m.id, null); return; }
      const ts = validTargets(B, picking.u, m);
      if (ts.length === 1) { done(m.id, ts[0].uid); return; }
      picking.move = m.id;
      root.querySelectorAll('.bt-card').forEach(c => c.classList.toggle('pickable', ts.some(t => t.uid === c.dataset.uid)));
      $('#btPanel').innerHTML = `<div class="bt-turn">${tk === 'ally' ? 'Kime?' : 'Hedef seç'} · <b>${esc(m.name)}</b></div><button class="secondarybtn" id="btBack">← Geri</button>`;
      return;
    }
    if (e.target.closest('#btBack')) { picking.move = null; root.querySelectorAll('.pickable').forEach(c => c.classList.remove('pickable')); showMoves(picking.u); return; }
    const card = e.target.closest('.bt-card.pickable');
    if (card && picking.move) done(picking.move, card.dataset.uid);
  });
  function done(move, target) {
    const p = picking; picking = null;
    root.querySelectorAll('.pickable,.turn').forEach(c => c.classList.remove('pickable', 'turn'));
    $('#btPanel').innerHTML = '';
    p.resolve({ move, target });
  }

  async function fight(teamA, teamB, opts = {}) {
    B = createBattle(teamA, teamB, opts);
    $('#btTitle').textContent = opts.title || 'Savaş'; $('#btEye').textContent = opts.eye || 'SAVAŞ';
    $('#btFlee').classList.toggle('hidden', !opts.canFlee);
    root.classList.toggle('is-boss', /BOSS/.test(opts.eye || ''));
    render(); root.classList.add('show'); document.body.classList.add('bt-open');
    log(opts.intro ? esc(opts.intro) : 'Savaş başlıyor. Her tur hamleni seç.');
    await wait(T(900));
    let fled = false;
    while (!B.over) {
      const u = nextActor(B); if (!u) break;
      refresh();
      let choice;
      if (u.side === 'A') { choice = await chooseFor(u); if (choice.flee) { fled = true; break; } }
      else { await wait(T(380)); choice = aiChoose(B, u); }
      const evs = act(B, u, choice.move, choice.target);
      await animate(evs);
    }
    const winner = fled ? 'B' : B.winner;
    const foes = B.units.filter(u => u.side === 'B');
    if (fled) { log('Kaçtın. Bir dahaki sefere.'); await wait(T(700)); close(); return { winner: 'B', fled: true, foes }; }
    log(winner === 'A' ? '🏆 <b>Kazandın!</b>' : '💀 <b>Kaybettin.</b>');
    await wait(T(900));
    if (!(winner === 'A' && opts.title === 'Antrenman' && foes.some(u => u.kind === 'mon' && !u.boss))) {
      await new Promise(r => {
        $('#btPanel').innerHTML = `<div class="bt-result"><h3>${winner === 'A' ? 'Kazandın! 🏆' : 'Kaybettin 💀'}</h3><button class="primarybtn" id="btOk">Devam</button></div>`;
        $('#btOk').addEventListener('click', r, { once: true });
      });
      close();
    }
    return { winner, foes };
  }

  return { openArena, training, boss, fight, state, close: () => hub.classList.remove('show') };
}
