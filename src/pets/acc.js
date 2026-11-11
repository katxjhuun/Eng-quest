// dam-la — pet aksesuarları: çizimler ve her tür/evre/görünüş için ölçülmüş takılma noktaları.
// Aksesuar başın (balinada gövdenin) çocuk parçası olarak eklenir: başla birlikte döner, eğilir, zıplar; ayrıca animasyon gerekmez.
// ANCH[tür][görünüş] = [tepeX, tepeY, başGenişliği, başAltıY, gözX, gözY, gözAralığı] (tek dizi: bütün evrelerde aynı; 6'lı dizi: evreye göre).
// Bu tablo gerçek çizimler tarayıcıda ölçülerek üretildi (tests/measure).
export const ANCH = {"cat":{"sit":[125.2,54,58.4,106,134.6,76,6.9],"walk":[157.2,76,50.4,120,164.8,94,6.2],"sleep":[142,142,44,178,null,null,null]},"dog":{"sit":[100,40,64,112,100,66.5,36],"walk":[171.5,57.2,51.7,96,167,72.4,6],"sleep":[169.7,142.8,51.4,180,null,null,null]},"chick":{"sit":[[100,102,60,130,95,118,6.8],[100,49,54,103,100,72,36.8],[100,49,54,103,100,72,36.8],[100,52,48,100,100,72,34.8],[100,67,22,89,100,79,15.6],[100,67,22,89,100,79,15.6]],"walk":[[100,102,60,130,95,118,6.8],[112,40,60,100,125,61,12],[116,57,54,111,127,77,10.4],[116,60,48,108,127,77,9.2],[132,68,20,88,134,77,4.8],[132,68,20,88,134,77,4.8]]},"owl":{"sit":[100,60,80,100,100,80,50]},"gecko":{"sit":[100,102,56,146,100,118,58.8],"walk":[161.2,93.8,50.4,132,159.3,106,4.4]},"goat":{"sit":[100,58,40,118,100,80,32],"walk":[169.9,62.5,41.2,94.5,166,74,8],"sleep":[166.7,144.5,45.9,172,null,null,null]},"whale":{"sit":[112.5,86.7,165,127,null,null,null]},"doodle":{"sit":[110,60,96,110,81,72.2,4.8]},"plant":{"sit":[[100,109,36,135,100,122.5,15.5],[100,73,26,99,100,86.5,13.5],[100,32,64,96,100,63.5,13.5],[100,46,36,88,100,70.5,15.7],[100,48,46.3,134,100,86.6,21.2],[100.5,76,33,134,100,112.5,11.5]]}};

// elle düzeltilen noktalar: balinada baş gövdenin ön ucudur; doodle'ın baş kutusu tüm gövdeyi kaplar
ANCH.whale = { sit: [150, 93, 34, 117, 159.5, 104.1, 3.2] };
ANCH.doodle = { sit: [96, 62, 50, 104, 81, 72.2, 4.8] };

const INK = 'stroke="#2A2230" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"';
const P = (d, f, x = '') => `<path d="${d}" fill="${f}" ${INK} ${x}/>`;
const C = (cx, cy, r, f, x = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}" ${INK} ${x}/>`;
const E = (cx, cy, rx, ry, f, x = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}" ${INK} ${x}/>`;
const L = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const star = (x, y, r, f) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`; } return P(d + 'Z', f); };
const daisy = (x, y) => [0, 1, 2, 3, 4, 5].map(i => { const a = i * Math.PI / 3; return E((x + Math.cos(a) * 3).toFixed(1), (y + Math.sin(a) * 3).toFixed(1), 2.4, 2.4, '#FFFDF6'); }).join('') + C(x, y, 1.9, '#F2B63A');
const heart = (x, y, s, f) => P(`M${x} ${y + 6 * s} C${x - 9 * s} ${y} ${x - 8 * s} ${y - 7 * s} ${x - 3.5 * s} ${y - 6 * s} C${x - 1.5 * s} ${y - 5.5 * s} ${x} ${y - 4 * s} ${x} ${y - 3 * s} C${x} ${y - 4 * s} ${x + 1.5 * s} ${y - 5.5 * s} ${x + 3.5 * s} ${y - 6 * s} C${x + 8 * s} ${y - 7 * s} ${x + 9 * s} ${y} ${x} ${y + 6 * s}Z`, f);

// slot: head (tepe, yukarı doğru çizilir) · face (göz ortası) · neck (başın altı, aşağı doğru)
// face çizimleri (side) => tek göz görünen yandan bakış için
const ART = {
  daisy: () => L('M-19 0 Q0 -9 19 0', '#5E8C46', 2.2) + daisy(-14, -3) + daisy(-5, -6.5) + daisy(5, -6.5) + daisy(14, -3),
  cap: () => P('M-17 0 C-17 -19 17 -19 17 0 Z', '#3E6FB0') + P('M9 -1 C17 -4 28 -2 31 2 C23 4 14 3 8 1 Z', '#2F5A94') + L('M0 -16 L0 -1', '#2F5A94', 1.2) + C(0, -16.5, 1.7, '#F3EBDA'),
  beanie: () => P('M-18 0 C-18 -21 18 -21 18 0 Z', '#D6453D') + L('M-9 -2 L-8 -15 M0 -2 L0 -17 M9 -2 L8 -15', '#B8332C', 1.4) + P('M-19.5 -5 L19.5 -5 L19.5 1.5 L-19.5 1.5 Z', '#B8332C') + C(0, -20, 5, '#F7F0E2'),
  beret: () => P('M-21 -1 C-23 -13 6 -17 20 -7 C23 -3 15 1 -21 -1 Z', '#8C2F45') + L('M-1 -14 L1 -18', '#2A2230', 1.6),
  star_clip: () => star(12, -3, 6.5, '#F4C542') + C(12, -3, 1.4, '#FFFDF6'),
  wizard: () => P('M-17 0 L6 -42 L17 0 Z', '#5B3FA8') + E(0, 0, 23, 4.2, '#4A3290') + star(-3, -16, 3.2, '#F4C542') + star(6, -27, 2.4, '#F4C542') + C(8, -9, 1.3, '#F4C542'),
  party: () => P('M-11 0 L0 -33 L11 0 Z', '#3FB6A8') + L('M-7 -10 L4 -14 M-4 -20 L3 -23', '#F2779A', 2.4) + C(0, -34, 3.4, '#F4C542'),
  gold_crown: () => P('M-17 1 L-18 -15 L-9 -6 L0 -20 L9 -6 L18 -15 L17 1 Z', '#E8B53A') + P('M-17 1 L17 1 L17 -3 L-17 -3 Z', '#C99A2E') + C(0, -9, 2.4, '#D6453D') + C(-9, -2, 1.6, '#3E6FB0') + C(9, -2, 1.6, '#3FA37A') + C(0, -20.5, 1.8, '#FFF3C4') + C(-18, -15.5, 1.5, '#FFF3C4') + C(18, -15.5, 1.5, '#FFF3C4'),
  grad_cap: () => P('M-12 -9 L-12 0 C-6 3 6 3 12 0 L12 -9 Z', '#34343C') + P('M-24 -12 L0 -21 L24 -12 L0 -3 Z', '#25252C') + L('M0 -12 L15 -10 L15 0', '#F4C542', 1.5) + C(15, 1.5, 2.2, '#F4C542'),
  quill: () => P('M6 -1 C10 -14 18 -28 25 -38 C24 -26 19 -12 10 0 Z', '#F7F0E2') + L('M7 -1 C13 -14 19 -26 25 -38', '#B9A47C', 1.1) + L('M11 -14 l5 1 M14 -21 l5 0 M17 -27 l4 -1', '#D9CCB4', 1),
  dragon_horns: () => P('M-13 1 C-17 -10 -24 -17 -23 -28 C-17 -20 -9 -12 -6 0 Z', '#B44A3A') + P('M13 1 C17 -10 24 -17 23 -28 C17 -20 9 -12 6 0 Z', '#B44A3A') + L('M-17 -10 l3 -2 M17 -10 l-3 -2', '#7E2E22', 1.2),
  halo: () => `<ellipse cx="0" cy="-15" rx="16" ry="4" fill="none" stroke="#F4D35E" stroke-width="3.2" opacity=".95"/><ellipse cx="0" cy="-15" rx="16" ry="4" fill="none" stroke="#FFF6C8" stroke-width="1.1"/>` + star(-18, -20, 2.4, '#FFF3C4') + star(19, -11, 2, '#FFF3C4'),
  // yüz
  round_glasses: side => side ? C(0, 0, 7.5, '#FFFFFF33', 'stroke-width="2"') + L('M-7.5 -1 L-17 -3', '#2A2230', 1.6) : C(-11, 0, 8, '#FFFFFF33', 'stroke-width="2"') + C(11, 0, 8, '#FFFFFF33', 'stroke-width="2"') + L('M-3 -1 Q0 -3 3 -1', '#2A2230', 1.8) + L('M-19 -1 L-25 -3 M19 -1 L25 -3', '#2A2230', 1.6),
  heart_glasses: side => side ? heart(0, -1, 1.25, '#E0466A') : heart(-11, -1, 1.25, '#E0466A') + heart(11, -1, 1.25, '#E0466A') + L('M-3 -1 Q0 -3 3 -1', '#2A2230', 1.8),
  nerd: side => side ? P('M-7 -6 L7 -6 L7 6 L-7 6 Z', '#FFFFFF2A', 'stroke="#6B4A2E" stroke-width="2.4"') + L('M-7 -2 L-17 -4', '#6B4A2E', 1.8) : P('M-19 -6 L-5 -6 L-5 6 L-19 6 Z', '#FFFFFF2A', 'stroke="#6B4A2E" stroke-width="2.4"') + P('M5 -6 L19 -6 L19 6 L5 6 Z', '#FFFFFF2A', 'stroke="#6B4A2E" stroke-width="2.4"') + L('M-5 -2 L5 -2', '#6B4A2E', 2) + L('M-19 -2 L-25 -4 M19 -2 L25 -4', '#6B4A2E', 1.8),
  monocle: side => `<circle cx="${side ? 0 : 11}" cy="0" r="8" fill="#FFFFFF2A" stroke="#E8B53A" stroke-width="2.4"/>` + L(side ? 'M0 8 C2 14 -2 18 -6 22' : 'M11 8 C13 14 8 18 3 22', '#C99A2E', 1),
  shadow_mask: side => side ? `<path d="M-14 -7 C-4 -9 9 -8 14 -5 L14 6 C6 8 -6 8 -14 6 Z M0 0 m-4.5 0 a4.5 4 0 1 0 9 0 a4.5 4 0 1 0 -9 0" fill="#2E2440" fill-rule="evenodd" ${INK}/>` : `<path d="M-25 -6 C-12 -10 12 -10 25 -6 L24 6 C10 9 -10 9 -24 6 Z M-11 0 m-5 0 a5 4.4 0 1 0 10 0 a5 4.4 0 1 0 -10 0 M11 0 m-5 0 a5 4.4 0 1 0 10 0 a5 4.4 0 1 0 -10 0" fill="#2E2440" fill-rule="evenodd" ${INK}/>` + L(side ? 'M14 -2 L22 -6' : 'M25 -2 L31 -7', '#2E2440', 2),
  // boyun
  bow_red: () => P('M0 2 L-12 -5 L-12 9 Z', '#D6453D') + P('M0 2 L12 -5 L12 9 Z', '#D6453D') + C(0, 2, 3, '#B8332C'),
  gold_bow: () => P('M0 2 L-12 -5 L-12 9 Z', '#E8B53A') + P('M0 2 L12 -5 L12 9 Z', '#E8B53A') + C(0, 2, 3, '#C99A2E') + L('M-9 -1 l3 2 M9 -1 l-3 2', '#FFF3C4', 1.2),
  scarf: () => P('M-20 -2 C-8 4 8 4 20 -2 L20 5 C8 11 -8 11 -20 5 Z', '#3FA37A') + P('M9 7 L16 24 L8 24 L5 9 Z', '#3FA37A') + L('M-12 3 l0 4 M-4 5 l0 4 M4 5 l0 4 M12 3 l0 4 M8 18 l6 0', '#F7F0E2', 1.3),
  bell: () => L('M-18 -2 C-8 5 8 5 18 -2', '#C2553D', 3.4) + C(0, 8, 5.2, '#F4C542') + L('M-3 9.5 L3 9.5', '#2A2230', 1.2) + C(0, 11.5, 1, '#2A2230'),
  medal: () => P('M-7 -2 L0 11 L7 -2 L3 -2 L0 4 L-3 -2 Z', '#3E6FB0') + C(0, 15, 6, '#E8B53A') + star(0, 15, 3.4, '#FFF3C4'),
  star_medal: () => P('M-8 -2 L-1 12 L1 12 L8 -2 L4 -2 L0 6 L-4 -2 Z', '#D6453D') + star(0, 16, 7.5, '#F4C542') + C(0, 16, 2, '#FFF3C4'),
  pocket_watch: () => L('M-16 -2 C-6 6 4 6 14 -1', '#C99A2E', 1.4) + L('M2 4 L4 7', '#C99A2E', 1.4) + C(4, 14, 7, '#E8B53A') + C(4, 14, 5, '#FFF8E6') + L('M4 14 L4 10.5 M4 14 L6.5 15.5', '#2A2230', 1.1),
  infinity: () => L('M-16 -2 C-6 6 6 6 16 -2', '#B5544E', 1.4) + `<path d="M0 12 C-3 8 -9 8 -9 12 C-9 16 -3 16 0 12 C3 8 9 8 9 12 C9 16 3 16 0 12 Z" fill="none" stroke="#B5544E" stroke-width="3"/><path d="M0 12 C-3 8 -9 8 -9 12 C-9 16 -3 16 0 12 C3 8 9 8 9 12 C9 16 3 16 0 12 Z" fill="none" stroke="#F4C542" stroke-width="1"/>`,
};

// kaynak: luck (doğru cevaplarda şans) · golden (Altın Saat'te) · birthday (doğum günü teması) · progress (ilerleme) · boss (o bossu yenince)
export const ACCESSORIES = {
  daisy: { name: 'Papatya Tacı', slot: 'head', rarity: 'common', src: 'luck' },
  cap: { name: 'Kasket', slot: 'head', rarity: 'common', src: 'luck' },
  beanie: { name: 'Ponponlu Bere', slot: 'head', rarity: 'common', src: 'luck' },
  round_glasses: { name: 'Yuvarlak Gözlük', slot: 'face', rarity: 'common', src: 'luck' },
  bow_red: { name: 'Kırmızı Papyon', slot: 'neck', rarity: 'common', src: 'luck' },
  scarf: { name: 'Örgü Atkı', slot: 'neck', rarity: 'common', src: 'luck' },
  star_clip: { name: 'Yıldız Toka', slot: 'head', rarity: 'rare', src: 'luck' },
  heart_glasses: { name: 'Kalp Gözlük', slot: 'face', rarity: 'rare', src: 'luck' },
  bell: { name: 'Çıngıraklı Tasma', slot: 'neck', rarity: 'rare', src: 'luck' },
  wizard: { name: 'Büyücü Şapkası', slot: 'head', rarity: 'epic', src: 'luck' },
  gold_crown: { name: 'Altın Taç', slot: 'head', rarity: 'legendary', src: 'golden' },
  monocle: { name: 'Altın Monokl', slot: 'face', rarity: 'epic', src: 'golden' },
  gold_bow: { name: 'Altın Papyon', slot: 'neck', rarity: 'rare', src: 'golden' },
  party: { name: 'Parti Şapkası', slot: 'head', rarity: 'rare', src: 'birthday' },
  medal: { name: 'İlk Madalya', slot: 'neck', rarity: 'common', src: 'progress', req: { level: 1 }, hint: 'A2 seviyesine ulaş' },
  beret: { name: 'Ressam Beresi', slot: 'head', rarity: 'rare', src: 'progress', req: { correct: 50 }, hint: '50 doğru cevap ver' },
  nerd: { name: 'Kitap Kurdu Gözlüğü', slot: 'face', rarity: 'rare', src: 'progress', req: { correct: 250 }, hint: '250 doğru cevap ver' },
  grad_cap: { name: 'Mezuniyet Kepi', slot: 'head', rarity: 'epic', src: 'progress', req: { level: 3 }, hint: 'B2 seviyesine ulaş' },
  star_medal: { name: 'Yıldız Nişanı', slot: 'neck', rarity: 'legendary', src: 'progress', req: { level: 4 }, hint: 'C1 seviyesine ulaş' },
  quill: { name: 'Kalem Tüyü', slot: 'head', rarity: 'rare', src: 'boss', boss: 'bossSayfa' },
  pocket_watch: { name: 'Cep Saati', slot: 'neck', rarity: 'rare', src: 'boss', boss: 'bossSaat' },
  dragon_horns: { name: 'Ejder Boynuzları', slot: 'head', rarity: 'epic', src: 'boss', boss: 'bossSinav' },
  shadow_mask: { name: 'Gölge Maskesi', slot: 'face', rarity: 'epic', src: 'boss', boss: 'bossGolge' },
  halo: { name: 'Yıldız Halesi', slot: 'head', rarity: 'legendary', src: 'boss', boss: 'bossBilinmez' },
  infinity: { name: 'Sonsuzluk Kolyesi', slot: 'neck', rarity: 'legendary', src: 'boss', boss: 'bossSonsuz' },
};
export const SLOTS = ['head', 'face', 'neck'];
export const RARITY = { common: { name: 'Sıradan', color: '#8C8E94' }, rare: { name: 'Nadir', color: '#3E6FB0' }, epic: { name: 'Destansı', color: '#7A4FC8' }, legendary: { name: 'Efsanevi', color: '#D9A21E' } };

function anchorOf(species, view, stage) {
  const v = ANCH[species]?.[view] || ANCH[species]?.sit; if (!v) return null;
  return Array.isArray(v[0]) || v[0] === null ? v[Math.max(0, Math.min(5, stage | 0))] : v;
}
const r2 = n => Math.round(n * 100) / 100;
// bir figürün takılı aksesuarları için tek parça (başın içine eklenir)
export function accSVG(species, view, stage, ids, anch) {
  const a = anch || anchorOf(species, view, stage); if (!a) return '';
  const [tx, ty, w, by, ex, ey, ew] = a;
  let out = '';
  for (const id of ids || []) {
    const A = ACCESSORIES[id], draw = ART[id]; if (!A || !draw) continue;
    if (A.slot === 'head') out += `<g transform="translate(${r2(tx)} ${r2(ty + w * 0.14)}) scale(${r2(w / 44)})">${draw()}</g>`;
    else if (A.slot === 'neck') out += `<g transform="translate(${r2(tx)} ${r2(by - w * 0.1)}) scale(${r2(w / 48)})">${draw()}</g>`;
    else if (A.slot === 'face' && ex != null) {
      const side = ew < w * 0.3;
      const s = side ? Math.max(0.55, w / 52) : Math.max(0.7, Math.min(ew / 30, w * 0.9 / 44));
      out += `<g transform="translate(${r2(ex)} ${r2(ey)}) scale(${r2(s)})">${draw(side)}</g>`;
    }
  }
  return out;
}
// parça ağacına aksesuar parçasını ekler (balinada gövdeye, diğerlerinde başa)
export function withAcc(list, species, view, stage, ids, def) {
  if (!ids || !ids.length) return list;
  const svg = accSVG(species, view, stage, ids, def?.anch?.(view, stage)); if (!svg) return list;
  const host = species === 'whale' && !def?.set ? 'body' : 'head';
  let done = false;
  const map = l => l.map(p => {
    if (done) return p;
    if (p.k === host) { done = true; return { ...p, kids: [...p.kids, { k: 'acc', p: [0, 0], s: svg, kids: [], min: 0 }] }; }
    const kids = map(p.kids); return kids === p.kids ? p : { ...p, kids };
  });
  return map(list);
}
// tek başına önizleme (dolap için): sadece aksesuar
export function accIconSVG(id) {
  const A = ACCESSORIES[id], draw = ART[id]; if (!A || !draw) return '';
  const vb = A.slot === 'head' ? '-28 -44 56 52' : A.slot === 'neck' ? '-24 -10 48 38' : '-30 -16 60 32';
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${draw(false)}</svg>`;
}
