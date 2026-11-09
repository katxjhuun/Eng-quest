# English Quest 2.0 — Kurulum rehberi (App Store / Play Store olmadan)

Bu sürümde uygulama **telefonun içinde** çalışır. Sunucu, Render, Supabase, Google girişi veya açık bir bilgisayar gerekmez. İlerleme (XP, sorular, tekrar planı, ayarlar) telefonda kalıcı olarak kaydedilir. Yeni sürümler uygulamayı yeniden kurmadan internetten iner.

Derleme işini **GitHub Actions** yapar: senin bilgisayarına Android Studio, Xcode ya da Mac kurman gerekmez.

---

## 0) Bir kerelik hazırlık (10–15 dk, bilgisayardan)

### 0.1 Projeyi GitHub'a koy
1. `katxjhuun/Eng-quest` deposundaki eski dosyaları sil (veya yeni bir depo aç) ve bu ZIP'teki `english-quest-app` klasörünün **içeriğini** deponun köküne yükle. `.github` klasörü dahil olmalı.
   - GitHub sitesinden: **Add file › Upload files** ile klasörleri sürükle-bırak. (`.github` gizli klasör olduğu için Windows'ta "gizli öğeleri göster" açık olsun.)
2. Depo **herkese açık (Public)** olmalı: telefondaki uygulama güncellemeleri buradan herkese açık bağlantıyla indirir. Projede artık gizli anahtar yok. (Settings › General › Danger Zone › Change visibility)

### 0.2 Android imza anahtarını ekle (çok önemli)
ZIP'teki `GIZLI_android_imza/GITHUB_SECRETS.txt` dosyasını aç. GitHub'da **Settings › Secrets and variables › Actions › New repository secret** ile oradaki 4 değeri ekle:
`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

> Bu klasörü **depoya yükleme**, ama kaybetme de (parola yöneticisine/güvenli bir yere kopyala). Her APK aynı anahtarla imzalanmazsa telefon yenisini eskisinin üzerine kurmaz.

### 0.3 (İsteğe bağlı) Web/PWA sürümünü aç
**Settings › Pages › Build and deployment › Source: GitHub Actions** seç. Her `main` güncellemesinde uygulama `https://katxjhuun.github.io/Eng-quest/` adresinde de yayınlanır (iPhone için en kolay yol, aşağıya bak).

### 0.4 İlk sürümü üret
**Actions › "Release (APK + uzaktan güncelleme)" › Run workflow** düğmesine bas. 5–8 dakika sonra **Releases** sayfasında `English Quest 2.0.0` oluşur; içinde:
- `EnglishQuest-2.0.0.apk` — Android kurulum dosyası
- `web-bundle.zip` + `update.json` — uzaktan güncelleme dosyaları (dokunma)

---

## 1) Android'e kurulum

1. Telefonda Chrome ile deponun **Releases** sayfasını aç → en üstteki sürümden `.apk` dosyasına dokun ve indir.
2. İndirme bitince aç. "Bu kaynaktan uygulama yüklemeye izin ver" sorulursa **Ayarlar › İzin ver** (Chrome için bir kez).
3. Play Protect "tanınmayan geliştirici" uyarısı gösterirse **Ayrıntılar › Yine de yükle**.
4. Uygulamayı aç; ilk açılışta seviye/yöntem/hedef seçimini yap.

**Sonraki APK'lar** (nadiren gerekir): yeni APK'yı aynı şekilde indirip kur — eskisinin **üzerine** kurulur, ilerleme silinmez.

> Not: Google, Play dışından kurulan uygulamalar için geliştirici doğrulamasını aşamalı getiriyor. 30 Eylül 2026'da yalnızca Brezilya, Endonezya, Singapur ve Tayland'da başladı; küresel yaygınlaşma 2027'de planlanıyor. Türkiye'de devreye girerse ücretsiz "limited distribution" (öğrenci/hobi) geliştirici hesabı açman veya "gelişmiş yükleme" adımlarını izlemen gerekebilir.

---

## 2) iPhone'a kurulum — 3 yol

| Yol | Ücret | Bilgisayar | Süre sınırı | Ne zaman? |
|---|---|---|---|---|
| **A. Ana ekrana ekle (PWA)** | Ücretsiz | Gerekmez | Yok | **Önerilen.** En az zahmet. |
| **B. IPA'yı kendi Apple hesabınla yükle** | Ücretsiz | Windows/Mac (ilk kurulum) | 7 günde bir yenileme | Gerçek "uygulama" istiyorsan |
| **C. Apple Developer Program** | 99 $/yıl | Gerekir | 1 yıl | Uzun vadeli / birden çok cihaz |

### A. Ana ekrana ekle (PWA) — önerilen
1. 0.3 adımını yaptıysan iPhone'da **Safari** ile `https://katxjhuun.github.io/Eng-quest/` adresini aç.
2. **Paylaş (□↑) › Ana Ekrana Ekle › Ekle**.
3. Artık ana ekrandan tam ekran açılır, ilerleme telefonda saklanır, güncellemeler kendiliğinden gelir. 7 günlük süre sınırı yoktur.
   - Fark: müzik ödülünde Deezer listesi yerine Apple iTunes önizlemeleri kullanılır; diğer her şey aynı.

### B. IPA'yı ücretsiz Apple hesabıyla yükleme (Sideloadly ile, Windows'ta)
1. GitHub'da **Actions › "iOS IPA (imzasız)" › Run workflow**. Bittiğinde çalıştırmanın sayfasındaki **Artifacts** bölümünden `EnglishQuest-iOS-ipa` dosyasını indir ve ZIP'i aç → `EnglishQuest-x.y.z-unsigned.ipa`.
2. Bilgisayara **Sideloadly** (sideloadly.io) ve Apple'ın **iTunes** uygulamasının web sitesindeki sürümünü kur (Microsoft Store sürümü sorun çıkarabilir).
3. iPhone'u kabloyla bağla, "Bu bilgisayara güven" de. Sideloadly'de IPA'yı sürükle, Apple ID'ni yaz, **Start**. (İkinci bir Apple ID kullanmak daha güvenlidir.)
4. iPhone'da: **Ayarlar › Genel › VPN ve Aygıt Yönetimi** › Apple ID'ne dokun › **Güven**.
5. iOS 16 ve sonrası: **Ayarlar › Gizlilik ve Güvenlik › Geliştirici Modu**'nu aç, telefon yeniden başlar.
6. **Her 7 günde bir** Sideloadly ile aynı IPA'yı tekrar yükle (uygulamayı **silmeden**, ilerleme korunur). Bilgisayarsız yenileme için SideStore kullanılabilir.
   - Ücretsiz hesapla aynı anda en fazla 3 yan yüklenmiş uygulama olabilir.
   - Uzaktan güncellemeler bu yolda da çalışır; yeni IPA yalnızca 7 günlük yenileme veya kabuk değişikliği için gerekir.

### C. Apple Developer Program (99 $/yıl)
İmza 1 yıl geçerli olur; TestFlight veya "Ad Hoc" dağıtımla kurulabilir. Bunun için `ios.yml` iş akışına imza sertifikası eklemek gerekir — ihtiyaç olursa ayrıca kurulur.

---

## 3) Uzaktan güncelleme nasıl çalışır?

- Uygulama açıldığında (en fazla 3 saatte bir) `update.json`'u denetler. Daha yeni sürüm varsa arka planda indirir; üstte **"Yeni sürüm hazır"** şeridi çıkar.
- **Yeniden başlat**'a basarsan hemen yüklenir; basmazsan uygulamayı kapatıp açtığında kendiliğinden geçer.
- Yeni sürüm açılmazsa (bozuk paket), uygulama 10 saniye içinde **otomatik olarak önceki çalışan sürüme döner**.
- İndirilen paketin SHA-256 özeti `update.json` ile karşılaştırılır; uyuşmazsa yüklenmez.
- Ayarlar › **Uygulama güncellemeleri**: sürüm bilgisi, "Güncellemeleri denetle" düğmesi ve otomatik denetim anahtarı.

### Yeni bir güncelleme yayınlama (sen yaparsın)
1. `src/` içinde değişikliği yap (ör. `src/app.js` içindeki `questions` listesine soru ekle).
2. `package.json` içindeki `"version"` değerini artır: `2.0.0` → `2.0.1`.
3. Değişiklikleri GitHub'a gönder (commit/push veya web'den yükle).
4. **Actions › Release › Run workflow**. Bitti — telefonlar bir sonraki açılışta indirir. PWA sürümü de kendiliğinden güncellenir.

### Ne zaman yeniden kurulum (yeni APK/IPA) gerekir?
Yalnızca **telefon tarafını** değiştiren durumlarda: yeni bir Capacitor eklentisi, uygulama simgesi/adı, izinler veya Capacitor sürüm yükseltmesi. O zaman:
- `package.json` içinde `"nativeVersion"` ve `"minNativeVersion"` değerlerini birlikte artır (ör. `2.1.0`),
- Release'i çalıştır, yeni APK'yı eskisinin üzerine kur. Eski kabuktaki telefonlara uygulama "yeniden kurulum gerekiyor" uyarısı gösterir; uyumsuz paket yüklenmez.

---

## 4) İlerleme yedeği

- **Ayarlar › İlerleme yedeği › Yedeği dışa aktar**: `english-quest-yedek-YYYY-AA-GG.json` oluşturur; Dosyalar'a, Drive'a ya da kendine mesajla gönder.
- **Yedeği içe aktar**: başka telefonda/yeniden kurulumda bu dosyayı seç.
- Telefon değiştirmeden veya uygulamayı silmeden önce mutlaka yedek al (Android'de uygulamayı silmek kayıtları da siler).

**Eski web sürümündeki (Render) ilerlemeni taşımak istersen:** bilgisayarda eski siteyi Chrome'da aç → F12 › Console → `copy(localStorage.getItem('english-quest-v4'))` yaz, Enter. Panodaki metni Not Defteri'ne yapıştırıp `eski-ilerleme.json` olarak kaydet; bu dosyayı yeni uygulamada **Yedeği içe aktar** ile yükle. (Yalnızca o tarayıcıda kayıtlı ilerleme taşınır.)

Eski Render servisi, Supabase projesi ve Google OAuth istemcisi artık gerekmiyor; istersen kapatabilirsin.

---

## 5) Bilgisayarda deneme (isteğe bağlı)
Node.js 22+ kurulu olmalı.
```
npm install
npm run dev      # http://localhost:4319
```
Android Studio'n varsa: `npm run android` (projeyi açar, ▶ ile telefona kurar). Mac + Xcode varsa: `npm run ios`.

## 6) Sorun giderme
- **"Uygulama yüklenmedi" (Android):** imza farklı. Yedek al → eski uygulamayı sil → yeni APK'yı kur → yedeği yükle. Secrets'ın doğru eklendiğini kontrol et.
- **Ses çıkmıyor:** Android: Ayarlar › Sistem › Diller › Metin okuma çıkışı › Google'ın İngilizce sesini indir. iPhone: Ayarlar › Erişilebilirlik › Seslendirilen İçerik › Sesler › English. Sessiz anahtarını kontrol et.
- **Güncelleme denetlenemedi:** depo Public mi? Releases'te en son sürümde `update.json` var mı? `src/config.js` içindeki adres deponla aynı mı?
- **iPhone uygulaması açılmıyor:** 7 gün dolmuştur; Sideloadly ile yeniden yükle (uygulamayı silme).
