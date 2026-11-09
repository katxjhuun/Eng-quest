# dam-la 2.2.1 — Renkli petler ve yeni evrim hatları

Uzaktan güncellemeyle gelir.
- Petler artık siyah değil, kendi doğal renklerinde (yine sade, çizgisiz, yumuşak gölgeli). Yıldızlı/kozmik son formlar kaldırıldı.
- 🌱 Bitki: Tohumcuk › Filizcik › **Papatya** › **Lale** › **Kaktüs** › **Ulu Ağaç** (çiçekli)
- 🐣 Civciv: Yumurtacık › Pıtırcık › Tombiş › Kanatçık › **Tavus Yavrusu** › **Tavus Kuşu**
- 🐱 Kedi: Minnoş › Tekir › **Vaşak** › **Puma** › **Leopar** › **Kara Panter**
- 🐶 Köpek: Tosbik › Hav › **Çoban** › **Genç Kurt** › **Kurt** › **Alfa Kurt**
- Mevcut petler bulundukları aşamayı korur; yalnızca görünümleri yenilenir.

---

# dam-la 2.2.0 — Petler ve “dam-la Kedi” teması

Petler ve tema uzaktan güncellemeyle gelir. **Yalnızca “acıktım” bildirimleri** için yeni APK/IPA kurulmalı (bildirim eklentisi yerel koddur).

## Petler
- **4 tür, her biri 6 evrim formu** (hepsi özgün çizim, kedi-köpek örneklerindeki sade siluet tarzında, çizgisiz, yumuşak gölgeli):
  - (2.2.1’de renklendirildi ve evrim hatları yenilendi; güncel liste yukarıda.)
- **Seçim:** İlk açılışta, kalibrasyondan hemen sonra pet seçilir ve adı verilir. Mevcut kullanıcılara da bir kez sorulur.
- **Yuva:** Seviye çubuğu ile soru tipi düğmesinin arasında. Petin yuvası (saksı, yuva, minder, kulübe), adı, formu ve üç çubuk burada görünür:
  - **❤️ Can:** Yanlış cevaplar azaltır.
  - **Yemek:** Bitkide **💧 Su**. Her doğru cevap doldurur, zamanla azalır.
  - **⚡ Enerji:** Her soruda azalır, dinlenince ve gece uykusunda dolar.
- **Dolaşma:** Pet uygulamanın her yerinde dolaşır, soruların ve yazıların önünden geçer. Durduğu yeri düğmelerin üstü olmayacak şekilde seçer. Yuvaya dokununca yanına gelir.
- **Tepkiler:**
  - Doğru cevapta yemek yer ve sevinir. Yanlışta üzülür.
  - Çok soru çözülünce **karnı şişer**, mayışır, yavaş yürür, uzanır.
  - Dokununca bazen **kaçar**, bazen **dürtülmüş gibi** irkilir, bazen sevilmekten hoşlanır (kalpler). Basılı tutunca okşanır.
  - Arada konuşma balonuyla moral ve destek verir; seri yapınca, yanlıştan sonra, acıkınca ve flow modunda farklı konuşur. Sesli konuşmaz.
- **Saat:**
  - 23:00–06:00 arası uyur.
  - 06:00–07:30 arası hâlâ uyuyordur; soru çözünce uyanır.
  - 07:30–10:00 arası **sabah mahmurudur**.
  - 20:00–23:00 arası uykusu gelir ve uyuklar.
  - Yuvanın gökyüzü de akşam ve gece rengine döner.
- **Evrim:** Her seviye atlayışta (İngilizce veya herhangi bir konu) bir üst forma evrimleşir; parlayan siluet animasyonu oynar. Son formdan sonraki her seviye ⭐ ekler. Evrimde can, yemek ve enerji sınırları büyür.
- **Ölüm:** Can 0 olursa pet ölür ve iki seçenek çıkar:
  - **Canlandır:** Ölümün olduğu konunun seviyesi sıfırlanır, aynı pet döner. Eski XP’ne ulaşana kadar o konuda **2× XP telafi bonusu** alırsın.
  - **Yeni pet:** Eski pet anı köşesine uğurlanır, yeni pet baştan büyür. O konunun seviyesi düşmez; yalnızca o seviyedeki XP çubuğu sıfırlanır.
- **Yetenekler:**

| Pet | Güçlü yanı | Pasif | Aktif (enerji harcar) |
|---|---|---|---|
| Bitki | Büyük su deposu | Fotosentez: gündüz susuzluk ve enerji kaybı yarıda | Ayıkla: 2 yanlış şıkkı eler / yazmada cezasız 1 harf açar |
| Civciv | Ekstra enerji | Erken Kuş: sabah 06–12 doğrulara +%25 XP | Cik İpucu: cevabın ilk harfi + harf/kelime sayısı |
| Kedi | Ekstra can | Dokuz Can: günde bir kez ölümcül yanlışta 1 canla kurtulur | Pati Atla: soruyu cezasız ve seriyi bozmadan geçer |
| Köpek | Can + mama dengesi | Sadık Dost: her 5’li doğru seride +10 can | İz Sür: 1 yanlış şıkkı eler, o soruda can kaybını engeller |

- **Flow modu (🌊):**
  - Açıkken ödül pencereleri açılmaz.
  - Enerji her soruda değil, 10 soruda bir azalır.
  - Pet kafa bandıyla odaklanmış görünür ve destek verir.
  - Enerji çubuğunda dönen bir **direnç kalkanı** görünür.
- **Bildirimler (yeni APK/IPA ile):** Uygulama uzun süre açılmazsa telefona bildirim gelir: petin acıktığında, çok acıktığında, 1 gün ve 3 gün sonra. 22:00–09:30 arasında bildirim gönderilmez. Pet bilgisinden kapatılabilir.

## Tema
- **dam-la Kedi:** Logodaki pembe zemin, nane yeşili ve kalın siyah çizgili çıkartma görünümü (Ayarlar › Görünüm). Toplam 12 tema.

---

# dam-la 2.1.2 — Yönetici paneli bağlandı

Firebase projesi (`dam-la`, Avrupa sunucusu, ücretsiz Spark planı) kuruldu: anonim giriş + Google girişi, güvenlik kuralları yayında, uygulama ve panel bağlı. Uzaktan güncellemeyle gelir.

---

# dam-la 2.1.1 — Güvenlik ve gizlilik

Uzaktan güncellemeyle gelir (yeniden kurulum gerekmez).

| Bulunan risk | Önem | Düzeltme |
|---|---|---|
| Yönetici paneli, kullanıcı cihazından gelen bazı sayıları kaçışlamadan gösteriyordu; kötü niyetli biri sahte bir kayıtla panelde kod çalıştırıp yönetici oturumunu ele geçirebilirdi (XSS) | Yüksek | Paneldeki her değer kaçışlanıyor/sayıya zorlanıyor; veritabanı kuralları her alanın türünü ve uzunluğunu denetliyor; panelde içerik güvenlik politikası (CSP) ve çerçeveye gömme engeli var. Sahte verilerle test edildi |
| Yöneticinin e-postası her mesajla birlikte kullanıcının telefonuna gidiyordu | Orta | Mesajlarda yalnızca “yönetici” yazıyor |
| Yönetici e-postaları herkese açık depodaki kural dosyasındaydı; iki commit yazar e-postasıyla gönderilmişti | Orta | Yönetici yetkisi artık e-postayla değil Firebase kimliğiyle (`admins/<uid>`) veriliyor; e-postalar depo geçmişinden temizlendi, commit'ler GitHub'ın gizli noreply adresiyle |
| Panel ile web uygulaması aynı adreste olduğundan oturumları karışabilirdi; panel oturumu tarayıcıda kalıcıydı | Orta | Panel ayrı Firebase oturumu kullanıyor ve yalnızca açık sekmede tutuluyor |
| Kurallar her cihazın kendi kaydına istediği alanı/boyutu yazmasına izin veriyordu | Orta | Alan listesi, tür, uzunluk ve izinli değerler denetleniyor; kullanıcı kendine XP/ödül gönderemiyor, geçmişi değiştiremiyor; 36 senaryolu kural testi (`npm run test:rules`) |
| Uygulamada CSP yoktu | Orta | Yalnızca uygulamanın kendi betikleri çalışabiliyor, ağ istekleri bilinen servislerle sınırlı. Enjekte edilen kodun engellendiği test edildi |
| Güncelleme paketi herhangi bir https adresinden ve özetsiz kabul edilebiliyordu | Orta | Yalnızca bu deponun GitHub sürümlerinden ve SHA-256 özeti tutarsa kabul ediliyor |
| Müzik servislerinden gelen bağlantılar denetlenmiyordu (`javascript:` adresi olasılığı) | Düşük | Yalnızca https bağlantılar kullanılıyor |
| İçe aktarılan yedek dosyası türleri denetlenmeden yükleniyordu | Düşük | Sayılar, metinler ve soru durumları doğrulanıyor; zararlı yedekle test edildi |
| Bağımlılıklarda bilinen açıklar (grpc-js, sharp; uygulamaya girmiyorlardı) | Düşük | Güvenli sürümlere sabitlendi; `npm audit` (üretim): 0 açık |

Ayrıca **Ayarlar › Kimliğin › Hangi bilgiler paylaşılıyor?** bölümü kullanıcıya nelerin paylaşıldığını ve nelerin asla toplanmadığını açıklıyor.

Zaten iyi olanlar: ilerleme ve ses tamamen cihazda; reklam/analiz SDK'sı yok; güncelleme eklentisinin istatistik gönderimi kapalı; Android imza anahtarı depoda yok; düz HTTP ve karışık içerik kapalı.

---

# dam-la 2.1.0 — Yenilikler

> **Bu sürüm için telefona bir kez yeni APK/IPA kurulmalı** (ad, simge ve yeni yerel eklentiler değişti). Eskisinin üzerine kur; ilerleme silinmez. 2.0 kabuğundaki telefonlar 2.1 paketini indirmez, "yeniden kurulum gerekiyor" uyarısı gösterir.

## İstenenler ve durumu
| İstek | Durum |
|---|---|
| Adı **dam-la**, logosu gönderilen kedi görseli | ✅ Uygulama adı, ana ekran simgesi (Android/iPhone), açılış rengi, başlık |
| Pop quiz teması (mevcut görseli bozmadan) | ✅ Seçenekli sorular aynı kart tasarımında; eski “yazarak” akışı korunuyor |
| Profil açmadan kimlik + yönetici takibi | ✅ Her cihaz **DL-XXXXX** kimliği alır (Ayarlar'da, kopyalanabilir). Firebase ile canlı takip |
| 24 Kasım doğum günü teması | ✅ Logoya şapka + konfeti, pembe-altın tema, “İyi ki doğdun Damla!” şeridi, ödül penceresinde “HAPPY BIRTHDAY! 🎂”; ana ekran simgesi de şapkalı olur. 25 Kasım'da kendiliğinden normale döner (gece yarısı denetlenir) |
| Kalibrasyon genel kullanıma uygun + tüm bölümler | ✅ 20 seçenek: Genel kullanım + 19 bölüm (Tıp, Sağlık bilimleri, Eczacılık, Diş hekimliği, Biyomedikal, Bilgisayar, Elektrik-Elektronik, Makine, İnşaat, Mimarlık, Hukuk, İşletme/İktisat, Psikoloji, Eğitim, Uluslararası ilişkiler, Temel bilimler, Tasarım, Turizm, İletişim). Her bölüm kendi ileri seviye İngilizce terimlerini, anlamını, örnek cümlesini ve kullanım notunu öğretir |
| Kalibrasyon her açılışta sorulmasın, ayarlarda olsun | ✅ Yalnızca ilk açılışta; **Ayarlar › Kalibrasyonu yeniden yap** aynı menüyü açar |
| AI seslerinde çeşitlilik, güncel ve kaliteli | ✅ Telefonun tüm İngilizce sesleri + **Kokoro-82M** (2025, açık kaynak, cihazda çalışan sinirsel ses) 28 Amerikan/İngiliz kadın-erkek ses. İnternetsiz çalışır, üretilen sesler önbelleğe alınır |
| Mevcut tema adlandırılsın + 10 yeni tema | ✅ “Klasik Krem” + Gece Moru, Okyanus, Orman, Gün Batımı, Pembe Şeker, Nane Kedi, Kahve, Gece Mavisi, Yüksek Kontrast, Neon. Ayarlar'da önizlemeli seçim. Tüm temalarda yazı kontrastı otomatik denetlendi |
| Öğrenme biçimi ana ekranda tek düğme, her dokunuşta değişsin + Karışık | ✅ Yazarak → Pop Quiz → Dinleyerek → Karışık (her soru rastgele biçimde) |
| Pop quiz seçenekli + doğru/yanlış her durumda ayrıntılı açıklama | ✅ Açıklama, seçtiğin yanlış seçeneğin neden yanlış olduğunu, doğru cevabı, aynı anlamın A1–C2 merdivenini ve kaynağı gösterir |
| Matematik, fizik, kimya, biyoloji, coğrafya, tarih, ilk yardım, ehliyet, bilim, moda, sanat, hayat, felsefe sekmeleri; sıra Karışık → İngilizce → … | ✅ 13 konu × 12 soru; her soru resmî/kabul görmüş kaynağa dayanır (MEB müfredatı, BIPM SI Broşürü, IUPAC, DSÖ, ERC 2021 ve Sağlık Bakanlığı İlk Yardım Yönetmeliği, 2918 sayılı Karayolları Trafik Kanunu, NASA, NOAA, Resmî Gazete, Nobel Vakfı vb.). Açık kaynaklarda doğrudan kullanılabilir, Türkçe ve doğrulanmış bir soru bankası bulunamadığı için sorular kaynaklardan derlenerek yazıldı |
| Ödülde AI sesinin tebrik/teşekkür/cevabı okuması kaldırılsın | ✅ Ödül penceresi açıldığında hiçbir konuşma yapılmaz |
| Popüler müzik önerisi geliştirilsin | ✅ Türkiye/Dünya listesi seçimi, sıralamaya göre ağırlıklı seçim, yakın zamanda çıkanları tekrar etmeme, 30 sn önizleme, ♡ beğen, “Başka şarkı”, Spotify/YouTube Music'te aç, beğenilenler listesi |
| Doğru/yanlış sonrası XP'nin uçarak bara girmesi, sonra ödül penceresi | ✅ Artı yeşil / eksi kırmızı XP cevap kutusundan bara uçar, bar sonra güncellenir; ödül penceresi animasyon bittikten sonra açılır |
| Uygulamadan bağımsız yönetici paneli | ✅ `/admin/` — çevrimiçi/çevrimdışı, seviye, XP, o anki soru; XP/seviye artır-azalt, ödül, özel mesaj, toplu gönderim (KURULUM.md › 7) |

## Ayrıca
- Seçenekli İngilizce sorularda yanlış seçenekler artık aynı anlamın başka seviyelerinden gelir; soru gerçekten seviye farkını öğretir.
- Konu sekmelerinin her biri kendi seviyesini (40 XP'de bir) ve tekrar planını tutar; yanlış bilinen soru birkaç dakika sonra yeniden sorulur.
- Yönetici bir şey gönderdiğinde uygulamada bildirim şeridi çıkar; geçmiş mesajlar Ayarlar › Gelen kutusu'nda.
- Yedek dosyası adı `dam-la-yedek-…`; 2.0 yedekleri içe aktarılabilir.

---

# 2.0.0 — İnceleme, düzeltmeler ve yenilikler

Kaynak: GitHub `katxjhuun/Eng-quest` `main` (commit `977ba17`) + dışa aktarma paketindeki devir notu.

## A) Devir notundaki isteklerin kontrolü

| İstek (devir notu / zaman çizelgesi) | Önceki durum | 2.0 |
|---|---|---|
| Onboarding sonrası quiz; soru üstte, A1–C2 altı cevap kartı | Var | Var |
| Harf kutularıyla cevap girişi | Var | Var + Türkçe klavye düzeltmesi |
| Açılan kutu puan kazandırır, yanlışta yakınlık yüzdesi | Var | Var |
| İpucu rastgele kutuyu doldurur, kilitlenir; 6 ipucu | Var | Var |
| **İpucusuz çözüm daha fazla puan** | ⚠ Varsayılan %25 başlangıç harfi yüzünden *her* cevap "yardımlı" sayılıp 2 XP alıyordu; 4 XP pratikte alınamıyordu | ✅ Yardımsız 4, yalnız başlangıç harfleriyle 3, ipucuyla 2 XP |
| 5 yanlış hakkı | Var, ama kutular arasında geçince sayaç karışabiliyordu | ✅ Her kutunun hakkı ayrı ve doğru gösteriliyor |
| Kalibrasyon: seviye, öğrenme tarzı, hedef kaydedilir | ⚠ Kaydediliyordu ama seviyenin hiçbir etkisi yoktu | ✅ Seçilen seviyeye uygun ilk sorudan başlar; "Dinleyerek" seçilince otomatik seslendirme açılır |
| **Mobilde cevap kartları iki sütun** | ❌ Kural yazılmıştı ama sonradan gelen tasarım stili eziyordu; telefonda 3 sütun görünüyordu | ✅ Düzeltildi |
| Doğrusal ileri/geri gezinme, havuz sonu uyarısı, süresi gelen tekrarın sıfırlanması | Var | Var |
| Bilgisayar açık kalmadan Android/iPhone'dan erişim | Render'a bağlıydı (15 dk sonra uyku, Supabase 7 günde duraklama) | ✅ Uygulama telefonda, sunucusuz |
| İlerleme kaydı / cihazlar arası taşıma | Google + Supabase (yapılandırma gerektiriyordu) | ✅ Telefonda kalıcı kayıt + yedek dosyası ile taşıma |
| Telefonun eski uygulama kabuğunu göstermesi | Service worker "önce önbellek" kullandığı için tekrar ediyordu | ✅ PWA'da "önce ağ"; uygulamada sürümlü OTA |
| Ses: cihaz TTS | Tarayıcı sesi — **Android uygulama içinde (WebView) çalışmaz** | ✅ Uygulamada telefonun yerel TTS motoru |
| Soru havuzu: anlam eşdeğerliği kontrolü (devir notu madde 5) | Yapılmamıştı | ✅ Yapıldı, 3 soru düzeltildi (aşağıda) |

## B) Düzeltilen hatalar

1. **Mobil 2 sütun çalışmıyordu** (CSS sırası). Düzeltildi.
2. **Puanlama:** başlangıç harfleri her zaman açık olduğu için hiçbir cevap 4 XP almıyordu. Yeni kademeli puan.
3. **Başarısız soru cezası −36 XP** bir seviye eşiğinin tamamıydı; tek hatalı soru bir seviyeyi siliyordu. **−12 XP** yapıldı (`src/app.js` → `FAIL_PENALTY`).
4. **Türkçe klavye:** Shift+i "İ", ayrıca "ı" harfi sessizce siliniyordu; artık "i" sayılıyor.
5. **Android klavyesi (Gboard) harf çiftlemesi:** öneri/yazım sırasında kutu metni değiştirildiği için harfler çiftlenebiliyordu; artık yazım (composition) bitince temizleniyor. Otomatik düzeltme kapatıldı.
6. **iPhone'da ayar kutularına dokununca ekran yakınlaşıyordu** (16 px altı yazı). Düzeltildi.
7. **Kutu değiştirince yanlış/ipucu sayacı** başka kutunun değerini gösterebiliyordu. Düzeltildi.
8. **Soru etiketi** seviyeyi kullanıcının XP'sine göre gösteriyordu (B1 sorusu "A1" yazıyordu); artık sorunun kendi seviyesi.
9. **Boşluk doldurma cümleleri bozuk okunuyordu:**
   - "…needs to ______ the sensor." + "calibrate the sensor accurately" → "…the sensor accurately the sensor". C1/C2 cevapları düzeltildi.
   - "…should ______ the data." + "analyze the collected data" → "…data the data". Düzeltildi.
   - "…should be ______ under the same conditions." + "replicated under controlled conditions" → çift koşul. Cümle sadeleştirildi.
10. **Müzik ödülü sonsuz döngü riski:** aynı şarkı tekrar gelirse kendini sınırsız çağırıyordu; deneme sınırı eklendi. Çevrimdışıyken anlaşılır mesaj.
11. Her doğru kutuda tam ekran müzik penceresi: artık **Ayarlar › Ödül penceresi** ile "her kutu / soru bitince / kapalı" seçilebiliyor (varsayılan eskisi gibi).

## C) Yenilikler

- **Capacitor 8 mobil uygulama** (Android APK + iPhone IPA), App Store gerekmeden kurulum — `KURULUM.md`.
- **Kalıcı kayıt:** localStorage + işletim sisteminin silmediği yerel depo (Preferences); uygulama arka plana alınınca da kaydeder.
- **Yedek dışa/içe aktarma** (paylaşım menüsü / dosya).
- **Uzaktan güncelleme (OTA):** `@capgo/capacitor-updater` (manuel mod, kendi GitHub Releases'ın; üçüncü taraf hesap/istatistik yok), SHA-256 doğrulaması, bozuk sürümde otomatik geri dönüş, yerel kabuk sürüm uyumluluk kontrolü, Ayarlar'da güncelleme bölümü ve "Yeni sürüm hazır" şeridi.
- **Android geri tuşu** önce açık pencereyi kapatır.
- **GitHub Actions:** APK + OTA paketi (Release), imzasız IPA (iOS), PWA (GitHub Pages).

## D) Kaldırılanlar
Node sunucusu (`server.js`), Render, Supabase, Google girişi, sunucu erişim kodu. Eski veriler `KURULUM.md` §4'teki adımla taşınabilir.

## E) Test edilenler
Masaüstü Chrome'da telefon boyutunda (390×844): kalibrasyon, seviye başlangıcı, yanlış cevap/yakınlık, harf ipucu, 6 kutuyu çözme (Türkçe "İ" ile), puanlar (5×3 + 3 = 18 XP), ödül modu, sayfa yenilemede kalıcılık, yedek dışa aktarma → sıfırlama → içe aktarma. Yerel eklentiler taklit edilerek: güncelleme denetimi → indirme → planlama → "Yeniden başlat", yerel TTS, Android geri tuşu. Konsol hatası: yok.
**Test edilemeyen:** gerçek telefonda APK/IPA kurulumu (bu ortamda Android SDK'ya erişim yok) — ilk derleme GitHub Actions'ta yapılacak.
