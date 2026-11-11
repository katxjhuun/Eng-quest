// Web sürümünde (özellikle iPhone'da ana ekrana eklenmiş hâlde) pet bildirimleri.
// Tarayıcı zamanlanmış yerel bildirim gönderemediği için: telefon bir Web Push aboneliği açar, bildirim zamanlarını
// Firebase'e (push/<uid>) yazar; GitHub'daki zamanlanmış iş (push.yml) vakti gelenleri gönderir.
// iPhone: iOS 16.4+ ve uygulama ana ekrandan açılmış olmalı. Android Chrome: doğrudan çalışır.
import { VAPID_PUBLIC_KEY } from './config.js';

const b64 = s => { const p = '='.repeat((4 - s.length % 4) % 4); const r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(r, c => c.charCodeAt(0)); };
export const webPushSupported = () => !!(VAPID_PUBLIC_KEY && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && (location.protocol === 'https:' || location.hostname === 'localhost'));
export const isStandalone = () => window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
export const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
// iPhone'da Safari sekmesinde push yoktur; önce ana ekrana eklenmesi gerekir
export const webPushNeedsInstall = () => isIOS() && !isStandalone();

let subCache = null;
// izin ister (dokunma anında çağrılmalı) ve abonelik döner
export async function enableWebPush() {
  if (!webPushSupported()) return { ok: false, reason: 'unsupported' };
  if (webPushNeedsInstall()) return { ok: false, reason: 'install' };
  const perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  if (perm !== 'granted') return { ok: false, reason: 'denied' };
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(VAPID_PUBLIC_KEY) });
  subCache = sub.toJSON();
  return { ok: true, sub: subCache };
}
// izin verilmişse mevcut aboneliği (yeniden istemeden) döner
export async function currentWebPush() {
  if (subCache) return subCache;
  if (!webPushSupported() || Notification.permission !== 'granted') return null;
  try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); subCache = sub ? sub.toJSON() : null; } catch { subCache = null; }
  return subCache;
}
