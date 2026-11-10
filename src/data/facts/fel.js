// Felsefe bilgi tabloları — kaynaklar: MEB Ortaöğretim Felsefe ders kitabı (dönem ayrımı MEB programındaki gibidir),
// Stanford Encyclopedia of Philosophy, Britannica, TDK Felsefe Terimleri Sözlüğü.
import { L } from './engine.js';

const MEB = 'MEB Ortaöğretim Felsefe ders kitabı';
const SEP = 'Stanford Encyclopedia of Philosophy · Britannica';

const WORKS = L(`
Platon|Devlet
Aristoteles|Nikomakhos’a Etik
René Descartes|Yöntem Üzerine Konuşma
Immanuel Kant|Saf Aklın Eleştirisi
G. W. F. Hegel|Tinin Fenomenolojisi
Friedrich Nietzsche|Böyle Buyurdu Zerdüşt
Karl Marx|Kapital
Jean-Jacques Rousseau|Toplum Sözleşmesi
Thomas Hobbes|Leviathan
John Locke|İnsan Anlığı Üzerine Bir Deneme
David Hume|İnsan Doğası Üzerine Bir İnceleme
Baruch Spinoza|Etika
Niccolò Machiavelli|Hükümdar (Prens)
Thomas More|Ütopya
Aurelius Augustinus|İtiraflar
Boethius|Felsefenin Tesellisi
Fârâbî|Erdemli Şehir (el-Medînetü’l-Fâzıla)
Gazâlî|Filozofların Tutarsızlığı (Tehâfütü’l-Felâsife)
İbn Rüşd|Tutarsızlığın Tutarsızlığı (Tehâfütü’t-Tehâfüt)
Jean-Paul Sartre|Varlık ve Hiçlik
Simone de Beauvoir|İkinci Cins
Albert Camus|Sisifos Söyleni
Martin Heidegger|Varlık ve Zaman
Ludwig Wittgenstein|Tractatus Logico-Philosophicus
Søren Kierkegaard|Ya/Ya Da
Arthur Schopenhauer|İsteme ve Tasarım Olarak Dünya
John Stuart Mill|Özgürlük Üzerine
Thomas Kuhn|Bilimsel Devrimlerin Yapısı
Karl Popper|Açık Toplum ve Düşmanları
John Rawls|Bir Adalet Teorisi
Hannah Arendt|Totalitarizmin Kaynakları
Marcus Aurelius|Kendime Düşünceler
Montesquieu|Kanunların Ruhu
Francis Bacon|Novum Organum
Voltaire|Candide
Erasmus|Deliliğe Övgü
Henri Bergson|Yaratıcı Tekâmül
`);

const SCHOOL = L(`
Epikuros|Epikürcülük
Kıbrıslı Zenon|Stoacılık
Seneca|Stoacılık
Epiktetos|Stoacılık
Marcus Aurelius|Stoacılık
Sinoplu Diogenes|Kinizm
Antisthenes|Kinizm
Pyrrhon|Septisizm (kuşkuculuk)
Sekstus Empirikus|Septisizm (kuşkuculuk)
René Descartes|Rasyonalizm (akılcılık)
Baruch Spinoza|Rasyonalizm (akılcılık)
G. W. Leibniz|Rasyonalizm (akılcılık)
John Locke|Empirizm (deneycilik)
David Hume|Empirizm (deneycilik)
George Berkeley|Empirizm (deneycilik)
Jean-Paul Sartre|Varoluşçuluk
Søren Kierkegaard|Varoluşçuluk
Simone de Beauvoir|Varoluşçuluk
Jeremy Bentham|Faydacılık
John Stuart Mill|Faydacılık
William James|Pragmatizm
Charles S. Peirce|Pragmatizm
John Dewey|Pragmatizm
Auguste Comte|Pozitivizm
Edmund Husserl|Fenomenoloji
Maurice Merleau-Ponty|Fenomenoloji
Protagoras|Sofistler
Gorgias|Sofistler
`);

const CONCEPTS = L(`
Epistemoloji|Bilginin kaynağını, sınırlarını ve doğruluğunu inceleyen felsefe dalı
Ontoloji|Varlığı, var olan olarak inceleyen felsefe dalı
Etik|İyi ve kötü, doğru ve yanlış eylemleri inceleyen ahlak felsefesi
Estetik|Güzelliği ve sanatı inceleyen felsefe dalı
Metafizik|Duyular ötesindeki ilk ilkeleri ve gerçekliğin temelini araştıran alan
Mantık|Doğru düşünmenin kurallarını inceleyen disiplin
Tümevarım|Tek tek durumlardan genel bir sonuca ulaşan akıl yürütme
Tümdengelim|Genel öncüllerden zorunlu olarak tek bir sonuca ulaşan akıl yürütme
Kıyas|İki öncülden zorunlu bir sonuç çıkaran tümdengelimli çıkarım
Önerme|Doğru ya da yanlış olabilen, yargı bildiren cümle
Safsata|Doğru gibi görünen ama hatalı olan akıl yürütme
Totoloji|Her durumda doğru olan önerme
Paradoks|Akla aykırı ya da kendisiyle çelişen sonuca götüren ifade
Diyalektik|Karşıtların çatışmasıyla gelişen düşünme ya da gerçeklik süreci
A priori|Deneyimden önce, yalnızca akılla bilinebilen
A posteriori|Deneyimden sonra, deneyime dayanarak bilinen
Determinizm|Her olayın önceki nedenlerle zorunlu olarak belirlendiği görüşü
Özgür irade|İnsanın eylemlerini kendisinin belirleyebildiği görüşü
Kategorik imperatif|Kant’a göre koşulsuz bağlayıcı ahlak buyruğu
Hedonizm|En yüksek iyinin haz olduğunu savunan görüş
Nihilizm|Değerlerin ve anlamın nesnel bir temeli olmadığını savunan görüş
Rölativizm|Doğrunun ve değerlerin kişiye ya da kültüre göre değiştiği görüşü
Dogmatizm|Bir görüşü sorgulamadan kesin doğru kabul etme tutumu
Solipsizm|Yalnızca kendi zihninin var olduğundan emin olunabileceği görüşü
Panteizm|Tanrı ile evreni özdeş sayan görüş
Agnostisizm|Tanrı’nın varlığının bilinemeyeceğini savunan görüş
Materyalizm|Gerçekliğin temelde maddeden oluştuğunu savunan görüş
İdealizm|Gerçekliğin temelde zihinsel ya da düşünsel olduğunu savunan görüş
Düalizm|Gerçekliğin iki ayrı ilkeye (örneğin zihin ve beden) dayandığı görüşü
Monizm|Gerçekliğin tek bir ilkeye dayandığı görüşü
Teleoloji|Olayları amaçları ve ereklerine göre açıklayan görüş
Toplum sözleşmesi|Devletin, bireylerin karşılıklı anlaşmasıyla kurulduğunu öne süren kuram
Ockham’ın usturası|Eşit açıklayıcı iki açıklamadan daha az varsayım içerenin tercih edilmesi ilkesi
Sokratik yöntem|Sorularla karşıdakinin bilgisini kendi içinden “doğurtma” yöntemi
Mağara alegorisi|Platon’un, insanların gölgeleri gerçek sandığı benzetmesi
Cogito ergo sum|Descartes’ın “Düşünüyorum, öyleyse varım” önermesi
Tabula rasa|Locke’a göre zihnin doğuşta boş bir levha olduğu düşüncesi
Üstinsan|Nietzsche’nin kendi değerlerini yaratan insan idealine verdiği ad
Absürd|Camus’ye göre insanın anlam arayışı ile evrenin sessizliği arasındaki çelişki
Erdem|Ahlaki açıdan iyi olanı yapmaya yönelik kalıcı karakter özelliği
Arkhe|İlk Çağ doğa filozoflarının aradığı, her şeyin ana maddesi ya da ilk ilkesi
Akıl yürütme|Bilinenlerden yola çıkarak yeni bir yargıya ulaşma
`);

const FALLACY = L(`
“Sen bu konuda konuşamazsın, sen de geç kalıyorsun!”|Kişiye saldırı (ad hominem)
“Ya bizden yanasın ya da karşımızdasın.”|Yanlış ikilem
“Buna izin verirsek sonu felakete varır, her şey çöker.”|Kaygan zemin
“Herkes böyle yapıyor, demek ki doğrudur.”|Çoğunluğa başvurma
“Ünlü bir oyuncu bu kremi öneriyorsa kesin iyidir.”|Uygunsuz otoriteye başvurma
“Bu kitap doğru, çünkü kitapta doğru olduğu yazıyor.”|Döngüsel akıl yürütme
“Kimse bunun yanlış olduğunu kanıtlayamadı, o hâlde doğru.”|Bilgisizliğe başvurma
“Karşı görüşü çarpıtıp çürütmesi kolay bir hâle getirmek.”|Saman adam (korkuluk)
“Yeni çıktı, öyleyse eskisinden daha iyi olmalı.”|Yeniliğe başvurma
“Horoz öttü, sonra güneş doğdu; demek ki horoz güneşi doğurdu.”|Ardından geldi, öyleyse ondan oldu
`);

const QUOTES = L(`
Düşünüyorum, öyleyse varım.|René Descartes
Sorgulanmamış bir hayat yaşanmaya değmez.|Sokrates
İnsan doğası gereği politik bir varlıktır.|Aristoteles
Aynı nehirde iki kez yıkanılmaz.|Herakleitos
İnsan özgür olmaya mahkûmdur.|Jean-Paul Sartre
Kadın doğulmaz, kadın olunur.|Simone de Beauvoir
İnsan her şeyin ölçüsüdür.|Protagoras
Bilgi güçtür.|Francis Bacon
Filozoflar dünyayı yalnızca yorumladılar; oysa önemli olan onu değiştirmektir.|Karl Marx
Var olmak, algılanmaktır.|George Berkeley
Hayat geriye doğru anlaşılır ama ileriye doğru yaşanır.|Søren Kierkegaard
Dilimin sınırları dünyamın sınırlarıdır.|Ludwig Wittgenstein
Sisifos’u mutlu düşlemek gerekir.|Albert Camus
Ölüm bizim için hiçbir şeydir.|Epikuros
Akıl, tutkuların kölesidir ve yalnızca öyle olmalıdır.|David Hume
İnsan özgür doğar, oysa her yerde zincire vurulmuştur.|Jean-Jacques Rousseau
İki şey zihnimi hayranlıkla doldurur: üstümdeki yıldızlı gök ve içimdeki ahlak yasası.|Immanuel Kant
Beni öldürmeyen şey güçlendirir.|Friedrich Nietzsche
`);

const ERA = L(`
Thales|MÖ 6. yüzyıl – MS 2. yüzyıl
Herakleitos|MÖ 6. yüzyıl – MS 2. yüzyıl
Pythagoras|MÖ 6. yüzyıl – MS 2. yüzyıl
Demokritos|MÖ 6. yüzyıl – MS 2. yüzyıl
Sokrates|MÖ 6. yüzyıl – MS 2. yüzyıl
Platon|MÖ 6. yüzyıl – MS 2. yüzyıl
Aristoteles|MÖ 6. yüzyıl – MS 2. yüzyıl
Epikuros|MÖ 6. yüzyıl – MS 2. yüzyıl
Protagoras|MÖ 6. yüzyıl – MS 2. yüzyıl
Augustinus|MS 2. yüzyıl – 15. yüzyıl
Boethius|MS 2. yüzyıl – 15. yüzyıl
Anselmus|MS 2. yüzyıl – 15. yüzyıl
Thomas Aquinas|MS 2. yüzyıl – 15. yüzyıl
Fârâbî|MS 2. yüzyıl – 15. yüzyıl
İbn Sînâ|MS 2. yüzyıl – 15. yüzyıl
Gazâlî|MS 2. yüzyıl – 15. yüzyıl
İbn Rüşd|MS 2. yüzyıl – 15. yüzyıl
Niccolò Machiavelli|15. – 17. yüzyıl
Francis Bacon|15. – 17. yüzyıl
René Descartes|15. – 17. yüzyıl
Thomas Hobbes|15. – 17. yüzyıl
Baruch Spinoza|15. – 17. yüzyıl
John Locke|15. – 17. yüzyıl
Thomas More|15. – 17. yüzyıl
Erasmus|15. – 17. yüzyıl
David Hume|18. – 19. yüzyıl
Jean-Jacques Rousseau|18. – 19. yüzyıl
Immanuel Kant|18. – 19. yüzyıl
G. W. F. Hegel|18. – 19. yüzyıl
Karl Marx|18. – 19. yüzyıl
Friedrich Nietzsche|18. – 19. yüzyıl
Søren Kierkegaard|18. – 19. yüzyıl
Arthur Schopenhauer|18. – 19. yüzyıl
John Stuart Mill|18. – 19. yüzyıl
Auguste Comte|18. – 19. yüzyıl
Jean-Paul Sartre|20. yüzyıl
Simone de Beauvoir|20. yüzyıl
Ludwig Wittgenstein|20. yüzyıl
Martin Heidegger|20. yüzyıl
Karl Popper|20. yüzyıl
Hannah Arendt|20. yüzyıl
Thomas Kuhn|20. yüzyıl
John Rawls|20. yüzyıl
Albert Camus|20. yüzyıl
Edmund Husserl|20. yüzyıl
`);

const BRANCH = L(`
Bilgi felsefesi|Doğru bilgi mümkün müdür, kaynağı nedir?
Varlık felsefesi|Varlık var mıdır, varsa ne türden bir şeydir?
Ahlak felsefesi|İyi ve kötü nedir, eylemlerimizi neye göre değerlendiririz?
Sanat felsefesi (estetik)|Güzel nedir, sanat eserinin değeri neye dayanır?
Din felsefesi|Tanrı’nın varlığı akılla temellendirilebilir mi?
Siyaset felsefesi|İdeal devlet nasıl olmalıdır, iktidar neden meşrudur?
Bilim felsefesi|Bilimsel bilginin değeri ve bilimin yöntemi nedir?
Zihin felsefesi|Zihin ile beden arasındaki ilişki nedir?
`);

const ARKHE = L(`
Thales|Su
Anaksimandros|Apeiron (sınırsız)
Anaksimenes|Hava
Herakleitos|Ateş (ve değişimi yöneten logos)
Pythagoras|Sayı
Empedokles|Dört öğe: su, hava, toprak ve ateş
Demokritos|Atom
Anaksagoras|Sonsuz küçük tohumlar (spermata)
`);

export const FEL = {
  eser: { k: 'pair', d: 2, src: SEP, rows: WORKS,
    q: a => `Aşağıdaki eserlerden hangisi ${a} tarafından yazılmıştır?`, r: b => `“${b}” adlı eserin yazarı kimdir?`, e: (a, b) => `“${b}” → ${a}.` },
  akim: { k: 'group', d: 2, src: `${MEB} · ${SEP}`, rows: SCHOOL,
    q: a => `${a} hangi felsefi akım ya da okulla anılır?`, has: g => `Aşağıdaki düşünürlerden hangisi ${g} ile anılır?`, not: g => `Aşağıdaki düşünürlerden hangisi ${g} ile anılmaz?`,
    e: (a, g) => `${a} → ${g}.`, notE: g => `${g} ile anılır` },
  akimp: { k: 'pick', d: 3, n: 260, src: `${MEB} · ${SEP}`, rows: SCHOOL,
    has: g => `“${g}” denince aşağıdaki düşünürlerden hangisi akla gelir?`, e: (a, g) => `${a} → ${g}.`, eOthers: w => `Diğerleri: ${w.map(x => `${x[0]} (${x[1]})`).join(', ')}.` },
  kavram: { k: 'pair', d: 2, src: `${MEB} · TDK Felsefe Terimleri Sözlüğü`, rows: CONCEPTS,
    q: a => `Felsefede “${a}” ne demektir?`, r: b => `“${b}” tanımı hangi kavrama aittir?`, e: (a, b) => `${a}: ${b}.` },
  safsata: { k: 'pair', d: 3, src: `${MEB} · mantık ünitesi`, rows: FALLACY,
    q: a => `${a} Bu ifadede hangi safsata vardır?`, r: b => `Aşağıdakilerden hangisi “${b}” safsatasına örnektir?`, e: (a, b) => `${b}: ${a}` },
  soz: { k: 'pair', d: 2, src: SEP, rows: QUOTES,
    q: a => `“${a}” sözü hangi düşünüre aittir?`, r: b => `Aşağıdaki sözlerden hangisi ${b} ile özdeşleşir?`, e: (a, b) => `“${a}” → ${b}.` },
  donem: { k: 'group', d: 2, src: `${MEB} (felsefenin dönemleri)`, rows: ERA,
    q: a => `${a} felsefe tarihinin hangi döneminde yer alır?`, has: g => `Aşağıdaki düşünürlerden hangisi “${g}” felsefesi döneminde yer alır?`, not: g => `Aşağıdaki düşünürlerden hangisi “${g}” döneminde yer ALMAZ?`,
    e: (a, g) => `${a} → ${g} felsefesi.`, notE: g => `“${g}” dönemindedir` },
  donemp: { k: 'pick', d: 2, n: 280, src: `${MEB} (felsefenin dönemleri)`, rows: ERA,
    has: g => `Aşağıdaki filozoflardan hangisi “${g}” döneminde yaşamıştır?`, e: (a, g) => `${a} → ${g}.`, eOthers: w => `Diğerleri: ${w.map(x => `${x[0]} (${x[1]})`).join(', ')}.` },
  dal: { k: 'pair', d: 1, src: MEB, rows: BRANCH,
    q: a => `${a} hangi temel soruyu sorar?`, r: b => `“${b}” sorusu hangi felsefe dalının temel sorusudur?`, e: (a, b) => `${a}: ${b}` },
  arkhe: { k: 'pair', d: 2, src: `${MEB} · İlk Çağ doğa filozofları`, rows: ARKHE,
    q: a => `${a} evrenin ana maddesini (arkhe) ne olarak görmüştür?`, r: b => `Arkheyi “${b.charAt(0).toLocaleLowerCase('tr') + b.slice(1)}” olarak açıklayan düşünür kimdir?`, e: (a, b) => `${a}: arkhe = ${b.charAt(0).toLocaleLowerCase('tr') + b.slice(1)}.` },
};
