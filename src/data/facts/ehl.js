// Ehliyet (trafik, araç tekniği, trafik adabı) bilgi tabloları — kaynaklar: 2918 sayılı Karayolları Trafik Kanunu,
// Karayolları Trafik Yönetmeliği, KGM Trafik İşaretleri El Kitabı, MEB Trafik ve Çevre Bilgisi / Araç Tekniği modülleri.
import { L } from './engine.js';

const KTK = '2918 sayılı Karayolları Trafik Kanunu · Karayolları Trafik Yönetmeliği';
const KGM = 'KGM Trafik İşaretleri El Kitabı · Karayolları Trafik Yönetmeliği';
const TEK = 'MEB Araç Tekniği modülleri';
const ADAB = 'MEB Trafik ve Çevre Bilgisi · Trafik adabı';

const SIGNS = L(`
Sola tehlikeli viraj|Tehlike uyarı işareti
Sağa tehlikeli viraj|Tehlike uyarı işareti
Kaygan yol|Tehlike uyarı işareti
Gevşek malzemeli yol|Tehlike uyarı işareti
Okul geçidi|Tehlike uyarı işareti
Yol çalışması|Tehlike uyarı işareti
Vahşi hayvanlar geçebilir|Tehlike uyarı işareti
Evcil hayvanlar geçebilir|Tehlike uyarı işareti
Kontrolsüz demiryolu geçidi|Tehlike uyarı işareti
Kontrollü demiryolu geçidi|Tehlike uyarı işareti
Her iki taraftan daralan kaplama|Tehlike uyarı işareti
İki yönlü trafik|Tehlike uyarı işareti
Tehlikeli eğim (iniş)|Tehlike uyarı işareti
Tehlikeli eğim (çıkış)|Tehlike uyarı işareti
Gizli buzlanma|Tehlike uyarı işareti
Kasisli yol|Tehlike uyarı işareti
Yan rüzgâr|Tehlike uyarı işareti
Bisiklet geçebilir|Tehlike uyarı işareti
Dönel kavşak yaklaşımı|Tehlike uyarı işareti
Kontrolsüz kavşak|Tehlike uyarı işareti
Işıklı işaret cihazı|Tehlike uyarı işareti
Tünel|Tehlike uyarı işareti
Dur|Trafik tanzim işareti
Yol ver|Trafik tanzim işareti
Girişi olmayan yol|Trafik tanzim işareti
Taşıt trafiğine kapalı yol|Trafik tanzim işareti
Sola dönülmez|Trafik tanzim işareti
Sağa dönülmez|Trafik tanzim işareti
U dönüşü yapılmaz|Trafik tanzim işareti
Öndeki taşıtı geçmek yasaktır|Trafik tanzim işareti
Azami hız sınırlaması|Trafik tanzim işareti
Ses cihazları kullanmak yasaktır|Trafik tanzim işareti
Gümrük|Trafik tanzim işareti
Karşıdan gelene yol ver|Trafik tanzim işareti
İleriden sağa mecburi yön|Trafik tanzim işareti
Mecburi bisiklet yolu|Trafik tanzim işareti
Mecburi yaya yolu|Trafik tanzim işareti
Ada etrafında dönünüz|Trafik tanzim işareti
Hastane|Bilgi işareti
İlk yardım|Bilgi işareti
Akaryakıt istasyonu|Bilgi işareti
Otobüs durağı|Bilgi işareti
Çıkmaz yol|Bilgi işareti
Otoyol başlangıcı|Bilgi işareti
Tek yönlü yol|Bilgi işareti
Telefon|Bilgi işareti
Kamp yeri|Bilgi işareti
Lokanta|Bilgi işareti
Tamirhane|Bilgi işareti
Polis|Bilgi işareti
`);

const PARTS = L(`
Buji|Ateşleme sistemi
Endüksiyon bobini|Ateşleme sistemi
Distribütör|Ateşleme sistemi
Radyatör|Soğutma sistemi
Termostat|Soğutma sistemi
Su pompası|Soğutma sistemi
Antifriz|Soğutma sistemi
Radyatör fanı|Soğutma sistemi
Yağ pompası|Yağlama sistemi
Yağ karteri|Yağlama sistemi
Yağ filtresi|Yağlama sistemi
Enjektör|Yakıt sistemi
Yakıt pompası|Yakıt sistemi
Yakıt filtresi|Yakıt sistemi
Debriyaj (kavrama)|Güç aktarma organları
Vites kutusu|Güç aktarma organları
Diferansiyel|Güç aktarma organları
Kardan mili|Güç aktarma organları
Fren balatası|Fren sistemi
Fren diski|Fren sistemi
Fren hidroliği|Fren sistemi
Fren merkezi (ana silindir)|Fren sistemi
Amortisör|Süspansiyon sistemi
Helezon yay|Süspansiyon sistemi
Makas (yaprak yay)|Süspansiyon sistemi
Rotil|Direksiyon sistemi
Direksiyon kutusu|Direksiyon sistemi
Rot başı|Direksiyon sistemi
Akü|Elektrik sistemi
Alternatör (şarj dinamosu)|Elektrik sistemi
Marş motoru|Elektrik sistemi
Sigorta|Elektrik sistemi
`);

const PARTFN = L(`
Termostat|Motor soğukken suyun radyatöre gitmesini engelleyip motorun çabuk ısınmasını sağlar
Radyatör|Motordan gelen sıcak soğutma suyunu havayla soğutur
Buji|Benzinli motorda silindirdeki yakıt–hava karışımını kıvılcımla ateşler
Kızdırma bujisi|Dizel motorun soğukta ilk çalışmasını kolaylaştırır
Akü|Elektrik enerjisini kimyasal enerji olarak depolar
Alternatör|Motor çalışırken elektrik üretip aküyü şarj eder
Marş motoru|Motora ilk hareketi vererek çalıştırır
Debriyaj|Motorun gücünü vites kutusuna iletir ya da keser
Diferansiyel|Virajda iç ve dış tekerleklerin farklı hızlarda dönmesini sağlar
Amortisör|Yayların salınımını sönümleyip aracın yola tutunmasını artırır
Yağ filtresi|Motor yağındaki pislikleri tutar
Hava filtresi|Silindirlere giden havayı tozdan arındırır
Antifriz|Soğutma suyunun donmasını önler ve kaynamasını geciktirir
Turbo şarj|Egzoz gazının enerjisiyle silindirlere daha fazla hava basar
Katalitik konvertör|Egzoz gazındaki zararlı gazları azaltır
ABS|Ani frende tekerleklerin kilitlenmesini önleyerek direksiyon hâkimiyetini korur
ESP|Savrulmayı önlemek için tekerleklere ayrı ayrı fren uygular
Hava yastığı|Çarpışmada yolcuyu darbeye karşı yastıklar
Sigorta|Elektrik devresini aşırı akıma karşı korur
Rot ayarı|Tekerleklerin birbirine göre doğru açıda durmasını sağlar
Balans ayarı|Tekerleğin titreşimsiz dönmesi için ağırlığını dengeler
Takometre|Motor devrini (devir/dakika) gösterir
Hararet göstergesi|Motor soğutma suyunun sıcaklığını gösterir
Egzoz susturucusu|Egzoz gazının çıkardığı gürültüyü azaltır
Volan|Motorun düzgün dönmesine yardım eder ve marş dişlisini taşır
Krank mili|Pistonların doğrusal hareketini dönme hareketine çevirir
`);

const LIGHTS = L(`
Yağ basıncı uyarı lambası (kırmızı yağdanlık)|Motor yağ basıncı düşmüştür; motor güvenli şekilde hemen durdurulmalıdır
Şarj (akü) uyarı lambası|Şarj sisteminde arıza vardır; akü şarj olmuyordur
Hararet uyarı lambası|Motor aşırı ısınmıştır
Fren uyarı lambası|El freni çekilidir ya da fren hidroliği azalmıştır
ABS uyarı lambası|ABS sisteminde arıza vardır
Motor arıza lambası|Motor yönetim sisteminde arıza algılanmıştır
Hava yastığı uyarı lambası|Hava yastığı sisteminde arıza vardır
Emniyet kemeri uyarısı|Emniyet kemeri takılmamıştır
Kızdırma lambası|Dizel motorda kızdırma bujileri ısınmaktadır
Mavi far göstergesi|Uzun huzmeli farlar açıktır
Lastik basıncı uyarı lambası|Lastiklerden birinin basıncı düşmüştür
Yakıt rezerv lambası|Yakıt azalmıştır
Kapı açık uyarısı|Kapılardan biri tam kapanmamıştır
`);

const TERMS = L(`
Geçiş üstünlüğü|Ambulans, itfaiye gibi araçların görev sırasında ses ve ışıklı işaretle öncelikle geçme hakkı
Şerit|Taşıt yolunun, taşıtların düzenli akışı için çizgilerle ayrılmış bölümü
Banket|Taşıt yolu kenarı ile şev arasındaki, taşıtların gerektiğinde duraklayabildiği kısım
Refüj|Bölünmüş yolda karşı yönlerden gelen trafiği ayıran ada
Kavşak|İki ya da daha fazla yolun kesiştiği ya da birleştiği ortak alan
Dönel kavşak|Trafiğin ortadaki bir ada çevresinde döndüğü kavşak
Bölünmüş yol|Gidiş ve geliş yönleri refüj ya da benzeri ayırıcıyla ayrılmış yol
Otoyol|Yalnızca motorlu taşıtlara açık, erişme kontrollü, giriş-çıkışları belirli yol
Hemzemin geçit|Demiryolu ile karayolunun aynı seviyede kesiştiği yer
Duraklama|Trafik zorunluluğu olmadan yolcu indirmek-bindirmek gibi nedenlerle aracın kısa süre durdurulması
Park etme|Aracın duraklama dışındaki nedenlerle bırakılması
Takip mesafesi|Aynı şeritte öndeki araçla korunması gereken güvenli aralık
Reaksiyon (intikal) mesafesi|Sürücünün tehlikeyi görmesiyle frene basması arasında aracın aldığı yol
Fren mesafesi|Frene basıldığı andan aracın tamamen durmasına kadar alınan yol
Durma mesafesi|Reaksiyon mesafesi ile fren mesafesinin toplamı
Kör nokta|Sürücünün aynalarda göremediği, araç çevresindeki alan
Kızaklama (aquaplaning)|Lastiğin yol yüzeyindeki su tabakası üzerinde kayarak tutunmasını kaybetmesi
Römork|Motorlu bir araçla çekilen, motorsuz yük taşıtı
Azami yüklü ağırlık|Bir aracın yüküyle birlikte izin verilen en yüksek ağırlığı
Net ağırlık|Aracın yakıt, su ve aletleri dâhil ama yük ve sürücü hariç ağırlığı
Yaya geçidi|Yayaların taşıt yolunu güvenle geçebilmesi için ayrılmış ve işaretlenmiş yer
Okul geçidi|Okul çevresinde öğrencilerin geçişi için işaretlenmiş yaya geçidi
Trafik|Yaya, hayvan ve araçların karayolu üzerindeki hâl ve hareketleri
Sürücü|Karayolunda motorlu ya da motorsuz bir aracı kullanan kişi
Karayolu|Trafik için kamunun yararlanmasına açık olan yol, köprü ve alanlar
Platform|Karayolunun taşıt yolu, banket ve varsa yaya yollarının tamamı
Ekonomik sürüş|Yakıtı ve aracı daha az yıpratan, ani hızlanma ve frenlemeden kaçınan sürüş
Defansif (savunmalı) sürüş|Başkalarının hatalarını önceden kestirip kazayı önlemeye yönelik sürüş
`);

const RIGHT_WRONG = L(`
Geçişi sola sinyal verip soldan yapmak|Doğru davranış
Sağdan geçmeye çalışmak|Yanlış davranış
Tepe üstünde öndeki aracı geçmek|Yanlış davranış
Virajda öndeki aracı geçmek|Yanlış davranış
Tünelde öndeki aracı geçmek|Yanlış davranış
Karşıdan araç gelirken uzun farı kısa fara çevirmek|Doğru davranış
Yaya geçidinde bekleyen yayaya yol vermek|Doğru davranış
Yaya geçidine yaklaşırken hızlanmak|Yanlış davranış
Dönel kavşaktaki araçlara geçiş hakkı vermek|Doğru davranış
Kontrolsüz kavşakta sağdan gelen araca yol vermek|Doğru davranış
Sürerken elde cep telefonuyla konuşmak|Yanlış davranış
Arkadaki tüm yolcuların da emniyet kemeri takmasını sağlamak|Doğru davranış
Yorgun ve uykusuzken uzun yola çıkmak|Yanlış davranış
Yağmurlu havada takip mesafesini artırmak|Doğru davranış
Sisli havada uzun far kullanmak|Yanlış davranış
Şerit değiştirmeden önce aynaları ve kör noktayı kontrol etmek|Doğru davranış
Sinyal vermeden şerit değiştirmek|Yanlış davranış
Ambulansa yol açmak için sağa yanaşmak|Doğru davranış
Ambulansın arkasına takılıp hızla ilerlemek|Yanlış davranış
Engelli park yerine park etmek|Yanlış davranış
Arıza durumunda dörtlü flaşörleri yakıp yansıtıcı üçgeni koymak|Doğru davranış
Kırmızı ışıkta geçmek|Yanlış davranış
Sarı ışık yanınca güvenle durabiliyorsa durmak|Doğru davranış
Okul taşıtının yakınında yavaşlayıp dikkatli olmak|Doğru davranış
Ani fren yapıp arkadakini korkutmak|Yanlış davranış
Gereksiz yere korna çalmak|Yanlış davranış
Uzun yolda yaklaşık her iki saatte bir mola vermek|Doğru davranış
Buzlu yolda ani direksiyon ve fren hareketlerinden kaçınmak|Doğru davranış
Motoru çalışır hâlde bırakıp araçtan uzaklaşmak|Yanlış davranış
Yola çıkmadan önce lastik, yağ ve ışıkları kontrol etmek|Doğru davranış
Hemzemin geçitte trafik nedeniyle rayların üstünde beklemek|Yanlış davranış
Kaza yerinde önce kendi güvenliğini sağlamak|Doğru davranış
Alkollü olarak araç kullanmak|Yanlış davranış
Çocuğu kucakta taşıyarak yolculuk yapmak|Yanlış davranış
Bisikletliyi geçerken yanında güvenli bir yanal mesafe bırakmak|Doğru davranış
Seyir hâlinde pencereden çöp atmak|Yanlış davranış
`);

const MC = L(`
Kırmızı kenarlı, tepesi yukarı bakan üçgen levhalar hangi işaret grubundandır?|Tehlike uyarı işaretleri|Bilgi işaretleri; Mecburiyet işaretleri; Duraklama ve park işaretleri|Tehlike uyarı işaretleri sürücüyü ileride çıkabilecek tehlikeye karşı önceden uyarır.
Mavi zeminli dikdörtgen levhalar genellikle hangi işaret grubundandır?|Bilgi işaretleri|Tehlike uyarı işaretleri; Yasaklama işaretleri; Yol çalışması işaretleri|Bilgi işaretleri hastane, akaryakıt, otobüs durağı gibi hizmet ve yönleri bildirir.
Mavi zeminli yuvarlak levhalar ne anlama gelir?|Mecburiyet (zorunluluk)|Yasaklama; Tehlike uyarısı; Bilgi|Mavi daire, belirtilen davranışın zorunlu olduğunu gösterir.
Kırmızı kenarlı yuvarlak levhalar genellikle ne bildirir?|Yasaklama ya da kısıtlama|Zorunluluk; Bilgi; Yol tarifi|Kırmızı çerçeveli daireler yasakları ve sınırlamaları bildirir.
Dört zamanlı bir motorda zamanların doğru sırası hangisidir?|Emme – sıkıştırma – iş (ateşleme) – egzoz|Sıkıştırma – emme – egzoz – iş; Emme – iş – sıkıştırma – egzoz; Egzoz – emme – iş – sıkıştırma|Dört zaman: emme, sıkıştırma, iş (genişleme) ve egzoz.
Dört zamanlı motorda iş (güç) zamanı kaçıncı zamandır?|3.|1.; 2.; 4.|Emme ve sıkıştırmadan sonra ateşlemeyle iş zamanı gelir.
Otomobiller için otoyollarda genel azami hız sınırı kaç km/sa’tir?|120|90; 100; 140|Karayolları Trafik Yönetmeliği md. 100.
Otomobiller için yerleşim yeri dışındaki bölünmüş olmayan iki yönlü yollarda genel azami hız kaç km/sa’tir?|90|70; 110; 120|Karayolları Trafik Yönetmeliği md. 100.
B sınıfı sürücü belgesi alabilmek için en az kaç yaşında olmak gerekir?|18|16; 17; 21|2918 sayılı Kanun md. 41.
Kontrolsüz bir kavşakta (aynı nitelikteki yollarda) geçiş hakkı kimindir?|Sağdan gelen aracın|Soldan gelen aracın; Büyük aracın; Kavşağa ilk ulaşan yayanın|Aynı nitelikteki yolların kontrolsüz kavşağında sağdan gelene yol verilir.
Dönel kavşaklarda geçiş hakkı kime aittir?|Kavşak içinde dönmekte olan araçlara|Kavşağa girmek isteyen araçlara; Büyük araçlara; Sağdan gelen araçlara|Dönel kavşakta içerdeki araçlar önceliklidir.
Sisli havada hangi ışıklar kullanılmalıdır?|Kısa huzmeli farlar ve sis lambaları|Uzun huzmeli farlar; Yalnızca park lambaları; Dörtlü flaşörler|Uzun far sisteki su damlacıklarından yansıyıp görüşü daha da azaltır.
Yansıtıcı uyarı üçgeni hangi durumda kullanılır?|Araç arıza ya da kaza nedeniyle yolda durmak zorunda kaldığında|Park yerine park ederken; Benzin alırken; Trafik ışıklarında beklerken|Yaklaşan sürücüleri öndeki duran araca karşı uyarmak için kullanılır.
Yağ basıncı uyarı lambası yol giderken yanarsa ne yapılmalıdır?|Güvenli bir yerde durup motor kapatılmalıdır|Hızlanarak en yakın servise gidilmelidir; Lamba sönene kadar beklenmelidir; Klima kapatılıp devam edilmelidir|Yağsız çalışan motor kısa sürede ağır hasar görür.
Motor yağı seviyesi kontrol edilirken araç nasıl olmalıdır?|Düz zeminde, motor durdurulmuş ve birkaç dakika beklenmiş|Motor çalışırken ve gaza basılıyken; Eğimli yolda yokuş aşağı; Uzun yoldan hemen sonra motor çalışırken|Yağın kartere inmesi için beklenir; çubuktaki iki çentik arası doğru seviyedir.
`);

export const EHL = {
  isaret: { k: 'group', d: 1, src: KGM, rows: SIGNS, extra: ['Yatay işaretleme'],
    q: a => `“${a}” levhası hangi işaret grubundandır?`, has: g => `Aşağıdaki levhalardan hangisi bir ${g.toLocaleLowerCase('tr')}dir?`, not: g => `Aşağıdaki levhalardan hangisi bir ${g.toLocaleLowerCase('tr')} DEĞİLDİR?`,
    e: (a, g) => `“${a}” bir ${g.toLocaleLowerCase('tr')}dir.`, notE: g => `bir ${g.toLocaleLowerCase('tr')}dir` },
  isaretp: { k: 'pick', d: 2, n: 230, src: KGM, rows: SIGNS,
    has: g => `Aşağıdakilerden hangisi ${g.toLocaleLowerCase('tr')} grubundadır?`, e: (a, g) => `“${a}” → ${g.toLocaleLowerCase('tr')}.`, eOthers: w => `Diğerleri: ${w.map(x => `${x[0]} (${x[1].toLocaleLowerCase('tr')})`).join(', ')}.` },
  parca: { k: 'group', d: 2, src: TEK, rows: PARTS,
    q: a => `${a} aracın hangi sistemine aittir?`, has: g => `Aşağıdaki parçalardan hangisi ${g.toLocaleLowerCase('tr')}nin parçasıdır?`.replace('organlarınin', 'organlarının'), not: g => `Aşağıdaki parçalardan hangisi ${g.toLocaleLowerCase('tr')}ne ait DEĞİLDİR?`.replace('organlarıne', 'organlarına'),
    e: (a, g) => `${a} → ${g.toLocaleLowerCase('tr')}.`, notE: g => g.toLocaleLowerCase('tr') },
  gorev: { k: 'pair', d: 2, src: TEK, rows: PARTFN,
    q: a => `${a} araçta ne işe yarar?`, r: b => `“${b}” görevini yapan parça hangisidir?`, e: (a, b) => `${a}: ${b}.` },
  lamba: { k: 'pair', d: 2, src: `${TEK} · ISO 2575 gösterge simgeleri`, rows: LIGHTS,
    q: a => `Gösterge panelinde ${a} yanıyorsa bu ne anlama gelir?`, r: b => `“${b}” durumunda hangi uyarı yanar?`, e: (a, b) => `${a}: ${b}.` },
  kavram: { k: 'pair', d: 2, src: `${KTK} (md. 3 tanımlar)`, rows: TERMS,
    q: a => `Trafikte “${a}” neyi ifade eder?`, r: b => `“${b}” tanımı hangi kavrama aittir?`, e: (a, b) => `${a}: ${b}.` },
  adab: { k: 'pick', d: 1, n: 380, src: ADAB, rows: RIGHT_WRONG,
    has: g => (g === 'Yanlış davranış' ? 'Aşağıdakilerden hangisi trafikte YANLIŞ bir davranıştır?' : 'Aşağıdakilerden hangisi trafikte DOĞRU bir davranıştır?'),
    e: (a, g) => `“${a}” ${g === 'Yanlış davranış' ? 'kurallara ve trafik adabına aykırıdır' : 'doğru bir davranıştır'}.` },
  kural: { k: 'mc', d: 2, src: KTK, rows: MC },
};
