// Ortak: palet, kağıt dokusu/baskı filtresi, tarama deseni
export const C = {
  ink: '#2A2230', paper: '#F1E4C8', cream: '#F6ECD6', brick: '#C8553D', brickD: '#9C3B2A', mustard: '#E2A93B', mustardD: '#B9832A',
  teal: '#2F8C86', tealD: '#1F625E', cobalt: '#3E6A9E', cobaltD: '#2A4A72', ginger: '#D9773F', gingerD: '#A9542A', gingerL: '#EBA06A',
  pink: '#E59A8C', pinkD: '#C47366', sage: '#8FA876', sageD: '#62784E', plum: '#8C5A7E', ash: '#9C958C', ashD: '#6E675F', ashL: '#C3BBAE',
  char: '#3A3540', olive: '#A79A3A', bark: '#7E5A3C', barkD: '#58402C',
};
export function defs(id) {
  return `<defs>
  <filter id="${id}p" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="w"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="9" result="g"/>
    <feColorMatrix in="g" type="matrix" values="0 0 0 0 0.16 0 0 0 0 0.13 0 0 0 0 0.12 0 0 0 0.4 -0.14" result="gk"/>
    <feComposite in="gk" in2="w" operator="in" result="gm"/>
    <feMerge><feMergeNode in="w"/><feMergeNode in="gm"/></feMerge>
  </filter>
  <pattern id="${id}h" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><path d="M0 2 H4" stroke="${C.ink}" stroke-width=".7" opacity=".55"/></pattern>
  <pattern id="${id}x" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><path d="M0 2.5 H5 M2.5 0 V5" stroke="${C.ink}" stroke-width=".55" opacity=".45"/></pattern>
</defs>`;
}
// yardımcılar
export const S = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" stroke="${C.ink}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
export const F = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
export const L = (d, w = 1.6, col = C.ink, extra = '') => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
export const H = (d, id) => `<path d="${d}" fill="url(#${id}h)"/>`;
export const wrap = (id, body, vb = '0 0 200 200') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><g filter="url(#${id}p)">${defs(id)}${body}</g></svg>`;
