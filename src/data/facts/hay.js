// Hayat becerileri bilgi tabloları — kaynaklar: SPK ve TCMB yatırımcı/finansal okuryazarlık kaynakları, USOM ve BTK Güvenli İnternet,
// DSÖ (WHO) beslenme ve fiziksel aktivite önerileri, DSÖ “Daha Güvenli Gıda için 5 Anahtar”, AFAD, T.C. bakanlık çağrı merkezleri.
import { L } from './engine.js';

const FIN = 'SPK Yatırımcı Bilgilendirme · TCMB finansal okuryazarlık';
const SIB = 'USOM · BTK Güvenli İnternet Merkezi';
const WHO = 'Dünya Sağlık Örgütü (DSÖ) önerileri';
const AFAD = 'AFAD · İçişleri Bakanlığı';

const FINANCE = L(`
Bütçe|Belirli bir dönemdeki gelir ve giderlerin önceden planlanması
Acil durum fonu|Beklenmedik giderler için ayrılan, kolay ulaşılabilir birikim
Bileşik faiz|Faizin, anaparayla birlikte önceki dönemlerde kazanılan faiz üzerinden de işlemesi
Basit faiz|Faizin yalnızca ilk anapara üzerinden hesaplanması
Enflasyon|Mal ve hizmet fiyatlarının genel düzeyinin sürekli artması
Anapara|Borç verilen ya da yatırılan ilk para tutarı
Kredi notu|Kişinin borçlarını zamanında ödeme geçmişine göre hesaplanan güvenilirlik puanı
Vadeli mevduat|Belirli bir süre çekilmemek şartıyla faiz getiren banka hesabı
Hisse senedi|Bir şirkete ortaklığı gösteren menkul kıymet
Tahvil|Devletin ya da şirketin borçlanmak için çıkardığı, faiz ödeyen borç senedi
Yatırım fonu|Birçok yatırımcının parasının uzmanlarca ortak bir portföyde yönetilmesi
Çeşitlendirme|Riski azaltmak için birikimi farklı yatırım araçlarına dağıtmak
Likidite|Bir varlığın değer kaybetmeden hızla nakde çevrilebilmesi
Brüt maaş|Vergi ve kesintiler düşülmeden önceki ücret
Net maaş|Vergi ve kesintiler düşüldükten sonra ele geçen ücret
KDV|Mal ve hizmetlerin satışında fiyata eklenen katma değer vergisi
Asgari ödeme|Kredi kartı borcunda, gecikmeye düşmemek için ödenmesi gereken en düşük tutar
Nakit akışı|Belirli bir sürede elde edilen para girişleri ile çıkışlarının bütünü
Varlık|Kişinin sahip olduğu ve değeri olan her şey
Net servet|Toplam varlıklardan toplam borçların çıkarılmasıyla kalan değer
Sigorta primi|Sigorta güvencesi için düzenli olarak ödenen ücret
Muafiyet (sigortada)|Hasarın, sigortalının kendisinin karşıladığı kısmı
Bireysel emeklilik|Emeklilik için devlet katkısıyla düzenli birikim yapılan gönüllü sistem
Döviz kuru|Bir ülke parasının başka bir ülke parası cinsinden değeri
Dürtüsel alışveriş|Önceden planlanmadan, anlık istekle yapılan satın alma
İhtiyaç|Yaşamı sürdürmek için gerekli olan mal ya da hizmet
İstek|Gerekli olmayan ama sahip olmak arzu edilen mal ya da hizmet
Fırsat maliyeti|Bir seçim yapıldığında vazgeçilen en iyi alternatifin değeri
Gecikme faizi|Borcun zamanında ödenmemesi nedeniyle eklenen ek faiz
Kefil|Borçlu ödemezse borcu ödemeyi üstlenen kişi
`);

const SECURITY = L(`
Oltalama (phishing)|Güvenilir bir kurum gibi davranıp e-postayla şifre ya da kart bilgisi isteyen dolandırıcılık
SMS oltalaması (smishing)|Kısa mesajdaki sahte bağlantıyla kişisel bilgi çalmaya çalışan dolandırıcılık
Sesli oltalama (vishing)|Telefonla arayıp banka ya da kurum çalışanı gibi davranarak bilgi isteyen dolandırıcılık
İki aşamalı doğrulama|Şifreye ek olarak telefona gelen kod gibi ikinci bir kanıt isteyen giriş yöntemi
Parola yöneticisi|Her hesap için güçlü ve farklı şifreleri güvenle saklayan uygulama
Kötü amaçlı yazılım|Cihaza zarar vermek ya da bilgi çalmak için yazılmış program
Fidye yazılımı|Dosyaları şifreleyip açmak için fidye isteyen kötü amaçlı yazılım
Güvenlik duvarı|Ağ trafiğini denetleyip izinsiz bağlantıları engelleyen sistem
HTTPS|Tarayıcı ile site arasındaki bağlantıyı şifreleyen güvenli protokol
Çerez|Sitelerin tarayıcıda sakladığı küçük veri dosyası
Yedekleme|Verilerin kaybolmaya karşı ayrı bir yere kopyalanması
Sosyal mühendislik|İnsanları kandırarak güvenlik önlemlerini aşmaya dayanan saldırı yöntemi
Siber zorbalık|Dijital ortamda bir kişiyi sürekli taciz etme, aşağılama ya da tehdit etme
Dijital ayak izi|İnternette bırakılan, kalıcı olabilen her türlü iz ve bilgi
Kimlik hırsızlığı|Başkasının kişisel bilgilerini onun adına işlem yapmak için ele geçirme
Yazılım güncellemesi|Güvenlik açıklarını kapatan ve hataları düzelten yeni sürüm yüklemesi
Halka açık Wi-Fi riski|Şifresiz ağlarda gönderilen bilgilerin başkalarınca görülebilmesi
Sahte (fake) haber|Gerçekmiş gibi sunulan yanlış ya da çarpıtılmış bilgi
`);

const PRODUCT = L(`
Pomodoro tekniği|25 dakika odaklanıp kısa mola verme döngüsüne dayanan çalışma yöntemi
Eisenhower matrisi|İşleri acil ve önemli olmalarına göre dört kutuya ayırma yöntemi
Pareto ilkesi (80/20)|Sonuçların büyük kısmının nedenlerin küçük bir kısmından kaynaklandığı gözlemi
SMART hedef|Belirli, ölçülebilir, ulaşılabilir, gerçekçi ve zamanlı hedef
Zaman bloklama|Takvimde belirli işler için önceden zaman dilimleri ayırma
Kanban|İşleri “yapılacak, yapılıyor, bitti” sütunlarında görselleştirme yöntemi
İki dakika kuralı|İki dakikadan kısa sürecek bir işi ertelemeden hemen yapma
Parkinson yasası|Bir işin, onun için ayrılan süreyi dolduracak kadar uzaması
Aralıklı tekrar|Öğrenilen bilgiyi giderek uzayan aralıklarla tekrar etme
Feynman tekniği|Bir konuyu çocuğa anlatır gibi basitçe açıklayarak öğrenme
Aktif hatırlama|Notlara bakmadan bilgiyi kendini sınayarak hatırlamaya çalışma
Zihin haritası|Ana fikri merkeze koyup ilişkili fikirleri dallar hâlinde çizme
Erteleme (prokrastinasyon)|Yapılması gereken bir işi gereksiz yere sürekli sonraya bırakma
Çoklu görev yanılgısı|Aynı anda birden çok işi yapmanın verimi düşürmesine rağmen verimli sanılması
`);

const FOOD = L(`
Ekmek|Karbonhidrat
Pirinç|Karbonhidrat
Makarna|Karbonhidrat
Patates|Karbonhidrat
Bulgur|Karbonhidrat
Yulaf|Karbonhidrat
Yumurta|Protein
Tavuk göğsü|Protein
Balık|Protein
Kırmızı et|Protein
Lor peyniri|Protein
Hindi eti|Protein
Zeytinyağı|Yağ
Tereyağı|Yağ
Ceviz|Yağ
Avokado|Yağ
Fındık|Yağ
`);

const NEED = L(`
Ev kirası|İhtiyaç
Elektrik ve su faturası|İhtiyaç
Temel gıda alışverişi|İhtiyaç
İşe gitmek için toplu taşıma|İhtiyaç
Reçeteli ilaç|İhtiyaç
Kışlık mont (hiç yoksa)|İhtiyaç
Okul kırtasiyesi|İhtiyaç
Yeni çıkan telefon modeli (eskisi çalışırken)|İstek
Marka spor ayakkabı koleksiyonu|İstek
Her gün dışarıda kahve|İstek
Oyun içi kozmetik satın alma|İstek
Konser bileti|İstek
Lüks çanta|İstek
Üçüncü bir dizi platformu aboneliği|İstek
`);

const COST = L(`
Kira|Sabit gider
Kredi taksiti|Sabit gider
Sigorta primi|Sabit gider
Aylık abonelik ücreti|Sabit gider
Okul taksidi|Sabit gider
Market alışverişi|Değişken gider
Elektrik faturası|Değişken gider
Yakıt|Değişken gider
Dışarıda yemek|Değişken gider
Giyim|Değişken gider
Hediye alışverişi|Değişken gider
`);

const RIGHT_WRONG = L(`
Her hesap için farklı ve uzun bir şifre kullanmak|Doğru
Aynı şifreyi bütün hesaplarda kullanmak|Yanlış
Önemli hesaplarda iki aşamalı doğrulamayı açmak|Doğru
SMS ile gelen doğrulama kodunu arayan “banka görevlisine” söylemek|Yanlış
Bilinmeyen kişiden gelen e-posta ekini hemen açmak|Yanlış
Bağlantıya tıklamadan önce gönderici adresini kontrol etmek|Doğru
Telefon ve bilgisayarı güncel tutmak|Doğru
Halka açık Wi-Fi’de internet bankacılığı yapmak|Yanlış
Önemli dosyaları düzenli olarak yedeklemek|Doğru
Kimlik ve kart fotoğrafını sosyal medyada paylaşmak|Yanlış
Gelir ve giderleri her ay yazıp takip etmek|Doğru
Kredi kartı borcunun hep yalnızca asgarisini ödemek|Yanlış
Birkaç aylık gider kadar acil durum fonu biriktirmek|Doğru
Tüm birikimi tek bir riskli yatırıma yatırmak|Yanlış
İndirim var diye ihtiyaç olmayan ürünü almak|Yanlış
Büyük alışverişten önce fiyat karşılaştırması yapmak|Doğru
Anlamadığı sözleşmeyi okumadan imzalamak|Yanlış
“Çok kısa sürede kesin yüksek kazanç” vaadine şüpheyle yaklaşmak|Doğru
Deprem anında “Çök, Kapan, Tutun” yapmak|Doğru
Deprem anında asansöre binmek|Yanlış
Gaz kokusu alınca elektrik düğmesine basmak|Yanlış
Gaz kokusu alınca pencereleri açıp vanayı kapatmak|Doğru
Dumanlı ortamda yere yakın eğilerek ilerlemek|Doğru
Prizlere çok sayıda çoklu priz takıp aşırı yüklemek|Yanlış
Islak elle elektrikli alet kullanmak|Yanlış
Evde deprem çantası hazır bulundurmak|Doğru
Çiğ tavuk ile salatayı aynı tahtada yıkamadan doğramak|Yanlış
Pişmiş yemeği uzun süre oda sıcaklığında bırakmak|Yanlış
Yemekten önce elleri sabunla yıkamak|Doğru
Buzdolabında çiğ eti alt rafta saklamak|Doğru
Uyumadan hemen önce uzun süre ekrana bakmak|Yanlış
Her gün benzer saatlerde yatıp kalkmak|Doğru
Uzun ekran çalışmasında ara ara uzağa bakmak|Doğru
Gün içinde yeterince su içmek|Doğru
Saatlerce hiç kalkmadan oturmak|Yanlış
`);

const NUMBERS = L(`
186|Elektrik arıza
187|Doğal gaz acil
185|Su arıza
182|MHRS (hastane randevusu)
184|SABİM (Sağlık Bakanlığı iletişim merkezi)
183|Aile, kadın, çocuk ve engelli sosyal destek hattı
112|Acil çağrı (ambulans, itfaiye, polis, jandarma)
114|Ulusal Zehir Danışma Merkezi
`);

const MC = L(`
DSÖ’ye göre yetişkinlerin haftada en az ne kadar orta şiddette fiziksel aktivite yapması önerilir?|150 dakika|30 dakika; 60 dakika; 600 dakika|DSÖ yetişkinlere haftada 150–300 dakika orta şiddette aktivite önerir.
DSÖ’ye göre yetişkinler için önerilen günlük tuz tüketimi en fazla ne kadardır?|5 gram|1 gram; 15 gram; 25 gram|Yaklaşık bir çay kaşığına denk gelir.
DSÖ’ye göre serbest şekerin günlük enerjideki payı en fazla ne kadar olmalıdır?|%10|%1; %30; %50|%5’in altı ek sağlık yararı sağlar.
Ekran yorgunluğuna karşı önerilen 20-20-20 kuralı nedir?|Her 20 dakikada bir, 20 saniye boyunca 20 feet (6 m) uzağa bakmak|Günde 20 saat ekrana bakmamak; 20 saniye göz kırpmamak; Ekranı 20 cm’den izlemek|Göz kaslarının dinlenmesini sağlar.
Buzdolabının iç sıcaklığı en fazla kaç °C olmalıdır?|4–5 °C|10 °C; 15 °C; 0 °C altı|Bakteri üremesini yavaşlatmak için 5 °C ve altı önerilir.
Dondurucuda gıdaların güvenle saklanması için önerilen sıcaklık nedir?|−18 °C veya daha düşük|0 °C; −5 °C; 4 °C|−18 °C’de mikroorganizmalar çoğalamaz.
Bakterilerin en hızlı çoğaldığı “tehlikeli sıcaklık aralığı” hangisidir?|5–60 °C|−20 – −10 °C; 70–100 °C; 100–120 °C|DSÖ: pişmiş yemekler bu aralıkta uzun süre bekletilmemelidir.
Pişmiş yemek oda sıcaklığında en fazla ne kadar bekletilmelidir?|2 saat|8 saat; 1 gün; 3 gün|DSÖ önerisi; sonra buzdolabına konmalıdır.
DSÖ’nün “Daha Güvenli Gıda için 5 Anahtar” önerisinden biri hangisidir?|Çiğ ve pişmiş gıdaları ayrı tutun|Etleri az pişirin; Yemekleri oda sıcaklığında çözdürün; Musluk suyunu hiç kullanmayın|Diğerleri: temiz tutun, iyice pişirin, güvenli sıcaklıkta saklayın, güvenli su ve ham madde kullanın.
Tavuk etinin güvenle piştiğini gösteren iç sıcaklık en az kaç °C’dir?|74 °C|40 °C; 55 °C; 100 °C|ABD Tarım Bakanlığı (USDA) güvenli iç sıcaklık değeri 165 °F (74 °C).
50/30/20 bütçe kuralında gelirin %50’si neye ayrılır?|Zorunlu ihtiyaçlara|İsteklere; Birikime; Yatırıma|%30 istekler, %20 birikim ve borç ödemesi için ayrılır.
Kimlik avı (phishing) e-postalarının en tipik özelliği hangisidir?|Acele ettirip şifre ya da kart bilgisi istemesi|Resmî logosunun olmaması; Kısa olması; Türkçe yazılmış olması|Bankalar şifreyi asla e-postayla istemez.
`);

export const HAY = {
  finans: { k: 'pair', d: 2, src: FIN, rows: FINANCE,
    q: a => `Kişisel finansta “${a}” ne demektir?`, r: b => `“${b}” hangi kavramın tanımıdır?`, e: (a, b) => `${a}: ${b}.` },
  siber: { k: 'pair', d: 2, src: SIB, rows: SECURITY,
    q: a => `Dijital güvenlikte “${a}” ne demektir?`, r: b => `“${b}” hangi kavramın tanımıdır?`, e: (a, b) => `${a}: ${b}.` },
  verim: { k: 'pair', d: 2, src: 'Cirillo, Covey, Allen ve öğrenme bilimi kaynakları', rows: PRODUCT,
    q: a => `“${a}” nedir?`, r: b => `“${b}” hangi yöntemin ya da kavramın tanımıdır?`, e: (a, b) => `${a}: ${b}.` },
  besin: { k: 'group', lbl: 'besin — besin ögesi', crit: 'en çok içerdiği besin ögesi', d: 1, src: `${WHO} · T.C. Sağlık Bakanlığı Türkiye Beslenme Rehberi`, rows: FOOD, extra: ['Vitamin'],
    q: a => `${a} en çok hangi besin ögesinin kaynağıdır?`, has: g => `Aşağıdakilerden hangisi temel olarak bir ${g.toLocaleLowerCase('tr')} kaynağıdır?`, not: g => `Aşağıdakilerden hangisi temel olarak bir ${g.toLocaleLowerCase('tr')} kaynağı DEĞİLDİR?`,
    e: (a, g) => `${a} başlıca ${g.toLocaleLowerCase('tr')} kaynağıdır.`, notE: g => `${g.toLocaleLowerCase('tr')} kaynağıdır` },
  besinp: { k: 'pick', d: 1, n: 130, src: WHO, rows: FOOD,
    has: g => `Aşağıdaki besinlerden hangisi en çok ${g.toLocaleLowerCase('tr')} içerir?`, e: (a, g) => `${a} → ${g.toLocaleLowerCase('tr')}.`, eOthers: w => `Diğerleri: ${w.map(x => `${x[0]} (${x[1].toLocaleLowerCase('tr')})`).join(', ')}.` },
  ihtiyac: { k: 'pick', crit: 'bütçedeki yeri', d: 1, n: 150, src: FIN, rows: NEED,
    has: g => (g === 'İhtiyaç' ? 'Bütçe yaparken aşağıdakilerden hangisi bir İHTİYAÇ sayılır?' : 'Bütçe yaparken aşağıdakilerden hangisi bir İSTEK sayılır?'),
    e: (a, g) => `${a} bir ${g.toLocaleLowerCase('tr')} sayılır.`, eOthers: w => `Diğerleri: ${w.map(x => `${x[0]} (${x[1].toLocaleLowerCase('tr')})`).join(', ')}.` },
  gider: { k: 'pick', crit: 'gider türü', d: 2, n: 140, src: FIN, rows: COST,
    has: g => `Aşağıdakilerden hangisi genellikle bir ${g.toLocaleLowerCase('tr')}dir?`, e: (a, g) => `${a} genellikle ${g.toLocaleLowerCase('tr')}dir: ${g === 'Sabit gider' ? 'her ay aşağı yukarı aynı tutardadır' : 'aydan aya değişir'}.` },
  dogru: { k: 'pick', crit: 'doğruluğu ve güvenliği', d: 1, n: 380, src: `${SIB} · ${FIN} · ${AFAD} · ${WHO}`, rows: RIGHT_WRONG,
    has: g => (g === 'Yanlış' ? 'Aşağıdaki davranışlardan hangisi YANLIŞ ya da risklidir?' : 'Aşağıdaki davranışlardan hangisi DOĞRU bir alışkanlıktır?'),
    e: (a, g) => `“${a}” ${g === 'Yanlış' ? 'risklidir' : 'doğru bir alışkanlıktır'}.`, eOthers: w => `Diğerleri: ${w.map(x => `${x[0]} (${x[1].toLocaleLowerCase('tr')})`).join('; ')}.` },
  hat: { k: 'pair', lbl: 'numara — hizmet', d: 2, src: 'T.C. bakanlıkların resmî çağrı merkezleri', rows: NUMBERS,
    q: a => `${a} numaralı hat hangi hizmeti verir?`, r: b => `${b} için aranacak numara hangisidir?`, e: (a, b) => `${a}: ${b}.` },
  bilgi: { k: 'mc', d: 2, src: `${WHO} · ${FIN}`, rows: MC },
};
