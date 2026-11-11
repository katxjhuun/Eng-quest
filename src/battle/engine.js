// dam-la — sıra tabanlı savaş motoru (arayüzden bağımsız, saf mantık).
// İki takım (A: oyuncu, B: rakip). Her tur hızlı olan önce oynar. Oyuncu kendi birimlerinin hamlesini seçer, B'yi yapay zekâ oynar.
// Hasar = saldırı × güç × savunma çarpanı × tip üstünlüğü (taş-kâğıt-makas döngüsü) × rastgelelik.
// Hilebaz rolü saldırmaz, ikna eder:
//  · Her birimin bir mizacı vardır; her tur bir tavır takınır (şüpheci/kibirli/kırılgan/öfkeli). Tavır doğrudan görünmez,
//    yalnızca söylediği sözden anlaşılır; güçlü rakipler bazen blöf yapar (başka tavrın sözünü söyler). “Oku” gerçeği ve sonraki turu gösterir.
//  · Her tavrın işleyen bir argümanı (×) ve ters tepen bir argümanı vardır. İşleyen argüman güven (rapor) biriktirir, güven sonraki argümanları
//    güçlendirir; ters tepen argüman güveni sıfırlar, rakip inatlaşır (irade toplar) ve hilebaza laf sokar. Aynı argümanı üst üste kullanmak zayıflar,
//    farklı isabetli argümanları art arda kullanmak zincir bonusu verir. “Son Söz” biriken güveni tek seferde harcar.
//  · Boss’lar güven en az 2 olmadan tam etkilenmez ve her hamlede biraz irade toplar.
//  · İsabetli argüman rakibi tereddüde düşürür (saldırısı 1 tur zayıflar).
//  · Güven 2+ iken iradesi biten rakip savaştan çekilmek yerine 2 hamle boyunca hilebazın safına geçer, sonra ayrılır.
// Üç taş-kâğıt-makas katmanı: tip (×1,5 / ×0,67), rol (×1,25 / ×0,8) ve hilebazın tavırları.
// Üstün tipten gelen darbe element etkisi bırakır (yanık, ıslak, sarmaşık, sersem, savrulma, korku).
// Her birim hamle yaptıkça ve darbe aldıkça enerji (⚡) toplar; 100 olunca rolüne özgü süper yeteneği açılır.
// Döngüleri kırmak için: aynı birim art arda iyileştikçe iyileşme azalır, 10. turdan sonra arena fırtınası giderek sertleşir.
import { ROLES, SIGNATURE, STANCES, ARGS, SPECIES_TYPE, typeMult, roleMult, ELEMENT_FX, ULT, EN_MAX, battleStats, BASE } from '../pets/codex.js';
import { MONSTERS } from './monsters.js';

const STANCE_IDS = Object.keys(STANCES);
let uidSeq = 0;
const rnd = (a, b) => a + Math.random() * (b - a);
const pickOne = a => a[Math.floor(Math.random() * a.length)];

// tanım → savaş birimi. def: { kind:'pet'|'mon', species|mon, stage, stars, role, shiny, name, coat, owner }
export function makeUnit(def, side) {
  const isMon = def.kind === 'mon';
  const m = isMon ? MONSTERS[def.mon] : null;
  const role = def.role && ROLES[def.role] ? def.role : (m?.role || 'melee');
  let st;
  if (isMon) {
    const R = ROLES[role].mult, k = (1 + 0.2 * (def.stage || 0)) * (def.boss ? 1.15 : 1);
    st = { hp: Math.round(m.base.hp * R.hp * k), atk: Math.round(m.base.atk * (R.atk || 0.6) * k), def: Math.round(m.base.def * R.def * k), spd: Math.round(m.base.spd * R.spd * (1 + 0.05 * (def.stage || 0))) };
  } else st = battleStats(def.species, def.stage || 0, def.stars || 0, role, !!def.shiny);
  const moves = [...ROLES[role].moves];
  if (!isMon && SIGNATURE[def.species]) moves.push(SIGNATURE[def.species]);
  return {
    uid: `u${++uidSeq}`, side, kind: def.kind, species: def.species, mon: def.mon, boss: !!(m && m.boss), name: def.name || (m ? m.name : def.species),
    type: isMon ? m.type : (def.type || SPECIES_TYPE[def.species]), role, stage: def.stage || 0, shiny: !!def.shiny, coat: def.coat, owner: def.owner || '',
    maxHp: st.hp, hp: st.hp, maxWill: Math.round(st.hp * (role === 'tank' ? 0.9 : 0.7) + 20), will: 0, atk: st.atk, def: st.def, spd: st.spd,
    moves, ult: ULT[role] || null, en: 0, healed: 0, last2: [], cds: {}, fx: {}, alive: true, out: null, stance: null, nextStance: null, tell: '', bluff: false, temper: pickOne(STANCE_IDS), rap: {}, hist: {}, seen: {}, convert: 0,
  };
}

export function createBattle(teamA, teamB, opts = {}) {
  const units = [...teamA.map(d => makeUnit(d, 'A')), ...teamB.map(d => makeUnit(d, 'B'))];
  units.forEach(u => { u.will = u.maxWill; });
  const b = { units, round: 0, order: [], turn: -1, log: [], over: false, winner: null, opts, last: { A: null, B: null } };
  newRound(b);
  return b;
}

const alive = (b, side) => b.units.filter(u => u.alive && (!side || u.side === side));
const foes = (b, u) => alive(b, u.side === 'A' ? 'B' : 'A');
const allies = (b, u) => alive(b, u.side);

// mizaç ağırlıklı tavır: yarı yarıya mizacı, kalanı rastgele
const rollStance = u => (Math.random() < 0.5 ? u.temper : pickOne(STANCE_IDS));
function newRound(b) {
  b.round++;
  for (const u of alive(b)) {
    u.stance = u.nextStance || rollStance(u);
    u.nextStance = rollStance(u);
    // söylediği söz: güçlüler (boss, ileri evre) bazen başka tavrın sözünü söyler
    const bluffP = u.boss ? 0.35 : u.stage >= 3 ? 0.25 : 0.1;
    u.bluff = Math.random() < bluffP;
    const shown = u.bluff ? pickOne(STANCE_IDS.filter(x => x !== u.stance)) : u.stance;
    u.tell = pickOne(STANCES[shown].tells);
    // süreli etkiler
    for (const k of ['taunt', 'defDown', 'atkUp', 'atkDown', 'spdUp', 'ward', 'dot', 'slow']) if (u.fx[k] > 0) u.fx[k]--;
  }
  b.order = alive(b).map(u => ({ u, s: u.spd * (u.fx.spdUp ? 1.3 : 1) * (u.fx.slow ? 0.65 : 1) * rnd(0.9, 1.1) })).sort((x, y) => y.s - x.s).map(x => x.u.uid);
  b.turn = -1;
}

// sıradaki birim (ölüler atlanır); savaş bittiyse null
export function nextActor(b) {
  if (b.over) return null;
  for (;;) {
    b.turn++;
    if (b.turn >= b.order.length) newRound(b);
    const u = b.units.find(x => x.uid === b.order[b.turn]);
    if (u && u.alive) {
      for (const k of Object.keys(u.cds)) if (u.cds[k] > 0) u.cds[k]--;
      return u;
    }
  }
}

// hamlenin hedef türü: 'foe' | 'ally' | 'none'
export function targetKind(move) {
  if (!move) return 'none';
  if (move.kind === 'attack' || move.kind === 'talk') return move.aoe ? 'none' : 'foe';
  if (move.kind === 'dive') return 'none';
  if (move.kind === 'read' || move.kind === 'confuse') return 'foe';
  if (move.kind === 'heal') return move.ally ? 'ally' : 'none';
  if (move.kind === 'ult') return 'none';
  if (move.kind === 'buff') return move.ally ? 'ally' : 'none';
  return 'none';
}
// bir birimin o an kullanabileceği hamleler (dalıştaysa tek seçenek yüzeye çıkmaktır)
export function movesOf(u) {
  if (u.fx.dive) return [{ id: 'surface', name: 'Yüzeye Çık', kind: 'attack', power: 1.9, sure: true, desc: 'Derinden çıkıp ağır vurur.' }];
  const list = u.moves.map(m => ({ ...m, ready: !(u.cds[m.id] > 0), cdLeft: u.cds[m.id] || 0 }));
  if (u.ult) list.push({ ...u.ult, ready: u.en >= EN_MAX, enLeft: Math.max(0, EN_MAX - u.en) });
  return list;
}
export function validTargets(b, u, move) {
  const k = targetKind(move);
  if (k === 'ally') return allies(b, u);
  if (k === 'foe') {
    const f = foes(b, u).filter(x => !x.fx.dive);
    const taunting = f.filter(x => x.fx.taunt > 0);
    return u.side === 'B' && taunting.length ? taunting : f;
  }
  return [];
}

function dmgCalc(b, a, t, move, ev) {
  let def = t.def * (t.fx.defDown ? 0.7 : 1);
  if (move.pierce) def *= 1 - move.pierce;
  let tm = typeMult(a.type, t.type);
  if (move.typeBoost && tm !== 1) tm = tm > 1 ? tm * 1.35 : tm;
  const rm = roleMult(a.role, t.role);
  let d = a.atk * (move.power || 1) * (60 / (60 + def)) * tm * rm * rnd(0.88, 1.12) * 2.2;
  if (a.fx.atkUp) d *= 1.3;
  if (a.fx.atkDown) d *= 0.75;
  if (a.fx.focus) { d *= 2; a.fx.focus = 0; ev.focus = true; }
  if (move.execute && t.hp / t.maxHp < move.execute) { d *= 2; ev.execute = true; }
  if (move.crit && Math.random() < move.crit) { d *= 1.8; ev.crit = true; }
  if (t.fx.taunt) d *= 0.6;
  if (allies(b, t).some(x => x.fx.ward > 0)) d *= 0.5;
  ev.mult = tm; ev.rmult = rm;
  return Math.max(1, Math.round(d));
}

// canavarlar (boss değilse) enerjiyi biraz daha yavaş toplar; oyuncunun süper yeteneği önce gelsin
const gain = (u, n) => { if (u && u.ult) u.en = Math.min(EN_MAX, (u.en | 0) + n * (u.kind === 'mon' && !u.boss ? 0.8 : 1)); };
// üstün tipin bıraktığı element etkisi
function element(type, t, events) {
  if (!ELEMENT_FX[type]) return;
  const f = t.fx;
  if (type === 'ates') { f.dot = Math.max(f.dot | 0, 3); f.dotAmt = Math.max(f.dotAmt | 0, Math.max(1, Math.round(t.maxHp * 0.05))); }
  else if (type === 'su') f.slow = Math.max(f.slow | 0, 3);
  else if (type === 'doga') f.defDown = Math.max(f.defDown | 0, 3);
  else if (type === 'tas') f.stun = 1;
  else if (type === 'ruzgar') { f.atkUp = 0; f.focus = 0; f.ward = 0; f.spdUp = 0; f.dodge = 0; f.mirror = 0; f.counterReady = 0; }
  else if (type === 'ruh') f.atkDown = Math.max(f.atkDown | 0, 3);
  events.push({ type: 'element', to: t.uid, el: type });
}
function heal(u, t, k, events, floor = 0.35) {
  const eff = Math.max(floor, 1 - 0.22 * (t.healed | 0));
  const h = Math.max(1, Math.round(t.maxHp * k * eff)); t.hp = Math.min(t.maxHp, t.hp + h); t.healed = (t.healed | 0) + 1;
  events.push({ type: 'heal', to: t.uid, amt: h, tired: eff < 1 });
}
function hit(b, a, t, move, events) {
  const ev = { type: 'hit', from: a.uid, to: t.uid, move: move.name, id: move.id, role: a.role, utype: a.type };
  if (t.fx.dodge && !move.sure) { t.fx.dodge = 0; ev.miss = true; events.push(ev); return; }
  if (t.fx.counterReady && !t.fx.dive) ev.countered = true;
  const d = dmgCalc(b, a, t, move, ev);
  t.hp = Math.max(0, t.hp - d); ev.dmg = d;
  ev.hpAfter = t.hp;
  events.push(ev);
  gain(t, 10); if (ev.mult > 1 || ev.rmult > 1) gain(a, 8);
  // üstün tip her zaman, diğerleri %20 olasılıkla element etkisi bırakır (zayıf tip hiç bırakmaz)
  if (t.hp > 0 && !ev.reflect && (ev.mult > 1 || move.forceEl || (ev.mult === 1 && Math.random() < 0.2))) element(a.type, t, events);
  if (t.fx.mirror) { const r = Math.round(d * 0.5); t.fx.mirror = 0; a.hp = Math.max(0, a.hp - r); events.push({ type: 'hit', from: t.uid, to: a.uid, dmg: r, reflect: true, move: 'Ayna' }); }
  if (ev.countered) { t.fx.counterReady = 0; const r = Math.round(t.atk * 0.8 * 1.6); a.hp = Math.max(0, a.hp - r); events.push({ type: 'hit', from: t.uid, to: a.uid, dmg: r, counter: true, move: 'Karşılık' }); }
  if (move.debuff === 'def') t.fx.defDown = 2;
  if (move.debuff === 'atk') t.fx.atkDown = 2;
  if (move.dot) t.fx.dot = 3, t.fx.dotAmt = Math.max(1, Math.round(t.maxHp * move.dot));
  if (move.cleanse) { t.fx.atkUp = 0; t.fx.focus = 0; t.fx.ward = 0; t.fx.spdUp = 0; }
  if (move.recoil) { const r = Math.round(a.maxHp * move.recoil); a.hp = Math.max(1, a.hp - r); events.push({ type: 'recoil', to: a.uid, dmg: r }); }
}

// bir tarafın o tur rakibin tavrını görüp görmediği
// Oku: o turun ve bir sonraki turun tavrını gösterir (iki tur geçerli)
export function stanceSeen(b, side, t) { return t.side === side || (t.seen[side] != null && b.round - t.seen[side] <= 1); }
export function rapportOf(t, side) { let m = 0; for (const [uid, v] of Object.entries(t.rap)) if (v > m && uid.startsWith(side + ':')) m = v; return m; }
const rk = a => `${a.side}:${a.uid}`;

function talk(b, a, t, move, events) {
  const st = STANCES[t.stance];
  const key = rk(a);
  const rap = t.rap[key] | 0;
  const hist = (t.hist[key] ||= []);
  const ev = { type: 'talk', from: a.uid, to: t.uid, stance: t.stance, arg: move.arg, move: move.name, id: move.id, before: rap };
  let amt;
  if (move.closing) {
    ev.closing = true;
    if (!rap) {
      ev.rel = 'backfire'; amt = 0;
      const back = Math.round(a.maxWill * 0.12); a.will = Math.max(1, a.will - back);
      t.will = Math.min(t.maxWill, t.will + Math.round(t.maxWill * 0.08));
      events.push(ev); events.push({ type: 'retort', to: a.uid, amt: back, from: t.uid, text: 'Önce beni ikna et, sonra nutuk at.' });
      return;
    }
    amt = t.maxWill * (0.12 + 0.13 * rap);
    if (t.boss) amt *= 0.8;
    t.rap[key] = 0; ev.rel = 'closing';
  } else {
    const rel = st.weak === move.arg ? 'weak' : st.resist === move.arg ? 'resist' : 'neutral';
    ev.rel = rel;
    amt = t.maxWill * ({ weak: 0.3, neutral: 0.1, resist: 0.02 }[rel]) * (1 + 0.3 * rap);
    const last = hist.at(-1), prev = hist.at(-2);
    if (last && last.arg === move.arg) { amt *= 0.55; ev.repeat = true; }
    if (rel === 'weak' && last?.rel === 'weak' && last.arg !== move.arg) { amt *= prev?.rel === 'weak' && prev.arg !== last.arg ? 1.8 : 1.4; ev.chain = true; }
    if (t.boss && rap < 2) { amt *= 0.6; ev.resolve = true; }
    if (rel === 'weak') { gain(a, 8); t.rap[key] = Math.min(4, rap + 1); t.fx.atkDown = Math.max(t.fx.atkDown | 0, 2); ev.doubt = true; }
    if (rel === 'resist') {
      t.rap[key] = 0;
      const regain = Math.round(t.maxWill * 0.06); t.will = Math.min(t.maxWill, t.will + regain); ev.regain = regain;
    }
    hist.push({ arg: move.arg, rel }); if (hist.length > 3) hist.shift();
  }
  amt = Math.max(1, Math.round(amt * rnd(0.92, 1.08)));
  ev.amt = amt; ev.rap = t.rap[key] | 0;
  t.will = Math.max(0, t.will - amt);
  events.push(ev);
  if (ev.rel === 'resist') { const back = Math.round(a.maxWill * 0.08); a.will = Math.max(1, a.will - back); events.push({ type: 'retort', to: a.uid, amt: back, from: t.uid }); }
  // güven yüksekken ikna olan, hilebazın safına geçer
  if (t.will <= 0 && !t.boss && rap >= 2) {
    t.side = a.side; t.convert = 2; t.will = Math.round(t.maxWill * 0.35); t.rap = {}; t.hist = {}; t.fx.taunt = 0;
    events.push({ type: 'convert', to: t.uid, side: a.side });
  }
}
function read(b, a, t, events) {
  t.seen[a.side] = b.round;
  events.push({ type: 'read', from: a.uid, to: t.uid, stance: t.stance, next: t.nextStance, bluff: t.bluff });
}

function settle(b, events) {
  for (const u of b.units) {
    if (!u.alive) continue;
    if (u.hp <= 0) { u.alive = false; u.out = 'ko'; events.push({ type: 'ko', to: u.uid }); }
    else if (u.will <= 0) { u.alive = false; u.out = 'persuaded'; events.push({ type: 'persuaded', to: u.uid }); }
  }
  if (!alive(b, 'A').length || !alive(b, 'B').length) {
    b.over = true; b.winner = alive(b, 'A').length ? 'A' : 'B';
    events.push({ type: 'end', winner: b.winner });
  }
}

// hamleyi uygula; olay listesi döner (arayüz bunları sırayla canlandırır)
export function act(b, u, moveId, targetUid) {
  const events = [];
  if (b.over || !u.alive) return events;
  // uzayan savaşta yorgunluk: 20. turdan sonra herkes her hamlede biraz yıpranır
  // 10. turdan sonra arena fırtınası: her tur biraz daha sert (sonsuz döngüye girmeyi engeller)
  if (b.round >= 10 && u.stormAt !== b.round) {
    u.stormAt = b.round;
    const k = 0.03 + 0.015 * (b.round - 10);
    const f = Math.max(1, Math.round(u.maxHp * k)); u.hp = Math.max(0, u.hp - f); u.will = Math.max(0, u.will - Math.round(u.maxWill * k * 0.7));
    events.push({ type: 'dot', to: u.uid, dmg: f, fatigue: true, storm: true, first: !b.stormShown }); b.stormShown = true;
    settle(b, events); if (!u.alive || b.over) return events;
  }
  // tur başı: yanma
  if (u.fx.dot > 0 && u.fx.dotAmt) { u.hp = Math.max(0, u.hp - u.fx.dotAmt); events.push({ type: 'dot', to: u.uid, dmg: u.fx.dotAmt }); settle(b, events); if (!u.alive || b.over) return events; }
  let move = movesOf(u).find(m => m.id === moveId && m.ready !== false) || movesOf(u).find(m => m.ready !== false && m.kind !== 'ult') || movesOf(u)[0];
  gain(u, 18);
  // taşın sersemliği: yarı yarıya hamle kaçar
  if (u.fx.stun) {
    u.fx.stun = 0;
    if (Math.random() < 0.5) { events.push({ type: 'stunned', to: u.uid }); afterAct(b, u, events); settle(b, events); return events; }
    events.push({ type: 'unstun', to: u.uid });
  }
  if (move.kind === 'ult') { ultimate(b, u, move, events); u.last2 = [move.id, ...u.last2].slice(0, 2); afterAct(b, u, events); settle(b, events); return events; }
  if (u.boss && u.will < u.maxWill) { const g = Math.round(u.maxWill * 0.04); u.will = Math.min(u.maxWill, u.will + g); }
  // kafası karışık: yarı yarıya boşa gider ya da kendi takımından birine vurur
  if (u.fx.confused) {
    u.fx.confused = 0;
    if (Math.random() < 0.5) {
      const mates = allies(b, u).filter(x => x !== u);
      events.push({ type: 'use', from: u.uid, move: move.name, id: move.id, kind: move.kind, role: u.role, utype: u.type });
      if (move.kind === 'attack' && mates.length) { const t = pickOne(mates); events.push({ type: 'confused', to: u.uid, text: 'kafası karıştı, kendi takımına vurdu!' }); hit(b, u, t, { ...move, aoe: false }, events); }
      else events.push({ type: 'confused', to: u.uid, text: 'kafası karıştı, ne yapacağını şaşırdı' });
      afterAct(b, u, events); settle(b, events); return events;
    }
  }
  if (move.kind === 'replay') {
    const src = b.last[u.side];
    events.push({ type: 'say', from: u.uid, text: src ? `“${src.name}” hamlesini bir kez daha oynuyor.` : 'Tekrarlanacak bir hamle yok; bekliyor.' });
    u.cds[move.id] = move.cd || 0;
    if (!src) { settle(b, events); return events; }
    move = { ...src, cd: 0 };
    if (targetKind(move) !== 'none' && !validTargets(b, u, move).some(x => x.uid === targetUid)) targetUid = (validTargets(b, u, move)[0] || {}).uid;
  }
  const tk = targetKind(move);
  let target = tk === 'none' ? null : b.units.find(x => x.uid === targetUid && x.alive);
  if (tk !== 'none' && (!target || !validTargets(b, u, move).includes(target))) target = validTargets(b, u, move)[0] || null;
  events.push({ type: 'use', from: u.uid, move: move.name, id: move.id, kind: move.kind, role: u.role, utype: u.type, to: target?.uid, aoe: !!move.aoe, team: !!move.team });

  if (move.id === 'surface') { u.fx.dive = 0; const t = target || pickOne(foes(b, u)); if (t) hit(b, u, t, move, events); }
  else if (move.kind === 'attack') {
    const targets = move.aoe ? foes(b, u).filter(x => !x.fx.dive) : target ? [target] : [];
    for (const t of targets) hit(b, u, t, move, events);
    if (move.then === 'dodge') u.fx.dodge = 1;
    if (move.guardAlly) { const w = allies(b, u).filter(x => x !== u).sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0]; if (w) { w.fx.dodge = 1; events.push({ type: 'buff', to: w.uid, text: 'korunuyor' }); } }
  } else if (move.kind === 'talk') { if (target) talk(b, u, target, move, events); }
  else if (move.kind === 'read') { if (target) read(b, u, target, events); }
  else if (move.kind === 'confuse') { if (target) { target.fx.confused = 1; events.push({ type: 'buff', to: target.uid, text: 'kafası karıştı', bad: true }); } }
  else if (move.kind === 'heal') {
    const list = move.team ? allies(b, u) : move.ally ? (target ? [target] : []) : [u];
    const k = move.team || move.ally || move.self || 0.2;
    for (const t of list) { if (move.team) { t.fx.atkDown = 0; t.fx.defDown = 0; t.fx.dot = 0; t.fx.slow = 0; t.fx.stun = 0; } heal(u, t, k, events); }
  } else if (move.kind === 'guard') { u.fx.taunt = (move.turns || 2) + 1; events.push({ type: 'buff', to: u.uid, text: 'saldırıları üstüne çekiyor' }); }
  else if (move.kind === 'buff') {
    const list = move.team ? allies(b, u) : move.ally ? (target ? [target] : []) : [u];
    for (const t of list) {
      if (move.buff === 'focus') t.fx.focus = 1;
      if (move.buff === 'dodge') t.fx.dodge = 1;
      if (move.buff === 'atk') t.fx.atkUp = 3;
      if (move.buff === 'spd') t.fx.spdUp = 4;
      if (move.buff === 'ward') t.fx.ward = 3;
      if (move.buff === 'mirror') t.fx.mirror = 1;
      events.push({ type: 'buff', to: t.uid, text: { focus: 'nişan aldı', dodge: 'gözden kayboldu', atk: 'güçlendi', spd: 'hızlandı', ward: 'korumada', mirror: 'aynayı tutuyor' }[move.buff] || 'güçlendi' });
    }
    if (move.counter) u.fx.counterReady = 1;
  } else if (move.kind === 'dive') { u.fx.dive = 1; events.push({ type: 'buff', to: u.uid, text: 'derine daldı' }); }

  if (move.cd) u.cds[move.id] = move.cd + 1;
  u.last2 = [move.id, ...u.last2].slice(0, 2);
  if (move.kind !== 'replay' && move.id !== 'surface' && move.kind !== 'dive') b.last[u.side] = { ...move };
  afterAct(b, u, events);
  settle(b, events);
  return events;
}
// süper yetenekler
function ultimate(b, u, move, events) {
  u.en = 0;
  events.push({ type: 'use', from: u.uid, move: move.name, id: move.id, kind: 'ult', ult: move.ult, role: u.role, utype: u.type, aoe: true });
  const fs = () => foes(b, u).filter(x => !x.fx.dive && x.hp > 0);
  if (move.ult === 'fortress') {
    for (const t of allies(b, u)) { t.fx.ward = Math.max(t.fx.ward | 0, 3); events.push({ type: 'buff', to: t.uid, text: 'kale kalkanı' }); }
    u.fx.taunt = 3; heal(u, u, 0.15, events, 1);
  } else if (move.ult === 'quake' || move.ult === 'star' || move.ult === 'storm') {
    for (const t of fs()) { hit(b, u, t, move, events); if (move.ult === 'quake' && t.hp > 0) t.fx.defDown = Math.max(t.fx.defDown | 0, 3); }
  } else if (move.ult === 'dance') {
    for (let i = 0; i < (move.hits || 3); i++) { const t = fs().sort((x, y) => x.hp - y.hp)[0]; if (!t) break; hit(b, u, t, move, events); }
  } else if (move.ult === 'rebirth') {
    const down = b.units.find(x => !x.alive && x.out === 'ko' && x.side === u.side);
    if (down) { down.alive = true; down.out = null; down.hp = Math.round(down.maxHp * 0.3); down.fx = {}; if (!b.order.includes(down.uid)) b.order.push(down.uid); events.push({ type: 'revive', to: down.uid, amt: down.hp }); }
    for (const t of allies(b, u)) { t.fx.atkDown = 0; t.fx.defDown = 0; t.fx.dot = 0; t.fx.slow = 0; t.fx.stun = 0; t.fx.confused = 0; if (t !== down) heal(u, t, 0.3, events, 0.5); }
  } else if (move.ult === 'speech') {
    const key = rk(u);
    for (const t of foes(b, u)) {
      const amt = Math.max(1, Math.round(t.maxWill * (t.boss ? 0.12 : 0.2)));
      t.will = Math.max(0, t.will - amt); t.rap[key] = Math.min(4, (t.rap[key] | 0) + 1); t.fx.atkDown = Math.max(t.fx.atkDown | 0, 2);
      events.push({ type: 'talk', from: u.uid, to: t.uid, stance: t.stance, arg: 'feel', move: move.name, id: move.id, rel: 'weak', amt, rap: t.rap[key], speech: true });
    }
  }
}
// safa geçen birimin süresi
function afterAct(b, u, events) {
  if (u.convert > 0 && u.alive) { u.convert--; if (!u.convert) { u.alive = false; u.out = 'persuaded'; events.push({ type: 'leave', to: u.uid }); } }
}

// rakip yapay zekâsı: süper yeteneği doğru anda kullanır, tip ve rol üstünlüğüne göre hedef seçer,
// aynı hamleyi üçüncü kez üst üste yapmaz, yorgun (çok iyileşmiş) birimi iyileştirmekle oyalanmaz.
export function aiChoose(b, u) {
  let ms = movesOf(u).filter(m => m.ready !== false);
  // çeşitlilik: aynı hamle üst üste ikiden fazla olmasın
  if (u.last2[0] && u.last2[0] === u.last2[1]) { const alt = ms.filter(m => m.id !== u.last2[0]); if (alt.length) ms = alt; }
  const f = validTargets(b, u, { kind: 'attack' });
  const al = allies(b, u);
  const ult = ms.find(m => m.kind === 'ult');
  if (ult) {
    const hurt = al.filter(x => x.hp / x.maxHp < 0.55).length, down = b.units.some(x => !x.alive && x.out === 'ko' && x.side === u.side);
    const ok = { fortress: al.reduce((s, x) => s + x.hp / x.maxHp, 0) / al.length < 0.75, rebirth: hurt || down }[ult.ult];
    if (ok !== false && (ok || f.length)) return { move: ult.id, target: null };
  }
  ms = ms.filter(m => m.kind !== 'ult');
  const weakAlly = al.filter(x => x.hp / x.maxHp < 0.45 && (x.healed | 0) < 3).sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0];
  const heal = ms.find(m => m.kind === 'heal');
  if (heal && weakAlly && (heal.ally || heal.team || weakAlly === u)) return { move: heal.id, target: weakAlly.uid };
  if (!f.length) { const m = ms.find(x => targetKind(x) !== 'foe' && x.kind !== 'heal') || ms[0]; return { move: m.id, target: targetKind(m) === 'ally' ? (weakAlly || al[0]).uid : null }; }
  const talkMs = ms.filter(m => m.kind === 'talk' && !m.closing);
  if (talkMs.length) {
    const key = `${u.side}:${u.uid}`;
    const t = f.sort((x, y) => x.will / x.maxWill - y.will / y.maxWill)[0];
    const rap = t.rap[key] | 0;
    const close = ms.find(m => m.closing);
    if (close && rap >= 3) return { move: close.id, target: t.uid };
    const seen = stanceSeen(b, u.side, t);
    const readM = ms.find(m => m.kind === 'read');
    if (!seen && readM && Math.random() < 0.3) return { move: readM.id, target: t.uid };
    const conf = ms.find(m => m.kind === 'confuse');
    if (conf && Math.random() < 0.15) return { move: conf.id, target: (f.find(x => x.role !== 'support') || t).uid };
    const guess = seen ? t.stance : (Math.random() < 0.6 ? (Object.keys(STANCES).find(k => STANCES[k].tells.includes(t.tell)) || t.stance) : null);
    const smart = guess ? talkMs.find(m => m.arg === STANCES[guess].weak) : null;
    return { move: (smart || pickOne(talkMs)).id, target: t.uid };
  }
  // hedef puanı: tip × rol üstünlüğü, azalan can, bitirilebilirlik
  const score = t => typeMult(u.type, t.type) * roleMult(u.role, t.role) * (1.7 - t.hp / t.maxHp) * (t.fx.taunt ? 1.2 : 1) * rnd(0.85, 1.15);
  const tgt = [...f].sort((x, y) => score(y) - score(x))[0];
  const atk = ms.filter(m => m.kind === 'attack' || m.kind === 'dive');
  // anlamsız yardımcı hamleleri ele: zaten açık olan etkiyi yeniden kurma
  const util = ms.filter(m => m.kind !== 'attack' && m.kind !== 'talk' && m.kind !== 'heal' && !(m.kind === 'guard' && u.fx.taunt) && !(m.buff === 'focus' && u.fx.focus) && !(m.buff === 'dodge' && u.fx.dodge) && !(m.buff === 'mirror' && u.fx.mirror) && !(m.buff === 'ward' && u.fx.ward));
  let m;
  const exec = atk.find(x => x.execute && tgt && tgt.hp / tgt.maxHp < x.execute);
  if (exec) m = exec;
  else if (u.fx.focus && atk.length) m = atk.sort((x, y) => (y.power || 1) - (x.power || 1))[0];
  else if (util.length && Math.random() < 0.3) m = pickOne(util);
  else m = pickOne(atk.length ? atk : ms);
  const tk = targetKind(m);
  const target = tk === 'ally' ? (weakAlly || pickOne(al)) : tgt;
  return { move: m.id, target: target ? target.uid : null };
}

// bot takımı: oyuncunun evresine göre ölçeklenir
export function botTeam(stage, size, pool, exclude = []) {
  const ids = pool.filter(x => !exclude.includes(x));
  const out = [];
  for (let i = 0; i < size; i++) {
    const mon = pickOne(ids);
    out.push({ kind: 'mon', mon, stage: Math.max(0, Math.min(5, stage + (Math.random() < 0.25 ? 1 : 0) - (Math.random() < 0.3 ? 1 : 0))), role: pickOne(Object.keys(ROLES)) });
  }
  return out;
}
export { BASE };

// Yöneticinin canlı müdahalesi (panelden): herhangi bir birime iyileştirme, hasar, kalkan, güç, zayıflatma, kafa karışıklığı,
// irade kırma, nakavt ya da canlandırma. Olay listesi döner; arayüz bunları özel bir efektle canlandırır.
export function adminOp(b, uid, op) {
  const t = b.units.find(u => u.uid === uid), ev = [];
  if (!t || b.over) return ev;
  ev.push({ type: 'admin', to: uid, op });
  if (op === 'revive') {
    if (!t.alive && t.out === 'ko') { t.alive = true; t.out = null; t.hp = Math.round(t.maxHp * 0.5); ev.push({ type: 'heal', to: uid, amt: t.hp }); if (!b.order.includes(uid)) b.order.push(uid); }
    settle(b, ev); return ev;
  }
  if (!t.alive) return ev;
  if (op === 'heal') { const h = Math.round(t.maxHp * 0.35); t.hp = Math.min(t.maxHp, t.hp + h); ev.push({ type: 'heal', to: uid, amt: h }); }
  else if (op === 'hurt') { const d = Math.max(1, Math.round(t.maxHp * 0.3)); t.hp = Math.max(0, t.hp - d); ev.push({ type: 'hit', from: uid, to: uid, dmg: d, mult: 1, id: 'admin', admin: true }); }
  else if (op === 'shield') { t.fx.ward = 3; t.fx.dodge = 1; ev.push({ type: 'buff', to: uid, text: 'yönetici kalkanı' }); }
  else if (op === 'buff') { t.fx.atkUp = 3; t.fx.spdUp = 3; ev.push({ type: 'buff', to: uid, text: 'güçlendi' }); }
  else if (op === 'weaken') { t.fx.atkDown = 3; t.fx.defDown = 3; ev.push({ type: 'buff', to: uid, text: 'zayıfladı', bad: true }); }
  else if (op === 'confuse') { t.fx.confused = 1; ev.push({ type: 'buff', to: uid, text: 'kafası karıştı', bad: true }); }
  else if (op === 'will') { const w = Math.round(t.maxWill * 0.4); t.will = Math.max(0, t.will - w); ev.push({ type: 'retort', to: uid, amt: w }); }
  else if (op === 'ko') { const d = t.hp; t.hp = 0; ev.push({ type: 'hit', from: uid, to: uid, dmg: d, mult: 1, id: 'admin', admin: true }); }
  settle(b, ev);
  return ev;
}
