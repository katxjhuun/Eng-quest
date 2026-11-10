// Cross Up: bota karşı sırayla oynanan iç içe bulmaca.
// Her tur eline rastgele harfler gelir; bir harf seçip boş kareye koyarsın. Doğru harf = 1 puan,
// bir kelimeyi tamamlamak = kelime uzunluğu kadar ek puan. Turda en fazla 3 harf koyabilirsin; yanlış harf turu bitirir.
// "Kelimeyi bil" ile bir kelimenin tamamını tahmin edebilirsin. Bulmaca dolunca puanı yüksek olan kazanır.
// Zorluk: kelime sayısı 6 → 10, başta açık harf azalır, botun isabeti %50 → %85 olur.
import { lexicon, upper, lower, letters, ALPHABET } from './lexicon.js';
import { shuffle } from './hub.js';
import { layout } from './crossword.js';
const wait = ms => new Promise(r => setTimeout(r, ms));

export function mount(el, ctx) {
  let alive = true;
  el.innerHTML = '<div class="gm-loading">Bulmaca hazırlanıyor…</div>';
  lexicon(ctx.lang).then(lx => { if (alive) start(lx); });
  return () => { alive = false; };

  function start(lx) {
    const { d, rng, lang, esc } = ctx;
    const t = (d - 0.4) / 0.6;
    const want = 6 + Math.round(t * 4);
    const botAcc = 0.42 + t * 0.4;
    // temalardan kelime havuzu: her kelimenin ipucu kendi temasıdır
    const themed = [];
    for (const g of shuffle(lx.groups.filter(g => g.d <= (t < 0.4 ? 1 : t < 0.75 ? 2 : 3)), rng)) for (const w of g.words) { const x = lower(w, lang); if (lx.re.test(x) && letters(x).length >= 3 && letters(x).length <= 8 && !themed.some(e => e.w === x)) themed.push({ w: x, clue: g.name }); }
    let best = null;
    for (let k = 0; k < 6; k++) {
      const seen = new Set(); const cand = shuffle(themed, rng).filter(c => !seen.has(c.clue) && seen.add(c.clue)).slice(0, want + 8);
      const lay = layout(cand.map(c => c.w), rng, 12);
      if (!best || lay.words.length > best.words.length) best = lay;
      if (lay.words.length >= want) break;
    }
    const lay = best; lay.words = lay.words.slice(0, Math.max(want, 4));
    // kesişmeyen fazlalıkları atmak için yeniden kur
    const lay2 = layout(lay.words.map(w => w.w), rng, 12);
    const words = lay2.words.map(p => ({ ...p, clue: themed.find(c => c.w === p.w)?.clue || '' }));
    const key = (x, y) => `${x},${y}`;
    const sol = new Map(); for (const p of words) p.cells.forEach(([x, y], i) => sol.set(key(x, y), letters(p.w)[i]));
    ctx.dbg?.({ words, sol }); const owner = new Map(); // dolu kare → 'me' | 'bot' | 'start'
    const preOpen = Math.max(0, Math.round((1 - t) * 1.2 * words.length * 0.6));
    for (const [x, y] of shuffle(words.flatMap(p => [p.cells[Math.floor(rng() * p.cells.length)]]), rng).slice(0, preOpen)) owner.set(key(x, y), 'start');
    let me = 0, bot = 0, turn = 'me', placedThisTurn = 0, handMe = [], handBot = [], selHand = -1, selWord = -1, over = false;
    const alpha = letters(ALPHABET[lang]);
    function draw5(hand) {
      const need = [...sol].filter(([k]) => !owner.has(k)).map(([, v]) => v);
      while (hand.length < 5) hand.push(need.length && Math.random() < 0.72 ? need[Math.floor(Math.random() * need.length)] : alpha[Math.floor(Math.random() * alpha.length)]);
      return hand;
    }
    const wordDone = p => p.cells.every(([x, y]) => owner.has(key(x, y)));
    el.innerHTML = `<div class="cu"><div class="cu-score"><div class="me"><small>Sen</small><b id="cuMe">0</b></div><div class="cu-turn" id="cuTurn"></div><div class="bot"><small>Bot</small><b id="cuBot">0</b></div></div>
      <div class="uw-board cu-board" id="cuBoard" style="--w:${lay2.w};--h:${lay2.h}"></div>
      <div class="cu-clues" id="cuClues"></div>
      <div class="cu-hand" id="cuHand"></div>
      <div class="cu-btns"><button class="secondarybtn" id="cuPass">Turu bitir</button><button class="secondarybtn" id="cuGuess" disabled>Kelimeyi bil</button></div></div>`;
    function render() {
      let h = '';
      for (let y = 0; y < lay2.h; y++) for (let x = 0; x < lay2.w; x++) {
        const k = key(x, y), c = sol.get(k);
        if (!c) { h += '<div class="uw-x"></div>'; continue; }
        const o = owner.get(k), inSel = selWord >= 0 && words[selWord].cells.some(([a, b]) => a === x && b === y);
        h += `<button class="uw-c cu-c${o ? ' on ' + o : ''}${inSel ? ' sel' : ''}" data-k="${k}">${o ? esc(upper(c, lang)) : ''}</button>`;
      }
      el.querySelector('#cuBoard').innerHTML = h;
      el.querySelector('#cuClues').innerHTML = words.map((p, i) => `<button class="cu-clue${wordDone(p) ? ' done' : ''}${i === selWord ? ' sel' : ''}" data-w="${i}">${esc(p.clue)} <i>(${letters(p.w).length})</i></button>`).join('');
      el.querySelector('#cuHand').innerHTML = handMe.map((c, i) => `<button class="cu-h${i === selHand ? ' on' : ''}" data-h="${i}" ${turn !== 'me' ? 'disabled' : ''}>${esc(upper(c, lang))}</button>`).join('');
      el.querySelector('#cuMe').textContent = me; el.querySelector('#cuBot').textContent = bot;
      el.querySelector('#cuTurn').textContent = over ? 'Bitti' : turn === 'me' ? `Senin turun · ${3 - placedThisTurn} hamle` : 'Bot düşünüyor…';
      const gb = el.querySelector('#cuGuess'); if (gb) gb.disabled = turn !== 'me' || selWord < 0 || wordDone(words[selWord]);
      const pb = el.querySelector('#cuPass'); if (pb) pb.disabled = turn !== 'me';
    }
    function place(k, ch, who) {
      if (owner.has(k) || sol.get(k) !== ch) return false;
      owner.set(k, who);
      let pts = 1;
      for (const p of words) if (p.cells.some(([x, y]) => key(x, y) === k) && wordDone(p)) pts += letters(p.w).length;
      if (who === 'me') me += pts; else bot += pts;
      if (pts > 1) ctx.toast(`${who === 'me' ? 'Sen' : 'Bot'} bir kelimeyi tamamladı: ${upper(words.find(p => p.cells.some(([x, y]) => key(x, y) === k) && wordDone(p)).w, lang)}`);
      return true;
    }
    function solveWord(i, who) {
      const p = words[i]; let pts = 0;
      p.cells.forEach(([x, y], j) => { const k = key(x, y); if (!owner.has(k)) { owner.set(k, who); pts++; } });
      pts += letters(p.w).length;
      if (who === 'me') me += pts; else bot += pts;
    }
    const full = () => [...sol.keys()].every(k => owner.has(k));
    function endCheck() {
      if (!full()) return false;
      over = true; render();
      setTimeout(() => (me >= bot ? ctx.win(me > bot * 1.5 ? 3 : me > bot ? 2 : 1, `Sen ${me} – Bot ${bot}`) : ctx.lose(`Sen ${me} – Bot ${bot}. Bot kazandı.`)), 600);
      return true;
    }
    async function botTurn() {
      if (!alive || over) return; turn = 'bot'; selHand = -1; render();
      draw5(handBot);
      await wait(700); if (!alive) return;
      // neredeyse bitmiş kelimeyi bilme denemesi
      const near = words.map((p, i) => ({ p, i, miss: p.cells.filter(([x, y]) => !owner.has(key(x, y))).length })).filter(o => o.miss > 0 && o.miss <= 1);
      if (near.length && Math.random() < botAcc * 0.35) { const o = near[0]; solveWord(o.i, 'bot'); ctx.toast(`Bot kelimeyi bildi: ${upper(o.p.w, lang)}`); render(); await wait(700); if (endCheck()) return; return myTurn(); }
      for (let n = 0; n < 3 && !over; n++) {
        const options = [];
        handBot.forEach((c, hi) => { for (const [k, v] of sol) if (!owner.has(k) && v === c) options.push({ hi, k }); });
        if (!options.length) break;
        const o = options[Math.floor(Math.random() * options.length)];
        if (Math.random() < botAcc) { place(o.k, handBot[o.hi], 'bot'); handBot.splice(o.hi, 1); render(); flash(o.k); await wait(650); if (!alive) return; if (endCheck()) return; }
        else { handBot.splice(o.hi, 1); ctx.toast('Bot yanlış harf koydu.'); await wait(500); if (!alive) return; break; }
      }
      myTurn();
    }
    function myTurn() { if (over || !alive) return; turn = 'me'; placedThisTurn = 0; draw5(handMe); render(); }
    function flash(k) { const c = el.querySelector(`[data-k="${k}"]`); c?.classList.add('pop'); }
    el.addEventListener('click', e => {
      if (over || turn !== 'me') return;
      const h = e.target.closest('[data-h]'); if (h) { selHand = +h.dataset.h === selHand ? -1 : +h.dataset.h; render(); return; }
      const w = e.target.closest('[data-w]'); if (w) { selWord = +w.dataset.w === selWord ? -1 : +w.dataset.w; render(); return; }
      const c = e.target.closest('[data-k]');
      if (c) {
        const k = c.dataset.k;
        const wi = words.findIndex(p => p.cells.some(([x, y]) => key(x, y) === k)); if (selHand < 0) { selWord = wi; render(); return; }
        if (owner.has(k)) return;
        const ch = handMe[selHand];
        handMe.splice(selHand, 1); selHand = -1;
        if (place(k, ch, 'me')) { placedThisTurn++; render(); flash(k); if (endCheck()) return; if (placedThisTurn >= 3 || !handMe.length) { turn = 'bot'; setTimeout(botTurn, 500); } }
        else { c.classList.add('no'); ctx.toast('Yanlış harf, sıra bota geçti.'); turn = 'bot'; setTimeout(botTurn, 600); }
        return;
      }
      if (e.target.closest('#cuPass')) botTurn();
      if (e.target.closest('#cuGuess') && selWord >= 0) {
        const p = words[selWord];
        el.querySelector('.cu-btns').innerHTML = `<input id="cuIn" maxlength="${letters(p.w).length}" placeholder="${esc(p.clue)} · ${letters(p.w).length} harf" autocomplete="off"><button class="primarybtn" id="cuOk">Tamam</button>`;
        el.querySelector('#cuIn').focus();
        return;
      }
      if (e.target.closest('#cuOk') && selWord >= 0) {
        const p = words[selWord], g = el.querySelector('#cuIn').value;
        el.querySelector('.cu-btns').innerHTML = '<button class="secondarybtn" id="cuPass">Turu bitir</button><button class="secondarybtn" id="cuGuess" disabled>Kelimeyi bil</button>';
        if (lower(g.trim(), lang) === p.w) { solveWord(selWord, 'me'); ctx.toast('Doğru!'); render(); if (!endCheck()) { turn = 'bot'; setTimeout(botTurn, 600); } }
        else { ctx.toast('Yanlış tahmin, sıra bota geçti.'); turn = 'bot'; setTimeout(botTurn, 500); }
      }
    });
    myTurn();
  }
}
