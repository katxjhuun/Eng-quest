// Trace: tarihî olay kartlarını en eskiden en yeniye doğru sırayla seç. 3 hata hakkı.
// Zorluk: kart sayısı 4 → 8; olaylar arasındaki yıl farkı giderek daralır (yakın tarihli olayları ayırt etmek zorlaşır).
import { EVENTS, yearText } from './data/events.js';
import { shuffle } from './hub.js';

export function mount(el, ctx) {
  const { d, rng, esc } = ctx;
  const t = (d - 0.4) / 0.6;
  const n = 4 + Math.round(t * 4);
  // zorlaştıkça olaylar daha dar bir dönemden seçilir: son bölümlerde kartlar neredeyse art arda gelen olaylardır
  const sorted = EVENTS.slice().sort((a, b) => a.y - b.y);
  let pick = [];
  for (let tries = 0; tries < 60 && pick.length < n; tries++) {
    const len = Math.min(sorted.length, Math.max(n * 2 + tries * 2, Math.round(sorted.length * Math.pow(1 - t, 2.2))));
    const start = Math.floor(rng() * (sorted.length - len + 1));
    const gap = Math.max(1, Math.round(90 * Math.pow(1 - t, 2)) - tries * 3);
    pick = [];
    for (const e of shuffle(sorted.slice(start, start + len), rng)) {
      if (pick.every(p => Math.abs(p.y - e.y) >= gap)) pick.push(e);
      if (pick.length === n) break;
    }
  }
  const order = pick.slice().sort((a, b) => a.y - b.y);
  const cards = shuffle(pick, rng); ctx.dbg?.({ order, cards });
  let placed = 0, miss = 0;
  const MAX = 3;
  el.innerHTML = `<div class="tr"><p class="tr-lead">Olayları <b>en eskiden en yeniye</b> doğru sırayla seç.</p><div class="tr-info"><span id="trMiss">Hata: 0 / ${MAX}</span><span>${n} olay</span></div>
    <ol class="tr-line" id="trLine">${order.map(() => '<li class="tr-slot"></li>').join('')}</ol>
    <div class="tr-cards" id="trCards">${cards.map((c, i) => `<button class="tr-card" data-i="${i}">${esc(c.t)}</button>`).join('')}</div></div>`;
  const line = el.querySelector('#trLine');
  el.querySelector('#trCards').addEventListener('click', e => {
    const b = e.target.closest('.tr-card'); if (!b || b.disabled) return;
    const c = cards[+b.dataset.i];
    if (c === order[placed] || c.y === order[placed].y) {
      const slot = line.children[placed];
      slot.innerHTML = `<b>${yearText(c.y)}</b> ${esc(c.t)}`; slot.classList.add('ok');
      b.disabled = true; b.classList.add('used'); placed++;
      if (placed === n) setTimeout(() => ctx.win(miss === 0 ? 3 : miss === 1 ? 2 : 1, 'Zaman çizgisi tamam.'), 500);
    } else {
      miss++; b.classList.add('no'); setTimeout(() => b.classList.remove('no'), 450);
      el.querySelector('#trMiss').textContent = `Hata: ${miss} / ${MAX}`;
      ctx.toast(`${c.t}: ${yearText(c.y)}`);
      if (miss >= MAX) {
        // doğru sırayı göster
        order.forEach((o, i) => { const s = line.children[i]; if (!s.classList.contains('ok')) { s.innerHTML = `<b>${yearText(o.y)}</b> ${esc(o.t)}`; s.classList.add('shown'); } });
        el.querySelectorAll('.tr-card').forEach(x => { x.disabled = true; });
        setTimeout(() => ctx.lose('Doğru sıra yukarıda.'), 1600);
      }
    }
  });
}
