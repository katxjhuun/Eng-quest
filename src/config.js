// dam-la — uygulama ayarları.
// Uzaktan güncelleme (OTA) bu adresteki update.json dosyasını okur.
// GitHub deposu herkese açık olmalı; "Release" iş akışı bu dosyayı her sürümde yeniden yükler.
// Depo adını değiştirirsen yalnızca bu satırı güncelle ve yeni bir APK/IPA derle.
export const UPDATE_MANIFEST_URL = 'https://github.com/katxjhuun/Eng-quest/releases/latest/download/update.json';

// Derleme sırasında package.json "version" alanından gelir (esbuild define).
/* global __APP_VERSION__, __BUILD_TIME__ */
export const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0-dev';
export const BUILD_TIME = typeof __BUILD_TIME__ === 'string' ? __BUILD_TIME__ : '';

// Açılışta otomatik denetimler arasında en az bu kadar süre beklenir.
export const UPDATE_CHECK_INTERVAL_MS = 3 * 60 * 60 * 1000;

// ---- dam-la ----
export const APP_NAME = 'dam-la';

// Doğum günü teması: bu gün (yerel saatle) logo şapkalı olur, konfeti ve tema açılır; ertesi gün normale döner.
export const BIRTHDAY = { month: 11, day: 24, name: 'Damla' };

// Yönetici paneli için Firebase (Realtime Database + Anonim giriş). Boşsa takip kapalıdır, uygulama yine çalışır.
// Bu değerler gizli değildir; erişim, veritabanı kurallarıyla (database.rules.json) korunur.
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCGkxxlSm82MnWMjuZCWfFVCUPn2CQyVg0',
  authDomain: 'dam-la.firebaseapp.com',
  databaseURL: 'https://dam-la-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'dam-la',
  appId: '1:341472859383:web:ed97e893af185fb0c76ff2'
};

// Müzik ödülünde şarkının tamamını çalmak için YouTube Data API v3 anahtarı (Google Cloud, dam-la projesi).
// Şarkı seçimi yine Apple/Deezer listelerinden gelir; anahtar yalnızca o şarkının YouTube videosunu bulmak için kullanılır.
// Boşsa çalar 30 saniyelik ön dinlemeyle çalışır. Anahtar gizli değildir (istemcide görünür); Google Cloud'da yalnızca
// YouTube Data API v3 ile sınırlandırılmıştır, en kötü ihtimalle günlük kotası tükenir.
export const YOUTUBE_API_KEY = 'AIzaSyB3Ru6YTiGQV-JnjM5ejoxhA8hBaX_PR30';

// Web (ana ekrana eklenmiş) sürümde pet bildirimleri için Web Push açık anahtarı. Gizli değildir;
// eşi olan özel anahtar yalnızca GitHub "VAPID_PRIVATE_KEY" gizli değişkenindedir (scripts/push-send.mjs kullanır).
export const VAPID_PUBLIC_KEY = 'BGyMf6hYThY_XtHeAUoNHgALKkpkTE0uX5CyYXGE7rKmPAGWzp-zf4_fZEKIiUgTvjf2LTnWceqSvLMzpFkLRjs';
