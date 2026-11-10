// Coğrafya bilgi tabloları — kaynaklar: CIA World Factbook, BM üye devletler listesi, T.C. Karayolları / İçişleri Bakanlığı il kodları,
// MEB Coğrafya ders kitapları (bölgeler 1941 Birinci Coğrafya Kongresi sınırlarıyla), USGS ve ulusal kartografya kurumları.
import { L, N } from './engine.js';

const CF = 'CIA World Factbook · BM üye devletler listesi';
const MEB = 'MEB Ortaöğretim Coğrafya ders kitabı';

const CAPITALS = L(`
Almanya|Berlin
Fransa|Paris
İtalya|Roma
İspanya|Madrid
Portekiz|Lizbon
Birleşik Krallık|Londra
İrlanda|Dublin
Hollanda|Amsterdam
Belçika|Brüksel
İsviçre|Bern
Avusturya|Viyana
Polonya|Varşova
Çekya|Prag
Slovakya|Bratislava
Macaristan|Budapeşte
Romanya|Bükreş
Bulgaristan|Sofya
Yunanistan|Atina
Sırbistan|Belgrad
Hırvatistan|Zagreb
Slovenya|Lübliyana
Bosna-Hersek|Saraybosna
Karadağ|Podgorica
Kuzey Makedonya|Üsküp
Arnavutluk|Tiran
Danimarka|Kopenhag
Norveç|Oslo
İsveç|Stockholm
Finlandiya|Helsinki
İzlanda|Reykjavik
Estonya|Tallinn
Letonya|Riga
Litvanya|Vilnius
Ukrayna|Kiev
Belarus|Minsk
Moldova|Kişinev
Malta|Valletta
Rusya|Moskova
Gürcistan|Tiflis
Ermenistan|Erivan
Azerbaycan|Bakü
Kazakistan|Astana
Özbekistan|Taşkent
Türkmenistan|Aşkabat
Kırgızistan|Bişkek
Tacikistan|Duşanbe
Afganistan|Kabil
Pakistan|İslamabad
Hindistan|Yeni Delhi
Bangladeş|Dakka
Nepal|Katmandu
Çin|Pekin
Japonya|Tokyo
Güney Kore|Seul
Kuzey Kore|Pyongyang
Moğolistan|Ulan Batur
Vietnam|Hanoi
Tayland|Bangkok
Malezya|Kuala Lumpur
Filipinler|Manila
Myanmar|Naypyidaw
Kamboçya|Phnom Penh
Laos|Vientiane
İran|Tahran
Irak|Bağdat
Suriye|Şam
Lübnan|Beyrut
Ürdün|Amman
Suudi Arabistan|Riyad
Umman|Maskat
Birleşik Arap Emirlikleri|Abu Dabi
Katar|Doha
Bahreyn|Manama
Mısır|Kahire
Libya|Trablus
Fas|Rabat
Sudan|Hartum
Etiyopya|Addis Ababa
Kenya|Nairobi
Tanzanya|Dodoma
Uganda|Kampala
Nijerya|Abuja
Gana|Akra
Senegal|Dakar
Mali|Bamako
Somali|Mogadişu
Angola|Luanda
Zimbabve|Harare
Zambiya|Lusaka
Madagaskar|Antananarivo
Fildişi Sahili|Yamusukro
Kamerun|Yaunde
Demokratik Kongo Cumhuriyeti|Kinşasa
Amerika Birleşik Devletleri|Washington
Kanada|Ottawa
Küba|Havana
Jamaika|Kingston
Brezilya|Brasilia
Arjantin|Buenos Aires
Şili|Santiago
Peru|Lima
Kolombiya|Bogota
Venezuela|Karakas
Ekvador|Quito
Uruguay|Montevideo
Paraguay|Asunción
Avustralya|Kanberra
Yeni Zelanda|Wellington
Türkiye|Ankara
`);
const CAP_NOTE = { Avustralya: 'En büyük şehir Sidney’dir ama başkent Kanberra’dır.', Kanada: 'En büyük şehir Toronto’dur; başkent Ottawa’dır.', 'Amerika Birleşik Devletleri': 'En kalabalık şehir New York’tur; başkent Washington D.C.’dir.', Brezilya: 'Başkent 1960’ta Rio de Janeiro’dan, özel olarak planlanan Brasilia’ya taşındı.', Kazakistan: 'Başkent 1997’de Almatı’dan taşındı; 2019–2022 arasında adı Nur-Sultan’dı.', Nijerya: 'Başkent 1991’de Lagos’tan Abuja’ya taşındı.', Tanzanya: 'En büyük şehir Darüsselam’dır; yasal başkent Dodoma’dır.', Türkiye: 'Ankara 13 Ekim 1923’te başkent oldu.', İsviçre: 'Anayasada “başkent” sözcüğü geçmez; Bern “federal şehir” olarak hükûmet merkezidir.', Pakistan: 'İslamabad 1960’larda başkent olarak planlandı; en büyük şehir Karaçi’dir.', Myanmar: 'Başkent 2005–2006’da Yangon’dan Naypyidaw’a taşındı.', 'Fildişi Sahili': 'Resmî başkent Yamusukro’dur; ekonomik merkez Abidjan’dır.', Hindistan: 'Yeni Delhi, Delhi metropolünün içindedir.', 'Birleşik Arap Emirlikleri': 'En büyük şehir Dubai’dir; başkent Abu Dabi’dir.', Fas: 'En büyük şehir Kazablanka’dır; başkent Rabat’tır.' };

const CONT = L(`
Almanya|Avrupa
Fransa|Avrupa
İtalya|Avrupa
İspanya|Avrupa
Portekiz|Avrupa
İrlanda|Avrupa
Hollanda|Avrupa
Belçika|Avrupa
İsviçre|Avrupa
Avusturya|Avrupa
Polonya|Avrupa
Çekya|Avrupa
Macaristan|Avrupa
Romanya|Avrupa
Bulgaristan|Avrupa
Yunanistan|Avrupa
Sırbistan|Avrupa
Hırvatistan|Avrupa
Danimarka|Avrupa
Norveç|Avrupa
İsveç|Avrupa
Finlandiya|Avrupa
İzlanda|Avrupa
Ukrayna|Avrupa
Belarus|Avrupa
Estonya|Avrupa
Litvanya|Avrupa
Arnavutluk|Avrupa
Pakistan|Asya
Hindistan|Asya
Bangladeş|Asya
Nepal|Asya
Çin|Asya
Japonya|Asya
Güney Kore|Asya
Moğolistan|Asya
Vietnam|Asya
Tayland|Asya
Malezya|Asya
Filipinler|Asya
Kamboçya|Asya
Laos|Asya
İran|Asya
Irak|Asya
Suriye|Asya
Ürdün|Asya
Suudi Arabistan|Asya
Umman|Asya
Katar|Asya
Özbekistan|Asya
Kırgızistan|Asya
Afganistan|Asya
Libya|Afrika
Fas|Afrika
Sudan|Afrika
Etiyopya|Afrika
Kenya|Afrika
Tanzanya|Afrika
Uganda|Afrika
Nijerya|Afrika
Gana|Afrika
Senegal|Afrika
Mali|Afrika
Somali|Afrika
Angola|Afrika
Zimbabve|Afrika
Zambiya|Afrika
Madagaskar|Afrika
Kamerun|Afrika
Cezayir|Afrika
Tunus|Afrika
Güney Afrika|Afrika
Amerika Birleşik Devletleri|Kuzey Amerika
Kanada|Kuzey Amerika
Meksika|Kuzey Amerika
Küba|Kuzey Amerika
Jamaika|Kuzey Amerika
Guatemala|Kuzey Amerika
Honduras|Kuzey Amerika
Kosta Rika|Kuzey Amerika
Panama|Kuzey Amerika
Haiti|Kuzey Amerika
Brezilya|Güney Amerika
Arjantin|Güney Amerika
Şili|Güney Amerika
Peru|Güney Amerika
Kolombiya|Güney Amerika
Venezuela|Güney Amerika
Ekvador|Güney Amerika
Uruguay|Güney Amerika
Paraguay|Güney Amerika
Bolivya|Güney Amerika
Avustralya|Okyanusya
Yeni Zelanda|Okyanusya
Fiji|Okyanusya
Papua Yeni Gine|Okyanusya
Samoa|Okyanusya
Tonga|Okyanusya
`);

const REGION = {
  Marmara: 'İstanbul Edirne Kırklareli Tekirdağ Çanakkale Kocaeli Yalova Sakarya Bilecik Bursa Balıkesir',
  Ege: 'İzmir Manisa Aydın Denizli Muğla Afyonkarahisar Kütahya Uşak',
  Akdeniz: 'Antalya Isparta Burdur Mersin Adana Osmaniye Hatay Kahramanmaraş',
  'İç Anadolu': 'Ankara Konya Karaman Aksaray Niğde Nevşehir Kırşehir Kırıkkale Kayseri Sivas Yozgat Çankırı Eskişehir',
  Karadeniz: 'Zonguldak Bartın Karabük Düzce Bolu Kastamonu Sinop Samsun Amasya Tokat Çorum Ordu Giresun Trabzon Rize Artvin Gümüşhane Bayburt',
  'Doğu Anadolu': 'Erzurum Erzincan Kars Ardahan Iğdır Ağrı Van Muş Bitlis Bingöl Tunceli Elazığ Malatya Hakkari',
  'Güneydoğu Anadolu': 'Gaziantep Kilis Adıyaman Şanlıurfa Diyarbakır Mardin Batman Siirt Şırnak',
};
const REGIONS = Object.entries(REGION).flatMap(([g, s]) => s.split(' ').map(il => [il, g]));

const PLATES = 'Adana Adıyaman Afyonkarahisar Ağrı Amasya Ankara Antalya Artvin Aydın Balıkesir Bilecik Bingöl Bitlis Bolu Burdur Bursa Çanakkale Çankırı Çorum Denizli Diyarbakır Edirne Elazığ Erzincan Erzurum Eskişehir Gaziantep Giresun Gümüşhane Hakkari Hatay Isparta Mersin İstanbul İzmir Kars Kastamonu Kayseri Kırklareli Kırşehir Kocaeli Konya Kütahya Malatya Manisa Kahramanmaraş Mardin Muğla Muş Nevşehir Niğde Ordu Rize Sakarya Samsun Siirt Sinop Sivas Tekirdağ Tokat Trabzon Tunceli Şanlıurfa Uşak Van Yozgat Zonguldak Aksaray Bayburt Karaman Kırıkkale Batman Şırnak Bartın Ardahan Iğdır Yalova Karabük Kilis Osmaniye Düzce'
  .split(' ').map((il, i) => [il, String(i + 1).padStart(2, '0')]);

const TR_RIVERS = L(`
Kızılırmak|Karadeniz|Türkiye’nin sınırları içinde doğup denize dökülen en uzun akarsuyudur (yaklaşık 1355 km).
Yeşilırmak|Karadeniz|Samsun’da Çarşamba Ovası’nı oluşturarak denize ulaşır.
Sakarya|Karadeniz
Filyos (Yenice)|Karadeniz
Çoruh|Karadeniz|Gürcistan’ın Batum şehri yakınında denize dökülür.
Seyhan|Akdeniz|Ceyhan ile birlikte Çukurova’yı oluşturur.
Ceyhan|Akdeniz
Göksu|Akdeniz|Silifke yakınında Göksu Deltası’nı oluşturur.
Asi|Akdeniz|Kuzeye doğru akmasıyla bilinir; Hatay’da denize dökülür.
Dalaman Çayı|Akdeniz
Aksu Çayı|Akdeniz
Köprüçay|Akdeniz
Manavgat Çayı|Akdeniz
Gediz|Ege Denizi
Büyük Menderes|Ege Denizi|Menderes (büklüm) sözcüğü bu nehrin kıvrımlı akışından gelir.
Küçük Menderes|Ege Denizi
Bakırçay|Ege Denizi
Meriç|Ege Denizi|Türkiye–Yunanistan sınırının bir bölümünü çizer.
Susurluk|Marmara Denizi
Biga Çayı|Marmara Denizi
Gönen Çayı|Marmara Denizi
Fırat|Basra Körfezi|Dicle ile Irak’ta birleşip Şattülarap adıyla Basra Körfezi’ne dökülür.
Dicle|Basra Körfezi|Fırat ile birleşip Şattülarap adıyla Basra Körfezi’ne dökülür.
Aras|Hazar Denizi|Kura ile birleşerek Hazar Denizi’ne ulaşır.
Kura|Hazar Denizi|Ardahan’dan doğar; Gürcistan ve Azerbaycan’dan geçerek Hazar Denizi’ne dökülür.
`);

const WORLD_RIVERS = L(`
Nil|Afrika
Kongo|Afrika
Nijer|Afrika
Zambezi|Afrika
Orange|Afrika
Amazon|Güney Amerika
Parana|Güney Amerika
Orinoco|Güney Amerika
Mississippi|Kuzey Amerika
Yukon|Kuzey Amerika
Mackenzie|Kuzey Amerika
Colorado|Kuzey Amerika
Rio Grande|Kuzey Amerika
Volga|Avrupa
Tuna|Avrupa
Ren|Avrupa
Sen|Avrupa
Thames|Avrupa
Elbe|Avrupa
Loire|Avrupa
Yangtze|Asya
Huang He (Sarı Irmak)|Asya
Ganj|Asya
Mekong|Asya
İndus|Asya
Ob|Asya
Yenisey|Asya
Lena|Asya
Murray|Okyanusya
`);

const PEAKS = L(`
Everest|Asya|Nepal–Çin sınırındadır; deniz seviyesinden en yüksek noktadır.
K2|Asya
Fuji|Asya
Ağrı Dağı|Asya
Aconcagua|Güney Amerika
Chimborazo|Güney Amerika
Cotopaxi|Güney Amerika
Denali|Kuzey Amerika
Rainier|Kuzey Amerika
Kilimanjaro|Afrika
Kenya Dağı|Afrika
Mont Blanc|Avrupa
Matterhorn|Avrupa
Olimpos (Yunanistan)|Avrupa
Zugspitze|Avrupa
Vinson Masifi|Antarktika
Puncak Jaya|Okyanusya
Cook Dağı (Aoraki)|Okyanusya
`);

const HEIGHTS = N(`
Everest|8849
K2|8611
Aconcagua|6961
Chimborazo|6263
Denali|6190
Kilimanjaro|5895
Elbrus|5642
Ağrı Dağı|5137
Vinson Masifi|4892
Mont Blanc|4806
Matterhorn|4478
Süphan Dağı|4058
Fuji|3776
Hasan Dağı|3268
Palandöken|3176
Zugspitze|2962
Olimpos (Yunanistan)|2918
Uludağ|2543
`);

const AREAS = N(`
Rusya|17098
Kanada|9985
Amerika Birleşik Devletleri|9834
Brezilya|8516
Avustralya|7741
Hindistan|3287
Arjantin|2780
Cezayir|2382
Suudi Arabistan|2150
Meksika|1964
Libya|1760
İran|1648
Moğolistan|1564
Peru|1285
Mısır|1001
Türkiye|783
Ukrayna|604
İspanya|506
İsveç|450
Japonya|378
Almanya|357
Polonya|313
İtalya|301
Birleşik Krallık|244
Romanya|238
Yunanistan|132
Portekiz|92
Avusturya|84
İsviçre|41
Belçika|31
`);

const LAKES = L(`
Eğirdir Gölü|Isparta
Burdur Gölü|Burdur
Salda Gölü|Burdur|Beyaz kumsalı ve turkuaz rengiyle bilinen, koruma altındaki bir göldür.
İznik Gölü|Bursa
Ulubat Gölü|Bursa
Kuş Gölü (Manyas)|Balıkesir|Kıyısındaki Kuşcenneti Millî Parkı ile bilinir.
Sapanca Gölü|Sakarya
Abant Gölü|Bolu
Çıldır Gölü|Ardahan|Kışın donar; buz üstünde balık avıyla bilinir.
Hazar Gölü|Elazığ
Beyşehir Gölü|Konya|Türkiye’nin en büyük tatlı su gölüdür.
Köyceğiz Gölü|Muğla
Uzungöl|Trabzon
Nemrut Krater Gölü|Bitlis
Erçek Gölü|Van
Akşehir Gölü|Konya
Gala Gölü|Edirne
Terkos Gölü|İstanbul
`);

const NEIGHBORS = L(`
Yunanistan|komşu
Bulgaristan|komşu
Gürcistan|komşu
Ermenistan|komşu
Azerbaycan|komşu|Sınır, Azerbaycan’a bağlı Nahçıvan Özerk Cumhuriyeti ile yaklaşık 17 km’dir.
İran|komşu
Irak|komşu
Suriye|komşu|Türkiye’nin en uzun kara sınırı Suriye iledir.
Romanya|değil
Ukrayna|değil
Rusya|değil|Rusya ile kara sınırı yoktur; Karadeniz üzerinden deniz komşusudur.
Lübnan|değil
Ürdün|değil
Mısır|değil
Kuzey Makedonya|değil
Sırbistan|değil
Türkmenistan|değil
Suudi Arabistan|değil
`);

const CURRENCY = L(`
Japonya|Yen
Çin|Yuan (Renminbi)
Güney Kore|Won
Birleşik Krallık|Sterlin
Rusya|Ruble
Hindistan|Rupi
Brezilya|Real
Meksika|Peso
Polonya|Zloti
Macaristan|Forint
Çekya|Koruna
İsveç|Kron
Ukrayna|Grivna
Güney Afrika|Rand
Suudi Arabistan|Riyal
Birleşik Arap Emirlikleri|Dirhem
Kuveyt|Dinar
Romanya|Ley
Bulgaristan|Leva
Azerbaycan|Manat
Gürcistan|Lari
Kazakistan|Tenge
Özbekistan|Som
Tayland|Baht
Vietnam|Dong
Endonezya|Rupiah
Malezya|Ringgit
Nijerya|Naira
Kenya|Şilin
Etiyopya|Birr
Ermenistan|Dram
Almanya|Avro
İsviçre|Frank
Amerika Birleşik Devletleri|Dolar
`);

const TERMS = L(`
Delta|Akarsuyun taşıdığı malzemeyi döküldüğü yerde biriktirmesiyle oluşan, genellikle üçgen biçimli düzlük
Haliç|Akarsu ağzının deniz suyunun girmesiyle huni biçiminde genişlemiş kısmı
Kanyon|Akarsuyun yatay katmanlı arazide derine aşındırmasıyla oluşan, yamaçları dik ve derin vadi
Peribacası|Volkanik tüflerin sel ve rüzgârla aşınması sonucu oluşan, tepesinde sert bir şapka taşıyan sütun
Traverten|Kalsiyum karbonatlı suların yüzeye çıkıp çökelmesiyle oluşan basamaklı birikim şekli
Lagün|Kıyı oku ile denizden ayrılmış sığ kıyı gölü
Tombolo|Bir adayı karaya bağlayan kum ve çakıl şeridi
Fiyort|Buzulların aşındırdığı vadilerin deniz altında kalmasıyla oluşan dik yamaçlı kıyı girintisi
Ria|Akarsu vadilerinin deniz altında kalmasıyla oluşan girintili kıyı tipi
Moren|Buzulların taşıyıp biriktirdiği malzeme yığını
Sirk|Buzulun dağ yamacında oyduğu çanak biçimli çukur
Dolin|Karstik arazide kalkerin erimesiyle oluşan küçük, yuvarlak çukur
Polye|Karstik arazide dolin ve uvalaların birleşmesiyle oluşan geniş düzlük
Obruk|Yeraltındaki boşluğun tavanının çökmesiyle oluşan derin, dik kenarlı çukur
Horst|Kırılma sonucu yükselmiş blok
Graben|Kırılma sonucu çökmüş blok (çöküntü alanı)
Kaldera|Volkan konisinin tepesinin çökmesiyle oluşan geniş çanak
Plato|Akarsularca derince yarılmış, yüksek ve geniş düzlük
Ova|Çevresine göre alçakta kalan, geniş ve düz tarım alanı
Falez|Dalgaların aşındırmasıyla oluşan dik kıyı yarı
Menderes|Eğimin azaldığı yerlerde akarsuyun çizdiği büklüm
Birikinti konisi|Akarsuyun eğimin aniden azaldığı dağ eteğinde biriktirdiği yelpaze biçimli şekil
Dev kazanı|Akarsu yatağında girdaplı akışın oyduğu çukur
Mantar kaya|Rüzgârın taşıdığı kumla alt kısmı daha çok aşınmış kaya
Barkan|Rüzgârın biriktirdiği hilal biçimli kum tepesi
İzoterm|Haritada eşit sıcaklıktaki noktaları birleştiren eğri
İzobar|Haritada eşit basınçlı noktaları birleştiren eğri
İzohips|Haritada aynı yükseltideki noktaları birleştiren eğri (eş yükselti eğrisi)
İzohyet|Haritada eşit yağış alan noktaları birleştiren eğri
Ekinoks|Gece ve gündüzün eşit olduğu 21 Mart ve 23 Eylül tarihleri
Gündönümü|Güneş ışınlarının dönencelere dik geldiği, en uzun ya da en kısa gündüzün yaşandığı tarih
Muson|Mevsime göre yön değiştiren, yazın yağış getiren rüzgâr
Meltem|Kara ile deniz arasında gece ve gündüz yön değiştiren yerel rüzgâr
Föhn|Dağı aşıp alçalırken ısınan ve kuruyan sıcak yamaç rüzgârı
Lodos|Türkiye’de güneybatıdan esen, sıcaklığı artıran yerel rüzgâr
Poyraz|Türkiye’de kuzeydoğudan esen, serinlik getiren yerel rüzgâr
Paralel|Ekvator’a paralel çizilen hayali daireler
Meridyen|Kutuplardan geçen, yarım daire biçimindeki hayali çizgiler
Ölçek|Haritadaki uzunluğun gerçek uzunluğa oranı
Nüfus yoğunluğu|Birim alana (km²) düşen kişi sayısı
Erozyon|Toprağın su, rüzgâr gibi dış etkenlerle aşınıp taşınması
Heyelan|Eğimli arazide toprak ve kaya kütlesinin aşağı kayması
Tsunami|Deniz tabanındaki deprem ya da heyelanın oluşturduğu dev dalga
Episantr|Depremin yeryüzünde en çok hissedildiği, odak noktasının tam üstündeki yer
Hipomerkez|Depremin yerin içinde başladığı nokta (odak)
Kıta sahanlığı|Kıtaların deniz altında süren, sığ ve hafif eğimli kenar kısmı
Akifer|Suyu depolayan ve ileten geçirimli yeraltı katmanı
Göç|İnsanların sürekli ya da geçici olarak bir yerden başka bir yere yerleşmesi
Sanayi|Ham maddeyi işleyerek ürün hâline getiren ekonomik faaliyet
Mikroklima|Küçük bir alanda çevresinden farklılaşan yerel iklim
`);

export const COG = {
  cap: { k: 'pair', d: 1, src: CF, rows: CAPITALS.map(([a, b]) => [a, b, CAP_NOTE[a] || '']),
    q: a => `${a} ülkesinin başkenti hangisidir?`, r: b => `${b} hangi ülkenin başkentidir?`, e: (a, b) => `${a} ülkesinin başkenti: ${b}.` },
  kita: { k: 'group', d: 1, src: CF, rows: CONT, extra: ['Antarktika'],
    q: a => `${a} hangi kıtada yer alır?`, has: g => `Aşağıdaki ülkelerden hangisi ${g} kıtasındadır?`, not: g => `Aşağıdaki ülkelerden hangisi ${g} kıtasında DEĞİLDİR?`,
    e: (a, g) => `${a}, ${g} kıtasında yer alan bir ülkedir.`, notE: g => `${g} kıtasındadır` },
  bolge: { k: 'group', d: 2, src: `${MEB} · Türkiye’nin coğrafi bölgeleri`, rows: REGIONS,
    q: a => `${a} ili hangi coğrafi bölgededir?`, has: g => `Aşağıdaki illerden hangisi ${g} Bölgesi’ndedir?`, not: g => `Aşağıdaki illerden hangisi ${g} Bölgesi’nde DEĞİLDİR?`,
    e: (a, g) => `${a}, ${g} Bölgesi’nde yer alır.`, notE: g => `${g} Bölgesi’ndedir`,
  },
  plaka: { k: 'pair', d: 2, src: 'T.C. İçişleri Bakanlığı · il trafik kodları', rows: PLATES,
    q: a => `${a} ilinin plaka (trafik) kodu kaçtır?`, r: b => `Plaka kodu ${b} olan il hangisidir?`, e: (a, b) => `${a} ilinin plaka kodu ${b}’dir. İlk 67 kod, o dönemki 67 ilin eski adlarıyla alfabetik sırasından gelir (ör. Mersin = İçel 33); sonradan il olanlar 68’den itibaren sırayla eklenmiştir.` },
  trnehir: { k: 'group', d: 2, src: `${MEB} · Türkiye’nin akarsuları`, rows: TR_RIVERS,
    q: a => `${a} ırmağı nereye dökülür?`, has: g => `Aşağıdaki akarsulardan hangisi ${g} havzasına dökülür?`, not: g => `Aşağıdaki akarsulardan hangisi ${g} havzasına dökülmez?`,
    e: (a, g) => `${a}, ${g} havzasına dökülür.`, notE: g => `${g} havzasına dökülür` },
  dnehir: { k: 'group', d: 2, src: `${CF} · National Geographic`, rows: WORLD_RIVERS, extra: ['Antarktika'],
    q: a => `${a} nehri hangi kıtadadır?`, has: g => `Aşağıdaki nehirlerden hangisi ${g} kıtasındadır?`, not: g => `Aşağıdaki nehirlerden hangisi ${g} kıtasında DEĞİLDİR?`,
    e: (a, g) => `${a} nehri ${g} kıtasındadır.`, notE: g => `${g} kıtasındadır` },
  dag: { k: 'group', d: 2, src: 'USGS · ulusal kartografya kurumları', rows: PEAKS,
    q: a => `${a} hangi kıtadadır?`, has: g => `Aşağıdaki dağlardan hangisi ${g} kıtasındadır?`, not: g => `Aşağıdaki dağlardan hangisi ${g} kıtasında DEĞİLDİR?`,
    e: (a, g) => `${a}, ${g} kıtasındadır.`, notE: g => `${g} kıtasındadır` },
  yuk: { k: 'order', d: 3, most: 'max', n: 130, src: 'Ulusal haritacılık kurumlarının ölçümleri (Everest: 2020 Nepal–Çin ortak ölçümü)', rows: HEIGHTS,
    q: 'Aşağıdaki dağlardan hangisi en yüksektir?', lead: 'Yükseklikler (m):', fmt: v => `${v.toLocaleString('tr-TR')} m` },
  alan: { k: 'order', d: 3, most: 'max', n: 150, src: CF, rows: AREAS,
    q: 'Aşağıdaki ülkelerden hangisinin yüz ölçümü en büyüktür?', lead: 'Yüz ölçümleri (bin km²):', fmt: v => `${v.toLocaleString('tr-TR')} bin km²` },
  gol: { k: 'pair', d: 3, src: `${MEB} · Türkiye’nin gölleri`, rows: LAKES,
    q: a => `${a} hangi ilin sınırları içindedir?`, r: b => `Aşağıdaki göllerden hangisi ${b} ilindedir?`, e: (a, b) => `${a} ${b} ilindedir.` },
  komsu: { k: 'group', d: 1, src: `${MEB} · Türkiye’nin komşuları`, rows: NEIGHBORS,
    has: g => (g === 'komşu' ? 'Aşağıdaki ülkelerden hangisi Türkiye ile kara sınırı olan bir komşudur?' : null),
    not: g => (g === 'komşu' ? 'Aşağıdaki ülkelerden hangisi Türkiye ile kara sınırı OLMAYAN bir ülkedir?' : null),
    e: (a, g) => (g === 'komşu' ? `${a}, Türkiye’nin sekiz kara komşusundan biridir.` : `${a} ile Türkiye’nin kara sınırı yoktur.`),
    notE: g => (g === 'komşu' ? 'Türkiye’nin kara komşusudur' : 'Türkiye’ye kara komşusu değildir') },
  para: { k: 'pair', d: 2, src: `${CF} · ISO 4217 para birimi listesi`, rows: CURRENCY,
    q: a => `${a} ülkesinin para birimi hangisidir?`, r: b => `Para birimi “${b}” olan ülke hangisidir?`, e: (a, b) => `${a} ülkesinin resmî para birimi: ${b}.` },
  terim: { k: 'pair', d: 2, src: MEB, rows: TERMS,
    q: a => `Coğrafyada “${a}” neyi ifade eder?`, r: b => `“${b}” hangi kavramın tanımıdır?`, e: (a, b) => `${a}: ${b}.` },
};
