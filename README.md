# dam-la 2.1

İngilizce ve genel kültür **pop quiz** uygulaması — Android ve iPhone için mobil uygulama (Capacitor 8) + tarayıcı/PWA sürümü + uygulamadan bağımsız **yönetici paneli**.
İlerleme telefonda kalıcı olarak saklanır; yeni sürümler uygulama yeniden kurulmadan uzaktan iner.

- **Kurulum, güncelleme, yönetici paneli:** [KURULUM.md](KURULUM.md)
- **Sürüm notları:** [DEGISIKLIKLER.md](DEGISIKLIKLER.md)
- Uygulama (web): https://katxjhuun.github.io/Eng-quest/ · Panel: https://katxjhuun.github.io/Eng-quest/admin/

## Klasörler
| Yol | İçerik |
|---|---|
| `src/index.html`, `src/styles.css`, `src/features.css` | Arayüz (renkler derlemede temalara dönüştürülür) |
| `src/app.js` | Ana akış, İngilizce seviye soruları (`questions`), ödül, ayarlar |
| `src/quiz.js` | Konu sekmeleri, pop quiz / yazarak / dinleyerek / karışık, açıklamalar, XP animasyonu |
| `src/data/subjects.js` | 13 konunun soruları ve kaynakları |
| `src/data/departments.js` | Kalibrasyon bölümleri ve ileri seviye İngilizce terimler |
| `src/themes.js`, `scripts/theme-gen.mjs` | 11 tema ve renk dönüştürücü |
| `src/kokoro.js`, `src/vendor/` | Cihazda çalışan Kokoro AI sesi |
| `src/music.js` | Ödül müziği (canlı listeler, beğeniler) |
| `src/cloud.js` | DL-kimlik ve yönetici paneli bağlantısı (Firebase) |
| `src/birthday.js` | 24 Kasım doğum günü teması ve simgesi |
| `src/platform.js`, `src/config.js` | Telefon katmanı ve ayarlar (OTA adresi, Firebase) |
| `admin/` | Yönetici paneli (Pages'te `/admin/`) |
| `database.rules.json` | Firebase Realtime Database güvenlik kuralları |
| `android/`, `ios/` | Yerel projeler (GitHub Actions derler) |
| `.github/workflows/` | Release (APK + OTA), iOS IPA, GitHub Pages |

## Komutlar
```
npm install
npm run dev          # http://localhost:4319
npm run build        # www/ (uygulama + OTA içeriği)
npm run build:site   # _site/ = www + admin (GitHub Pages)
npm run bundle       # OTA paketi: dist-ota/web-bundle.zip + update.json
```
