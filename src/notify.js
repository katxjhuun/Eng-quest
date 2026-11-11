// Bildirim ayarı: bütün bildirimler varsayılan olarak SESSİZDİR (ses yok, titreşim yok, ekranı uyandırmaz).
// Ayarlar › Ses › Bildirimler bölümünden sesli yapılabilir.
// Android: iki kanal açılır (sessiz: önem düzeyi 2; sesli: 3). iOS: ses alanı boş bırakılınca bildirim sessiz gelir.
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

let getApp = () => ({});
let channelsReady = null;
export const nativeNotify = () => { try { return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('LocalNotifications'); } catch { return false; } };
export const notifySound = () => getApp()?.profile?.notifySound === true;

export function initNotify(appGetter) {
  getApp = appGetter;
  if (nativeNotify() && Capacitor.getPlatform() === 'android') {
    channelsReady = Promise.all([
      LocalNotifications.createChannel({ id: 'dl-quiet', name: 'Sessiz bildirimler', description: 'Pet ve etkinlik haberleri (ses ve titreşim yok)', importance: 2, sound: undefined, vibration: false, visibility: 1 }),
      LocalNotifications.createChannel({ id: 'dl-sound', name: 'Sesli bildirimler', description: 'Ayarlardan sesli seçilince', importance: 3, vibration: true, visibility: 1 }),
    ]).catch(() => {});
  }
}
// LocalNotifications.schedule için bildirime eklenecek alanlar
export async function noteExtras() {
  await channelsReady;
  const loud = notifySound();
  return Capacitor.getPlatform() === 'android' ? { channelId: loud ? 'dl-sound' : 'dl-quiet' } : { sound: loud ? 'default' : '' };
}

// Ayarlar penceresindeki anahtarlar. Değişince pet ve Altın Saat bildirimleri yeniden planlanır (dl:notify-changed).
export function bindNotifySettings(core) {
  const P = () => { const a = core.app; a.profile = a.profile || {}; return a.profile; };
  const map = { notifySound: ['notifySound', false], notifyGolden: ['notifyGolden', true], notifyUpdate: ['notifyUpdate', true] };
  const sync = () => { for (const [id, [k, def]] of Object.entries(map)) { const el = document.getElementById(id); if (el) el.checked = P()[k] ?? def; } };
  for (const [id, [k]] of Object.entries(map)) {
    document.getElementById(id)?.addEventListener('change', e => { P()[k] = e.target.checked; core.saveLocal(false); window.dispatchEvent(new CustomEvent('dl:notify-changed')); });
  }
  document.getElementById('settingsBtn')?.addEventListener('click', () => setTimeout(sync, 0));
  sync();
}
export const wantGolden = () => getApp()?.profile?.notifyGolden !== false;
export const wantUpdate = () => getApp()?.profile?.notifyUpdate !== false;
