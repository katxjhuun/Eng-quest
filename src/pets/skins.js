// dam-la — pet görünüş setleri listesi (dolapta gösterilen adlar).
// Her set kendi iskeletiyle sıfırdan çizilir (pets/rigs/*, pets/quirk/*); klasik çizimler yeniden boyanmaz.
//  · classic — özgün geometrik editoryal çizim
//  · shadow  — "Gölge": siluet, boyunlu iri baş, beyaz O gözler; sarı yaşam alanı
//  · cosmic  — "Kozmik": bacaksız yumuşak gövdeler, degrade, çizgi yüzler; yıldızlı uzay
//  · toy     — "Oyuncak": 3B düşük poligon (Quirky Series, Omabuarts Studio — CC BY) ve aynı tarzda petler
export const SKINS = {
  classic: { name: 'Klasik', desc: 'Geometrik editoryal çizim' },
  shadow: { name: 'Gölge', desc: 'Siluet, boyunlu iri baş, meraklı O gözler' },
  cosmic: { name: 'Kozmik', desc: 'Yumuşak bacaksız gövdeler, neon degrade, uykulu çizgi yüzler' },
  toy: { name: 'Oyuncak', desc: '3B düşük poligon oyuncaklar, kocaman googly gözler' },
};
export const skinIds = () => Object.keys(SKINS);
