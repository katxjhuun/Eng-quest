// dam-la — 24 Kasım doğum günü teması
// O gün (cihazın yerel tarihiyle) logo şapkalı/konfetili olur, uygulamaya doğum günü süsü eklenir ve
// telefondaki uygulama simgesi değişir. Ertesi gün açıldığında her şey kendiliğinden normale döner.
import { BIRTHDAY } from './config.js';
import { Platform } from './platform.js';

export function isBirthday(d = new Date()) {
  try { if (/[?&]birthday=1/.test(location.search) || localStorage.getItem('dl-bday-preview') === '1') return true; } catch {}
  return d.getMonth() + 1 === BIRTHDAY.month && d.getDate() === BIRTHDAY.day;
}

function setLogos(on) {
  document.querySelectorAll('img.logo-img').forEach(img => { img.src = on ? './logo-birthday.png' : './logo.png'; });
  const fav = document.getElementById('favIcon'); if (fav) fav.href = on ? './logo-birthday.png' : './logo.png';
}

function confettiBurst() {
  const box = document.createElement('div'); box.className = 'bday-confetti'; box.setAttribute('aria-hidden', 'true');
  const colors = ['#ffd84d', '#5bb8f5', '#845ef7', '#ff6b98', '#3cc896', '#ffffff'];
  for (let i = 0; i < 70; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = (Math.random() * 1.2) + 's';
    p.style.animationDuration = (2.6 + Math.random() * 1.8) + 's';
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    if (i % 3 === 0) p.style.borderRadius = '50%';
    box.append(p);
  }
  document.body.append(box);
  setTimeout(() => box.remove(), 5200);
}

let applied = null;
export function applyBirthday({ toast } = {}) {
  const on = isBirthday();
  document.documentElement.classList.toggle('birthday', on);
  const text = document.getElementById('bdayText');
  if (text) text.textContent = `İyi ki doğdun ${BIRTHDAY.name}! Bugün her doğru cevap bir kutlama.`;
  setLogos(on);
  if (on && applied !== true) {
    let shownToday = false;
    try { const k = 'dl-bday-shown-' + new Date().getFullYear(); shownToday = localStorage.getItem(k) === '1'; localStorage.setItem(k, '1'); } catch {}
    confettiBurst();
    if (!shownToday && toast) setTimeout(() => toast(`🎂 İyi ki doğdun ${BIRTHDAY.name}!`), 600);
  }
  applied = on;
  syncHomeIcon(on);
  return on;
}

// Telefon ana ekran simgesi: iOS'ta uygulama ön plandayken, Android'de arka plana geçerken değiştirilir
// (Android'de simge değişimi açık uygulamayı kapatabildiği için).
let pendingIcon = null;
function syncHomeIcon(on) {
  if (!Platform.appIcon.supported) return;
  let currentIsBday = false;
  try { currentIsBday = localStorage.getItem('dl-icon') === 'birthday'; } catch {}
  if (on === currentIsBday) { pendingIcon = null; return; }
  const doIt = () => Platform.appIcon.set(on).then(() => { try { localStorage.setItem('dl-icon', on ? 'birthday' : 'default'); } catch {} }).catch(e => console.warn('[icon]', e));
  if (Platform.platformName === 'ios') doIt();
  else pendingIcon = doIt;
}
export function flushPendingIcon() { if (pendingIcon) { const f = pendingIcon; pendingIcon = null; f(); } }

// Gece yarısını geçince (uygulama açık kalmışsa) temayı güncelle
export function scheduleBirthdayCheck(opts) {
  const now = new Date(), next = new Date(now); next.setHours(24, 0, 5, 0);
  setTimeout(() => { applyBirthday(opts); scheduleBirthdayCheck(opts); }, next - now);
}
