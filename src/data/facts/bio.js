// Biyoloji bilgi tabloları — kaynaklar: MEB Ortaöğretim Biyoloji ders kitapları, OpenStax Biology 2e (açık lisanslı),
// DSÖ hastalık bilgi sayfaları, Nobel Vakfı.
import { L, N } from './engine.js';

const MEB = 'MEB Ortaöğretim Biyoloji ders kitabı';
const OS = ch => `OpenStax Biology 2e, ${ch}`;

const ORGANEL = L(`
Mitokondri|Oksijenli solunumla ATP üretmek|Kendi DNA’sı vardır; “hücrenin enerji santrali” diye anılır.
Ribozom|Protein sentezlemek|Zarsız tek organeldir; bütün canlı hücrelerde bulunur.
Kloroplast|Fotosentez yapmak|Bitki ve alg hücrelerinde bulunur; klorofil içerir.
Çekirdek|DNA’yı taşıyıp hücrenin faaliyetlerini yönetmek
Golgi aygıtı|Maddeleri paketleyip salgılamak
Lizozom|Hücre içi sindirim yapmak|İçinde sindirim enzimleri bulunur; daha çok hayvan hücrelerinde görülür.
Granüllü endoplazmik retikulum|Ribozomlarda üretilen proteinleri taşımak
Granülsüz endoplazmik retikulum|Lipit sentezlemek ve zehirli maddeleri etkisizleştirmek
Merkezi koful|Su ve madde depolayıp hücreye turgor (dolgunluk) sağlamak
Hücre zarı|Madde alışverişini seçici geçirgenlikle denetlemek
Hücre duvarı|Bitki hücresine şekil, destek ve koruma sağlamak|Bitkilerde selülozdan, mantarlarda kitinden yapılır.
Sentrozom|Hücre bölünmesinde iğ ipliklerini oluşturmak|Hayvan hücrelerinde bulunur; çoğu bitki hücresinde yoktur.
Çekirdekçik|Ribozom alt birimlerini (rRNA) üretmek
Peroksizom|Hidrojen peroksiti parçalamak
Hücre iskeleti|Hücrenin şeklini korumak ve hücre içi hareketi sağlamak
`);

const VITAMIN = L(`
A vitamini|Gece körlüğü
B1 vitamini (tiamin)|Beriberi
B3 vitamini (niasin)|Pellegra
B12 vitamini|Pernisiyöz anemi
C vitamini|Skorbüt
D vitamini|Raşitizm
K vitamini|Kanın pıhtılaşmasında gecikme
Folik asit (B9)|Gebelikte bebekte nöral tüp kusurları
Demir|Demir eksikliği anemisi (kansızlık)
İyot|Guatr (tiroit bezinin büyümesi)
`);

const HORMON = L(`
İnsülin|Pankreas|Kan şekerini düşürür.
Glukagon|Pankreas|Kan şekerini yükseltir.
Tiroksin|Tiroit bezi|Metabolizma hızını düzenler.
Kalsitonin|Tiroit bezi|Kandaki kalsiyumu düşürür.
Parathormon|Paratiroit bezi|Kandaki kalsiyumu yükseltir.
Adrenalin|Böbrek üstü bezi|“Savaş ya da kaç” tepkisini başlatır.
Kortizol|Böbrek üstü bezi|Stres hormonu olarak bilinir.
Aldosteron|Böbrek üstü bezi|Böbreklerde sodyum geri emilimini artırır.
Büyüme hormonu|Hipofiz bezi
TSH (tiroit uyarıcı hormon)|Hipofiz bezi
ACTH|Hipofiz bezi
Prolaktin|Hipofiz bezi|Süt üretimini uyarır.
FSH|Hipofiz bezi
LH|Hipofiz bezi
Melatonin|Epifiz bezi|Uyku–uyanıklık döngüsünü düzenler.
Testosteron|Testis
Östrojen|Yumurtalık
Progesteron|Yumurtalık|Gebeliğin sürmesini sağlar.
Timozin|Timüs bezi|T lenfositlerinin olgunlaşmasında rol oynar.
`);

const ORGAN = L(`
Kalp|Dolaşım sistemi
Atardamar|Dolaşım sistemi
Toplardamar|Dolaşım sistemi
Kılcal damar|Dolaşım sistemi
Akciğer|Solunum sistemi
Bronş|Solunum sistemi
Gırtlak (larinks)|Solunum sistemi
Alveol|Solunum sistemi|Gaz alışverişi bu küçük keseciklerde olur.
Soluk borusu (trake)|Solunum sistemi
Mide|Sindirim sistemi
İnce bağırsak|Sindirim sistemi|Besinlerin emiliminin çoğu burada gerçekleşir.
Kalın bağırsak|Sindirim sistemi
Karaciğer|Sindirim sistemi|Safra üretir; vücudun en büyük iç organıdır.
Yemek borusu|Sindirim sistemi
Tükürük bezi|Sindirim sistemi
Safra kesesi|Sindirim sistemi
Böbrek|Boşaltım sistemi|Kanı süzerek idrar oluşturur.
Üreter|Boşaltım sistemi
İdrar kesesi|Boşaltım sistemi
Üretra|Boşaltım sistemi
Beyin|Sinir sistemi
Omurilik|Sinir sistemi
Beyincik|Sinir sistemi|Denge ve hareketlerin uyumunu sağlar.
Omurilik soğanı|Sinir sistemi|Solunum ve kalp atışı gibi istemsiz işleri denetler.
Uyluk kemiği (femur)|Destek ve hareket sistemi|İnsan vücudunun en uzun kemiğidir.
Kafatası|Destek ve hareket sistemi
Omurga|Destek ve hareket sistemi
Kaburga|Destek ve hareket sistemi
Pazı kası (biseps)|Destek ve hareket sistemi
Tiroit bezi|Endokrin sistem
Hipofiz bezi|Endokrin sistem|Pek çok bezi yönettiği için “orkestra şefi” diye anılır.
Böbrek üstü bezi|Endokrin sistem
Epifiz bezi|Endokrin sistem
Lenf düğümü|Lenf (bağışıklık) sistemi
Dalak|Lenf (bağışıklık) sistemi
Bademcik|Lenf (bağışıklık) sistemi
`);

const ANIMAL = L(`
Yunus|Memeliler|Akciğerle solunum yapar ve yavrusunu sütle besler.
Balina|Memeliler
Yarasa|Memeliler|Uçabilen tek memeli grubudur.
Ornitorenk|Memeliler|Yumurtlayan memelilerdendir.
Fil|Memeliler
Kanguru|Memeliler
Fok|Memeliler
Kirpi|Memeliler
Penguen|Kuşlar|Uçamaz ama tüyleri ve gagasıyla bir kuştur.
Deve kuşu|Kuşlar
Kartal|Kuşlar
Baykuş|Kuşlar
Kurbağa|İki yaşamlılar|Yavru (iribaş) solungaçla, ergin akciğer ve deriyle solur.
Semender|İki yaşamlılar
Kertenkele|Sürüngenler
Timsah|Sürüngenler
Kaplumbağa|Sürüngenler
Yılan|Sürüngenler
Bukalemun|Sürüngenler
Köpek balığı|Balıklar|İskeleti kıkırdaktandır.
Denizatı|Balıklar
Somon|Balıklar
Yılan balığı|Balıklar
Hamsi|Balıklar
Arı|Böcekler
Kelebek|Böcekler
Karınca|Böcekler
Uğur böceği|Böcekler
Ahtapot|Yumuşakçalar
Salyangoz|Yumuşakçalar
Midye|Yumuşakçalar
Örümcek|Örümceğimsiler|Sekiz bacaklıdır; böcek değildir.
Akrep|Örümceğimsiler
Kene|Örümceğimsiler
Yengeç|Kabuklular
Karides|Kabuklular
Istakoz|Kabuklular
Deniz yıldızı|Derisi dikenliler
Deniz kestanesi|Derisi dikenliler
Zürafa|Memeliler
Tavus kuşu|Kuşlar
Kara kurbağası|İki yaşamlılar
Kobra|Sürüngenler
Vatoz|Balıklar
Sivrisinek|Böcekler
Sümüklü böcek|Yumuşakçalar|Adına rağmen böcek değil, kabuğu olmayan bir yumuşakçadır.
Kalamar|Yumuşakçalar
`);

const PATHOGEN = L(`
Grip (influenza)|Virüs
COVID-19|Virüs
Kızamık|Virüs
Kuduz|Virüs
Su çiçeği|Virüs
Kabakulak|Virüs
Çocuk felci (polio)|Virüs
Hepatit B|Virüs
AIDS (HIV)|Virüs
Verem (tüberküloz)|Bakteri
Kolera|Bakteri
Tetanoz|Bakteri
Şarbon|Bakteri
Tifo|Bakteri
Difteri|Bakteri
Boğmaca|Bakteri
Veba|Bakteri
Sıtma|Tek hücreli parazit (protist)|Anofel sivrisineğiyle bulaşan Plasmodium’dan kaynaklanır.
Uyku hastalığı|Tek hücreli parazit (protist)
Amipli dizanteri|Tek hücreli parazit (protist)
Toksoplazmoz|Tek hücreli parazit (protist)
Pamukçuk (kandidiyaz)|Mantar
Atlet ayağı|Mantar
Saçkıran|Mantar
`);

const CHROM = N(`
İnsan|46
Şempanze|48
Köpek|78
Kedi|38
Sığır|60
At|64
Tavuk|78
Ev faresi|40
Meyve sineği|8
Bezelye|14
Mısır|20
Domates|24
Patates|48
Ekmeklik buğday|42
`);

const SCI = L(`
Gregor Mendel|Bezelyelerle kalıtım yasalarını ortaya koydu
Charles Darwin|Doğal seçilimle evrim kuramını geliştirdi
Robert Hooke|Mantar dokusunda gördüğü yapılara “hücre” adını verdi
Antonie van Leeuwenhoek|Kendi mikroskobuyla bakterileri ilk gözleyen kişi oldu
Louis Pasteur|Pastörizasyonu ve kuduz aşısını geliştirdi
Alexander Fleming|Penisilini keşfetti
Watson ve Crick|DNA’nın çift sarmal modelini önerdi
Schleiden ve Schwann|Bütün canlıların hücrelerden oluştuğunu savunan hücre teorisini ortaya koydu
Carl Linnaeus|Canlıları cins ve tür adıyla adlandıran ikili adlandırma sistemini kurdu
William Harvey|Kanın vücutta dolaştığını gösterdi
Robert Koch|Verem bakterisini keşfetti
Edward Jenner|Çiçek hastalığına karşı ilk aşıyı geliştirdi
Rosalind Franklin|DNA’nın X-ışını kırınım görüntüsünü (Fotoğraf 51) elde etti
Jean-Baptiste Lamarck|Kazanılmış özelliklerin kalıtıldığı görüşünü savundu
Barbara McClintock|“Atlayan genleri” (transpozonları) keşfetti
Hans Krebs|Hücresel solunumdaki sitrik asit döngüsünü açıkladı
Melvin Calvin|Fotosentezin karanlık evresindeki karbon tutma döngüsünü çözdü
Thomas Hunt Morgan|Meyve sineğiyle genlerin kromozomlarda taşındığını gösterdi
Camillo Golgi|Hücrede kendi adıyla anılan organeli tanımladı
`);

const TERMS = L(`
Fotosentez|Işık enerjisiyle karbondioksit ve sudan besin (glikoz) üretilmesi
Hücresel solunum|Besinlerin parçalanarak ATP üretilmesi
Mitoz|Bir hücreden kromozom sayısı aynı iki hücre oluşturan bölünme
Mayoz|Üreme hücrelerini oluşturan, kromozom sayısını yarıya indiren bölünme
Osmoz|Suyun seçici geçirgen zardan az yoğun ortamdan çok yoğun ortama geçmesi
Difüzyon|Maddelerin çok yoğun ortamdan az yoğun ortama kendiliğinden yayılması
Aktif taşıma|Maddelerin ATP harcanarak az yoğun ortamdan çok yoğun ortama taşınması
Enzim|Kimyasal tepkimeleri hızlandıran protein yapılı biyolojik katalizör
Homeostazi|Vücudun iç ortamını belirli sınırlar içinde dengede tutması
Gen|Bir özelliği belirleyen DNA parçası
Alel|Aynı genin farklı biçimleri
Genotip|Bir canlının taşıdığı genlerin bileşimi
Fenotip|Genotip ve çevre etkisiyle ortaya çıkan gözlenebilir özellik
Homozigot|Bir özellik için aynı iki aleli taşıyan birey
Heterozigot|Bir özellik için farklı iki aleli taşıyan birey
Mutasyon|DNA’nın baz dizisinde kalıcı değişiklik
Ekosistem|Bir alandaki canlılar ile cansız çevrelerinin tamamı
Popülasyon|Aynı yerde yaşayan aynı türden bireylerin oluşturduğu topluluk
Komünite|Aynı yerde yaşayan farklı türlerin popülasyonlarının bütünü
Habitat|Bir canlının yaşadığı doğal ortam
Ayrıştırıcı|Ölü organizmaları parçalayıp maddeleri doğaya geri kazandıran canlı
Mutualizm|İki türün de yarar sağladığı birliktelik
Parazitlik|Bir türün yarar görüp diğerinin zarar gördüğü birliktelik
Kommensalizm|Bir türün yarar görüp diğerinin etkilenmediği birliktelik
Fagositoz|Hücrenin katı parçacıkları zarıyla sararak içine alması
Antikor|Yabancı maddelere karşı B lenfositlerinin ürettiği savunma proteini
Antijen|Vücutta bağışıklık tepkisi başlatan yabancı madde
Aşı|Hastalık etkenine karşı bağışıklığı önceden uyaran biyolojik ürün
Kemosentez|Kimyasal tepkimelerden elde edilen enerjiyle besin üretimi
Transkripsiyon|DNA’dan RNA sentezlenmesi
Translasyon|mRNA’daki bilgiye göre ribozomda protein sentezlenmesi
Replikasyon|DNA’nın kendini eşlemesi
Krossing-over|Mayozda homolog kromozomlar arasında parça değişimi
Dominant|Heterozigot bireyde etkisini gösteren baskın karakter
Resesif|Ancak homozigot olduğunda ortaya çıkan çekinik karakter
Stoma|Yapraklarda gaz alışverişini sağlayan gözenek
Ksilem|Bitkide kökten alınan suyu ve mineralleri yukarı ileten doku
Floem|Bitkide yapraklarda üretilen besinleri ileten doku
Klorofil|Işığı soğuran yeşil fotosentez pigmenti
ATP|Hücrenin doğrudan kullandığı enerji molekülü
Glikoliz|Glikozun sitoplazmada iki pirüvata parçalanması
Fermantasyon|Oksijensiz ortamda besinlerin kısmen parçalanarak enerji elde edilmesi
Nöron|Sinir sisteminin uyartı ileten temel hücresi
Sinaps|İki nöron arasındaki iletişim bölgesi
Refleks|Uyarıya karşı beynin iradesi dışında gelişen ani tepki
Metamorfoz|Bazı canlıların gelişim sırasında yapısal başkalaşım geçirmesi
Biyoçeşitlilik|Bir bölgedeki gen, tür ve ekosistem çeşitliliğinin bütünü
`);

const ENZYM = L(`
Tükürük amilazı|Karbonhidratlar
Pankreas amilazı|Karbonhidratlar
Maltaz|Karbonhidratlar
Laktaz|Karbonhidratlar
Pepsin|Proteinler
Tripsin|Proteinler
Kimotripsin|Proteinler
Pankreas lipazı|Yağlar
Mide lipazı|Yağlar
Nükleaz|Nükleik asitler
`);


const TERMS2 = L(`
Hemoglobin|Alyuvarlarda oksijen taşıyan demirli protein
Alyuvar|Kanda oksijen taşıyan, memelilerde çekirdeksiz hücre
Akyuvar|Vücudu mikroplara karşı savunan kan hücresi
Trombosit|Kanın pıhtılaşmasını sağlayan kan pulcuğu
Kan plazması|Kanın içinde besin, hormon ve atıkları taşıyan sıvı kısmı
Ozmotik basınç|Suyun zardan geçişini belirleyen, çözelti derişimine bağlı basınç
Turgor|Su alan bitki hücresinin çeperine yaptığı iç basınç
Plazmoliz|Hipertonik ortamda su kaybeden bitki hücresinde zarın çeperden ayrılması
Hipertonik|Çözünen madde derişimi hücre içinden fazla olan ortam
Hipotonik|Çözünen madde derişimi hücre içinden az olan ortam
Kromatin|Bölünmeyen çekirdekte DNA ve proteinlerin gevşek iplik yapısı
Kromozom|Bölünme sırasında kısalıp kalınlaşan, DNA ve proteinden oluşan yapı
Sentromer|Kardeş kromatitleri bir arada tutan bölge
Gamet|Mayozla oluşan haploit üreme hücresi
Zigot|Sperm ve yumurtanın birleşmesiyle oluşan ilk hücre
Haploit|Her kromozomdan yalnızca bir tane taşıyan (n) hücre
Diploit|Her kromozomdan iki tane taşıyan (2n) hücre
Kodon|mRNA’da bir amino asidi belirleyen üçlü baz dizisi
Doğal seçilim|Ortama uyum sağlayan bireylerin daha çok hayatta kalıp üremesi
Adaptasyon|Canlının yaşadığı ortamda yaşama ve üreme şansını artıran özellik
Tür|Doğada çiftleşerek verimli döller verebilen benzer bireyler topluluğu
Endemik tür|Yalnızca belirli bir bölgede doğal olarak yaşayan tür
Besin zinciri|Canlılar arasında beslenme yoluyla enerji aktarımını gösteren sıra
Üretici|Kendi besinini inorganik maddelerden üreten canlı
Tüketici|Besinini hazır olarak dışarıdan alan canlı
Biyolojik birikim|Zararlı maddelerin besin zincirinin üst basamaklarında derişiminin artması
Karbon döngüsü|Karbonun canlılar, atmosfer ve okyanuslar arasında dolaşımı
Azot bağlama|Atmosferdeki azotun bazı bakterilerce canlıların kullanabileceği bileşiklere dönüştürülmesi
Ötrofikasyon|Su ortamında aşırı besin tuzu birikmesiyle alg patlaması ve oksijen azalması
Hormon|Kan yoluyla taşınıp hedef organları etkileyen kimyasal haberci
Bağışıklık|Vücudun hastalık etkenlerine karşı direnç gösterme yeteneği
Antibiyotik|Bakterileri öldüren ya da üremesini durduran ilaç
Virüs|Ancak canlı bir hücrenin içinde çoğalabilen, hücresiz enfeksiyon etkeni
Prokaryot|Zarla çevrili çekirdeği olmayan hücre ya da canlı
Ökaryot|Zarla çevrili çekirdeği olan hücre ya da canlı
Simbiyoz|Farklı türlerden canlıların yakın ve sürekli birlikte yaşaması
Rejenerasyon|Kaybedilen bir vücut bölümünün yeniden oluşturulması
Tozlaşma|Çiçek tozlarının dişi organın tepeciğine taşınması
Çimlenme|Tohumun uygun koşullarda gelişerek yeni bitkiye dönüşmeye başlaması
Transpirasyon|Bitkilerin yapraklarından su buharı kaybetmesi
`);

const PLANT = L(`
Kök|Topraktan su ve mineral almak, bitkiyi toprağa tutturmak
Gövde|Yaprakları taşımak ve madde iletimini sağlamak
Yaprak|Fotosentez ve gaz alışverişi yapmak
Çiçek|Eşeyli üremeyi sağlamak
Meyve|Tohumları korumak ve yaymak
Tohum|Embriyoyu ve onun besinini taşımak
Kambiyum|Gövdenin enine kalınlaşmasını sağlamak
Uç meristem|Kök ve gövdenin boyuna uzamasını sağlamak
Kök tüyü|Su ve mineral emme yüzeyini artırmak
Kutikula|Yaprak yüzeyinde su kaybını azaltmak
Palizat parankiması|Yaprakta fotosentezin büyük kısmını yapmak
Mantar doku (periderm)|Odunsu gövdeyi dış etkilerden korumak
`);

const RANK = N(`
Alem|7
Şube|6
Sınıf|5
Takım|4
Familya (aile)|3
Cins|2
Tür|1
`);

const MOLEC = L(`
Glikoz|Karbonhidrat
Fruktoz|Karbonhidrat
Sakkaroz|Karbonhidrat
Laktoz|Karbonhidrat
Maltoz|Karbonhidrat
Nişasta|Karbonhidrat
Glikojen|Karbonhidrat|Hayvanlarda ve mantarlarda depo karbonhidrattır.
Selüloz|Karbonhidrat
Kitin|Karbonhidrat
Hemoglobin|Protein
Keratin|Protein
Kolajen|Protein
Miyozin|Protein
Albümin|Protein
Kazein|Protein
Trigliserit|Lipit
Fosfolipit|Lipit|Hücre zarının temel yapı taşıdır.
Kolesterol|Lipit
Balmumu|Lipit
DNA|Nükleik asit
mRNA|Nükleik asit
tRNA|Nükleik asit
`);

const HEART = L(`
Fil|4 odacıklı
Yarasa|4 odacıklı
Balina|4 odacıklı
Kanguru|4 odacıklı
Penguen|4 odacıklı
Kartal|4 odacıklı
Baykuş|4 odacıklı
Timsah|4 odacıklı|Sürüngenler arasında dört odacıklı kalbe sahip olmasıyla ayrılır.
Kertenkele|3 odacıklı
Kaplumbağa|3 odacıklı
Yılan|3 odacıklı
Kurbağa|3 odacıklı
Semender|3 odacıklı
Köpek balığı|2 odacıklı
Somon|2 odacıklı
Hamsi|2 odacıklı
Denizatı|2 odacıklı
`);

const TEMP = L(`
Fil|Vücut sıcaklığı sabit
Yunus|Vücut sıcaklığı sabit
Yarasa|Vücut sıcaklığı sabit
Kirpi|Vücut sıcaklığı sabit
Penguen|Vücut sıcaklığı sabit
Deve kuşu|Vücut sıcaklığı sabit
Kartal|Vücut sıcaklığı sabit
Fok|Vücut sıcaklığı sabit
Kertenkele|Vücut sıcaklığı değişken
Timsah|Vücut sıcaklığı değişken
Kurbağa|Vücut sıcaklığı değişken
Yılan|Vücut sıcaklığı değişken
Somon|Vücut sıcaklığı değişken
Semender|Vücut sıcaklığı değişken
Kaplumbağa|Vücut sıcaklığı değişken
Köpek balığı|Vücut sıcaklığı değişken
`);

const BREATH = L(`
Balık|Solungaç
İribaş (kurbağa larvası)|Solungaç
Böcek|Trake (soluk boruları)
Toprak solucanı|Deri
Memeli|Akciğer
Sürüngen|Akciğer
`);

const GENETIC = L(`
Hemofili|Kalıtsal hastalık
Renk körlüğü|Kalıtsal hastalık
Orak hücre anemisi|Kalıtsal hastalık
Kistik fibrozis|Kalıtsal hastalık
Fenilketonüri|Kalıtsal hastalık
Talasemi (Akdeniz anemisi)|Kalıtsal hastalık
Albinizm|Kalıtsal hastalık
Huntington hastalığı|Kalıtsal hastalık
Grip|Bulaşıcı hastalık
Kızamık|Bulaşıcı hastalık
Verem|Bulaşıcı hastalık
Kolera|Bulaşıcı hastalık
Sıtma|Bulaşıcı hastalık
Kuduz|Bulaşıcı hastalık
Su çiçeği|Bulaşıcı hastalık
Boğmaca|Bulaşıcı hastalık
`);

const CIRC = L(`
Sağ kulakçık|Vücuttan gelen kirli (oksijeni az) kanı alır
Sağ karıncık|Kanı akciğer atardamarıyla akciğerlere pompalar
Sol kulakçık|Akciğerlerden gelen temiz (oksijenli) kanı alır
Sol karıncık|Temiz kanı aort ile bütün vücuda pompalar|Duvarı en kalın odacıktır.
Aort|Vücudun en büyük atardamarıdır
Akciğer toplardamarı|Akciğerden kalbe oksijenli kan taşıyan toplardamardır
Akciğer atardamarı|Kalpten akciğere oksijeni az kan taşıyan atardamardır
Kalp kapakçıkları|Kanın geri kaçmasını önler
`);

const SENSE = L(`
Çubuk hücreleri|Loş ışıkta görmeyi sağlar
Koni hücreleri|Renkli görmeyi sağlar
Göz merceği|Işığı kırarak görüntüyü ağ tabakaya odaklar
İris|Göz bebeğinin büyüklüğünü ayarlayarak içeri giren ışığı düzenler
Kulak zarı|Ses dalgalarıyla titreşir
Yarım daire kanalları|Vücudun dengesini algılar
Östaki borusu|Orta kulak ile yutak arasında basıncı dengeler
Salyangoz (koklea)|Ses titreşimlerini sinir uyarısına çevirir
Tat tomurcukları|Tatları algılar
Koku epiteli|Kokuları algılar
`);

const ECO = L(`
Ot|Üretici
Alg|Üretici
Siyanobakteri|Üretici
Meşe ağacı|Üretici
Tavşan|Tüketici
Aslan|Tüketici
Çekirge|Tüketici
Kurbağa|Tüketici
Kartal|Tüketici
Küf mantarı|Ayrıştırıcı
Çürükçül bakteri|Ayrıştırıcı
Şapkalı mantar|Ayrıştırıcı
`);

const PAT = { 'Virüs': 'bir virüstür', 'Bakteri': 'bir bakteridir', 'Mantar': 'bir mantardır', 'Tek hücreli parazit (protist)': 'tek hücreli bir parazittir (protist)' };
const PATN = { 'Virüs': 'bir virüs DEĞİLDİR', 'Bakteri': 'bir bakteri DEĞİLDİR', 'Mantar': 'bir mantar DEĞİLDİR', 'Tek hücreli parazit (protist)': 'tek hücreli bir parazit DEĞİLDİR' };
const ACC = { 'Karbonhidratlar': 'karbonhidratları', 'Proteinler': 'proteinleri', 'Yağlar': 'yağları', 'Nükleik asitler': 'nükleik asitleri' };

export const BIO = {
  organel: { k: 'pair', d: 1, src: `${MEB} · ${OS('4. bölüm')}`, rows: ORGANEL,
    q: a => `${a} hücrede hangi görevi üstlenir?`,
    r: b => `“${b}” hangi hücre yapısının görevidir?`, e: (a, b) => `${a}: ${b}.` },
  vitamin: { k: 'pair', d: 2, src: `${MEB} · DSÖ beslenme rehberleri`, rows: VITAMIN,
    q: a => `${a} eksikliği hangi rahatsızlığa yol açar?`, r: b => `“${b}” hangi besin ögesinin eksikliğinde görülür?`, e: (a, b) => `${a} eksikliği → ${b}.` },
  hormon: { k: 'group', d: 3, src: `${MEB} · ${OS('37. bölüm')}`, rows: HORMON,
    q: a => `${a} hormonu hangi bezden salgılanır?`, has: g => `Aşağıdaki hormonlardan hangisi ${g} tarafından salgılanır?`, not: g => `Aşağıdaki hormonlardan hangisi ${g} tarafından salgılanmaz?`,
    e: (a, g) => `${a} → ${g}.`, notE: g => `${g} hormonudur` },
  organ: { k: 'group', d: 1, src: MEB, rows: ORGAN,
    q: a => `${a} hangi sisteme aittir?`, has: g => `Aşağıdaki yapılardan hangisi ${g.toLocaleLowerCase('tr')} içinde yer alır?`, not: g => `Aşağıdaki yapılardan hangisi ${g.toLocaleLowerCase('tr')} içinde yer almaz?`,
    e: (a, g) => `${a}, ${g.toLocaleLowerCase('tr')} içinde yer alır.`, notE: g => `${g.toLocaleLowerCase('tr')} içindedir` },
  hayvan: { k: 'group', d: 1, src: `${MEB} · canlıların sınıflandırılması`, rows: ANIMAL,
    q: a => `${a} hangi hayvan grubuna girer?`, has: g => `Aşağıdaki hayvanlardan hangisi ${g.toLocaleLowerCase('tr')} grubundandır?`, not: g => `Aşağıdaki hayvanlardan hangisi ${g.toLocaleLowerCase('tr')} grubundan DEĞİLDİR?`,
    e: (a, g) => `${a} → ${g}.`, notE: g => `${g.toLocaleLowerCase('tr')} grubundadır` },
  etken: { k: 'group', d: 2, src: 'DSÖ hastalık bilgi sayfaları · MEB Biyoloji', rows: PATHOGEN,
    q: a => `Etkeni sorulan hastalık: ${a}. Bu etken hangi gruptandır?`, has: g => `Aşağıdaki hastalıklardan hangisinin etkeni ${PAT[g]}?`,
    not: g => `Aşağıdaki hastalıklardan hangisinin etkeni ${PATN[g]}?`,
    e: (a, g) => `${a} etkeni: ${g.toLocaleLowerCase('tr')}.`, notE: g => `etkeni ${g.toLocaleLowerCase('tr')}` },
  kromozom: { k: 'num', d: 3, src: `${OS('13. bölüm')} · tür genom kayıtları`, rows: CHROM, spread: [2, 4, 6, 8, 10], min: 4, fmt: v => String(v),
    q: a => `${a} türünün vücut hücrelerinde (2n) kaç kromozom bulunur?`, e: (a, v) => `${a}: 2n = ${v}. Kromozom sayısı canlının gelişmişliğini göstermez; türden türe değişir.` },
  bilimci: { k: 'pair', d: 2, src: `${MEB} · Nobel Vakfı`, rows: SCI,
    q: a => `${a} biyolojiye hangi katkısıyla tanınır?`, r: b => `Kim “${b.charAt(0).toLocaleLowerCase('tr') + b.slice(1)}”?`, e: (a, b) => `${a}: ${b}.` },
  terim: { k: 'pair', d: 2, src: `${MEB} · OpenStax Biology 2e sözlüğü`, rows: TERMS,
    q: a => `Biyolojide “${a}” neyi ifade eder?`, r: b => `“${b}” tanımı hangi kavrama aittir?`, e: (a, b) => `${a}: ${b}.` },
  enzim: { k: 'group', d: 3, src: `${MEB} · sindirim sistemi`, rows: ENZYM, extra: ['Vitaminler', 'Mineraller'],
    q: a => `${a} enzimi hangi besin grubunun sindiriminde görev alır?`, has: g => `Aşağıdaki enzimlerden hangisi ${ACC[g]} sindirir?`, not: g => `Aşağıdaki enzimlerden hangisi ${ACC[g]} sindirmez?`,
    e: (a, g) => `${a} → ${g}.`, notE: g => `${ACC[g]} sindirir` },
  terimb: { k: 'pair', d: 3, src: `${MEB} · OpenStax Biology 2e sözlüğü`, rows: TERMS2,
    q: a => `Biyolojide “${a}” neyi ifade eder?`, r: b => `“${b}” tanımı hangi kavrama aittir?`, e: (a, b) => `${a}: ${b}.` },
  bitki: { k: 'pair', d: 2, src: `${MEB} · bitki biyolojisi`, rows: PLANT,
    q: a => `Bitkilerde ${a.toLocaleLowerCase('tr')} yapısının temel görevi nedir?`, r: b => `Bitkilerde “${b}” görevini hangi yapı üstlenir?`, e: (a, b) => `${a}: ${b}.` },
  basamak: { k: 'order', d: 3, most: 'max', n: 35, src: `${MEB} · canlıların sınıflandırılması`, rows: RANK,
    q: 'Sınıflandırma basamaklarından hangisi en kapsamlıdır (en çok canlıyı içerir)?', lead: 'Kapsamlıdan dara:', fmt: () => '' },
  basamakb: { k: 'order', d: 3, most: 'min', n: 35, src: `${MEB} · canlıların sınıflandırılması`, rows: RANK,
    q: 'Sınıflandırma basamaklarından hangisinde canlılar arasındaki benzerlik en fazladır?', lead: 'Dardan kapsamlıya:', fmt: () => '' },
  molekul: { k: 'group', d: 2, src: `${MEB} · canlıların temel bileşenleri`, rows: MOLEC, extra: ['Vitamin'],
    q: a => `${a} hangi organik molekül grubundandır?`, has: g => `Aşağıdakilerden hangisi bir ${g.toLocaleLowerCase('tr')} molekülüdür?`, not: g => `Aşağıdakilerden hangisi bir ${g.toLocaleLowerCase('tr')} molekülü DEĞİLDİR?`,
    e: (a, g) => `${a} → ${g.toLocaleLowerCase('tr')}.`, notE: g => `bir ${g.toLocaleLowerCase('tr')}` },
  kalp: { k: 'group', d: 2, src: `${MEB} · dolaşım sistemleri`, rows: HEART, extra: ['1 odacıklı'],
    q: a => `${a} türünün kalbi kaç odacıklıdır?`, has: g => `Aşağıdaki hayvanlardan hangisinin kalbi ${g}dır?`, not: g => `Aşağıdaki hayvanlardan hangisinin kalbi ${g} DEĞİLDİR?`,
    e: (a, g) => `${a}: kalp ${g}.`, notE: g => `kalbi ${g}` },
  isi: { k: 'group', d: 1, src: `${MEB} · omurgalılar`, rows: TEMP,
    has: g => `Aşağıdaki hayvanlardan hangisinin ${g.toLocaleLowerCase('tr')}tir?`.replace('sabittir', 'sabittir').replace('değişkentir', 'değişkendir'),
    not: () => null, e: (a, g) => `${a}: ${g.toLocaleLowerCase('tr')}.` },
  solunum: { k: 'pair', d: 2, src: `${MEB} · solunum sistemleri`, rows: BREATH,
    q: a => `${a} hangi yapıyla solunum yapar?`, e: (a, b) => `${a}: ${b}.` },
  kalitim: { k: 'group', d: 2, src: `${MEB} · kalıtım`, rows: GENETIC,
    has: g => `Aşağıdakilerden hangisi ${g.toLocaleLowerCase('tr')}tır?`.replace('hastalıktır', 'hastalıktır'), not: g => `Aşağıdakilerden hangisi ${g.toLocaleLowerCase('tr')} DEĞİLDİR?`,
    e: (a, g) => `${a}: ${g.toLocaleLowerCase('tr')}.`, notE: g => g.toLocaleLowerCase('tr') },
  kalpic: { k: 'pair', d: 2, src: `${MEB} · dolaşım sistemi`, rows: CIRC,
    q: a => `${a} için doğru ifade hangisidir?`, r: b => `“${b}” ifadesi hangi yapı için doğrudur?`, e: (a, b) => `${a}: ${b}.` },
  duyu: { k: 'pair', d: 2, src: `${MEB} · duyu organları`, rows: SENSE,
    q: a => `${a} hangi görevi yapar?`, r: b => `Hangi yapı “${b.charAt(0).toLocaleLowerCase('tr') + b.slice(1)}”?`, e: (a, b) => `${a}: ${b}.` },
  ekoloji: { k: 'group', d: 1, src: `${MEB} · ekosistem ekolojisi`, rows: ECO,
    has: g => `Aşağıdakilerden hangisi bir ${{ Üretici: 'üreticidir', Tüketici: 'tüketicidir', Ayrıştırıcı: 'ayrıştırıcıdır' }[g]}?`, not: g => `Aşağıdakilerden hangisi bir ${g.toLocaleLowerCase('tr')} DEĞİLDİR?`,
    e: (a, g) => `${a} ekosistemde ${g.toLocaleLowerCase('tr')} rolündedir.`, notE: g => g.toLocaleLowerCase('tr') },
};
