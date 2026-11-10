// Stack: karışık kelimeleri gizli ortak temalarına göre dörtlü gruplara ayır. 4 hata hakkı.
// Zorluk: 16 kelime / 4 grup ile başlar; 20/5 ve 24/6'ya çıkar; ileri bölümlerde dar kategoriler ve kelime oyunu grupları gelir.
import { lexicon, upper } from './lexicon.js';
import { shuffle } from './hub.js';
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
    ctx.dbg?.({ chosen }); const solved = []; let sel = new Set(), miss = 0, over = false;
    const MAX = 4;
    el.innerHTML = `<div class="sk"><p class="sk-lead">${G * 4} kelimeyi ortak temalarına göre <b>${G} gruba</b> ayır. Dört kelime seç ve gönder.</p><div id="skSolved"></div><div class="sk-grid" id="skGrid"></div>
      <div class="sk-info"><span id="skMiss"></span></div><div class="sk-btns"><button class="secondarybtn" id="skShuf">Karıştır</button><button class="secondarybtn" id="skClear">Temizle</button><button class="primarybtn" id="skGo" disabled>Gönder</button></div></div>`;
    function draw() {
      el.querySelector('#skSolved').innerHTML = solved.map(gi => `<div class="sk-done" style="--c:${COLORS[gi % COLORS.length]}"><b>${esc(chosen[gi].g.name)}</b><span>${chosen[gi].words.map(w => esc(upper(w, lang))).join(' · ')}</span></div>`).join('');
      el.querySelector('#skGrid').innerHTML = tiles.map((t, i) => `<button class="sk-t${sel.has(i) ? ' on' : ''}" data-i="${i}">${esc(upper(t.w, lang))}</button>`).join('');
      el.querySelector('#skMiss').innerHTML = `Kalan hata hakkı: ${'●'.repeat(MAX - miss)}${'○'.repeat(miss)}`;
      el.querySelector('#skGo').disabled = sel.size !== 4 || over;
    }
    el.addEventListener('click', e => {
      if (over) return;
      const t = e.target.closest('.sk-t');
      if (t) { const i = +t.dataset.i; if (sel.has(i)) sel.delete(i); else if (sel.size < 4) sel.add(i); draw(); return; }
      if (e.target.closest('#skShuf')) { const keep = [...sel].map(i => tiles[i]); tiles = shuffle(tiles, Math.random); sel = new Set(keep.map(k => tiles.indexOf(k))); draw(); return; }
      if (e.target.closest('#skClear')) { sel.clear(); draw(); return; }
      if (e.target.closest('#skGo') && sel.size === 4) {
        const picked = [...sel].map(i => tiles[i]);
        const cnt = {}; picked.forEach(p => { cnt[p.gi] = (cnt[p.gi] || 0) + 1; });
        const best = Math.max(...Object.values(cnt));
        if (best === 4) {
          solved.push(picked[0].gi); tiles = tiles.filter(t => !picked.includes(t)); sel.clear(); draw();
          if (!tiles.length) { over = true; setTimeout(() => ctx.win(miss === 0 ? 3 : miss <= 2 ? 2 : 1, 'Bütün temaları buldun.'), 500); }
        } else {
          miss++; ctx.toast(best === 3 ? 'Bir kelime eksik!' : 'Bu dördü aynı grupta değil.');
          el.querySelector('#skGrid').classList.add('shake'); setTimeout(() => el.querySelector('#skGrid')?.classList.remove('shake'), 400);
          draw();
          if (miss >= MAX) {
            over = true;
            for (let gi = 0; gi < chosen.length; gi++) if (!solved.includes(gi)) solved.push(gi);
            tiles = []; draw(); setTimeout(() => ctx.lose('Gruplar yukarıda.'), 1800);
          }
        }
      }
    });
    draw();
  }
}
