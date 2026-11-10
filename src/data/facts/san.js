// Sanat bilgi tabloları — kaynaklar: müzelerin resmî koleksiyon sayfaları (Louvre, MoMA, Prado, Uffizi, Rijksmuseum…),
// Britannica, Grove Music Online, MEB Görsel Sanatlar ve Müzik ders kitapları, T.C. Kültür ve Turizm Bakanlığı.
import { L } from './engine.js';

const MUS = 'Müzelerin resmî koleksiyon kayıtları · Britannica';
const MEB = 'MEB Görsel Sanatlar ders kitabı';
const MUZ = 'Grove Music Online · MEB Müzik ders kitabı';

const WORKS = L(`
Mona Lisa|Leonardo da Vinci
Son Akşam Yemeği|Leonardo da Vinci
Yıldızlı Gece|Vincent van Gogh
Ayçiçekleri|Vincent van Gogh
Çığlık|Edvard Munch
Guernica|Pablo Picasso
Avignonlu Kızlar|Pablo Picasso
Belleğin Azmi|Salvador Dalí
İnci Küpeli Kız|Johannes Vermeer
Gece Devriyesi|Rembrandt
Venüs’ün Doğuşu|Sandro Botticelli
Âdem’in Yaratılışı|Michelangelo
Davut heykeli|Michelangelo
Düşünen Adam|Auguste Rodin
Öpücük (tablo)|Gustav Klimt
Nilüferler|Claude Monet
İzlenim, Gün Doğumu|Claude Monet
Halka Yol Gösteren Özgürlük|Eugène Delacroix
Nedimeler (Las Meninas)|Diego Velázquez
3 Mayıs 1808|Francisco Goya
Kanagawa’da Büyük Dalga|Katsushika Hokusai
Amerikan Gotiği|Grant Wood
Gece Kuşları (Nighthawks)|Edward Hopper
Kırmızı, Mavi ve Sarılı Kompozisyon|Piet Mondrian
Campbell Çorba Kutuları|Andy Warhol
Çeşme (Fountain)|Marcel Duchamp
İnsanoğlu|René Magritte
Atina Okulu|Raffaello
La Grande Jatte Adasında Bir Pazar Öğleden Sonrası|Georges Seurat
Dans|Henri Matisse
Kaplumbağa Terbiyecisi|Osman Hamdi Bey
Silah Taciri|Osman Hamdi Bey
Zeybekler|İbrahim Çallı
Oduncu|Şeker Ahmed Paşa
Medusa’nın Salı|Théodore Géricault
Taşkırıcılar|Gustave Courbet
Başak Toplayanlar|Jean-François Millet
Kutsal Aile ile Yuvarlak Tablo (Doni Tondo)|Michelangelo
Yemek Yiyen Patatesçiler|Vincent van Gogh
Sarı Mesih|Paul Gauguin
Kart Oynayanlar|Paul Cézanne
Moulin de la Galette’te Balo|Pierre-Auguste Renoir
`);

const ARCH = L(`
Süleymaniye Camii|Mimar Sinan
Selimiye Camii|Mimar Sinan|Sinan bu yapıyı “ustalık eserim” olarak nitelemiştir.
Şehzade Camii|Mimar Sinan|Sinan’ın “çıraklık eseri” kabul edilir.
Sultanahmet Camii|Sedefkâr Mehmed Ağa
Ayasofya (532–537)|Isidoros ve Anthemios
Louvre Piramidi|I. M. Pei
Guggenheim Bilbao Müzesi|Frank Gehry
Sidney Opera Binası|Jørn Utzon
Sagrada Familia|Antoni Gaudí
Eyfel Kulesi|Gustave Eiffel’in mühendislik şirketi
Şelale Evi (Fallingwater)|Frank Lloyd Wright
Villa Savoye|Le Corbusier
Anıtkabir|Emin Onat ve Orhan Arda
Barselona Pavyonu|Ludwig Mies van der Rohe
`);

const MOVE = L(`
Claude Monet|İzlenimcilik
Pierre-Auguste Renoir|İzlenimcilik
Edgar Degas|İzlenimcilik
Camille Pissarro|İzlenimcilik
Vincent van Gogh|Post-izlenimcilik
Paul Cézanne|Post-izlenimcilik
Paul Gauguin|Post-izlenimcilik
Georges Seurat|Post-izlenimcilik
Pablo Picasso|Kübizm
Georges Braque|Kübizm
Juan Gris|Kübizm
Salvador Dalí|Gerçeküstücülük (sürrealizm)
René Magritte|Gerçeküstücülük (sürrealizm)
Max Ernst|Gerçeküstücülük (sürrealizm)
Joan Miró|Gerçeküstücülük (sürrealizm)
Henri Matisse|Fovizm
André Derain|Fovizm
Maurice de Vlaminck|Fovizm
Andy Warhol|Pop Art
Roy Lichtenstein|Pop Art
Jackson Pollock|Soyut dışavurumculuk
Mark Rothko|Soyut dışavurumculuk
Edvard Munch|Dışavurumculuk
Ernst Ludwig Kirchner|Dışavurumculuk
Leonardo da Vinci|Rönesans
Michelangelo|Rönesans
Raffaello|Rönesans
Sandro Botticelli|Rönesans
Caravaggio|Barok
Rembrandt|Barok
Peter Paul Rubens|Barok
Eugène Delacroix|Romantizm
Théodore Géricault|Romantizm
Gustave Courbet|Gerçekçilik (realizm)
Jean-François Millet|Gerçekçilik (realizm)
Marcel Duchamp|Dada
Piet Mondrian|De Stijl (Neoplastisizm)
`);

const COMP = L(`
Ludwig van Beethoven|9. Senfoni (Koral)
Wolfgang Amadeus Mozart|Figaro’nun Düğünü
Antonio Vivaldi|Dört Mevsim
Johann Sebastian Bach|Brandenburg Konçertoları
Pyotr İlyiç Çaykovski|Kuğu Gölü
Giuseppe Verdi|La Traviata
Giacomo Puccini|Tosca
Georges Bizet|Carmen
Richard Wagner|Nibelung’un Yüzüğü
Maurice Ravel|Bolero
Claude Debussy|Ay Işığı (Clair de lune)
Gustav Holst|Gezegenler
George Gershwin|Rhapsody in Blue
İgor Stravinski|Bahar Ayini
Georg Friedrich Händel|Mesih (Messiah)
Modest Musorgski|Bir Sergiden Tablolar
Nikolay Rimski-Korsakov|Şehrazat
Edvard Grieg|Peer Gynt
Bedřich Smetana|Vltava (Moldau)
Antonín Dvořák|Yeni Dünya Senfonisi
Gioachino Rossini|Sevil Berberi
II. Johann Strauss|Güzel Mavi Tuna
Camille Saint-Saëns|Hayvanlar Karnavalı
Carl Orff|Carmina Burana
Sergey Prokofyev|Peter ve Kurt
Ahmet Adnan Saygun|Yunus Emre Oratoryosu
Ulvi Cemal Erkin|Köçekçe
Hasan Ferit Alnar|Kanun Konçertosu
Fazıl Say|İstanbul Senfonisi
Buhurizade Mustafa Itri|Segâh Tekbir
`);

const ORCH = L(`
Keman|Yaylı çalgılar
Viyola|Yaylı çalgılar
Viyolonsel|Yaylı çalgılar
Kontrbas|Yaylı çalgılar
Flüt|Tahta üflemeli çalgılar|Metalden yapılsa da ses üretim biçimi nedeniyle tahta üflemeliler arasında sayılır.
Klarnet|Tahta üflemeli çalgılar
Obua|Tahta üflemeli çalgılar
Fagot|Tahta üflemeli çalgılar
Saksafon|Tahta üflemeli çalgılar|Pirinçten yapılır ama tek kamışlı olduğu için tahta üflemelidir.
Trompet|Bakır üflemeli çalgılar
Trombon|Bakır üflemeli çalgılar
Korno|Bakır üflemeli çalgılar
Tuba|Bakır üflemeli çalgılar
Timpani|Vurmalı çalgılar
Zil (cymbal)|Vurmalı çalgılar
Trampet|Vurmalı çalgılar
Ksilofon|Vurmalı çalgılar
Üçgen (triangle)|Vurmalı çalgılar
`);

const TURK = L(`
Bağlama|Telli (mızraplı) çalgılar
Ud|Telli (mızraplı) çalgılar
Kanun|Telli (mızraplı) çalgılar
Tanbur|Telli (mızraplı) çalgılar
Klasik kemençe|Yaylı çalgılar
Karadeniz kemençesi|Yaylı çalgılar
Rebap|Yaylı çalgılar
Ney|Üflemeli çalgılar
Zurna|Üflemeli çalgılar
Kaval|Üflemeli çalgılar
Mey|Üflemeli çalgılar
Davul|Vurmalı çalgılar
Darbuka|Vurmalı çalgılar
Bendir|Vurmalı çalgılar
Kudüm|Vurmalı çalgılar
Def|Vurmalı çalgılar
`);

const TERMS = L(`
Perspektif|İki boyutlu yüzeyde derinlik ve uzaklık yanılsaması yaratma tekniği
Natürmort|Meyve, çiçek, eşya gibi cansız nesnelerin resmi
Portre|Bir kişinin yüzünü ya da kişiliğini yansıtan resim ya da heykel
Otoportre|Sanatçının kendi portresi
Peyzaj|Doğa ve manzara resmi
Fresk|Yaş sıva üzerine suyla karılmış boyayla yapılan duvar resmi
Mozaik|Renkli taş, cam ya da seramik parçalarıyla oluşturulan resim
Kolaj|Kâğıt, kumaş gibi farklı malzemelerin yüzeye yapıştırılmasıyla yapılan eser
Gravür|Metal ya da ahşap levhaya kazınan resimden alınan baskı
Litografi|Taş baskı tekniği
Suluboya|Suyla inceltilen saydam boyayla yapılan resim tekniği
Yağlıboya|Pigmentlerin yağla karıştırılmasıyla elde edilen boyayla yapılan resim
Guaj|Örtücü (opak) sulu boya
Tempera|Pigmentin yumurta sarısı gibi bağlayıcılarla karıştırıldığı eski boya tekniği
Kabartma (rölyef)|Bir yüzeyden taşacak biçimde yontulan heykel
Büst|Baş, omuz ve göğüs kısmını gösteren heykel
Minyatür|Kitap sayfalarını süsleyen, perspektifsiz küçük resim sanatı
Hat sanatı|Arap harfleriyle yapılan güzel yazı sanatı
Ebru|Kitreyle yoğunlaştırılmış su üzerine serpilen boyaların kâğıda aktarılması sanatı
Tezhip|Kitap ve levhaları altın ve boyayla süsleme sanatı
Çini|Sırlı ve desenli pişmiş toprak kaplama sanatı
Grafiti|Duvar gibi kamusal yüzeylere sprey boyayla yapılan yazı ve resim
Enstalasyon|Bir mekâna yerleştirilen, izleyicinin çevresinde dolaşabildiği sanat eseri
Sfumato|Renkler ve çizgiler arasında dumanlı, yumuşak geçişler sağlayan teknik
Klarobskür (chiaroscuro)|Işık ve gölge arasındaki güçlü karşıtlıkla hacim verme tekniği
Triptik|Üç panelden oluşan resim
Senfoni|Orkestra için yazılmış, genellikle dört bölümlü büyük eser
Konçerto|Solo çalgı ile orkestranın karşılıklı çaldığı eser
Sonat|Bir ya da iki çalgı için yazılmış, birkaç bölümlü eser
Opera|Sahnede şarkılarla anlatılan, orkestra eşliğindeki müzikli tiyatro eseri
Bale|Müzik eşliğinde dansla bir öykü anlatan sahne sanatı
Oratoryo|Dinî ya da destansı konulu, sahnelenmeden seslendirilen koro ve solo eser
Libretto|Bir operanın sözlü metni
Partisyon|Bir eserin tüm çalgı ve seslerinin notalarını bir arada gösteren nota
Tempo|Müzikte eserin çalınma hızı
Armoni|Aynı anda çalınan seslerin uyumu
Akor|Aynı anda tınlayan üç ya da daha fazla ses
Makam|Türk müziğinde dizi, seyir ve durak kurallarını belirleyen ezgi sistemi
Usul|Türk müziğinde vuruşların düzenini belirleyen ritim kalıbı
`);

const MUSEUMS = L(`
Louvre Müzesi|Paris
Orsay Müzesi|Paris
Prado Müzesi|Madrid
Reina Sofía Müzesi|Madrid
Uffizi Galerisi|Floransa
Ermitaj Müzesi|St. Petersburg
Rijksmuseum|Amsterdam
Van Gogh Müzesi|Amsterdam
MoMA|New York
Metropolitan Sanat Müzesi|New York
British Museum|Londra
Tate Modern|Londra
Topkapı Sarayı Müzesi|İstanbul
İstanbul Modern|İstanbul
Anadolu Medeniyetleri Müzesi|Ankara
Vatikan Müzeleri|Vatikan
Pergamon Müzesi|Berlin
Mısır Müzesi|Kahire
`);

const WHERE = L(`
Mona Lisa|Louvre Müzesi
Guernica|Reina Sofía Müzesi
Yıldızlı Gece|MoMA
Gece Devriyesi|Rijksmuseum
Venüs’ün Doğuşu|Uffizi Galerisi
Nedimeler (Las Meninas)|Prado Müzesi
Kaplumbağa Terbiyecisi|Pera Müzesi
Belleğin Azmi|MoMA
Kanagawa’da Büyük Dalga (bir baskısı)|Metropolitan Sanat Müzesi
`);

export const SAN = {
  eser: { k: 'pair', d: 1, src: MUS, rows: WORKS,
    q: a => `“${a}” adlı eser kime aittir?`, r: b => `Aşağıdaki eserlerden hangisi ${b} imzasını taşır?`, e: (a, b) => `“${a}” → ${b}.` },
  mimari: { k: 'pair', d: 2, src: `${MUS} · T.C. Kültür ve Turizm Bakanlığı`, rows: ARCH,
    q: a => `${a} hangi mimar ya da mühendisin eseridir?`, r: b => `Aşağıdaki yapılardan hangisi ${b} imzasını taşır?`, e: (a, b) => `${a} → ${b}.` },
  akim: { k: 'group', d: 2, src: `${MEB} · Britannica`, rows: MOVE,
    q: a => `${a} hangi sanat akımı ya da dönemiyle özdeşleşir?`, has: g => `Aşağıdaki sanatçılardan hangisi ${g} akımı ya da dönemiyle anılır?`, not: g => `Aşağıdaki sanatçılardan hangisi ${g} ile anılmaz?`,
    e: (a, g) => `${a} → ${g}.`, notE: g => `${g} ile anılır` },
  akimp: { k: 'pick', d: 3, n: 260, src: `${MEB} · Britannica`, rows: MOVE,
    has: g => `“${g}” denince aşağıdaki sanatçılardan hangisi akla gelir?`, e: (a, g) => `${a} → ${g}.`, eOthers: w => `Diğerleri: ${w.map(x => `${x[0]} (${x[1]})`).join(', ')}.` },
  besteci: { k: 'pair', d: 2, src: MUZ, rows: COMP,
    q: a => `Aşağıdaki eserlerden hangisi ${a} tarafından bestelenmiştir?`, r: b => `“${b}” hangi bestecinin eseridir?`, e: (a, b) => `“${b}” → ${a}.` },
  calgi: { k: 'group', d: 1, src: MUZ, rows: ORCH,
    q: a => `Senfoni orkestrasında ${a.toLocaleLowerCase('tr')} hangi çalgı ailesindendir?`, has: g => `Aşağıdakilerden hangisi ${g.toLocaleLowerCase('tr')} ailesindendir?`, not: g => `Aşağıdakilerden hangisi ${g.toLocaleLowerCase('tr')} ailesinden DEĞİLDİR?`,
    e: (a, g) => `${a} → ${g.toLocaleLowerCase('tr')}.`, notE: g => g.toLocaleLowerCase('tr') },
  calgip: { k: 'pick', d: 2, n: 140, src: MUZ, rows: ORCH,
    has: g => `Orkestradaki çalgılardan hangisi “${g.toLocaleLowerCase('tr')}” grubundadır?`, e: (a, g) => `${a} → ${g.toLocaleLowerCase('tr')}.`, eOthers: w => `Diğerleri: ${w.map(x => `${x[0]} (${x[1].toLocaleLowerCase('tr')})`).join(', ')}.` },
  turk: { k: 'group', d: 2, src: `${MUZ} · TRT Türk halk ve sanat müziği çalgıları`, rows: TURK,
    q: a => `${a} hangi çalgı grubundandır?`, has: g => `Aşağıdaki geleneksel Türk çalgılarından hangisi ${g.toLocaleLowerCase('tr')} grubundandır?`, not: g => `Aşağıdaki çalgılardan hangisi ${g.toLocaleLowerCase('tr')} grubundan DEĞİLDİR?`,
    e: (a, g) => `${a} → ${g.toLocaleLowerCase('tr')}.`, notE: g => g.toLocaleLowerCase('tr') },
  turkp: { k: 'pick', d: 2, n: 100, src: MUZ, rows: TURK,
    has: g => `Geleneksel çalgılardan hangisi “${g.toLocaleLowerCase('tr')}” grubundadır?`, e: (a, g) => `${a} → ${g.toLocaleLowerCase('tr')}.`, eOthers: w => `Diğerleri: ${w.map(x => `${x[0]} (${x[1].toLocaleLowerCase('tr')})`).join(', ')}.` },
  terim: { k: 'pair', d: 2, src: `${MEB} · ${MUZ}`, rows: TERMS,
    q: a => `Sanatta “${a}” neyi ifade eder?`, r: b => `“${b}” tanımı hangi terime aittir?`, e: (a, b) => `${a}: ${b}.` },
  muze: { k: 'pair', d: 2, src: 'Müzelerin resmî sayfaları', rows: MUSEUMS,
    q: a => `${a} hangi şehirdedir?`, r: b => `Aşağıdaki müzelerden hangisi ${b} şehrindedir?`, e: (a, b) => `${a} → ${b}.` },
  nerede: { k: 'pair', d: 3, src: 'Müzelerin resmî koleksiyon kayıtları', rows: WHERE,
    q: a => `“${a}” bugün nerede sergilenmektedir?`, e: (a, b) => `“${a}” → ${b}.` },
};
