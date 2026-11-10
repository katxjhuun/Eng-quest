// Tarih bilgi tabloları — kaynaklar: MEB Ortaöğretim Tarih ve T.C. İnkılap Tarihi ve Atatürkçülük ders kitapları,
// Türk Tarih Kurumu yayınları, Britannica. Yıllar yaygın kabul gören tarihlerdir.
import { L, N } from './engine.js';

const MEB = 'MEB Ortaöğretim Tarih ders kitabı · Türk Tarih Kurumu';
const INK = 'MEB T.C. İnkılap Tarihi ve Atatürkçülük ders kitabı';
const WORLD = 'MEB Çağdaş Türk ve Dünya Tarihi · Britannica';

const EVENTS = N(`
Batı Roma İmparatorluğu’nun yıkılışı|476|Avrupa’da Orta Çağ’ın başlangıcı olarak kabul edilir.
Hicret|622|Hicri takvimin başlangıcıdır.
Talas Savaşı|751|Türklerin Müslümanlığa geçişini hızlandırdı; kâğıdın batıya yayılmasında rol oynadı.
Malazgirt Savaşı|1071|Sultan Alparslan’ın zaferiyle Anadolu’nun kapıları Türklere açıldı.
Miryokefalon Savaşı|1176|Anadolu’nun Türk yurdu olduğu kesinleşti.
Magna Carta’nın imzalanması|1215|İngiltere’de kral yetkilerini sınırlayan ilk önemli belgedir.
Kösedağ Savaşı|1243|Anadolu Selçukluları Moğollara yenildi.
Osmanlı Beyliği’nin kuruluşu (geleneksel kabul)|1299
Bursa’nın fethi|1326|Bursa Osmanlı’nın ilk başkenti oldu.
Rumeli’ye geçiş (Çimpe Kalesi)|1353
I. Kosova Savaşı|1389
Niğbolu Savaşı|1396
Ankara Savaşı|1402|Yıldırım Bayezid Timur’a yenildi; Fetret Devri başladı.
Varna Savaşı|1444
II. Kosova Savaşı|1448
İstanbul’un fethi|1453|Orta Çağ’ın sonu, Yeni Çağ’ın başlangıcı kabul edilir.
Otlukbeli Savaşı|1473
Amerika’ya ulaşılması (Kolomb)|1492
Vasco da Gama’nın Hindistan’a ulaşması|1498
Çaldıran Savaşı|1514
Mercidabık Savaşı|1516
Ridaniye Savaşı|1517|Mısır alındı; halifelik Osmanlı’ya geçti.
Belgrad’ın fethi|1521
Rodos’un fethi|1522
Mohaç Savaşı|1526|Tarihin en kısa meydan savaşlarından biri olarak anılır.
I. Viyana Kuşatması|1529
Preveze Deniz Savaşı|1538|Barbaros Hayreddin Paşa komutasında kazanıldı; Akdeniz Türk gölü hâline geldi.
İnebahtı Deniz Savaşı|1571
Kasr-ı Şirin Antlaşması|1639|Bugünkü Türkiye–İran sınırının büyük ölçüde temelidir.
Westfalya Barışı|1648
II. Viyana Kuşatması|1683
Karlofça Antlaşması|1699|Osmanlı ilk kez büyük çapta toprak kaybetti.
Pasarofça Antlaşması|1718|Lale Devri bu antlaşmayla başladı.
İlk Türk matbaasının kurulması (İbrahim Müteferrika)|1727
Patrona Halil İsyanı|1730|Lale Devri bu isyanla sona erdi.
Küçük Kaynarca Antlaşması|1774
ABD Bağımsızlık Bildirgesi|1776
Fransız İhtilali|1789
Sened-i İttifak|1808
Waterloo Savaşı|1815
Vaka-i Hayriye (Yeniçeri Ocağı’nın kaldırılması)|1826
Edirne Antlaşması|1829|Yunanistan’ın bağımsızlığı tanındı.
Tanzimat Fermanı|1839
Islahat Fermanı|1856
Amerikan İç Savaşı’nın başlaması|1861
Almanya’nın siyasi birliğini kurması|1871
I. Meşrutiyet’in ilanı (Kanun-i Esasi)|1876
Berlin Antlaşması|1878
II. Meşrutiyet’in ilanı|1908
Trablusgarp Savaşı’nın başlaması|1911
I. Balkan Savaşı’nın başlaması|1912
I. Dünya Savaşı’nın başlaması|1914
18 Mart Çanakkale Deniz Zaferi|1915
Rusya’da Ekim Devrimi|1917
Mondros Ateşkes Antlaşması|1918
Mustafa Kemal’in Samsun’a çıkışı|1919|19 Mayıs 1919, Millî Mücadele’nin başlangıcı kabul edilir.
TBMM’nin açılışı|1920|23 Nisan 1920.
Sakarya Meydan Muharebesi|1921
Büyük Taarruz|1922
Lozan Barış Antlaşması|1923|24 Temmuz 1923.
Cumhuriyet’in ilanı|1923|29 Ekim 1923.
Halifeliğin kaldırılması|1924|3 Mart 1924; aynı gün Tevhid-i Tedrisat Kanunu da kabul edildi.
Şapka Kanunu|1925
Türk Medeni Kanunu|1926
Harf İnkılabı (Yeni Türk harfleri)|1928
1929 Dünya Ekonomik Buhranı|1929
Türk Tarih Kurumu’nun kuruluşu|1931
Türk Dil Kurumu’nun kuruluşu|1932
Soyadı Kanunu|1934
Montrö Boğazlar Sözleşmesi|1936
Atatürk’ün vefatı|1938|10 Kasım 1938.
II. Dünya Savaşı’nın başlaması|1939
Hatay’ın Türkiye’ye katılması|1939
Birleşmiş Milletler’in kuruluşu|1945
Çok partili hayata geçiş (Demokrat Parti’nin kuruluşu)|1946
Kore Savaşı’nın başlaması|1950
Türkiye’nin NATO’ya girişi|1952
Sputnik 1’in fırlatılması|1957
Ay’a ilk insanlı iniş|1969
Çernobil nükleer kazası|1986
Berlin Duvarı’nın yıkılması|1989
Sovyetler Birliği’nin dağılması|1991
`);
const century = y => `${Math.floor((y - 1) / 100) + 1}. yüzyıl`;

const FOUNDERS = L(`
Göktürk Devleti|Bumin Kağan
Uygur Devleti|Kutluk Bilge Kül Kağan
Büyük Selçuklu Devleti|Tuğrul Bey
Anadolu Selçuklu Devleti|Kutalmışoğlu Süleyman Şah
Osmanlı Beyliği|Osman Bey
Danişmendliler|Danişmend Gazi
Mengücekliler|Mengücek Gazi
Çaka Beyliği|Çaka Bey
Moğol İmparatorluğu|Cengiz Han
Altın Orda Devleti|Batu Han
Timurlu Devleti|Timur
Babür İmparatorluğu|Babür Şah
Akkoyunlular|Kara Yülük Osman Bey
Türkiye Cumhuriyeti|Mustafa Kemal Atatürk
`);

const SULTANS = L(`
Orhan Bey|Bursa’nın fethi ve ilk düzenli ordunun (yaya ve müsellem) kurulması
I. Murad|I. Kosova Savaşı
Yıldırım Bayezid|İstanbul’u ilk kez kuşatan Osmanlı padişahı oldu; Ankara Savaşı’nı kaybetti
Çelebi Mehmed|Fetret Devri’ni sona erdirdi
II. Murad|Varna ve II. Kosova savaşları
II. Mehmed (Fatih)|İstanbul’un fethi
Yavuz Sultan Selim|Çaldıran Savaşı ve Mısır seferi
Kanuni Sultan Süleyman|Mohaç Savaşı ve I. Viyana Kuşatması
II. Selim|Kıbrıs’ın fethi
I. Ahmed|Sultanahmet Camii’nin yaptırılması
IV. Murad|Bağdat’ın geri alınması ve Kasr-ı Şirin Antlaşması
IV. Mehmed|II. Viyana Kuşatması
II. Mustafa|Karlofça Antlaşması
III. Ahmed|Lale Devri
I. Abdülhamid|Küçük Kaynarca Antlaşması
III. Selim|Nizam-ı Cedid ordusu
II. Mahmud|Yeniçeri Ocağı’nın kaldırılması (Vaka-i Hayriye)
Abdülmecid|Tanzimat Fermanı
Abdülaziz|Avrupa’ya seyahat eden ilk Osmanlı padişahı
II. Abdülhamid|I. Meşrutiyet’in ilanı ve Hicaz Demiryolu
V. Mehmed Reşad|Osmanlı’nın I. Dünya Savaşı’na girişi
VI. Mehmed Vahdeddin|Son Osmanlı padişahı
`);

const TREATIES = L(`
Zitvatorok Antlaşması (1606)|Avusturya
Kasr-ı Şirin Antlaşması (1639)|Safevi Devleti
Prut Antlaşması (1711)|Rusya
Küçük Kaynarca Antlaşması (1774)|Rusya
Bükreş Antlaşması (1812)|Rusya
Edirne Antlaşması (1829)|Rusya
Uşi (Ouchy) Antlaşması (1912)|İtalya
Atina Antlaşması (1913)|Yunanistan
İstanbul Antlaşması (1913)|Bulgaristan
Gümrü Antlaşması (1920)|Ermenistan
Moskova Antlaşması (1921)|Sovyet Rusya
Ankara Antlaşması (1921)|Fransa
`);

const PEOPLE = L(`
Kaşgarlı Mahmud|Divânu Lugâti’t-Türk
Yusuf Has Hacib|Kutadgu Bilig
Nizamülmülk|Siyasetname
Ahmed Yesevi|Divan-ı Hikmet
Edib Ahmed|Atabetü’l-Hakayık
Piri Reis|Kitab-ı Bahriye
Evliya Çelebi|Seyahatname
Kâtip Çelebi|Cihannüma
Uluğ Bey|Semerkant Rasathanesi
İbn-i Sina|El-Kanun fi’t-Tıb
Harezmî|Cebir biliminin temellerini atan eser (El-Kitab el-Muhtasar)
İbrahim Müteferrika|İlk Türk matbaası
Namık Kemal|Vatan Yahut Silistre
Ziya Gökalp|Türkçülüğün Esasları
Mehmet Akif Ersoy|İstiklal Marşı
Halide Edib Adıvar|Ateşten Gömlek
Hasan Tahsin|İzmir’in işgalinde düşmana ilk kurşunu atması
Nene Hatun|Aziziye Tabyaları savunması
Barbaros Hayreddin Paşa|Preveze Deniz Savaşı
Sokullu Mehmed Paşa|Don–Volga kanal projesi
Nevşehirli Damat İbrahim Paşa|Lale Devri’nin sadrazamı
Merzifonlu Kara Mustafa Paşa|II. Viyana Kuşatması’nın komutanı
Mustafa Reşid Paşa|Tanzimat Fermanı’nı okuması
Mithat Paşa|Kanun-i Esasi’yi hazırlayan heyetin başkanı
Kâzım Karabekir|Doğu Cephesi komutanı
İsmet İnönü|Lozan Barış Konferansı’nda Türk heyetinin başkanı
Martin Luther|95 Tez ve Reform hareketi
Kristof Kolomb|Amerika kıtasına ulaşan sefer (1492)
Ferdinand Macellan|Dünyanın çevresini dolaşan ilk deniz seferi
Johannes Gutenberg|Hareketli harfli matbaa
Napolyon Bonapart|Waterloo’da yenilgi
Otto von Bismarck|Almanya’nın siyasi birliği
Abraham Lincoln|ABD’de köleliğin kaldırılması
Vladimir Lenin|Rusya’da Ekim Devrimi
Hammurabi|Babil’in yazılı kanunları
Mahatma Gandhi|Hindistan’ın şiddetsiz bağımsızlık mücadelesi
Nelson Mandela|Güney Afrika’da apartheid karşıtı mücadele
Neil Armstrong|Ay’a ayak basan ilk insan
`);

const CIV = L(`
Hititler|Anadolu
Frigler|Anadolu
Lidyalılar|Anadolu
Urartular|Anadolu
İyonlar|Anadolu
Sümerler|Mezopotamya
Akadlar|Mezopotamya
Babilliler|Mezopotamya
Asurlular|Mezopotamya
Medler|İran
Persler|İran
Elamlılar|İran
Fenikeliler|Doğu Akdeniz kıyıları (Suriye–Lübnan)
İbraniler|Doğu Akdeniz kıyıları (Suriye–Lübnan)
Mısırlılar|Nil vadisi
Minoslular|Ege (Girit)
`);

const CONTRIB = L(`
Sümerler|Çivi yazısını bularak tarihî çağları başlattılar
Lidyalılar|Parayı ilk kez kullandılar
Fenikeliler|22 harfli alfabeyi geliştirip Akdeniz’e yaydılar
Hititler|Mısır ile bilinen en eski yazılı antlaşma olan Kadeş Antlaşması’nı imzaladılar
Babilliler|Hammurabi Kanunları’nı yazıya geçirdiler
Mısırlılar|Güneş yılına dayalı 365 günlük takvimi kullandılar
Urartular|Sulama kanalları ve barajlarıyla öne çıktılar
Frigler|Tarımı korumak için çift öküzü öldürmeye ölüm cezası veren kanunlar koydular
Asurlular|Ninova’da kil tabletlerden büyük bir kitaplık kurdular
Persler|Sardes ile Susa arasında Kral Yolu’nu yaptılar
Çinliler|Kâğıdı icat ettiler
Romalılar|On İki Levha Kanunları ile Roma hukukunu başlattılar
`);

const REFORM = L(`
Saltanatın kaldırılması|Siyasi alan
Cumhuriyet’in ilanı|Siyasi alan
Halifeliğin kaldırılması|Siyasi alan
Çok partili hayata geçiş denemeleri|Siyasi alan
Türk Medeni Kanunu|Hukuk alanı
Türk Ceza Kanunu|Hukuk alanı
Borçlar Kanunu|Hukuk alanı
Ticaret Kanunu|Hukuk alanı
Şer’iye mahkemelerinin kaldırılması|Hukuk alanı
Tevhid-i Tedrisat Kanunu|Eğitim ve kültür alanı
Harf İnkılabı|Eğitim ve kültür alanı
Millet Mektepleri|Eğitim ve kültür alanı
Türk Tarih Kurumu|Eğitim ve kültür alanı
Türk Dil Kurumu|Eğitim ve kültür alanı
1933 Üniversite Reformu|Eğitim ve kültür alanı
Şapka Kanunu|Toplumsal alan
Tekke ve zaviyelerin kapatılması|Toplumsal alan
Soyadı Kanunu|Toplumsal alan
Miladi takvim, uluslararası saat ve metrik sisteme geçiş|Toplumsal alan
Kıyafet Kanunu (1934)|Toplumsal alan
İzmir İktisat Kongresi|Ekonomik alan
Aşar vergisinin kaldırılması|Ekonomik alan
Kabotaj Kanunu|Ekonomik alan
Teşvik-i Sanayi Kanunu|Ekonomik alan
Türkiye İş Bankası’nın kurulması|Ekonomik alan
I. Beş Yıllık Sanayi Planı|Ekonomik alan
Merkez Bankası’nın kurulması|Ekonomik alan
`);

const FRONTS = L(`
I. İnönü Muharebesi|Batı Cephesi
II. İnönü Muharebesi|Batı Cephesi
Kütahya–Eskişehir Muharebeleri|Batı Cephesi
Sakarya Meydan Muharebesi|Batı Cephesi
Büyük Taarruz|Batı Cephesi
Başkomutanlık Meydan Muharebesi|Batı Cephesi
Sarıkamış ve Kars’ın geri alınması (1920)|Doğu Cephesi
Gümrü Antlaşması|Doğu Cephesi
Antep savunması|Güney Cephesi
Maraş savunması|Güney Cephesi
Urfa savunması|Güney Cephesi
Ankara Antlaşması (1921)|Güney Cephesi
`);

export const TAR = {
  yil: { k: 'num', d: 2, src: MEB, rows: EVENTS, spread: [1, 2, 3, 4, 6, 10, 15, 20], fmt: v => String(v),
    q: a => `${a} hangi yılda gerçekleşmiştir?`, e: (a, v) => `${a}: ${v}.` },
  once: { k: 'order', d: 3, most: 'min', n: 300, src: MEB, rows: EVENTS,
    q: 'Aşağıdaki olaylardan hangisi en önce gerçekleşmiştir?', lead: 'Kronolojik sıra:', fmt: v => String(v) },
  sonra: { k: 'order', d: 3, most: 'max', n: 220, src: MEB, rows: EVENTS,
    q: 'Aşağıdaki olaylardan hangisi en son gerçekleşmiştir?', lead: 'Sondan geriye sıra:', fmt: v => String(v) },
  yuzyil: { k: 'group', d: 2, src: MEB, rows: EVENTS.map(([a, y, n]) => [a, century(y), n ? `(${y}) ${n}` : `(${y})`]),
    q: a => `${a} hangi yüzyılda gerçekleşmiştir?`, e: (a, g) => `${a} ${g}da gerçekleşti.` },
  kurucu: { k: 'pair', d: 2, src: MEB, rows: FOUNDERS,
    q: a => `${a} kimin önderliğinde kurulmuştur?`, r: b => `${b} hangi devletin kurucusudur?`, e: (a, b) => `${a} ${b} önderliğinde kuruldu.` },
  padisah: { k: 'pair', d: 3, src: MEB, rows: SULTANS,
    q: a => `${a} döneminin en bilinen olayı hangisidir?`, r: b => `“${b}” hangi Osmanlı hükümdarının dönemiyle özdeşleşir?`, e: (a, b) => `${a} dönemi: ${b}.` },
  antlasma: { k: 'pair', d: 3, src: MEB, rows: TREATIES,
    q: a => `${a} Osmanlı Devleti ya da TBMM ile hangi devlet arasında imzalanmıştır?`, e: (a, b) => `${a} ${b} ile imzalandı.` },
  kisi: { k: 'pair', d: 2, src: `${MEB} · ${WORLD}`, rows: PEOPLE,
    q: a => `${a} aşağıdakilerden hangisiyle tanınır?`, r: b => `“${b}” denince akla gelen tarihî kişi kimdir?`, e: (a, b) => `${a}: ${b}.` },
  medeniyet: { k: 'group', d: 2, src: MEB, rows: CIV,
    q: a => `İlk Çağ’da ${a} hangi bölgede yaşamıştır?`, has: g => `Aşağıdaki İlk Çağ uygarlıklarından hangisi ${g} bölgesinde kurulmuştur?`, not: g => `Aşağıdaki uygarlıklardan hangisi ${g} bölgesinde kurulmamıştır?`,
    e: (a, g) => `${a}, İlk Çağ’da ${g} bölgesinde yaşadı.`, notE: g => `${g} bölgesinde yaşadı` },
  katki: { k: 'pair', d: 2, src: MEB, rows: CONTRIB,
    q: a => `${a} uygarlık tarihine hangi katkısıyla bilinir?`, r: b => `Hangi uygarlık “${b.charAt(0).toLocaleLowerCase('tr') + b.slice(1)}”?`, e: (a, b) => `${a}: ${b}.` },
  inkilap: { k: 'group', d: 2, src: INK, rows: REFORM,
    q: a => `“${a}” Atatürk inkılaplarının hangi alanında yer alır?`, has: g => `Aşağıdaki inkılaplardan hangisi “${g}” başlığı altında yer alır?`, not: g => `Aşağıdaki inkılaplardan hangisi “${g}” başlığı altında yer ALMAZ?`,
    e: (a, g) => `${a} → ${g}.`, notE: g => `“${g}” başlığındadır` },
  cephe: { k: 'group', d: 3, src: INK, rows: FRONTS, extra: ['Kafkas Cephesi'],
    q: a => `Millî Mücadele’de “${a}” hangi cephede yer alır?`, has: g => `Aşağıdakilerden hangisi Millî Mücadele’nin ${g}’nde gerçekleşmiştir?`, not: g => `Aşağıdakilerden hangisi ${g} ile ilgili DEĞİLDİR?`,
    e: (a, g) => `${a}, Millî Mücadele’nin ${g}’ndedir.`, notE: g => `${g}’ndedir` },
};
