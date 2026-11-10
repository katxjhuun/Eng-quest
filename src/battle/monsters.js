// dam-la — savaş canavarları: petlerle aynı geometrik editoryal çizim dilinde (düz şekiller, kırık tonlar, küçük koyu gözler).
// Temaları öğrenmenin önündeki engellerdir: erteleme, unutkanlık, dikkat dağınıklığı, kibir…
// Her canavarın bir tipi vardır; rolü karşılaşmada rastgele atanır (bosslarınki sabittir).
// SVG viewBox 0 0 120 120, ayak hizası y≈104; gölge elipsi ortak.

const shadow = '<ellipse cx="60" cy="108" rx="30" ry="5" fill="#2a2430" opacity=".14"/>';
const eye = (x, y, r = 3.2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#231e26"/><circle cx="${x + r * .35}" cy="${y - r * .35}" r="${r * .32}" fill="#fff" opacity=".9"/>`;
const wrap = (body, extra = '') => `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" class="mon-svg"${extra}>${shadow}<g class="mon-body">${body}</g></svg>`;

const ART = {
  // Erteleme: ağır, yayvan, uykulu bir yığın; tepesinde yarım kalmış bir saat
  erteleme: () => wrap(`<path d="M18 104c0-30 18-50 42-50s42 20 42 50z" fill="#8E9C84"/><path d="M30 104c0-20 13-34 30-34s30 14 30 34z" fill="#A7B39D"/>
    <path d="M44 74q6 4 12 0M64 74q6 4 12 0" stroke="#231e26" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M54 88q6 3 12 0" stroke="#5f6a58" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="60" cy="44" r="11" fill="#E8DFC9" stroke="#8E9C84" stroke-width="3"/><path d="M60 37v7l5 3" stroke="#5f6a58" stroke-width="2" fill="none" stroke-linecap="round"/><text x="82" y="56" font-size="11" font-weight="900" fill="#5f6a58">z</text><text x="90" y="46" font-size="8" font-weight="900" fill="#5f6a58">z</text>`),
  // Unutkanlık: soluk bir güve; kanatlarında silinmiş harfler
  unutkan: () => wrap(`<path d="M60 60C40 30 12 34 16 58c3 18 26 22 44 10z" fill="#D9CFC0"/><path d="M60 60c20-30 48-26 44-2-3 18-26 22-44 10z" fill="#D9CFC0"/>
    <path d="M60 66C44 80 26 88 30 98c5 8 22 0 30-18zM60 66c16 14 34 22 30 32-5 8-22 0-30-18z" fill="#C2B6A4"/><path d="M26 50h10M30 56h14M84 50h10M76 56h14" stroke="#ADA090" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="2 4"/>
    <ellipse cx="60" cy="72" rx="8" ry="22" fill="#8A7E70"/><circle cx="60" cy="50" r="9" fill="#8A7E70"/>${eye(56, 49, 2.6)}${eye(64, 49, 2.6)}<path d="M56 41q-6-10-12-12M64 41q6-10 12-12" stroke="#8A7E70" stroke-width="2" fill="none" stroke-linecap="round"/>`),
  // Dikkat Dağınıklığı: birçok gözlü, titrek, sivri saçaklı top
  dagin: () => wrap(`<path d="M60 26l7 12 13-6-2 14 14 2-9 11 11 9-14 4 4 14-13-5-6 13-6-13-13 5 4-14-14-4 11-9-9-11 14-2-2-14 13 6z" fill="#E0A458"/>
    <circle cx="60" cy="66" r="24" fill="#EBC27E"/>${eye(50, 58, 3)}${eye(68, 55, 2.4)}${eye(62, 72, 3.4)}${eye(46, 74, 2.2)}${eye(74, 68, 2)}<path d="M54 84q6-4 12 0" stroke="#231e26" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M60 104v-14M46 104l4-12M74 104l-4-12" stroke="#C9893E" stroke-width="5" stroke-linecap="round"/>`),
  // Kibir: tavus kuşu kuyruklu, burnu havada dik bir figür
  kibir: () => wrap(`<path d="M60 70C34 66 16 46 22 26c14 4 26 18 38 40C72 44 84 30 98 26c6 20-12 40-38 44z" fill="#4E8A8B"/><circle cx="34" cy="38" r="5" fill="#E2B653"/><circle cx="86" cy="38" r="5" fill="#E2B653"/><circle cx="60" cy="30" r="5" fill="#E2B653"/>
    <path d="M48 104l4-40h16l4 40z" fill="#2F5F66"/><circle cx="60" cy="54" r="12" fill="#2F5F66"/><path d="M70 50l14-4-12 9z" fill="#E2B653"/>
    <path d="M54 52q3-2 6 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M54 44l4-8 2 6 3-8 2 10" fill="#E2B653"/>`),
  // Şüphe: sis bulutundan bir hayalet, gözleri kısık
  suphe: () => wrap(`<path d="M30 100c-8-10-6-26 4-32-6-16 8-30 22-26 6-12 26-12 32 2 14-2 22 14 16 26 10 8 8 26-2 30-6 6-14 0-18 4-6 6-14 2-18-2-8 6-14 2-18-2-6 4-14 4-18 0z" fill="#B8C1C9"/>
    <path d="M40 92c6-4 12 4 18 0s12-6 20 0" stroke="#9BA5AF" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M44 62h12M66 62h12" stroke="#231e26" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M56 76q4 3 10-1" stroke="#231e26" stroke-width="2.4" fill="none" stroke-linecap="round"/><text x="82" y="44" font-size="16" font-weight="900" fill="#7C8792">?</text>`),
  // Kaygı: sivri dikenli, titreyen deniz kestanesi
  kaygi: () => wrap(`<g fill="#6C5C8E">${Array.from({ length: 14 }, (_, i) => { const a = i / 14 * Math.PI * 2; const x = 60 + Math.cos(a) * 30, y = 70 + Math.sin(a) * 30; const x1 = 60 + Math.cos(a - .18) * 18, y1 = 70 + Math.sin(a - .18) * 18, x2 = 60 + Math.cos(a + .18) * 18, y2 = 70 + Math.sin(a + .18) * 18; return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}z"/>`; }).join('')}</g>
    <circle cx="60" cy="70" r="20" fill="#8D7DB0"/>${eye(53, 66, 3.6)}${eye(67, 66, 3.6)}<path d="M52 79l4-3 4 3 4-3 4 3" stroke="#231e26" stroke-width="2" fill="none" stroke-linejoin="round"/>`),
  // Ezber: papağan gibi tekrar eden, kâğıt kanatlı kuş
  ezber: () => wrap(`<path d="M44 104l6-14h20l6 14" fill="#B65F45"/><ellipse cx="60" cy="72" rx="22" ry="24" fill="#D57A57"/><path d="M38 66l-16 14 20 2zM82 66l16 14-20 2z" fill="#F1E7D4"/><path d="M26 76h10M84 76h10" stroke="#B9AC98" stroke-width="1.6"/>
    <circle cx="60" cy="48" r="15" fill="#D57A57"/><path d="M66 50q12 2 10 12-6-2-10-6z" fill="#E7C15A"/>${eye(57, 45, 3)}<path d="M50 38l4-8 4 6 3-8 3 9" fill="#B65F45"/>`),
  // Gürültü: boru ağızlı, titreşen bir boru canavarı
  gurultu: () => wrap(`<rect x="40" y="58" width="40" height="46" rx="10" fill="#7E8D9A"/><path d="M66 50l30-16v44l-30-16z" fill="#A9B7C2"/><rect x="58" y="46" width="12" height="20" rx="3" fill="#7E8D9A"/>
    ${eye(50, 72, 3)}${eye(64, 72, 3)}<rect x="48" y="84" width="20" height="6" rx="3" fill="#231e26"/><path d="M100 40q6 16 0 32M106 34q9 22 0 44" stroke="#A9B7C2" stroke-width="3" fill="none" stroke-linecap="round"/>`),
  // Sahte Bilgi: iki yüzlü maske, arkasında boşluk
  sahte: () => wrap(`<path d="M34 50c0-16 12-24 26-24s26 8 26 24v24c0 18-12 30-26 30S34 92 34 74z" fill="#E9E2D3"/><path d="M60 26c14 0 26 8 26 24v24c0 18-12 30-26 30z" fill="#3C3442"/>
    <path d="M42 56q6-6 12 0" stroke="#231e26" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M66 56q6 6 12 0" stroke="#E9E2D3" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M44 80q8 8 16 0" stroke="#C2554E" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M60 80q8-8 16 0" stroke="#C2554E" stroke-width="3" fill="none" stroke-linecap="round"/>`),
  // Yorgunluk: eriyen bir mum
  yorgun: () => wrap(`<path d="M42 104V58c0-4 4-6 8-4 4-4 10-4 14 0 4-2 8 0 8 4v46z" fill="#EAD9B5"/><path d="M42 66c4 6 4 14 0 20M78 62c-4 8-4 16 0 22" stroke="#D2BD94" stroke-width="5" stroke-linecap="round"/>
    <path d="M60 50c-6-6-6-14 0-22 6 8 6 16 0 22z" fill="#E0954E"/><path d="M60 46c-3-3-3-7 0-11 3 4 3 8 0 11z" fill="#F2CF72"/>
    <path d="M50 76q4 3 8 0M62 76q4 3 8 0" stroke="#231e26" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M56 90h8" stroke="#8D7A5A" stroke-width="2.4" stroke-linecap="round"/>`),
  // Karmaşa: düğümlenmiş ip yumağı
  karmasa: () => wrap(`<circle cx="60" cy="72" r="28" fill="#C87A8A"/><path d="M36 60c16 10 34 10 48-2M34 78c18-8 36-6 52 6M44 50c4 18 4 36-2 48M62 44c-6 18-4 38 6 56M78 52c-10 14-12 32-6 46" stroke="#A55A6C" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${eye(52, 70, 3.2)}${eye(68, 70, 3.2)}<path d="M54 82q6-4 12 0" stroke="#231e26" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M86 74c10 4 14 14 8 22" stroke="#C87A8A" stroke-width="3" fill="none" stroke-linecap="round"/>`),
  // Kıskançlık: yeşil, uzun boyunlu, yan gözle bakan bir sürüngen
  kiskanc: () => wrap(`<path d="M30 104c-2-20 10-34 30-34s30 12 28 34z" fill="#6E9A64"/><path d="M60 72c-2-16 2-30 14-36" stroke="#6E9A64" stroke-width="12" fill="none" stroke-linecap="round"/>
    <ellipse cx="80" cy="34" rx="14" ry="10" fill="#86B27A"/><circle cx="84" cy="32" r="4.5" fill="#E9E2A0"/><circle cx="86" cy="32" r="2.4" fill="#231e26"/><path d="M90 40q4 1 6-2" stroke="#3F5E3A" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M40 86h8M56 90h8M72 86h8" stroke="#557E4C" stroke-width="3" stroke-linecap="round"/>`),

  // ---- bosslar ----
  bossSayfa: () => wrap(`<path d="M24 104V30l26-12 46 8v78z" fill="#F3EEE3"/><path d="M50 18v86" stroke="#D9D0BF" stroke-width="3"/><path d="M58 40h28M58 50h22M58 60h26" stroke="#E2D9C6" stroke-width="3" stroke-linecap="round"/>
    ${eye(36, 54, 4)}${eye(72, 76, 4)}<path d="M30 70q6 8 14 0" stroke="#231e26" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M64 90l8-6 8 6 8-6" stroke="#231e26" stroke-width="2.6" fill="none"/>`, ' data-boss="1"'),
  bossSaat: () => wrap(`<circle cx="60" cy="64" r="36" fill="#9C6B4E"/><circle cx="60" cy="64" r="28" fill="#F1E5CF"/><path d="M60 64V44M60 64l14 8" stroke="#231e26" stroke-width="4" stroke-linecap="round"/>
    ${Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return `<circle cx="${(60 + Math.cos(a) * 23).toFixed(1)}" cy="${(64 + Math.sin(a) * 23).toFixed(1)}" r="1.8" fill="#9C6B4E"/>`; }).join('')}
    <path d="M34 30l-10-10M86 30l10-10" stroke="#9C6B4E" stroke-width="7" stroke-linecap="round"/><path d="M40 98l-6 8M80 98l6 8" stroke="#7C5038" stroke-width="7" stroke-linecap="round"/>${eye(50, 54, 3)}${eye(70, 54, 3)}`, ' data-boss="1"'),
  bossSinav: () => wrap(`<path d="M20 104c4-30 20-48 44-50l-6-16 14 10 6-18 6 20c16 8 20 30 16 54z" fill="#5E7AA0"/><path d="M34 104c4-20 14-30 30-32 14 2 22 14 22 32z" fill="#7F99BC"/>
    <path d="M84 60l12-6-4 12z" fill="#E0C46A"/>${eye(76, 58, 4)}<path d="M64 74q10 8 22 2" stroke="#231e26" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M68 76l3 5 3-5 3 5 3-5" fill="#F3EEE3"/>
    <rect x="40" y="82" width="22" height="16" rx="2" fill="#F3EEE3"/><path d="M44 88h14M44 93h10" stroke="#5E7AA0" stroke-width="2"/>`, ' data-boss="1"'),
  bossGolge: () => wrap(`<path d="M28 104c0-40 12-70 32-80 20 10 32 40 32 80z" fill="#3D3448"/><path d="M60 24c10 8 18 24 20 44H40c2-20 10-36 20-44z" fill="#4E4460"/>
    <circle cx="51" cy="56" r="5" fill="#E8C66A"/><circle cx="69" cy="56" r="5" fill="#E8C66A"/><circle cx="51" cy="56" r="2" fill="#231e26"/><circle cx="69" cy="56" r="2" fill="#231e26"/>
    <path d="M30 80c-10-4-14-14-8-22M90 80c10-4 14-14 8-22" stroke="#3D3448" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M50 74q10 6 20 0" stroke="#E8C66A" stroke-width="2.4" fill="none" stroke-linecap="round"/>`, ' data-boss="1"'),
  bossBilinmez: () => wrap(`<circle cx="60" cy="62" r="40" fill="#24203A"/><circle cx="60" cy="62" r="40" fill="none" stroke="#6E5FA8" stroke-width="3" stroke-dasharray="4 7"/>
    <circle cx="46" cy="48" r="1.6" fill="#fff"/><circle cx="78" cy="40" r="1.2" fill="#fff"/><circle cx="84" cy="74" r="1.8" fill="#fff"/><circle cx="36" cy="80" r="1.2" fill="#fff"/>
    <path d="M44 62q8-8 16 0t16 0" stroke="#B9A9F2" stroke-width="3.2" fill="none" stroke-linecap="round"/><circle cx="60" cy="62" r="6" fill="#B9A9F2"/><circle cx="60" cy="62" r="2.6" fill="#24203A"/>`, ' data-boss="1"'),
  bossSonsuz: () => wrap(`<path d="M24 64c0-16 14-26 26-14l10 12 10-12c12-12 26-2 26 14s-14 26-26 14L60 66 50 78C38 90 24 80 24 64z" fill="#B5544E"/><path d="M34 64c0-8 8-12 14-6l8 8-8 8c-6 6-14 0-14-10zM86 64c0 8-8 12-14 6l-8-8 8-8c6-6 14-2 14 10z" fill="#E7B35B"/>
    ${eye(42, 64, 3.4)}${eye(78, 64, 3.4)}<path d="M60 40v-14M48 44l-8-10M72 44l8-10" stroke="#B5544E" stroke-width="5" stroke-linecap="round"/><path d="M50 98l10-14 10 14" fill="#8E3D38"/>`, ' data-boss="1"'),
};

export const MONSTERS = {
  erteleme: { name: 'Erteleme', type: 'tas', base: { hp: 120, atk: 13, def: 17, spd: 6 }, desc: 'Yarın der, hep yarın. Ağırdır, zor devrilir.' },
  unutkan: { name: 'Unutkan Güve', type: 'ruzgar', base: { hp: 85, atk: 15, def: 10, spd: 17 }, desc: 'Kanatlarındaki harfleri silerek uçar.' },
  dagin: { name: 'Dağınık', type: 'ates', base: { hp: 90, atk: 17, def: 9, spd: 18 }, desc: 'Her yere bakar, hiçbir şeyi görmez.' },
  kibir: { name: 'Kibir', type: 'ruh', base: { hp: 95, atk: 18, def: 12, spd: 13 }, desc: 'Her şeyi bildiğini sanır; öğrenmeye yer bırakmaz.' },
  suphe: { name: 'Şüphe Sisi', type: 'ruh', base: { hp: 100, atk: 14, def: 14, spd: 12 }, desc: 'Her cevabın üstüne sis çöker.' },
  kaygi: { name: 'Kaygı', type: 'ates', base: { hp: 88, atk: 19, def: 10, spd: 15 }, desc: 'Dikenlerini sınavdan önceki gece büyütür.' },
  ezber: { name: 'Ezberci', type: 'ruzgar', base: { hp: 92, atk: 15, def: 11, spd: 16 }, desc: 'Söylediğini anlamadan tekrar eder.' },
  gurultu: { name: 'Gürültü', type: 'tas', base: { hp: 105, atk: 16, def: 15, spd: 9 }, desc: 'Odaklanmayı titreşimle dağıtır.' },
  sahte: { name: 'Sahte Bilgi', type: 'ruh', base: { hp: 90, atk: 17, def: 11, spd: 14 }, desc: 'İki yüzlüdür: biri gerçek gibi görünür.' },
  yorgun: { name: 'Yorgunluk', type: 'ates', base: { hp: 100, atk: 13, def: 13, spd: 8 }, desc: 'Eridikçe herkesi eritir.' },
  karmasa: { name: 'Karmaşa', type: 'doga', base: { hp: 105, atk: 15, def: 13, spd: 11 }, desc: 'Düğümlerini çözene kadar sarılır.' },
  kiskanc: { name: 'Kıskançlık', type: 'doga', base: { hp: 95, atk: 16, def: 12, spd: 13 }, desc: 'Başkasının cevabına yan gözle bakar.' },
  // bosslar: her evrim kapısında bir tane; sonrası yıldız bossu
  bossSayfa: { name: 'Boş Sayfa', type: 'ruzgar', role: 'tank', boss: 1, base: { hp: 150, atk: 14, def: 15, spd: 9 }, desc: 'Başlamak için yazılması gereken ilk satırı bekler.' },
  bossSaat: { name: 'Son Gün', type: 'tas', role: 'melee', boss: 2, base: { hp: 170, atk: 17, def: 16, spd: 10 }, desc: 'Teslim tarihi. Her tur daha yüksek sesle tıkırdar.' },
  bossSinav: { name: 'Sınav Ejderi', type: 'su', role: 'magician', boss: 3, base: { hp: 180, atk: 19, def: 15, spd: 12 }, desc: 'Soruları ateş gibi püskürtür, cevapları ister.' },
  bossGolge: { name: 'Gölge Hoca', type: 'ruh', role: 'trickster', boss: 4, base: { hp: 190, atk: 16, def: 16, spd: 15 }, desc: 'Saldırmaz; seni kendinden şüphe etmeye ikna eder.' },
  bossBilinmez: { name: 'Bilinmezlik', type: 'su', role: 'magician', boss: 5, base: { hp: 210, atk: 21, def: 17, spd: 13 }, desc: 'Ne kadar bilirsen bil, bilinmeyenin sonsuz olduğunu hatırlatır.' },
  bossSonsuz: { name: 'Sonsuz Soru', type: 'ates', role: 'assassin', boss: 6, base: { hp: 220, atk: 22, def: 16, spd: 16 }, desc: 'Her cevaptan yeni bir soru doğurur. Yıldız kapısının bekçisi.' },
};
export const COMMON = Object.keys(MONSTERS).filter(k => !MONSTERS[k].boss);
export const BOSS_FOR_STAGE = ['bossSayfa', 'bossSaat', 'bossSinav', 'bossGolge', 'bossBilinmez', 'bossSonsuz'];
export function monsterSVG(id) { return (ART[id] || ART.erteleme)(); }
