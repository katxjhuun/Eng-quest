# English Quest 2.0 — İnceleme, düzeltmeler ve yenilikler

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
