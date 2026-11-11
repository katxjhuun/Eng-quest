// Ana ekranın en üstüne yapışık kayan duyuru şeridi.
// · Oyuncuların başarıları: nadir pet (dokununca pencere açılır), son evrim, seviye atlama, en yüksek seviye.
// · Zor başarılar (nadir pet, son evrim, C2) altın renkle, parıltıyla ve daha uzun gösterilir; yeni geldiğinde şerit bir an parlar.
// · Arkada çözülen soru sıralaması tutulur; şeritte yalnızca kendi petin ve sıran yazar (ayrı bir liste ekranı yok).
import { petSVG, stageName, PET_SPECIES } from './pet-art.js';
import { goldenNow, goldenNext } from './golden-time.js';

const KIND = {
  shiny: { icon: '🌟', tier: 3, text: e => `${e.code} · ${e.name} NADİR forma dönüştü!` },
  maxevo: { icon: '🧬', tier: 3, text: e => `${e.code} · ${e.name} son formuna ulaştı: ${stageName(e.species, 5)}` },
  maxlevel: { icon: '👑', tier: 3, text: e => `${e.code} en yüksek seviyeye ulaştı: ${e.level || 'C2'}!` },
  level: { icon: '🎓', tier: 1, text: e => `${e.code} seviye atladı → ${e.level}` },
  boss: { icon: '⚔️', tier: 2, text: e => `${e.code} · ${e.name} bir boss'u yendi` },
  stars: { icon: '⭐', tier: 2, text: e => `${e.code} · ${e.name} ${e.stars}. yıldızını aldı` },
};

export function initTicker(core) {
  const esc = core.esc;
  const bar = document.createElement('div');
  bar.className = 'tick-bar'; bar.id = 'tickBar'; bar.setAttribute('aria-label', 'Duyurular');
  bar.innerHTML = '<div class="tick-me" id="tickMe"></div><div class="tick-view"><div class="tick-track" id="tickTrack"></div></div>';
  const pop = document.createElement('div');
  pop.className = 'tick-pop'; pop.id = 'tickPop'; pop.setAttribute('role', 'dialog');
  const shell = document.querySelector('.shell') || document.body;
  shell.prepend(bar); document.body.appendChild(pop); document.body.classList.add('has-ticker');
  const setH = () => document.documentElement.style.setProperty('--ticker-h', bar.offsetHeight + 'px');
  new ResizeObserver(setH).observe(bar); setH();

  let feed = [], rank = null, lastTop = '';
  const myCode = () => core.feed?.code?.() || '';
  function meHTML() {
    const p = core.app.pet;
    const n = core.statsSnapshot?.()?.correct | 0;
    const pet = p && !core.app.profile?.petOff ? `<span class="tick-pet">${petSVG(p.species, p.stage, { coat: p.coat, shiny: p.shiny, mood: 'happy' })}</span>` : '<span class="tick-pet">🐾</span>';
    return `${pet}<span class="tick-rank"><b>${rank ? `${rank}.` : '—'}</b><small>${n} soru</small></span>`;
  }
  function items() {
    const now = Date.now(), out = [];
    const g = goldenNow(now), ng = goldenNext(now);
    if (g) out.push({ cls: 'gold', html: `✨ <b>Altın Saat şu an!</b> XP ×2 · ${Math.ceil((g.end - now) / 60000)} dk kaldı` });
    else if (ng) out.push({ cls: 'soft', html: `✨ Sonraki Altın Saat: ${new Date(ng.start).toDateString() === new Date().toDateString() ? 'bugün' : 'yarın'} ${new Date(ng.start).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}` });
    const p = core.app.pet;
    if (p && !core.app.profile?.petOff) out.push({ cls: 'me', html: `🐾 Senin <b>${esc(p.name)}</b>${rank ? ` · çözülen soruda <b>${rank}. sırada</b>` : ''}` });
    // son 3 günün başarıları; zor olanlar önce ve iki kez
    const recent = feed.filter(e => KIND[e.kind] && now - (e.at || 0) < 3 * 864e5).sort((a, b) => (b.tier - a.tier) || (b.at - a.at)).slice(0, 18);
    for (const e of recent) {
      const k = KIND[e.kind], tier = e.tier || k.tier;
      const it = { cls: `t${tier}${e.code === myCode() ? ' mine' : ''}`, html: `${k.icon} ${esc(k.text(e))}`, id: e.id, click: ['shiny', 'maxevo', 'boss', 'stars'].includes(e.kind) && e.species };
      out.push(it); if (tier >= 3) out.push({ ...it });
    }
    if (out.length < 3) out.push({ cls: 'soft', html: '📣 Nadir pet yakalayan, son forma ulaşan ve seviye atlayanlar burada duyurulur' });
    return out;
  }
  function render() {
    bar.querySelector('#tickMe').innerHTML = meHTML();
    const list = items();
    const one = list.map(i => `<span class="tick-it ${i.cls}${i.click ? ' click' : ''}" ${i.id ? `data-id="${esc(i.id)}"` : ''}>${i.html}</span><span class="tick-sep">•</span>`).join('');
    const track = bar.querySelector('#tickTrack');
    if (track.dataset.sig === one) return;
    track.dataset.sig = one;
    track.innerHTML = one + one; // kesintisiz döngü için iki kopya
    requestAnimationFrame(() => { const w = track.scrollWidth / 2; track.style.setProperty('--dur', `${Math.max(18, w / 42)}s`); });
  }
  // yeni zor başarı gelince şerit bir an parlar ve öne çıkar
  function flash(e) {
    const k = KIND[e.kind]; if (!k) return;
    const f = document.createElement('div'); f.className = 'tick-flash'; f.innerHTML = `<span>${k.icon}</span><b>${esc(k.text(e))}</b>`;
    if (e.species) f.dataset.id = e.id;
    bar.appendChild(f); setTimeout(() => f.remove(), 6000);
  }
  function openPop(id) {
    const e = feed.find(x => x.id === id); if (!e || !e.species || !PET_SPECIES[e.species]) return;
    const k = KIND[e.kind] || {};
    pop.innerHTML = `<div class="tick-card${e.shiny ? ' shiny' : ''}"><button class="closebtn" id="tickClose" aria-label="Kapat">×</button>
      <div class="tick-art">${petSVG(e.species, Math.min(5, e.stage | 0), { coat: e.coat | 0, shiny: !!e.shiny, mood: 'happy' })}</div>
      <div class="eyebrow">${esc(e.code)}</div><h3>${esc(e.name || '')}</h3>
      <p>${esc(PET_SPECIES[e.species].label)} · ${esc(stageName(e.species, Math.min(5, e.stage | 0)))}${e.shiny ? ' · <b class="evo-shiny">✨ Nadir form</b>' : ''}</p>
      <p class="tick-when">${k.icon || ''} ${new Date(e.at || Date.now()).toLocaleString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p></div>`;
    pop.classList.add('show');
  }
  bar.addEventListener('click', ev => { const t = ev.target.closest('[data-id]'); if (t) openPop(t.dataset.id); });
  pop.addEventListener('click', ev => { if (ev.target === pop || ev.target.closest('#tickClose')) pop.classList.remove('show'); });

  let listening = false;
  function connect() {
    if (listening || !core.feed?.ready?.()) return;
    listening = true;
    core.feed.listen(list => {
      const top = list.filter(e => (e.tier || KIND[e.kind]?.tier) >= 3).sort((a, b) => b.at - a.at)[0];
      if (top && lastTop && top.id !== lastTop && Date.now() - (top.at || 0) < 120000) flash(top);
      if (top) lastTop = top.id;
      feed = list; render();
    });
  }
  async function refreshRank() {
    if (!core.feed?.ready?.()) return;
    const p = core.app.pet, n = core.statsSnapshot?.()?.correct | 0;
    await core.feed.board({ n, name: p?.name || '', species: p?.species, stage: p?.stage | 0, shiny: !!p?.shiny, coat: p?.coat | 0 });
    rank = await core.feed.rank(n); render();
  }
  render();
  setInterval(() => { connect(); render(); }, 15000);
  setTimeout(() => { connect(); refreshRank(); }, 3000);
  window.addEventListener('dl:answer', () => { clearTimeout(refreshRank.t); refreshRank.t = setTimeout(refreshRank, 4000); });
  return { render, refreshRank, post: e => core.feed?.post?.(e) };
}
