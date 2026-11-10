// Stack: karışık kelimeleri gizli ortak temalarına göre dörtlü gruplara ayır. 4 hata hakkı.
// Zorluk: 16 kelime / 4 grup ile başlar; 20/5 ve 24/6'ya çıkar; ileri bölümlerde dar kategoriler ve kelime oyunu grupları gelir.
import { lexicon, upper } from './lexicon.js';
import { shuffle } from './hub.js';
import { flip, burstAt, floatText, replay, wait } from './fx.js';
const COLORS = ['#F2CF72', '#8BC77E', '#7FA7D9', '#B596D9', '#E99A8A', '#79C8C0'];

export function mount(el, ctx) {
  let alive = true;
  el.innerHTML = '<div class="gm-loading">Hazırlanıyor…</div>';
  lexicon(ctx.lang).then(lx => { if (alive) start(lx); });
  return () => { alive = false; };

  function start(lx) {
    const { d, rng, lang, esc } = ctx;
    const G = d < 0.6 ? 4 : d < 0.85 ? 5 : 6;
    const tierW = d < 0.55 ? [1, 1, 1, 2] : d < 0.75 ? [1, 2, 2, 3] : [2, 2, 3, 3];
    const chosen = [];
    for (let guard = 0; chosen.length < G && guard < 500; guard++) {
      const tier = tierW[Math.floor(rng() * tierW.length)];
      const cands = lx.groups.filter(g => g.d === tier && !chosen.some(c => c.g === g));
      if (!cands.length) continue;
      const g = cands[Math.floor(rng() * cands.length)];
      const taken = new Set(chosen.flatMap(c => c.words));
      // diğer seçili temalarda da geçen kelimeleri kullanma (tek doğru çözüm olsun)
      const others = new Set(chosen.flatMap(c => c.g.words));
      const usable = g.words.filter(w => !taken.has(w) && !others.has(w) && !chosen.some(c => c.g.words.includes(w)));
      if (usable.length < 4) continue;
      // yeni tema eskilerin kelimelerini içermemeli
      if (chosen.some(c => c.words.some(w => g.words.includes(w)))) continue;
      chosen.push({ g, words: shuffle(usable, rng).slice(0, 4) });
    }
    let tiles = shuffle(chosen.flatMap((c, gi) => c.words.map(w => ({ w, gi }))), rng);
    ctx.dbg?.({ chosen });
    const solved = []; let sel = new Set(), miss = 0, over = false, busy = false;
    const MAX = 4;
    el.innerHTML = `<div class="sk"><p class="sk-lead">${G * 4} kelimeyi ortak temalarına göre <b>${G} gruba</b> ayır. Dört kelime seç ve gönder.</p><div id="skSolved"></div><div class="sk-grid" id="skGrid"></div>
      <div class="sk-info"><span>Kalan hata hakkı</span><span class="sk-dots" id="skMiss"></span></div><div class="sk-btns"><button class="secondarybtn" id="skShuf">Karıştır</button><button class="secondarybtn" id="skClear">Temizle</button><button class="primarybtn" id="skGo" disabled>Gönder</button></div></div>`;
    const grid = el.querySelector('#skGrid'), solvedEl = el.querySelector('#skSolved');
    const tileKey = t => `${t.gi}:${t.w}`;
    const band = (gi, isNew) => `<div class="sk-done${isNew ? ' new' : ''}" style="--c:${COLORS[gi % COLORS.length]}"><b>${esc(chosen[gi].g.name)}</b><span>${chosen[gi].words.map(w => esc(upper(w, lang).replace(/_/g, ' '))).join(' · ')}</span></div>`;
    function drawSolved(newGi = -1) { solvedEl.innerHTML = solved.map(gi => band(gi, gi === newGi)).join(''); }
    function drawGrid() {
      grid.innerHTML = tiles.map(t => { const k = tileKey(t), w = upper(t.w, lang).replace(/_/g, ' '); return `<button class="sk-t${sel.has(k) ? ' on' : ''}${w.length > 9 ? ' long' : ''}" data-key="${esc(k)}">${esc(w)}</button>`; }).join('');
      el.querySelector('#skGo').disabled = sel.size !== 4 || over || busy;
    }
    function drawMiss(lost = false) {
      el.querySelector('#skMiss').innerHTML = Array.from({ length: MAX }, (_, i) => `<i class="${i < MAX - miss ? 'on' : ''}${lost && i === MAX - miss ? ' lost' : ''}"></i>`).join('');
    }
    const tileEl = k => grid.querySelector(`[data-key="${CSS.escape(k)}"]`);
    async function submit() {
      const picked = tiles.filter(t => sel.has(tileKey(t)));
      const cnt = {}; picked.forEach(p => { cnt[p.gi] = (cnt[p.gi] || 0) + 1; });
      const best = Math.max(...Object.values(cnt));
      busy = true; drawGrid();
      // seçilenler sırayla zıplar
      picked.forEach((p, i) => { const n = tileEl(tileKey(p)); if (n) { n.style.setProperty('--i', i); replay(n, 'jump', 700); } });
      await wait(560);
      if (!alive) return;
      if (best === 4) {
        const gi = picked[0].gi;
        await Promise.all(picked.map((p, i) => wait(i * 40).then(() => { const n = tileEl(tileKey(p)); n?.classList.add('gone'); })));
        await wait(180);
        solved.push(gi); sel.clear();
        flip(grid, () => { tiles = tiles.filter(t => !picked.includes(t)); drawSolved(gi); drawGrid(); });
        burstAt(solvedEl.lastElementChild, { colors: [COLORS[gi % COLORS.length], '#fff', '#201d23'], n: 14, spread: 90 });
        busy = false; drawGrid();
        if (!tiles.length) { over = true; setTimeout(() => ctx.win(miss === 0 ? 3 : miss <= 2 ? 2 : 1, 'Bütün temaları buldun.'), 700); }
      } else {
        miss++;
        picked.forEach(p => replay(tileEl(tileKey(p)), 'nope', 450));
        floatText(grid, best === 3 ? 'Bir kelime eksik!' : 'Aynı grupta değiller', best === 3 ? 'warn' : 'bad');
        drawMiss(true); busy = false; drawGrid();
        if (miss >= MAX) {
          over = true; sel.clear(); drawGrid();
          for (let gi = 0; gi < chosen.length; gi++) if (!solved.includes(gi)) {
            await wait(520); if (!alive) return;
            const words = chosen[gi].words;
            flip(grid, () => { tiles = tiles.filter(t => t.gi !== gi); solved.push(gi); drawSolved(gi); drawGrid(); });
          }
          setTimeout(() => ctx.lose('Gruplar yukarıda.'), 900);
        }
      }
    }
    el.addEventListener('click', e => {
      if (over || busy) return;
      const t = e.target.closest('.sk-t');
      if (t) { const k = t.dataset.key; if (sel.has(k)) sel.delete(k); else if (sel.size < 4) sel.add(k); else { replay(t, 'nope', 300); return; } drawGrid(); const n = tileEl(k); if (sel.has(k)) replay(n, 'pick', 260); return; }
      if (e.target.closest('#skShuf')) { flip(grid, () => { tiles = shuffle(tiles, Math.random); drawGrid(); }, { duration: 420 }); return; }
      if (e.target.closest('#skClear')) { sel.clear(); drawGrid(); return; }
      if (e.target.closest('#skGo') && sel.size === 4) submit();
    });
    drawSolved(); drawGrid(); drawMiss();
  }
}
