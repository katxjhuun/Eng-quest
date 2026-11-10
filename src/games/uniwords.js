// Uniwords: çemberdeki harflerle kelimeler kur, iç içe bulmacayı doldur.
// Zorluk: 6 harfle başlar, 7 ve 8 harfe çıkar; bulunacak kelime sayısı 5'ten 10'a artar; ipucu hakkı azalır.
import { lexicon, upper, letters, canMake } from './lexicon.js';
import { shuffle } from './hub.js';
import { layout } from './crossword.js';

export function mount(el, ctx) {
  let alive = true;
  el.innerHTML = '<div class="gm-loading">Bulmaca hazırlanıyor…</div>';
  lexicon(ctx.lang).then(lx => { if (alive) start(lx); });
  return () => { alive = false; };

  function start(lx) {
    const { d, rng, lang, esc } = ctx;
    const t = (d - 0.4) / 0.6;
    const L = d < 0.6 ? 6 : d < 0.85 ? 7 : 8;
    const want = 5 + Math.round(t * 5);
    const depth = Math.round(2500 + t * 4500);
    const known = lx.common.slice(0, depth).filter(w => { const n = letters(w).length; return n >= 3 && n <= L; });
    let base = null, subs = [];
    const bases = shuffle(known.filter(w => letters(w).length === L), rng);
    for (const b of bases.slice(0, 120)) {
      const bl = letters(b);
      const s = known.filter(w => w !== b && canMake(w, bl));
      if (s.length + 1 >= want) { base = b; subs = s; break; }
      if (!base || s.length > subs.length) { base = b; subs = s; }
    }
    // uzun kelimeler önce; bulmacaya sığanlar seçilir
    const pick = [base, ...shuffle(subs, rng).sort((a, b) => letters(b).length - letters(a).length).slice(0, want * 2)];
    let lay = layout(pick.slice(0, want + 3), rng, 11);
    if (lay.words.length > want) lay = layout(lay.words.slice(0, want).map(x => x.w), rng, 11);
    const puzzle = lay.words; ctx.dbg?.({ base, puzzle, lay });
    const found = new Set(), revealed = new Set(), bonus = new Set();
    let hints = Math.max(1, 4 - Math.floor(t * 3)), usedHints = 0;
    let wheel = shuffle(letters(base), rng), path = [];
    el.innerHTML = `<div class="uw"><div class="uw-board" id="uwBoard" style="--w:${lay.w};--h:${lay.h}"></div>
      <div class="uw-cur" id="uwCur">&nbsp;</div>
      <div class="uw-wheel" id="uwWheel"></div>
      <div class="uw-btns"><button class="gm-chip" id="uwShuf">🔀</button><button class="gm-chip on" id="uwGo">✓ Gönder</button><button class="gm-chip" id="uwDel">⌫</button><button class="gm-chip" id="uwHint">💡 <span id="uwHn"></span></button><span class="uw-bonus" id="uwBonus"></span></div></div>`;
    const key = (x, y) => `${x},${y}`;
    const openSet = () => { const o = new Set(revealed); for (const p of puzzle) if (found.has(p.w)) for (const [x, y] of p.cells) o.add(key(x, y)); return o; };
    const allDone = () => { const o = openSet(); return puzzle.every(p => found.has(p.w) || p.cells.every(([x, y]) => o.has(key(x, y)))); };
    function drawBoard() {
      const open = new Set(revealed); for (const p of puzzle) if (found.has(p.w)) for (const [x, y] of p.cells) open.add(key(x, y));
      let h = '';
      for (let y = 0; y < lay.h; y++) for (let x = 0; x < lay.w; x++) {
        const c = lay.cells.get(key(x, y));
        h += c ? `<div class="uw-c${open.has(key(x, y)) ? ' on' : ''}">${open.has(key(x, y)) ? esc(upper(c, lang)) : ''}</div>` : '<div class="uw-x"></div>';
      }
      el.querySelector('#uwBoard').innerHTML = h;
      el.querySelector('#uwHn').textContent = hints;
      el.querySelector('#uwBonus').textContent = bonus.size ? `+${bonus.size} bonus` : '';
    }
    function drawWheel() {
      const n = wheel.length, R = 38;
      el.querySelector('#uwWheel').innerHTML = wheel.map((c, i) => { const a = -Math.PI / 2 + i / n * Math.PI * 2; return `<button class="uw-l${path.includes(i) ? ' on' : ''}" data-i="${i}" style="left:${50 + Math.cos(a) * R}%;top:${50 + Math.sin(a) * R}%">${esc(upper(c, lang))}</button>`; }).join('');
      el.querySelector('#uwCur').textContent = path.length ? upper(path.map(i => wheel[i]).join(''), lang) : ' ';
    }
    function submit() {
      const w = path.map(i => wheel[i]).join(''); path = []; drawWheel();
      if (letters(w).length < 3) return;
      const p = puzzle.find(x => x.w === w);
      if (p) {
        if (found.has(w)) { ctx.toast('Bunu zaten buldun.'); return; }
        found.add(w); drawBoard();
        if (allDone()) {
          setTimeout(() => ctx.win(usedHints === 0 ? 3 : usedHints <= 1 ? 2 : 1, bonus.size ? `${bonus.size} bonus kelime de buldun.` : ''), 500);
        }
      } else if (lx.all.has(w)) { if (!bonus.has(w)) { bonus.add(w); ctx.toast(`Bonus kelime: ${upper(w, lang)}`); drawBoard(); } }
      else { const c = el.querySelector('#uwCur'); c.textContent = upper(w, lang); c.classList.add('no'); setTimeout(() => { c.classList.remove('no'); drawWheel(); }, 450); }
    }
    // dokun ya da sürükle
    const wheelEl = el.querySelector('#uwWheel'); let dragging = false, swiped = false;
    const at = e => { const b = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.uw-l'); return b ? +b.dataset.i : -1; };
    wheelEl.addEventListener('pointerdown', e => { const i = at(e); if (i < 0) return; dragging = true; swiped = false; wheelEl.setPointerCapture?.(e.pointerId); if (path.at(-1) === i) { path.pop(); } else if (!path.includes(i)) path.push(i); drawWheel(); });
    wheelEl.addEventListener('pointermove', e => { if (!dragging) return; const i = at(e); if (i >= 0 && !path.includes(i)) { path.push(i); swiped = true; drawWheel(); } else if (i >= 0 && path.length > 1 && path.at(-2) === i) { path.pop(); drawWheel(); } });
    wheelEl.addEventListener('pointerup', () => { if (!dragging) return; dragging = false; if (swiped && path.length >= 3) submit(); });
    wheelEl.addEventListener('pointercancel', () => { dragging = false; });
    el.querySelector('#uwCur').addEventListener('click', () => { if (path.length >= 3) submit(); else { path = []; drawWheel(); } });
    el.querySelector('#uwGo').addEventListener('click', () => { if (path.length >= 3) submit(); });
    el.querySelector('#uwDel').addEventListener('click', () => { path.pop(); drawWheel(); });
    el.querySelector('#uwShuf').addEventListener('click', () => { wheel = shuffle(wheel, Math.random); path = []; drawWheel(); });
    el.querySelector('#uwHint').addEventListener('click', () => {
      if (hints <= 0) { ctx.toast('İpucu hakkın kalmadı.'); return; }
      const open = new Set(revealed); for (const p of puzzle) if (found.has(p.w)) for (const [x, y] of p.cells) open.add(key(x, y));
      const target = puzzle.filter(p => !found.has(p.w)).flatMap(p => p.cells).filter(([x, y]) => !open.has(key(x, y)));
      if (!target.length) return;
      const [x, y] = target[Math.floor(Math.random() * target.length)];
      revealed.add(key(x, y)); hints--; usedHints++; drawBoard();
      if (allDone()) setTimeout(() => ctx.win(1), 500);
    });
    drawBoard(); drawWheel();
  }
}
