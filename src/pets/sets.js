// dam-la — görünüş setleri. Her set kendi iskeletini ve çizimini kendi dosyasında kurar (rigs/*); klasik parça ağaçları
// ve onların kemikleri setlerde KULLANILMAZ. Burada yalnızca setler tür adlarına bağlanır.
//  · shadow (Gölge)  → rigs/ink.js  — siluet, boyunlu iri baş, O gözler
//  · cosmic (Kozmik) → rigs/lume.js — bacaksız yumuşak gövdeler, degrade, çizgi yüzler
//  · toy (Oyuncak)   → quirk/engine.js — Quirky Series 3B modelleri (Omabuarts Studio, CC BY) + aynı tarzda kendi modellerimiz
import { inkSet, makeInk } from './rigs/ink.js';
import { lumeSet, makeLume } from './rigs/lume.js';

export const SPECIES = ['cat', 'dog', 'chick', 'owl', 'gecko', 'goat', 'whale', 'doodle', 'plant'];
const setOf = (info, make, scale = 1, per = {}) => Object.fromEntries(SPECIES.map(sp => [sp, {
  rig: true, set: info.id, info, scale: scale * (per[sp] || 1), sp,
  make: (stage, coat, acc) => make(sp, stage, coat, acc),
}]));
// Set 3 "Oyuncak": 3B (pets/quirk/*), yalnızca seçilince yüklenir
const toySet = { id: 'toy', shadowFill: '#3E8F6E' };
const toy = Object.fromEntries(SPECIES.map(sp => [sp, { rig3d: true, set: 'toy', info: toySet, scale: 1.3, sp }]));
export const SETS = {
  toy,
  shadow: setOf(inkSet, makeInk, 1.5, { gecko: 1.3, whale: 0.95, chick: 1.05 }),
  cosmic: setOf(lumeSet, makeLume, 1.4, { gecko: 1.1, chick: 1.1, doodle: 1.05 }),
};
