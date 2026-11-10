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
`;
export const EVENTS = RAW.trim().split('\n').map(l => { const i = l.indexOf('|'); return { y: +l.slice(0, i), t: l.slice(i + 1) }; });
export const yearText = y => (y < 0 ? `MÖ ${-y}` : String(y));
