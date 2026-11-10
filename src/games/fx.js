// Mini oyunlar için ortak küçük animasyon yardımcıları (düz, 2B; 3B görünüm yok).
const reduce = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Bir öğenin kopyasını başka bir öğenin yerine uçurur.
export function flyClone(from, to, { duration = 420, scale = 1 } = {}) {
  return new Promise(res => {
    if (!from || !to || reduce()) { res(); return; }
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const c = from.cloneNode(true);
    c.classList.add('fx-fly');
    Object.assign(c.style, { position: 'fixed', left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px', margin: 0, zIndex: 120, pointerEvents: 'none' });
    document.body.append(c);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const sx = b.width / a.width * scale, sy = b.height / a.height * scale;
    c.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 24}px) scale(${(1 + sx) / 2 * 1.06},${(1 + sy) / 2 * 1.06})`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})`, opacity: 0.9 },
    ], { duration, easing: 'cubic-bezier(.4,.1,.3,1)' }).onfinish = () => { c.remove(); res(); };
  });
}

// FLIP: kapsayıcıdaki [data-key] öğeleri, değişiklikten sonra eski yerlerinden yenilerine kayar.
export function flip(container, mutate, { duration = 320 } = {}) {
  const old = new Map();
  container.querySelectorAll('[data-key]').forEach(n => old.set(n.dataset.key, n.getBoundingClientRect()));
  mutate();
  if (reduce()) return;
  container.querySelectorAll('[data-key]').forEach(n => {
    const o = old.get(n.dataset.key); if (!o) return;
    const r = n.getBoundingClientRect(), dx = o.left - r.left, dy = o.top - r.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    n.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { duration, easing: 'cubic-bezier(.3,.7,.2,1)' });
  });
}

// Küçük parçacık patlaması (ekran koordinatları).
export function burst(x, y, { colors = ['#F2CF72', '#8BC77E', '#7FA7D9', '#E99A8A', '#B596D9'], n = 12, spread = 70, size = 8, shape = 'dot' } = {}) {
  if (reduce()) return;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    p.className = 'fx-p' + (shape === 'star' ? ' star' : '');
    const s = size * (0.6 + Math.random() * 0.7);
    Object.assign(p.style, { left: x + 'px', top: y + 'px', width: s + 'px', height: s + 'px', background: colors[i % colors.length] });
    document.body.append(p);
    const ang = Math.random() * Math.PI * 2, r = spread * (0.45 + Math.random() * 0.75);
    p.animate([
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(ang) * r}px), calc(-50% + ${Math.sin(ang) * r + 18}px)) scale(.2) rotate(${Math.random() * 360}deg)`, opacity: 0 },
    ], { duration: 520 + Math.random() * 380, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => p.remove();
  }
}
export function burstAt(el, opts) { if (!el) return; const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, opts); }

// Yükselip kaybolan yazı (+puan gibi).
export function floatText(el, text, cls = '') {
  if (!el || reduce()) return;
  const r = el.getBoundingClientRect();
  const t = document.createElement('div');
  t.className = 'fx-float ' + cls; t.textContent = text;
  Object.assign(t.style, { left: r.left + r.width / 2 + 'px', top: r.top + 'px' });
  document.body.append(t);
  t.animate([
    { transform: 'translate(-50%,0) scale(.6)', opacity: 0 },
    { transform: 'translate(-50%,-18px) scale(1.1)', opacity: 1, offset: 0.25 },
    { transform: 'translate(-50%,-52px) scale(1)', opacity: 0 },
  ], { duration: 950, easing: 'ease-out' }).onfinish = () => t.remove();
}

// Bir sınıfı yeniden tetikler (animasyonu baştan oynatır).
export function replay(el, cls, ms = 600) {
  if (!el) return;
  el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
  if (ms) setTimeout(() => el.classList.remove(cls), ms);
}
export const wait = ms => new Promise(r => setTimeout(r, ms));
