// Tema tanımları. Derleme sırasında scripts/theme-gen.mjs, styles.css içindeki her rengi
// ailesine göre (zemin, mürekkep, mor vurgu, yeşil, altın, mercan, mavi) bu ayarlarla dönüştürür.
// Böylece yerleşim ve tasarım aynı kalır, yalnızca renkler değişir.
//  hue: ailenin hedef rengi (0-360) · nh/ns: zemin tonu ve doygunluk çarpanı · dark: koyu tema
export const THEMES = [
  { id: 'krem', name: 'Klasik Krem', note: 'Uygulamanın özgün teması', meta: '#f4f0e8' },
  { id: 'gece', name: 'Gece Moru', dark: true, nh: 265, ns: 1.4, accent: 255, green: 155, gold: 44, coral: 8, blue: 220, meta: '#141019' },
  { id: 'okyanus', name: 'Okyanus', nh: 205, ns: 1.1, accent: 212, green: 178, gold: 40, coral: 4, blue: 195, meta: '#ecf2f6' },
  { id: 'orman', name: 'Orman', nh: 95, ns: 1.0, accent: 150, green: 132, gold: 36, coral: 12, blue: 190, meta: '#eef2e6' },
  { id: 'gunbatimi', name: 'Gün Batımı', nh: 24, ns: 1.5, accent: 14, green: 165, gold: 36, coral: 350, blue: 200, meta: '#f8ece3' },
  { id: 'pembe', name: 'Pembe Şeker', nh: 338, ns: 1.3, accent: 328, green: 158, gold: 45, coral: 355, blue: 205, meta: '#f9ecf1' },
  { id: 'nane', name: 'Nane Kedi', nh: 150, ns: 1.2, accent: 336, green: 152, gold: 45, coral: 350, blue: 200, meta: '#ebf5ef' },
  { id: 'kahve', name: 'Kahve', nh: 32, ns: 1.6, accent: 24, accentSat: 0.55, green: 82, gold: 34, coral: 12, blue: 200, meta: '#f2e9dc' },
  { id: 'gecemavi', name: 'Gece Mavisi', dark: true, nh: 220, ns: 1.6, accent: 214, green: 170, gold: 44, coral: 6, blue: 205, meta: '#0e131c' },
  { id: 'kontrast', name: 'Yüksek Kontrast', contrast: true, nh: 0, ns: 0, accent: 236, accentSat: 1.15, green: 150, gold: 44, coral: 4, blue: 222, meta: '#ffffff' },
  { id: 'neon', name: 'Neon', dark: true, nh: 280, ns: 1.0, accent: 300, accentSat: 1.2, green: 160, gold: 55, coral: 340, blue: 190, meta: '#0d0a12' },
];
export const DEFAULT_THEME = 'krem';
