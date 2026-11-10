// Bilim bilgi tabloları — kaynaklar: BIPM SI Broşürü (9. baskı), NASA ve ESA görev sayfaları, IUPAC periyodik tablosu,
// Nobel Vakfı, Britannica, MEB Fen Bilimleri ve Fizik ders kitapları.
import { L, N } from './engine.js';

const BIPM = 'BIPM SI Broşürü (9. baskı, 2019)';
const NASA = 'NASA Güneş Sistemi Keşfi · ESA';
const BRIT = 'Britannica · Nobel Vakfı';
const MEB = 'MEB Fen Bilimleri ders kitabı';

const SI = L(`
Uzunluk|metre (m)
Kütle|kilogram (kg)
Zaman|saniye (s)
Elektrik akımı|amper (A)
Termodinamik sıcaklık|kelvin (K)
Madde miktarı|mol
Işık şiddeti|kandela (cd)
Kuvvet|newton (N)
Enerji ve iş|joule (J)
Güç|watt (W)
Basınç|pascal (Pa)
Frekans|hertz (Hz)
Elektrik yükü|coulomb (C)
Elektrik potansiyeli (gerilim)|volt (V)
Elektrik direnci|ohm (Ω)
Manyetik akı|weber (Wb)
Manyetik akı yoğunluğu|tesla (T)
Elektriksel sığa|farad (F)
Endüktans|henry (H)
Radyoaktif aktiflik|becquerel (Bq)
Soğurulan radyasyon dozu|gray (Gy)
Aydınlanma|lüks (lx)
Işık akısı|lümen (lm)
Düzlem açı|radyan (rad)
`);

const EPON = L(`
newton|Isaac Newton
joule|James Prescott Joule
watt|James Watt
pascal|Blaise Pascal
hertz|Heinrich Hertz
volt|Alessandro Volta
ohm|Georg Simon Ohm
amper|André-Marie Ampère
kelvin|Lord Kelvin (William Thomson)
coulomb|Charles-Augustin de Coulomb
tesla|Nikola Tesla
weber|Wilhelm Weber
farad|Michael Faraday
henry|Joseph Henry
becquerel|Henri Becquerel
sievert|Rolf Sievert
gray|Louis Harold Gray
Celsius ölçeği|Anders Celsius
`);

const PLANET_ORDER = N(`
Merkür|1
Venüs|2
Dünya|3
Mars|4
Jüpiter|5
Satürn|6
Uranüs|7
Neptün|8
`);

const PLANET_FACT = L(`
Güneş’e en yakın gezegen|Merkür
Yüzeyi en sıcak gezegen|Venüs|Kalın karbondioksit atmosferi sera etkisiyle yüzeyi yaklaşık 465 °C’ye çıkarır.
Demir oksit yüzünden “Kızıl Gezegen” diye anılan gezegen|Mars
Güneş Sistemi’nin en büyük gezegeni|Jüpiter
Belirgin halka sistemiyle en çok tanınan gezegen|Satürn
Ekseni neredeyse yan yatmış biçimde dönen gezegen|Uranüs
Güneş’e en uzak gezegen|Neptün|Plüton 2006’dan beri cüce gezegen sayılır.
Üzerinde yaşam olduğu bilinen tek gezegen|Dünya
`);

const PLANET_TYPE = L(`
Merkür|Kayaç (karasal) gezegen
Venüs|Kayaç (karasal) gezegen
Dünya|Kayaç (karasal) gezegen
Mars|Kayaç (karasal) gezegen
Jüpiter|Gaz devi
Satürn|Gaz devi
Uranüs|Buz devi
Neptün|Buz devi
Plüton|Cüce gezegen
Ceres|Cüce gezegen
Eris|Cüce gezegen
`);

const INVENT = L(`
Telefon (1876 patenti)|Alexander Graham Bell
Ticari akkor ampul|Thomas Edison
Fonograf|Thomas Edison
Telgraf ve Mors alfabesi|Samuel Morse
Telsiz telgraf (radyo)|Guglielmo Marconi
Hareketli harfli matbaa|Johannes Gutenberg
Geliştirilmiş buhar makinesi|James Watt
Dinamit|Alfred Nobel
İlk motorlu ve kontrollü uçuş|Wright kardeşler
Elektrik pili|Alessandro Volta
Cıvalı termometre|Daniel Gabriel Fahrenheit
Paratoner|Benjamin Franklin
Sinematograf|Lumière kardeşler
Benzinli otomobil (1886 patenti)|Karl Benz
Dizel motoru|Rudolf Diesel
World Wide Web|Tim Berners-Lee
Barometre|Evangelista Torricelli
Sarkaçlı saat|Christiaan Huygens
Analitik makine tasarımı|Charles Babbage
İlk bilgisayar algoritması|Ada Lovelace
Turing makinesi kavramı|Alan Turing
Transistör|Bardeen, Brattain ve Shockley
`);

const DISCO = L(`
X-ışınlarının keşfi|Wilhelm Röntgen
Radyoaktivitenin keşfi|Henri Becquerel
Polonyum ve radyumun keşfi|Marie ve Pierre Curie
Görelilik kuramı|Albert Einstein
Evrensel kütle çekim yasası|Isaac Newton
Gezegenlerin hareket yasaları|Johannes Kepler
Güneş merkezli evren modeli|Nikolaus Kopernik
Elektromanyetik indüksiyon|Michael Faraday
Elektromanyetizma denklemleri|James Clerk Maxwell
Periyodik tablo|Dmitri Mendeleyev
Atom çekirdeğinin keşfi|Ernest Rutherford
Enerjinin kuantumlu olduğu fikri|Max Planck
Belirsizlik ilkesi|Werner Heisenberg
Kaldırma kuvveti ilkesi|Arşimet
Doppler etkisi|Christian Doppler
Elektronun keşfi|J. J. Thomson
Nötronun keşfi|James Chadwick
Jüpiter’in dört büyük uydusunun keşfi|Galileo Galilei
Kara deliklerin ışıma yapabileceği öngörüsü|Stephen Hawking
Evrenin genişlediğinin gözlenmesi|Edwin Hubble
`);

const FIELDS = L(`
Astronomi|Gök cisimleri ve uzay
Jeoloji|Yerkürenin yapısı ve kayaçlar
Meteoroloji|Atmosfer olayları ve hava durumu
Genetik|Kalıtım ve genler
Botanik|Bitkiler
Zooloji|Hayvanlar
Mikrobiyoloji|Mikroorganizmalar
Paleontoloji|Fosiller ve geçmiş yaşam
Sismoloji|Depremler ve deprem dalgaları
Oşinografi|Okyanuslar ve denizler
Entomoloji|Böcekler
Ornitoloji|Kuşlar
İktiyoloji|Balıklar
Herpetoloji|Sürüngenler ve iki yaşamlılar
Mikoloji|Mantarlar
Viroloji|Virüsler
Kardiyoloji|Kalp ve damar hastalıkları
Nöroloji|Sinir sistemi hastalıkları
Dermatoloji|Deri hastalıkları
Hematoloji|Kan ve kan hastalıkları
Onkoloji|Kanser
Farmakoloji|İlaçlar ve etkileri
Arkeoloji|Kazılarla geçmiş kültürlerin kalıntıları
Antropoloji|İnsan ve insan kültürleri
Kriptografi|Şifreleme
Kozmoloji|Evrenin kökeni ve evrimi
Volkanoloji|Yanardağlar
Glasiyoloji|Buzullar
Hidroloji|Yer üstü ve yer altı suları
Optik|Işık ve davranışı
Akustik|Ses ve titreşim
Termodinamik|Isı ve enerji dönüşümleri
Kristalografi|Kristallerin yapısı
Taksonomi|Canlıların sınıflandırılması
`);

const TOOLS = L(`
Termometre|Sıcaklık
Barometre|Açık hava basıncı
Anemometre|Rüzgâr hızı
Higrometre|Havadaki nem
Sismograf|Deprem dalgaları
Ampermetre|Elektrik akımı
Voltmetre|Gerilim (potansiyel fark)
Ohmmetre|Elektrik direnci
Dinamometre|Kuvvet
Manometre|Kapalı kaptaki gaz basıncı
Kronometre|Geçen süre
Takometre|Dönme hızı (devir)
Plüviyometre|Yağış miktarı
Altimetre|Yükseklik
Dansimetre (hidrometre)|Sıvının yoğunluğu
Spektroskop|Işığın tayfı
Geiger sayacı|İyonlaştırıcı radyasyon
Odometre|Alınan yol
Desibelmetre|Ses düzeyi
Pusula|Yön
Tansiyon aleti (sfigmomanometre)|Kan basıncı
pH metre|Asitlik–bazlık
Lüksmetre|Aydınlanma düzeyi
`);

const SPACE = L(`
İlk yapay uydu|Sputnik 1|1957’de Sovyetler Birliği fırlattı.
Uzaya çıkan ilk insan|Yuri Gagarin|12 Nisan 1961, Vostok 1.
Ay’a ayak basan ilk insan|Neil Armstrong|20 Temmuz 1969, Apollo 11.
Uzaya çıkan ilk kadın|Valentina Tereşkova
İnsanları ilk kez Ay’a indiren görev|Apollo 11
İlk uzay istasyonu|Salyut 1
1990’da yörüngeye yerleştirilen ünlü uzay teleskobu|Hubble Uzay Teleskobu
2021’de Mars’a inen NASA keşif aracı|Perseverance
Plüton’un yanından geçip yakın görüntülerini çeken uzay aracı|New Horizons
Yıldızlararası uzaya ulaşan ilk insan yapımı cisim|Voyager 1
Türkiye’nin ilk astronotu|Alper Gezeravcı
Türkiye’nin ilk yerli haberleşme uydusu|Türksat 6A
Bir kuyruklu yıldızın etrafında yörüngeye giren ilk uzay aracı|Rosetta
Ay’ın uzak yüzüne ilk yumuşak inişi yapan araç|Chang’e 4
2021’de fırlatılan kızılötesi uzay teleskobu|James Webb Uzay Teleskobu
`);

const YEARS = N(`
Kopernik’in Güneş merkezli modelini yayımlaması|1543
Galileo’nun teleskopla Jüpiter’in uydularını görmesi|1610
Newton’un Principia’yı yayımlaması|1687
Watt’ın buhar makinesi patenti|1769
Volta pilinin tanıtılması|1800
Faraday’ın elektromanyetik indüksiyonu keşfi|1831
Darwin’in Türlerin Kökeni’ni yayımlaması|1859
Mendeleyev’in periyodik tablosu|1869
Bell’in telefon patenti|1876
Edison’ın uzun süre yanan ampulü başarıyla denemesi|1879
Benz’in otomobil patenti|1886
Röntgen’in X-ışınlarını keşfi|1895
Curie’lerin radyumu keşfi|1898
Planck’ın kuantum hipotezi|1900
Wright kardeşlerin ilk motorlu uçuşu|1903
Einstein’ın özel görelilik makalesi|1905
Rutherford’un atom çekirdeğini ortaya koyması|1911
Einstein’ın genel görelilik kuramı|1915
Fleming’in penisilini keşfi|1928
Hubble’ın evrenin genişlediğini göstermesi|1929
Chadwick’in nötronu keşfi|1932
Transistörün icadı|1947
DNA’nın çift sarmal yapısının yayımlanması|1953
Sputnik 1’in fırlatılması|1957
Gagarin’in uzay uçuşu|1961
Apollo 11’in Ay’a inişi|1969
Berners-Lee’nin Web önerisi|1989
Hubble Uzay Teleskobu’nun fırlatılması|1990
Dolly koyununun klonlanması|1996
İnsan Genom Projesi’nin tamamlanması|2003
Higgs bozonunun keşfinin duyurulması|2012
Kütle çekim dalgalarının ilk gözlenmesi|2015
Kara deliğin ilk görüntüsünün yayımlanması|2019
James Webb Uzay Teleskobu’nun fırlatılması|2021
`);

const ELEM = L(`
H|Hidrojen
He|Helyum
Li|Lityum
Be|Berilyum
B|Bor
C|Karbon
N|Azot
O|Oksijen
F|Flor
Ne|Neon
Na|Sodyum
Mg|Magnezyum
Al|Alüminyum
Si|Silisyum
P|Fosfor
S|Kükürt
Cl|Klor
Ar|Argon
K|Potasyum
Ca|Kalsiyum
Ti|Titanyum
Cr|Krom
Mn|Mangan
Fe|Demir
Co|Kobalt
Ni|Nikel
Cu|Bakır
Zn|Çinko
Br|Brom
Kr|Kripton
Ag|Gümüş
Sn|Kalay
I|İyot
Xe|Ksenon
W|Tungsten
Pt|Platin
Au|Altın
Hg|Cıva
Pb|Kurşun
U|Uranyum
Ra|Radyum
Rn|Radon
Sr|Stronsiyum
Ba|Baryum
As|Arsenik
Se|Selenyum
Bi|Bizmut
Sb|Antimon
`);

const MC = L(`
Işığın boşluktaki hızı yaklaşık kaç km/s’dir?|300.000|30.000; 3.000.000; 150.000|Tam değer 299.792,458 km/s’dir; metre bu değerle tanımlanır.
Sesin 20 °C’deki havada yayılma hızı yaklaşık kaç m/s’dir?|343|34; 1.500; 3.430|Ses suda yaklaşık 1.500 m/s, çelikte daha da hızlı yayılır.
Dünya yüzeyinde yer çekimi ivmesi yaklaşık kaçtır?|9,8 m/s²|1,6 m/s²; 98 m/s²; 3,7 m/s²|Standart değer 9,80665 m/s²’dir; Ay’da yaklaşık 1,6 m/s²’dir.
Mutlak sıfır kaç °C’dir?|−273,15 °C|−100 °C; 0 °C; −459,67 °C|0 K = −273,15 °C; −459,67 ise Fahrenheit cinsindendir.
Güneş ışığının Dünya’ya ulaşması yaklaşık ne kadar sürer?|8 dakika 20 saniye|8 saniye; 1 saat; 1 gün|Ortalama uzaklık yaklaşık 150 milyon km’dir (1 astronomi birimi).
Dünya ile Ay arasındaki ortalama uzaklık yaklaşık ne kadardır?|384.000 km|38.400 km; 3,8 milyon km; 150 milyon km|Ay’dan yansıyan ışık Dünya’ya yaklaşık 1,3 saniyede ulaşır.
Evrenin yaşı yaklaşık kaç yıl olarak hesaplanmaktadır?|13,8 milyar|4,6 milyar; 6.000; 100 milyar|Planck uydusunun kozmik mikrodalga arka plan ölçümleri bu değeri verir.
Dünya’nın yaşı yaklaşık kaç yıldır?|4,5 milyar|13,8 milyar; 450 milyon; 10.000|Göktaşlarının radyometrik tarihlendirmesi yaklaşık 4,54 milyar yıl verir.
Bir ışık yılı neyin ölçüsüdür?|Uzaklık|Zaman; Işık şiddeti; Hız|Işığın bir yılda aldığı yol, yaklaşık 9,46 trilyon km.
Saf su deniz seviyesinde kaç °C’de kaynar?|100|90; 110; 120|Yükseldikçe basınç azalır ve su daha düşük sıcaklıkta kaynar.
İnsan genomunda yaklaşık kaç baz çifti bulunur?|3 milyar|3 milyon; 30 bin; 300 milyar|İnsan Genom Projesi yaklaşık 3,1 milyar baz çifti belirledi.
Atom numarası neyi gösterir?|Çekirdekteki proton sayısını|Nötron sayısını; Kütleyi; Elektron katmanı sayısını|Elementi belirleyen protondur.
Kütle çekimi en iyi hangi kuramla açıklanır?|Genel görelilik|Kuantum renk dinamiği; Termodinamiğin birinci yasası; Kıtaların kayması|Einstein’ın 1915 kuramı kütle çekimini uzay-zamanın bükülmesi olarak açıklar.
Gökkuşağının oluşmasının temel nedeni nedir?|Işığın su damlalarında kırılıp yansıması|Işığın emilmesi; Ozon tabakası; Rüzgâr|Farklı renkler farklı açılarla kırıldığı için beyaz ışık tayfına ayrılır.
Gökyüzünün gündüz mavi görünmesinin nedeni nedir?|Havadaki moleküllerin mavi ışığı daha çok saçması (Rayleigh saçılması)|Okyanusların yansıması; Ozonun rengi; Güneş’in mavi ışık yayması|Kısa dalga boylu mavi ışık daha çok saçılır.
`);

export const BIL = {
  si: { k: 'pair', lbl: 'büyüklük — SI birimi', d: 1, src: BIPM, rows: SI,
    q: a => `SI birim sisteminde ${a.toLocaleLowerCase('tr')} biriminin adı nedir?`, r: b => `${b} hangi büyüklüğün SI birimidir?`, e: (a, b) => `${a} → ${b}.` },
  isim: { k: 'pair', lbl: 'birim — adını aldığı kişi', d: 2, src: `${BIPM} · ${BRIT}`, rows: EPON,
    q: a => `“${a}” birimi adını hangi bilim insanından alır?`, r: b => `Hangi birim ya da ölçek adını ${b} adlı bilim insanından alır?`, e: (a, b) => `${a} adını şu bilim insanından alır: ${b}.` },
  gezegenyakin: { k: 'order', d: 2, most: 'min', n: 70, src: NASA, rows: PLANET_ORDER,
    q: 'Aşağıdaki gezegenlerden hangisi Güneş’e en yakındır?', lead: 'Güneş’ten uzaklık sırası:', fmt: v => `${v}.` },
  gezegenuzak: { k: 'order', d: 2, most: 'max', n: 70, src: NASA, rows: PLANET_ORDER,
    q: 'Aşağıdaki gezegenlerden hangisi Güneş’e en uzaktır?', lead: 'Güneş’ten uzaklık sırası:', fmt: v => `${v}.` },
  gezegen: { k: 'pair', lbl: 'özellik — gezegen', d: 1, src: NASA, rows: PLANET_FACT,
    q: a => `${a} hangisidir?`, r: b => `${b} için aşağıdakilerden hangisi doğrudur?`, e: (a, b) => `${b}: ${a.charAt(0).toLocaleLowerCase('tr') + a.slice(1)}.` },
  gezegentur: { k: 'group', lbl: 'gök cismi — türü', crit: 'gök cismi türü', d: 2, src: `${NASA} · IAU (2006) gezegen tanımı`, rows: PLANET_TYPE,
    q: a => `${a} hangi gök cismi türündendir?`, has: g => `Aşağıdakilerden hangisi bir ${g.toLocaleLowerCase('tr')}dir?`, not: g => `Aşağıdakilerden hangisi bir ${g.toLocaleLowerCase('tr')} DEĞİLDİR?`,
    e: (a, g) => `${a} → ${g.toLocaleLowerCase('tr')}.`, notE: g => g.toLocaleLowerCase('tr') },
  icat: { k: 'pair', lbl: 'icat — mucit', d: 2, src: BRIT, rows: INVENT,
    q: a => `${a} kime atfedilir?`, r: b => `${b} aşağıdakilerden hangisiyle tanınır?`, e: (a, b) => `${a} → ${b}.` },
  kesif: { k: 'pair', lbl: 'buluş — bilim insanı', d: 2, src: BRIT, rows: DISCO,
    q: a => `“${a}” hangi bilim insanıyla özdeşleşir?`, r: b => `${b} aşağıdakilerden hangisiyle tanınır?`, e: (a, b) => `${a} → ${b}.` },
  dal: { k: 'pair', lbl: 'bilim dalı — konusu', d: 2, src: 'TDK Bilim ve Sanat Terimleri Sözlüğü · Britannica', rows: FIELDS,
    q: a => `${a} hangi konuyu inceler?`, r: b => `“${b}” konusunu inceleyen bilim dalı hangisidir?`, e: (a, b) => `${a}: ${b.charAt(0).toLocaleLowerCase('tr') + b.slice(1)} inceler.` },
  alet: { k: 'pair', lbl: 'alet — ölçtüğü', d: 1, src: `${MEB} · Dünya Meteoroloji Örgütü`, rows: TOOLS,
    q: a => `${a} neyi ölçer?`, r: b => `${b} hangi aletle ölçülür?`, e: (a, b) => `${a} → ${b.charAt(0).toLocaleLowerCase('tr') + b.slice(1)}.` },
  uzay: { k: 'pair', lbl: 'tanım — ad', d: 2, src: `${NASA} · Türkiye Uzay Ajansı`, rows: SPACE,
    q: a => `${a} hangisidir?`, r: b => `${b} aşağıdakilerden hangisiyle bilinir?`, e: (a, b) => `${a}: ${b}.` },
  yil: { k: 'num', lbl: 'gelişme — yıl', d: 3, src: BRIT, rows: YEARS, spread: [1, 2, 3, 5, 8, 10, 15], fmt: v => String(v),
    q: a => `${a} hangi yılda gerçekleşmiştir?`, e: (a, v) => `${a}: ${v}.` },
  once: { k: 'order', d: 3, most: 'min', n: 210, src: BRIT, rows: YEARS,
    q: 'Aşağıdaki bilimsel gelişmelerden hangisi en önce gerçekleşmiştir?', lead: 'Kronolojik sıra:', fmt: v => String(v) },
  sonra: { k: 'order', d: 3, most: 'max', n: 150, src: BRIT, rows: YEARS,
    q: 'Aşağıdaki bilimsel gelişmelerden hangisi en son gerçekleşmiştir?', lead: 'Sondan geriye sıra:', fmt: v => String(v) },
  element: { k: 'pair', lbl: 'sembol — element', d: 1, src: 'IUPAC periyodik tablosu', rows: ELEM,
    q: a => `Kimyasal sembolü “${a}” olan element hangisidir?`, r: b => `${b} elementinin sembolü nedir?`, e: (a, b) => `${b} → ${a}.` },
  sabit: { k: 'mc', d: 2, src: `${BIPM} · ${NASA}`, rows: MC },
};
