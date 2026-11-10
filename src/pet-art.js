// dam-la petleri — tamamen özgün, kodla çizilmiş SVG karakterler.
// türler × 6 evrim aşaması. Çizim ve animasyon src/pets/ altındaki iskeletlerden gelir:
//   pets/quad.js  — kedi, köpek (yandan, dört ayaklı siluet)
//   pets/bean.js  — civciv, bitki (öne bakan yuvarlak gövde)
//   pets/puppet.js — canlı oynatıcı + statik çizim
// Bu dosya tür bilgilerini ve statik çizim kapısını (petSVG) dışarı açar; panel ve yönetici paneli bunu kullanır.
import { staticSVG } from './pets/figure.js';
import { retro } from './pets/anim.js';

const SPECIES = {
  chick: { label: 'Civciv', home: 'nest', stages: ['Yumurtacık', 'Pıtırcık', 'Tombiş', 'Kanatçık', 'Tavus Yavrusu', 'Tavus Kuşu'] },
  plant: { label: 'Bitki', home: 'sill', stages: ['Tohumcuk', 'Filizcik', 'Papatya', 'Lale', 'Kaktüs', 'Ulu Ağaç'] },
  cat: { label: 'Kedi', home: 'cushion', quad: true, stages: ['Minnoş', 'Tekir', 'Vaşak', 'Puma', 'Leopar', 'Kara Panter'] },
  dog: { label: 'Köpek', home: 'house', quad: true, stages: ['Tosbik', 'Hav', 'Çoban', 'Genç Kurt', 'Kurt', 'Alfa Kurt'] },
  owl: { label: 'Baykuş', home: 'branch', stages: ['Tüy Yumağı', 'Yavru Baykuş', 'Kukumav', 'Peçeli', 'Puhu', 'Gece Bekçisi'] },
  gecko: { label: 'Gecko', home: 'rock', stages: ['Kıpır', 'Duvar Gezgini', 'Benekli', 'Taş Kertenkelesi', 'Bukalemun', 'Sessiz Ejder'] },
  whale: { label: 'Balina', home: 'wave', stages: ['Yavru Balina', 'Dalgıç', 'Şarkıcı', 'Derin Gezgin', 'Okyanus Keşişi', 'Kadim Balina'] },
  doodle: { label: 'Doodle', home: 'pillow', stages: ['Leke', 'Yumru', 'Bodur', 'Karalama', 'Ağır Yumru', 'Sessiz Oda'] },
  goat: { label: 'Keçi', home: 'hay', stages: ['Oğlak', 'Kuzucuk', 'Ak Keçi', 'Boynuzlu', 'Dağ Keçisi', 'Günah Keçisi'] },
};

// Statik çizim. opts: { mood, pose ('stand'|'sit'|'loaf'|'flat'…), belly (0..1), look, coat, clip, u }
export function petSVG(species, stage, opts = {}) {
  if (!Object.prototype.hasOwnProperty.call(SPECIES, species)) species = 'chick';
  stage = Math.max(0, Math.min(5, stage | 0));
  const quad = SPECIES[species].quad;
  return staticSVG(species, stage, { ...opts, cls: quad ? `quad q-${species}` : '' });
}

export const PET_SPECIES = SPECIES;
export function speciesList() { return Object.keys(SPECIES); }
export function stageName(species, stage) { return (Object.prototype.hasOwnProperty.call(SPECIES, species) ? SPECIES[species] : SPECIES.chick).stages[Math.max(0, Math.min(5, stage | 0))]; }

// tüy rengi: kedi ve köpeğe sahiplenirken rastgele atanır (kullanıcı seçemez)
export const COAT_COUNT = 8;
export function randomCoat() { return Math.floor(Math.random() * COAT_COUNT); }
// kayıtta renk yoksa addan türetilir (yönetici paneli gibi rengi bilmeyen yerler için)
export function coatFromName(name = '') { let h = 0; for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h % COAT_COUNT; }

const P = (d, a) => `<path d="${d}" ${a}/>`;
const ln = (c, w) => `fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
// Yaşam alanı süsleri (pet evdeyken arkasında görünür)
export function homeSVG(species) {
  const h = (Object.prototype.hasOwnProperty.call(SPECIES, species) ? SPECIES[species] : SPECIES.chick).home;
  const body = {
    // naif çizimli yuvalar: dikiş izleri, desen, el çizimi süs
    nest: P('M12 98 C18 116 102 116 108 98 C96 108 24 108 12 98 Z', 'fill="#C4AA8C"') + P('M16 99 C40 92 80 92 104 99', ln('#8C6A48', 2)) + P('M20 103 l10 -4 M34 106 l12 -5 M52 107 l12 -6 M70 106 l12 -5 M86 103 l10 -4 M26 108 l-8 -6 M98 108 l8 -6', ln('#7A5A3C', 1.2)) + P('M8 98 l6 -3 M112 98 l-6 -3 M30 96 l-4 -5 M92 96 l4 -5', ln('#8C6A48', 1.1)),
    pot: P('M26 94 L94 94 L88 117 L32 117 Z', 'fill="#C2553D"') + P('M21 87 L99 87 L99 95 L21 95 Z', 'fill="#D9773F"') + P('M34 102 L86 102 M36 109 L84 109', ln('#F1E4C8', 1.6)) + P('M44 105.5 a1.4 1.4 0 1 0 0.1 0 M60 105.5 a1.4 1.4 0 1 0 0.1 0 M76 105.5 a1.4 1.4 0 1 0 0.1 0', 'fill="#E2A93B"'),
    cushion: P('M8 106 C8 94 112 94 112 106 C112 117 8 117 8 106 Z', 'fill="#3E6A9E"') + P('M14 104 C34 99 86 99 106 104', 'fill="none" stroke="#F1E4C8" stroke-width="1.1" stroke-dasharray="2.4 2"') + P('M20 108 a1.6 1.6 0 1 0 0.1 0 M40 110 a1.6 1.6 0 1 0 0.1 0 M60 110.5 a1.6 1.6 0 1 0 0.1 0 M80 110 a1.6 1.6 0 1 0 0.1 0 M100 108 a1.6 1.6 0 1 0 0.1 0', 'fill="#E2A93B"') + P('M8 106 l-5 3 M8 106 l-4 6 M112 106 l5 3 M112 106 l4 6', ln('#C8553D', 1.4)),
    rock: P('M10 112 C10 100 28 92 52 93 C72 94 80 100 82 112 Z', 'fill="#A39787"') + P('M68 112 C70 104 84 100 98 102 C106 103 110 107 110 112 Z', 'fill="#B9AC98"') + P('M24 100 C34 96 46 95 58 97 M30 105 l6 -1 M50 104 l8 0', ln('#6E6458', 1.3)) + P('M30 95 C36 90 44 90 50 93 C44 95 36 96 30 95 Z', 'fill="#8FA876"'),
    branch: P('M4 104 C30 99 70 101 116 95', ln('#7E5A3C', 6)) + P('M14 103 l8 -1 M40 101 l10 0 M70 100 l9 -1', ln('#5A3E2C', 1)) + P('M84 99 C90 90 99 88 106 89 C100 95 92 98 84 99 Z', 'fill="#8FA876"') + P('M86 98 L103 90', ln('#4E6B3A', 0.8)) + P('M22 102 C17 95 10 94 5 95 C10 100 15 102 22 102 Z', 'fill="#B5A23C"') + P('M58 100 C60 93 66 90 71 90 C69 95 64 99 58 100 Z', 'fill="#8FA876"'),
    sill: P('M8 104 L112 104 L112 112 L8 112 Z', 'fill="#A07850"') + P('M8 104 L112 104 L108 100 L12 100 Z', 'fill="#C09468"') + P('M18 112 L18 120 M102 112 L102 120', ln('#7E5A3C', 3)),
    wave: P('M6 108 C20 98 34 98 48 106 C62 114 76 114 90 106 C100 100 108 100 114 104 L114 116 L6 116 Z', 'fill="#6A86A0"') + P('M10 106 C22 100 32 100 44 106 M60 110 C70 104 80 104 90 108', ln('#D8E2EA', 1.6)),
    pillow: P('M14 102 C14 92 106 92 106 102 C108 112 104 116 96 116 L24 116 C16 116 12 112 14 102 Z', 'fill="#5A5468"') + P('M22 100 C40 96 80 96 98 100', ln('#787088', 1.4)) + P('M14 104 l-6 -2 M106 104 l6 -2', ln('#5A5468', 2)),
    hay: P('M20 92 L100 92 L104 116 L16 116 Z', 'fill="#D9B95E"') + P('M28 96 l-2 18 M44 96 l-1 18 M60 96 v18 M76 96 l1 18 M92 96 l2 18', ln('#B8963E', 1.4)) + P('M18 102 L102 102 M17 110 L103 110', ln('#8A5A3A', 2)),
    house: P('M84 112 L84 80 L100 67 L116 80 L116 112 Z', 'fill="#E2C89A"') + P('M80 82 L100 63 L120 82', ln('#C8553D', 4)) + P('M93 112 L93 97 C93 90 107 90 107 97 L107 112 Z', 'fill="#3a3340"') + P('M88 86 l6 0 M88 90 l6 0 M106 86 l6 0', ln('#A0784C', 1)),
  }[h] || '';
  // petlerle aynı dil: retro baskı mürekkepleri, ince titrek kontur
  const inked = body.replace(/#[0-9A-Fa-f]{6}/g, c => retro(c)).replace(/fill="(#[0-9a-f]{6})"/gi, 'fill="$1" stroke="#2A2230" stroke-width="1.05" stroke-linejoin="round" vector-effect="non-scaling-stroke"');
  return `<svg class="pet-home-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><filter id="homeInk" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G"/></filter></defs><g filter="url(#homeInk)">${inked}</g></svg>`;
}
