// dam-la — savaş efektleri: her yeteneğin kendine özgü 2B animasyonu (düz çizim, 3B görünüm yok).
// Petler kaymaz: yalnızca yerinde gerilir/öne atılır; efektler kartların üstünde ya da aralarında uçan parçacıklardır.
import { TYPES, ELEMENT_FX } from '../pets/codex.js';

const wait = ms => new Promise(r => setTimeout(r, ms));

// hamle → efekt tarifi. cast: hamle başlarken, shot: kullanandan hedefe mermi, hit: hedefte iz, self: kullananın üstünde.
const RECIPE = {
  // tank
  bash: { hit: 'impact' },
  taunt: { self: 'shield' },
  endure: { self: 'aura gold' },
  // yakın dövüşçü
  strike: { hit: 'slash' },
  rage: { self: 'aura red', hit: 'slash big', shake: 2 },
  break: { hit: 'crack' },
  // nişancı
  shot: { shot: 'arrow', hit: 'pin' },
  volley: { rain: 'arrow', hit: 'pin' },
  aim: { self: 'cross' },
  // suikastçı
  shade: { blink: true, hit: 'slash dark' },
  finish: { blink: true, hit: 'xslash' },
  vanish: { self: 'smoke' },
  // destek
  mend: { shot: 'orb heal', heal: 'plus' },
  cheer: { shot: 'note', buff: 'up' },
  pulse: { self: 'ring heal', heal: 'plus' },
  // büyücü
  bolt: { shot: 'orb', hit: 'burst' },
  wave: { sweep: true, hit: 'burst' },
  hex: { shot: 'orb hex', hit: 'flames' },
  // imza hamleleri
  weed: { hit: 'vines' },
  peek: { self: 'waves' },
  skip: { hit: 'paws', self: 'smoke' },
  sniff: { shot: 'trail', hit: 'impact' },
  ward: { self: 'chess' },
  prey: { self: 'eyes' },
  dive: { self: 'splash' },
  surface: { self: 'splash', hit: 'splash', shake: 2 },
  replay: { self: 'knight' },
  mirror: { self: 'mirror' },
  // hilebaz
  read: { beam: 'eye' },
  confuse: { shot: 'spiral', hit: 'dizzy' },
};

export function createFx({ arena, layer, cardOf, reduced }) {
  const rectOf = uid => { const c = cardOf(uid); if (!c) return null; const a = c.querySelector('.bt-art') || c; const r = a.getBoundingClientRect(), box = arena.getBoundingClientRect(); return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2, w: r.width, h: r.height }; };
  const color = t => TYPES[t]?.color || '#b9a9f2';
  function spawn(cls, x, y, { dur = 700, html = '', vars = {} } = {}) {
    const e = document.createElement('i'); e.className = 'bx ' + cls; e.innerHTML = html;
    e.style.left = x + 'px'; e.style.top = y + 'px';
    for (const [k, v] of Object.entries(vars)) e.style.setProperty(k, v);
    layer.appendChild(e); setTimeout(() => e.remove(), dur);
    return e;
  }
  function onCard(uid, cls, opts = {}) { const r = rectOf(uid); if (!r) return null; return spawn(cls, r.x, r.y, { ...opts, vars: { '--w': r.w + 'px', '--h': r.h + 'px', ...(opts.vars || {}) } }); }
  async function projectile(from, to, cls, { dur = 320, tint } = {}) {
    const a = rectOf(from), b = rectOf(to); if (!a || !b || reduced) return;
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const e = spawn('shot ' + cls, a.x, a.y, { dur: dur + 50, vars: { '--ang': ang + 'rad', '--c': tint || '#f2cf72' } });
    e.animate([{ transform: `translate(-50%,-50%) rotate(${ang}rad) scale(.6)` }, { transform: `translate(calc(-50% + ${b.x - a.x}px), calc(-50% + ${b.y - a.y}px)) rotate(${ang}rad) scale(1)` }], { duration: dur, easing: 'cubic-bezier(.4,0,.7,1)', fill: 'forwards' });
    // iz parçacıkları
    for (let i = 1; i < 4; i++) setTimeout(() => { const k = i / 4; spawn('trailp', a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k, { dur: 380, vars: { '--c': tint || '#f2cf72' } }); }, dur * i / 4);
    await wait(dur);
  }
  function particles(uid, glyph, n, { cls = 'pt', spread = 46, up = 40, color: c } = {}) {
    const r = rectOf(uid); if (!r || reduced) return;
    for (let i = 0; i < n; i++) {
      const dx = (Math.random() - 0.5) * spread * 2, dy = -up - Math.random() * up;
      spawn(cls, r.x + (Math.random() - 0.5) * r.w * 0.5, r.y + r.h * 0.15, { dur: 900, html: glyph, vars: { '--dx': dx + 'px', '--dy': dy + 'px', '--d': (i * 60) + 'ms', '--c': c || '#fff' } });
    }
  }
  // bir satırın (takımın) kutusu
  function rowBox(side) { const row = arena.querySelector(side === 'A' ? '#btAlly' : '#btFoe'); if (!row) return null; const box = arena.getBoundingClientRect(), r = row.getBoundingClientRect(); return { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height }; }
  function flash(c = '#fff', o = 0.35) { if (reduced) return; spawn('flash', 0, 0, { dur: 420, vars: { '--c': c, '--o': o } }); }
  function shake(k = 1) { if (reduced) return; arena.classList.remove('shake1', 'shake2'); void arena.offsetWidth; arena.classList.add('shake' + Math.min(2, k)); setTimeout(() => arena.classList.remove('shake1', 'shake2'), 420); }

  return {
    // hamle başlarken (kullananın üstünde ya da hedefe doğru)
    async cast(ev, B) {
      const R = RECIPE[ev.id] || {};
      const u = B.units.find(x => x.uid === ev.from); if (!u) return;
      const tint = color(u.type);
      if (R.self) {
        const targets = ev.team ? B.units.filter(x => x.alive && x.side === u.side) : [u];
        for (const t of targets) onCard(t.uid, 'self ' + R.self, { dur: 1100, vars: { '--c': tint }, html: R.self === 'knight' ? '♞' : R.self === 'chess' ? '♟' : R.self === 'eyes' ? '<b></b><b></b>' : '' });
        await wait(reduced ? 80 : 420);
      }
      if (ev.kind === 'talk') {
        // sözcükler hedefe uçar
        const words = ev.id === 'close' ? ['!', '‼'] : ['…', '?', '!'];
        if (ev.id === 'close') { onCard(ev.to, 'spot', { dur: 1300 }); await wait(250); }
        for (let i = 0; i < 3; i++) { projectile(ev.from, ev.to, 'word', { dur: 420, tint: '#f4f0ff' }).then(() => {}); const w = layer.lastElementChild; if (w && w.classList.contains('word')) w.textContent = words[i % words.length]; await wait(110); }
        await wait(300);
        return;
      }
      if (R.beam && ev.to) {
        const a = rectOf(ev.from), b = rectOf(ev.to);
        if (a && b) { const len = Math.hypot(b.x - a.x, b.y - a.y), ang = Math.atan2(b.y - a.y, b.x - a.x); spawn('beam', a.x, a.y, { dur: 800, vars: { '--len': len + 'px', '--ang': ang + 'rad' } }); }
        onCard(ev.to, 'eye', { dur: 1100, html: '👁️' }); await wait(reduced ? 80 : 520);
        return;
      }
      if (R.blink) { cardOf(ev.from)?.classList.add('blink'); setTimeout(() => cardOf(ev.from)?.classList.remove('blink'), 520); }
      if (R.sweep) { const foeRow = u.side === 'A' ? '#btFoe' : '#btAlly'; const row = arena.querySelector(foeRow); if (row) { const box = arena.getBoundingClientRect(), r = row.getBoundingClientRect(); spawn('sweep', r.left - box.left, r.top - box.top + r.height / 2, { dur: 700, vars: { '--c': tint, '--w': r.width + 'px', '--h': r.height + 'px' } }); } await wait(reduced ? 60 : 380); }
      if (R.rain && !reduced) {
        const foes = B.units.filter(x => x.alive && x.side !== u.side);
        for (const f of foes) { const r = rectOf(f.uid); if (!r) continue; for (let i = 0; i < 4; i++) spawn('rain', r.x + (i - 1.5) * 14, r.y - r.h * 0.9, { dur: 520, vars: { '--d': i * 70 + 'ms', '--fall': r.h * 0.9 + 'px' } }); }
        await wait(380);
      }
      // tek hedefe mermi
      if (R.shot && ev.to && ev.to !== ev.from) {
        const kind = R.shot;
        await projectile(ev.from, ev.to, kind, { dur: kind.includes('hex') ? 460 : kind === 'arrow' ? 240 : kind === 'trail' ? 360 : 330, tint: kind.includes('heal') ? '#8be0a4' : kind === 'note' ? '#f2cf72' : kind.includes('hex') ? '#9b59d0' : tint });
      }
      if (!R.self && !R.shot && !R.rain && !R.sweep && !R.beam && ev.kind === 'attack' && ['ranger', 'magician'].includes(u.role)) await projectile(ev.from, ev.to || ev.from, u.role === 'ranger' ? 'arrow' : 'orb', { tint });
    },
    // hedefteki iz
    hit(ev, B) {
      const R = RECIPE[ev.id] || {};
      const u = B.units.find(x => x.uid === ev.from);
      const tint = color(u?.type);
      if (ev.miss) { onCard(ev.to, 'whoosh', { dur: 600 }); return; }
      let mark = R.hit || (ev.role === 'ranger' ? 'pin' : ev.role === 'magician' ? 'burst' : 'slash');
      if (ev.reflect) mark = 'shards';
      if (ev.counter) mark = 'slash';
      onCard(ev.to, 'hitm ' + mark, { dur: 700, vars: { '--c': tint }, html: mark === 'paws' ? '🐾' : mark === 'dizzy' ? '💫' : '' });
      if (ev.crit || ev.execute) { onCard(ev.to, 'star', { dur: 700 }); shake(1); flash('#fff', 0.28); }
      if (!reduced && ev.dmg) particles(ev.to, '', ev.crit ? 8 : 4, { cls: 'spark', color: ev.mult > 1 ? tint : '#fff', up: 20, spread: 50 });
      if (ev.mult > 1) onCard(ev.to, 'ring', { dur: 650, vars: { '--c': tint } });
      if (R.shake) shake(R.shake);
      if (mark === 'flames' || mark === 'burst') particles(ev.to, '', 6, { cls: 'ember', color: mark === 'flames' ? '#b46be0' : tint, up: 24 });
    },
    heal(uid) { onCard(uid, 'glow heal', { dur: 800 }); particles(uid, '+', 6, { cls: 'pt plus', color: '#8be0a4' }); },
    buff(uid, bad) { onCard(uid, 'glow ' + (bad ? 'bad' : 'buff'), { dur: 700 }); particles(uid, bad ? '▼' : '▲', 4, { cls: 'pt arrow', color: bad ? '#e5534b' : '#f2cf72', up: bad ? -20 : 36 }); },
    dot(uid) { particles(uid, '', 5, { cls: 'ember', color: '#f08a5d', up: 26 }); },
    talkResult(ev) {
      if (ev.rel === 'weak' || ev.rel === 'closing') { onCard(ev.to, 'bulb', { dur: 900, html: ev.rel === 'closing' ? '⚖️' : '💡' }); particles(ev.to, '♥', Math.min(5, 1 + (ev.rap | 0)), { cls: 'pt heart', color: '#f29bb6', up: 30 }); }
      else if (ev.rel === 'resist' || ev.rel === 'backfire') { onCard(ev.to, 'storm', { dur: 1000, html: '⛈️' }); }
      else onCard(ev.to, 'shrug', { dur: 800, html: '😐' });
      if (ev.chain) onCard(ev.to, 'tag chain', { dur: 1000, html: 'ZİNCİR!' });
      else if (ev.repeat) onCard(ev.to, 'tag rep', { dur: 900, html: 'tekrar…' });
    },
    retort(from, to) { if (from) projectile(from, to, 'zap', { dur: 260, tint: '#e5534b' }); },
    ko(uid) { onCard(uid, 'dust', { dur: 900 }); shake(1); },
    dove(uid) { onCard(uid, 'dove', { dur: 1400, html: '🕊️' }); },
    convert(uid) { particles(uid, '♥', 7, { cls: 'pt heart', color: '#f29bb6', up: 40 }); onCard(uid, 'glow convert', { dur: 1200 }); },
    // yönetici müdahalesi: yukarıdan inen şimşek ve işlem simgesi
    admin(uid, op) {
      const r = rectOf(uid); if (!r) return;
      spawn('bolt', r.x, 0, { dur: 700, vars: { '--h': r.y + 'px' } });
      onCard(uid, 'glow ' + (['hurt', 'weaken', 'confuse', 'will', 'ko'].includes(op) ? 'bad' : 'buff'), { dur: 900 });
      onCard(uid, 'adm', { dur: 1100, html: { heal: '💚', hurt: '⚡', shield: '🛡️', buff: '💪', weaken: '🔻', confuse: '💫', will: '💬', ko: '☠️', revive: '✨' }[op] || '⚡' });
      shake(op === 'ko' || op === 'hurt' ? 2 : 1);
    },
    shake, flash,
    // element etkisi: her elementin kendi çizgisi
    element(uid, el) {
      const r = rectOf(uid); if (!r) return;
      const c = TYPES[el]?.color || '#fff';
      onCard(uid, 'elm el-' + el, { dur: 1100, vars: { '--c': c }, html: el === 'tas' ? '<b>✦</b><b>✦</b><b>✦</b>' : el === 'ruh' ? '<b>👻</b>' : el === 'ruzgar' ? '<b></b><b></b><b></b>' : '' });
      if (reduced) return;
      if (el === 'ates') particles(uid, '', 9, { cls: 'ember', color: '#ff9a4d', up: 34, spread: 30 });
      if (el === 'su') for (let i = 0; i < 7; i++) spawn('drop', r.x + (Math.random() - 0.5) * r.w * 0.7, r.y - r.h * 0.4, { dur: 800, vars: { '--d': i * 55 + 'ms', '--fall': r.h * 0.75 + 'px' } });
      if (el === 'doga') particles(uid, '🍃', 4, { cls: 'pt leaf', up: 18, spread: 40 });
      if (el === 'ruzgar') particles(uid, '', 6, { cls: 'gust', color: '#dff3ef', up: 8, spread: 60 });
    },
    storm(uid) { onCard(uid, 'elm el-storm', { dur: 800 }); },
    revive(uid) {
      const r = rectOf(uid); if (!r) return;
      spawn('pillar', r.x, r.y, { dur: 1200, vars: { '--w': r.w + 'px', '--h': r.h * 2.2 + 'px' } });
      particles(uid, '✦', 8, { cls: 'pt', color: '#fff2b8', up: 50 });
      flash('#fff6d6', 0.3);
    },
    // ekranın ortasından geçen şerit
    async banner(title, sub, c = '#f2cf72', art = '') {
      const e = spawn('banner', 0, 0, { dur: reduced ? 900 : 1500, vars: { '--c': c }, html: `${art ? `<span class="bn-art">${art}</span>` : ''}<span class="bn-t"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span>` });
      await wait(reduced ? 500 : 1150);
      return e;
    },
    // savaş açılışı: iki takım "VS" ile yüzleşir
    async intro(B) {
      if (reduced) return;
      spawn('vs', 0, 0, { dur: 1100, html: '<b>VS</b>' });
      arena.querySelectorAll('.bt-card').forEach((c, i) => c.animate([{ opacity: 0, transform: `translateY(${c.closest('.foe') ? -24 : 24}px) scale(.9)` }, { opacity: 1, transform: 'none' }], { duration: 480, delay: i * 70, easing: 'cubic-bezier(.2,1.3,.4,1)', fill: 'backwards' }));
      await wait(800);
    },
    // süper yetenek sinematiği
    async ult(ev, B, art) {
      const u = B.units.find(x => x.uid === ev.from); if (!u) return;
      const c = color(u.type);
      const card = cardOf(ev.from);
      arena.classList.add('ulting');
      card?.classList.add('ulting');
      await this.banner(`🌟 ${ev.move}`, 'SÜPER YETENEK', c, art);
      const side = u.side === 'A' ? 'B' : 'A';
      const foeRow = rowBox(side), myRow = rowBox(u.side);
      const foes = B.units.filter(x => x.alive && x.side !== u.side), mine = B.units.filter(x => x.alive && x.side === u.side);
      if (!reduced) {
        if (ev.ult === 'quake' && foeRow) {
          spawn('quake', foeRow.x, foeRow.y + foeRow.h * 0.8, { dur: 900, vars: { '--w': foeRow.w + 'px', '--c': c } });
          for (const f of foes) { const r = rectOf(f.uid); if (r) for (let i = 0; i < 5; i++) spawn('rock', r.x + (Math.random() - 0.5) * r.w, r.y + r.h * 0.4, { dur: 800, vars: { '--dx': (Math.random() - 0.5) * 60 + 'px', '--dy': -40 - Math.random() * 50 + 'px', '--d': i * 40 + 'ms' } }); }
          shake(2); await wait(520);
        } else if (ev.ult === 'star' && foeRow) {
          for (let i = 0; i < 16; i++) spawn('star-fall', foeRow.x + Math.random() * foeRow.w, foeRow.y - 30, { dur: 900, vars: { '--d': i * 40 + 'ms', '--fall': foeRow.h * 0.75 + 30 + 'px', '--c': c } });
          await wait(620);
        } else if (ev.ult === 'dance') {
          card?.classList.add('blink');
          for (const f of foes) onCard(f.uid, 'elm el-dance', { dur: 900 });
          await wait(380); card?.classList.remove('blink');
        } else if (ev.ult === 'fortress' && myRow) {
          spawn('dome', myRow.x + myRow.w / 2, myRow.y + myRow.h / 2, { dur: 1300, vars: { '--w': myRow.w * 1.05 + 'px', '--h': myRow.h * 1.15 + 'px' } });
          await wait(520);
        } else if (ev.ult === 'rebirth' && myRow) {
          for (const m of mine) { const r = rectOf(m.uid); if (r) spawn('pillar', r.x, r.y, { dur: 1100, vars: { '--w': r.w + 'px', '--h': r.h * 2.2 + 'px' } }); }
          flash('#fff6d6', 0.35); await wait(520);
        } else if (ev.ult === 'storm' && foeRow) {
          spawn('vortex', foeRow.x + foeRow.w / 2, foeRow.y + foeRow.h / 2, { dur: 1200, vars: { '--c': c, '--w': foeRow.w + 'px', '--h': foeRow.h + 'px' }, html: Array.from({ length: 8 }, (_, i) => `<b style="--i:${i}">${TYPES[u.type]?.icon || '✦'}</b>`).join('') });
          await wait(700);
        } else if (ev.ult === 'speech') {
          onCard(ev.from, 'spot', { dur: 1300 });
          for (const f of foes) for (let i = 0; i < 2; i++) { projectile(ev.from, f.uid, 'word', { dur: 480, tint: '#f4f0ff' }); const w = layer.lastElementChild; if (w && w.classList.contains('word')) w.textContent = ['♥', '!', '…'][i]; }
          await wait(560);
        }
        flash(c, 0.25);
      }
      arena.classList.remove('ulting'); card?.classList.remove('ulting');
    },
  };
}
