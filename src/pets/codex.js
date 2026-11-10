// dam-la — pet ansiklopedisi verisi: tipler (taş-kâğıt-makas üstünlük döngüsü), roller, savaş değerleri,
// imza hamleleri, nadir (parlak) formlar ve petlerin kendi bakışından ipuçları. Savaş motoru da buradan okur.

// ---- tipler: her tip birini yener, birine yenilir, diğerlerine nötrdür (iki üçgen) ----
export const TYPES = {
  ates: { name: 'Ateş', icon: '🔥', color: '#E0703A' },
  doga: { name: 'Doğa', icon: '🌿', color: '#6FA25A' },
  su: { name: 'Su', icon: '💧', color: '#4E8FC4' },
  tas: { name: 'Taş', icon: '🪨', color: '#9A8B78' },
  ruzgar: { name: 'Rüzgâr', icon: '🌪️', color: '#8FB9B2' },
  ruh: { name: 'Ruh', icon: '👁️', color: '#8A6FB8' },
};
// a → b: a, b'ye karşı güçlü
export const BEATS = { ates: 'doga', doga: 'su', su: 'ates', tas: 'ruzgar', ruzgar: 'ruh', ruh: 'tas' };
export function typeMult(att, def) {
  if (!att || !def) return 1;
  if (BEATS[att] === def) return 1.5;
  if (BEATS[def] === att) return 0.67;
  return 1;
}

export const SPECIES_TYPE = { plant: 'doga', chick: 'ruzgar', cat: 'ates', dog: 'tas', owl: 'ruh', gecko: 'ates', whale: 'su', doodle: 'tas', goat: 'ruh' };

// ---- roller: pet ilk seçildiğinde ve her evrimde rastgele değişir ----
export const ROLES = {
  tank: { name: 'Tank', icon: '🛡️', desc: 'Darbeleri üstüne çeker, takımı korur. Yüksek can ve savunma, yavaş.', mult: { hp: 1.5, atk: 0.8, def: 1.4, spd: 0.7 },
    moves: [
      { id: 'bash', name: 'Omuz Darbesi', kind: 'attack', power: 0.9, desc: 'Sağlam, sıradan bir vuruş.' },
      { id: 'taunt', name: 'Kalkan Duruşu', kind: 'guard', turns: 2, desc: '2 tur boyunca düşman saldırılarını üstüne çeker, aldığı hasar azalır.' },
      { id: 'endure', name: 'Sarsılmaz', kind: 'heal', self: 0.22, cd: 3, desc: 'Canının %22’sini geri kazanır.' },
    ] },
  melee: { name: 'Yakın dövüşçü', icon: '⚔️', desc: 'Göğüs göğüse çarpışır; güçlü ve dengeli.', mult: { hp: 1.15, atk: 1.25, def: 1.0, spd: 1.0 },
    moves: [
      { id: 'strike', name: 'Sert Vuruş', kind: 'attack', power: 1.2, desc: 'Güçlü yakın saldırı.' },
      { id: 'rage', name: 'Hiddet', kind: 'attack', power: 1.7, recoil: 0.1, cd: 2, desc: 'Çok güçlü ama kendi canından %10 götürür.' },
      { id: 'break', name: 'Savunma Kır', kind: 'attack', power: 0.8, debuff: 'def', desc: 'Hedefin savunmasını 2 tur düşürür.' },
    ] },
  ranger: { name: 'Nişancı', icon: '🏹', desc: 'Uzaktan, hiç ıskalamadan vurur; birden çok hedefe yayılabilir.', mult: { hp: 0.95, atk: 1.1, def: 0.9, spd: 1.15 },
    moves: [
      { id: 'shot', name: 'Uzak Atış', kind: 'attack', power: 1.0, sure: true, desc: 'Asla ıskalamaz, kaçışı deler.' },
      { id: 'volley', name: 'Ok Yağmuru', kind: 'attack', power: 0.6, aoe: true, cd: 2, desc: 'Bütün düşmanlara vurur.' },
      { id: 'aim', name: 'Nişan Al', kind: 'buff', buff: 'focus', desc: 'Bir sonraki saldırısı iki kat güçlü olur.' },
    ] },
  assassin: { name: 'Suikastçı', icon: '🗡️', desc: 'Hızlı ve ölümcül; zayıflayanı bitirir, kritik vurur.', mult: { hp: 0.85, atk: 1.35, def: 0.8, spd: 1.35 },
    moves: [
      { id: 'shade', name: 'Gölgeden', kind: 'attack', power: 1.1, crit: 0.4, desc: '%40 olasılıkla kritik (×1,8) vurur.' },
      { id: 'finish', name: 'Zayıfı Bitir', kind: 'attack', power: 0.9, execute: 0.35, desc: 'Hedefin canı %35’in altındaysa iki kat vurur.' },
      { id: 'vanish', name: 'Kaybol', kind: 'buff', buff: 'dodge', cd: 3, desc: 'Bir sonraki saldırıdan tamamen kaçar.' },
    ] },
  support: { name: 'Destek', icon: '✚', desc: 'Takımı iyileştirir ve güçlendirir.', mult: { hp: 1.05, atk: 0.8, def: 1.1, spd: 1.05 },
    moves: [
      { id: 'mend', name: 'İyileştir', kind: 'heal', ally: 0.32, desc: 'Bir takım arkadaşının canının %32’sini yeniler.' },
      { id: 'cheer', name: 'Moral', kind: 'buff', buff: 'atk', ally: true, desc: 'Bir takım arkadaşının saldırısını 2 tur artırır.' },
      { id: 'pulse', name: 'Arınma', kind: 'heal', team: 0.14, cd: 2, desc: 'Bütün takımı %14 iyileştirir, olumsuz etkileri siler.' },
    ] },
  magician: { name: 'Büyücü', icon: '✦', desc: 'Savunmayı delen büyüler ve lanetler; tip üstünlüğünden en çok o yararlanır.', mult: { hp: 0.9, atk: 1.3, def: 0.85, spd: 1.0 },
    moves: [
      { id: 'bolt', name: 'Büyü Oku', kind: 'attack', power: 1.15, pierce: 0.5, desc: 'Hedefin savunmasının yarısını yok sayar.' },
      { id: 'wave', name: 'Element Dalgası', kind: 'attack', power: 0.7, aoe: true, typeBoost: true, cd: 2, desc: 'Bütün düşmanlara; tip üstünlüğü iki kat etkili.' },
      { id: 'hex', name: 'Lanet', kind: 'attack', power: 0.4, debuff: 'atk', dot: 0.06, desc: 'Hedefin saldırısını düşürür, 3 tur yakar.' },
    ] },
  trickster: { name: 'Hilebaz', icon: '🎭', desc: 'Saldırmaz; rakibini okur, güvenini kazanır ve ikna eder. Doğru argüman güven biriktirir, yanlışı rakibi inatlaştırır. İsabetli argüman rakibi tereddüde düşürür. Güven en az 2 iken ikna olan rakip bir süre senin safında savaşır.', mult: { hp: 1.1, atk: 0, def: 1.05, spd: 1.2 },
    moves: [
      { id: 'logic', name: 'Mantık', kind: 'talk', arg: 'logic', desc: 'Kanıt ve çelişki. Şüpheciye işler, kibirli bunu hakaret sayar.' },
      { id: 'flatter', name: 'Övgü', kind: 'talk', arg: 'flatter', desc: 'Gururu okşar. Kibirliye işler, öfkeli bunu alay sanar.' },
      { id: 'feel', name: 'Duygu', kind: 'talk', arg: 'feel', desc: 'İçine dokunur. Kırılgana işler, şüpheci bunu oyun sanar.' },
      { id: 'humor', name: 'Şaka', kind: 'talk', arg: 'humor', desc: 'Gerginliği kırar. Öfkeliye işler, kırılgan bunu ciddiye alınmamak sanar.' },
      { id: 'read', name: 'Oku', kind: 'read', desc: 'Rakibin gerçek tavrını ve bir sonraki turdaki tavrını görür (2 tur geçerli). Blöfü bozar.' },
      { id: 'confuse', name: 'Kafa Karıştır', kind: 'confuse', cd: 3, desc: 'Rakibin bir sonraki hamlesi yarı yarıya boşa gider ya da kendi takımına döner.' },
      { id: 'close', name: 'Son Söz', kind: 'talk', closing: true, cd: 3, desc: 'Biriken güveni tek seferde harcar: güven ne kadar yüksekse o kadar ağır. Güven yoksa geri teper.' },
    ] },
};
export const ROLE_IDS = Object.keys(ROLES);
// hilebazın karşısındaki rakibin o turdaki tavrı → hangi argüman işler
export const STANCES = {
  skeptic: { name: 'Şüpheci', icon: '🤨', weak: 'logic', resist: 'feel', line: 'Kanıtla bakalım.', tells: ['Kanıtla bakalım.', 'Bunu nereden çıkardın?', 'Hiç inandırıcı değil.'] },
  proud: { name: 'Kibirli', icon: '😤', weak: 'flatter', resist: 'logic', line: 'Benden üstün kimse yok.', tells: ['Benden üstün kimse yok.', 'Sen kim oluyorsun?', 'Bana ders mi vereceksin?'] },
  fragile: { name: 'Kırılgan', icon: '🥺', weak: 'feel', resist: 'humor', line: 'Kimse beni anlamıyor…', tells: ['Kimse beni anlamıyor…', 'Hep ben mi suçluyum?', 'Bırak beni…'] },
  angry: { name: 'Öfkeli', icon: '😠', weak: 'humor', resist: 'flatter', line: 'Sabrımı zorlama!', tells: ['Sabrımı zorlama!', 'Yeter artık!', 'Daha fazla dayanamam!'] },
};
export const ARGS = { logic: 'Mantık', flatter: 'Övgü', feel: 'Duygu', humor: 'Şaka' };

// ---- türlerin temel savaş değerleri (evre, yıldız, rol ve parlaklıkla çarpılır) ----
export const BASE = {
  plant: { hp: 100, atk: 14, def: 16, spd: 8 },
  chick: { hp: 90, atk: 15, def: 10, spd: 18 },
  cat: { hp: 95, atk: 18, def: 11, spd: 17 },
  dog: { hp: 110, atk: 17, def: 14, spd: 12 },
  owl: { hp: 100, atk: 16, def: 12, spd: 15 },
  gecko: { hp: 100, atk: 16, def: 13, spd: 14 },
  whale: { hp: 130, atk: 17, def: 15, spd: 8 },
  doodle: { hp: 105, atk: 14, def: 16, spd: 10 },
  goat: { hp: 105, atk: 16, def: 13, spd: 12 },
};

// ---- imza hamleleri: türün kendi yeteneğinin savaştaki karşılığı (3 tur bekleme) ----
export const SIGNATURE = {
  plant: { id: 'weed', name: 'Ayıkla', kind: 'attack', power: 1.0, cleanse: true, cd: 3, desc: 'Vurur ve hedefin güçlendirmelerini söker.' },
  chick: { id: 'peek', name: 'Cik Çığlığı', kind: 'buff', buff: 'spd', team: true, cd: 3, desc: 'Bütün takımın hızını artırır.' },
  cat: { id: 'skip', name: 'Pati Atla', kind: 'attack', power: 1.0, then: 'dodge', cd: 3, desc: 'Vurur ve bir sonraki saldırıdan kaçar.' },
  dog: { id: 'sniff', name: 'İz Sür', kind: 'attack', power: 1.1, sure: true, guardAlly: true, cd: 3, desc: 'Iskalamaz; en zayıf takım arkadaşını bir tur korur.' },
  owl: { id: 'ward', name: 'Dört Tur Önde', kind: 'buff', buff: 'ward', team: true, cd: 4, desc: 'Takımın aldığı hasar 2 tur yarıya iner.' },
  gecko: { id: 'prey', name: 'Av Ona Gelir', kind: 'buff', buff: 'focus', counter: true, cd: 3, desc: 'Bekler; bir sonraki saldırısı iki kat, bu tur vurana karşılık verir.' },
  whale: { id: 'dive', name: 'Bilinmeyene Dal', kind: 'dive', power: 1.9, cd: 3, desc: 'Bir tur derine dalar (vurulamaz), sonra yüzeye çıkıp ağır vurur.' },
  doodle: { id: 'replay', name: 'Aynı Satranç', kind: 'replay', cd: 3, desc: 'Takımın son hamlesini bir kez daha oynar.' },
  goat: { id: 'mirror', name: 'Ayna', kind: 'buff', buff: 'mirror', cd: 3, desc: 'Gelecek darbenin yarısını saldırana geri yansıtır.' },
};

// ---- nadir (parlak) form: evrimde küçük bir şansla gelir, kalıcıdır ----
export const SHINY_CHANCE = 1 / 12;
export const SHINY = {
  // her türe kendi renk kayması
  hue: { plant: 160, chick: 200, cat: 150, dog: 190, owl: 120, gecko: 250, whale: 300, doodle: 210, goat: 40 },
  name: { plant: 'Ay Filizi', chick: 'Gök Civcivi', cat: 'Yakut Kedi', dog: 'Ay Kurdu', owl: 'Şafak Baykuşu', gecko: 'Mor Süzgeç', whale: 'Gül Balinası', doodle: 'Buz Bodur', goat: 'Altın Keçi' },
  perks: ['Savaşta bütün değerler +%15', 'Can, mama ve enerji üst sınırı +%10', 'Doğru cevaplardan +%10 XP'],
};

// ---- petin kendi bakışından ipuçları: cevabı vermez, yönünü gösterir ----
// h: { first, last, letters, words, wrongOpts, style }
export const HINT_VOICE = {
  plant: [h => `Acele etme. Kök yavaş büyür: cevap ${h.words > 1 ? `${h.words} kelime` : `${h.letters} harf`}.`, h => h.wrongOpts[0] && `Her filiz çiçek açmaz. “${h.wrongOpts[0]}” solacak olanlardan.`],
  chick: [h => `Cik! Bence “${h.first.toLocaleUpperCase('tr')}” ile başlıyor! Belki. Bilmem.`, h => `Cik cik… ${h.letters} tane harf saydım!`],
  cat: [h => `Biliyorum ama hepsini söylemem. İlk harfi ${h.first.toLocaleUpperCase('tr')}. Şimdilik bu kadar.`, h => h.wrongOpts[0] && `“${h.wrongOpts[0]}” mi? Lütfen. Ona bakmaya bile tenezzül etmem.`],
  dog: [h => h.wrongOpts[0] && `Seni yanlış yola sokmam: “${h.wrongOpts[0]}” değil. Gerisi sende.`, h => `Yanındayım. İzi sürdüm: “${h.first.toLocaleUpperCase('tr')}” ile başlıyor.`],
  owl: [h => `Dört hamle önden bak: ${h.words > 1 ? `${h.words} kelimelik` : `${h.letters} harflik`} bir cevap arıyorsun.`, h => h.wrongOpts.length >= 2 && `Strateji eleyerek kurulur. “${h.wrongOpts[0]}” ve “${h.wrongOpts[1]}” tuzak.`],
  gecko: [h => `Kovalama. Av gelir. “…${h.last}” diye biten bir şey bekliyorum.`, h => h.wrongOpts[0] && `Güneş yakar, ben kıpırdamam. “${h.wrongOpts[0]}” gölge, gerçek değil.`],
  whale: [h => `Derinden bir yankı geliyor… ${h.letters} harf. Gerisi karanlık.`, h => `Belki de soru, cevaptan daha anlamlıdır. Yine de: “${h.first.toLocaleUpperCase('tr')}…”`],
  doodle: [h => h.wrongOpts[0] && `Fark etmez. Ama “${h.wrongOpts[0]}” değil. Peki.`, h => `Bu oyunu oynamıştım. Sonu “${h.last}” ile bitiyordu.`],
  goat: [h => `Aynaya bak: sondan başa, son harf “${h.last}”.`, h => h.wrongOpts[0] && `Suçu “${h.wrongOpts[0]}” üstlensin. O değil.`],
};

// petin ruh yazısını seviye atlamalarında okunacak kısa parçalara böler
export function loreParts(soul) {
  return String(soul || '').split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean);
}

// bir petin anlık savaş değerleri
export function battleStats(species, stage = 0, stars = 0, role = 'melee', shiny = false) {
  const b = BASE[species] || BASE.dog, m = ROLES[role]?.mult || ROLES.melee.mult;
  const k = (1 + 0.2 * stage) * (1 + Math.min(stars, 20) * 0.02) * (shiny ? 1.15 : 1);
  const r = v => Math.max(1, Math.round(v));
  return { hp: r(b.hp * m.hp * k), atk: r(b.atk * (m.atk || 0.6) * k), def: r(b.def * m.def * k), spd: r(b.spd * m.spd * (1 + 0.05 * stage)) };
}
export function randomRole(prev) {
  const pool = ROLE_IDS.filter(r => r !== prev);
  return pool[Math.floor(Math.random() * pool.length)];
}
