# English Quest v20 — Google giriş + bulut ilerleme

Bu paket uygulamayı internete yayınlamak için hazırdır. Yayınlandıktan sonra Android Chrome veya iPhone Safari üzerinden URL ile açılabilir; bilgisayarınızda uygulama sunucusu açık tutmanız gerekmez.

## Özellikler
- Ayarlarda Google hesabıyla giriş/çıkış.
- 60 günlük imzalı HttpOnly oturum çerezi.
- Google `sub` değerine göre her kullanıcının kendi ilerlemesini kaydetme/geri yükleme.
- Supabase PostgreSQL REST API ile bulut kaydı; yerel çalıştırmada dosya tabanlı kayıt yedeği.
- Otomatik eşitleme ve ayarlarda açık eşitleme durumu.
- Render için `render.yaml`; health check `/healthz`.
- AI ses modeli yok; cihazın/Tarayıcının İngilizce sesini kullanır.

## En kolay hosted kullanım: Render + Supabase

### A. Projeyi GitHub'a koy
1. GitHub'da yeni, mümkünse private bir repository aç.
2. Bu ZIP'i aç ve tüm kaynak dosyalarını repository'ye yükle. `.env` veya `data/` gibi gizli/yerel dosyaları yükleme. `.gitignore` bunları dışarıda tutar.
3. `render.yaml`, `server.js`, `public/`, `database/`, `package.json` ve README dosyaları repository kökünde olmalı.

### B. Supabase ilerleme veritabanını oluştur
1. https://supabase.com adresinde ücretsiz bir proje oluştur.
2. Dashboard > SQL Editor bölümünde `database/supabase-schema.sql` dosyasındaki SQL'i çalıştır.
3. Project URL'yi ve server-side **Secret key**'i (yeni anahtar sistemi) kopyala. Eski `service_role` anahtarı da desteklenir.
4. Secret key'i asla frontend'e, HTML'e veya GitHub'a koyma. Yalnızca Render environment variable alanına gir.

### C. İlk yayını Render'da oluştur (bilgisayar sürekli açık kalmayacak)
1. https://render.com hesabına gir ve GitHub hesabını bağla.
2. New > **Web Service** seçip yüklediğin repository'yi bağla. İlk yayın sırasında Google ve Supabase ayarları henüz ekli olmayabilir; uygulamanın sayfası yine de açılır, giriş ve bulut eşitleme ayarları tamamlanana dek çalışmaz.
3. Build Command `npm install`, Start Command `npm start`, plan `Free` olsun. Render bir `https://<servis-adı>.onrender.com` URL'si verir.
4. Render Free servisi `PORT` değişkenini kendi sağlar. Projenin `server.js` dosyası bu portu kullanır. `/healthz` adresi 200 dönmeli.

### D. Google girişi ve bulut kaydını etkinleştir
1. https://console.cloud.google.com/ aç ve bir proje oluştur/seç.
2. Google Auth Platform / Branding alanında uygulama adını ve destek e-postasını doldur. Giriş için Gmail/Drive kapsamı isteme; standart profil/e-posta kimliği yeterlidir.
3. Clients > Create client > Web application seç.
4. Authorized JavaScript origins alanına Render URL'sini, örneğin `https://english-quest-abc.onrender.com`, **yol olmadan** ekle. Yerel test yapacaksan `http://localhost` ve `http://localhost:4319` da eklenebilir. Google Identity Services, bu origins listesiyle web sayfasını doğrular.
5. Oluşan Client ID'yi kopyala.
6. Render Dashboard > Environment bölümünde şu değişkenleri ekle:
   - `GOOGLE_CLIENT_ID`: Google'dan aldığın Web Client ID
   - `SUPABASE_URL`: Supabase Project URL
   - `SUPABASE_SECRET_KEY`: Supabase `sb_secret_...` anahtarı (yalnızca sunucuda tutulur)
   - `SESSION_SECRET`: uzun ve gizli rastgele değer (Blueprint kullanırsan `generateValue` bunu otomatik üretir).
7. Render'da Save, Build & Deploy / Manual Deploy ile yeniden yayınla.
8. Google Auth Platform uygulaması Testing durumundaysa kendi Google hesabını Test users listesine ekle.
9. Uygulamanın URL'sini telefonda açıp Ayarlar > Hesap ve ilerleme > Google ile giriş seçeneğini kullan.

Google yapılandırması: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid

### E. Telefona uygulama gibi ekle
- Android: Chrome > menü (⋮) > **Ana ekrana ekle** / **Uygulamayı yükle**.
- iPhone: Safari > Paylaş > **Ana Ekrana Ekle**.
- Bundan sonra kullanırken bilgisayarınızın açık olması veya uygulamayı indirmiş olması gerekmez; uygulama yayınlanan HTTPS URL'sinden çalışır.

## Ücretsiz planın sınırları
- Render Free servisi 15 dakika trafik almazsa uykuya geçebilir; ilk açılışta yaklaşık bir dakika bekleme ekranı olabilir.
- Supabase Free projesi 7 gün çok düşük etkinlikte otomatik duraklatılabilir. Durdurulursa Supabase Dashboard'dan yeniden başlatmak gerekir.
- Bu nedenle bu kurulum sıfır ücretle casual kullanım için uygundur, ancak kesintisiz/garantili 7/24 hizmet vaadi değildir. Gerçek ücret/limitler sağlayıcı panellerinde değişebilir.

## Yerel test (opsiyonel)
- Node.js 18 veya üzeri gerekir.
- `Baslat-Windows.bat` çalıştırıp `http://localhost:4319` aç.
- Yerelde Google oturumu için `.env` dosyasına `GOOGLE_CLIENT_ID` yaz. Bulut kaydı için ayrıca Supabase ayarlarını gir. Supabase ayarı yoksa Google ilerlemesi yerel dosyaya kaydedilir ve farklı cihazlara senkronize olmaz.

## Gizlilik
- Google girişinde yalnızca doğrulanmış profil kimliği, ad/e-posta/fotoğraf kullanılır. Gmail, Drive veya başka Google içeriklerine erişilmez.
- İlerleme Google hesabının değişmeyen `sub` değerine göre Supabase'e yazılır. Supabase secret key yalnızca Node.js sunucusunda bulunur.
- Oturum çerezi `HttpOnly`, `SameSite=Lax` ve HTTPS yayınında `Secure` özelliği taşır.
