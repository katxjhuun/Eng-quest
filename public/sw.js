// Yalnızca tarayıcı/PWA sürümünde çalışır (telefondaki uygulamada kayıtlı değildir).
// Sayfa ve dosyalar "önce ağ" ile alınır: internet varsa her açılışta en yeni sürüm gelir,
// yoksa son kopya önbellekten açılır. Eski sürümdeki "eski kabuk takılı kalıyor" sorunu böyle çözülür.
const CACHE = 'english-quest-__APP_VERSION__'; // (ad, eski önbellekleri temizlemek için korunuyor)
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('english-quest') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // müzik/ses gibi dış kaynaklara dokunma
  if (url.pathname.includes('/admin')) return; // yönetici paneli uygulamadan bağımsızdır
  event.respondWith(
    fetch(req)
      .then(resp => {
        if (resp.ok) { const copy = resp.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return resp;
      })
      .catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});

// Web Push: GitHub'daki zamanlanmış iş (scripts/push-send.mjs) petin bildirimini gönderir
self.addEventListener('push', event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch { d = { title: 'dam-la', body: event.data ? event.data.text() : '' }; }
  event.waitUntil(self.registration.showNotification(d.title || 'dam-la', {
    body: d.body || '', icon: './icon-192.png', badge: './icon-192.png', tag: d.tag || 'dl-pet',
    // varsayılan sessiz: ses/titreşim yok, aynı etiketle gelen bildirim tekrar dürtmez
    silent: !d.loud, renotify: !!d.loud, vibrate: d.loud ? [80] : [], data: { url: './' },
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) if ('focus' in c) return c.focus();
    return self.clients.openWindow ? self.clients.openWindow(event.notification.data?.url || './') : undefined;
  }));
});
