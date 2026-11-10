// Wordle: gizli kelimeyi 6 denemede bul. Yeşil = doğru yer, sarı = kelimede var, gri = yok.
// Zorluk: 5 harfle başlar; ilerledikçe 6 ve 7 harfli kelimeler, daha az bilinen kelimeler gelir; en zor bölümlerde 5 deneme.
import { lexicon, lower, upper, letters, ALPHABET } from './lexicon.js';
import { shuffle } from './hub.js';

export function mount(el, ctx) {
  let alive = true, onKey = () => {};
  el.innerHTML = '<div class="gm-loading">Kelimeler hazırlanıyor…</div>';
  lexicon(ctx.lang).then(lx => { if (alive) start(lx); });
  return () => { alive = false; document.removeEventListener('keydown', onKey); };

  function start(lx) {
    const { d, rng, lang } = ctx;
    const len = d < 0.68 ? 5 : d < 0.88 ? 6 : 7;
    const tries = d < 0.92 ? 6 : 5;
    // cevap: yaygınlık sırasındaki kelimelerden; bölüm ilerledikçe daha az bilinen kelimelere inilir
    const commonL = lx.common.filter(w => letters(w).length === len);
    const t = (d - 0.4) / 0.6;
    const depth = Math.max(60, Math.min(commonL.length, Math.round(250 + t * 2200)));
    const pool = commonL.slice(0, depth);
    const answer = pool[Math.floor(rng() * pool.length)];
    const A = letters(answer); ctx.dbg?.({ answer });
    const rows = []; let cur = []; let done = false;
    const state = {}; // harf → durum
    const kb = lang === 'tr' ? ['ertyuıopğü', 'asdfghjklşi', 'zcvbnmöç'] : ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
    el.innerHTML = `<div class="wd"><div class="wd-grid" id="wdGrid" style="--len:${len}"></div><div class="wd-kb" id="wdKb">${kb.map((r, i) => `<div class="wd-row">${i === 2 ? '<button data-k="enter" class="wide">↵</button>' : ''}${letters(r).map(c => `<button data-k="${c}">${upper(c, lang)}</button>`).join('')}${i === 2 ? '<button data-k="back" class="wide">⌫</button>' : ''}</div>`).join('')}</div></div>`;
    const grid = el.querySelector('#wdGrid');
    function score(g) {
      const res = Array(len).fill('no'), left = {};
      A.forEach((c, i) => { if (g[i] === c) res[i] = 'ok'; else left[c] = (left[c] || 0) + 1; });
      g.forEach((c, i) => { if (res[i] !== 'ok' && left[c]) { res[i] = 'in'; left[c]--; } });
      return res;
    }
    function draw(shake = false, flip = false) {
      let h = '';
      for (let r = 0; r < tries; r++) {
        const row = rows[r], g = row ? row.g : r === rows.length ? cur : [];
        h += `<div class="wd-r${shake && r === rows.length ? ' shake' : ''}${flip && r === rows.length - 1 ? ' flip' : ''}">${Array.from({ length: len }, (_, i) => { const c = g[i] || ''; const s = row ? row.s[i] : ''; return `<div class="wd-c ${s}${c && !row ? ' typed' : ''}" style="${row ? `--i:${i}` : ''}">${c ? upper(c, lang) : ''}</div>`; }).join('')}</div>`;
      }
      grid.innerHTML = h;
      el.querySelectorAll('#wdKb [data-k]').forEach(b => { const s = state[b.dataset.k]; b.className = `${b.classList.contains('wide') ? 'wide ' : ''}${s || ''}`; });
    }
    function submit() {
      if (cur.length !== len) { draw(true); ctx.toast(`${len} harf gerekli.`); return; }
      const w = cur.join('');
      if (!lx.all.has(w)) { draw(true); ctx.toast('Bu kelime listede yok.'); return; }
      const s = score(cur); rows.push({ g: cur, s });
      cur.forEach((c, i) => { const v = s[i], old = state[c]; if (v === 'ok' || (v === 'in' && old !== 'ok') || (!old)) state[c] = v; });
      cur = []; draw(false, true);
      if (w === answer) { done = true; const n = rows.length; setTimeout(() => ctx.win(n <= 3 ? 3 : n <= 5 ? 2 : 1, `${n}. denemede buldun: ${upper(answer, lang)}`), 1300); }
      else if (rows.length >= tries) { done = true; setTimeout(() => ctx.lose(`Kelime: ${upper(answer, lang)}`), 1300); }
    }
    function press(k) {
      if (done) return;
      if (k === 'enter') submit();
      else if (k === 'back') { cur.pop(); draw(); }
      else if (cur.length < len && ALPHABET[lang].includes(k)) { cur.push(k); draw(); }
    }
    el.querySelector('#wdKb').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) press(b.dataset.k); });
    onKey = e => { if (e.ctrlKey || e.metaKey) return; if (e.key === 'Enter') press('enter'); else if (e.key === 'Backspace') press('back'); else if (letters(e.key).length === 1) press(lower(e.key, lang)); };
    document.addEventListener('keydown', onKey);
    draw();
  }
}
