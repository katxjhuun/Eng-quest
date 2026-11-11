// dam-la — savaş efektleri: her yeteneğin kendine özgü 2B animasyonu (düz çizim, 3B görünüm yok).
// Petler kaymaz: yalnızca yerinde gerilir/öne atılır; efektler kartların üstünde ya da aralarında uçan parçacıklardır.
import { TYPES } from '../pets/codex.js';

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
      if (ev.crit || ev.execute) { onCard(ev.to, 'star', { dur: 700 }); shake(1); }
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
    shake,
  };
}
