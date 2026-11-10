// İlk yardım bilgi tabloları — kaynaklar: ERC Resüsitasyon ve İlk Yardım Kılavuzları 2021 (European Resuscitation Council),
// T.C. Sağlık Bakanlığı İlk Yardım Yönetmeliği ve Temel İlk Yardım Eğitimi kitabı, Ulusal Zehir Danışma Merkezi (114).
// Bu sorular eğitim amaçlıdır; gerçek acil durumda 112 aranır.
import { L, N } from './engine.js';

const ERC = 'ERC İlk Yardım ve Resüsitasyon Kılavuzu 2021';
const SB = 'T.C. Sağlık Bakanlığı Temel İlk Yardım Eğitimi';
const BOTH = `${ERC} · ${SB}`;

const ACT = L(`
Isı kaynaklı (termal) yanık|Yanık bölgeyi hemen en az 20 dakika serin akan suyla soğutmak|Buz, yoğurt, diş macunu gibi şeyler sürülmez.
Cilde kimyasal madde dökülmesi|Bölgeyi bol akan suyla uzun süre yıkamak
Göze kimyasal sıçraması|Gözü bol ve temiz suyla uzun süre yıkamak
Burun kanaması|Başı hafif öne eğip burnun yumuşak kısmını 10–15 dakika sıkmak|Baş geriye yatırılmaz; kan boğaza kaçar.
Kol ya da bacakta dış kanama|Yaranın üzerine doğrudan ve sürekli baskı uygulamak
Bilinci kapalı ama normal soluyan yetişkin|Derlenme (yan yatış) pozisyonu vermek ve solunumu izlemek
Bilinci kapalı ve normal solumayan yetişkin|112’yi arayıp hemen göğüs basısına başlamak
Yetişkinde tam hava yolu tıkanması (öksüremiyor, konuşamıyor)|5 sırta vuru ve 5 karın basısını dönüşümlü uygulamak
Kısmi hava yolu tıkanması (etkili öksürebiliyor)|Kişiyi öksürmeye teşvik etmek
Bebekte tam hava yolu tıkanması|5 sırta vuru ve 5 göğüs basısını dönüşümlü uygulamak|Bebeklerde karın basısı yapılmaz.
Soğukta kalıp titreyen, üşümüş kişi|Islak giysilerini değiştirip örterek yavaşça ısıtmak
Sıcak çarpması|Kişiyi serin ortama alıp vücudunu hızla soğutmak
Arı sokmasında iğnenin deride kalması|İğneyi en kısa sürede kazıyarak ya da çekerek çıkarmak
Ciddi alerjik tepki (anafilaksi) ve yanında oto-enjektör|Adrenalin oto-enjektörünü uyluğun dış yüzüne uygulamak
Bilinci açık, yutabilen ve kan şekeri düştüğünü söyleyen diyabetli|Glikoz tableti ya da şekerli içecek vermek
Nöbet (havale) geçiren kişi|Çevredeki sert ve tehlikeli eşyaları uzaklaştırıp başını korumak
İnme (felç) şüphesi|Yüz, kol ve konuşmayı kontrol edip hemen 112’yi aramak
Kalp krizi şüphesiyle göğüs ağrısı|Kişiyi rahat bir pozisyonda dinlendirip 112’yi aramak
Kırık şüphesi|Kırık bölgeyi bulunduğu şekilde hareketsiz hâle getirmek (tespit)
Omurga yaralanması şüphesi|Kişiyi gereksiz yere hareket ettirmeyip baş–boyun–gövde eksenini korumak
Ağızdan zehirlenme şüphesi|114 (UZEM) ya da 112’yi arayıp talimata göre davranmak, kusturmamak
Karbonmonoksit zehirlenmesi şüphesi|Ortamı havalandırıp kişiyi temiz havaya çıkarmak
Elektrik çarpması|Yaralıya dokunmadan önce elektrik akımını kesmek
Göze batmış yabancı cisim|Cismi çıkarmadan iki gözü de kapatıp sağlık kuruluşuna ulaştırmak|İki göz birlikte hareket ettiği için ikisi de kapatılır.
Yaraya saplanmış cisim|Cismi çıkarmadan çevresinden destekleyip sabitlemek
Kazayla yerinden çıkan kalıcı diş|Dişi kökünden tutmadan süt ya da serum fizyolojik içinde taşımak
Kopan parmak ya da uzuv|Temiz beze sarıp poşete koymak, poşeti buzlu suya yerleştirmek|Kopan parça buza doğrudan değdirilmez.
Köpek ısırığı|Yarayı sabun ve bol suyla yıkayıp sağlık kuruluşuna başvurmak|Kuduz riski değerlendirmesi gerekir.
Yılan sokması|Kişiyi sakinleştirip hareketsiz tutmak ve 112’yi aramak|Yara kesilmez, emilmez.
Sudan çıkarılan ve solumayan kişi|5 kurtarıcı solukla başlayıp temel yaşam desteği uygulamak
Şok belirtileri gösteren yaralı|Sırtüstü yatırıp üstünü örtmek ve 112’yi aramak
Bayılacağını hisseden kişi|Hemen oturtmak ya da uzandırmak
Astım krizi geçiren kişi|Kendi kurtarıcı inhalerini kullanmasına yardım etmek
Donmuş el ya da ayak|Bölgeyi ovmadan ılık suyla yavaşça ısıtmak
Küçük kesik ya da sıyrık|Temiz suyla yıkayıp temiz bir örtüyle kapatmak
Doğrudan baskıyla durmayan, hayatı tehdit eden uzuv kanaması|Yaranın üst kısmına turnike uygulamak
`);

const RIGHT_WRONG = L(`
Yanığı serin akan suyla soğutmak|Doğru uygulama
Yanık üzerine buz koymak|Yanlış uygulama
Yanığa yoğurt ya da diş macunu sürmek|Yanlış uygulama
Yanıkta oluşan kabarcıkları patlatmak|Yanlış uygulama
Burun kanamasında başı geriye yatırmak|Yanlış uygulama
Burun kanamasında başı öne eğip burnu sıkmak|Doğru uygulama
Nöbet geçirenin ağzına bir şey sokmak|Yanlış uygulama
Nöbet geçirenin hareketlerini zorla engellemek|Yanlış uygulama
Nöbet geçirenin başının altına yumuşak bir şey koymak|Doğru uygulama
Zehirlenen kişiyi kendi başına kusturmaya çalışmak|Yanlış uygulama
Yılan sokmasında yarayı kesip emmek|Yanlış uygulama
Bilinci kapalı kişiye su içirmek|Yanlış uygulama
Yaraya saplanmış bıçağı çıkarmak|Yanlış uygulama
Saplanmış cismi çevresinden sabitlemek|Doğru uygulama
Omurga yaralısını gereksiz yere hareket ettirmek|Yanlış uygulama
Donmuş bölgeyi ovarak ısıtmak|Yanlış uygulama
Kopan dişi kökünden tutup fırçalamak|Yanlış uygulama
Kopan dişi sütün içinde taşımak|Doğru uygulama
Elektrik çarpana akım kesilmeden çıplak elle dokunmak|Yanlış uygulama
Kırığı yerine oturtmaya çalışmak|Yanlış uygulama
Kırık bölgeyi hareketsiz hâle getirmek|Doğru uygulama
Göğüs basısını dirsekleri bükerek yapmak|Yanlış uygulama
Göğüs basısını sert bir zeminde yapmak|Doğru uygulama
Göğüs basılarında göğsün tamamen geri gelmesine izin vermek|Doğru uygulama
Bebeği ayaklarından tutup sallayarak tıkanmayı açmaya çalışmak|Yanlış uygulama
Bilinci kapalı, normal soluyan kişiyi yan yatırmak|Doğru uygulama
Turnikeyi kendi kendine ara ara gevşetmek|Yanlış uygulama
Turnikenin uygulandığı saati not etmek|Doğru uygulama
Kanayan yaraya doğrudan baskı yapmak|Doğru uygulama
Arı iğnesini hemen çıkarmak|Doğru uygulama
Göze kaçan kimyasalı bol suyla yıkamak|Doğru uygulama
Karbonmonoksit kokan ortamda elektrik düğmesine basmak|Yanlış uygulama
Önce olay yerinin güvenli olup olmadığını değerlendirmek|Doğru uygulama
Kendini tehlikeye atarak yaralıya ulaşmaya çalışmak|Yanlış uygulama
Yaralıya ilaç vermek|Yanlış uygulama
Hipotermili kişiye alkol içirmek|Yanlış uygulama
Sıcak çarpmasında kişiyi gölgeye ya da serin ortama almak|Doğru uygulama
`);

const SIGNS = L(`
Yüzün bir yanında düşme, kolda güçsüzlük, konuşma bozukluğu|İnme (felç)
Göğüste baskı tarzında, sol kola ya da çeneye yayılan ağrı|Kalp krizi
Soluk, soğuk ve nemli cilt; hızlı ve zayıf nabız|Şok
Dudak ve dilde şişme, nefes darlığı, yaygın kaşıntılı kabarıklık|Anafilaksi (ciddi alerjik tepki)
Titreme, sersemlik; ileri evrede titremenin durması|Hipotermi
Yüksek vücut sıcaklığı, sıcak ve kuru cilt, bilinç bulanıklığı|Sıcak çarpması
Diyabetli kişide terleme, titreme, ani huzursuzluk ve bilinç bulanıklığı|Hipoglisemi (kan şekeri düşüklüğü)
Sobalı odada birden fazla kişide baş ağrısı, baş dönmesi, bulantı|Karbonmonoksit zehirlenmesi
Hırıltılı ve ıslık sesli solunum, nefes vermede zorlanma|Astım krizi
Ellerini boğazına götürüyor, konuşamıyor ve öksüremiyor|Tam hava yolu tıkanması
Kısa süreli bilinç kaybı ve kendiliğinden hızla düzelme|Bayılma (senkop)
Bilinç kaybıyla birlikte istemsiz, ritmik kasılmalar|Nöbet (havale)
Deride kızarıklık ve ağrı var, kabarcık yok|Birinci derece yanık
Deride içi sıvı dolu kabarcıklar ve şiddetli ağrı|İkinci derece yanık
Deride beyaz ya da kahverengi, kuru ve ağrısız alan|Üçüncü derece yanık
Uzuvda şekil bozukluğu, anormal hareket ve şiddetli ağrı|Kırık
Eklemde zorlanma sonrası şişlik ve ağrı, şekil bozukluğu yok|Burkulma
Eklemde belirgin şekil bozukluğu ve hareket edememe|Çıkık
Soğukta kalan parmakta beyaz-gri, sert ve uyuşuk deri|Donma
`);

const TERMS = L(`
İlk yardım|Hastalık ya da kaza durumunda sağlık görevlileri gelene kadar ilaçsız olarak yapılan hayat kurtarıcı uygulamalar
Temel yaşam desteği|Solunumu ve dolaşımı durmuş kişide göğüs basısı ve kurtarıcı soluklarla yapılan uygulama
OED (otomatik eksternal defibrilatör)|Kalp ritmini analiz edip gerekirse elektrik şoku veren cihaz
Derlenme pozisyonu|Bilinci kapalı ama soluyan kişinin hava yolunu açık tutmak için verilen yan yatış pozisyonu
Turnike|Hayatı tehdit eden uzuv kanamasında yaranın üstüne sıkıca uygulanan bant
Karın basısı (Heimlich manevrası)|Tam hava yolu tıkanmasında göbeğin üstünden içeri ve yukarı yapılan ani baskı
Triyaj|Çok sayıda yaralı olduğunda yaralıları aciliyetine göre sınıflandırma
Koruma|Olay yerinde kendini, kazazedeyi ve çevredekileri tehlikelere karşı güvene almak
Bildirme|112’yi arayıp olayın yeri, türü ve yaralı sayısı hakkında bilgi vermek
Kurtarma|Olay yerinde yaralıya hızlı ve doğru ilk yardımı uygulamak
Bilinç kontrolü|Omuzlara hafifçe dokunup seslenerek kişinin tepki verip vermediğini anlamak
Baş-çene pozisyonu|Bir el alında, diğerinin parmakları çenede başı geriye yatırarak hava yolunu açma
Hava yolu tıkanması|Yabancı cisim ya da dilin solunum yolunu kısmen ya da tamamen kapatması
Şok|Dokulara yeterli kan gitmemesiyle gelişen, hayatı tehdit eden durum
Anafilaksi|Hızla gelişen, solunum ve dolaşımı etkileyen ciddi alerjik tepki
Hipotermi|Vücut iç sıcaklığının 35 °C’nin altına düşmesi
Hipoglisemi|Kan şekerinin normalin altına düşmesi
Senkop|Beyne giden kanın geçici olarak azalmasıyla oluşan kısa süreli bilinç kaybı
Burkulma|Eklemi bir arada tutan bağların zorlanması ya da yırtılması
Çıkık|Eklemi oluşturan kemik uçlarının birbirinden ayrılması
Atel|Kırık ya da yaralı bölgeyi hareketsiz tutmak için kullanılan destek malzemesi
Kapalı kırık|Kemiğin kırılıp deri bütünlüğünün bozulmadığı kırık
Açık kırık|Kemik uçlarının deriyi yırttığı ya da yaranın kırığa ulaştığı kırık
Pansuman|Yaranın temizlenip uygun bir örtüyle kapatılması
`);

const TRIAGE = L(`
Solunum sayısı dakikada 30’un üzerinde olan yaralı|kırmızı
El bileğinde nabzı alınamayan yaralı|kırmızı
Basit komutlara uyamayan yaralı|kırmızı
Hava yolu açılınca solumaya başlayan yaralı|kırmızı
Yürüyemeyen ama soluması, nabzı ve bilinci yerinde olan bacak kırıklı yaralı|sarı
Bilinci açık, komutlara uyan ama kalçası yaralı olduğu için yürüyemeyen yaralı|sarı
Sırtındaki yara nedeniyle kalkamayan, solunumu normal ve bilinci açık yaralı|sarı
Kendi kendine yürüyebilen kolu kırık yaralı|yeşil
Yürüyerek toplanma alanına gelen, yüzünde sıyrıklar olan yaralı|yeşil
Ayakta duran ve konuşan, elinde kesik olan yaralı|yeşil
Hava yolu açıldığı hâlde solumayan yaralı|siyah
`);
const TRI_Q = { kırmızı: 'KIRMIZI (hemen müdahale)', sarı: 'SARI (ertelenebilir)', yeşil: 'YEŞİL (hafif yaralı)', siyah: 'SİYAH (solumuyor)' };
const TRI_WHY = { kırmızı: 'solunumu 30/dk üstünde, nabzı yok ya da komutlara uymuyorsa kırmızıdır', sarı: 'yürüyemiyor ama solunum, nabız ve bilinç yerindeyse sarıdır', yeşil: 'yürüyebilen her yaralı yeşildir', siyah: 'hava yolu açıldığı hâlde solumuyorsa siyahtır' };

const MC = L(`
Yetişkinde temel yaşam desteğinde göğüs basısı ve kurtarıcı soluk oranı kaçtır?|30:2|15:2; 5:1; 30:5|ERC 2021’e göre yetişkinde 30 göğüs basısını 2 kurtarıcı soluk izler.
Yetişkinde göğüs basısı dakikada kaç hızında yapılır?|100–120|60–80; 80–100; 140–160|ERC 2021: dakikada 100–120 bası.
Yetişkinde göğüs basısı derinliği ne kadar olmalıdır?|5–6 cm|2–3 cm; 3–4 cm; 8–10 cm|ERC 2021: en az 5 cm, en fazla 6 cm.
Bebekte göğüs basısı derinliği yaklaşık ne kadar olmalıdır?|4 cm|1 cm; 2 cm; 6 cm|Göğüs ön-arka çapının üçte biri, bebekte yaklaşık 4 cm.
Çocukta göğüs basısı derinliği yaklaşık ne kadar olmalıdır?|5 cm|2 cm; 3 cm; 8 cm|Göğüs ön-arka çapının üçte biri, çocukta yaklaşık 5 cm.
Çocukta temel yaşam desteğine kaç kurtarıcı solukla başlanır?|5|1; 2; 10|ERC 2021 pediatrik kılavuzu: önce 5 kurtarıcı soluk verilir.
Normal solunum en fazla kaç saniye bakılıp dinlenerek değerlendirilir?|10 saniye|3 saniye; 30 saniye; 1 dakika|Bak-dinle-hisset en fazla 10 saniye sürer.
Bir kurtarıcı soluk yaklaşık kaç saniyede verilir?|1 saniye|3 saniye; 5 saniye; 10 saniye|Göğsün kalktığı görülecek kadar, yaklaşık 1 saniyede verilir.
Termal yanıkta soğutma en az ne kadar sürmelidir?|20 dakika|1 dakika; 5 dakika; 2 saat|ERC 2021: en az 20 dakika serin akan suyla soğutma.
Burun kanamasında burnun yumuşak kısmı ne kadar süre sıkılmalıdır?|10–15 dakika|30 saniye; 1–2 dakika; 1 saat|ERC 2021: 10–15 dakika kesintisiz baskı.
Türkiye’de tüm acil durumlar için aranan tek numara hangisidir?|112|110; 155; 177|112 Acil Çağrı Merkezi; polis, itfaiye ve ambulans tek numarada birleştirildi.
Ulusal Zehir Danışma Merkezi’nin (UZEM) numarası hangisidir?|114|112; 115; 184|UZEM 7/24 hizmet verir.
Yetişkinde dinlenme hâlindeki normal solunum sayısı dakikada yaklaşık kaçtır?|12–20|4–6; 30–40; 50–60|Sağlıklı yetişkinde dakikada 12–20 solunum normaldir.
Yetişkinde dinlenme hâlindeki normal nabız dakikada yaklaşık kaçtır?|60–100|20–40; 120–160; 180–200|Dinlenmede 60–100 atım/dk normal kabul edilir.
Yetişkinde tam hava yolu tıkanmasında kaç sırta vuru yapılır?|5|1; 3; 10|5 sırta vuru ardından 5 karın basısı.
OED cihazı geldiğinde ilk yapılacak şey nedir?|Cihazı açıp sesli talimatları izlemek|Göğüs basısını tamamen bırakıp beklemek; Yaralıyı oturur pozisyona getirmek; Elektrotları giysinin üstüne yapıştırmak|OED açıldığında ne yapılacağını sesli olarak söyler.
OED şok verirken ne yapılmalıdır?|Kimse yaralıya dokunmamalıdır|Göğüs basısına devam edilmelidir; Yaralının elinden tutulmalıdır; Yaralıya su dökülmelidir|Şok sırasında dokunan kişi de akıma maruz kalabilir.
Hipotermi vücut iç sıcaklığının kaç dereceden düşük olmasıdır?|35 °C|38 °C; 37 °C; 30 °C|35 °C altı hipotermi kabul edilir.
Kopan bir uzvun ne kadar süre içinde sağlık kuruluşuna ulaştırılması hedeflenir?|Olabildiğince hızlı, en geç birkaç saat içinde|Bir hafta içinde; Ertesi gün; Fark etmez|Parçanın soğuk korunarak hızla ulaştırılması yeniden dikilme şansını artırır.
İnme belirtileri için kullanılan “FAST” kısaltmasındaki “T” neyi hatırlatır?|Zamanı (hemen 112’yi aramayı)|Tansiyonu ölçmeyi; Tuzlu su vermeyi; Termometreyi|Face, Arms, Speech, Time: yüz, kol, konuşma, zaman.
112 aranırken verilmesi gereken ilk ve en önemli bilgi hangisidir?|Olayın tam adresi|Arayanın mesleği; Yaralının kan grubu; Olayın kimin hatası olduğu|Ekip önce yeri bulmalıdır; telefon da 112 kapatmadan kapatılmaz.
Bebeklerde göğüs basısı hangi parmaklarla yapılır (tek kurtarıcı)?|İki parmakla|Avuç içiyle; Yumrukla; Tek parmakla|Tek kurtarıcı göğüs ortasına iki parmakla bası yapar.
Yetişkinde dokuzlar kuralına göre bir kolun tamamı vücut yüzeyinin yüzde kaçıdır?|%9|%1; %18; %36|Wallace dokuzlar kuralı: baş-boyun %9, her kol %9, her bacak %18, gövde önü %18, gövde arkası %18, genital bölge %1.
Yetişkinde dokuzlar kuralına göre bir bacağın tamamı vücut yüzeyinin yüzde kaçıdır?|%18|%9; %27; %36|Her bacak %18 sayılır.
Küçük ve dağınık yanıkların yüzdesi tahmin edilirken kişinin avuç içi (parmaklar dâhil) yaklaşık yüzde kaç sayılır?|%1|%5; %9; %18|Kişinin kendi avuç içi vücut yüzeyinin yaklaşık %1’idir.
Göğüs basısı yetişkinde göğsün neresine uygulanır?|Göğüs kemiğinin alt yarısına (göğsün ortası)|Karnın üst kısmına; Sol göğsün üstüne; Boynun hemen altına|Eller göğsün ortasına, göğüs kemiğinin alt yarısına konur.
`);

export const ILK = {
  eylem: { k: 'pair', d: 1, src: BOTH, rows: ACT,
    q: a => `İlk yardımda şu durumda doğru uygulama hangisidir: ${a}?`, r: b => `“${b}” hangi durumda yapılması gereken ilk yardım uygulamasıdır?`, e: (a, b) => `${a} → ${b}.` },
  dogru: { k: 'pick', d: 1, n: 230, src: BOTH, rows: RIGHT_WRONG,
    has: g => (g === 'Yanlış uygulama' ? 'Aşağıdakilerden hangisi ilk yardımda YANLIŞ bir uygulamadır?' : 'Aşağıdakilerden hangisi ilk yardımda DOĞRU bir uygulamadır?'),
    e: (a, g) => `“${a}” ${g === 'Yanlış uygulama' ? 'yanlıştır; zarar verebilir' : 'doğru bir uygulamadır'}.`, eOthers: w => `Diğer şıklar: ${w.map(x => `${x[0]} (${x[1].toLocaleLowerCase('tr')})`).join('; ')}.` },
  belirti: { k: 'pair', d: 2, src: BOTH, rows: SIGNS,
    q: a => `“${a}” belirtileri en çok hangi durumu düşündürür?`, r: b => `Aşağıdakilerden hangisi ${b.toLocaleLowerCase('tr')} belirtisidir?`, e: (a, b) => `${b}: ${a.charAt(0).toLocaleLowerCase('tr') + a.slice(1)}.` },
  kavram: { k: 'pair', d: 2, src: SB, rows: TERMS,
    q: a => `İlk yardımda “${a}” neyi ifade eder?`, r: b => `“${b}” tanımı hangi kavrama aittir?`, e: (a, b) => `${a}: ${b}.` },
  triyaj: { k: 'pick', d: 3, n: 300, src: `${SB} · START triyaj yöntemi`, rows: TRIAGE,
    has: g => `Çok sayıda yaralının olduğu bir olayda START triyajına göre aşağıdakilerden hangisi ${TRI_Q[g]} olarak etiketlenir?`,
    e: (a, g) => `START: ${TRI_WHY[g]}. “${a}” → ${g}.`, eOthers: w => `Diğerleri: ${w.map(x => `${x[0].charAt(0).toLocaleLowerCase('tr') + x[0].slice(1)} → ${x[1]}`).join('; ')}.` },
  durum: { k: 'pick', d: 2, n: 150, src: BOTH, rows: ACT.map(([a, b, n]) => [b, a, n]),
    has: g => `${g}: aşağıdakilerden hangisi doğru ilk yardım uygulamasıdır?`, e: (a, g, n) => `${g} → ${a}.${n ? ' ' + n : ''}` },
  belirtip: { k: 'pick', d: 2, n: 150, src: BOTH, rows: SIGNS.map(([a, b]) => [a, b]),
    has: g => `Aşağıdaki tablolardan hangisi en çok “${g}” durumunu düşündürür?`, e: (a, g) => `${g}: ${a.charAt(0).toLocaleLowerCase('tr') + a.slice(1)}.` },
  sayi: { k: 'mc', d: 2, src: BOTH, rows: MC },
};
