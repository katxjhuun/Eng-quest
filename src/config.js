// English Quest — uygulama ayarları.
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
