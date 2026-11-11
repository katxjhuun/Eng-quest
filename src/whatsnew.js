// dam-la — "Yenilikler": güncellemeden sonraki ilk açılışta, o sürümle (atlanan sürümler dahil) gelen değişiklikleri bir kez özetler.
// İlk kurulumda gösterilmez. Kaynak: derlemede DEGISIKLIKLER.md'den üretilen changelog.json.
import { APP_VERSION } from './config.js';

const KEY = 'dl-seen-version';
const cmp = (a, b) => { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0); } return 0; };
const md = (s, esc) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>');

export function initWhatsNew(core) {
  const esc = core.esc;
  let seen = null; try { seen = localStorage.getItem(KEY); } catch {}
  const set = () => { try { localStorage.setItem(KEY, APP_VERSION); } catch {} };
  if (/dev/.test(APP_VERSION)) return { open };
  // ilk kurulum: kayıtlı ilerleme yoksa yeni oyuncudur → gösterme
  if (!seen) { const old = (core.app?.stats?.correct | 0) + (core.app?.xp | 0) > 0 || !!core.app?.pet; if (!old) { set(); return { open }; } seen = '0.0.0'; }
  if (cmp(APP_VERSION, seen) <= 0) return { open };
  setTimeout(() => open(seen), 2200);
  async function open(since = '0.0.0') {
    let list = [];
    try { list = await (await fetch('./changelog.json', { cache: 'no-store' })).json(); } catch {}
    const fresh = list.filter(e => cmp(e.v, since) > 0 && cmp(e.v, APP_VERSION) <= 0).slice(0, 4);
    set();
    if (!fresh.length) return;
    const ov = document.createElement('div');
    ov.className = 'wn-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = `<div class="wn-card"><div class="wn-top"><span class="wn-badge">🎉 Güncellendi</span><b>Yenilikler</b><small>dam-la ${esc(APP_VERSION)}</small></div>
      <div class="wn-body">${fresh.map((e, i) => `<section class="${i ? 'wn-old' : ''}"><h4>${esc(e.title)} <small>${esc(e.v)}</small></h4><ul>${e.items.map(t => `<li>${md(t, esc)}</li>`).join('')}</ul></section>`).join('')}</div>
      <button class="primarybtn wn-ok">Harika, devam!</button></div>`;
    document.body.appendChild(ov);
    requestAnimationFrame(() => ov.classList.add('show'));
    const close = () => { ov.classList.remove('show'); setTimeout(() => ov.remove(), 250); };
    ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('.wn-ok')) close(); });
  }
  return { open };
}
