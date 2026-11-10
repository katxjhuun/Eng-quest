// Moda bilgi tabloları — kaynaklar: The Met Costume Institute, Fédération de la Haute Couture et de la Mode,
// FIT (Fashion Institute of Technology) moda sözlüğü, ISO 2076 (lif adları), ISO 3758 (bakım etiketleri), marka resmî tarihçeleri.
import { L } from './engine.js';

const MET = 'The Met Costume Institute · FIT moda sözlüğü';
const LIF = 'ISO 2076 tekstil lifleri · FAO';
const BRAND = 'Markaların resmî kurumsal tarihçeleri';

const TERMS = L(`
Haute couture|Paris’te belirli kurallara göre, büyük ölçüde el işçiliğiyle yapılan ısmarlama yüksek terzilik
Prêt-à-porter|Standart bedenlerde üretilen tasarımcı hazır giyimi
Konfeksiyon|Giysilerin seri ve standart bedenlerde üretilmesi
Defile|Koleksiyonun mankenler tarafından podyumda yürünerek tanıtıldığı gösteri
Lookbook|Bir koleksiyonun kombinlerini gösteren fotoğraf kataloğu
Kapsül gardırop|Birbiriyle uyumlu, az sayıdaki temel parçadan oluşan gardırop
Vintage|Geçmiş on yıllardan kalma, dönemini yansıtan ikinci el giysi
Retro|Geçmiş bir dönemin stilinden esinlenerek yeni üretilmiş giysi
Hızlı moda|Trendleri çok hızlı ve ucuz biçimde seri üretip kısa ömürlü tüketen sistem
Yavaş moda|Kaliteli, uzun ömürlü ve sürdürülebilir üretimi öne çıkaran yaklaşım
İleri dönüşüm (upcycling)|Atık ya da eski malzemeyi daha değerli yeni bir ürüne dönüştürme
Monokrom kombin|Tek bir rengin farklı tonlarıyla oluşturulan kombin
Drapaj|Kumaşı manken üzerinde katlayıp iğneleyerek doğrudan biçim verme
Pili|Kumaşa düzenli aralıklarla verilen kalıcı katlar
Volan|Kumaşın dalgalı biçimde dökülmesini sağlayan kesik fırfır
Verev (bias) kesim|Kumaşın iplik yönüne 45 derece açıyla kesilmesi
Pens|Giysiyi vücut hatlarına oturtmak için dikilen üçgen biçimli kıvrım
Astar|Giysinin içine dikilen ince kumaş katı
Overlok|Kesik kumaş kenarının sökülmesini önleyen kenar dikişi
Kalıp|Giysi parçalarının kesimde kullanılan şablonu
Prova|Giysinin bitirilmeden önce üzerinde denenip düzeltilmesi
Silüet|Giysinin vücut üzerinde oluşturduğu genel dış hat
A kesim|Omuz ya da belden aşağı doğru A harfi gibi genişleyen kesim
Empire bel|Göğsün hemen altından başlayan yüksek bel çizgisi
Bolero|Belden yukarıda biten kısa, önü açık ceket
Trençkot|Apoletli, kemerli, kruvaze yağmurluk
Blazer|Spor-şık kullanılan, genellikle tek renk ceket
Palazzo pantolon|Belden itibaren bol ve dökümlü, geniş paçalı pantolon
Kapri pantolon|Baldır ortasında biten dar pantolon
Bermuda şort|Diz üstünde biten uzun şort
Espadril|Hasır (jüt) tabanlı kanvas ayakkabı
Loafer|Bağcıksız, giyilip çıkarılması kolay makosen tipi ayakkabı
Stiletto|İnce ve yüksek topuklu kadın ayakkabısı
Oxford ayakkabı|Bağcık delikleri yüze dikili, kapalı sistemli klasik ayakkabı
Brogue|Deri yüzeyi delikli süslemelerle bezenmiş ayakkabı
Chelsea bot|Yanları esnek lastikli, bilek boyu bot
Fedora|Tepesi boyuna çökertilmiş, kenarlı keçe şapka
Panama şapka|Ekvador’da toquilla hasırından örülen yazlık şapka
Fular|Boyna ya da başa bağlanan ince eşarp
Papyon|Yakada fiyonk biçiminde bağlanan kravat türü
Kruvaze|Önü üst üste binen, iki sıra düğmeli kapanış
Polo yaka|Düğmeli patlı, katlanır yakalı örme tişört yakası
Balıkçı yaka|Boynu saran, katlanan yüksek yaka
V yaka|Önde V biçiminde açılan yaka
Reglan kol|Yakadan koltuk altına çapraz dikişle bağlanan kol
Kimono kol|Gövdeyle tek parça kesilen geniş kol
Volanlı etek|Etek ucunda dalgalı fırfırlar olan etek
Kalem etek|Dize kadar inen, vücudu saran dar etek
Tulum|Üst ve alt kısmı tek parça olan giysi
Kaftan|Uzun, bol ve önü açık ya da yandan giyilen geleneksel giysi
Tunik|Kalçaya ya da dize kadar inen uzun bluz
Kardigan|Önü düğmeli örgü hırka
Parka|Kapüşonlu, kalın, genellikle dolgulu kaban
Kaşe kaban|Sıkı dokunmuş, keçeleştirilmiş yünlü kumaştan kaban
Smokin|Saten yakalı, gece davetlerinde giyilen erkek takımı
Frak|Önü kısa, arkası kırlangıç kuyruğu biçiminde uzun resmî ceket
Atölye (moda evi)|Tasarımların çizilip ilk örneklerinin hazırlandığı tasarım mekânı
Kreatif direktör|Bir moda evinin koleksiyonlarının yaratıcı yönünü belirleyen kişi
Stilist|Kişi ya da çekimler için giysi ve aksesuar seçimini yapan uzman
Moda haftası|Tasarımcıların yeni sezon koleksiyonlarını tanıttığı defileler dizisi
`);

const FIBER = L(`
Pamuk|Bitkisel lif
Keten|Bitkisel lif
Jüt|Bitkisel lif
Kenevir|Bitkisel lif
Rami|Bitkisel lif
Yün|Hayvansal lif
İpek|Hayvansal lif
Kaşmir|Hayvansal lif
Tiftik (moher)|Hayvansal lif
Alpaka|Hayvansal lif
Angora|Hayvansal lif
Polyester|Sentetik lif
Naylon (poliamit)|Sentetik lif
Akrilik|Sentetik lif
Elastan (likra)|Sentetik lif
Polipropilen|Sentetik lif
Viskon|Rejenere (yapay) selüloz lifi
Modal|Rejenere (yapay) selüloz lifi
Liyosel (Tencel)|Rejenere (yapay) selüloz lifi
Asetat|Rejenere (yapay) selüloz lifi
`);

const ANIMAL = L(`
Kaşmir|Kaşmir keçisi
Tiftik (moher)|Ankara keçisi|Türkçede “tiftik keçisi” olarak da bilinir.
Angora yünü|Angora tavşanı
İpek|İpek böceği kozası
Alpaka yünü|Alpaka
Merinos yünü|Merinos koyunu
Vikunya yünü|Vikunya
`);

const FABRIC = L(`
Denim|Çözgü ipliği indigo boyalı, dayanıklı dimi pamuklu kumaş
Kadife|Yüzeyi kısa ve sık havlı, yumuşak kumaş
Saten|Bir yüzü parlak ve kaygan atlas dokuma kumaş
Şifon|Hafif, yarı saydam ve dökümlü ince kumaş
Tül|Ağ görünümlü, delikli ince kumaş
Tüvit|Kaba dokulu, desenli yünlü kumaş
Organze|Sert duruşlu, saydam ince kumaş
Krep|Yüzeyi hafif kırışık ve tanecikli dokulu kumaş
Jarse (jersey)|Esnek, ince örme kumaş
Gabardin|Sık dokunmuş, dayanıklı dimi kumaş
Fitilli kadife|Yüzeyinde boyuna paralel havlı çizgiler olan kumaş
Poplin|Sık dokunmuş, ince ve düzgün yüzeyli bez ayağı kumaş
Keçe|Liflerin dokunmadan sıkıştırılmasıyla elde edilen kumaş
Dantel|İpliklerin örülerek ya da işlenerek desenli boşluklar oluşturduğu kumaş
`);

const DESIGNER_C = L(`
Coco Chanel|Fransa
Christian Dior|Fransa
Yves Saint Laurent|Fransa
Hubert de Givenchy|Fransa
Jean Paul Gaultier|Fransa
Christian Louboutin|Fransa
Giorgio Armani|İtalya
Gianni Versace|İtalya
Valentino Garavani|İtalya
Miuccia Prada|İtalya
Guccio Gucci|İtalya
Ralph Lauren|ABD
Calvin Klein|ABD
Tom Ford|ABD
Donna Karan|ABD
Vivienne Westwood|Birleşik Krallık
Alexander McQueen|Birleşik Krallık
Mary Quant|Birleşik Krallık
Stella McCartney|Birleşik Krallık
Issey Miyake|Japonya
Rei Kawakubo|Japonya
Yohji Yamamoto|Japonya
Karl Lagerfeld|Almanya
Jil Sander|Almanya
Rıfat Özbek|Türkiye
Dries Van Noten|Belçika
Martin Margiela|Belçika
Raf Simons|Belçika
`);

const DESIGNER_K = L(`
Coco Chanel|Küçük siyah elbiseyi ve tüvit takımları klasikleştirdi
Christian Dior|1947’de dar bel ve geniş eteklerle “New Look”u tanıttı
Mary Quant|1960’larda mini eteği popülerleştirdi
Yves Saint Laurent|1966’da kadınlar için smokini (Le Smoking) tasarladı
Diane von Fürstenberg|Bağlamalı kruvaze (wrap) elbiseyi ünlendirdi
Levi Strauss|Jacob Davis ile perçinli kot pantolonun patentini aldı
Vivienne Westwood|Punk modasının öncülerinden oldu
Issey Miyake|Kalıcı pileli kumaşlarıyla tanındı
Christian Louboutin|Kırmızı tabanlı ayakkabılarıyla tanındı
Elsa Schiaparelli|Gerçeküstücü sanatçılarla iş birliği ve “şok pembe” rengiyle tanındı
Paco Rabanne|Metal ve plastik plakalardan elbiseler yaptı
Pierre Cardin|Uzay çağından esinlenen fütürist tasarımlarıyla tanındı
Karl Lagerfeld|Uzun yıllar Chanel’in kreatif direktörlüğünü yaptı
Rei Kawakubo|Comme des Garçons markasını kurdu
`);

const COLOR = L(`
Ana renkler (geleneksel boya renk çemberi)|Kırmızı, sarı ve mavi
Ara renkler|İki ana rengin karışımıyla oluşan turuncu, yeşil ve mor
Tamamlayıcı (karşıt) renkler|Renk çemberinde birbirinin tam karşısında duran renkler
Analog renkler|Renk çemberinde yan yana duran renkler
Sıcak renkler|Kırmızı, turuncu ve sarı tonları
Soğuk renkler|Mavi, yeşil ve mor tonları
Nötr renkler|Siyah, beyaz, gri ve bej gibi kolay uyum sağlayan renkler
Pastel renkler|Beyazla açılmış yumuşak ve açık tonlar
Doygunluk|Bir rengin ne kadar canlı ya da grimsi olduğu
Renk değeri|Bir rengin açıklık-koyuluk derecesi
Monokromatik uyum|Tek bir rengin açık ve koyu tonlarıyla kurulan uyum
Triadik uyum|Renk çemberinde eşit aralıklı üç rengin birlikte kullanılması
`);

const DECADE = L(`
1920’ler|Düşük belli, düz kesimli “flapper” elbiseleri
1950’ler|Daraltılmış bel ve kabarık eteklerle kadınsı silüet
1960’lar|Mini etek, geometrik desenler ve “mod” akımı
1970’ler|İspanyol paça pantolonlar, hippi ve disko modası
1980’ler|Vatkalı omuzlar ve iddialı “güç giyimi”
1990’lar|Grunge ve sade minimalizm
`);

const CARE = L(`
Leğen simgesi|Yıkama talimatı (içindeki sayı en yüksek su sıcaklığı)
Üçgen simgesi|Ağartma (çamaşır suyu) talimatı
Kare simgesi|Kurutma talimatı
Ütü simgesi|Ütüleme talimatı (noktalar sıcaklık düzeyi)
Daire simgesi|Profesyonel (kuru ya da ıslak) temizleme talimatı
`);

const ORIGIN = L(`
Kimono|Japonya
Sari|Hindistan
Kilt|İskoçya
Panço|And Dağları (Güney Amerika)
Dirndl|Bavyera ve Avusturya
Hanbok|Kore
Qipao (cheongsam)|Çin
Sombrero|Meksika
Panama şapka|Ekvador|Adını Panama Kanalı inşaatında yaygınlaşmasından alır; aslen Ekvador’da örülür.
Lederhosen|Bavyera ve Avusturya
Áo dài|Vietnam
Kente kumaşı|Gana
Tartan desen|İskoçya
`);

const BRANDS = L(`
Zara|İspanya
Mango|İspanya
H&M|İsveç
Uniqlo|Japonya
Gap|ABD
Levi’s|ABD
Nike|ABD
Adidas|Almanya
Puma|Almanya
Hugo Boss|Almanya
Benetton|İtalya
Gucci|İtalya
Prada|İtalya
Versace|İtalya
Fendi|İtalya
Lacoste|Fransa
Hermès|Fransa
Louis Vuitton|Fransa
Chanel|Fransa
Burberry|Birleşik Krallık
LC Waikiki|Türkiye
Mavi|Türkiye
Koton|Türkiye
Vakko|Türkiye
`);

const MC = L(`
Moda dünyasındaki “Büyük Dört” moda haftası hangi şehirlerde düzenlenir?|New York, Londra, Milano ve Paris|Roma, Berlin, Tokyo ve Madrid; İstanbul, Paris, Seul ve Sidney; Los Angeles, Barselona, Viyana ve Moskova|Sezon takviminde sıra genellikle New York, Londra, Milano, Paris şeklindedir.
Kırmızının renk çemberindeki tamamlayıcı (karşıt) rengi hangisidir?|Yeşil|Turuncu; Mor; Sarı|Geleneksel boya renk çemberinde kırmızının karşısında yeşil bulunur.
Mavinin renk çemberindeki tamamlayıcı (karşıt) rengi hangisidir?|Turuncu|Yeşil; Mor; Kırmızı|Mavi ve turuncu birbirini en güçlü biçimde öne çıkarır.
Sarının renk çemberindeki tamamlayıcı (karşıt) rengi hangisidir?|Mor|Yeşil; Turuncu; Mavi|Sarı ve mor tamamlayıcı çifttir.
Kırmızı ile sarı karıştırıldığında hangi ara renk elde edilir?|Turuncu|Yeşil; Mor; Kahverengi|Geleneksel boya karışımında kırmızı + sarı = turuncu.
Mavi ile sarı karıştırıldığında hangi ara renk elde edilir?|Yeşil|Turuncu; Mor; Gri|Mavi + sarı = yeşil.
Kırmızı ile mavi karıştırıldığında hangi ara renk elde edilir?|Mor|Yeşil; Turuncu; Pembe|Kırmızı + mavi = mor.
Bakım etiketinde üzeri çarpı ile kapatılmış simge ne anlama gelir?|O işlem yapılmamalıdır|O işlem iki kez yapılmalıdır; İşlem isteğe bağlıdır; İşlem yalnızca elde yapılmalıdır|ISO 3758’e göre çarpı işareti yasak anlamına gelir.
Bakım etiketindeki ütü simgesinde üç nokta ne anlama gelir?|Yüksek sıcaklıkta ütülenebilir|Ütülenemez; Düşük sıcaklıkta ütülenir; Buharsız ütülenir|Bir nokta düşük, iki nokta orta, üç nokta yüksek sıcaklıktır.
Gardırobu 30 civarında temel parçayla sınırlayan kapsül gardırop fikri hangi temel ilkeye dayanır?|Az ama birbiriyle uyumlu parça|Her sezon tüm gardırobu yenilemek; Yalnızca tek renk giymek; Sadece ikinci el almak|Parçalar birbiriyle kombinlenebildiği için az parçayla çok seçenek oluşur.
`);

export const MOD = {
  terim: { k: 'pair', d: 2, src: MET, rows: TERMS,
    q: a => `Modada “${a}” neyi ifade eder?`, r: b => `“${b}” tanımı hangi terime aittir?`, e: (a, b) => `${a}: ${b}.` },
  lif: { k: 'group', d: 1, src: LIF, rows: FIBER,
    q: a => `${a} hangi lif grubundandır?`, has: g => `Aşağıdakilerden hangisi ${g.toLocaleLowerCase('tr')}${g.endsWith('lifi') ? 'dir' : 'tir'}?`, not: g => `Aşağıdakilerden hangisi ${g.toLocaleLowerCase('tr')} DEĞİLDİR?`,
    e: (a, g) => `${a} → ${g.toLocaleLowerCase('tr')}.`, notE: g => g.toLocaleLowerCase('tr') },
  lifp: { k: 'pick', d: 2, n: 200, src: LIF, rows: FIBER,
    has: g => `Aşağıdaki liflerden hangisi “${g.toLocaleLowerCase('tr')}” grubundadır?`, e: (a, g) => `${a} → ${g.toLocaleLowerCase('tr')}.`, eOthers: w => `Diğerleri: ${w.map(x => `${x[0]} (${x[1].toLocaleLowerCase('tr')})`).join(', ')}.` },
  hayvan: { k: 'pair', d: 2, src: LIF, rows: ANIMAL,
    q: a => `${a} hangi hayvandan elde edilir?`, r: b => `${b} hangi lifin kaynağıdır?`, e: (a, b) => `${a} → ${b}.` },
  kumas: { k: 'pair', d: 2, src: MET, rows: FABRIC,
    q: a => `${a} nasıl bir kumaştır?`, r: b => `“${b}” hangi kumaşın tanımıdır?`, e: (a, b) => `${a}: ${b.charAt(0).toLocaleLowerCase('tr') + b.slice(1)}.` },
  tasarimci: { k: 'group', d: 2, src: MET, rows: DESIGNER_C,
    q: a => `Modacı ${a} hangi ülkedendir?`, has: g => `Aşağıdaki modacılardan hangisi ${g} kökenlidir?`, not: g => `Aşağıdaki modacılardan hangisi ${g} kökenli DEĞİLDİR?`,
    e: (a, g) => `${a} → ${g}.`, notE: g => `${g} kökenlidir` },
  tasarimcip: { k: 'pick', d: 2, n: 160, src: MET, rows: DESIGNER_C,
    has: g => `Aşağıdaki tasarımcılardan hangisi ${g} kökenlidir?`, e: (a, g) => `${a} → ${g}.`, eOthers: w => `Diğerleri: ${w.map(x => `${x[0]} (${x[1]})`).join(', ')}.` },
  unlu: { k: 'pair', d: 2, src: MET, rows: DESIGNER_K,
    q: a => `${a} moda tarihinde neyle tanınır?`, r: b => `Hangi tasarımcı “${b.charAt(0).toLocaleLowerCase('tr') + b.slice(1)}”?`, e: (a, b) => `${a}: ${b}.` },
  renk: { k: 'pair', d: 1, src: 'Johannes Itten, Renk Sanatı · renk kuramı', rows: COLOR,
    q: a => `Renk kuramında “${a}” ne demektir?`, r: b => `“${b}” hangi kavramı tanımlar?`, e: (a, b) => `${a}: ${b}.` },
  donem: { k: 'pair', d: 2, src: MET, rows: DECADE,
    q: a => `${a} modası en çok neyle hatırlanır?`, r: b => `“${b}” hangi on yılın modasıdır?`, e: (a, b) => `${a}: ${b}.` },
  etiket: { k: 'pair', d: 1, src: 'ISO 3758 · GINETEX bakım etiketi sistemi', rows: CARE,
    q: a => `Giysi bakım etiketindeki ${a.toLocaleLowerCase('tr')} neyi gösterir?`, r: b => `Bakım etiketinde “${b}” hangi simgeyle gösterilir?`, e: (a, b) => `${a}: ${b}.` },
  koken: { k: 'pair', d: 2, src: MET, rows: ORIGIN,
    q: a => `${a} hangi kültürün geleneksel giyim unsurudur?`, r: b => `Aşağıdakilerden hangisi ${b} kökenli geleneksel bir giyim unsurudur?`, e: (a, b) => `${a} → ${b}.` },
  marka: { k: 'group', d: 1, src: BRAND, rows: BRANDS,
    q: a => `${a} markası hangi ülkede kurulmuştur?`, has: g => `Aşağıdaki markalardan hangisi ${g} kökenlidir?`, not: g => `Aşağıdaki markalardan hangisi ${g} kökenli DEĞİLDİR?`,
    e: (a, g) => `${a} → ${g}.`, notE: g => `${g} kökenlidir` },
  markap: { k: 'pick', d: 2, n: 160, src: BRAND, rows: BRANDS,
    has: g => `Aşağıdaki moda markalarından hangisi ${g}’da kurulmuştur?`.replace('ABD’da', 'ABD’de').replace('Almanya’da', 'Almanya’da').replace('Japonya’da', 'Japonya’da').replace('İsveç’da', 'İsveç’te').replace('Türkiye’da', 'Türkiye’de').replace('Birleşik Krallık’da', 'Birleşik Krallık’ta'),
    e: (a, g) => `${a} → ${g}.`, eOthers: w => `Diğerleri: ${w.map(x => `${x[0]} (${x[1]})`).join(', ')}.` },
  bilgi: { k: 'mc', d: 2, src: MET, rows: MC },
};
