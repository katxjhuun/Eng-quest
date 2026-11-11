// dam-la — soru ekranı efektleri: cevap anında tepki, yeni soru girişi ve art arda doğru (seri) arttıkça güçlenen görünüm.
// Akıcılık önceliklidir: yalnızca transform/opacity animasyonları; parçacıklar kısa ömürlü ve az sayıda, hafif modda daha da az.
const TIERS = [[10, 3], [5, 2], [3, 1]];
const tierOf = s => (TIERS.find(([n]) => s >= n) || [0, 0])[1];
const MILESTONE = s => s === 3 || s === 5 || s === 10 || (s > 10 && s % 5 === 0);
const MSG = { 3: 'Seri başladı!', 5: 'Alev aldın!', 10: 'Efsane seri!' };

export function initQuizFx(core, quiz) {
  const lite = () => document.body.classList.contains('lite');
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const card = () => { const q = document.getElementById('quizCard'); return q && !q.classList.contains('hidden') ? q : document.querySelector('.challenge:not(.quiz-card)'); };
  let lastStreak = 0;

  function setTier(el, s) {
    const t = tierOf(s);
    for (const c of ['sk1', 'sk2', 'sk3']) el.classList.toggle(c, c === 'sk' + t);
    el.dataset.streak = s;
  }
  function chip(el, html, cls) {
    el.querySelector('.sk-chip')?.remove();
    const c = document.createElement('div'); c.className = 'sk-chip ' + (cls || ''); c.innerHTML = html;
    el.appendChild(c); setTimeout(() => c.classList.add('out'), cls === 'big' ? 1900 : 1500); setTimeout(() => c.remove(), cls === 'big' ? 2300 : 1900);
  }
  function burst(from, n, tier) {
    if (reduced || !from) return;
    if (lite()) n = Math.min(n, 5);
    const r = from.getBoundingClientRect();
    const layer = document.createElement('div'); layer.className = 'sk-burst';
    layer.style.left = r.left + r.width / 2 + 'px'; layer.style.top = r.top + r.height / 2 + 'px';
    const glyphs = tier >= 3 ? ['★', '✦', '●', '◆'] : tier >= 2 ? ['🔥', '✦', '●'] : ['✦', '●'];
    let h = '';
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.5, d = 46 + Math.random() * (tier >= 3 ? 80 : 50);
      h += `<i class="t${tier}" style="--x:${(Math.cos(a) * d).toFixed(0)}px;--y:${(Math.sin(a) * d * 0.7 - 20).toFixed(0)}px;--r:${(Math.random() * 360) | 0}deg;--d:${(i * 12) | 0}ms">${glyphs[i % glyphs.length]}</i>`;
    }
    layer.innerHTML = h; document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 900);
  }

  window.addEventListener('dl:answer', e => {
    const d = e.detail || {}, el = card(); if (!el) return;
    const legacy = String(d.kind || '').startsWith('legacy');
    const s = legacy ? (core.app.stats?.streak | 0) : (quiz.stats?.().streak | 0);
    if (d.right) {
      const opt = el.querySelector('.quiz-opt.right') || el.querySelector('#answerGrid .opened:last-child') || el.querySelector('#submitBtn');
      opt?.classList.add('fx-pop');
      setTier(el, s);
      const t = tierOf(s);
      if (s >= 2) chip(el, `🔥 <b>${s}</b>${MILESTONE(s) ? ` <span>${MSG[s] || `${s} seri!`}</span>` : ''}`, MILESTONE(s) ? 'big t' + t : 't' + t);
      burst(opt || el, t >= 3 ? 16 : t >= 2 ? 11 : t >= 1 ? 7 : 4, t);
      if (MILESTONE(s) && !reduced) { el.classList.remove('sk-flash'); void el.offsetWidth; el.classList.add('sk-flash'); }
    } else {
      el.querySelector('.quiz-opt.wrong')?.classList.add('fx-shake');
      el.querySelector('.quiz-opt.right')?.classList.add('fx-reveal');
      if (lastStreak >= 3) chip(el, `💨 <span>${lastStreak} serilik seri bitti</span>`, 'broke');
      setTier(el, 0);
    }
    lastStreak = s;
  });
  // yeni soru: başlık ve seçenekler sırayla, yumuşakça girer
  window.addEventListener('dl:question', () => {
    const el = card(); if (!el || reduced) return;
    el.classList.remove('qz-enter'); void el.offsetWidth; el.classList.add('qz-enter');
    clearTimeout(el._enterT); el._enterT = setTimeout(() => el.classList.remove('qz-enter'), 700);
  });
  // açılışta mevcut seriyi göster
  setTimeout(() => { const el = card(), s = quiz.stats?.().streak | 0; lastStreak = s; if (el) setTier(el, s); }, 800);
}
