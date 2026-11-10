// dam-la petleri — tamamen özgün, kodla çizilmiş SVG karakterler.
// türler × 6 evrim aşaması. Çizim ve animasyon src/pets/ altındaki iskeletlerden gelir:
//   pets/quad.js  — kedi, köpek (yandan, dört ayaklı siluet)
//   pets/bean.js  — civciv, bitki (öne bakan yuvarlak gövde)
//   pets/puppet.js — canlı oynatıcı + statik çizim
// Bu dosya tür bilgilerini ve statik çizim kapısını (petSVG) dışarı açar; panel ve yönetici paneli bunu kullanır.
import { staticSVG } from './pets/puppet.js';

const SPECIES = {
  chick: { label: 'Civciv', home: 'nest', stages: ['Yumurtacık', 'Pıtırcık', 'Tombiş', 'Kanatçık', 'Tavus Yavrusu', 'Tavus Kuşu'] },
  plant: { label: 'Bitki', home: 'pot', stages: ['Tohumcuk', 'Filizcik', 'Papatya', 'Lale', 'Kaktüs', 'Ulu Ağaç'] },
  cat: { label: 'Kedi', home: 'cushion', quad: true, stages: ['Minnoş', 'Tekir', 'Vaşak', 'Puma', 'Leopar', 'Kara Panter'] },
  dog: { label: 'Köpek', home: 'house', quad: true, stages: ['Tosbik', 'Hav', 'Çoban', 'Genç Kurt', 'Kurt', 'Alfa Kurt'] },
  owl: { label: 'Baykuş', home: 'branch', stages: ['Tüy Yumağı', 'Yavru Baykuş', 'Kukumav', 'Peçeli', 'Puhu', 'Gece Bekçisi'] },
  gecko: { label: 'Gecko', home: 'rock', stages: ['Kıpır', 'Duvar Gezgini', 'Benekli', 'Taş Kertenkelesi', 'Bukalemun', 'Sessiz Ejder'] },
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
    nest: P('M16 98 C22 114 98 114 104 98 C94 106 26 106 16 98 Z', 'fill="#C4AA8C"') + P('M20 99 C42 94 78 94 100 99', ln('#AD9070', 2)),
    pot: P('M28 96 L92 96 L87 116 L33 116 Z', 'fill="#B98A76"') + P('M24 90 L96 90 L96 97 L24 97 Z', 'fill="#C89C88"'),
    cushion: P('M12 106 C12 96 108 96 108 106 C108 115 12 115 12 106 Z', 'fill="#B5B0C6"'),
    rock: P('M14 110 C14 100 30 94 52 95 C70 96 78 100 80 110 Z', 'fill="#A39787"') + P('M70 110 C72 104 84 101 96 103 C104 104 108 107 108 110 Z', 'fill="#B4A896"') + P('M30 100 C40 97 52 97 60 99', ln('#8F8476', 1.6)),
    branch: P('M6 104 C30 100 70 101 114 96', ln('#7E6650', 5)) + P('M84 99 C90 92 98 90 104 91 C99 95 92 98 84 99 Z', 'fill="#8C9A78"') + P('M22 102 C18 96 12 95 8 96 C12 100 16 102 22 102 Z', 'fill="#7F8E6E"'),
    house: P('M86 112 L86 82 L101 70 L116 82 L116 112 Z', 'fill="#C7AE88"') + P('M82 84 L101 66 L120 84', ln('#94594D', 4)) + P('M94 112 L94 98 C94 92 108 92 108 98 L108 112 Z', 'fill="#3a3340"'),  }[h] || '';
  return `<svg class="pet-home-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
}
