// dam-la — Set 2 "Kozmik": bacaksız yumuşak gövdeli petler (sıfırdan; ne klasik parça ağaçları ne Set 1 iskeleti kullanılır).
// Referans tarzın kuralları (Momo LUME sergisi animasyonundan izlenen): gövdelerde kontur yok, yumuşak dikey degrade
// (sarı→pembe→eflatun, mor→çivit, camgöbeği→mavi), hafif parıltı; yüz ve ayrıntılar ince el çizimi koyu çizgiyle;
// beyaz disk gözler (koyu kontur + küçük bebek) ya da kapalı yay gözler, ağır düz "sıkılmış" kapaklar; sırıtan çizgili
// dişler, açık ağızda pembe dil; yavaş süzülme / salınma / yere gömülüp çıkma, ezilme-uzama, hızda uzayan iz.
//
// Anatomiler (her biri kendi profiliyle):
//  · anıt (kedi, baykuş, keçi): yerden yükselen, tepesi taç dikenli uzun yumuşak blok; yüz üst üçte birde
//  · damla (köpek): yere oturan yuvarlak tepeli blok, sarkık yumuşak loblar
//  · denizanası (balina): havada yuvarlak baş + sarkan dokunaçlar, minicik melon şapka
//  · yılan (kertenkele): sivrilen uzun gövde boyunca ilerleyen dalga, tek göz + sırıtış, gövde boyunca iç çizgiler
//  · asteroit / kuyruklu yıldız (civciv → tavus): havada yuvarlak taş blob; büyüyünce degrade alev kuyruğu
//  · periskop (Buz Bodur): su birikintisinden yükselen saplı tek göz, halka dalgaları
//  · filiz (filiz): yerden çıkan sap + kapalı gözlü tomurcuk, damla yapraklar
import { clamp, lerp, bell, TAU, f1, rad, cyc, curve, intent, eyeState } from './kit.js';
import { accSVG } from '../acc.js';

const LINE = '#170F33', TONGUE = '#FF6FA8', WHITE = '#FFFFFF';
export const lumeSet = { id: 'cosmic', shadowFill: '#0B0630', defs: () => '', back: () => '' };

const PAL = {
  cat: ['#8C5BFF', '#2A1A8C'], owl: ['#FF9A3D', '#FF3D8B'], goat: ['#D7B4FF', '#7A3CFF'], dog: ['#4FF0F0', '#2F5BFF'],
  whale: ['#F7F23A', '#FF5FB0'], gecko: ['#4C7BFF', '#1B23C9'], chick: ['#FFC23A', '#FF6A1A'], doodle: ['#8A4BFF', '#3A12A8'], plant: ['#FF5FD8', '#FF9A3D'],
};
let cidSeq = 0;
const lin = (id, a, b, y0, y1) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${f1(y0)}" x2="${f1((y1 - y0) * 0.25)}" y2="${f1(y1)}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const glow = (id, c) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity=".45"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
const stroke = (d, w = 1.6, c = LINE) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${f1(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];

// ---------------------------------------------------------------- yüz (çizgi)
// o: { x, y, s (ölçek), n (göz sayısı 1|2), gap, er (göz yarıçapı), fill (kapak dolgusu = gövde degradesi), mouth: 'smirk'|'grin'|'none' }
function face(o, eye, lid, look, S, I) {
  const { x, y, s } = o, er = o.er * s, out = [];
  const xs = o.n === 1 ? [x] : [x - o.gap * s / 2, x + o.gap * s / 2];
  const lw = Math.max(1.1, 1.5 * s);
  for (let i = 0; i < xs.length; i++) {
    const ex = xs[i], side = i === 0 ? -1 : 1;
    if (eye === 'closed') { out.push(stroke(`M${f1(ex - er)} ${f1(y - er * 0.1)}Q${f1(ex)} ${f1(y + er * 0.75)} ${f1(ex + er)} ${f1(y - er * 0.1)}`, lw)); continue; }
    if (eye === 'happy') { out.push(stroke(`M${f1(ex - er)} ${f1(y + er * 0.3)}Q${f1(ex)} ${f1(y - er * 0.85)} ${f1(ex + er)} ${f1(y + er * 0.3)}`, lw)); continue; }
    if (eye === 'x') { const q = er * 0.75; out.push(stroke(`M${f1(ex - q)} ${f1(y - q)}L${f1(ex + q)} ${f1(y + q)}M${f1(ex + q)} ${f1(y - q)}L${f1(ex - q)} ${f1(y + q)}`, lw)); continue; }
    if (eye === 'hurt') { const q = er * 0.8, d = side; out.push(stroke(`M${f1(ex + q * d)} ${f1(y - q)}L${f1(ex - q * d)} ${f1(y)}L${f1(ex + q * d)} ${f1(y + q)}`, lw)); continue; }
    const R = eye === 'wide' ? er * 1.2 : er;
    out.push(`<circle cx="${f1(ex)}" cy="${f1(y)}" r="${f1(R)}" fill="${WHITE}" stroke="${LINE}" stroke-width="${f1(lw * 0.9)}"/>`);
    let px = look * R * 0.35, py = 0.1 * R, pr = eye === 'wide' ? R * 0.22 : R * 0.36;
    if (eye === 'dizzy') { px = Math.cos(S.t * 9 + i * 3) * R * 0.4; py = Math.sin(S.t * 9 + i * 3) * R * 0.4; }
    out.push(`<ellipse cx="${f1(ex + px)}" cy="${f1(y + py)}" rx="${f1(pr * 0.85)}" ry="${f1(pr * 1.1)}" fill="${LINE}"/>`);
    // ağır düz kapak: gövde rengiyle dolu, alt kenarı çizgi (LUME'nin sıkılmış bakışı)
    let L = Math.max(lid, eye === 'sleepy' ? 0.55 : eye === 'squint' ? 0.5 : o.bored || 0);
    let tl = 0;
    if (eye === 'sad') { L = Math.max(L, 0.4); tl = -0.35 * side; }
    if (eye === 'angry') { L = Math.max(L, 0.45); tl = 0.4 * side; }
    if (L > 0.03) {
      const yl = y - R + 2 * R * L + tl * R, yr = y - R + 2 * R * L - tl * R;
      const pts = [];
      for (let k = 0; k <= 16; k++) { const a = Math.PI + (k / 16) * Math.PI, px2 = ex + Math.cos(a) * (R + 0.7), py2 = y + Math.sin(a) * (R + 0.7); pts.push([px2, Math.min(py2, lerp(yl, yr, (px2 - (ex - R)) / (2 * R)))]); }
      pts.push([ex + R + 0.7, Math.min(y, yr)], [ex - R - 0.7, Math.min(y, yl)]);
      out.push(`<path d="M${pts.map(p => `${f1(p[0])} ${f1(p[1])}`).join('L')}Z" fill="${o.fill}"/>`);
      out.push(stroke(`M${f1(ex - R)} ${f1(yl)}L${f1(ex + R)} ${f1(yr)}`, lw));
    }
  }
  // ağız
  const mx = o.mx ?? x, my = (o.my ?? (y + er * 2.1 * 1)) , mw = (o.mw || o.gap * 0.8) * s;
  const open = Math.max(I.mouth, eye === 'wide' ? 0.8 : 0, S.verb === 'cry' ? 0.5 : 0);
  if (o.mouth === 'none') {}
  else if (open > 0.15) {
    const h = mw * 0.55 * open;
    out.push(`<path d="M${f1(mx - mw / 2)} ${f1(my)}Q${f1(mx)} ${f1(my - h * 0.25)} ${f1(mx + mw / 2)} ${f1(my)}Q${f1(mx)} ${f1(my + h * 1.6)} ${f1(mx - mw / 2)} ${f1(my)}Z" fill="${LINE}"/>`);
    out.push(`<ellipse cx="${f1(mx)}" cy="${f1(my + h * 0.95)}" rx="${f1(mw * 0.26)}" ry="${f1(h * 0.32)}" fill="${TONGUE}"/>`);
    out.push(`<path d="M${f1(mx - mw * 0.3)} ${f1(my + 0.3)}h${f1(mw * 0.6)}v${f1(h * 0.28)}h${f1(-mw * 0.6)}Z" fill="${WHITE}"/>`);
  } else if (o.mouth === 'grin' || eye === 'happy') {
    const h = mw * 0.32;
    out.push(`<path d="M${f1(mx - mw / 2)} ${f1(my - h * 0.2)}Q${f1(mx)} ${f1(my + h * 1.4)} ${f1(mx + mw / 2)} ${f1(my - h * 0.2)}Z" fill="${WHITE}" stroke="${LINE}" stroke-width="${f1(lw)}" stroke-linejoin="round"/>`);
    for (let k = 1; k < 4; k++) { const tx = mx - mw / 2 + mw * k / 4; out.push(stroke(`M${f1(tx)} ${f1(my - h * 0.1)}L${f1(tx)} ${f1(my + h * 0.55 * Math.sin(Math.PI * k / 4))}`, lw * 0.7)); }
  } else if (eye === 'sad' || S.mood === 'sad' || S.mood === 'hungry') out.push(stroke(`M${f1(mx - mw * 0.35)} ${f1(my + 1.5 * s)}Q${f1(mx)} ${f1(my - 1.8 * s)} ${f1(mx + mw * 0.35)} ${f1(my + 1.5 * s)}`, lw));
  else if (eye === 'angry') out.push(stroke(`M${f1(mx - mw * 0.4)} ${f1(my)}l${f1(mw * 0.2)} ${f1(-1.6 * s)}l${f1(mw * 0.2)} ${f1(1.6 * s)}l${f1(mw * 0.2)} ${f1(-1.6 * s)}l${f1(mw * 0.2)} ${f1(1.6 * s)}`, lw));
  else out.push(stroke(`M${f1(mx - mw * 0.4)} ${f1(my)}Q${f1(mx + mw * 0.1)} ${f1(my + 2.2 * s)} ${f1(mx + mw * 0.42)} ${f1(my - 1.2 * s)}`, lw));
  // gözyaşı
  if (I.tears > 0.05) { const q = (S.t * 1.4) % 1; out.push(`<path d="M${f1(xs[0])} ${f1(y + er + q * 12)}q-2.4 3.4 0 5.2q2.4-1.8 0-5.2Z" fill="#7FF7EE" opacity="${f1(I.tears * (1 - q))}"/>`); }
  return out.join('');
}

// tüm gövde dönüşümleri; ölüm: yere yarı gömülür
function wrap(me, I, S, body, h, defs) {
  let tr = '';
  const lift = I.lift;
  if (lift) tr += `translate(0 ${f1(-lift)}) `;
  if (I.shiver) tr += `translate(${f1(I.shiver)} 0) `;
  if (I.roll > 0 && I.roll < 1) tr += `rotate(${f1(360 * I.roll)} 0 ${f1(-h / 2)}) `;
  if (I.spin > 0 && I.spin < 1) tr += `scale(${(Math.round(Math.cos(I.spin * TAU * 2) * 100) / 100) || 0.01} 1) `;
  const sq = I.squash;
  if (sq) tr += `scale(${f1((1 + sq) * 100) / 100} ${f1((1 - sq) * 100) / 100}) `;
  if (S.base === 'dead') tr += `translate(0 ${f1(h * 0.42)}) `;
  me.air = clamp(lift / 30, 0, 0.6);
  const clip = S.base === 'dead' ? ` clip-path="url(#${me.cid}g)"` : '';
  const cdef = S.base === 'dead' ? `<clipPath id="${me.cid}g"><rect x="-140" y="-260" width="280" height="260"/></clipPath>` : '';
  return `<defs>${defs}${cdef}</defs><g${clip}><g${tr ? ` transform="${tr.trim()}"` : ''}>${body}</g></g>`;
}
const acc = (sp, stage, ids, anch) => (ids && ids.length ? accSVG(sp, 'sit', stage, ids, anch) : '');

// ---------------------------------------------------------------- anıt (kedi, baykuş, keçi)
function makeMonolith(sp, stage, ids) {
  const u = stage / 5, k = lerp(0.56, 1, u), cid = 'lm' + (++cidSeq);
  const H = (sp === 'goat' ? 74 : sp === 'owl' ? 78 : 84) * k, W = (sp === 'goat' ? 30 : sp === 'owl' ? 30 : 26) * k;
  const me = {
    cid, gait: 'hop', hop: 26, front: true, air: 0, cycle: () => 26,
    frame(S) {
      const I = intent(S.verb, S.cu, S.cT, S.ce, S.mood, S.t), eye = eyeState(S.mood, I, S.lidV, S.base);
      const hop = S.moving ? bell(S.ph > 0.28 ? (S.ph - 0.28) / 0.72 : 0) : 0, land = S.moving && S.ph <= 0.28 ? bell(S.ph / 0.28) : 0;
      // gövde: yükseklik/genişlik, salınım (tepe yana kayar), ezilip uzama
      const breath = 0.02 * Math.sin(S.t * 1.6);
      const hk = 1 + breath - 0.12 * land + 0.1 * hop - 0.25 * I.crouch + 0.12 * I.headUp - 0.18 * I.headDown * 0.5 + 0.2 * I.bow;
      const h = H * hk, w = W * (1 - breath * 0.6 + 0.1 * land - 0.06 * hop + 0.12 * I.crouch - 0.1 * I.bow);
      const sway = 3 * Math.sin(S.t * 0.9) * k + 10 * I.sway * k + 7 * I.headTilt * k + 6 * I.headTurn * k + (I.lean + 0.6 * I.push) * 8 * k;
      const pts = [];
      const N = 6;
      // sağ kenar aşağıdan yukarı
      for (let i = 0; i <= N; i++) { const q = i / N, ww = w * (1.08 - 0.16 * q + 0.1 * Math.sin(q * Math.PI)); pts.push([ww + sway * q * q, -h * q * 0.86]); }
      // taç dikenleri (tepe)
      const crown = sp === 'cat' ? [[0.62, 0.32], [-0.62, 0.32]] : sp === 'owl' ? [[0.72, 0.26], [0, 0.12], [-0.72, 0.26]] : [[0.4, 0.14], [-0.4, 0.14]];
      const topY = -h * 0.86, ears = rad(-14 * I.earsBack + 10 * I.earsUp + 18 * I.puff);
      const cpts = [];
      cpts.push([w * 0.92 + sway, topY - h * 0.04]);
      for (const [cx, ch] of crown) {
        const bx = cx * w + sway, tipH = h * ch * (stage < 1 ? 0.5 : 1);
        const a = cx > 0 ? ears : cx < 0 ? -ears : 0;
        const tip = [bx + Math.sin(a) * tipH, topY - tipH * Math.cos(a) - h * 0.04];
        cpts.push([bx + w * 0.2, topY - h * 0.05], tip, [bx - w * 0.2, topY - h * 0.05]);
      }
      cpts.push([-w * 0.92 + sway, topY - h * 0.04]);
      for (let i = N; i >= 0; i--) { const q = i / N, ww = w * (1.08 - 0.16 * q + 0.1 * Math.sin(q * Math.PI)); pts.push([-ww + sway * q * q, -h * q * 0.86]); }
      const outline = [...pts.slice(0, N + 1), ...cpts, ...pts.slice(N + 1)];
      const g = [];
      g.push(`<ellipse cx="${f1(sway * 0.5)}" cy="${f1(-h * 0.5)}" rx="${f1(w * 2.2)}" ry="${f1(h * 0.9)}" fill="url(#${cid}h)"/>`);
      g.push(`<path d="${curve(outline, true, 0.85)}" fill="url(#${cid}a)"/>`);
      // keçi: kıvrık boynuzlar + sakal
      if (sp === 'goat' && stage >= 1) for (const sd of [-1, 1]) { const b = [sd * w * 0.55 + sway, topY - h * 0.02], hl = lerp(0.5, 1.1, u) * 16 * k; g.push(stroke(`M${f1(b[0])} ${f1(b[1])}C${f1(b[0] + sd * hl * 0.6)} ${f1(b[1] - hl * 1.3)} ${f1(b[0] + sd * hl * 1.8)} ${f1(b[1] - hl * 0.6)} ${f1(b[0] + sd * hl * 1.2)} ${f1(b[1] + hl * 0.1)}`, 4.6 * k, '#FF8AD8')); }
      const fy = topY + h * (sp === 'owl' ? 0.3 : 0.26), fs = k * (sp === 'owl' ? 1.25 : 1);
      const F = { x: sway * 0.92, y: fy, s: fs, n: 2, gap: sp === 'owl' ? 20 : 17, er: sp === 'owl' ? 7.2 : 5.6, fill: `url(#${cid}a)`, mouth: sp === 'goat' ? 'none' : 'smirk', bored: sp === 'cat' ? 0.42 : sp === 'goat' ? 0.3 : 0.1, my: fy + 11 * fs, mw: 12 };
      g.push(face(F, eye, S.lidV, S.look, S, I));
      if (sp === 'goat') g.push(`<path d="M${f1(F.x - 4 * k)} ${f1(fy + 12 * k)}q${f1(4 * k)} ${f1(10 * k)} ${f1(8 * k)} 0Z" fill="#FF8AD8"/>` + stroke(`M${f1(F.x - 3 * k)} ${f1(fy + 9 * k)}q${f1(3 * k)} ${f1(2 * k)} ${f1(6 * k)} 0`, 1.4));
      // yanaklar şişer (üfleme / içme)
      if (S.verb === 'sip' || I.float > 0.2) g.push(`<ellipse cx="${f1(F.x + 9 * fs)}" cy="${f1(fy + 9 * fs)}" rx="${f1(5 * fs)}" ry="${f1(4 * fs)}" fill="url(#${cid}a)" stroke="${LINE}" stroke-width="1.4"/>`);
      g.push(acc(sp, stage, ids, [F.x, topY - h * 0.04, w * 1.9, fy + 14 * fs, F.x, fy, F.gap * fs + F.er * 2 * fs]));
      const [ca, cb] = PAL[sp];
      const defs = lin(cid + 'a', ca, cb, -h * 1.05, 0) + glow(cid + 'h', ca);
      const I2 = { ...I, lift: I.lift + hop * 12 };
      return wrap(me, I2, S, g.join(''), h, defs);
    },
  };
  return me;
}

// ---------------------------------------------------------------- damla (köpek)
function makeBlob(sp, stage, ids) {
  const u = stage / 5, k = lerp(0.55, 1, u), cid = 'lm' + (++cidSeq);
  const H = 56 * k, W = 34 * k;
  const me = {
    cid, gait: 'hop', hop: 28, front: true, air: 0, cycle: () => 28,
    frame(S) {
      const I = intent(S.verb, S.cu, S.cT, S.ce, S.mood, S.t), eye = eyeState(S.mood, I, S.lidV, S.base);
      const hop = S.moving ? bell(S.ph > 0.28 ? (S.ph - 0.28) / 0.72 : 0) : 0, land = S.moving && S.ph <= 0.28 ? bell(S.ph / 0.28) : 0;
      const b = 0.025 * Math.sin(S.t * 1.8);
      const h = H * (1 + b - 0.16 * land + 0.12 * hop - 0.22 * I.crouch - 0.12 * I.headDown), w = W * (1 - b + 0.14 * land - 0.05 * hop + 0.12 * I.crouch);
      const sway = 2.5 * Math.sin(S.t * 1.1) * k + 8 * (I.sway + I.headTilt + I.lean + 0.6 * I.push) * k;
      const pts = [];
      for (let i = 0; i <= 12; i++) { const a = Math.PI - (i / 12) * Math.PI, r = 1 + 0.04 * Math.sin(a * 3 + S.t); pts.push([Math.cos(a) * w * r + sway * Math.sin(a) ** 2, -Math.sin(a) * h * r - (a > 0.2 && a < 2.94 ? 0 : 0)]); }
      pts.push([w * 1.12, 0], [-w * 1.12, 0]);
      const g = [`<ellipse cx="0" cy="${f1(-h * 0.5)}" rx="${f1(w * 2)}" ry="${f1(h)}" fill="url(#${cid}h)"/>`];
      // sarkık loblar (kulak) — yakın/uzak, mutlulukta havalanır
      const flap = rad(-30 * I.earsBack + 26 * I.earsUp + 20 * (I.wag || 0) + (S.moving ? 18 * Math.sin(TAU * S.ph) : 4 * Math.sin(S.t * 1.3)));
      for (const sd of [-1, 1]) {
        const p = [sd * w * 0.78 + sway * 0.7, -h * 0.78], L = h * 0.62, a = sd * (0.25 + flap * 0.5);
        const tip = [p[0] + Math.sin(a) * L * 0.4 + sd * w * 0.12, p[1] + Math.cos(a) * L];
        g.push(`<path d="${curve([p, [p[0] + sd * w * 0.32, p[1] + L * 0.3], tip, [p[0] + sd * w * 0.02, p[1] + L * 0.55]], true)}" fill="url(#${cid}b)"/>`);
      }
      g.push(`<path d="${curve(pts, true)}" fill="url(#${cid}a)"/>`);
      const fy = -h * 0.62, fs = k;
      const F = { x: sway * 0.8, y: fy, s: fs, n: 2, gap: 17, er: 5.4, fill: `url(#${cid}a)`, mouth: 'grin', bored: 0.15, my: fy + 12 * fs, mw: 16 };
      g.push(face(F, eye, S.lidV, S.look, S, I));
      g.push(acc(sp, stage, ids, [F.x, -h, w * 1.7, fy + 16 * fs, F.x, fy, F.gap * fs + 11 * fs]));
      const [ca, cb] = PAL[sp];
      const defs = lin(cid + 'a', ca, cb, -h, 0) + lin(cid + 'b', cb, '#1B1690', -h, 0) + glow(cid + 'h', ca);
      return wrap(me, { ...I, lift: I.lift + hop * 14 }, S, g.join(''), h, defs);
    },
  };
  return me;
}

// ---------------------------------------------------------------- denizanası (balina)
function makeJelly(sp, stage, ids) {
  const u = stage / 5, k = lerp(0.55, 1, u), cid = 'lm' + (++cidSeq);
  const R = 26 * k, nT = stage >= 3 ? 5 : stage >= 1 ? 4 : 3;
  const me = {
    cid, gait: 'float', front: false, air: 0, cycle: () => 90,
    frame(S) {
      const I = intent(S.verb, S.cu, S.cT, S.ce, S.mood, S.t), eye = eyeState(S.mood, I, S.lidV, S.base);
      const asleep = S.asleep && S.base !== 'dead';
      const hover = (S.base === 'dead' ? R * 0.2 : asleep ? 22 : 40) * (0.6 + 0.4 * k) + (S.moving ? 0 : 4 * Math.sin(S.t * 1.1));
      // nabız (yüzme itişi): baş daralıp genişler, dokunaçlar onu izler
      const pulse = S.moving ? Math.sin(TAU * S.ph * 2) : Math.sin(S.t * 1.7) * 0.6;
      // hızda kuyruklu yıldız gibi uzar (iz)
      const smear = S.moving ? (S.run ? 0.45 : 0.18) : 0.6 * Math.abs(I.push);
      const rx = R * (1 + 0.06 * pulse + smear * 0.5), ry = R * (0.92 - 0.06 * pulse);
      const cy = -hover - R;
      const g = [`<ellipse cx="0" cy="${f1(cy)}" rx="${f1(R * 2.1)}" ry="${f1(R * 1.8)}" fill="url(#${cid}h)"/>`];
      // dokunaçlar
      for (let i = 0; i < nT; i++) {
        const q = nT === 1 ? 0.5 : i / (nT - 1), x0 = (-0.7 + 1.3 * q) * rx - smear * R * 0.7, len = R * (0.95 + 0.25 * Math.sin(i * 1.7)) * (1 + 0.15 * pulse);
        const sw = (S.moving ? -8 - 14 * smear : 0) + 4 * Math.sin(S.t * 2 + i) - 10 * I.flap;
        const pts = [[x0, cy + ry * 0.55]];
        for (let j = 1; j <= 4; j++) pts.push([x0 + sw * (j / 4) * 1.2 + 3 * Math.sin(S.t * 2.6 - j * 0.9 + i), cy + ry * 0.55 + len * j / 4]);
        g.push(`<path d="${curve(pts, false)}" fill="none" stroke="url(#${cid}a)" stroke-width="${f1(lerp(9, 5, i % 2) * k)}" stroke-linecap="round"/>`);
      }
      // baş (uzayan iz geride sivrilir)
      const head = [];
      for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU, back = Math.cos(a) < 0 ? 1 + smear * 1.4 * Math.pow(-Math.cos(a), 3) : 1; head.push([Math.cos(a) * rx * back, cy + Math.sin(a) * ry * (Math.sin(a) > 0 ? 0.75 : 1)]); }
      g.push(`<path d="${curve(head, true)}" fill="url(#${cid}a)"/>`);
      // minicik melon şapka
      if (stage >= 2) { const hx = rx * 0.15, hy = cy - ry * 0.98; g.push(`<path d="M${f1(hx - 7 * k)} ${f1(hy)}h${f1(14 * k)}l${f1(-2.5 * k)} -1.4h${f1(-9 * k)}Z" fill="${LINE}"/><path d="M${f1(hx - 4.4 * k)} ${f1(hy - 1)}q0 ${f1(-6.5 * k)} ${f1(4.4 * k)} ${f1(-6.5 * k)}t${f1(4.4 * k)} ${f1(6.5 * k)}Z" fill="${LINE}"/>`); }
      // tek göz: camgöbeği yama + koyu oval bebek (dev göz) ya da çizgi göz
      const ex = rx * 0.32, ey = cy + ry * 0.05, er = R * 0.3;
      if (eye === 'open' || eye === 'wide' || eye === 'dizzy' || eye === 'sad' || eye === 'angry' || eye === 'sleepy' || eye === 'squint') {
        g.push(`<ellipse cx="${f1(ex)}" cy="${f1(ey)}" rx="${f1(er * 1.15)}" ry="${f1(er * 0.95)}" fill="#57F7F0"/>`);
        const px = S.look * er * 0.3 + (eye === 'dizzy' ? Math.cos(S.t * 9) * er * 0.4 : 0), pr = eye === 'wide' ? 0.3 : 0.45;
        g.push(`<ellipse cx="${f1(ex + px + er * 0.15)}" cy="${f1(ey + 1)}" rx="${f1(er * pr * 0.75)}" ry="${f1(er * pr * 1.25)}" fill="${LINE}"/>`);
        const L = Math.max(S.lidV, eye === 'sleepy' ? 0.55 : eye === 'squint' ? 0.5 : eye === 'sad' || eye === 'angry' ? 0.42 : 0.3);
        if (L > 0.03) { const yl = ey - er * 0.95 + 2 * er * 0.95 * L; g.push(`<path d="M${f1(ex - er * 1.25)} ${f1(ey - er * 1.1)}H${f1(ex + er * 1.25)}V${f1(yl + (eye === 'angry' ? er * 0.3 : 0))}L${f1(ex - er * 1.25)} ${f1(yl + (eye === 'sad' ? er * 0.3 : 0))}Z" fill="url(#${cid}a)"/>` + stroke(`M${f1(ex - er * 1.15)} ${f1(yl + (eye === 'sad' ? er * 0.3 : 0))}L${f1(ex + er * 1.15)} ${f1(yl + (eye === 'angry' ? er * 0.3 : 0))}`, 1.6)); }
      } else g.push(face({ x: ex, y: ey, s: k * 1.3, n: 1, gap: 0, er: 6, fill: `url(#${cid}a)`, mouth: 'none' }, eye, S.lidV, S.look, S, I));
      g.push(acc(sp, stage, ids, [rx * 0.15, cy - ry, rx * 1.8, cy + ry * 0.5, ex, ey, er * 2.4]));
      const [ca, cb] = PAL[sp];
      const defs = lin(cid + 'a', ca, cb, cy - ry, cy + ry * 2.2) + glow(cid + 'h', cb);
      return wrap(me, I, S, g.join(''), hover + R * 2, defs);
    },
  };
  return me;
}

// ---------------------------------------------------------------- yılan (kertenkele)
function makeSerpent(sp, stage, ids) {
  const u = stage / 5, k = lerp(0.55, 1, u), cid = 'lm' + (++cidSeq);
  const len = 104 * k, T = 21 * k;
  const me = {
    cid, gait: 'walk', front: false, air: 0,
    // dalga gövde boyunca geriye akar; bir dalga boyu kadar ilerlemede bir döngü (yere göre kayma yok)
    cycle: run => len * 0.55,
    frame(S) {
      const I = intent(S.verb, S.cu, S.cT, S.ce, S.mood, S.t), eye = eyeState(S.mood, I, S.lidV, S.base);
      const asleep = S.asleep && S.base !== 'dead';
      const ph = S.moving ? S.ph * TAU : S.t * 0.8;
      const amp = (S.moving ? 10 : asleep ? 3 : 7) * k + 6 * Math.abs(I.wag) * k;
      const rise = (asleep ? 2 : 30 + 14 * I.headUp - 20 * I.headDown + 10 * I.puff + 3 * Math.sin(S.t * 1.1)) * k - I.crouch * 14 * k;
      const N = 16, sp2 = [];
      for (let i = 0; i <= N; i++) {
        const q = i / N, x = len * 0.42 - len * q;
        const head = Math.max(0, 1 - q / 0.38);
        sp2.push([x + (I.push * 10 * k) * head - rise * 0.35 * head * head, -T * 0.5 - amp * Math.sin(ph * 1 + q * TAU * 1.1) * (0.3 + 0.7 * q) * (1 - head) - rise * head * head]);
      }
      const prof = q => T * (q < 0.12 ? 0.9 + 0.1 * Math.sin(q / 0.12 * Math.PI / 2) : lerp(1, 0.12, Math.pow((q - 0.12) / 0.88, 1.3)));
      const L = [], R = [];
      for (let i = 0; i <= N; i++) {
        const a = sp2[Math.max(0, i - 1)], b = sp2[Math.min(N, i + 1)];
        let dx = b[0] - a[0], dy = b[1] - a[1]; const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
        const w = prof(i / N) / 2;
        L.push([sp2[i][0] - dy * w, sp2[i][1] + dx * w]); R.push([sp2[i][0] + dy * w, sp2[i][1] - dx * w]);
      }
      const nose = add(sp2[0], [T * 0.62, -T * 0.05]);
      const g = [`<path d="${curve([nose, ...R, ...L.reverse()], true)}" fill="url(#${cid}a)"/>`, `<ellipse cx="${f1(sp2[0][0] + T * 0.15)}" cy="${f1(sp2[0][1] - T * 0.1)}" rx="${f1(T * 0.82)}" ry="${f1(T * 0.7)}" fill="url(#${cid}a)"/>`];
      // gövde boyunca iç çizgi (LUME yılanının imzası)
      const inner = sp2.slice(3, N - 2).map((p, i) => [p[0], p[1] - prof((i + 3) / N) * 0.18]);
      g.push(stroke(curve(inner, false), 1.5));
      if (stage >= 2) g.push(stroke(curve(sp2.slice(5, N - 4).map((p, i) => [p[0], p[1] + prof((i + 5) / N) * 0.22]), false), 1.3));
      // baş: tek iri göz + sırıtış
      const hp = sp2[0], ha = Math.atan2(sp2[0][1] - sp2[2][1], sp2[0][0] - sp2[2][0]) * 57.3;
      const F = { x: T * 0.1, y: -T * 0.3, s: k * 1.3, n: 1, gap: 0, er: 6.2, fill: `url(#${cid}a)`, mouth: 'grin', bored: 0.05, mx: T * 0.18, my: T * 0.25, mw: 14 };
      g.push(`<g transform="translate(${f1(hp[0])} ${f1(hp[1])}) rotate(${f1(clamp(ha, -40, 40))})">${face(F, eye, S.lidV, S.look * 0.5 + 0.4, S, I)}${acc(sp, stage, ids, [0, -T * 0.6, T * 1.3, T * 0.5, 0, -T * 0.18, 13 * k])}</g>`);
      const [ca, cb] = PAL[sp];
      return wrap(me, I, S, g.join(''), T + rise, lin(cid + 'a', ca, cb, -T * 1.4 - rise, 0));
    },
  };
  return me;
}

// ---------------------------------------------------------------- asteroit → kuyruklu yıldız (civciv → tavus)
function makeComet(sp, stage, ids) {
  const k = [0.52, 0.62, 0.74, 0.86, 0.92, 1][stage], cid = 'lm' + (++cidSeq), R = 22 * k, comet = stage >= 4;
  const jag = Array.from({ length: 10 }, (_, i) => 1 + 0.09 * Math.sin(i * 2.7 + stage));
  const me = {
    cid, gait: stage === 0 ? 'hop' : 'float', hop: 22, front: false, air: 0, cycle: () => 70,
    frame(S) {
      const I = intent(S.verb, S.cu, S.cT, S.ce, S.mood, S.t), eye = eyeState(S.mood, I, S.lidV, S.base);
      const asleep = S.asleep && S.base !== 'dead';
      const hop = stage === 0 && S.moving ? bell(S.ph > 0.28 ? (S.ph - 0.28) / 0.72 : 0) * 10 : 0;
      const hover = stage === 0 ? 0 : (asleep ? 10 : 22) + (S.moving ? 0 : 3 * Math.sin(S.t * 1.3)) + 4 * k;
      const cy = -hover - R, rotA = (S.moving ? S.ph * 360 * 0.25 : 5 * Math.sin(S.t * 0.6)) + 20 * I.headTilt;
      const g = [`<ellipse cx="0" cy="${f1(cy)}" rx="${f1(R * 2)}" ry="${f1(R * 1.8)}" fill="url(#${cid}h)"/>`];
      // kuyruk alevi: geriye doğru dalgalanan degrade şerit
      if (comet || (S.moving && stage > 0)) {
        const TL = (comet ? 62 : 26) * k * (S.moving ? 1.2 : 1) * (1 + 0.3 * I.puff + 0.4 * (S.verb === 'ability' ? bell(S.cu) : 0));
        const fan = comet ? clamp((S.mood === 'happy' || S.mood === 'love' ? 0.6 : 0) + I.puff, 0, 1) : 0;
        for (const [o, w] of [[0.5, 1], [-0.45, 0.8], [0, 1.2]]) {
          const pts = [];
          for (let j = 0; j <= 6; j++) { const q = j / 6; pts.push([-R * 0.5 - TL * q, cy + (o * R * 0.9 + fan * o * 18 * q) * (1 - 0.3 * q) - 5 * k * Math.sin(S.t * 3 - q * 4 + o * 3) * q - fan * 10 * q * (o === 0 ? 1 : 0)]); }
          const n = pts.length, L = [], Rr = [];
          for (let i = 0; i < n; i++) { const ww = R * 0.55 * w * (1 - i / (n - 1)) + 0.5; L.push([pts[i][0], pts[i][1] - ww]); Rr.push([pts[i][0], pts[i][1] + ww]); }
          g.push(`<path d="${curve([...L, ...Rr.reverse()], true)}" fill="url(#${cid}t)" opacity="${o === 0 ? 1 : 0.85}"/>`);
        }
      }
      // taş gövde (hafif köşeli yuvarlak)
      const pts = jag.map((j, i) => { const a = (i / jag.length) * TAU; return [Math.cos(a) * R * j, cy + Math.sin(a) * R * j * 0.94]; });
      g.push(`<g transform="rotate(${f1(rotA * 0.3)} 0 ${f1(cy)})"><path d="${curve(pts, true, 0.9)}" fill="url(#${cid}a)"/>`);
      // krater benekleri
      g.push(`<circle cx="${f1(-R * 0.45)}" cy="${f1(cy + R * 0.45)}" r="${f1(R * 0.14)}" fill="${PAL[sp][1]}" opacity=".55"/><circle cx="${f1(-R * 0.62)}" cy="${f1(cy - R * 0.1)}" r="${f1(R * 0.08)}" fill="${PAL[sp][1]}" opacity=".55"/></g>`);
      // tepe tüyü (tavus tacı)
      if (stage >= 2) for (let i = 0; i < (comet ? 3 : 1); i++) { const bx = R * (0.05 + 0.18 * i), tip = [bx + 3 * Math.sin(S.t * 2 + i), cy - R * (1.55 + 0.1 * i)]; g.push(stroke(`M${f1(bx)} ${f1(cy - R * 0.85)}Q${f1(bx - 3)} ${f1(cy - R * 1.2)} ${f1(tip[0])} ${f1(tip[1])}`, 1.6) + `<circle cx="${f1(tip[0])}" cy="${f1(tip[1])}" r="${f1(2.6 * k + 0.8)}" fill="#FF5FD2"/>`); }
      const F = { x: R * 0.32, y: cy - R * 0.12, s: k * 1.1, n: stage === 0 ? 2 : 1, gap: 12, er: stage === 0 ? 4.6 : 6.4, fill: `url(#${cid}a)`, mouth: 'smirk', bored: 0.2, mx: R * 0.4, my: cy + R * 0.42, mw: 9 };
      g.push(face(F, eye, S.lidV, S.look * 0.6 + 0.3, S, I));
      g.push(acc(sp, stage, ids, [R * 0.2, cy - R, R * 1.9, cy + R * 0.6, F.x, F.y, 13 * k]));
      const [ca, cb] = PAL[sp];
      const defs = lin(cid + 'a', ca, cb, cy - R, cy + R) + `<linearGradient id="${cid}t" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#FF5FD2"/><stop offset=".5" stop-color="#FFB347" stop-opacity=".85"/><stop offset="1" stop-color="#FFE45C" stop-opacity="0"/></linearGradient>` + glow(cid + 'h', ca);
      return wrap(me, { ...I, lift: I.lift + hop }, S, g.join(''), hover + R * 2, defs);
    },
  };
  return me;
}

// ---------------------------------------------------------------- periskop (Buz Bodur)
function makeStalk(sp, stage, ids) {
  const u = stage / 5, k = lerp(0.56, 1, u), cid = 'lm' + (++cidSeq);
  const SH = lerp(22, 58, u), ER = 13 * k;
  const me = {
    cid, gait: 'hop', hop: 24, front: false, air: 0, cycle: () => 24,
    frame(S) {
      const I = intent(S.verb, S.cu, S.cT, S.ce, S.mood, S.t), eye = eyeState(S.mood, I, S.lidV, S.base);
      const asleep = S.asleep && S.base !== 'dead';
      const hop = S.moving ? bell(S.ph > 0.28 ? (S.ph - 0.28) / 0.72 : 0) : 0;
      // birikintiden yükselip alçalır (sink/rise), sap esner
      const h = SH * (asleep ? 0.35 : 1) * (1 - 0.3 * I.crouch + 0.25 * I.headUp - 0.3 * I.headDown + 0.15 * hop) + 3 * Math.sin(S.t * 1.2);
      const bend = 6 * Math.sin(S.t * 0.9) + 14 * I.sway + 10 * I.headTurn + 10 * (I.lean + I.push) + (S.moving ? 8 : 0);
      const top = [bend, -h - ER * 0.4];
      const g = [];
      // birikinti + halka dalgalar
      const pw = (26 + 6 * k) * k + 6;
      g.push(`<ellipse cx="0" cy="-1" rx="${f1(pw)}" ry="${f1(pw * 0.22)}" fill="#57F7F0"/><ellipse cx="0" cy="-1" rx="${f1(pw * 0.92)}" ry="${f1(pw * 0.17)}" fill="none" stroke="#C9FFFB" stroke-width="1"/>`);
      const rq = (S.t * 0.6) % 1;
      g.push(`<ellipse cx="0" cy="-1" rx="${f1(8 + pw * 0.8 * rq)}" ry="${f1((8 + pw * 0.8 * rq) * 0.2)}" fill="none" stroke="${WHITE}" stroke-width="1.2" opacity="${f1(1 - rq)}"/>`);
      // sap (sivrilen, aşağıda kalın)
      const st = [[0, 0], [bend * 0.15, -h * 0.35], [bend * 0.6, -h * 0.75], top];
      const n = st.length, L = [], R = [];
      for (let i = 0; i < n; i++) { const w = lerp(10, 6, i / (n - 1)) * k / 2 + 1.5; L.push([st[i][0] - w, st[i][1]]); R.push([st[i][0] + w, st[i][1]]); }
      g.push(`<path d="${curve([...R, ...L.reverse()], true)}" fill="url(#${cid}a)"/>`);
      g.push(`<ellipse cx="0" cy="-1" rx="${f1(9 * k + 2)}" ry="${f1(2.4 * k + 1)}" fill="${PAL[sp][1]}" opacity=".6"/>`);
      // göz küresi (ezilip uzar)
      const sq = (S.verb === 'jump' || S.verb === 'ability' ? 0.25 * bell(S.cu) : 0) + 0.05 * Math.sin(S.t * 2.2);
      const ex = top[0], ey = top[1] - ER * 0.4, rx = ER * (1 - sq * 0.4), ry = ER * (1 + sq);
      g.push(`<ellipse cx="${f1(ex)}" cy="${f1(ey)}" rx="${f1(rx * 1.12)}" ry="${f1(ry * 1.12)}" fill="url(#${cid}a)"/>`);
      if (eye === 'closed' || eye === 'happy' || eye === 'x' || eye === 'hurt') g.push(face({ x: ex, y: ey, s: k * 1.6, n: 1, gap: 0, er: 6, fill: `url(#${cid}a)`, mouth: 'none' }, eye, S.lidV, 0, S, I));
      else {
        g.push(`<ellipse cx="${f1(ex + rx * 0.08)}" cy="${f1(ey)}" rx="${f1(rx * 0.86)}" ry="${f1(ry * 0.62)}" fill="${WHITE}" stroke="${LINE}" stroke-width="1.4"/>`);
        const pr = eye === 'wide' ? 0.22 : 0.36, px = (S.look * 0.4 + 0.25) * rx * 0.4 + (eye === 'dizzy' ? Math.cos(S.t * 9) * rx * 0.3 : 0);
        g.push(`<ellipse cx="${f1(ex + px)}" cy="${f1(ey)}" rx="${f1(rx * pr * 0.75)}" ry="${f1(ry * pr)}" fill="${LINE}"/>`);
        const Lc = Math.max(S.lidV, eye === 'sleepy' ? 0.55 : eye === 'squint' || eye === 'sad' || eye === 'angry' ? 0.45 : 0.32);
        const yl = ey - ry * 0.62 + 2 * ry * 0.62 * Lc;
        g.push(`<path d="M${f1(ex - rx)} ${f1(ey - ry)}H${f1(ex + rx * 1.1)}V${f1(yl)}H${f1(ex - rx)}Z" fill="url(#${cid}a)"/>` + stroke(`M${f1(ex - rx * 0.78)} ${f1(yl + (eye === 'sad' ? 2 : 0))}L${f1(ex + rx * 0.92)} ${f1(yl + (eye === 'angry' ? 2 : 0))}`, 1.5));
      }
      if (I.tears > 0.05) { const q = (S.t * 1.4) % 1; g.push(`<path d="M${f1(ex)} ${f1(ey + ry + q * 10)}q-2.4 3.4 0 5.2q2.4-1.8 0-5.2Z" fill="#7FF7EE" opacity="${f1(I.tears * (1 - q))}"/>`); }
      g.push(acc(sp, stage, ids, [ex, ey - ry * 1.1, rx * 2.1, ey + ry, ex, ey, rx * 0.5]));
      const [ca, cb] = PAL[sp];
      return wrap(me, { ...I, lift: I.lift + hop * 10, squash: I.squash }, S, g.join(''), h + ER * 2, lin(cid + 'a', ca, cb, -h - ER * 2, 0));
    },
  };
  return me;
}

// ---------------------------------------------------------------- filiz
function makeSprout(sp, stage, ids) {
  const u = stage / 5, k = lerp(0.55, 1, u), cid = 'lm' + (++cidSeq);
  const me = {
    cid, gait: 'hop', hop: 20, front: true, air: 0, cycle: () => 20,
    frame(S) {
      const I = intent(S.verb, S.cu, S.cT, S.ce, S.mood, S.t), eye = eyeState(S.mood, I, S.lidV, S.base);
      const hop = S.moving ? bell(S.ph > 0.28 ? (S.ph - 0.28) / 0.72 : 0) : 0;
      const g = [];
      const SH = [6, 22, 32, 40, 46, 52][stage] * (1 - 0.25 * I.headDown + 0.15 * I.headUp + 0.1 * hop), sway = 4 * Math.sin(S.t * 0.7) + 10 * (I.sway + I.headTilt + I.headTurn * 0.6);
      const top = [sway, -SH];
      // toprak tümseği
      g.push(`<ellipse cx="0" cy="0" rx="${f1(20 * k + 6)}" ry="${f1(5 * k + 2)}" fill="url(#${cid}b)"/>`);
      if (stage > 0) {
        g.push(stroke(`M0 0Q${f1(sway * 0.2)} ${f1(-SH * 0.55)} ${f1(top[0])} ${f1(top[1])}`, 5.5 * k + 1, `url(#${cid}s)`));
        // damla yapraklar (kollar)
        const la = 0.35 + 0.25 * Math.sin(S.t * 0.7 + 1) + 0.6 * Math.max(0, -I.flap) + 0.4 * I.flap * Math.sin(S.t * 20);
        const lp = [sway * 0.25, -SH * 0.42];
        for (const sd of [-1, 1]) { const L = 16 * k + 4, a = sd * (1.1 - la * 0.5); const tip = [lp[0] + Math.sin(a) * L, lp[1] - Math.cos(a) * L]; g.push(`<path d="${curve([lp, [lp[0] + Math.sin(a - sd * 0.5) * L * 0.6, lp[1] - Math.cos(a - sd * 0.5) * L * 0.6], tip, [lp[0] + Math.sin(a + sd * 0.4) * L * 0.6, lp[1] - Math.cos(a + sd * 0.4) * L * 0.6]], true)}" fill="url(#${cid}s)"/>`); }
      }
      // tomurcuk baş (büyüdükçe taç yapraklar açılır)
      const HR = [10, 12, 14, 15, 16, 19][stage] * (stage === 0 ? 1 : k * 1.15), cy = stage === 0 ? -HR * 0.85 : top[1] - HR * 0.7;
      const open = clamp(u * 1.2 - 0.2 + 0.4 * I.puff + (S.mood === 'happy' ? 0.2 : 0), 0, 1);
      g.push(`<ellipse cx="${f1(top[0])}" cy="${f1(cy)}" rx="${f1(HR * 2.2)}" ry="${f1(HR * 2)}" fill="url(#${cid}h)"/>`);
      const np = stage >= 2 ? 5 : 0;
      for (let i = 0; i < np; i++) { const a = -Math.PI / 2 + (i - (np - 1) / 2) * (0.45 + 0.35 * open) + 0.05 * Math.sin(S.t + i), L = HR * (0.9 + 0.5 * open); const b = [top[0] + Math.cos(a) * HR * 0.4, cy + Math.sin(a) * HR * 0.4], tip = [top[0] + Math.cos(a) * (HR * 0.4 + L), cy + Math.sin(a) * (HR * 0.4 + L)]; g.push(`<path d="${curve([b, [b[0] + Math.cos(a + 0.5) * L * 0.6, b[1] + Math.sin(a + 0.5) * L * 0.6], tip, [b[0] + Math.cos(a - 0.5) * L * 0.6, b[1] + Math.sin(a - 0.5) * L * 0.6]], true)}" fill="url(#${cid}b)"/>`); }
      g.push(`<path d="${curve([[top[0], cy - HR * 1.08], [top[0] + HR, cy - HR * 0.2], [top[0] + HR * 0.8, cy + HR * 0.8], [top[0] - HR * 0.8, cy + HR * 0.8], [top[0] - HR, cy - HR * 0.2]], true)}" fill="url(#${cid}a)"/>`);
      const F = { x: top[0], y: cy + HR * 0.05, s: k * (stage === 0 ? 0.9 : 1.05), n: 2, gap: 11, er: 3.8, fill: `url(#${cid}a)`, mouth: 'smirk', bored: 0.35, my: cy + HR * 0.55, mw: 8 };
      g.push(face(F, eye === 'open' && !S.moving && S.mood === 'idle' && cyc(S.t, 10, 0.2, 0.6) > 0.5 ? 'closed' : eye, S.lidV, S.look, S, I));
      g.push(acc(sp, stage, ids, [top[0], cy - HR * 1.08, HR * 2, cy + HR * 0.8, F.x, F.y, 18 * F.s]));
      const [ca, cb] = PAL[sp];
      const defs = lin(cid + 'a', ca, cb, cy - HR, cy + HR) + lin(cid + 'b', '#FFE45C', '#FF5FD2', cy - HR * 2, 0) + lin(cid + 's', '#7FF7EE', '#3B7BFF', -SH, 0) + glow(cid + 'h', ca);
      return wrap(me, { ...I, lift: I.lift + hop * 10 }, S, g.join(''), SH + HR * 2, defs);
    },
  };
  return me;
}

export function makeLume(species, stage, coat, ids) {
  stage = clamp(stage | 0, 0, 5);
  if (species === 'cat' || species === 'owl' || species === 'goat') return makeMonolith(species, stage, ids);
  if (species === 'dog') return makeBlob(species, stage, ids);
  if (species === 'whale') return makeJelly(species, stage, ids);
  if (species === 'gecko') return makeSerpent(species, stage, ids);
  if (species === 'chick') return makeComet(species, stage, ids);
  if (species === 'doodle') return makeStalk(species, stage, ids);
  return makeSprout(species, stage, ids);
}
