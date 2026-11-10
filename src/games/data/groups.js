// Stack ve Cross Up için tema grupları. Satır biçimi: "zorluk|tema adı|kelime kelime …"
// zorluk: 1 = düz kategori, 2 = daha dar/uzmanlık, 3 = kelime oyunu (ortak ek, gizli bağ).
// Çok kelimeli öğeler alt çizgiyle yazılır (oyunda boşluğa çevrilir).
const EN = `
1|Fruits|apple banana cherry grape lemon mango peach pear plum melon kiwi orange
1|Colors|red blue green yellow purple orange black white pink brown gray violet
1|Planets|mercury venus earth mars jupiter saturn uranus neptune
1|Body parts|arm leg hand foot head knee elbow ankle wrist shoulder neck chin
1|Musical instruments|piano guitar violin drum flute trumpet cello harp organ banjo
1|Kitchen tools|knife spoon fork ladle whisk spatula grater kettle pan pot
1|Weather|rain snow storm wind fog hail thunder frost cloud breeze
1|Emotions|joy anger fear sadness love hope pride shame envy guilt
1|Sports|tennis soccer golf rugby hockey boxing cricket baseball skiing judo
1|Farm animals|cow pig sheep goat horse hen duck donkey goose rooster
1|Sea creatures|shark whale dolphin octopus squid crab lobster seal jellyfish starfish
1|Birds|eagle owl parrot robin sparrow crow pigeon penguin swan falcon
1|Insects|ant bee wasp beetle moth butterfly fly mosquito cricket ladybug
1|Vehicles|car bus train truck bicycle tram taxi van scooter subway
1|Clothing|shirt skirt dress jacket coat scarf sweater jeans sock glove
1|Furniture|chair table sofa bed desk shelf wardrobe stool bench dresser
1|Jobs|doctor teacher nurse pilot chef farmer lawyer baker dentist plumber
1|School subjects|math history biology physics chemistry geography music art literature
1|Shapes|circle square triangle oval star heart diamond hexagon cube sphere
1|Vegetables|carrot potato onion garlic pepper lettuce cabbage spinach celery pea
1|Desserts|cake pie cookie pudding brownie tart muffin cupcake donut sundae
1|Drinks|tea coffee juice milk water soda lemonade cocoa smoothie
1|Family|mother father sister brother uncle aunt cousin niece nephew grandma
1|Months|january february march april june july august september october november december
1|Days|monday tuesday wednesday thursday friday saturday sunday
1|Numbers|one two three four five six seven eight nine ten twelve twenty
2|Metals|iron copper silver gold zinc tin lead nickel aluminum platinum
2|Gemstones|ruby emerald sapphire diamond pearl opal topaz amethyst jade garnet
2|Trees|oak pine maple birch willow cedar palm elm ash cherry
2|Flowers|rose tulip lily daisy orchid violet poppy lotus jasmine sunflower
2|Spices|pepper cinnamon ginger cumin nutmeg saffron clove paprika turmeric
2|Chess pieces|king queen rook bishop knight pawn
2|Greek letters|alpha beta gamma delta epsilon theta lambda sigma omega pi
2|Zodiac signs|aries taurus gemini cancer leo virgo libra scorpio sagittarius capricorn aquarius pisces
2|Currencies|dollar euro pound yen rupee franc peso ruble lira won
2|Languages|english french german spanish italian russian arabic turkish chinese hindi
2|Dances|tango waltz salsa ballet samba disco swing rumba polka
2|Fabrics|cotton silk wool linen denim velvet satin leather nylon
2|Tools|hammer saw drill wrench pliers chisel screwdriver shovel rake axe
2|Computer terms|mouse keyboard screen file folder cursor server browser cloud cache
2|Organs|heart lung liver kidney brain stomach skin spleen
2|Bones|skull rib femur spine pelvis tibia jaw clavicle
2|Card games|poker bridge rummy solitaire blackjack snap
2|Dinosaurs|raptor stegosaurus triceratops brontosaurus pterodactyl
2|Cheeses|cheddar brie feta gouda mozzarella parmesan camembert ricotta
2|Pasta|spaghetti penne lasagna ravioli fusilli macaroni linguine tortellini
2|Coffee drinks|espresso latte mocha cappuccino americano macchiato
2|Dog breeds|poodle beagle boxer collie husky terrier labrador dalmatian
2|Board games|chess checkers monopoly scrabble backgammon ludo
2|Greek gods|zeus hera apollo athena hermes ares poseidon artemis
2|Superpowers|flight strength speed invisibility telepathy
2|Rivers|nile amazon danube thames volga mississippi rhine ganges
2|Capitals|paris london rome berlin madrid tokyo cairo ankara moscow lima
3|___ball|foot basket snow base hand eye volley fire
3|Fire___|work place man fly wood cracker
3|___light|sun moon flash spot head star candle torch
3|___house|light green farm dog tree ware club
3|Rain___|bow coat drop fall storm forest
3|___fish|gold star sword cat jelly shell
3|___berry|straw blue rasp black goose cran
3|Sun___|flower rise set shine burn glasses
3|___board|key card skate snow black dash
3|Water___|fall melon proof mark color
3|Things with keys|piano keyboard map lock typewriter
3|Things with rings|saturn tree circus phone boxing
3|Things that are cold|ice snow frost glacier freezer
3|Things with wings|plane bird bat angel fairy
3|Words before "cake"|cup pan cheese short sponge
3|Words after "head"|ache phone line light band
`;
const TR = `
1|Meyveler|elma armut kiraz üzüm muz çilek karpuz kavun şeftali erik portakal limon
1|Renkler|kırmızı mavi yeşil sarı mor turuncu siyah beyaz pembe kahverengi gri lacivert
1|Gezegenler|merkür venüs dünya mars jüpiter satürn uranüs neptün
1|Vücut|kol bacak el ayak baş diz dirsek bilek omuz boyun çene kulak
1|Çalgılar|piyano gitar keman davul flüt trompet ud bağlama ney kanun zurna
1|Mutfak eşyaları|bıçak kaşık çatal kepçe tencere tava rende çaydanlık süzgeç cezve
1|Hava durumu|yağmur kar fırtına rüzgar sis dolu gök_gürültüsü kırağı bulut esinti
1|Duygular|sevinç öfke korku hüzün sevgi umut gurur utanç kıskançlık özlem
1|Sporlar|tenis futbol golf ragbi hokey boks voleybol basketbol kayak judo güreş
1|Çiftlik hayvanları|inek domuz koyun keçi at tavuk ördek eşek kaz horoz manda
1|Deniz canlıları|köpekbalığı balina yunus ahtapot kalamar yengeç ıstakoz fok denizanası denizyıldızı
1|Kuşlar|kartal baykuş papağan serçe karga güvercin penguen kuğu şahin leylek
1|Böcekler|karınca arı eşekarısı böcek güve kelebek sinek sivrisinek çekirge uğurböceği
1|Taşıtlar|araba otobüs tren kamyon bisiklet tramvay taksi minibüs metro vapur
1|Giysiler|gömlek etek elbise ceket palto atkı kazak pantolon çorap eldiven
1|Mobilyalar|sandalye masa kanepe yatak sehpa raf dolap tabure bank komodin
1|Meslekler|doktor öğretmen hemşire pilot aşçı çiftçi avukat fırıncı dişçi tesisatçı
1|Dersler|matematik tarih biyoloji fizik kimya coğrafya müzik resim edebiyat felsefe
1|Şekiller|daire kare üçgen elips yıldız kalp eşkenar_dörtgen küp küre
1|Sebzeler|havuç patates soğan sarımsak biber marul lahana ıspanak kereviz bezelye pırasa
1|Tatlılar|baklava kadayıf sütlaç revani lokum helva künefe aşure kazandibi tulumba
1|İçecekler|çay kahve meyve_suyu süt su gazoz limonata ayran şalgam boza
1|Akrabalar|anne baba abla ağabey amca hala dayı teyze kuzen yeğen dede nine
1|Aylar|ocak şubat mart nisan mayıs haziran temmuz ağustos eylül ekim kasım aralık
1|Günler|pazartesi salı çarşamba perşembe cuma cumartesi pazar
1|Sayılar|bir iki üç dört beş altı yedi sekiz dokuz on yirmi yüz
2|Metaller|demir bakır gümüş altın çinko kalay kurşun nikel alüminyum platin
2|Değerli taşlar|yakut zümrüt safir elmas inci opal topaz ametist yeşim akik
2|Ağaçlar|meşe çam akçaağaç huş söğüt sedir palmiye karaağaç dişbudak çınar ıhlamur
2|Çiçekler|gül lale zambak papatya orkide menekşe gelincik nilüfer yasemin ayçiçeği karanfil
2|Baharatlar|karabiber tarçın zencefil kimyon muskat safran karanfil pul_biber zerdeçal sumak kekik
2|Satranç taşları|şah vezir kale fil at piyon
2|Burçlar|koç boğa ikizler yengeç aslan başak terazi akrep yay oğlak kova balık
2|Para birimleri|dolar avro sterlin yen rupi frank peso ruble lira won
2|Diller|türkçe ingilizce fransızca almanca ispanyolca italyanca rusça arapça çince japonca
2|Danslar|tango vals salsa bale samba zeybek halay horon çiftetelli
2|Kumaşlar|pamuk ipek yün keten kot kadife saten deri naylon
2|Aletler|çekiç testere matkap anahtar pense keski tornavida kürek tırmık balta
2|Bilgisayar|fare klavye ekran dosya klasör imleç sunucu tarayıcı bulut yazıcı
2|Organlar|kalp akciğer karaciğer böbrek beyin mide deri dalak
2|Peynirler|beyaz_peynir kaşar tulum lor çökelek hellim örgü dil_peyniri
2|Hamur işleri|börek poğaça simit pide gözleme mantı lahmacun açma çörek
2|Kahvaltılık|bal reçel zeytin peynir yumurta tereyağı kaymak sucuk menemen
2|Türk yemekleri|kebap dolma sarma köfte mantı lahmacun pilav musakka karnıyarık
2|Nehirler|kızılırmak fırat dicle sakarya yeşilırmak ceyhan seyhan meriç
2|Başkentler|paris londra roma berlin madrid tokyo kahire ankara moskova atina
2|Masal kahramanları|keloğlan nasreddin karagöz hacivat dede_korkut köroğlu
3|___ balığı|kılıç kedi köpek ay yılan kırlangıç vatoz
3|Göz ___|kapağı yaşı bebeği alıcı
3|___ taşı|kum mezar yol köşe kilit sınır
3|___ çiçeği|ay gün kar ateş ipek
3|Kara___|deniz kuş biber yel ağaç kalem
3|Ay___|çiçeği dede ışığı yıldız tutulması
3|___lık|tuz kitap göz kulak ayak sözlük
3|Su ile ilgili|dalga damla buhar şelale kaynak çeşme
3|Kanadı olanlar|uçak kuş yarasa melek kelebek
3|Anahtarı olanlar|kapı piyano harita şifre klavye
3|Halkası olanlar|satürn ağaç düğün anahtar zincir
`;
function parse(txt) {
  return txt.trim().split('\n').map(l => { const [d, name, words] = l.split('|'); return { d: +d, name, words: words.trim().split(/\s+/).map(w => w.replace(/_/g, ' ')) }; });
}
export const GROUPS = { en: parse(EN), tr: parse(TR) };
