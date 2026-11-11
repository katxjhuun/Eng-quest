// Duyuru şeridindeki dam-la dünyasının sanal oyuncuları.
// Her birinin bir peti, türü ve hızı var; başarıları zamana göre üretilir (tohumlu), böylece herkes aynı anda aynı duyuruyu görür.
// Şeritte gerçek duyurulardan farkları yoktur; duyuruya dokununca açılan pencerede ve Ayarlar › Veri bölümünde sanal oldukları yazar.
const SP = ['plant', 'chick', 'cat', 'dog', 'owl', 'gecko', 'whale', 'doodle', 'goat'];
// gerçek oyuncuların koyduğu türden adlar
const NAMES = [
  'pamukk', 'Mırmır🐾', 'boncuk.', 'kara_kedi34', 'tarçınım', 'Duman', 'MİNNAK', 'zeyd’in kedisi', 'bıdık', 'fındık<3', 'Loki', 'mia🐱', 'Kontes',
  'karamel_', 'Paşamm', 'gece', 'şirin', 'Odin', 'cicik', 'Bulut ☁️', 'Mocha', 'ponçik', 'Sarman', 'tospik', 'zeytin', 'kuki', 'Lokum',
  'ElifinKuşu', 'beyaz diş', 'Simba', 'mavişş', 'Nohut', 'kızıl', 'Tontiş', 'pofuduk', 'Rüzgar', 'leo07', 'Badem', 'yumoş', 'Kahve',
  'patates', 'Gölge', 'çakıl', 'Misket', 'aslanım', 'turşu', 'Bamsı', 'minik', 'Fıstık2', 'kömür', 'Luna', 'Çıtır', 'sütlaç', 'Zıpzıp',
];
function rng(n) { let a = n >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const PLAYERS = NAMES.map((name, i) => { const r = rng(9001 + i * 7919); return { name, species: SP[Math.floor(r() * SP.length)], coat: Math.floor(r() * 8), base: Math.floor(r() * 4), speed: 0.5 + r() }; });
const LEVELS = ['A2', 'B1', 'B2', 'C1'];
const SLOT = 25 * 60 * 1000; // her 25 dakikalık dilimde en çok bir sanal duyuru

// son `days` gün içindeki sanal duyurular
export function npcFeed(now = Date.now(), days = 3) {
  const out = [];
  const end = Math.floor(now / SLOT), start = end - Math.floor(days * 864e5 / SLOT);
  for (let s = start; s <= end; s++) {
    const r = rng(s * 2654435761);
    const hour = new Date(s * SLOT + 3 * 3600e3).getUTCHours();
    const busy = hour >= 9 && hour < 24 ? 0.62 : 0.12;   // gece sessiz
    if (r() > busy) continue;
    const at = s * SLOT + Math.floor(r() * SLOT);
    if (at > now) continue;
    const p = PLAYERS[Math.floor(r() * PLAYERS.length)];
    const k = r();
    // seyrek: nadir form ve son form; sık: seviye, boss, yıldız
    const kind = k < 0.04 ? 'shiny' : k < 0.08 ? 'maxevo' : k < 0.1 ? 'maxlevel' : k < 0.48 ? 'level' : k < 0.78 ? 'boss' : 'stars';
    const stage = kind === 'maxevo' ? 5 : Math.min(5, p.base + Math.floor(r() * 3));
    const e = { id: 'n' + s, npc: true, kind, tier: { shiny: 3, maxevo: 3, maxlevel: 3, level: 1, boss: 2, stars: 2 }[kind], at, name: p.name, species: p.species, coat: p.coat, stage, shiny: kind === 'shiny' || r() < 0.05 };
    if (kind === 'level') e.level = LEVELS[Math.floor(r() * LEVELS.length)];
    if (kind === 'maxlevel') e.level = 'C2';
    if (kind === 'stars') e.stars = 5 * (1 + Math.floor(r() * 12));
    out.push(e);
  }
  return out;
}
