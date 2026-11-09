# dam-la 2.2 — Kurulum rehberi (App Store / Play Store olmadan)

Uygulama **telefonun içinde** çalışır. Sunucu veya açık bir bilgisayar gerekmez; ilerleme (XP, sorular, tekrar planı, ayarlar) telefonda kalıcı olarak kaydedilir. Yeni sürümler uygulamayı yeniden kurmadan internetten iner.
Kullanıcı profil açmaz: ilk açılışta cihaza **DL-XXXXX** biçiminde bir kimlik verilir (Ayarlar'da görünür). İsteğe bağlı **yönetici paneli** (bölüm 7) bu kimliklerle kullanıcıları canlı takip eder.

Derleme işini **GitHub Actions** yapar: senin bilgisayarına Android Studio, Xcode ya da Mac kurman gerekmez.

---

## 0) Bir kerelik hazırlık (10–15 dk, bilgisayardan)

### 0.1 Projeyi GitHub'a koy
1. (Yapıldı) Kod `katxjhuun/Eng-quest` deposunda. Yeni bir depoya taşırsan `.github` klasörü dahil tüm içeriği köke koy.
   - GitHub sitesinden: **Add file › Upload files** ile klasörleri sürükle-bırak. (`.github` gizli klasör olduğu için Windows'ta "gizli öğeleri göster" açık olsun.)
2. Depo **herkese açık (Public)** olmalı: telefondaki uygulama güncellemeleri buradan herkese açık bağlantıyla indirir. Projede artık gizli anahtar yok. (Settings › General › Danger Zone › Change visibility)

### 0.2 Android imza anahtarını ekle (çok önemli)
ZIP'teki `GIZLI_android_imza/GITHUB_SECRETS.txt` dosyasını aç. GitHub'da **Settings › Secrets and variables › Actions › New repository secret** ile oradaki 4 değeri ekle:
`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

> Bu klasörü **depoya yükleme**, ama kaybetme de (parola yöneticisine/güvenli bir yere kopyala). Her APK aynı anahtarla imzalanmazsa telefon yenisini eskisinin üzerine kurmaz.

### 0.3 (İsteğe bağlı) Web/PWA sürümünü aç
**Settings › Pages › Build and deployment › Source: GitHub Actions** seç. Her `main` güncellemesinde uygulama `https://katxjhuun.github.io/Eng-quest/` adresinde de yayınlanır (iPhone için en kolay yol, aşağıya bak).

### 0.4 İlk sürümü üret
**Actions › "Release (APK + uzaktan güncelleme)" › Run workflow** düğmesine bas. 5–8 dakika sonra **Releases** sayfasında `dam-la 2.2.0` oluşur; içinde:
- `dam-la-2.2.0.apk` — Android kurulum dosyası
- `dam-la-2.2.0-unsigned.ipa` — iPhone (Sideloadly) dosyası ("iOS IPA" iş akışı ekler)
- `web-bundle.zip` + `update.json` — uzaktan güncelleme dosyaları (dokunma)

---

## 1) Android'e kurulum

1. Telefonda Chrome ile deponun **Releases** sayfasını aç → en üstteki sürümden `.apk` dosyasına dokun ve indir.
2. İndirme bitince aç. "Bu kaynaktan uygulama yüklemeye izin ver" sorulursa **Ayarlar › İzin ver** (Chrome için bir kez).
3. Play Protect "tanınmayan geliştirici" uyarısı gösterirse **Ayrıntılar › Yine de yükle**.
4. Uygulamayı aç; ilk açılışta bir kez kalibrasyon (seviye, öğrenme biçimi, bölüm) sorulur. Sonradan **Ayarlar › Kalibrasyonu yeniden yap** ile değiştirilir.

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
1. **Releases** sayfasındaki `dam-la-x.y.z-unsigned.ipa` dosyasını indir. (Yoksa: **Actions › "iOS IPA (imzasız)" › Run workflow**; bitince **Artifacts** bölümünden `dam-la-iOS-ipa`.)
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
2. `package.json` içindeki `"version"` değerini artır: `2.2.0` → `2.2.1`.
3. Değişiklikleri GitHub'a gönder (commit/push veya web'den yükle).
4. **Actions › Release › Run workflow**. Bitti — telefonlar bir sonraki açılışta indirir. PWA sürümü de kendiliğinden güncellenir.

### Ne zaman yeniden kurulum (yeni APK/IPA) gerekir?
Yalnızca **telefon tarafını** değiştiren durumlarda: yeni bir Capacitor eklentisi, uygulama simgesi/adı, izinler veya Capacitor sürüm yükseltmesi. O zaman:
- `package.json` içinde `"nativeVersion"` ve `"minNativeVersion"` değerlerini birlikte artır (ör. `2.1.0`),
- Release'i çalıştır, yeni APK'yı eskisinin üzerine kur. Eski kabuktaki telefonlara uygulama "yeniden kurulum gerekiyor" uyarısı gösterir; uyumsuz paket yüklenmez.
- İstisna: yeni eklenti isteğe bağlıysa (kod, eklenti yoksa o özelliği sessizce atlıyorsa) yalnızca `nativeVersion` artırılır; eski kurulumlar yine güncelleme alır. 2.2.0'daki bildirim eklentisi böyledir: petler eski kurulumda da çalışır, bildirimler yeni APK/IPA ile gelir.

---

## 4) İlerleme yedeği

- **Ayarlar › İlerleme yedeği › Yedeği dışa aktar**: `dam-la-yedek-YYYY-AA-GG.json` oluşturur; Dosyalar'a, Drive'a ya da kendine mesajla gönder.
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

- **AI sesi (Kokoro) yavaş:** ilk kullanımda ~90 MB model iner; telefonda bir cümle birkaç saniyede üretilir. Üretilen sesler önbelleğe alınır, aynı cümle ikinci kez anında çalar. Hız önemliyse telefon sesini seç.
- **Pet bildirimleri gelmiyor:** Bildirimler 2.2.0 APK/IPA ile gelir; eski kurulumda petler çalışır ama bildirim gönderilemez. Telefon ayarlarında dam-la için bildirim izni açık olmalı. Pet bilgisi › “Acıkınca bildirim gönder”.
- **24 Kasım'da simge değişmedi:** iPhone simgeyi hemen değiştirir (kısa bir bildirim gösterir). Android uygulama arka plana alınınca değiştirir; bazı başlatıcılar bu sırada ana ekrandaki kısayolu kaldırabilir — uygulama çekmecesinden yeniden ekle. 25 Kasım'da normal simgeye döner.

---

## 7) Yönetici paneli (uygulamadan bağımsız)

Adres: **https://katxjhuun.github.io/Eng-quest/admin/** — telefonda da bilgisayarda da açılır, uygulamanın içinde yer almaz.

Gösterdikleri: her kullanıcının çevrimiçi/çevrimdışı durumu ve son görülmesi, İngilizce seviyesi, toplam ve konu bazında XP, doğru/yanlış/seri, öğrenme biçimi, bölüm, tema, **peti** (çizimi, adı, formu, can/yemek/enerji çubukları, ruh hali, flow, ölü olup olmadığı); çevrimiçiyse **o anda çözdüğü soru** (seçenekler ve doğru cevapla).
Yapabildiklerin: XP artır/azalt (konu seçerek), seviye ayarla (İngilizce A1–C2 ya da konu seviyesi), ödül gönder (simge, başlık, mesaj, XP, müzik önerili ödül penceresi), bildirim gibi görünen özel mesaj gönder, herkese toplu gönder, kullanıcıya yalnızca senin gördüğün bir isim ver.
**🐾 Pet sekmesi:** canı doldur, besle/sula, enerji ver, hepsini doldur, seviye düşürmeden canlandır, can/yemek/enerjiyi yüzde olarak ayarla, formu (1–6) ve yıldızı ayarla (üst forma geçişte evrim gösterisi oynar), adını ve türünü değiştir, flow ve dolaşmayı aç/kapat, pete konuşma balonuyla bir şey söylet (emote ile), tepki oynat (sevgi, sevinç, dans, irkilme, hüzün, uyuklama), peti sıfırlayıp yeni pet seçtir. **Herkese gönder › Pet bakımı** bütün petleri doldurur ve ölüleri canlandırır. Çevrimdışı kullanıcıya gönderilenler uygulama açılınca teslim edilir; bekleyenler iptal edilebilir.

### Bir kerelik Firebase kurulumu (ücretsiz Spark planı)
1. https://console.firebase.google.com — Google hesabında **2 adımlı doğrulama açık olmalı** (Firebase artık şart koşuyor).
2. **Proje ekle** › ad: `dam-la` › Google Analytics: kapalı.
3. **Build › Authentication › Get started** › Sign-in method: **Anonymous** ve **Google**'ı aç. **Settings › Authorized domains**'e `katxjhuun.github.io` ekle.
4. **Build › Realtime Database › Create database** › konum `europe-west1` › kilitli modda başlat › **Rules** sekmesine depodaki `database.rules.json` içeriğini yapıştır › Publish.
   - Yönetici yetkisi e-postayla değil **kullanıcı kimliğiyle (uid)** verilir; böylece herkese açık depoda e-posta adresi bulunmaz. Paneli bir kez Google ile aç: "yetki yok" mesajında uid yazar. **Realtime Database › Data**'da `admins` › `<uid>` = `true` kaydını ekle (birden çok yönetici olabilir).
5. **Project settings › General › Your apps › Web (</>)** › ad `dam-la` › çıkan `firebaseConfig` değerlerini `src/config.js` içindeki `FIREBASE_CONFIG`'e yaz (`apiKey`, `authDomain`, `databaseURL`, `projectId`, `appId`). Bu değerler gizli değildir; erişimi kurallar korur.
6. Değişikliği `main`'e gönder ve **Release**'i çalıştır: Pages paneli yayınlar, telefonlar yeni ayarı OTA ile alır.

### Güvenlik ve gizlilik
- Buluta yalnızca kimlik (DL-XXXXX), cihaz türü, uygulama sürümü, seviye/XP istatistikleri, pet durumu (tür, form, petin adı, çubuklar), öğrenme biçimi, bölüm/tema, çevrimiçi durumu ve o an ekrandaki soru gider. Ad, e-posta, telefon, konum, rehber, reklam kimliği, yazılan cevaplar **toplanmaz**. Firebase ayarı boşsa uygulama hiçbir şey göndermez. Uygulamada **Ayarlar › Kimliğin › Hangi bilgiler paylaşılıyor?** kullanıcıya bunu açıklar.
- Veritabanı kuralları (`database.rules.json`, `npm run rules` ile üretilir): her cihaz yalnızca kendi kaydını yazabilir/okuyabilir; her alanın türü, uzunluğu ve izinli değerleri denetlenir, bilinmeyen alan reddedilir; kullanıcı kendine XP/ödül gönderemez, geçmişi değiştiremez; yönetici yalnızca `admins` listesindeki Google hesabıdır ve bu liste uygulamadan değiştirilemez. `npm run test:rules` 49 izin/ret senaryosunu doğrular. **Kurallar değiştiğinde** (ör. 2.2.3'te pet eklendi) yeni `database.rules.json`'u Firebase konsolunda **Realtime Database › Rules**'a yapıştırıp Publish etmek gerekir.
- Panel: kullanıcı cihazından gelen her değer kaçışlanır (XSS yok), oturum yalnızca açık sekmede tutulur (sekme kapanınca çıkış), içerik güvenlik politikası (CSP) ve çerçeve içine gömülme engeli vardır; yönetici e-postası kullanıcılara gönderilmez.
- Uygulama: CSP ile yalnızca kendi betikleri çalışır; uzaktan güncelleme paketleri yalnızca bu deponun GitHub sürümlerinden ve SHA-256 özeti tutarsa kabul edilir; dış servislerden gelen bağlantılar yalnızca https ise kullanılır; içe aktarılan yedek dosyası doğrulanır.
- En büyük risk hesaplardır: **GitHub ve Google hesaplarında 2 adımlı doğrulamayı açık tut.** GitHub hesabını ele geçiren biri sahte güncelleme yayımlayabilir.
- `katxjhuun.github.io` adresindeki tüm GitHub Pages siteleri aynı kökeni paylaşır; bu adreste güvenmediğin başka bir proje yayımlama (o proje uygulamanın tarayıcı kayıtlarına erişebilir).
