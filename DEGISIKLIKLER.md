# dam-la 2.6.3 — Gerçekçi balina, çizimdeki doodle

Uzaktan güncellemeyle gelir.
- **Doodle rengi:** kahverengiye kaçan tonlar kaldırıldı; tüm evrelerde canlı turuncu (soluk turuncudan koyu kızıl turuncuya), hardal yerine sıcak sarı çeyrekler.
- **Balina** gerçek kambur balina siluetinde: burundan kuyruk sapına tek parça gövde (düz oval değil), kuyruk yüzgeci gövdeyle aynı renkte sapın içinden çıkar, ek yeri görünmez. Uzun yassı baş, boğazdan karna uzanan oluklar, küçük sırt yüzgeci, beyaz alt yüzlü uzun göğüs yüzgeci, ağız çizgisinin hemen üstünde küçük göz; ileri evrelerde başında midyeler.
- **Doodle** senin çizimine göre: turuncu tek parça baş levhası sağa taşar ve çeyrek daireyle aşağı kıvrılır, sol üstte tek küçük göz, altında kutu gövde ve iki bodur bacak. Yandan durur, iki bacakla adım atarak yürür (ayaklar kaymaz).

---
# dam-la 2.6.2 — Zarif balina, çeyrek daire doodle

Uzaktan güncellemeyle gelir.
- **Balina** daha zarif: uzun ve ince damla gövde, sırtta koyu bant, boğazda ince oluklar, uzun ince yüzgeç (açık kenarlı), ince kuyruk sapı ve hilal biçimli kuyruk; küçük badem göz, uzun ağız çizgisi, ince fıskiye.
- **Doodle** artık turuncumsu, sıkıcı çeyrek dairelerden oluşan bodur bir şey: gövde iki farklı boy çeyrek daire, baş çeyrek daire, ayaklar ve kollar küçük çeyrek daireler, tepede hardal bir çeyrek. Evreler soluk şeftaliden yanık turuncuya koyulaşır; yeni hardal çeyrekler eklenir, son evrede tepesinde koyu bir bulut.

---
# dam-la 2.6.1 — 3B geri alındı, yeni petler geometrik çizimde

Uzaktan güncellemeyle gelir. **Firebase kurallarında yeni türler için Yayınla gerekir (2.6.0 ile aynı).**
- 3B kil petler kaldırıldı; 2.5.1'deki geometrik editoryal çizimlere ve hareket motoruna dönüldü (Three.js kütüphanesi de çıkarıldı, uygulama yine hafif).
- Balina, doodle ve keçi kedi ile baykuşun çizim diliyle yeniden çizildi: kontursuz düz renk düzlemleri, iki tonlu gölge, ağır kapaklı gözler. Her biri 6 evrede değişir (balina koyulaşır, sırtında midye ve yıldızlar belirir, fıskiyesi çıkar; doodle yumrulaşıp koyulaşır, sonunda tepesinde bulut; keçinin boynuzları büyür, sakal çıkar, son evrede kapkara olur).
- Balina havada süzülür (ayak yok, kayma yok); keçi yürürken yandan, dururken önden; doodle küçük zıplamalarla ilerler.
- Oyun kuralları 2.6.0'daki gibi kaldı (yetenekler, pasifler, evre adları).

---
# dam-la 2.6.0 — 3B kil petler ve üç yeni pet

Uzaktan güncellemeyle gelir. **Firebase kurallarında yeni türler (balina, doodle, keçi) için Yayınla'ya basılması gerekir.**
- **Gerçek 3B:** petler artık yumuşak kil gibi 3B modeller (Three.js). Her açıdan görünürler: dururken sana 3/4 döner, ara sıra tam karşıdan bakar; yürürken yana döner; dönüşler gerçek dönüş, baş gövdeden önce döner. Origami/kâğıt hissi yok.
- **Kayma yok:** yürüyenlerin duruştaki ayağı ekranda yerinde kalır (ölçüldü: ±0,4 px), zıplayanlar yalnızca havadayken ilerler, balina havada süzülür.
- **Tüm hareketler 3B:** oturma (kedi, köpek), yatma ve uyuma, sevinç, yeme, kızma/ısırma, pati, irkilme, donma, bakınma, baykuşun boynunu çevirmesi, yalanma, gerinme, silkinme, yuvarlanma, eşinme, kuyruk sallama, güneşlenme, yetenek. Ruh hâli kapak, kulak, kuyruk ve baş duruşuna yansır.
- **36 evre yeniden:** her türün 6 formu 3B'de ayrı (renk, oran, desen, aksesuar; civciv yumurtadan tavus kuşuna, bitki tohumdan ulu ağaca).
- **Yeni pet: Balina (Derin)** — yalnızlığa uyum; yüzgeçleriyle uçabileceğini sanır, havada süzülür. Pasif: yanlışlarda %15 daha az can kaybı. Yetenek “Bilinmeyene Dal”: soruyu cezasız geçer. Evreler: Yavru Balina → Dalgıç → Şarkıcı → Derin Gezgin → Okyanus Keşişi → Kadim Balina.
- **Yeni pet: Doodle (Bodur)** — hiçbir canlıyı temsil etmeyen bodur yumru; sıkıntı, monotonluk, nötrlük. Pasif: yanlışlarda %20 daha az can, doğrularda %10 daha az XP. Yetenek “Aynı Satranç”: bu soruda yanlış can götürmez. Evreler: Leke → Yumru → Bodur → Karalama → Ağır Yumru → Sessiz Oda.
- **Yeni pet: Keçi (Kurban)** — masum görünen, perçemi gözüne düşen günah keçisi; boynuzları evreyle büyür. Pasif: yanlışlarda %25 fazla can kaybı ama sonraki ilk doğru %50 fazla XP. Yetenek “Ayna”: cevabın ilk ve son harfini, uzunluğunu gösterir. Evreler: Oğlak → Kuzucuk → Ak Keçi → Boynuzlu → Dağ Keçisi → Günah Keçisi.
- Bitkinin yuvası artık raf (3B saksıyla çakışmasın diye).

---
# dam-la 2.5.1 — Her evrim ayrı bir pet

Uzaktan güncellemeyle gelir.
- **Civciv ve gecko önden de görünür:** dururken, otururken ve uyurken yüzü sana dönük (iki göz, ortada gaga/ağız); yürürken yandan. Yürürken yön değiştirince dönüşün ortasında bir an önden görünür. Civcivin tüm evreleri (tavus kuşu yelpazesiyle) ve geckonun tüm evreleri (miğfer, boynuz, sakal) önden çizildi.
- **Kedi:** Minnoş (iri başlı, kısa bacaklı yavru) → Tekir (çizgili) → Vaşak (kulak püskülü, yanak yelesi, benek, kısa kuyruk) → Puma (ten rengi, açık ağız) → Leopar (hardal, rozet desen) → Kara Panter (siyah, gölgede seçilen rozetler, uzun gövde).
- **Köpek:** Tosbik (düşük kulaklı yavru) → Hav (yarı kalkık kulak) → Çoban (siyah maske, çivili tasma) → Genç Kurt → Kurt → Alfa Kurt (koyu post, boyun yelesi, göz yarası).
- **Civciv:** Yumurtacık (çatlaktan bakan göz) → Pıtırcık (kabukta) → Tombiş (kabuktan çıkmış, ayakta) → Kanatçık (büyük kanat, kuyruk tüyleri) → Tavus Yavrusu (küçük yelpaze) → Tavus Kuşu (göz desenli tam yelpaze, taç).
- **Baykuş:** Tüy Yumağı (kulaksız, kabarık, mavi bebek gözleri) → Yavru Baykuş → Kukumav (beyaz benekli) → Peçeli (kalp yüz, kara gözler) → Puhu (büyük kulak tüyleri, turuncu göz) → Gece Bekçisi (gece mavisi, parlayan gözler).
- **Gecko:** Kıpır (iri başlı yavru) → Duvar Gezgini → Benekli (sarı-siyah benek) → Taş Kertenkelesi (bant desen, sırt dikeni) → Bukalemun (yeşil, miğfer) → Sessiz Ejder (boynuz, sakal, diken sırtı).
- **Bitki:** Tohumcuk (toprakta yüzü olan tohum) → Filizcik → Papatya (yüzü çiçeğin ortasında) → Lale → Kaktüs → Ulu Ağaç (bir yanı yapraklı ve meyveli, öbür yanı çıplak dallı).
- Kedi ve köpek ilk iki evrede seçilen tüy rengini taşır, sonra türün kendi rengine döner. Her evre kendi bacak boyuna göre adım atar; ayaklar yine kaymaz.

---
# dam-la 2.5.0 — Yeni petler ve sıfırdan animasyon

Uzaktan güncellemeyle gelir.
- **Yeni çizimler (geometrik editoryal):** kara kedi, iki tonlu kurt-köpek, kabuktaki civciv, halka gözlü baykuş, dikenli gecko, yarısı kurumuş kaktüs. Kontur yok, düz renk düzlemleri, toprak tonları, kâğıt grenı.
- **Yeni hareket motoru:** eski iskelet tamamen bırakıldı. Her pet parçalardan (baş, kulak, kuyruk, bacaklar, kapaklar, göz bebekleri, kanatlar) oluşur ve kendi karakterine göre oynar.
- **Kayma yok:** yürüyen pet adım attıkça ilerler; duruştaki ayak yerde sabit kalır, salınımdaki ayak kalkıp öne gelir. Koşuda dörtnal. Yürüyemeyen petler (civciv, baykuş, bitki) zıplar ve yalnızca havadayken ilerler.
- **Yönler:** kedi ve köpek oturunca bir pozda, yürürken yandan ayrı bir çizimle görünür, uyurken kıvrılır/yatar. Yön değişiminde önce baş döner, gövde izler.
- **Tüm hareketler:** sevinç zıplaması, yeme, kızma/ısırma/pati atma, irkilme, donma, bakınma, baş çevirme, yalanma, gerinme, silkinme, yuvarlanma, eşinme, kuyruk sallama, güneşlenme, kahve, sürtünme, yetenek, uyuklama, uyku, ölüm. Ruh hâli kapaklara, kulaklara, kuyruğa ve başın duruşuna yansır.
- **Tüy renkleri:** kedi, köpek ve geckoda 8'er renk.

---
# dam-la 2.4.1 — Naif / retro editoryal petler

Uzaktan güncellemeyle gelir.
- **Yeni stil: naif (outsider art) + retro editoryal illüstrasyon.** Risograf baskı mürekkepleri gibi sıcak bir palet (tuğla kırmızısı, hardal, petrol yeşili, kobalt, krem kâğıt), ince ve titrek mürekkep kontur, hafif kaymış ikinci baskı rengi ve kâğıt grenı.
- **2B çizim, 3B kütle:** her pet sol üstten ışık alıyor; gövde üç tonda (ışık, yarı ton, gölge) gölgeleniyor, gölge tarafı el çizimi taramayla dolduruluyor.
- **Ayrıntılar geri geldi:** gölge ve parıltı katmanları artık silinmiyor; türe özgü desenler eklendi (kedi/köpekte tüy çizgileri, civcivde tüy kıvrımları, baykuşta tüy okları, geckoda pul, bitkide damar). Gerçek tüy renkleri (zencefil, kül, kömür, krem, tarçın) geri döndü.
- **Gözler:** krem badem göz, renkli iris, siyah göz bebeği (kedi ve geckoda yarık), ışık noktası, göz kalemi gibi üst kapak çizgisi. Korkuda göz bebeği küçülür.
- **Daha büyük:** dolaşan pet 132 piksel; yuva alanı daha yüksek, puantiyeli duvar kâğıdı ve ahşap zeminli bir oda; yuvalar dikişli, desenli, el çizimi.

---
# dam-la 2.4.0 — Logo dilinde petler, 3B dönüş, sakin tepkiler

Uzaktan güncellemeyle gelir.
- **Yeni görsel dil (logodaki kedi gibi):** düz, canlı pastel renkler (nane, pembe, lila, tereyağı, gök mavisi), el çizimi siyah mürekkep kontur ve saniyede birkaç kez titreyen çizgi. Gözler siyah "gözlük" bademler, üstünde iki beyaz eğik parıltı; kedide düğüm burun ve kontura taşan bıyıklar. Yuvalar da aynı çizgide.
- **Daha büyük petler:** dolaşan pet 76'dan 100 piksele çıktı; yavru formlar daha tombul ve iri başlı çizildi.
- **3B dönüş:** artık ayna gibi daralıp ters dönmüyor. Önce başını sana çevirir, gövde onu izler; dönüşün ortasında yüzü önden görünür. Civciv, bitki ve baykuşta yüz gövdenin üstünde kayar, küre döner gibi.
- **Duygu beden dilinde:** göz kapağı çizgisi (kızgın, üzgün, uykulu) ve bakış ifadeyi taşır; emote balonu en fazla 20 saniyede bir çıkar, tepkilerin çoğu balonsuz.
- **Her dokunuşa tepki vermez:** bir tepkiden sonra 7 saniye umursamaz; kedi, gecko ve baykuş dokunuşların yarısını görmezden gelir. Israr edersen sessizce dönüp bakar. Uyuyan kurt yine ısırır.
- **Yetenek düğmesi soru kartında:** yazmalı soruda İpucu'nun yanında, seçenekli soruda Soruyu dinle'nin yanında.
- **Geniş yuva, ince barlar:** can, açlık ve enerji tek satırda küçük barlar; yuva alanı tam genişlikte. Flow düğmesi ismin yanına taşındı.
- **Evrimler sürpriz:** seçim ekranı ve bilgi sayfası gelecek formları göstermez.
- **Kutucuklu sorular:** uzun cevaplarda kelimeler bölünmeden alt satıra geçer; her kelimenin altında ince bir çizgi, kelimeler arasında boşluk var.
- **Matematik, Fizik, Kimya: 1000’er soru, zorluk geçişli.** Sorular MEB ortaöğretim öğretim programlarının kazanımları ve OpenStax (Rice Üniversitesi, açık lisanslı) ders kitaplarının standart problem türleri üzerine kurulu kalıplardan üretilir; cevaplar hesaplandığı için hatasızdır, yanlış şıklar öğrencilerin tipik hatalarından gelir ve her sorunun adım adım açıklaması ile kaynağı var. 5 zorluk kademesi: konunun seviyesi her 2 seviyede bir kademe yükselir; sorular çoğunlukla bulunduğun kademeden, bazen bir alttan (pekiştirme), ara sıra bir üstten (meydan okuma) gelir. Kayıtlı ilerleme korunur.
- **AI sesi:** seçtiğin ses hemen kaydedilir ve "Sesi dene" seçili sesle okur (önceden ses listesi yenilenince seçim eski sese dönüyordu). AI sesi çalışmazsa sessizce cihaz sesine geçmek yerine haber verir. Telefonda ses adları kısaldı (ör. "Heart · US ♀").

---
# dam-la 2.3.0 — Petler büyüdü: lo-fi görünüm, mizaçlar, baykuş ve gecko

Uzaktan güncellemeyle gelir. Veritabanı kuralları güncellendi (baykuş ve gecko türleri): Firebase konsolunda yayınlanmalı.
- **Lo-fi görsel dil:** Soluk, kırık tonlu paletler; çizimlerin üstünde ince film greni. Akşam renkler sıcaklaşır, gece serinleyip kararır, hüzünde renk çekilir. Parıltılı iri gözler ve allık kalktı: civcivde sade yuvarlak gözler, bitkide kapaklı sabırlı bakış, kedide amber badem göz ve yarık göz bebeği, köpekte koyu yumuşak gözler.
- **Her petin bir hâli var** (seçim ekranında ve bilgi sayfasında yazıyor):
  - **Civciv** — saf, meraklı, habersiz. Yanlış cevapta üzülmez, ne olduğunu anlamaya çalışır; dokunduğun yerin yakınında dolaşır; günü 21:00'de bitirip uyur.
  - **Bitki** — sabır. Kendi döngüsü var: bazen gür, bazen yarı solgun, bazen yapraksız, kuru ve dikenli; yavaş yavaş toparlanır (tepede taze bir filiz belirir), yine solar. Su ve bakım yönü belirler ama döngüyü tamamen durduramaz. Yanlışta sızlanmaz, sessizce eğilir.
  - **Kedi** — bencil cazibe merkezi. Dokunuşları çoğu zaman umursamaz ya da tırmalar; karnı toksa sokulur. İşler fazla iyi gidince sıkılır, soru kartının kenarındaki fincanı düşürür, bir süre sonra hiçbir şey olmamış gibi gelip başını sürter.
  - **Köpek/Kurt** — koşulsuz sadakat. Arka arkaya yanlış yaptığında ya da canın azaldığında soru kartının başında nöbet tutar. Kurt formlarında uyurken dürtersen ısırır.
- **Yeni: Baykuş** (Nöbetçi) — gece onun gündüzü: geceleri uyumaz, öğleden sonra kestirir. Pasif *Gece Nöbeti*: 22–04 arası doğru cevaplar %25 fazla XP. Aktif *Dört Tur Önde*: sonraki 4 soruda yanlışların can kaybı yarıya iner. Sabahları kahve içer; kısa bir canlanma, sonra yine aynı yorgunluk. 6 form: Tüy Yumağı → Gece Bekçisi.
- **Yeni: Gecko** (Süzgeç) — farklı görünür, farklı yaşar: gözünü yalar, adımın ortasında donar, güneşlenir. Rengi sahiplenirken rastgele atanır. Pasif *Güneşte Sabit*: 10–17 arası yanlışlarda %30 daha az can kaybı. Aktif *Av Ona Gelir*: kıpırdamadan bekler, sonraki doğru cevap ×2 XP. 6 form: Kıpır → Sessiz Ejder (bukalemun formunda rengi yavaşça değişir).
- Pet daha az konuşur: sıradan laflar en fazla 40 saniyede bir; kendini çoğunlukla ifadesi ve tavrıyla anlatır.
- Yuvalar ve emote simgeleri de soluk tonlara geçti. Yönetici paneli yeni türleri gösterir ve tür değiştirme listesinde sunar.

---

# dam-la 2.2.8 — Ödül şarkıları önce yalnızca ses

Uzaktan güncellemeyle gelir.
- ▶ artık her zaman 30 saniyelik **yalnızca ses** çalar: video yok, reklam yok.
- Şarkının tamamını isteyen çalardaki **Tamamı** (▭▶) düğmesini açar; o zaman şarkı YouTube oynatıcısında tam çalar (YouTube kuralları gereği video görünür ve reklam çıkabilir). Kapatınca kısa dinlemeye döner.

---

# dam-la 2.2.7 — Ödül şarkılarının tamamı YouTube'dan

Uzaktan güncellemeyle gelir.
- Şarkı seçimi aynı: Apple/Deezer popüler listeleri. ▶'a basınca şarkının YouTube videosu bulunur ve **tamamı** uygulamanın içinde, pet kartının altındaki çalarda çalar (YouTube kuralları gereği video alanı görünür durur).
- Duraklat, durdur, sar, ileri-geri ve Mix (yumuşak geçiş) YouTube şarkılarında da çalışır.
- Bulunan videolar cihazda hatırlanır; aynı şarkı tekrar aranmaz. Gömülemeyen video olursa sıradaki uygun video denenir.
- YouTube'un ücretsiz günlük arama sınırı (tüm kullanıcılar için ~100 yeni şarkı) dolarsa o gün yeni şarkılar 30 saniyelik ön dinlemeyle çalar; sınır her gün TR saatiyle 11:00'de sıfırlanır.

---

# dam-la 2.2.6 — Müzik ödülü pet kartının altında

Uzaktan güncellemeyle gelir.
- **Ödül penceresi kalktı:** Doğru cevapta açılan pencere, başlık ve alt yazılar yok. Yeni şarkı, pet kartının hemen altındaki çalara eklenir; soru akışı kesilmez.
- **Şarkı geçmişi:** Kazandığın bütün ödül şarkıları saklanır (son 60). ⏮ ⏭ ile eski ve yeni şarkılar arasında gezersin; sayaç kaçıncı şarkıda olduğunu gösterir. Bir şarkı çalarken yeni ödül gelirse ⏭ üstünde rozet çıkar.
- **Kontroller:** çal/duraklat, durdur, ileri-geri, şarkı içinde kaydırarak sarma, beğen ♡, şarkının tamamını sağlayıcıda aç ↗.
- **Mix:** Açıkken şarkılar arasında 6 saniyelik yumuşak ses geçişi yapılır ve liste kesintisiz akar (sona gelince başa sarar). Kapalıyken şarkı bitince sıradakine geçer, listenin sonunda durur.
- Düzeltme: Apple yedek aramasında "notExplicit" etiketli şarkılar yanlışlıkla eleniyordu; artık yalnızca gerçekten müstehcen olanlar elenir.

---

# dam-la 2.2.5 — Pet kaydırmaya anında uyar

Uzaktan güncellemeyle gelir.
- Ekranı kaydırırken pet artık geriden gelip sonradan yerine kaymıyor; sayfayla birlikte aynı anda hareket ediyor (yuvadayken de gezerken de).
- Gezen pet sayfanın bir parçası gibi davranır: kaydırıp onu geride bırakırsan en yakın kenardan ekrana yürüyerek geri girer.

---

# dam-la 2.2.4 — Petler baştan: gerçek iskelet animasyonu

Uzaktan güncellemeyle gelir. Yeni bağımlılık yok, veritabanı kuralları değişmedi.
- **Yeni oynatıcı mimarisi (`src/pets/`):** 4 pet artık koddan çizilen bir iskeletle her karede canlandırılıyor (eski CSS animasyon sistemi kaldırıldı).
  - `anim.js`: yumuşatma eğrileri, anahtar kare harmanlama, yay fiziği, ters kinematik.
  - `quad.js` / `bean.js`: kedi-köpek ve civciv-bitki iskeletleri, 6'şar evrim formu, klipler.
  - `face.js`: ruh haline göre göz/ağız ifadeleri. `props.js`: mama kabı, kemik, lazer, yağmur bulutu, ayna, papatya, güneş gibi sahne eşyaları.
  - `puppet.js`: klip oynatma, geçiş harmanlama, göz kırpma, dönüş; durağan çizim (seçim/bilgi/evrim/ölüm/yönetici paneli) için `staticSVG`.
- **Yürüyüş artık kaymıyor:** adımlar kat edilen mesafeye bağlı; kuyruk/kulak/yaprak yaylı ikincil hareketle sallanıyor.
- **Kedi ve köpek rastgele tüy rengi alır** — sahiplenirken otomatik atanır, kullanıcı seçemez. Yönetici panelinde tüy rengi pet adından türetilerek gösterilir.
- **Koşullu klipler:** doğru cevapta mama kabından yiyip zıplama, seride dans; yanlışta irkilip çökme, canı azken yağmur bulutu altında ağlama; açken kabın başında titreme, tokken sırtüstü yuvarlanma; gece kıvrılıp uyuma, sabah esneme.
- **Yetenek animasyonları:** kedi lazeri kovalayıp üstüne atlar (soru o anda atlanır); köpek yeri kazıp kemik çıkarır; bitki forma göre filizlenir/ot söker/diken fırlatır/yaprak döker; civciv kabuğunu fırlatır, fısıldar ya da tavus kuyruğunu açar.
- **Boşta davranışlar türe özel:** kedi tımarlanır/gerinir, köpek koklar/silkinir/kuyruğunu kovalar, civciv aynaya bakar/papatya koparır, bitki gündüz güneşlenir.
- İsteğe bağlı geliştirici aracı (Pet Lab) eklendi; uygulamaya girmiyor, yalnızca kliplerin tarayıcıda denenmesi için.

---

# dam-la 2.2.3 — Yönetici panelinden pet yönetimi

Uzaktan güncellemeyle gelir. Veritabanı kuralları da güncellendi (Firebase'de yayınlandı).
- **Panelde pet görünür:** Kullanıcı listesinde petin adı, formu ve can/yemek/enerji yüzdeleri; ayrıntıda petin çizimi, ruh hali, flow, seri, canlanma sayısı ve çubuklar.
- **🐾 Pet sekmesi (yönetici):**
  - Bakım: canı doldur, besle/sula, enerji ver, hepsini doldur.
  - Canlandır: seviye düşmez, telafi istenmez.
  - Ayarlar: değerleri yüzde olarak ayarla; formu ve yıldızı ayarla (birkaç basamak atlansa da tek evrim gösterisi oynar).
  - Kimlik: adını ve türünü değiştir.
  - Modlar: flow ve dolaşmayı aç/kapat.
  - Konuştur: pete emote'lu bir cümle söylet.
  - Tepki oynat: sevgi, sevinç, dans, irkilme, hüzün, uyuklama.
  - Sıfırla: peti anı köşesine uğurla, yeni pet seçtir.
- **Herkese gönder › Pet bakımı:** Bütün petleri doldurur, ölüleri canlandırır.
- Kullanıcı her müdahaleyi petin tepkisi ve küçük bir bildirimle görür; konuşma ve tepki komutları sessizdir.
- Kurallar: pet kaydının ve pet komutlarının her alanı doğrulanır; kullanıcı kendine pet komutu gönderemez (49 kural testi).

---

# dam-la 2.2.2 — Hareketli emote'lar, yeni kedi-köpek tasarımı

Uzaktan güncellemeyle gelir, yeniden kurulum gerekmez.
- **Emote balonları:** Petin başının üstünde büyük, okunaklı simgeler belirir ve kendi içinde oynar:
  - ❤️ sevilince, 💢 dürtülünce, ❗ irkilince/uyandırılınca, ❓ etrafa bakınca, ♪ keyifliyken
  - 💧 yanlış cevapta, 🌧️ canı azken, 🐟/🦴/💧/🌾 doğru cevapta yemek yerken, ⭐ ve 🔥 seride
  - 💡 yetenek kullanınca, 🛡️ korurken, zZ uyurken, … yorgunken
- **Daha belirgin tepkiler:**
  - Doğru cevapta yemek yer, sonra hazırlanıp havaya sıçrar; seride sağa sola dans eder.
  - Yanlışta geri sarsılır, sonra boynu bükük oturur.
  - Dürtülünce büzülüp titrer, uyandırılınca havaya sıçrar.
  - Bir tepki sürerken boşta hareketleri onu yarıda kesmez.
- **Kedi ve köpek yeniden tasarlandı:** Örnek GIF'lerdeki gibi yandan görünen, ince bacaklı, büyük "O" gözlü sade karakterler. Renkleri ve evrim hatları aynı.
  - **Pozlar:** ayakta, yürürken çapraz bacak adımı, dörtnala koşma, oturma, kıvrılıp uyuma, uzanma, gerinme, zıplama, koklama, kabarma.
  - **Davranışlar:** Kedi tımarlanır ve gerinir; köpek koklar, silkinir; mutluyken kuyruk hızlı sallanır.
- **Civciv:** Yumurtacık artık kabuktan bakıyor. Kanatçık'ta ilk tavus tüyleri çıkıyor. Tavus Yavrusu yarı açık kuyruklu küçük bir tavus.
- **Bitki:** Aynı tatlılıkta ama daha olgun: küçük gözler, ağız yalnızca duygu anında, yaprak damarları, katlı taç yapraklar, oluklu kaktüs, katmanlı ağaç tacı.

---

# dam-la 2.2.1 — Renkli petler ve yeni evrim hatları

Uzaktan güncellemeyle gelir.
- Petler artık siyah değil, kendi doğal renklerinde (yine sade, çizgisiz, yumuşak gölgeli). Yıldızlı/kozmik son formlar kaldırıldı.
- 🌱 Bitki: Tohumcuk › Filizcik › **Papatya** › **Lale** › **Kaktüs** › **Ulu Ağaç** (çiçekli)
- 🐣 Civciv: Yumurtacık › Pıtırcık › Tombiş › Kanatçık › **Tavus Yavrusu** › **Tavus Kuşu**
- 🐱 Kedi: Minnoş › Tekir › **Vaşak** › **Puma** › **Leopar** › **Kara Panter**
- 🐶 Köpek: Tosbik › Hav › **Çoban** › **Genç Kurt** › **Kurt** › **Alfa Kurt**
- Mevcut petler bulundukları aşamayı korur; yalnızca görünümleri yenilenir.

---

# dam-la 2.2.0 — Petler ve “dam-la Kedi” teması

Petler ve tema uzaktan güncellemeyle gelir. **Yalnızca “acıktım” bildirimleri** için yeni APK/IPA kurulmalı (bildirim eklentisi yerel koddur).

## Petler
- **4 tür, her biri 6 evrim formu** (hepsi özgün çizim, kedi-köpek örneklerindeki sade siluet tarzında, çizgisiz, yumuşak gölgeli):
  - (2.2.1’de renklendirildi ve evrim hatları yenilendi; güncel liste yukarıda.)
- **Seçim:** İlk açılışta, kalibrasyondan hemen sonra pet seçilir ve adı verilir. Mevcut kullanıcılara da bir kez sorulur.
- **Yuva:** Seviye çubuğu ile soru tipi düğmesinin arasında. Petin yuvası (saksı, yuva, minder, kulübe), adı, formu ve üç çubuk burada görünür:
  - **❤️ Can:** Yanlış cevaplar azaltır.
  - **Yemek:** Bitkide **💧 Su**. Her doğru cevap doldurur, zamanla azalır.
  - **⚡ Enerji:** Her soruda azalır, dinlenince ve gece uykusunda dolar.
- **Dolaşma:** Pet uygulamanın her yerinde dolaşır, soruların ve yazıların önünden geçer. Durduğu yeri düğmelerin üstü olmayacak şekilde seçer. Yuvaya dokununca yanına gelir.
- **Tepkiler:**
  - Doğru cevapta yemek yer ve sevinir. Yanlışta üzülür.
  - Çok soru çözülünce **karnı şişer**, mayışır, yavaş yürür, uzanır.
  - Dokununca bazen **kaçar**, bazen **dürtülmüş gibi** irkilir, bazen sevilmekten hoşlanır (kalpler). Basılı tutunca okşanır.
  - Arada konuşma balonuyla moral ve destek verir; seri yapınca, yanlıştan sonra, acıkınca ve flow modunda farklı konuşur. Sesli konuşmaz.
- **Saat:**
  - 23:00–06:00 arası uyur.
  - 06:00–07:30 arası hâlâ uyuyordur; soru çözünce uyanır.
  - 07:30–10:00 arası **sabah mahmurudur**.
  - 20:00–23:00 arası uykusu gelir ve uyuklar.
  - Yuvanın gökyüzü de akşam ve gece rengine döner.
- **Evrim:** Her seviye atlayışta (İngilizce veya herhangi bir konu) bir üst forma evrimleşir; parlayan siluet animasyonu oynar. Son formdan sonraki her seviye ⭐ ekler. Evrimde can, yemek ve enerji sınırları büyür.
- **Ölüm:** Can 0 olursa pet ölür ve iki seçenek çıkar:
  - **Canlandır:** Ölümün olduğu konunun seviyesi sıfırlanır, aynı pet döner. Eski XP’ne ulaşana kadar o konuda **2× XP telafi bonusu** alırsın.
  - **Yeni pet:** Eski pet anı köşesine uğurlanır, yeni pet baştan büyür. O konunun seviyesi düşmez; yalnızca o seviyedeki XP çubuğu sıfırlanır.
- **Yetenekler:**

| Pet | Güçlü yanı | Pasif | Aktif (enerji harcar) |
|---|---|---|---|
| Bitki | Büyük su deposu | Fotosentez: gündüz susuzluk ve enerji kaybı yarıda | Ayıkla: 2 yanlış şıkkı eler / yazmada cezasız 1 harf açar |
| Civciv | Ekstra enerji | Erken Kuş: sabah 06–12 doğrulara +%25 XP | Cik İpucu: cevabın ilk harfi + harf/kelime sayısı |
| Kedi | Ekstra can | Dokuz Can: günde bir kez ölümcül yanlışta 1 canla kurtulur | Pati Atla: soruyu cezasız ve seriyi bozmadan geçer |
| Köpek | Can + mama dengesi | Sadık Dost: her 5’li doğru seride +10 can | İz Sür: 1 yanlış şıkkı eler, o soruda can kaybını engeller |

- **Flow modu (🌊):**
  - Açıkken ödül pencereleri açılmaz.
  - Enerji her soruda değil, 10 soruda bir azalır.
  - Pet kafa bandıyla odaklanmış görünür ve destek verir.
  - Enerji çubuğunda dönen bir **direnç kalkanı** görünür.
- **Bildirimler (yeni APK/IPA ile):** Uygulama uzun süre açılmazsa telefona bildirim gelir: petin acıktığında, çok acıktığında, 1 gün ve 3 gün sonra. 22:00–09:30 arasında bildirim gönderilmez. Pet bilgisinden kapatılabilir.

## Tema
- **dam-la Kedi:** Logodaki pembe zemin, nane yeşili ve kalın siyah çizgili çıkartma görünümü (Ayarlar › Görünüm). Toplam 12 tema.

---

# dam-la 2.1.2 — Yönetici paneli bağlandı

Firebase projesi (`dam-la`, Avrupa sunucusu, ücretsiz Spark planı) kuruldu: anonim giriş + Google girişi, güvenlik kuralları yayında, uygulama ve panel bağlı. Uzaktan güncellemeyle gelir.

---

# dam-la 2.1.1 — Güvenlik ve gizlilik

Uzaktan güncellemeyle gelir (yeniden kurulum gerekmez).

| Bulunan risk | Önem | Düzeltme |
|---|---|---|
| Yönetici paneli, kullanıcı cihazından gelen bazı sayıları kaçışlamadan gösteriyordu; kötü niyetli biri sahte bir kayıtla panelde kod çalıştırıp yönetici oturumunu ele geçirebilirdi (XSS) | Yüksek | Paneldeki her değer kaçışlanıyor/sayıya zorlanıyor; veritabanı kuralları her alanın türünü ve uzunluğunu denetliyor; panelde içerik güvenlik politikası (CSP) ve çerçeveye gömme engeli var. Sahte verilerle test edildi |
| Yöneticinin e-postası her mesajla birlikte kullanıcının telefonuna gidiyordu | Orta | Mesajlarda yalnızca “yönetici” yazıyor |
| Yönetici e-postaları herkese açık depodaki kural dosyasındaydı; iki commit yazar e-postasıyla gönderilmişti | Orta | Yönetici yetkisi artık e-postayla değil Firebase kimliğiyle (`admins/<uid>`) veriliyor; e-postalar depo geçmişinden temizlendi, commit'ler GitHub'ın gizli noreply adresiyle |
| Panel ile web uygulaması aynı adreste olduğundan oturumları karışabilirdi; panel oturumu tarayıcıda kalıcıydı | Orta | Panel ayrı Firebase oturumu kullanıyor ve yalnızca açık sekmede tutuluyor |
| Kurallar her cihazın kendi kaydına istediği alanı/boyutu yazmasına izin veriyordu | Orta | Alan listesi, tür, uzunluk ve izinli değerler denetleniyor; kullanıcı kendine XP/ödül gönderemiyor, geçmişi değiştiremiyor; 36 senaryolu kural testi (`npm run test:rules`) |
| Uygulamada CSP yoktu | Orta | Yalnızca uygulamanın kendi betikleri çalışabiliyor, ağ istekleri bilinen servislerle sınırlı. Enjekte edilen kodun engellendiği test edildi |
| Güncelleme paketi herhangi bir https adresinden ve özetsiz kabul edilebiliyordu | Orta | Yalnızca bu deponun GitHub sürümlerinden ve SHA-256 özeti tutarsa kabul ediliyor |
| Müzik servislerinden gelen bağlantılar denetlenmiyordu (`javascript:` adresi olasılığı) | Düşük | Yalnızca https bağlantılar kullanılıyor |
| İçe aktarılan yedek dosyası türleri denetlenmeden yükleniyordu | Düşük | Sayılar, metinler ve soru durumları doğrulanıyor; zararlı yedekle test edildi |
| Bağımlılıklarda bilinen açıklar (grpc-js, sharp; uygulamaya girmiyorlardı) | Düşük | Güvenli sürümlere sabitlendi; `npm audit` (üretim): 0 açık |

Ayrıca **Ayarlar › Kimliğin › Hangi bilgiler paylaşılıyor?** bölümü kullanıcıya nelerin paylaşıldığını ve nelerin asla toplanmadığını açıklıyor.

Zaten iyi olanlar: ilerleme ve ses tamamen cihazda; reklam/analiz SDK'sı yok; güncelleme eklentisinin istatistik gönderimi kapalı; Android imza anahtarı depoda yok; düz HTTP ve karışık içerik kapalı.

---

# dam-la 2.1.0 — Yenilikler

> **Bu sürüm için telefona bir kez yeni APK/IPA kurulmalı** (ad, simge ve yeni yerel eklentiler değişti). Eskisinin üzerine kur; ilerleme silinmez. 2.0 kabuğundaki telefonlar 2.1 paketini indirmez, "yeniden kurulum gerekiyor" uyarısı gösterir.

## İstenenler ve durumu
| İstek | Durum |
|---|---|
| Adı **dam-la**, logosu gönderilen kedi görseli | ✅ Uygulama adı, ana ekran simgesi (Android/iPhone), açılış rengi, başlık |
| Pop quiz teması (mevcut görseli bozmadan) | ✅ Seçenekli sorular aynı kart tasarımında; eski “yazarak” akışı korunuyor |
| Profil açmadan kimlik + yönetici takibi | ✅ Her cihaz **DL-XXXXX** kimliği alır (Ayarlar'da, kopyalanabilir). Firebase ile canlı takip |
| 24 Kasım doğum günü teması | ✅ Logoya şapka + konfeti, pembe-altın tema, “İyi ki doğdun Damla!” şeridi, ödül penceresinde “HAPPY BIRTHDAY! 🎂”; ana ekran simgesi de şapkalı olur. 25 Kasım'da kendiliğinden normale döner (gece yarısı denetlenir) |
| Kalibrasyon genel kullanıma uygun + tüm bölümler | ✅ 20 seçenek: Genel kullanım + 19 bölüm (Tıp, Sağlık bilimleri, Eczacılık, Diş hekimliği, Biyomedikal, Bilgisayar, Elektrik-Elektronik, Makine, İnşaat, Mimarlık, Hukuk, İşletme/İktisat, Psikoloji, Eğitim, Uluslararası ilişkiler, Temel bilimler, Tasarım, Turizm, İletişim). Her bölüm kendi ileri seviye İngilizce terimlerini, anlamını, örnek cümlesini ve kullanım notunu öğretir |
| Kalibrasyon her açılışta sorulmasın, ayarlarda olsun | ✅ Yalnızca ilk açılışta; **Ayarlar › Kalibrasyonu yeniden yap** aynı menüyü açar |
| AI seslerinde çeşitlilik, güncel ve kaliteli | ✅ Telefonun tüm İngilizce sesleri + **Kokoro-82M** (2025, açık kaynak, cihazda çalışan sinirsel ses) 28 Amerikan/İngiliz kadın-erkek ses. İnternetsiz çalışır, üretilen sesler önbelleğe alınır |
| Mevcut tema adlandırılsın + 10 yeni tema | ✅ “Klasik Krem” + Gece Moru, Okyanus, Orman, Gün Batımı, Pembe Şeker, Nane Kedi, Kahve, Gece Mavisi, Yüksek Kontrast, Neon. Ayarlar'da önizlemeli seçim. Tüm temalarda yazı kontrastı otomatik denetlendi |
| Öğrenme biçimi ana ekranda tek düğme, her dokunuşta değişsin + Karışık | ✅ Yazarak → Pop Quiz → Dinleyerek → Karışık (her soru rastgele biçimde) |
| Pop quiz seçenekli + doğru/yanlış her durumda ayrıntılı açıklama | ✅ Açıklama, seçtiğin yanlış seçeneğin neden yanlış olduğunu, doğru cevabı, aynı anlamın A1–C2 merdivenini ve kaynağı gösterir |
| Matematik, fizik, kimya, biyoloji, coğrafya, tarih, ilk yardım, ehliyet, bilim, moda, sanat, hayat, felsefe sekmeleri; sıra Karışık → İngilizce → … | ✅ 13 konu × 12 soru; her soru resmî/kabul görmüş kaynağa dayanır (MEB müfredatı, BIPM SI Broşürü, IUPAC, DSÖ, ERC 2021 ve Sağlık Bakanlığı İlk Yardım Yönetmeliği, 2918 sayılı Karayolları Trafik Kanunu, NASA, NOAA, Resmî Gazete, Nobel Vakfı vb.). Açık kaynaklarda doğrudan kullanılabilir, Türkçe ve doğrulanmış bir soru bankası bulunamadığı için sorular kaynaklardan derlenerek yazıldı |
| Ödülde AI sesinin tebrik/teşekkür/cevabı okuması kaldırılsın | ✅ Ödül penceresi açıldığında hiçbir konuşma yapılmaz |
| Popüler müzik önerisi geliştirilsin | ✅ Türkiye/Dünya listesi seçimi, sıralamaya göre ağırlıklı seçim, yakın zamanda çıkanları tekrar etmeme, 30 sn önizleme, ♡ beğen, “Başka şarkı”, Spotify/YouTube Music'te aç, beğenilenler listesi |
| Doğru/yanlış sonrası XP'nin uçarak bara girmesi, sonra ödül penceresi | ✅ Artı yeşil / eksi kırmızı XP cevap kutusundan bara uçar, bar sonra güncellenir; ödül penceresi animasyon bittikten sonra açılır |
| Uygulamadan bağımsız yönetici paneli | ✅ `/admin/` — çevrimiçi/çevrimdışı, seviye, XP, o anki soru; XP/seviye artır-azalt, ödül, özel mesaj, toplu gönderim (KURULUM.md › 7) |

## Ayrıca
- Seçenekli İngilizce sorularda yanlış seçenekler artık aynı anlamın başka seviyelerinden gelir; soru gerçekten seviye farkını öğretir.
- Konu sekmelerinin her biri kendi seviyesini (40 XP'de bir) ve tekrar planını tutar; yanlış bilinen soru birkaç dakika sonra yeniden sorulur.
- Yönetici bir şey gönderdiğinde uygulamada bildirim şeridi çıkar; geçmiş mesajlar Ayarlar › Gelen kutusu'nda.
- Yedek dosyası adı `dam-la-yedek-…`; 2.0 yedekleri içe aktarılabilir.

---

# 2.0.0 — İnceleme, düzeltmeler ve yenilikler

Kaynak: GitHub `katxjhuun/Eng-quest` `main` (commit `977ba17`) + dışa aktarma paketindeki devir notu.

## A) Devir notundaki isteklerin kontrolü

| İstek (devir notu / zaman çizelgesi) | Önceki durum | 2.0 |
|---|---|---|
| Onboarding sonrası quiz; soru üstte, A1–C2 altı cevap kartı | Var | Var |
| Harf kutularıyla cevap girişi | Var | Var + Türkçe klavye düzeltmesi |
| Açılan kutu puan kazandırır, yanlışta yakınlık yüzdesi | Var | Var |
| İpucu rastgele kutuyu doldurur, kilitlenir; 6 ipucu | Var | Var |
| **İpucusuz çözüm daha fazla puan** | ⚠ Varsayılan %25 başlangıç harfi yüzünden *her* cevap "yardımlı" sayılıp 2 XP alıyordu; 4 XP pratikte alınamıyordu | ✅ Yardımsız 4, yalnız başlangıç harfleriyle 3, ipucuyla 2 XP |
| 5 yanlış hakkı | Var, ama kutular arasında geçince sayaç karışabiliyordu | ✅ Her kutunun hakkı ayrı ve doğru gösteriliyor |
| Kalibrasyon: seviye, öğrenme tarzı, hedef kaydedilir | ⚠ Kaydediliyordu ama seviyenin hiçbir etkisi yoktu | ✅ Seçilen seviyeye uygun ilk sorudan başlar; "Dinleyerek" seçilince otomatik seslendirme açılır |
| **Mobilde cevap kartları iki sütun** | ❌ Kural yazılmıştı ama sonradan gelen tasarım stili eziyordu; telefonda 3 sütun görünüyordu | ✅ Düzeltildi |
| Doğrusal ileri/geri gezinme, havuz sonu uyarısı, süresi gelen tekrarın sıfırlanması | Var | Var |
| Bilgisayar açık kalmadan Android/iPhone'dan erişim | Render'a bağlıydı (15 dk sonra uyku, Supabase 7 günde duraklama) | ✅ Uygulama telefonda, sunucusuz |
| İlerleme kaydı / cihazlar arası taşıma | Google + Supabase (yapılandırma gerektiriyordu) | ✅ Telefonda kalıcı kayıt + yedek dosyası ile taşıma |
| Telefonun eski uygulama kabuğunu göstermesi | Service worker "önce önbellek" kullandığı için tekrar ediyordu | ✅ PWA'da "önce ağ"; uygulamada sürümlü OTA |
| Ses: cihaz TTS | Tarayıcı sesi — **Android uygulama içinde (WebView) çalışmaz** | ✅ Uygulamada telefonun yerel TTS motoru |
| Soru havuzu: anlam eşdeğerliği kontrolü (devir notu madde 5) | Yapılmamıştı | ✅ Yapıldı, 3 soru düzeltildi (aşağıda) |

## B) Düzeltilen hatalar

1. **Mobil 2 sütun çalışmıyordu** (CSS sırası). Düzeltildi.
2. **Puanlama:** başlangıç harfleri her zaman açık olduğu için hiçbir cevap 4 XP almıyordu. Yeni kademeli puan.
3. **Başarısız soru cezası −36 XP** bir seviye eşiğinin tamamıydı; tek hatalı soru bir seviyeyi siliyordu. **−12 XP** yapıldı (`src/app.js` → `FAIL_PENALTY`).
4. **Türkçe klavye:** Shift+i "İ", ayrıca "ı" harfi sessizce siliniyordu; artık "i" sayılıyor.
5. **Android klavyesi (Gboard) harf çiftlemesi:** öneri/yazım sırasında kutu metni değiştirildiği için harfler çiftlenebiliyordu; artık yazım (composition) bitince temizleniyor. Otomatik düzeltme kapatıldı.
6. **iPhone'da ayar kutularına dokununca ekran yakınlaşıyordu** (16 px altı yazı). Düzeltildi.
7. **Kutu değiştirince yanlış/ipucu sayacı** başka kutunun değerini gösterebiliyordu. Düzeltildi.
8. **Soru etiketi** seviyeyi kullanıcının XP'sine göre gösteriyordu (B1 sorusu "A1" yazıyordu); artık sorunun kendi seviyesi.
9. **Boşluk doldurma cümleleri bozuk okunuyordu:**
   - "…needs to ______ the sensor." + "calibrate the sensor accurately" → "…the sensor accurately the sensor". C1/C2 cevapları düzeltildi.
   - "…should ______ the data." + "analyze the collected data" → "…data the data". Düzeltildi.
   - "…should be ______ under the same conditions." + "replicated under controlled conditions" → çift koşul. Cümle sadeleştirildi.
10. **Müzik ödülü sonsuz döngü riski:** aynı şarkı tekrar gelirse kendini sınırsız çağırıyordu; deneme sınırı eklendi. Çevrimdışıyken anlaşılır mesaj.
11. Her doğru kutuda tam ekran müzik penceresi: artık **Ayarlar › Ödül penceresi** ile "her kutu / soru bitince / kapalı" seçilebiliyor (varsayılan eskisi gibi).

## C) Yenilikler

- **Capacitor 8 mobil uygulama** (Android APK + iPhone IPA), App Store gerekmeden kurulum — `KURULUM.md`.
- **Kalıcı kayıt:** localStorage + işletim sisteminin silmediği yerel depo (Preferences); uygulama arka plana alınınca da kaydeder.
- **Yedek dışa/içe aktarma** (paylaşım menüsü / dosya).
- **Uzaktan güncelleme (OTA):** `@capgo/capacitor-updater` (manuel mod, kendi GitHub Releases'ın; üçüncü taraf hesap/istatistik yok), SHA-256 doğrulaması, bozuk sürümde otomatik geri dönüş, yerel kabuk sürüm uyumluluk kontrolü, Ayarlar'da güncelleme bölümü ve "Yeni sürüm hazır" şeridi.
- **Android geri tuşu** önce açık pencereyi kapatır.
- **GitHub Actions:** APK + OTA paketi (Release), imzasız IPA (iOS), PWA (GitHub Pages).

## D) Kaldırılanlar
Node sunucusu (`server.js`), Render, Supabase, Google girişi, sunucu erişim kodu. Eski veriler `KURULUM.md` §4'teki adımla taşınabilir.

## E) Test edilenler
Masaüstü Chrome'da telefon boyutunda (390×844): kalibrasyon, seviye başlangıcı, yanlış cevap/yakınlık, harf ipucu, 6 kutuyu çözme (Türkçe "İ" ile), puanlar (5×3 + 3 = 18 XP), ödül modu, sayfa yenilemede kalıcılık, yedek dışa aktarma → sıfırlama → içe aktarma. Yerel eklentiler taklit edilerek: güncelleme denetimi → indirme → planlama → "Yeniden başlat", yerel TTS, Android geri tuşu. Konsol hatası: yok.
**Test edilemeyen:** gerçek telefonda APK/IPA kurulumu (bu ortamda Android SDK'ya erişim yok) — ilk derleme GitHub Actions'ta yapılacak.
