// Geometrik editoryal (60'lar dergi illüstrasyonu): kontur yok, düz renk düzlemleri, ışık/gölge iki düzlemle,
// küçük ciddi gözler, toprak tonlu sınırlı baskı paleti, hafif kâğıt grenı ve baskı kusuru.
export const C = {
  paper: '#ECE2CC', black: '#1E1B1C', soot: '#2E2A2C', rust: '#B4532A', rustD: '#8A3B1E', ochre: '#C99A2E', ochreD: '#9E7620',
  olive: '#6E7A3A', oliveD: '#4E5828', teal: '#24585A', tealD: '#173E40', slate: '#4A6378', slateD: '#33475A',
  gray: '#9B9087', grayD: '#6F665E', sand: '#D8C5A0', sandD: '#B9A47C', salmon: '#D98B73', cream: '#F3EBD8',
};
export const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
export const B = (d, w, col, extra = '') => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
export const O = (cx, cy, r, fill, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
export const E = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
export function wrap(id, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs>
  <filter id="${id}g" x="-3%" y="-3%" width="106%" height="106%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="11" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="w"/>
    <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="3" result="g"/>
    <feColorMatrix in="g" type="matrix" values="0 0 0 0 0.93 0 0 0 0 0.89 0 0 0 0 0.8 0 0 0 0.9 -0.52" result="speck"/>
    <feComposite in="speck" in2="w" operator="in" result="sp"/>
    <feMerge><feMergeNode in="w"/><feMergeNode in="sp"/></feMerge>
  </filter></defs><g filter="url(#${id}g)">${body}</g></svg>`;
}
