// Web sürümünü telefona “uygulama olarak” yükleme rehberi.
// iPhone'da Apple, App Store dışından uygulama dosyası kurdurmaz; ücretsiz ve kalıcı tek yol siteyi ana ekrana eklemektir.
// Bu rehber Safari'de adımları gösterir; Android/Chrome'da tarayıcının kendi “Yükle” penceresini açar.
const KEY = 'dl-install-later';

export function initInstall() {
  const ua = navigator.userAgent || '';
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
  if (standalone) return;
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const android = /Android/.test(ua);
  if (!ios && !android) return;
  // Instagram, WhatsApp, Telegram vb. uygulama içi tarayıcılarda ana ekrana ekleme yoktur
  const inApp = /FBAN|FBAV|Instagram|Line\/|WhatsApp|Telegram|TikTok|Snapchat|GSA\//.test(ua);
  const iosOther = ios && /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  let deferred = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; show(); });

  const bar = document.createElement('div');
  bar.className = 'inst-bar hidden'; bar.id = 'installBar';
  bar.innerHTML = `<img src="./icon-192.png" alt=""><div><b>dam-la'yı telefonuna yükle</b><small>Ücretsiz · uygulama gibi tam ekran açılır</small></div><button class="primarybtn" id="instGo">Yükle</button><button class="inst-x" id="instX" aria-label="Kapat">×</button>`;
  const sheet = document.createElement('div');
  sheet.className = 'inst-sheet'; sheet.id = 'installSheet';
  document.body.append(bar, sheet);

  function steps() {
    if (inApp) return `<h3>Önce Safari'de aç</h3><p>Bu bağlantıyı bir uygulamanın içinden açtın; buradan yüklenemez.</p>
      <ol><li><span class="inst-n">1</span>Sağ üstteki <b>⋯</b> ya da <b>paylaş</b> düğmesine dokun.</li><li><span class="inst-n">2</span><b>${ios ? "Safari'de aç" : 'Tarayıcıda aç'}</b>'ı seç.</li><li><span class="inst-n">3</span>Açılan sayfada yeniden <b>Yükle</b>'ye dokun.</li></ol>`;
    if (ios) return `<h3>iPhone'a yükle</h3><p>Apple, App Store dışından dosya kurdurmuyor; bu yüzden dam-la ana ekrana eklenerek yüklenir. Ücretsizdir, süre sınırı yoktur, güncellemeler kendiliğinden gelir.</p>
      <ol><li><span class="inst-n">1</span>Alttaki <b class="inst-ic">⬆︎</b> <b>Paylaş</b> düğmesine dokun.${iosOther ? '' : ' Görmüyorsan önce sağ alttaki <b>⋯</b>’ye dokun.'}</li>
      <li><span class="inst-n">2</span>Listeyi kaydırıp <b>Ana Ekrana Ekle</b>’yi seç.</li>
      <li><span class="inst-n">3</span><b>Web Uygulaması Olarak Aç</b> açıksa açık bırak, <b>Ekle</b>’ye dokun.</li>
      <li><span class="inst-n">4</span>Ana ekrandaki <b>dam-la</b> simgesinden aç. İlerlemen orada saklanır.</li></ol>
      <div class="inst-arrow" aria-hidden="true">⬇︎</div>`;
    return `<h3>Android'e yükle</h3><ol><li><span class="inst-n">1</span>Tarayıcının <b>⋮</b> menüsüne dokun.</li><li><span class="inst-n">2</span><b>Uygulamayı yükle</b> ya da <b>Ana ekrana ekle</b>’yi seç.</li></ol><p>APK dosyasıyla kurmak istersen GitHub Releases sayfasındaki dosyayı da kullanabilirsin.</p>`;
  }
  // başka bir pencere (kurulum, pet seçimi, oyun, savaş) açıkken görünmez; kapanınca belirir
  const busy = () => !!document.querySelector('.overlay.show,.pet-overlay.show,.gm-overlay.show,.bt-overlay.show,.inst-sheet.show');
  let want = false;
  function show() {
    try { const t = +localStorage.getItem(KEY) || 0; if (Date.now() - t < 3 * 864e5) return; } catch {}
    want = true; sync();
  }
  function sync() {
    if (!want) return;
    const hide = busy();
    bar.classList.toggle('hidden', hide);
    if (!hide) requestAnimationFrame(() => bar.classList.add('in')); else bar.classList.remove('in');
  }
  setInterval(sync, 1500);
  function openSheet() {
    if (deferred) { deferred.prompt(); deferred.userChoice.finally(() => { deferred = null; want = false; bar.classList.add('hidden'); }); return; }
    sheet.innerHTML = `<div class="inst-card">${steps()}<button class="secondarybtn" id="instOk">Tamam</button></div>`;
    sheet.classList.add('show');
  }
  bar.addEventListener('click', e => {
    if (e.target.closest('#instX')) { want = false; bar.classList.add('hidden'); try { localStorage.setItem(KEY, String(Date.now())); } catch {} return; }
    openSheet();
  });
  sheet.addEventListener('click', e => { if (e.target === sheet || e.target.closest('#instOk')) sheet.classList.remove('show'); });
  // ilk açılışta biraz bekleyip göster (kurulum ekranını kapatmasın)
  if (ios || !('onbeforeinstallprompt' in window)) setTimeout(show, 2500);
  window.dlInstall = openSheet;
}
