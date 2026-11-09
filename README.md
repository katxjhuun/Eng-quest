# English Quest 2.0

İngilizce "pop quiz" uygulaması — Android ve iPhone için mobil uygulama (Capacitor 8) + tarayıcı/PWA sürümü.
İlerleme telefonda kalıcı olarak saklanır; sunucu gerekmez. Yeni sürümler uygulama yeniden kurulmadan uzaktan iner.

- **Kurulum ve güncelleme:** [KURULUM.md](KURULUM.md)
- **Bu sürümde düzeltilenler:** [DEGISIKLIKLER.md](DEGISIKLIKLER.md)

## Klasörler
| Yol | İçerik |
|---|---|
| `src/index.html`, `src/styles.css` | Arayüz |
| `src/app.js` | Oyun mantığı ve **soru havuzu** (`questions`) |
| `src/platform.js` | Telefon katmanı: kayıt, ses, yedek, uzaktan güncelleme |
| `src/config.js` | Güncelleme adresi (`update.json`) |
| `public/` | Simgeler, PWA manifest, service worker |
| `android/`, `ios/` | Yerel projeler (GitHub Actions derler) |
| `scripts/` | Derleme, OTA paketi, yerel sunucu |
| `.github/workflows/` | Release (APK + OTA), iOS IPA, GitHub Pages |

## Komutlar
```
npm install
npm run dev        # http://localhost:4319
npm run build      # www/ klasörünü üretir
npm run bundle     # OTA paketi: dist-ota/web-bundle.zip + update.json
```
