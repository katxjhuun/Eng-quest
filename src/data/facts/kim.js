// Kimya bilgi tabloları (hesaplama kalıplarına ek) — kaynaklar: IUPAC periyodik tablosu, MEB Ortaöğretim Kimya ders kitapları, OpenStax Chemistry 2e.
import { L, N } from './engine.js';

const IUPAC = 'IUPAC periyodik tablosu';
const MEB = 'MEB Ortaöğretim Kimya ders kitabı';

// atom no | sembol | ad | sınıf | periyot | aile
const EL = `1|H|Hidrojen|Ametal|1|
2|He|Helyum|Soy gaz|1|Soy gazlar (8A)
3|Li|Lityum|Metal|2|Alkali metaller (1A)
4|Be|Berilyum|Metal|2|Toprak alkali metaller (2A)
5|B|Bor|Yarı metal|2|Toprak metalleri (3A)
6|C|Karbon|Ametal|2|Karbon grubu (4A)
7|N|Azot|Ametal|2|Azot grubu (5A)
8|O|Oksijen|Ametal|2|Oksijen grubu (6A)
9|F|Flor|Ametal|2|Halojenler (7A)
10|Ne|Neon|Soy gaz|2|Soy gazlar (8A)
11|Na|Sodyum|Metal|3|Alkali metaller (1A)
12|Mg|Magnezyum|Metal|3|Toprak alkali metaller (2A)
13|Al|Alüminyum|Metal|3|Toprak metalleri (3A)
14|Si|Silisyum|Yarı metal|3|Karbon grubu (4A)
15|P|Fosfor|Ametal|3|Azot grubu (5A)
16|S|Kükürt|Ametal|3|Oksijen grubu (6A)
17|Cl|Klor|Ametal|3|Halojenler (7A)
18|Ar|Argon|Soy gaz|3|Soy gazlar (8A)
19|K|Potasyum|Metal|4|Alkali metaller (1A)
20|Ca|Kalsiyum|Metal|4|Toprak alkali metaller (2A)
21|Sc|Skandiyum|Metal|4|
22|Ti|Titanyum|Metal|4|
23|V|Vanadyum|Metal|4|
24|Cr|Krom|Metal|4|
25|Mn|Mangan|Metal|4|
26|Fe|Demir|Metal|4|
27|Co|Kobalt|Metal|4|
28|Ni|Nikel|Metal|4|
29|Cu|Bakır|Metal|4|
30|Zn|Çinko|Metal|4|
31|Ga|Galyum|Metal|4|Toprak metalleri (3A)
32|Ge|Germanyum|Yarı metal|4|Karbon grubu (4A)
33|As|Arsenik|Yarı metal|4|Azot grubu (5A)
34|Se|Selenyum|Ametal|4|Oksijen grubu (6A)
35|Br|Brom|Ametal|4|Halojenler (7A)
36|Kr|Kripton|Soy gaz|4|Soy gazlar (8A)
47|Ag|Gümüş|Metal|5|
50|Sn|Kalay|Metal|5|
53|I|İyot|Ametal|5|Halojenler (7A)
54|Xe|Ksenon|Soy gaz|5|Soy gazlar (8A)
78|Pt|Platin|Metal|6|
79|Au|Altın|Metal|6|
80|Hg|Cıva|Metal|6|
82|Pb|Kurşun|Metal|6|
86|Rn|Radon|Soy gaz|6|Soy gazlar (8A)
92|U|Uranyum|Metal|7|`.split('\n').map(l => l.split('|'));

const COMPOUND = L(`
Su|H₂O
Sofra tuzu|NaCl
Karbondioksit|CO₂
Amonyak|NH₃
Metan|CH₄
Kireç taşı|CaCO₃
Sönmemiş kireç|CaO
Sönmüş kireç|Ca(OH)₂
Sud kostik|NaOH
Kezzap (nitrik asit)|HNO₃
Tuz ruhu (hidroklorik asit)|HCl
Zaç yağı (sülfürik asit)|H₂SO₄
Yemek sodası|NaHCO₃
Çamaşır sodası|Na₂CO₃
Hidrojen peroksit|H₂O₂
Glikoz|C₆H₁₂O₆
Etil alkol|C₂H₅OH
Asetik asit (sirke asidi)|CH₃COOH
Ozon|O₃
Karbonmonoksit|CO
Kükürt dioksit|SO₂
Azot dioksit|NO₂
Potas kostik|KOH
Silisyum dioksit (kum)|SiO₂
Demir(III) oksit (pas)|Fe₂O₃
Bütan|C₄H₁₀
Propan|C₃H₈
Etilen|C₂H₄
Asetilen|C₂H₂
Nişadır|NH₄Cl
Göz taşı|CuSO₄·5H₂O
Fosforik asit|H₃PO₄
`);

const ABS = L(`
HCl|Asit
HNO₃|Asit
H₂SO₄|Asit
CH₃COOH|Asit
H₃PO₄|Asit
HF|Asit
H₂CO₃|Asit
NaOH|Baz
KOH|Baz
Ca(OH)₂|Baz
NH₃|Baz
Mg(OH)₂|Baz
Ba(OH)₂|Baz
NaCl|Tuz
KNO₃|Tuz
CaCO₃|Tuz
Na₂SO₄|Tuz
NH₄Cl|Tuz
KCl|Tuz
`);

const PH = L(`
Limon suyu|Asidik
Sirke|Asidik
Kola|Asidik
Mide özsuyu|Asidik
Domates suyu|Asidik
Portakal suyu|Asidik
Saf su|Nötr
Sofra tuzu çözeltisi|Nötr
Şekerli su|Nötr
Sabunlu su|Bazik
Çamaşır suyu|Bazik
Karbonat (kabartma tozu) çözeltisi|Bazik
Amonyaklı cam temizleyici|Bazik
Kireçli su|Bazik
Lavabo açıcı|Bazik
`);

const LAB = L(`
Mezür|Sıvıların hacmini ölçmek
Büret|Titrasyonda eklenen sıvının hacmini hassas ölçmek
Pipet|Belirli hacimde sıvıyı çekip aktarmak
Balon joje|Belirli hacimde ve derişimde çözelti hazırlamak
Bunsen beki|Gaz alevîyle ısıtmak
Havan|Katıları ezip toz hâline getirmek
Desikatör|Maddeleri nemden koruyarak kurutmak ve saklamak
Ayırma hunisi|Birbiriyle karışmayan sıvıları ayırmak
Süzgeç kâğıdı ve huni|Katıyı sıvıdan süzerek ayırmak
Saat camı|Az miktarda katıyı tartmak ya da buharlaştırmak
Kroze|Katıları yüksek sıcaklıkta ısıtmak
Erlenmayer|Çalkalanarak karıştırılacak çözeltileri koymak, titrasyon yapmak
Termometre|Sıcaklığı ölçmek
Terazi|Kütleyi ölçmek
`);

const CHANGE = L(`
Buzun erimesi|Fiziksel değişim
Suyun kaynaması|Fiziksel değişim
Şekerin suda çözünmesi|Fiziksel değişim
Camın kırılması|Fiziksel değişim
Kâğıdın yırtılması|Fiziksel değişim
Naftalinin süblimleşmesi|Fiziksel değişim
Suyun donması|Fiziksel değişim
Odunun yanması|Kimyasal değişim
Demirin paslanması|Kimyasal değişim
Sütün ekşimesi|Kimyasal değişim
Elmanın kesilince kararması|Kimyasal değişim
Yumurtanın pişmesi|Kimyasal değişim
Fotosentez|Kimyasal değişim
Hamurun mayalanması|Kimyasal değişim
`);

const SEPARATE = L(`
Tuzlu sudan tuz elde etmek|Buharlaştırma
Su ile zeytinyağını ayırmak|Ayırma hunisi
Kum ile suyu ayırmak|Süzme
Demir tozu ile kükürt tozunu ayırmak|Mıknatısla ayırma
Alkol ile suyu ayırmak|Ayrımsal damıtma
Mürekkepteki boyaları ayırmak|Kromatografi
Kum ile çakılı ayırmak|Eleme
Tuz ile naftalini ayırmak|Süblimleştirme
`);

const SCI = L(`
John Dalton|İlk modern atom modelini ortaya koydu
J. J. Thomson|Elektronu keşfetti ve “üzümlü kek” atom modelini önerdi
Ernest Rutherford|Altın levha deneyiyle atom çekirdeğini ortaya koydu
Niels Bohr|Elektronların belirli enerji katmanlarında bulunduğu atom modelini önerdi
Antoine Lavoisier|Kütlenin korunumu yasasını ortaya koydu
Joseph Proust|Sabit oranlar yasasını ortaya koydu
Amedeo Avogadro|Aynı koşullarda eşit hacimdeki gazların eşit sayıda tanecik içerdiğini öne sürdü
Robert Boyle|Sabit sıcaklıkta gazın basıncı ile hacminin ters orantılı olduğunu buldu
Jacques Charles|Sabit basınçta gazın hacmi ile sıcaklığının doğru orantılı olduğunu buldu
Svante Arrhenius|Asitleri ve bazları sudaki iyonlarına göre tanımladı
Linus Pauling|Elektronegatiflik ölçeğini geliştirdi
Henry Moseley|Periyodik tabloyu atom numarasına göre düzenledi
Henri Le Chatelier|Dengeye dışarıdan etki edilince sistemin bu etkiyi azaltacak yöne kaydığını açıkladı
`);

const elNo = EL.map(e => [e[2], Number(e[0])]);
export const KIM = {
  sembol: { k: 'pair', d: 1, src: IUPAC, lbl: 'element — sembol', rows: EL.map(e => [e[2], e[1]]),
    q: a => `${a} elementinin sembolü nedir?`, r: b => `Sembolü “${b}” olan element hangisidir?`, e: (a, b) => `${a}: ${b}.` },
  atomno: { k: 'num', d: 2, src: IUPAC, lbl: 'element — atom numarası', rows: elNo, spread: [1, 2, 3, 4, 6], min: 1, fmt: v => String(v),
    q: a => `${a} elementinin atom numarası kaçtır?`, r: v => `Atom numarası ${v} olan element hangisidir?`, e: (a, v) => `${a}: atom numarası ${v} (çekirdeğinde ${v} proton).` },
  sinif: { k: 'group', d: 1, src: `${IUPAC} · ${MEB}`, crit: 'element sınıfı', lbl: 'element — sınıf', rows: EL.map(e => [e[2], e[3]]),
    q: a => `${a} hangi element sınıfındadır?`, has: g => `Aşağıdaki elementlerden hangisi bir ${g.toLocaleLowerCase('tr')}${g === 'Soy gaz' ? 'dır' : 'dir'}?`.replace('ametaldir', 'ametaldir').replace('yarı metaldir', 'yarı metaldir'), not: g => `Aşağıdaki elementlerden hangisi bir ${g.toLocaleLowerCase('tr')} DEĞİLDİR?`,
    e: (a, g) => `${a} → ${g.toLocaleLowerCase('tr')}.`, notE: g => g.toLocaleLowerCase('tr') },
  periyot: { k: 'group', d: 3, src: IUPAC, crit: 'periyodik tablodaki periyodu', lbl: 'element — periyot', rows: EL.filter(e => +e[0] <= 36).map(e => [e[2], `${e[4]}. periyot`]),
    q: a => `${a} periyodik tablonun kaçıncı periyodundadır?`, has: g => `Aşağıdaki elementlerden hangisi ${g}tadır?`, not: g => `Aşağıdaki elementlerden hangisi ${g}ta DEĞİLDİR?`,
    e: (a, g) => `${a} → ${g}.`, notE: g => `${g}tadır` },
  aile: { k: 'group', d: 2, src: IUPAC, crit: 'periyodik tablodaki grubu', lbl: 'element — grup', rows: EL.filter(e => e[5]).map(e => [e[2], e[5]]),
    q: a => `${a} periyodik tablonun hangi grubunda yer alır?`, has: g => `Aşağıdaki elementlerden hangisi “${g}” grubundadır?`, not: g => `Aşağıdaki elementlerden hangisi “${g}” grubunda DEĞİLDİR?`,
    e: (a, g) => `${a} → ${g}.`, notE: g => `“${g}” grubundadır` },
  bilesik: { k: 'pair', d: 2, src: MEB, lbl: 'madde — formül', rows: COMPOUND,
    q: a => `${a} maddesinin formülü hangisidir?`, r: b => `Formülü ${b} olan maddenin yaygın adı nedir?`, e: (a, b) => `${a}: ${b}.` },
  asitbaz: { k: 'group', d: 2, src: MEB, crit: 'asit, baz ya da tuz olması', lbl: 'bileşik — sınıf', rows: ABS,
    q: a => `${a} bileşiği asit, baz ve tuzdan hangisidir?`, has: g => `Aşağıdaki bileşiklerden hangisi bir ${g.toLocaleLowerCase('tr')}${g === 'Asit' ? 'tir' : g === 'Baz' ? 'dır' : 'dur'}?`, not: g => `Aşağıdaki bileşiklerden hangisi bir ${g.toLocaleLowerCase('tr')} DEĞİLDİR?`,
    e: (a, g) => `${a} → ${g.toLocaleLowerCase('tr')}.`, notE: g => g.toLocaleLowerCase('tr') },
  ph: { k: 'group', d: 1, src: `${MEB} · OpenStax Chemistry 2e`, crit: 'asitlik-bazlık durumu', lbl: 'madde — pH karakteri', rows: PH,
    q: a => `${a} asidik, nötr ve bazik özelliklerden hangisini gösterir?`, has: g => `Aşağıdakilerden hangisi ${g.toLocaleLowerCase('tr')} özellik gösterir?`, not: g => `Aşağıdakilerden hangisi ${g.toLocaleLowerCase('tr')} özellik GÖSTERMEZ?`,
    e: (a, g) => `${a} → ${g.toLocaleLowerCase('tr')} (pH ${g === 'Asidik' ? '< 7' : g === 'Nötr' ? '≈ 7' : '> 7'}).`, notE: g => `${g.toLocaleLowerCase('tr')}` },
  lab: { k: 'pair', d: 2, src: MEB, lbl: 'malzeme — kullanım amacı', rows: LAB,
    q: a => `Laboratuvarda ${a.toLocaleLowerCase('tr')} ne için kullanılır?`, r: b => `“${b}” için hangi laboratuvar malzemesi kullanılır?`, e: (a, b) => `${a}: ${b.charAt(0).toLocaleLowerCase('tr') + b.slice(1)}.` },
  degisim: { k: 'group', d: 1, src: MEB, crit: 'değişimin türü', rows: CHANGE,
    has: g => `Aşağıdakilerden hangisi bir ${g.toLocaleLowerCase('tr')}dir?`, not: g => `Aşağıdakilerden hangisi bir ${g.toLocaleLowerCase('tr')} DEĞİLDİR?`,
    e: (a, g) => `${a} → ${g.toLocaleLowerCase('tr')}${g.startsWith('Kim') ? ': yeni bir madde oluşur.' : ': maddenin kimliği değişmez.'}`, notE: g => g.toLocaleLowerCase('tr') },
  ayirma: { k: 'pair', d: 2, src: MEB, lbl: 'karışım — ayırma yöntemi', rows: SEPARATE,
    q: a => `${a} için en uygun yöntem hangisidir?`, r: b => `${b} yöntemi aşağıdakilerden hangisi için kullanılır?`, e: (a, b) => `${a} → ${b.toLocaleLowerCase('tr')}.` },
  bilimci: { k: 'pair', d: 2, src: `${MEB} · OpenStax Chemistry 2e`, lbl: 'bilim insanı — katkısı', rows: SCI,
    q: a => `${a} kimyaya hangi katkısıyla tanınır?`, r: b => `Kim “${b.charAt(0).toLocaleLowerCase('tr') + b.slice(1)}”?`, e: (a, b) => `${a}: ${b}.` },
};
