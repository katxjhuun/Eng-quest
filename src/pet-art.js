// dam-la petleri — tamamen özgün, kodla çizilmiş SVG karakterler.
// 5 tür × 6 evrim aşaması. Çizim ve animasyon src/pets/ altındaki iskeletlerden gelir:
//   pets/quad.js  — kedi, köpek (yandan, dört ayaklı siluet)
//   pets/bean.js  — civciv, bitki (öne bakan yuvarlak gövde)
//   pets/puppet.js — canlı oynatıcı + statik çizim
// Bu dosya tür bilgilerini ve statik çizim kapısını (petSVG) dışarı açar; panel ve yönetici paneli bunu kullanır.
import { staticSVG } from './pets/puppet.js';

const SPECIES = {
  chick: { label: 'Civciv', home: 'nest', stages: ['Yumurtacık', 'Pıtırcık', 'Tombiş', 'Kanatçık', 'Tavus Yavrusu', 'Tavus Kuşu'] },
  plant: { label: 'Bitki', home: 'pot', stages: ['Tohumcuk', 'Filizcik', 'Papatya', 'Lale', 'Kaktüs', 'Ulu Ağaç'] },
  cat: { label: 'Kedi', home: 'cushion', quad: true, stages: ['Minnoş', 'Tekir', 'Vaşak', 'Puma', 'Leopar', 'Kara Panter'] },
  dog: { label: 'Köpek', home: 'house', quad: true, stages: ['Tosbik', 'Hav', 'Çoban', 'Genç Kurt', 'Kurt', 'Alfa Kurt'] },};

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
    nest: P('M16 98 C22 114 98 114 104 98 C94 106 26 106 16 98 Z', 'fill="#D9B48A"') + P('M20 99 C42 94 78 94 100 99', ln('#C49A6C', 2)),
    pot: P('M28 96 L92 96 L87 116 L33 116 Z', 'fill="#E39A80"') + P('M24 90 L96 90 L96 97 L24 97 Z', 'fill="#EBAE98"'),
    cushion: P('M12 106 C12 96 108 96 108 106 C108 115 12 115 12 106 Z', 'fill="#CFC4F2"'),
    house: P('M86 112 L86 82 L101 70 L116 82 L116 112 Z', 'fill="#F2C47A"') + P('M82 84 L101 66 L120 84', ln('#D9634E', 4)) + P('M94 112 L94 98 C94 92 108 92 108 98 L108 112 Z', 'fill="#3a3340"'),  }[h] || '';
  return `<svg class="pet-home-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
}
