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
import { ROLES, SIGNATURE, STANCES, ARGS, SPECIES_TYPE, typeMult, battleStats, BASE } from '../pets/codex.js';
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
    moves, cds: {}, fx: {}, alive: true, out: null, stance: null, nextStance: null, tell: '', bluff: false, temper: pickOne(STANCE_IDS), rap: {}, hist: {}, seen: {}, convert: 0,
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
    for (const k of ['taunt', 'defDown', 'atkUp', 'atkDown', 'spdUp', 'ward', 'dot']) if (u.fx[k] > 0) u.fx[k]--;
  }
  b.order = alive(b).map(u => ({ u, s: u.spd * (u.fx.spdUp ? 1.3 : 1) * rnd(0.9, 1.1) })).sort((x, y) => y.s - x.s).map(x => x.u.uid);
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
  if (move.kind === 'buff') return move.ally ? 'ally' : 'none';
  return 'none';
}
// bir birimin o an kullanabileceği hamleler (dalıştaysa tek seçenek yüzeye çıkmaktır)
export function movesOf(u) {
  if (u.fx.dive) return [{ id: 'surface', name: 'Yüzeye Çık', kind: 'attack', power: 1.9, sure: true, desc: 'Derinden çıkıp ağır vurur.' }];
  return u.moves.map(m => ({ ...m, ready: !(u.cds[m.id] > 0), cdLeft: u.cds[m.id] || 0 }));
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
  let d = a.atk * (move.power || 1) * (60 / (60 + def)) * tm * rnd(0.88, 1.12) * 2.2;
  if (a.fx.atkUp) d *= 1.3;
  if (a.fx.atkDown) d *= 0.75;
  if (a.fx.focus) { d *= 2; a.fx.focus = 0; ev.focus = true; }
  if (move.execute && t.hp / t.maxHp < move.execute) { d *= 2; ev.execute = true; }
  if (move.crit && Math.random() < move.crit) { d *= 1.8; ev.crit = true; }
  if (t.fx.taunt) d *= 0.6;
  if (allies(b, t).some(x => x.fx.ward > 0)) d *= 0.5;
  ev.mult = tm;
  return Math.max(1, Math.round(d));
}

function hit(b, a, t, move, events) {
  const ev = { type: 'hit', from: a.uid, to: t.uid, move: move.name, id: move.id, role: a.role, utype: a.type };
  if (t.fx.dodge && !move.sure) { t.fx.dodge = 0; ev.miss = true; events.push(ev); return; }
  if (t.fx.counterReady && !t.fx.dive) ev.countered = true;
  const d = dmgCalc(b, a, t, move, ev);
  t.hp = Math.max(0, t.hp - d); ev.dmg = d;
  events.push(ev);
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
    if (rel === 'weak') { t.rap[key] = Math.min(4, rap + 1); t.fx.atkDown = Math.max(t.fx.atkDown | 0, 2); ev.doubt = true; }
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
  if (b.round > 20) { const f = Math.max(1, Math.round(u.maxHp * 0.08)); u.hp = Math.max(0, u.hp - f); u.will = Math.max(0, u.will - Math.round(u.maxWill * 0.05)); events.push({ type: 'dot', to: u.uid, dmg: f, fatigue: true }); settle(b, events); if (!u.alive || b.over) return events; }
  // tur başı: yanma
  if (u.fx.dot > 0 && u.fx.dotAmt) { u.hp = Math.max(0, u.hp - u.fx.dotAmt); events.push({ type: 'dot', to: u.uid, dmg: u.fx.dotAmt }); settle(b, events); if (!u.alive || b.over) return events; }
  let move = movesOf(u).find(m => m.id === moveId) || movesOf(u)[0];
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
    for (const t of list) { const h = Math.round(t.maxHp * k); t.hp = Math.min(t.maxHp, t.hp + h); if (move.team) { t.fx.atkDown = 0; t.fx.defDown = 0; t.fx.dot = 0; } events.push({ type: 'heal', to: t.uid, amt: h }); }
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
  if (move.kind !== 'replay' && move.id !== 'surface' && move.kind !== 'dive') b.last[u.side] = { ...move };
  afterAct(b, u, events);
  settle(b, events);
  return events;
}
// safa geçen birimin süresi
function afterAct(b, u, events) {
  if (u.convert > 0 && u.alive) { u.convert--; if (!u.convert) { u.alive = false; u.out = 'persuaded'; events.push({ type: 'leave', to: u.uid }); } }
}

// rakip yapay zekâsı
export function aiChoose(b, u) {
  const ms = movesOf(u).filter(m => m.ready !== false);
  const f = validTargets(b, u, { kind: 'attack' });
  const al = allies(b, u);
  const weakAlly = al.filter(x => x.hp / x.maxHp < 0.45).sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0];
  const heal = ms.find(m => m.kind === 'heal');
  if (heal && weakAlly && (heal.ally || heal.team || weakAlly === u)) return { move: heal.id, target: weakAlly.uid };
  if (!f.length) { const m = ms.find(x => targetKind(x) !== 'foe') || ms[0]; return { move: m.id, target: targetKind(m) === 'ally' ? (weakAlly || al[0]).uid : null }; }
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
    // gördüyse doğru argüman; görmediyse söze güvenir (blöfe kanabilir) ya da tahmin eder
    const guess = seen ? t.stance : (Math.random() < 0.6 ? (Object.keys(STANCES).find(k => STANCES[k].tells.includes(t.tell)) || t.stance) : null);
    const smart = guess ? talkMs.find(m => m.arg === STANCES[guess].weak) : null;
    return { move: (smart || pickOne(talkMs)).id, target: t.uid };
  }
  const atk = ms.filter(m => m.kind === 'attack' || m.kind === 'dive');
  const util = ms.filter(m => m.kind !== 'attack' && m.kind !== 'talk' && m.kind !== 'heal');
  const m = (util.length && Math.random() < 0.25 ? pickOne(util) : pickOne(atk.length ? atk : ms));
  const tgt = f.sort((x, y) => (typeMult(u.type, y.type) - typeMult(u.type, x.type)) || (x.hp - y.hp))[0];
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
