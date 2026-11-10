// Trace: her bölüm TEK bir tarihî olay sorar. Zaman çizgisinde yılı belli olaylar (çapalar) durur;
// ilk ve son blok her zaman doludur. Oyuncu olayın hangi iki olay arasına girdiğini seçer (dokunarak ya da sürükleyerek).
// Bölümler olay listesinden sırayla gelir: her olay bir kez sorulur (1180 olay → 1000 bölümün hepsi farklı olay).
// Zorluk: çapa sayısı 4 → 7 artar; çapalar hedef olaya yıl olarak giderek yaklaşır.
import { EVENTS, yearText, TIERS } from './data/events.js';
import { shuffle, rngFor } from './hub.js';
import { burstAt, replay, wait } from './fx.js';

// bölüm → olay: önce en bilinen olaylar (1. katman), sonra 2. ve 3. katman; her katman kendi içinde karışık
let ORDER = null;
function order() {
  if (ORDER) return ORDER;
  const r = rngFor('trace-order', 1);
  ORDER = [];
  let start = 0;
  for (const n of TIERS) { ORDER.push(...shuffle([...Array(n).keys()].map(i => i + start), r)); start += n; }
  if (start < EVENTS.length) ORDER.push(...shuffle([...Array(EVENTS.length - start).keys()].map(i => i + start), r));
  return ORDER;
}

export function mount(el, ctx) {
  const { d, rng, esc, level } = ctx;
  const t = (d - 0.4) / 0.6;
  const target = EVENTS[order()[(level - 1) % EVENTS.length]];
  const sorted = EVENTS.slice().sort((a, b) => a.y - b.y);
  const k = 4 + Math.round(t * 3);                                  // 4 → 7 çapa (3 → 6 aralık)
  const radius = Math.max(5, Math.round(70 - Math.pow(t, 0.8) * 64)); // çapalar hedefin ±radius olay yakınından seçilir
  const ti = sorted.indexOf(target);
  const pool = sorted.slice(Math.max(0, ti - radius), ti + radius + 1).filter(e => e !== target && e.y !== target.y);
  const before = shuffle(pool.filter(e => e.y < target.y), rng), after = shuffle(pool.filter(e => e.y > target.y), rng);
  const anchors = [];
  const usedY = new Set();
  const take = e => { if (!e || usedY.has(e.y)) return false; usedY.add(e.y); anchors.push(e); return true; };
  // en az bir önce ve bir sonra (ilk ve son blok dolu, olay ikisinin arasında)
  for (const e of before) if (take(e)) break;
  for (const e of after) if (take(e)) break;
  for (const e of shuffle([...before, ...after], rng)) { if (anchors.length >= k) break; take(e); }
  anchors.sort((a, b) => a.y - b.y);
  const answer = anchors.filter(a => a.y < target.y).length;        // doğru aralık: 0..anchors.length
  const gaps = anchors.length + 1;
  const tries = anchors.length >= 6 ? 2 : 1;
  let miss = 0, over = false;
  ctx.dbg?.({ target, anchors, answer });

  const row = a => `<li class="tr-row"><span class="tr-year">${yearText(a.y)}</span><span class="tr-txt">${esc(a.t)}</span></li>`;
  const gap = i => `<li class="tr-gap${i === 0 || i === gaps - 1 ? ' edge' : ''}" data-g="${i}"><span>Buraya</span></li>`;
  el.innerHTML = `<div class="tr">
    <div class="tr-card" id="trCard"><span class="tr-q">?</span><b>${esc(target.t)}</b><small>Zaman çizgisinde nereye girer? Aralığa dokun ya da kartı sürükle.</small></div>
    <div class="tr-info"><span>${tries > 1 ? `${tries} hakkın var` : 'Tek hakkın var'}</span><span>${anchors.length} olay · ${yearText(anchors[0].y)} – ${yearText(anchors.at(-1).y)}</span></div>
    <ol class="tr-line" id="trLine">${[...anchors, null].map((a, i) => ((i > 0 && i < anchors.length) || i === answer ? gap(i) : '') + (a ? row(a) : '')).join('')}</ol></div>`;
  // ilk ve son blok dolu: olay en eskiden önce ya da en yeniden sonra olamaz → uçlardaki aralıklar gösterilmez
  const line = el.querySelector('#trLine'), card = el.querySelector('#trCard');
  line.querySelectorAll('.tr-row').forEach((r, i) => { r.style.setProperty('--i', i); r.classList.add('in'); });

  async function choose(g) {
    if (over) return;
    const gEl = line.querySelector(`[data-g="${g}"]`); if (!gEl) return;
    if (g === answer) {
      over = true;
      gEl.classList.add('ok');
      gEl.innerHTML = `<span class="tr-year count">${yearText(target.y)}</span><span class="tr-txt">${esc(target.t)}</span>`;
      card.classList.add('flyin');
      countUp(gEl.querySelector('.count'), anchors[g - 1]?.y ?? target.y - 50, target.y);
      await wait(380); burstAt(gEl, { n: 16, spread: 110, colors: ['#6fb36a', '#F2CF72', '#4f3bd4', '#E99A8A'] });
      line.querySelectorAll('.tr-gap').forEach(x => { if (x !== gEl) x.classList.add('fade'); });
      setTimeout(() => ctx.win(miss === 0 ? 3 : 2, `${target.t}: ${yearText(target.y)}`), 1100);
      return;
    }
    miss++;
    replay(card, 'no', 450); replay(gEl, 'bad', 700);
    const hint = g < answer ? '⬇ Daha yeni' : '⬆ Daha eski';
    gEl.querySelector('span').textContent = hint;
    gEl.classList.add('tried');
    if (miss >= tries) {
      over = true;
      await wait(700);
      const right = line.querySelector(`[data-g="${answer}"]`);
      right.classList.add('reveal');
      right.innerHTML = `<span class="tr-year">${yearText(target.y)}</span><span class="tr-txt">${esc(target.t)}</span>`;
      right.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
      setTimeout(() => ctx.lose(`${target.t}: ${yearText(target.y)}`), 1500);
    } else {
      el.querySelector('.tr-info span').textContent = `${tries - miss} hakkın kaldı`;
    }
  }
  function countUp(node, from, to) {
    const t0 = performance.now(), dur = 650;
    const step = now => { const k2 = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k2, 3); node.textContent = yearText(Math.round(from + (to - from) * e)); if (k2 < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  line.addEventListener('click', e => { const g = e.target.closest('.tr-gap'); if (g && !g.classList.contains('tried')) choose(+g.dataset.g); });
  // sürükle-bırak
  let drag = null;
  card.addEventListener('pointerdown', e => {
    if (over) return;
    const r = card.getBoundingClientRect();
    drag = { id: e.pointerId, dx: e.clientX - r.left, dy: e.clientY - r.top, ghost: null, sx: e.clientX, sy: e.clientY };
    card.setPointerCapture?.(e.pointerId);
  });
  card.addEventListener('pointermove', e => {
    if (!drag) return;
    if (!drag.ghost) {
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 8) return;
      const r = card.getBoundingClientRect();
      drag.ghost = card.cloneNode(true); drag.ghost.classList.add('tr-ghost'); drag.ghost.style.width = r.width + 'px';
      document.body.appendChild(drag.ghost); card.classList.add('lifted');
    }
    drag.ghost.style.left = e.clientX - drag.dx + 'px'; drag.ghost.style.top = e.clientY - drag.dy + 'px';
    const over2 = document.elementsFromPoint(e.clientX, e.clientY).find(n => n.classList?.contains('tr-gap'));
    line.querySelectorAll('.tr-gap').forEach(x => x.classList.toggle('hover', x === over2 && !x.classList.contains('tried')));
    // kenara yaklaşınca kaydır
    const body = el.closest('.gm-body'); if (body) { const br = body.getBoundingClientRect(); if (e.clientY > br.bottom - 50) body.scrollTop += 8; else if (e.clientY < br.top + 50) body.scrollTop -= 8; }
  });
  const end = e => {
    if (!drag) return;
    const g = drag.ghost; drag = null; card.classList.remove('lifted');
    const hov = line.querySelector('.tr-gap.hover'); line.querySelectorAll('.tr-gap.hover').forEach(x => x.classList.remove('hover'));
    if (g) { g.remove(); if (hov && e.type === 'pointerup') choose(+hov.dataset.g); }
  };
  card.addEventListener('pointerup', end); card.addEventListener('pointercancel', end);
  return () => { over = true; document.querySelectorAll('.tr-ghost').forEach(x => x.remove()); };
}
