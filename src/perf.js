// dam-la — Hafif mod: süs animasyonlarını (Altın Saat parıltısı, kayan ışıklar, arka plan bulanıklığı vb.) kapatır.
// Otomatik: zayıf cihazda (az bellek/çekirdek) ya da açılışta kare hızı düşük ölçülürse kendiliğinden açılır.
// Ayarlar > Genel > Performans'tan elle Açık/Kapalı yapılabilir. Oyun mantığına dokunmaz, yalnızca görünüm.
const KEY = 'dl-lite', AUTO_KEY = 'dl-lite-auto';
const get = k => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} };

export const liteMode = () => get(KEY) || 'auto';
function weakDevice() {
  const mem = navigator.deviceMemory, cores = navigator.hardwareConcurrency;
  return (mem && mem <= 3) || (cores && cores <= 4);
}
function apply() {
  const m = liteMode();
  const on = m === 'on' || (m === 'auto' && (get(AUTO_KEY) === '1' || weakDevice()));
  document.body.classList.toggle('lite', !!on);
  return on;
}
// açılıştan birkaç saniye sonra 2 saniyelik kare hızı ölçümü (yalnızca otomatik modda ve henüz karar verilmediyse)
function probe() {
  if (liteMode() !== 'auto' || document.body.classList.contains('lite') || get(AUTO_KEY) != null) return;
  setTimeout(() => {
    if (document.hidden) return;
    let n = 0, slow = 0, last = performance.now(); const t0 = last;
    const f = t => { const d = t - last; last = t; n++; if (d > 28) slow++; if (t - t0 < 2000) requestAnimationFrame(f); else done(); };
    const done = () => { const ratio = slow / Math.max(1, n); if (ratio > 0.3) { set(AUTO_KEY, '1'); apply(); } else set(AUTO_KEY, '0'); };
    requestAnimationFrame(f);
  }, 5000);
}
export function initPerf() {
  apply(); probe();
  const sel = document.getElementById('perfMode');
  if (sel) {
    const note = document.getElementById('perfNote');
    const sync = () => { sel.value = liteMode(); if (note) note.textContent = document.body.classList.contains('lite') ? 'Şu an hafif mod açık: süs animasyonları kapalı.' : 'Şu an tüm efektler açık.'; };
    sel.addEventListener('change', () => { set(KEY, sel.value === 'auto' ? null : sel.value); if (sel.value === 'auto') set(AUTO_KEY, null); apply(); sync(); if (sel.value === 'auto') probe(); });
    sync();
  }
}
