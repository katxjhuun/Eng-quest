// Trace oyunu için tarihî olaylar: yıl | olay. Negatif yıl = MÖ. Yıllar yaygın kabul gören tarihlerdir
// (MEB Tarih ders kitapları, Türk Tarih Kurumu, Britannica). Yaklaşık tarihler için olayın en çok kabul edilen yılı kullanılmıştır.
const RAW = `
-3200|Sümerlerin çivi yazısını kullanmaya başlaması
-2560|Büyük Giza Piramidi’nin tamamlanması
-1754|Hammurabi Kanunları’nın yazılması
-1274|Kadeş Savaşı
-1259|Kadeş Antlaşması (Hititler–Mısır)
-776|İlk Antik Olimpiyat Oyunları
-753|Roma’nın kuruluşu (geleneksel tarih)
-660|Lidyalıların parayı kullanmaya başlaması (yaklaşık)
-563|Buda’nın doğumu (geleneksel tarih)
-551|Konfüçyüs’ün doğumu
-509|Roma Cumhuriyeti’nin kuruluşu
-490|Maraton Savaşı
-480|Salamis Deniz Savaşı
-447|Parthenon’un yapımının başlaması
-399|Sokrates’in ölüme mahkûm edilmesi
-387|Platon’un Akademi’yi kurması
-334|Büyük İskender’in Anadolu’ya geçişi
-323|Büyük İskender’in ölümü
-221|Çin’in Qin hanedanı altında birleşmesi
-209|Mete Han’ın Asya Hun hükümdarı olması
-218|Hannibal’ın Alpleri aşması
-146|Kartaca’nın yıkılması
-44|Julius Caesar’ın öldürülmesi
-27|Roma İmparatorluğu’nun kuruluşu (Augustus)
79|Vezüv’ün patlayıp Pompeii’yi gömmesi
105|Çin’de kâğıdın geliştirilmesi (Cai Lun)
313|Milano Fermanı
330|Konstantinopolis’in Roma’nın başkenti olması
375|Kavimler Göçü’nün başlaması
395|Roma İmparatorluğu’nun ikiye ayrılması
434|Attila’nın Avrupa Hun hükümdarı olması
476|Batı Roma İmparatorluğu’nun yıkılışı
537|Ayasofya’nın tamamlanması
552|Göktürk Devleti’nin kuruluşu
570|Hz. Muhammed’in doğumu (yaklaşık)
610|İslamiyet’in ilk vahyi (geleneksel tarih)
622|Hicret
632|Hz. Muhammed’in vefatı
661|Emevi Devleti’nin kuruluşu
711|Emevilerin İspanya’ya geçişi
732|Puvatya (Tours) Savaşı
735|Orhun Yazıtları’nın (Bilge Kağan Yazıtı) dikilmesi
744|Uygur Devleti’nin kuruluşu
750|Abbasi Devleti’nin kuruluşu
751|Talas Savaşı
800|Şarlman’ın imparator ilan edilmesi
840|Karahanlı Devleti’nin kuruluşu (yaklaşık)
962|Kutsal Roma-Germen İmparatorluğu’nun kuruluşu
963|Gazneli Devleti’nin kuruluşu
1037|Büyük Selçuklu Devleti’nin kuruluşu
1040|Dandanakan Savaşı
1054|Doğu ve Batı Kiliseleri’nin ayrılması
1066|Hastings Savaşı (Normanların İngiltere’yi alması)
1071|Malazgirt Savaşı
1072|Kaşgarlı Mahmud’un Divânu Lugâti’t-Türk’ü yazmaya başlaması
1077|Anadolu Selçuklu Devleti’nin kuruluşu
1096|I. Haçlı Seferi’nin başlaması
1099|Haçlıların Kudüs’ü alması
1176|Miryokefalon Savaşı
1187|Selahaddin Eyyubi’nin Kudüs’ü alması
1206|Cengiz Han’ın Moğol İmparatorluğu’nu kurması
1215|Magna Carta’nın imzalanması
1243|Kösedağ Savaşı
1258|Moğolların Bağdat’ı yıkması
1273|Mevlana’nın vefatı
1299|Osmanlı Beyliği’nin kuruluşu (geleneksel tarih)
1326|Bursa’nın fethi
1337|Yüz Yıl Savaşları’nın başlaması
1347|Kara Veba’nın Avrupa’ya ulaşması
1353|Osmanlıların Rumeli’ye geçişi (Çimpe Kalesi)
1389|I. Kosova Savaşı
1396|Niğbolu Savaşı
1402|Ankara Savaşı
1413|Fetret Devri’nin sona ermesi
1444|Varna Savaşı
1448|II. Kosova Savaşı
1450|Gutenberg’in hareketli harfli matbaası (yaklaşık)
1453|İstanbul’un fethi
1473|Otlukbeli Savaşı
1488|Bartolomeu Dias’ın Ümit Burnu’nu dolaşması
1492|Kolomb’un Amerika’ya ulaşması
1498|Vasco da Gama’nın Hindistan’a ulaşması
1503|Leonardo da Vinci’nin Mona Lisa’ya başlaması (yaklaşık)
1512|Michelangelo’nun Sistina Şapeli tavanını bitirmesi
1514|Çaldıran Savaşı
1516|Mercidabık Savaşı
1517|Ridaniye Savaşı ve halifeliğin Osmanlı’ya geçişi
1519|Macellan seferinin başlaması
1521|Belgrad’ın fethi
1522|Rodos’un fethi
1526|Mohaç Savaşı
1529|I. Viyana Kuşatması
1538|Preveze Deniz Savaşı
1543|Kopernik’in Güneş merkezli modeli yayımlaması
1557|Süleymaniye Camii’nin tamamlanması
1571|İnebahtı Deniz Savaşı
1571|Kıbrıs’ın fethi
1575|Selimiye Camii’nin tamamlanması
1588|İspanyol Armadası’nın yenilmesi
1600|İngiliz Doğu Hindistan Şirketi’nin kuruluşu
1606|Zitvatorok Antlaşması
1609|Kepler’in ilk iki gezegen yasasını yayımlaması
1610|Galileo’nun Jüpiter’in uydularını görmesi
1616|Sultanahmet Camii’nin tamamlanması
1620|Mayflower’ın Amerika’ya varması
1622|Genç Osman’ın öldürülmesi
1638|IV. Murad’ın Bağdat’ı geri alması
1639|Kasr-ı Şirin Antlaşması
1648|Westfalya Barışı
1653|Tac Mahal’in tamamlanması
1669|Girit’in fethi
1683|II. Viyana Kuşatması
1687|Newton’un Principia’yı yayımlaması
1699|Karlofça Antlaşması
1711|Prut Antlaşması
1718|Pasarofça Antlaşması ve Lale Devri’nin başlaması
1727|İbrahim Müteferrika’nın ilk Türk matbaasını kurması
1730|Patrona Halil İsyanı
1739|Belgrad Antlaşması
1756|Yedi Yıl Savaşları’nın başlaması
1769|James Watt’ın buhar makinesi patenti
1774|Küçük Kaynarca Antlaşması
1776|ABD Bağımsızlık Bildirgesi
1783|Kırım’ın Rusya’ya bağlanması
1789|Fransız İhtilali
1792|Yaş Antlaşması
1798|Napolyon’un Mısır seferi
1800|Volta pilinin tanıtılması
1804|Napolyon’un imparator ilan edilmesi
1808|Sened-i İttifak
1812|Bükreş Antlaşması
1815|Waterloo Savaşı
1821|Mora İsyanı
1826|Yeniçeri Ocağı’nın kaldırılması (Vaka-i Hayriye)
1829|Edirne Antlaşması
1830|Cezayir’in Fransa tarafından işgali
1831|Osmanlı’da ilk nüfus sayımı
1833|Hünkâr İskelesi Antlaşması
1838|Balta Limanı Ticaret Antlaşması
1839|Tanzimat Fermanı
1844|Mors’un ilk telgraf mesajı
1848|Avrupa’da 1848 Devrimleri
1853|Kırım Savaşı’nın başlaması
1854|Osmanlı’nın ilk dış borcu
1856|Islahat Fermanı ve Paris Antlaşması
1859|Darwin’in Türlerin Kökeni’ni yayımlaması
1861|Amerikan İç Savaşı’nın başlaması
1865|ABD’de köleliğin kaldırılması (13. Değişiklik)
1869|Süveyş Kanalı’nın açılması
1869|Mendeleyev’in periyodik tablosu
1871|Almanya’nın siyasi birliğini kurması
1876|I. Meşrutiyet’in ilanı
1876|Bell’in telefon patenti
1877|93 Harbi’nin (Osmanlı–Rus Savaşı) başlaması
1878|Berlin Antlaşması
1879|Edison’ın ampulü
1881|Mustafa Kemal Atatürk’ün doğumu
1881|Düyun-u Umumiye’nin kurulması
1886|Benz’in otomobil patenti
1889|İttihat ve Terakki Cemiyeti’nin kuruluşu
1895|X-ışınlarının keşfi
1896|İlk modern Olimpiyat Oyunları (Atina)
1897|Osmanlı–Yunan (Dömeke) Savaşı
1903|Wright kardeşlerin ilk motorlu uçuşu
1905|Einstein’ın özel görelilik makalesi
1908|II. Meşrutiyet’in ilanı
1909|31 Mart Vakası
1911|Trablusgarp Savaşı’nın başlaması
1912|Titanik’in batması
1912|I. Balkan Savaşı’nın başlaması
1914|I. Dünya Savaşı’nın başlaması
1915|18 Mart Çanakkale Deniz Zaferi
1917|Rusya’da Ekim Devrimi
1918|Mondros Ateşkes Antlaşması
1919|Mustafa Kemal’in Samsun’a çıkışı
1919|Erzurum ve Sivas kongreleri
1919|Versay Antlaşması
1920|TBMM’nin açılışı
1920|Sevr Antlaşması
1920|Milletler Cemiyeti’nin kuruluşu
1921|Sakarya Meydan Muharebesi
1921|İstiklal Marşı’nın kabulü
1922|Büyük Taarruz
1922|Saltanatın kaldırılması
1923|Lozan Barış Antlaşması
1923|Cumhuriyet’in ilanı
1924|Halifeliğin kaldırılması
1924|1924 Anayasası
1925|Şapka Kanunu
1926|Türk Medeni Kanunu
1928|Harf İnkılabı
1928|Penisilinin keşfi
1929|Dünya Ekonomik Buhranı
1931|Türk Tarih Kurumu’nun kuruluşu
1932|Türk Dil Kurumu’nun kuruluşu
1932|Türkiye’nin Milletler Cemiyeti’ne üyeliği
1933|İstanbul Darülfünunu’nun üniversiteye dönüştürülmesi
1934|Soyadı Kanunu
1934|Kadınlara milletvekili seçme ve seçilme hakkı
1934|Balkan Antantı
1936|Montrö Boğazlar Sözleşmesi
1937|Sadabat Paktı
1938|Atatürk’ün vefatı
1939|II. Dünya Savaşı’nın başlaması
1939|Hatay’ın Türkiye’ye katılması
1940|Köy Enstitüleri’nin kuruluşu
1941|Pearl Harbor baskını
1944|Normandiya Çıkarması
1945|Hiroşima ve Nagazaki’ye atom bombası
1945|Birleşmiş Milletler’in kuruluşu
1946|Çok partili hayata geçiş (Demokrat Parti’nin kuruluşu)
1947|Hindistan’ın bağımsızlığı
1947|Transistörün icadı
1948|İnsan Hakları Evrensel Beyannamesi
1949|NATO’nun kuruluşu
1949|Çin Halk Cumhuriyeti’nin ilanı
1950|Kore Savaşı’nın başlaması
1950|Demokrat Parti’nin seçimle iktidara gelmesi
1952|Türkiye’nin NATO’ya girişi
1953|DNA’nın çift sarmal yapısının yayımlanması
1955|Varşova Paktı’nın kuruluşu
1957|Sputnik 1’in fırlatılması
1957|Avrupa Ekonomik Topluluğu’nun kuruluşu (Roma Antlaşması)
1959|Türkiye’nin AET’ye ortaklık başvurusu
1961|Gagarin’in uzay uçuşu
1961|Berlin Duvarı’nın inşası
1962|Küba Füze Krizi
1963|Ankara Anlaşması (Türkiye–AET)
1963|John F. Kennedy suikastı
1969|Apollo 11’in Ay’a inişi
1971|İlk e-postanın gönderilmesi
1973|Boğaziçi Köprüsü’nün açılması
1974|Kıbrıs Barış Harekâtı
1975|Vietnam Savaşı’nın sona ermesi
1977|Voyager 1’in fırlatılması
1981|İlk IBM kişisel bilgisayarı
1983|Kuzey Kıbrıs Türk Cumhuriyeti’nin ilanı
1986|Çernobil nükleer kazası
1987|Türkiye’nin AT’ye tam üyelik başvurusu
1988|Fatih Sultan Mehmet Köprüsü’nün açılması
1989|Berlin Duvarı’nın yıkılması
1989|Web’in önerilmesi (Tim Berners-Lee)
1990|Hubble Uzay Teleskobu’nun fırlatılması
1991|Sovyetler Birliği’nin dağılması
1992|Maastricht Antlaşması
1993|Avrupa Birliği’nin kuruluşu
1993|Türkiye’de ilk internet bağlantısı (ODTÜ)
1996|Dolly koyununun klonlanması
1996|Türkiye–AB Gümrük Birliği’nin yürürlüğe girmesi
1998|Google’ın kuruluşu
1999|Marmara (Gölcük) depremi
1999|Avronun hesap birimi olarak kullanılmaya başlanması
2001|11 Eylül saldırıları
2002|Avro banknot ve madenî paralarının tedavüle girmesi
2003|İnsan Genom Projesi’nin tamamlanması
2004|Facebook’un kuruluşu
2005|Türkiye–AB katılım müzakerelerinin başlaması
2005|YTL’ye geçiş (altı sıfırın atılması)
2007|İlk iPhone’un tanıtılması
2008|Küresel finans krizi
2012|Higgs bozonunun keşfinin duyurulması
2013|Marmaray’ın açılması
2015|Kütle çekim dalgalarının ilk gözlenmesi
2016|Yavuz Sultan Selim Köprüsü’nün açılması
2019|Kara deliğin ilk görüntüsünün yayımlanması
2020|COVID-19’un pandemi ilan edilmesi
2021|James Webb Uzay Teleskobu’nun fırlatılması
2022|1915 Çanakkale Köprüsü’nün açılması
2023|Kahramanmaraş merkezli depremler
2024|Alper Gezeravcı’nın uzaya gidişi
-3100|Yukarı ve Aşağı Mısır’ın birleşmesi (yaklaşık)
-2334|Akad Kralı Sargon’un imparatorluğunu kurması (yaklaşık)
-1650|Hitit Devleti’nin kuruluşu (yaklaşık)
-612|Asur başkenti Ninova’nın düşmesi
-586|Babil’in Kudüs’ü yıkması
-585|Thales’in öngördüğü Güneş tutulması
-550|Pers (Ahameniş) İmparatorluğu’nun kuruluşu (yaklaşık)
-546|Perslerin Lidya Devleti’ne son vermesi
-539|Kiros’un Babil’i alması
-508|Atina’da Kleisthenes reformları (demokrasinin temeli)
-431|Peloponez Savaşları’nın başlaması
-404|Peloponez Savaşları’nın sona ermesi
-333|İssos Savaşı
-331|Gaugamela Savaşı
-264|I. Pön Savaşı’nın başlaması
-216|Cannae Savaşı
-202|Zama Savaşı
-73|Spartaküs isyanının başlaması
-49|Caesar’ın Rubicon’u geçmesi
-31|Actium Deniz Savaşı
-30|Mısır’ın Roma’ya bağlanması (Kleopatra’nın ölümü)
9|Teutoburg Ormanı Savaşı
64|Roma’nın büyük yangını
70|Romalıların Kudüs’teki tapınağı yıkması
80|Kolezyum’un açılması
117|Roma İmparatorluğu’nun en geniş sınırlarına ulaşması (Trajan)
122|Hadrian Duvarı’nın yapımının başlaması
220|Çin’de Han hanedanının sona ermesi
325|İznik Konsili
380|Hristiyanlığın Roma’nın resmî dini olması
410|Vizigotların Roma’yı yağmalaması
451|Katalaunum (Châlons) Savaşı
453|Attila’nın ölümü
527|Justinianus’un Bizans tahtına çıkması
532|Nika Ayaklanması
618|Çin’de Tang hanedanının kuruluşu
624|Bedir Savaşı
625|Uhud Savaşı
627|Hendek Savaşı
630|Mekke’nin fethi
636|Yermük Savaşı
642|Nihavend Savaşı
657|Sıffin Savaşı
680|Kerbela Olayı
682|II. Göktürk (Kutluk) Devleti’nin kuruluşu
756|Endülüs Emevi Devleti’nin kuruluşu
762|Bağdat’ın kuruluşu
793|Vikinglerin Lindisfarne baskını
843|Verdun Antlaşması
868|Tolunoğulları Devleti’nin kuruluşu
909|Fatımi Devleti’nin kuruluşu
935|İhşidiler Devleti’nin kuruluşu
988|Kiev Knezliği’nin Hristiyanlığı kabulü
1048|Pasinler Savaşı
1055|Tuğrul Bey’in Bağdat’a girmesi
1069|Kutadgu Bilig’in yazılması
1092|Nizamülmülk’ün öldürülmesi
1141|Katvan Savaşı
1147|II. Haçlı Seferi’nin başlaması
1157|Büyük Selçuklu Devleti’nin sona ermesi (Sultan Sencer’in ölümü)
1171|Eyyubi Devleti’nin kuruluşu
1189|III. Haçlı Seferi’nin başlaması
1204|IV. Haçlı Seferi’nde İstanbul’un Latinlerce işgali
1220|I. Alâeddin Keykubad’ın tahta çıkması
1227|Cengiz Han’ın ölümü
1230|Yassıçemen Savaşı
1240|Babailer İsyanı
1250|Memlük Devleti’nin kuruluşu
1260|Ayn Calut Savaşı
1261|Bizans’ın İstanbul’u Latinlerden geri alması
1271|Marco Polo’nun Asya yolculuğuna çıkması
1277|Karamanoğlu Mehmet Bey’in Türkçe fermanı
1279|Kubilay Han’ın bütün Çin’e hâkim olması (Yuan hanedanı)
1291|Akka’nın düşmesi (Haçlı devletlerinin sonu)
1302|Koyunhisar (Bafeus) Savaşı
1308|Anadolu Selçuklu Devleti’nin sona ermesi
1331|İznik’in fethi
1364|Sırpsındığı Savaşı
1368|Çin’de Ming hanedanının kuruluşu
1370|Timur Devleti’nin kuruluşu
1371|Çirmen Savaşı
1405|Timur’un ölümü
1416|Şeyh Bedreddin İsyanı
1429|Jeanne d’Arc’ın Orléans kuşatmasını kaldırması
1431|Jeanne d’Arc’ın idam edilmesi
1451|II. Mehmed’in ikinci kez tahta çıkması
1455|Güller Savaşı’nın başlaması
1461|Trabzon Rum İmparatorluğu’nun sona ermesi
1475|Kırım’ın Osmanlı himayesine girmesi
1478|Topkapı Sarayı’nın tamamlanması
1480|Otranto’nun fethi
1481|Fatih Sultan Mehmed’in vefatı
1492|Gırnata’nın düşmesi (Endülüs’ün sonu)
1494|Tordesillas Antlaşması
1501|Safevi Devleti’nin kuruluşu
1513|Piri Reis’in ilk dünya haritası
1517|Luther’in 95 tezi (Reform’un başlaması)
1520|Kanuni Sultan Süleyman’ın tahta çıkması
1521|Aztek başkenti Tenochtitlan’ın düşmesi
1522|Macellan seferinin dünya turunu tamamlaması
1526|Babür İmparatorluğu’nun kuruluşu (Panipat Savaşı)
1533|İnka hükümdarı Atahualpa’nın idamı
1534|İngiltere’de Anglikan Kilisesi’nin kurulması
1541|Budin’in Osmanlı’ya bağlanması
1545|Trento Konsili’nin toplanması
1551|Trablusgarp’ın fethi
1555|Amasya Antlaşması
1555|Augsburg Barışı
1565|Malta Kuşatması
1566|Zigetvar Seferi ve Kanuni’nin vefatı
1569|Astrahan Seferi (Don–Volga kanal girişimi)
1574|Tunus’un fethi
1578|Vadi’s-Seyl (Kasrü’l-Kebir) Savaşı
1579|Sokullu Mehmed Paşa’nın öldürülmesi
1590|Ferhat Paşa Antlaşması
1596|Haçova Savaşı
1598|Nantes Fermanı
1603|Japonya’da Tokugawa şogunluğunun kuruluşu
1605|Cervantes’in Don Kişot’un ilk cildini yayımlaması
1607|Jamestown’ın kuruluşu
1611|Nasuh Paşa Antlaşması
1618|Otuz Yıl Savaşları’nın başlaması
1621|Hotin Seferi
1628|Harvey’nin kan dolaşımını açıklaması
1633|Galileo’nun Engizisyon’da yargılanması
1637|Descartes’ın Yöntem Üzerine Konuşma’yı yayımlaması
1642|İngiliz İç Savaşı’nın başlaması
1644|Çin’de Qing hanedanının Pekin’e hâkim olması
1649|İngiltere Kralı I. Charles’ın idamı
1656|Köprülü Mehmed Paşa’nın sadrazam olması
1664|Vasvar Antlaşması
1666|Londra’nın büyük yangını
1672|Bucaş Antlaşması
1676|Rømer’in ışık hızının sonlu olduğunu göstermesi
1681|Bahçesaray Antlaşması
1688|İngiltere’de Şanlı Devrim
1689|İngiltere’de Haklar Bildirgesi
1700|Büyük Kuzey Savaşı’nın başlaması
1703|Edirne Vakası
1703|St. Petersburg’un kuruluşu
1707|Büyük Britanya Krallığı’nın kurulması
1709|Poltava Savaşı
1712|Newcomen’in buhar makinesi
1740|Avusturya Veraset Savaşları’nın başlaması
1748|Montesquieu’nün Kanunların Ruhu’nu yayımlaması
1751|Diderot’nun Ansiklopedi’sinin ilk cildi
1755|Lizbon depremi
1762|Rousseau’nun Toplum Sözleşmesi’ni yayımlaması
1768|James Cook’un ilk Pasifik seferine çıkması
1770|Çeşme Deniz Baskını
1773|Mühendishane-i Bahrî-i Hümâyun’un kuruluşu
1773|Boston Çay Partisi
1775|Amerikan Bağımsızlık Savaşı’nın başlaması
1781|Kant’ın Saf Aklın Eleştirisi’ni yayımlaması
1781|Uranüs’ün keşfi
1783|Montgolfier kardeşlerin sıcak hava balonu
1787|ABD Anayasası’nın yazılması
1791|Ziştovi Antlaşması
1793|Nizam-ı Cedid Ocağı’nın kurulması
1793|Fransa Kralı XVI. Louis’nin idamı
1796|Jenner’ın çiçek aşısı
1799|Rosetta Taşı’nın bulunması
1799|Napolyon’un iktidarı ele geçirmesi
1803|Louisiana’nın ABD’ye satılması
1805|Trafalgar Deniz Savaşı
1805|Kavalalı Mehmed Ali Paşa’nın Mısır valisi olması
1807|Kabakçı Mustafa İsyanı
1807|Fulton’ın buharlı gemisi
1812|Napolyon’un Rusya seferi
1814|Viyana Kongresi’nin toplanması
1823|Monroe Doktrini
1825|İlk yolcu demiryolu hattı (Stockton–Darlington)
1827|Navarin Baskını
1827|Tıphane-i Âmire’nin açılması
1830|Fransa’da Temmuz Devrimi
1831|Takvim-i Vekayi’nin yayımlanması
1831|Faraday’ın elektromanyetik indüksiyonu keşfi
1833|Kütahya Antlaşması
1837|Kraliçe Victoria’nın tahta çıkması
1839|Nizip Savaşı
1839|Dagerreyotipin (fotoğrafın) duyurulması
1840|İlk posta pulu (Penny Black)
1841|Londra Boğazlar Sözleşmesi
1842|Nanking Antlaşması (I. Afyon Savaşı’nın sonu)
1848|Komünist Manifesto’nun yayımlanması
1851|Londra’da ilk dünya fuarı
1857|Hindistan’da Sipahi Ayaklanması
1860|Tercüman-ı Ahvâl gazetesinin çıkması
1861|İtalya Krallığı’nın ilanı
1861|Rusya’da serfliğin kaldırılması
1863|Gettysburg Savaşı
1863|Londra metrosunun açılması
1864|İlk Cenevre Sözleşmesi
1865|Abraham Lincoln suikastı
1866|Mendel’in kalıtım çalışmasını yayımlaması
1867|Nobel’in dinamit patenti
1867|ABD’nin Alaska’yı satın alması
1868|Japonya’da Meiji Restorasyonu
1868|Galatasaray Sultanisi’nin açılması
1870|Sedan Savaşı
1873|Vatan Yahut Silistre’nin sahnelenmesi
1875|İstanbul’da Tünel’in açılması
1878|Ayastefanos Antlaşması
1878|Kıbrıs’ın yönetiminin İngiltere’ye bırakılması
1881|Tunus’un Fransa tarafından işgali
1882|Mısır’ın İngiltere tarafından işgali
1884|Berlin Konferansı (Afrika’nın paylaşılması)
1885|Pasteur’ün kuduz aşısı
1887|Hertz’in elektromanyetik dalgaları göstermesi
1889|Eyfel Kulesi’nin açılması
1893|Yeni Zelanda’da kadınlara oy hakkı
1894|I. Çin–Japon Savaşı’nın başlaması
1895|Lumière kardeşlerin ilk film gösterimi
1896|Radyoaktivitenin keşfi (Becquerel)
1897|Elektronun keşfi (Thomson)
1898|İspanyol–Amerikan Savaşı
1898|Curie’lerin radyumu keşfi
1899|Boer Savaşı’nın başlaması
1900|Planck’ın kuantum varsayımı
1900|Boxer Ayaklanması
1901|İlk Nobel ödüllerinin verilmesi
1901|Marconi’nin Atlantik ötesi radyo sinyali
1904|Rus–Japon Savaşı’nın başlaması
1905|Rusya’da 1905 Devrimi
1906|İran’da meşrutiyetin ilanı
1907|Üçlü İtilaf’ın tamamlanması
1908|Ford Model T’nin üretilmesi
1908|Hicaz Demiryolu’nun Medine’ye ulaşması
1911|Amundsen’in Güney Kutbu’na ulaşması
1911|Çin’de Xinhai Devrimi
1913|Bâbıâli Baskını
1913|Bohr atom modeli
1914|Panama Kanalı’nın açılması
1914|Sarıkamış Harekâtı’nın başlaması
1915|Einstein’ın genel görelilik kuramı
1916|Kûtulamâre Zaferi
1916|Sykes–Picot Anlaşması
1916|Verdun Savaşı
1917|ABD’nin I. Dünya Savaşı’na girmesi
1917|Balfour Deklarasyonu
1918|Brest-Litovsk Antlaşması
1918|İspanyol gribi salgını
1919|İzmir’in işgali
1919|Amasya Genelgesi
1920|Gümrü Antlaşması
1921|I. İnönü Muharebesi
1921|Teşkilât-ı Esasiye Kanunu (1921 Anayasası)
1921|Moskova Antlaşması
1921|Kars Antlaşması
1922|Mudanya Ateşkes Antlaşması
1922|SSCB’nin kuruluşu
1922|Tutankamon’un mezarının bulunması
1922|Mussolini’nin Roma’ya yürüyüşü
1923|İzmir İktisat Kongresi
1923|Ankara’nın başkent olması
1924|Tevhid-i Tedrisat Kanunu
1925|Şeyh Said İsyanı
1925|Tekke ve zaviyelerin kapatılması
1926|Musul meselesinin çözülmesi (Ankara Antlaşması)
1926|Baird’in televizyonu ilk kez göstermesi
1927|Nutuk’un okunması
1927|Cumhuriyet’in ilk nüfus sayımı
1927|Lindbergh’in Atlantik’i tek başına uçarak geçmesi
1930|Serbest Cumhuriyet Fırkası’nın kuruluşu
1930|Kadınlara belediye seçimlerinde oy hakkı
1930|İlk FIFA Dünya Kupası
1930|Plüton’un keşfi
1932|Nötronun keşfi
1933|Hitler’in şansölye olması
1935|Ayasofya’nın müze olarak açılması
1936|İspanya İç Savaşı’nın başlaması
1938|Münih Antlaşması
1938|Nükleer fisyonun keşfi
1940|Fransa’nın Almanya’ya teslim olması
1941|Almanya’nın SSCB’ye saldırması (Barbarossa)
1942|Stalingrad Savaşı’nın başlaması
1942|Varlık Vergisi Kanunu
1945|Yalta Konferansı
1945|Almanya’nın teslim olması
1946|ENIAC’ın tanıtılması
1947|Truman Doktrini
1948|İsrail’in kuruluşu
1948|Berlin Ablukası’nın başlaması
1948|Gandhi suikastı
1949|Avrupa Konseyi’nin kuruluşu
1951|Avrupa Kömür ve Çelik Topluluğu’nun kuruluşu
1953|Everest’e ilk tırmanış
1953|Stalin’in ölümü
1953|Atatürk’ün naaşının Anıtkabir’e nakli
1954|Cezayir Bağımsızlık Savaşı’nın başlaması
1955|Bağdat Paktı
1955|Salk’ın çocuk felci aşısı
1955|Bandung Konferansı
1956|Süveyş Krizi
1956|Macar Ayaklanması
1958|NASA’nın kuruluşu
1959|Küba Devrimi
1960|27 Mayıs Darbesi
1960|Kıbrıs Cumhuriyeti’nin kuruluşu
1960|OPEC’in kuruluşu
1960|İlk lazerin çalıştırılması
1961|1961 Anayasası
1963|Martin Luther King’in “Bir hayalim var” konuşması
1964|TRT’nin kuruluşu
1966|Çin’de Kültür Devrimi’nin başlaması
1967|Altı Gün Savaşı
1967|İlk insan kalbi nakli
1968|Prag Baharı
1968|TRT’nin ilk televizyon yayını
1969|ARPANET’in ilk bağlantısı
1971|12 Mart Muhtırası
1971|İlk mikroişlemci (Intel 4004)
1973|Petrol krizi
1974|Portekiz’de Karanfil Devrimi
1974|Nixon’ın istifası (Watergate)
1975|Microsoft’un kuruluşu
1975|Helsinki Nihai Senedi
1976|Apple’ın kuruluşu
1978|İlk tüp bebeğin doğumu
1978|Camp David Anlaşmaları
1979|İran İslam Devrimi
1979|SSCB’nin Afganistan’a girmesi
1980|12 Eylül Darbesi
1980|İran–Irak Savaşı’nın başlaması
1980|Çiçek hastalığının yok edildiğinin ilanı
1982|1982 Anayasası
1982|Falkland Savaşı
1983|ARPANET’in TCP/IP’ye geçişi
1984|Türkiye’de renkli televizyon yayınına geçiş
1985|Ozon tabakasındaki deliğin duyurulması
1985|Gorbaçov’un iktidara gelmesi
1986|Challenger uzay mekiği kazası
1990|Almanya’nın yeniden birleşmesi
1990|Irak’ın Kuveyt’i işgali
1990|Nelson Mandela’nın serbest bırakılması
1991|Körfez Savaşı
1992|Bosna Savaşı’nın başlaması
1992|Rio Dünya Zirvesi
1994|Nelson Mandela’nın devlet başkanı seçilmesi
1994|Manş Tüneli’nin açılması
1994|Türksat 1B’nin fırlatılması
1995|Dayton Antlaşması
1995|Dünya Ticaret Örgütü’nün kuruluşu
1997|Kyoto Protokolü
1997|Hong Kong’un Çin’e devri
1997|Deep Blue’nun Kasparov’u yenmesi
1998|Uluslararası Uzay İstasyonu’nun ilk modülü
1999|Helsinki Zirvesi (Türkiye’nin AB adaylığı)
2001|Wikipedia’nın kuruluşu
2003|Irak Savaşı’nın başlaması
2004|Hint Okyanusu tsunamisi
2004|AB’nin on ülkeyle genişlemesi
2005|YouTube’un kuruluşu
2006|Plüton’un cüce gezegen sayılması
2006|Orhan Pamuk’un Nobel Edebiyat Ödülü
2009|Bitcoin’in ilk bloğu
2010|Arap Baharı’nın başlaması
2011|Fukuşima nükleer kazası
2011|Van depremi
2012|Curiosity’nin Mars’a inişi
2014|Philae’nin bir kuyruklu yıldıza inişi
2015|Paris İklim Anlaşması
2015|Aziz Sancar’ın Nobel Kimya Ödülü
2015|New Horizons’ın Plüton’a ulaşması
2016|Brexit referandumu
2016|AlphaGo’nun Lee Sedol’u yenmesi
2016|Osmangazi Köprüsü’nün açılması
2018|İstanbul Havalimanı’nın açılması
2020|Birleşik Krallık’ın AB’den ayrılması
2022|ChatGPT’nin yayımlanması
2023|Cumhuriyet’in 100. yılı
-2600|Ur Kraliyet Mezarlığı’nın kullanılması (yaklaşık)
-2500|Harappa ve Mohenjo-daro kentlerinin gelişmesi (yaklaşık)
-2000|Asur ticaret kolonilerinin Anadolu’da kurulması (Kültepe, yaklaşık)
-1800|Kültepe tabletlerinin yazılması (yaklaşık)
-1600|Miken uygarlığının yükselişi (yaklaşık)
-1550|Mısır’da Yeni Krallık’ın başlaması
-1500|Rigveda’nın derlenmeye başlaması (yaklaşık)
-1450|Minos uygarlığının çöküşü (yaklaşık)
-1353|Akhenaton’un tahta çıkması (yaklaşık)
-1323|Tutankamon’un ölümü (yaklaşık)
-1200|Tunç Çağı çöküşü ve Hitit İmparatorluğu’nun yıkılışı (yaklaşık)
-1046|Çin’de Zhou hanedanının kuruluşu
-1000|Davud’un Kudüs’ü başkent yapması (yaklaşık)
-900|Urartu Krallığı’nın kuruluşu (yaklaşık)
-814|Kartaca’nın kuruluşu (geleneksel tarih)
-750|Homeros destanlarının yazıya geçmesi (yaklaşık)
-700|Frigya’nın Kimmerlerce yıkılması (yaklaşık)
-594|Solon’un Atina’da reformları
-525|Perslerin Mısır’ı fethi
-520|Darius’un Kral Yolu’nu yaptırması (yaklaşık)
-500|İyon İsyanı’nın başlaması (yaklaşık)
-461|Perikles döneminin başlaması
-458|Aiskhylos’un Oresteia’yı sahnelemesi
-438|Parthenon’un tamamlanması
-430|Herodot’un Tarih’ini yayması (yaklaşık)
-405|Aigospotamoi Deniz Savaşı
-401|Onbinlerin Dönüşü (Ksenophon)
-371|Leuktra Savaşı
-359|II. Filip’in Makedonya tahtına çıkması
-338|Khaironeia Savaşı
-335|Aristoteles’in Lykeion’u kurması
-332|İskenderiye’nin kuruluşu
-326|Hydaspes Savaşı
-305|Mısır’da Ptolemaios hanedanının kuruluşu
-300|Öklid’in Elemanlar’ı yazması (yaklaşık)
-280|İskenderiye Feneri’nin tamamlanması (yaklaşık)
-262|Ashoka’nın Kalinga Savaşı (yaklaşık)
-250|Arşimet’in kaldırma kuvveti ilkesi (yaklaşık)
-241|I. Pön Savaşı’nın sona ermesi
-240|Eratosthenes’in Dünya’nın çevresini hesaplaması (yaklaşık)
-206|Çin’de Han hanedanının kuruluşu
-190|Magnesia Savaşı
-168|Pydna Savaşı
-133|Bergama Krallığı’nın Roma’ya bırakılması
-133|Tiberius Gracchus’un reformları
-88|Pontus Kralı Mithridates’in Roma’ya karşı savaşı
-63|Pompeius’un Kudüs’ü alması
-60|I. Triumvirlik
-55|Caesar’ın Britanya seferi
-52|Alesia Kuşatması
-48|Pharsalus Savaşı
-47|Zela Savaşı (“Geldim, gördüm, yendim”)
-46|Jülyen takviminin kabulü
-4|Hz. İsa’nın doğumu (yaklaşık)
14|Augustus’un ölümü
30|Hz. İsa’nın çarmıha gerilmesi (yaklaşık)
43|Roma’nın Britanya’yı fethe başlaması
60|Boudica isyanı
66|Büyük Yahudi İsyanı’nın başlaması
113|Trajan Sütunu’nun dikilmesi
132|Bar Kohba isyanı
161|Marcus Aurelius’un imparator olması
166|Antoninus vebası (yaklaşık)
212|Caracalla fermanı (Roma vatandaşlığı)
224|Sasani İmparatorluğu’nun kuruluşu
235|Roma’da Üçüncü Yüzyıl Krizi’nin başlaması
260|Edessa (Urfa) Savaşı’nda Valerianus’un esir düşmesi
284|Diocletianus’un imparator olması
301|Ermenistan’ın Hristiyanlığı resmî din yapması
320|Hindistan’da Gupta İmparatorluğu’nun kuruluşu
337|Büyük Konstantin’in ölümü
378|Edirne (Adrianopolis) Savaşı
381|I. İstanbul Konsili
392|Antik Olimpiyat Oyunları’nın yasaklanması (yaklaşık)
415|Hypatia’nın öldürülmesi
431|Efes Konsili
455|Vandalların Roma’yı yağmalaması
481|Clovis’in Frank kralı olması
493|Theoderik’in İtalya’ya hâkim olması
529|Justinianus Kanunnamesi’nin ilk baskısı
541|Justinianus vebası
558|Avarların Avrupa’ya gelişi (yaklaşık)
568|Lombardların İtalya’ya girişi
581|Çin’de Sui hanedanının kuruluşu
590|I. Gregorius’un papa olması
603|Göktürk Devleti’nin Doğu ve Batı olarak ikiye ayrılması
607|Japonya’da Hōryū-ji tapınağının tamamlanması (yaklaşık)
614|Sasanilerin Kudüs’ü alması
626|Avar ve Sasanilerin İstanbul’u kuşatması
628|Hudeybiye Antlaşması
629|Mute Savaşı
637|Kadisiye Savaşı
638|Müslümanların Kudüs’ü alması
640|Mısır’ın Müslümanlarca fethi (yaklaşık)
651|Sasani İmparatorluğu’nun sona ermesi
656|Cemel Savaşı
674|Emevilerin ilk İstanbul kuşatması
698|Kartaca’nın Emevilerce alınması
717|Emevilerin ikinci İstanbul kuşatması
726|Bizans’ta ikonoklazmanın başlaması
755|Çin’de An Lushan isyanı
768|Şarlman’ın Frank kralı olması
786|Harun Reşid’in halife olması
794|Japonya’da Heian döneminin başlaması (Kyoto başkent)
813|Me’mun’un halife olması
830|Bağdat’ta Beytü’l-Hikme’nin gelişmesi (yaklaşık)
862|Rurik’in Novgorod’da hüküm sürmesi (geleneksel tarih)
871|Büyük Alfred’in Wessex kralı olması
895|Macarların Karpat havzasına yerleşmesi (yaklaşık)
907|Çin’de Tang hanedanının sona ermesi
910|Cluny Manastırı’nın kuruluşu
920|Karahanlıların İslamiyet’i kabulü (yaklaşık)
929|Kurtuba Halifeliği’nin ilanı
932|Büveyhoğulları’nın kuruluşu (yaklaşık)
960|Çin’de Song hanedanının kuruluşu
969|Fatımilerin Kahire’yi kurması
976|II. Basileios’un Bizans tahtına çıkması
1000|Vikinglerin Kuzey Amerika’ya ulaşması (Leif Erikson, yaklaşık)
1010|Firdevsi’nin Şehname’yi tamamlaması
1020|İbn Sina’nın Tıp Kanunu’nu tamamlaması (yaklaşık)
1025|Gazneli Mahmud’un Somnath seferi
1063|Alp Arslan’ın sultan olması
1085|Toledo’nun Kastilya’ya geçmesi
1086|İngiltere’de Domesday Kitabı
1088|Bologna Üniversitesi’nin kuruluşu
1097|Haçlıların İznik’i alması
1098|Haçlıların Antakya’yı alması
1116|Akşehir (Philomelion) Savaşı
1127|Zengi Atabeyliği’nin kuruluşu
1144|Zengilerin Urfa’yı alması
1150|Paris Üniversitesi’nin şekillenmesi (yaklaşık)
1163|Notre-Dame Katedrali’nin yapımının başlaması
1170|Thomas Becket’in öldürülmesi
1185|Japonya’da Kamakura şogunluğunun kurulması (yaklaşık)
1192|III. Haçlı Seferi’nin Ramle Barışı ile sona ermesi
1194|Harzemşahların Büyük Selçuklu bakiyesine son vermesi
1202|Fibonacci’nin Liber Abaci’yi yayımlaması
1209|Cambridge Üniversitesi’nin kuruluşu
1211|Delhi Sultanlığı’nda İltutmuş’un tahta çıkması
1219|Moğolların Harzemşahlara saldırısı
1221|Moğolların Merv ve Nişabur’u yıkması
1236|Batu Han’ın Avrupa seferinin başlaması
1237|Anadolu Selçuklu Sultanı I. Alâeddin Keykubad’ın ölümü
1241|Legnica ve Mohi savaşları
1242|Altın Orda Devleti’nin kuruluşu (yaklaşık)
1248|Granada’da Elhamra Sarayı’nın yapımının başlaması (yaklaşık)
1256|İlhanlı Devleti’nin kuruluşu
1274|Moğolların Japonya’yı ilk istila girişimi
1281|Osman Bey’in uç beyi olması (geleneksel tarih)
1295|Gazan Han’ın İslamiyet’i kabulü
1307|Dante’nin İlahi Komedya’ya başlaması (yaklaşık)
1309|Avignon Papalığı’nın başlaması
1320|Yunus Emre’nin ölümü (yaklaşık)
1324|Mansa Musa’nın hac yolculuğu
1335|İlhanlı Devleti’nin dağılmaya başlaması
1346|Kresi Savaşı
1348|Kara Veba’nın İngiltere’ye ulaşması
1354|Gelibolu’nun Osmanlılarca alınması
1358|Fransa’da Jacquerie köylü ayaklanması
1361|Edirne’nin fethi (yaklaşık)
1363|Edirne’nin başkent olması (yaklaşık)
1381|İngiltere’de Köylü Ayaklanması
1385|Aljubarrota Savaşı
1386|Litvanya–Polonya birliği
1388|Ploşnik Savaşı
1390|Yıldırım Bayezid’in İstanbul’u ilk kuşatması
1394|Bayezid’in İstanbul’u uzun süreli kuşatması
1397|Kalmar Birliği
1405|Zheng He’nin ilk deniz seferi
1410|Grunwald Savaşı
1415|Agincourt Savaşı
1415|Portekiz’in Septe’yi alması
1420|Pekin’de Yasak Şehir’in tamamlanması
1421|II. Murad’ın tahta çıkması
1422|II. Murad’ın İstanbul kuşatması
1430|Selanik’in Osmanlılarca alınması
1434|Floransa’da Medici yönetiminin başlaması
1438|İnka İmparatorluğu’nun genişlemesi (Pachacuti)
1443|Zlatica (İzladi) Savaşı
1444|Edirne-Segedin Antlaşması
1449|Uluğ Bey’in ölümü
1452|Rumeli Hisarı’nın yapılması
1456|Belgrad Kuşatması
1459|Sırbistan’ın Osmanlı’ya bağlanması
1462|Eflak Seferi (Kazıklı Voyvoda)
1463|Bosna’nın fethi
1463|Osmanlı–Venedik Savaşı’nın başlaması
1470|Fatih Külliyesi’nin tamamlanması
1469|Kastilya ve Aragon’un evlilikle birleşmesi
1476|Moldova seferi (Akdere Savaşı)
1477|Nancy Savaşı
1479|İstanbul Antlaşması (Osmanlı–Venedik)
1485|İngiltere’de Tudor hanedanının başlaması
1489|Kıbrıs’ın Venedik’e geçmesi
1492|Yahudilerin İspanya’dan sürülmesi ve Osmanlı’ya yerleşmesi
1497|John Cabot’un Kuzey Amerika’ya ulaşması
1499|İnebahtı’nın alınması (Osmanlı–Venedik Savaşı)
1500|Cabral’ın Brezilya’ya ulaşması
1502|Leonardo da Vinci’nin Haliç köprüsü taslağı
1504|Michelangelo’nun Davut heykelini tamamlaması
1506|Aziz Petrus Bazilikası’nın yapımının başlaması
1507|Amerika adının ilk kez bir haritada kullanılması (Waldseemüller)
1508|Cambrai Birliği
1510|Portekiz’in Goa’yı alması
1511|Şahkulu İsyanı
1512|Yavuz Sultan Selim’in tahta çıkması
1513|Balboa’nın Pasifik Okyanusu’nu görmesi
1513|Machiavelli’nin Prens’i yazması
1515|Turnadağ Savaşı
1516|Thomas More’un Ütopya’sı
1519|Cortés’in Meksika’ya çıkması
1521|Worms Meclisi
1524|Verrazzano’nun New York koyuna ulaşması
1525|Pavia Savaşı
1527|Roma’nın yağmalanması
1527|Kalender Çelebi İsyanı
1532|Alman Seferi (Güns Kuşatması)
1533|Pizarro’nun Cuzco’yu alması
1534|Irakeyn Seferi
1534|Barbaros Hayreddin’in kaptan-ı derya olması
1535|Kapitülasyonların Fransa’ya verilmesi (geleneksel tarih)
1536|Pargalı İbrahim Paşa’nın idamı
1537|Korfu Kuşatması
1540|Cizvit tarikatının resmen tanınması
1547|Korkunç İvan’ın çar olması
1548|Kanuni’nin ikinci İran seferi
1549|Francis Xavier’in Japonya’ya ulaşması
1552|Kazan Hanlığı’nın Rusya’ya bağlanması
1553|Şehzade Mustafa’nın idamı
1556|Ekber Şah’ın Babür tahtına çıkması
1558|I. Elizabeth’in İngiltere kraliçesi olması
1559|Cateau-Cambrésis Antlaşması
1560|Cerbe Deniz Savaşı
1562|Fransa’da Din Savaşları’nın başlaması
1564|Shakespeare’in doğumu
1566|Hollanda isyanının başlaması (yaklaşık)
1568|Edirne Antlaşması (Osmanlı–Habsburg)
1571|Moskova’nın Kırım Hanı tarafından yakılması
1572|Saint Bartholomew Katliamı
1578|Osmanlı–Safevi Savaşı’nın başlaması (Çıldır Savaşı)
1577|İstanbul Rasathanesi’nin kurulması (Takiyüddin)
1580|Takiyüddin Rasathanesi’nin yıkılması
1580|İspanya ile Portekiz’in birleşmesi
1581|Hollanda’nın bağımsızlık ilanı
1582|Gregoryen takviminin kabulü
1587|Japonya’da Hideyoshi’nin Hristiyanlığı yasaklaması
1590|Hideyoshi’nin Japonya’yı birleştirmesi
1592|Japonların Kore’yi istilası (İmjin Savaşı)
1593|Uzun Savaş’ın başlaması (Osmanlı–Habsburg)
1595|Cığalazade Sinan Paşa’nın Eflak seferi
1596|Eğri’nin fethi
1600|Sekigahara Savaşı
1600|Giordano Bruno’nun yakılması
1601|Celali İsyanları’nın yayılması (yaklaşık)
1602|Hollanda Doğu Hindistan Şirketi’nin kuruluşu
1603|I. Ahmed’in tahta çıkması
1608|Quebec’in kuruluşu
1611|King James İncil’inin yayımlanması
1614|Napier’in logaritmayı tanıtması
1617|I. Mustafa’nın tahta çıkması (ekberiyet sisteminin başlangıcı)
1623|IV. Murad’ın tahta çıkması
1625|Hollandalıların Yeni Amsterdam’ı kurması (yaklaşık)
1628|Abaza Mehmed Paşa İsyanı’nın bastırılması
1631|Koçi Bey Risalesi (yaklaşık)
1632|Galileo’nun İki Büyük Dünya Sistemi Üzerine Diyalog’u
1635|Revan Seferi
1636|Harvard Üniversitesi’nin kuruluşu
1640|Sultan İbrahim’in tahta çıkması
1643|Torricelli’nin barometreyi icadı
1645|Girit Savaşı’nın başlaması
1648|IV. Mehmed’in tahta çıkması
1651|Hobbes’un Leviathan’ı yayımlaması
1652|Cape Town’ın kuruluşu
1654|Pascal ve Fermat’ın olasılık yazışmaları
1660|Londra’da Royal Society’nin kuruluşu
1661|XIV. Louis’nin kişisel yönetiminin başlaması
1663|Uyvar’ın fethi (Ujvár)
1664|Saint Gotthard (Mogersdorf) Savaşı
1665|Hooke’un hücreyi tanımlaması
1667|Milton’ın Kaybolmuş Cennet’i
1673|Hotin Savaşı
1676|Merzifonlu Kara Mustafa Paşa’nın sadrazam olması
1678|Çehrin Seferi
1682|Versay Sarayı’nın saray merkezi olması
1684|Kutsal İttifak’ın kurulması
1686|Budin’in kaybedilmesi
1690|Locke’un Hükümet Üzerine İki İnceleme’si
1697|Zenta Savaşı
1701|İspanya Veraset Savaşı’nın başlaması
1713|Edirne Antlaşması (Osmanlı–Rus)
1714|Fahrenheit’in cıvalı termometresi
1715|Mora’nın geri alınması
1721|Yirmisekiz Mehmed Çelebi’nin Paris elçiliği
1722|Afganların İsfahan’ı alması
1724|İstanbul Antlaşması (Osmanlı–Rus, İran’ın paylaşımı)
1729|Müteferrika matbaasında ilk kitabın basılması
1735|Linnaeus’un Systema Naturae’si
1736|Nadir Şah’ın İran tahtına çıkması
1736|Osmanlı–Rus–Avusturya Savaşı’nın başlaması
1740|Prusya’da II. Friedrich’in tahta çıkması
1746|Kerden Antlaşması
1747|Afganistan’da Dürrani Devleti’nin kuruluşu
1752|Franklin’in uçurtma deneyi
1757|Plassey Savaşı
1759|Quebec Savaşı
1763|Paris Antlaşması (Yedi Yıl Savaşları’nın sonu)
1764|Hargreaves’in eğirme makinesi (yaklaşık)
1768|Osmanlı–Rus Savaşı’nın başlaması (1768–1774)
1771|Kırım’ın Rus işgaline uğraması
1776|Adam Smith’in Ulusların Zenginliği
1778|Cook’un Hawaii’ye ulaşması
1784|Watt’ın çift etkili buhar makinesi
1787|Osmanlı–Rus Savaşı’nın başlaması (1787–1792)
1788|Avustralya’da ilk İngiliz yerleşimi
1789|III. Selim’in tahta çıkması
1789|Bastille’in alınması
1790|Rus kuvvetlerinin İsmail Kalesi’ni alması
1791|Fransa’da ilk yazılı anayasa
1792|Fransa’da cumhuriyetin ilanı
1793|Londra’da ilk daimî Osmanlı elçiliği
1795|Lehistan’ın üçüncü kez paylaşılması
1798|Malthus’un Nüfus İlkesi Üzerine Deneme’si
1801|Fransızların Mısır’dan çekilmesi
1802|Amiens Barışı
1803|Vahhabilerin Mekke’yi alması
1804|Sırp İsyanı’nın başlaması
1804|Haiti’nin bağımsızlığı
1806|Kutsal Roma-Germen İmparatorluğu’nun sona ermesi
1806|Osmanlı–Rus Savaşı’nın başlaması (1806–1812)
1808|II. Mahmud’un tahta çıkması
1810|Latin Amerika bağımsızlık hareketlerinin başlaması
1811|Kavalalı’nın Kölemen beylerini ortadan kaldırması
1813|Leipzig Savaşı
1816|Laennec’in stetoskopu icadı
1817|Sırbistan’ın özerkliğe kavuşması (yaklaşık)
1818|Mary Shelley’nin Frankenstein’ı
1819|Singapur’un İngilizlerce kurulması
1820|Antarktika’nın görülmesi
1821|Meksika’nın bağımsızlığı
1822|Brezilya’nın bağımsızlığı
1822|Champollion’un hiyeroglifleri çözmesi
1824|Beethoven’ın 9. Senfonisi’nin ilk icrası
1826|İlk fotoğraf (Niépce)
1828|Osmanlı–Rus Savaşı’nın başlaması (1828–1829)
1829|Osmanlı’da kıyafet düzenlemesi (fes)
1830|Yunanistan’ın bağımsızlığının tanınması
1831|Kavalalı Mehmed Ali Paşa İsyanı’nın başlaması
1832|Konya Savaşı
1834|Harbiye (Mekteb-i Harbiye) okulunun açılması
1835|Darwin’in Galapagos’a ulaşması
1836|Teksas’ın Meksika’dan ayrılması
1838|Mekteb-i Maarif-i Adliye’nin açılması
1840|Ceride-i Havadis’in yayın hayatına başlaması
1843|Dickens’ın Bir Noel Şarkısı
1845|İrlanda Büyük Kıtlığı’nın başlaması
1846|Neptün’ün keşfi
1846|Osmanlı’da ilk Maarif Meclisi
1847|Osmanlı’da köle ticaretinin kısıtlanması (Basra Körfezi)
1848|Kaliforniya altına hücumun başlaması
1850|Taiping Ayaklanması’nın başlaması
1851|Encümen-i Dâniş’in kuruluşu
1853|Perry’nin Japonya’ya gelişi
1856|Dolmabahçe Sarayı’nın tamamlanması
1855|Telgrafın Osmanlı’da kullanılmaya başlaması
1856|İkinci Afyon Savaşı’nın başlaması
1859|Kuleli Vakası
1860|Lübnan’da Dürzi–Maruni çatışmaları
1862|Bismarck’ın Prusya başbakanı olması
1863|Robert Kolej’in açılması
1864|Vilayet Nizamnamesi
1864|Çerkes sürgünü
1865|Yeni Osmanlılar Cemiyeti’nin kuruluşu
1866|Königgrätz Savaşı
1867|Marx’ın Kapital’in ilk cildi
1867|Sultan Abdülaziz’in Avrupa gezisi
1868|Şura-yı Devlet’in kuruluşu
1869|Maarif-i Umumiye Nizamnamesi
1870|Darülfünun-u Osmanî’nin açılışı
1871|Paris Komünü
1873|Viyana Borsası çöküşü
1874|Fransa’da ilk İzlenimciler sergisi
1876|Sultan Abdülaziz’in tahttan indirilmesi
1876|II. Abdülhamid’in tahta çıkması
1877|Plevne Savunması
1878|Meclis-i Mebusan’ın kapatılması
1882|Sanayi-i Nefise Mektebi’nin kuruluşu
1883|Krakatau yanardağının patlaması
1888|Şark Demiryolu’nun Viyana bağlantısı (İstanbul–Avrupa hattı)
1890|Ertuğrul Fırkateyni’nin batması
1891|Trans-Sibirya Demiryolu’nun yapımının başlaması
1892|Ellis Island’ın açılması
1893|Hawaii Krallığı’nın devrilmesi
1894|Dreyfus Davası
1894|İstanbul depremi
1898|Alman İmparatoru II. Wilhelm’in İstanbul ziyareti
1900|Darülfünun-u Şahane’nin açılışı
1900|Freud’un Rüyaların Yorumu
1902|Boer Savaşı’nın sona ermesi
1903|Bağdat Demiryolu imtiyazı
1904|Fransa–İngiltere Antant Cordiale
1906|San Francisco depremi
1908|Bosna-Hersek’in Avusturya’ya ilhakı
1908|Bulgaristan’ın bağımsızlık ilanı
1909|Kuzey Kutbu’na ulaşma iddiası (Peary)
1910|Meksika Devrimi’nin başlaması
1910|Halley Kuyruklu Yıldızı’nın geçişi
1912|Çin Cumhuriyeti’nin ilanı
1912|Uşi (Ouchy) Antlaşması
1913|Edirne’nin geri alınması
1913|İstanbul Antlaşması (Bulgaristan)
1914|Saraybosna suikastı
1914|Marne Savaşı
1915|Lusitania’nın batırılması
1915|Kut’ta İngiliz kuşatmasının başlaması
1916|Somme Savaşı
1916|Arap İsyanı
1916|Jutland Deniz Savaşı
1917|Bağdat’ın İngilizlerce alınması
1917|Kudüs’ün İngilizlerce alınması
1918|Woodrow Wilson’ın On Dört İlkesi
1918|Almanya’da cumhuriyetin ilanı
1919|Paris Barış Konferansı
1919|Havza Genelgesi
1920|Misak-ı Milli’nin kabulü
1920|İstanbul’un resmen işgali
1921|II. İnönü Muharebesi
1921|Kütahya-Eskişehir Muharebeleri
1921|Ankara Antlaşması (Fransa)
1921|Tekâlif-i Milliye emirleri
1922|Başkomutanlık Meydan Muharebesi
1922|İzmir’in kurtuluşu
1923|Türkiye–Yunanistan nüfus mübadelesi
1923|Halk Fırkası’nın kuruluşu
1924|Şer’iye ve Evkaf Vekâleti’nin kaldırılması
1924|Terakkiperver Cumhuriyet Fırkası’nın kuruluşu
1925|Uluslararası saat ve takvimin kabul edilmesi
1925|Takrir-i Sükûn Kanunu
1928|Anayasadan “Devletin dini İslam’dır” ibaresinin çıkarılması
1928|Millet Mektepleri’nin açılması
1931|İlk Türk sesli filmi İstanbul Sokaklarında
1930|Menemen Olayı
1932|Halkevlerinin açılması
1932|Ezanın Türkçe okunması uygulaması
1933|Üniversite Reformu
1933|Cumhuriyet’in 10. yıl kutlamaları
1935|Hafta tatilinin pazar gününe alınması
1936|Berlin Olimpiyatları
1937|Laikliğin anayasaya girmesi
1937|Hindenburg zeplininin yanması
1938|Kristallnacht
1939|Erzincan depremi
1940|Dunkirk tahliyesi
1941|Atlantik Bildirgesi
1942|El Alamein Savaşı
1943|Tahran Konferansı
1943|Kahire Konferansı (İnönü–Roosevelt–Churchill)
1944|Varşova Ayaklanması
1945|Türkiye’nin Almanya ve Japonya’ya savaş ilanı
1945|San Francisco Konferansı
1946|Nürnberg Davaları kararları
1947|Marshall Planı
1948|Marshall Yardımı’nın Türkiye’ye ulaşması
1949|Almanya’nın ikiye bölünmesi
1950|Kore’ye Türk Tugayı gönderilmesi
1950|Avrupa İnsan Hakları Sözleşmesi’nin imzalanması
1952|Elizabeth II’nin tahta çıkması
1954|Vietnam’da Dien Bien Phu Savaşı
1955|6–7 Eylül Olayları
1957|Gana’nın bağımsızlığı
1958|Çin’de Büyük İleri Atılım
1960|Afrika Yılı (17 ülkenin bağımsızlığı)
1961|Türkiye–Almanya işgücü anlaşması
1962|Cezayir’in bağımsızlığı
1963|Afrika Birliği Örgütü’nün kuruluşu
1964|Tokyo Olimpiyatları ve ilk hızlı tren (Shinkansen)
1964|ABD’de Sivil Haklar Yasası
1965|Vietnam’a ABD kara birliklerinin gönderilmesi
1965|Singapur’un bağımsızlığı
1966|Çin’de Kızıl Muhafızlar hareketi
1968|Martin Luther King suikastı
1968|Fransa’da Mayıs 1968 olayları
1969|Woodstock Festivali
1970|Nijerya İç Savaşı’nın sona ermesi
1970|İlk Dünya Günü kutlaması
1971|Bangladeş’in bağımsızlığı
1972|Münih Olimpiyatları saldırısı
1972|Nixon’ın Çin ziyareti
1973|Şili’de askerî darbe
1973|Yom Kippur Savaşı
1975|Kamboçya’da Kızıl Kmerlerin iktidara gelmesi
1976|Mao Zedong’un ölümü
1977|Star Wars filminin gösterime girmesi
1978|Çin’de Deng Xiaoping reformlarının başlaması
1979|Thatcher’ın İngiltere başbakanı olması
1980|Polonya’da Dayanışma Sendikası’nın kuruluşu
1981|AIDS’in ilk kez tanımlanması
1982|Lübnan Savaşı
1984|Hindistan’da Bhopal gaz faciası
1984|Indira Gandhi suikastı
1985|Live Aid konserleri
1986|Halley Kuyruklu Yıldızı’nın dönüşü
1987|Montreal Protokolü
1988|Halepçe katliamı
1989|Tiananmen Meydanı olayları
1990|Sovyetlerde çok partili sisteme geçiş
1991|Yugoslavya’nın dağılmaya başlaması
1991|Türk cumhuriyetlerinin bağımsızlıklarını ilan etmesi
1992|Karadeniz Ekonomik İşbirliği’nin kuruluşu
1994|Ruanda soykırımı
1995|Srebrenitsa katliamı
1997|Prenses Diana’nın ölümü
1998|Kosova Savaşı’nın başlaması
1999|Düzce depremi
2000|Y2K ve milenyum geçişi
2001|Çin’in Dünya Ticaret Örgütü’ne katılması
2002|Uluslararası Ceza Mahkemesi’nin kuruluşu
2003|Columbia uzay mekiği kazası
2005|Kyoto Protokolü’nün yürürlüğe girmesi
2006|Twitter’ın kuruluşu
2008|Büyük Hadron Çarpıştırıcısı’nın çalışmaya başlaması
2008|Barack Obama’nın ABD başkanı seçilmesi
2009|H1N1 domuz gribi salgını
2010|Eyjafjallajökull yanardağının patlaması
2011|Güney Sudan’ın bağımsızlığı
2011|Osama bin Ladin’in öldürülmesi
2013|Edward Snowden’ın belgeleri sızdırması
2014|Rusya’nın Kırım’ı ilhakı
2014|Ebola salgını (Batı Afrika)
2015|Avrupa göç krizi
2016|15 Temmuz darbe girişimi
2017|ABD’nin Paris İklim Anlaşması’ndan çekilme kararı
2018|Parker Güneş Sondası’nın fırlatılması
2019|Notre-Dame Katedrali yangını
2020|George Floyd protestoları
2021|Süveyş Kanalı’nın Ever Given gemisiyle tıkanması
2022|Rusya’nın Ukrayna’yı işgali
2022|Kraliçe II. Elizabeth’in ölümü
2023|Chandrayaan-3’ün Ay’ın güney kutbuna inişi
2024|Paris Olimpiyatları
`;
export const EVENTS = RAW.trim().split('\n').map(l => { const i = l.indexOf('|'); return { y: +l.slice(0, i), t: l.slice(i + 1) }; });
// katmanlar: ilk 270 olay en temel olanlar, sonraki 371 ikinci katman, kalanlar üçüncü katman (bölüm sırası bunu izler)
export const TIERS = [270, 371];
export const yearText = y => (y < 0 ? `MÖ ${-y}` : String(y));
