// Altın Saat: günde iki kez, iki saat süren festival. Bu sürede kazanılan XP iki katına çıkar; bu sürede seviye atlanırsa
// petin bir sonraki evriminde nadir (parlak) forma dönüşme şansı iki katına çıkar.
// Görünüm: üstte geri sayımlı altın şerit, süzülen parıltılar, bayrak süsleri; son 15 dakikada şerit nabız gibi atar.
import { goldenNow, goldenNext, goldenUpcoming } from './golden-time.js';
import { LocalNotifications } from '@capacitor/local-notifications';
import { nativeNotify, noteExtras, wantGolden } from './notify.js';

const NOTE_BASE = 7300;
export const GOLDEN_XP = 2;
export const isGolden = () => !!goldenNow();

const pad = n => String(n).padStart(2, '0');
const clock = ms => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 3600)}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`; };
const hm = t => new Date(t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

export function initGolden(core) {
  const bar = document.createElement('div');
  bar.className = 'gold-bar'; bar.id = 'goldBar'; bar.setAttribute('role', 'status');
  bar.innerHTML = `<div class="gold-flags" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>
    <div class="gold-in"><span class="gold-ico">✨</span><div class="gold-txt"><b>ALTIN SAAT</b><small>XP ×2 · seviye atlarsan nadir pet şansı ×2</small></div><div class="gold-time"><small>bitmesine</small><b id="goldLeft">2:00:00</b></div></div>
    <div class="gold-prog"><i id="goldProg"></i></div>`;
  const glitter = document.createElement('div');
  glitter.className = 'gold-glitter'; glitter.setAttribute('aria-hidden', 'true');
  glitter.innerHTML = Array.from({ length: 22 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i * 0.73) % 6}s;--s:${0.6 + ((i * 7) % 5) / 5}"></i>`).join('');
  const anchor = document.querySelector('.shell') || document.body;
  // duyuru şeridinin hemen altına yerleşir
  const tb = document.getElementById('tickBar'); if (tb) tb.after(bar); else anchor.prepend(bar);
  document.body.appendChild(glitter);

  let was = null;
  function tick() {
    const w = goldenNow(), now = Date.now();
    const on = !!w;
    document.body.classList.toggle('golden', on);
    if (on) {
      const left = w.end - now;
      bar.querySelector('#goldLeft').textContent = clock(left);
      bar.querySelector('#goldProg').style.width = `${(left / (w.end - w.start)) * 100}%`;
      bar.classList.toggle('hurry', left < 15 * 60000);
      if (was === false) start();
    } else if (was === true) { core.toast('Altın Saat bitti. Bir sonraki: ' + nextText()); }
    was = on;
  }
  function start() {
    core.toast('✨ Altın Saat başladı! İki saat boyunca XP ×2');
    document.body.classList.remove('gold-burst'); void document.body.offsetWidth; document.body.classList.add('gold-burst');
    setTimeout(() => document.body.classList.remove('gold-burst'), 2600);
    window.dispatchEvent(new CustomEvent('dl:golden', { detail: { on: true } }));
  }
  function nextText() { const n = goldenNext(); if (!n) return '—'; const today = new Date(n.start).toDateString() === new Date().toDateString(); return `${today ? 'bugün' : 'yarın'} ${hm(n.start)}`; }
  tick(); was = isGolden();
  setInterval(tick, 1000);

  // telefondaki uygulama: önümüzdeki 7 günün Altın Saat başlangıçlarını sessiz yerel bildirim olarak planla
  async function schedule() {
    if (!nativeNotify()) return;
    const ids = Array.from({ length: 16 }, (_, i) => ({ id: NOTE_BASE + i }));
    await LocalNotifications.cancel({ notifications: ids }).catch(() => {});
    if (!wantGolden()) return;
    try { const st = await LocalNotifications.checkPermissions(); if (st.display === 'prompt') await LocalNotifications.requestPermissions(); } catch {}
    const ex = await noteExtras();
    const list = goldenUpcoming(Date.now(), 7).slice(0, 16).map((w, i) => ({
      id: NOTE_BASE + i, title: '✨ Altın Saat başladı', body: 'İki saat boyunca XP ×2. Bu sürede seviye atlarsan nadir pet şansın da iki katı!',
      schedule: { at: new Date(w.start), allowWhileIdle: true }, smallIcon: 'ic_stat_pet', iconColor: '#E8B53A', ...ex,
    }));
    if (list.length) await LocalNotifications.schedule({ notifications: list }).catch(() => {});
  }
  schedule();
  window.addEventListener('dl:notify-changed', schedule);
  return { schedule, nextText, isGolden };
}
