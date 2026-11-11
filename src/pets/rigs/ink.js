// dam-la — Set 1 "Gölge": kendi iskeleti olan siluet petler (sıfırdan; klasik parça ağaçları KULLANILMAZ).
// Referans tarzın kuralları (Petbarn yeniden markalama videosundan izlenen): düz kömür siyahı tek renk siluet, iç çizgi yok,
// hafif düzensiz el kesimi kenar; iri baş + kalın belirgin boyun; kısa yumuşak bacaklar; beyaz "O" gözler (iri siyah bebek),
// mutlulukta hilal göz; ince, ifadeli kuyruk; poz odaklı keskin hareket (sinsi alçalma, gerinme, dik oturuş, somun uyku...).
// Karakterler bizim türlerimizin özgün çizimleridir (kedi, köpek, civciv/tavus, baykuş, kertenkele, keçi, balina, Buz Bodur, filiz).
//
// İskeletler:
//  · dört ayaklı (kedi, köpek, keçi, bodur): omurga (sağrı→göğüs), boyun, baş; dört bacak ikişer kemikli ters kinematikle,
//    ayaklar yürüyüşte yere sabit; 7 halkalı kuyruk zinciri.
//  · kuş (civciv/tavus): gövde, boyun, baş, iki çubuk bacak (adımda tavuk gibi baş sabitleme), kanat, kuyruk/kuyruk yelpazesi.
//  · baykuş (önden): gövde, boyun boğumu, baş, kulak püskülleri, kanatlar.
//  · kertenkele: alçak gövde, kısa kalın boyun, yana açık dirsekli dört bacak, sivrilen uzun kuyruk, sırt dikenleri.
//  · balina: dalgalanan omurga boyunca sivrilen gövde, kuyruk yüzgeci, yüzgeç.
//  · filiz: sap (boyun), baş (tohum/çiçek/lale/saksı/ağaç), yaprak kollar.
import { clamp, lerp, bell, ease, TAU, f1, rad, cyc, rng, curve, ik, damp, dampObj, stride, intent, eyeState } from './kit.js';
import { accSVG } from '../acc.js';

const INK = '#1B1918', WHITE = '#FFFFFF';
export const inkSet = {
  id: 'shadow',
  shadowFill: '#B07D06',
  defs: () => '',
  back: () => '',
};

// ---------------------------------------------------------------- gözler
// e: [{x,y,r}] — baş yerel koordinatı. dir: bakış (+x ileri). state: open|happy|sad|angry|wide|sleepy|squint|closed|x|dizzy|hurt
function eyesSVG(es, state, lid, lookX, lookY, t, tears) {
  let s = '';
  for (let i = 0; i < es.length; i++) {
    const { x, y, r } = es[i];
    if (state === 'closed') { s += `<path d="M${f1(x - r)} ${f1(y)}Q${f1(x)} ${f1(y + r * 0.7)} ${f1(x + r)} ${f1(y)}" fill="none" stroke="${WHITE}" stroke-width="${f1(Math.max(1.3, r * 0.32))}" stroke-linecap="round"/>`; continue; }
    if (state === 'x') { const q = r * 0.7; s += `<path d="M${f1(x - q)} ${f1(y - q)}L${f1(x + q)} ${f1(y + q)}M${f1(x + q)} ${f1(y - q)}L${f1(x - q)} ${f1(y + q)}" stroke="${WHITE}" stroke-width="${f1(r * 0.38)}" stroke-linecap="round"/>`; continue; }
    if (state === 'hurt') { const q = r * 0.75, d = i % 2 ? -1 : 1; s += `<path d="M${f1(x - q * d)} ${f1(y - q)}L${f1(x + q * d)} ${f1(y)}L${f1(x - q * d)} ${f1(y + q)}" fill="none" stroke="${WHITE}" stroke-width="${f1(r * 0.36)}" stroke-linecap="round" stroke-linejoin="round"/>`; continue; }
    const R = state === 'wide' ? r * 1.14 : r;
    // mutlu: yalnızca beyaz hilal (alt yay) — siyah örtü kullanılmaz, baş dışına taşmaz
    if (state === 'happy') { s += `<path d="M${f1(x - R)} ${f1(y - R * 0.1)}A${f1(R)} ${f1(R)} 0 0 0 ${f1(x + R)} ${f1(y - R * 0.1)}A${f1(R)} ${f1(R * 0.5)} 0 0 1 ${f1(x - R)} ${f1(y - R * 0.1)}Z" fill="${WHITE}"/>`; continue; }
    s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(R)}" fill="${WHITE}"/>`;
    let pr = state === 'wide' ? r * 0.36 : r * 0.62, px = lookX * r * 0.3, py = lookY * r * 0.25;
    if (state === 'dizzy') { px = Math.cos(t * 9 + i) * r * 0.32; py = Math.sin(t * 9 + i) * r * 0.32; pr = r * 0.45; }
    s += `<circle cx="${f1(x + px)}" cy="${f1(y + py)}" r="${f1(pr)}" fill="${INK}"/>`;
    // kapaklar: göz dairesinin bir çizginin üstünde kalan kısmı (dairenin dışına asla taşmaz)
    const side = i % 2 ? -1 : 1;
    let yl = null, yr = null;
    const L = state === 'sleepy' ? Math.max(lid, 0.55) : state === 'squint' ? Math.max(lid, 0.45) : lid;
    if (state === 'sad') { yl = y - R * 0.05; yr = y - R * 0.6; if (side < 0) [yl, yr] = [yr, yl]; }
    else if (state === 'angry') { yl = y - R * 0.6; yr = y + R * 0.05; if (side < 0) [yl, yr] = [yr, yl]; }
    else if (L > 0.02) { yl = yr = y - R + 2 * R * L; }
    if (yl != null) s += `<path d="${lidPath(x, y, R + 0.5, yl, yr, true)}" fill="${INK}"/>`;
    if (state === 'squint') s += `<path d="${lidPath(x, y, R + 0.5, y + R * 0.55, y + R * 0.55, false)}" fill="${INK}"/>`;
  }
  if (tears > 0.05 && es.length) {
    const e = es[0], q = (t * 1.6) % 1;
    s += `<path d="M${f1(e.x)} ${f1(e.y + e.r + q * 10)}q-2 3 0 4.6q2-1.6 0-4.6Z" fill="${WHITE}" opacity="${f1(tears * (1 - q))}"/>`;
  }
  return s;
}

// göz kapağı: (x,y,R) dairesinin, (x-R,yl)–(x+R,yr) çizgisinin üstünde (top) ya da altında kalan bölgesi
function lidPath(x, y, R, yl, yr, top) {
  const pts = [];
  for (let i = 0; i < 20; i++) {
    const a = i / 20 * TAU, px = x + Math.cos(a) * R, py = y + Math.sin(a) * R;
    const ly = lerp(yl, yr, (px - (x - R)) / (2 * R));
    pts.push([px, top ? Math.min(py, ly) : Math.max(py, ly)]);
  }
  return 'M' + pts.map(p => `${f1(p[0])} ${f1(p[1])}`).join('L') + 'Z';
}
// el kesimi düzensizliği: her şekil noktasına sabit (tohumlu) küçük sapma
function jitter(seed, n = 64, amt = 0.55) { const r = rng(seed); return Array.from({ length: n }, () => [(r() - 0.5) * 2 * amt, (r() - 0.5) * 2 * amt]); }
const J = (pts, jt, o = 0) => pts.map((p, i) => [p[0] + jt[(i + o) % jt.length][0], p[1] + jt[(i + o) % jt.length][1]]);
const rot = (p, a, c = [0, 0]) => { const s = Math.sin(a), co = Math.cos(a), x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * co - y * s, c[1] + x * s + y * co]; };
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const pt = (a, len) => [Math.cos(rad(a)) * len, -Math.sin(rad(a)) * len];   // açı (derece, yukarı +) → svg vektörü
const path = (d, extra = '') => `<path d="${d}"${extra}/>`;
const line = (pts, w) => `<path d="M${pts.map(p => `${f1(p[0])} ${f1(p[1])}`).join('L')}" fill="none" stroke="${INK}" stroke-width="${f1(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
const smoothLine = (pts, w) => `<path d="${curve(pts, false)}" fill="none" stroke="${INK}" stroke-width="${f1(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
// sivrilen şerit (kuyruk): omurga noktaları + kalınlık profili → kapalı şekil
function taper(sp, w0, w1) {
  const n = sp.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = sp[Math.max(0, i - 1)], b = sp[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
    const w = lerp(w0, w1, i / (n - 1)) / 2;
    L.push([sp[i][0] - dy * w, sp[i][1] + dx * w]); R.push([sp[i][0] + dy * w, sp[i][1] - dx * w]);
  }
  return curve([...L, ...R.reverse()], true);
}
function headAcc(sp, stage, ids, anch) { return ids && ids.length ? accSVG(sp, 'sit', stage, ids, anch) : ''; }

// ---------------------------------------------------------------- dört ayaklı
const QUAD = {
  cat: { L: 40, BH: 24, LEG: 21, LW: 9, NL: 11, NW: 14, HR: 16, neckA: 58, sitNeck: 84, tail: { len: 50, w: 3.4, a: 98, curl: -70 }, amp: 24, idle: 'sit' },
  dog: { L: 46, BH: 27, LEG: 22, LW: 10.5, NL: 10, NW: 17, HR: 18, neckA: 55, sitNeck: 82, tail: { len: 20, w: 5, a: 70, curl: 10 }, amp: 24, idle: 'sit' },
  goat: { L: 44, BH: 23, LEG: 30, LW: 6.5, NL: 16, NW: 11, HR: 13, neckA: 62, sitNeck: 70, tail: { len: 9, w: 5, a: 75, curl: 0 }, amp: 22, idle: 'stand' },
  doodle: { L: 34, BH: 30, LEG: 15, LW: 12, NL: 6, NW: 20, HR: 19, neckA: 70, sitNeck: 80, tail: { len: 7, w: 6, a: 120, curl: 0 }, amp: 20, idle: 'stand', box: true },
};

function quadHead(sp, HR, stage, st) {
  const { earBack, earUp, eye, lid, lookX, lookY, t, tears, flap } = st;
  const g = [], jt = st.jt;
  let es, anch;
  if (sp === 'cat') {
    const ea = rad(-28 * earBack + 10 * earUp);
    const ear = (bx0, bx1, tip, a) => { const c = [(bx0[0] + bx1[0]) / 2, (bx0[1] + bx1[1]) / 2]; return curve(J([bx0, rot(tip, a, c), bx1, c], jt, 7)); };
    g.push(path(ear([-HR * 0.62, -HR * 0.55], [-HR * 0.02, -HR * 0.8], [-HR * 0.42, -HR * 1.42], ea)));
    g.push(path(curve(J([[HR * 1.02, -HR * 0.08], [HR * 0.86, HR * 0.52], [HR * 0.2, HR * 0.8], [-HR * 0.62, HR * 0.68], [-HR * 1.02, HR * 0.08], [-HR * 0.82, -HR * 0.6], [-HR * 0.1, -HR * 0.84], [HR * 0.66, -HR * 0.66]], jt))));
    g.push(path(ear([HR * 0.02, -HR * 0.82], [HR * 0.74, -HR * 0.52], [HR * 0.52, -HR * 1.48], ea)));
    const r = HR * 0.3; es = [{ x: HR * 0.55, y: -HR * 0.06, r }, { x: HR * 0.55 - 2.3 * r, y: -HR * 0.1, r }];
    anch = [0, -HR * 0.95, HR * 1.9, HR * 0.75, HR * 0.55 - 1.15 * r, -HR * 0.08, 3.3 * r];
  } else if (sp === 'dog') {
    const ea = rad(28 * earBack - 30 * earUp + 22 * flap);
    g.push(path(curve(J([[HR * 0.72, -HR * 0.78], [HR * 1.02, -HR * 0.3], [HR * 1.3, HR * 0.02], [HR * 1.4, HR * 0.42], [HR * 1.04, HR * 0.74], [HR * 0.2, HR * 0.86], [-HR * 0.74, HR * 0.64], [-HR * 0.98, 0], [-HR * 0.72, -HR * 0.76], [0, -HR * 0.94]], jt))));
    g.push(path(curve(J([[HR * 0.2, -HR * 0.86], [HR * 0.44, -HR * 1.12], [HR * 0.66, -HR * 0.9], [HR * 0.62, -HR * 0.6]], jt, 11))));
    const piv = [-HR * 0.3, -HR * 0.7];
    g.push(path(curve(J([[-HR * 0.05, -HR * 0.82], [-HR * 0.62, -HR * 0.9], [-HR * 1.05, -HR * 0.35], [-HR * 1.12, HR * 0.38], [-HR * 0.78, HR * 0.6], [-HR * 0.5, -HR * 0.1]].map(p => rot(p, ea, piv)), jt, 19))));
    const r = HR * 0.3; es = [{ x: HR * 0.52, y: -HR * 0.26, r }, { x: HR * 0.52 - 2.25 * r, y: -HR * 0.3, r }];
    anch = [HR * 0.1, -HR * 0.98, HR * 2, HR * 0.8, HR * 0.52 - 1.12 * r, -HR * 0.28, 3.3 * r];
  } else if (sp === 'goat') {
    const ea = rad(18 * earBack - 14 * earUp + 10 * Math.sin(t * 2.1));
    if (stage >= 1) { const hk = lerp(0.45, 1.15, clamp((stage - 1) / 4, 0, 1)); g.push(`<path d="${taper([[-HR * 0.05, -HR * 0.72], [-HR * 0.3, -HR * (0.72 + 0.7 * hk)], [-HR * (0.6 + 0.6 * hk), -HR * (0.8 + 1.05 * hk)], [-HR * (0.9 + 0.75 * hk), -HR * (0.6 + 0.65 * hk)]], HR * 0.42, HR * 0.12)}"/>`); }
    g.push(path(curve(J([[HR * 0.62, -HR * 0.76], [HR * 1.25, -HR * 0.16], [HR * 1.76, HR * 0.5], [HR * 1.62, HR * 0.94], [HR * 0.92, HR * 0.96], [-HR * 0.2, HR * 0.76], [-HR * 0.86, HR * 0.14], [-HR * 0.72, -HR * 0.62], [0, -HR * 0.96]], jt))));
    if (stage >= 2) g.push(path(curve(J([[HR * 1.05, HR * 0.86], [HR * 0.9, HR * 1.7], [HR * 0.55, HR * 0.9]], jt, 5))));
    const piv = [-HR * 0.55, -HR * 0.3];
    g.push(path(curve(J([[-HR * 0.4, -HR * 0.46], [-HR * 1.25, -HR * 0.42], [-HR * 1.6, -HR * 0.12], [-HR * 1.15, HR * 0.04], [-HR * 0.45, -HR * 0.1]].map(p => rot(p, ea, piv)), jt, 23))));
    const r = HR * 0.31; es = [{ x: HR * 0.5, y: -HR * 0.3, r }, { x: HR * 0.5 - 2.25 * r, y: -HR * 0.34, r }];
    anch = [0, -HR * 1.0, HR * 1.8, HR * 0.8, HR * 0.5 - 1.12 * r, -HR * 0.32, 3.3 * r];
  } else { // doodle — Buz Bodur: köşeli kutu baş, tepesinde buz kristalleri
    const sp2 = 0.5 + 0.5 * Math.sin(t * 1.3);
    g.push(path(curve(J([[HR * 0.98, -HR * 0.72], [HR * 1.08, -HR * 0.1], [HR * 1.04, HR * 0.62], [HR * 0.6, HR * 0.86], [-HR * 0.6, HR * 0.86], [-HR * 1.02, HR * 0.6], [-HR * 1.06, -HR * 0.2], [-HR * 0.94, -HR * 0.76], [-HR * 0.3, -HR * 0.86], [HR * 0.4, -HR * 0.86]], jt), true, 0.7)));
    const crys = stage >= 1 ? 3 : 1;
    for (let i = 0; i < crys; i++) { const x = (i - (crys - 1) / 2) * HR * 0.48, h = HR * (0.42 + 0.18 * (i === 1 || crys === 1 ? 1 : 0) + 0.04 * sp2); g.push(path(`M${f1(x - HR * 0.17)} ${f1(-HR * 0.8)}L${f1(x)} ${f1(-HR * 0.8 - h)}L${f1(x + HR * 0.17)} ${f1(-HR * 0.8)}Z`)); }
    const r = HR * 0.29; es = [{ x: HR * 0.5, y: -HR * 0.08, r }, { x: HR * 0.5 - 2.3 * r, y: -HR * 0.1, r }];
    anch = [0, -HR * 0.9, HR * 2, HR * 0.86, HR * 0.5 - 1.15 * r, -HR * 0.09, 3.3 * r];
  }
  return { body: g.join(''), eyes: eyesSVG(es, eye, lid, lookX, lookY, t, tears), anch };
}

function makeQuad(sp, stage, acc) {
  const Q = QUAD[sp], u = stage / 5;
  const L = Q.L * lerp(0.6, 1, u), BH = Q.BH * lerp(0.84, 1, u), LEG = Q.LEG * lerp(0.6, 1, u), LW = Q.LW * lerp(0.82, 1, u);
  const HR = Q.HR * lerp(1.3, 1, u) * lerp(0.82, 1, u), NL = Q.NL * lerp(0.62, 1, u), NW = Q.NW * lerp(0.84, 1, u);
  const TL = Q.tail.len * lerp(0.5, 1, u), TW = Q.tail.w * lerp(0.8, 1, u);
  const l1 = LEG * 0.5, l2 = LEG * 0.56, standH = LEG * 0.96 + BH * 0.2;
  // oturuş: sırt kısalır (kamburlaşır), ön bacaklar dikleşip uzar; açı ön ayakların yere değeceği şekilde bulunur
  const SIT_L = 0.72, SIT_LEG = 1.45;
  const SIT_TH = Math.asin(clamp((LEG * 1.06 * SIT_LEG * 0.97 - BH * 0.5 + BH * 0.22 + BH * 0.14 * 0.5) / (L * SIT_L), 0.2, 0.95)) * 57.3;
  const jt = jitter(sp.length * 97 + stage * 13);
  const S0 = run => 2 * LEG * Math.sin(rad(Q.amp * (run ? 1.45 : 1)));
  const BETA = run => (run ? 0.42 : 0.62);
  let cur = null, last = null, walkW = 0, gaitPh = 0;
  const me = {
    gait: 'walk', front: false, air: 0,
    cycle: run => S0(run) / BETA(run),
    frame(S) {
      const dt = cur ? clamp(S.t - last, 0, 0.1) : 1; last = S.t;
      const I = intent(S.verb, S.cu, S.cT, S.ce, S.mood, S.t);
      const eye = eyeState(S.mood, I, S.lidV, S.base);
      const asleep = S.asleep && S.base !== 'dead';
      // --- hedef poz
      let T;
      const stand = () => ({ ry: standH, th: 0, neck: Q.neckA, head: 0, fF: 0, fB: 0, fold: 0, haunch: 0, tailA: Q.tail.a, curl: Q.tail.curl, bx: 0, sit: 0 });
      // bu hareketler ayakta yapılır (oturan pet önce kalkar)
      const standVerb = ['stretch', 'sniff', 'stalk', 'pounce', 'lunge', 'bite', 'dig', 'eat', 'shake', 'fear', 'guard'].includes(S.verb) && S.ce > 0.02;
      if (S.moving || (standVerb && !asleep)) T = stand();
      else if (asleep || S.base === 'lie' || S.base === 'full' || S.base === 'dead') T = { ry: BH * 0.52, th: 0, neck: asleep ? 8 : 40, head: asleep ? 22 : 0, fF: 5, fB: 3, fold: 1, haunch: 0.6, tailA: 200, curl: -150, bx: 0, sit: 0 };
      else if (Q.idle === 'sit') T = { ry: BH * 0.5, th: SIT_TH, neck: Q.sitNeck, head: -4, fF: 0, fB: L * 0.3, fold: 0, haunch: 1, tailA: 150, curl: sp === 'cat' ? -150 : -40, bx: -L * 0.05, sit: 1 };
      else T = stand();
      // niyetleri iskelete uygula
      T.ry -= I.crouch * LEG * 0.42; T.neck -= 22 * I.crouch + 62 * I.headDown - 24 * I.headUp; T.head += 26 * I.headDown - 14 * I.headUp + 10 * I.crouch;
      T.tailA += 40 * I.tailUp; T.bx += 9 * I.push + 4 * I.lean;
      if (I.bow > 0) { T.th -= 24 * I.bow; T.fF += LEG * 0.6 * I.bow; T.neck -= 40 * I.bow; }
      if (!cur) cur = JSON.parse(JSON.stringify(T));
      dampObj(cur, T, dt, S.still ? 1e3 : 9);
      walkW = S.still ? (S.moving ? 1 : 0) : damp(walkW, S.moving ? 1 : 0, dt, 9);
      const P = cur, run = S.run;
      // --- yürüyüş
      const bob = S.moving ? Math.abs(Math.sin(TAU * S.ph * 2)) * (run ? 3 : 1.3) * walkW : 0;
      const th = rad(P.th + (run && S.moving ? 3.5 * Math.sin(TAU * S.ph) : 0));
      const Lr = L * (run && S.moving ? 1.08 : 1) * lerp(1, SIT_L, P.sit || 0);
      const legK = lerp(1, SIT_LEG, P.sit || 0);
      const d = [Math.cos(th), -Math.sin(th)], n = [d[1], -d[0]];
      const R = [-Lr / 2 * Math.cos(th) + P.bx, -P.ry - bob], C = add(R, d, Lr);
      // eklemler
      const hip = add(add(R, d, BH * 0.16), n, -BH * 0.22), sho = add(add(C, d, -BH * 0.14), n, -BH * 0.22);
      const Sx = S0(run), beta = BETA(run);
      const offs = run ? { NB: 0, FB: 0.1, NF: 0.5, FF: 0.6 } : { NB: 0, NF: 0.25, FB: 0.5, FF: 0.75 };
      const restHipX = -L / 2 + BH * 0.16, restShoX = L / 2 - BH * 0.14;
      const legs = {};
      for (const k of ['FB', 'FF', 'NB', 'NF']) {
        const front = k[1] === 'F', j = front ? sho : hip, far = k[0] === 'F';
        // durağan ayak
        let fx = j[0] + (front ? P.fF : P.fB), fy = 0;
        if (P.fold > 0.01) { fx = lerp(fx, j[0] + (front ? 6 : -2), P.fold); fy = lerp(0, j[1] + LW * 0.5, P.fold * 0.85); }
        if (S.base === 'dead') { fx = j[0] + (front ? 3 : -3); fy = j[1] + LEG * 0.9; }
        // pati kaldırma / eşeleme (yakın ön ayak)
        if (k === 'NF' && (I.paw > 0 || I.dig)) { const p = Math.max(I.paw, Math.abs(I.dig) * 0.7), sk = 1 + 0.6 * (P.sit || 0); fx += LEG * 0.5 * p * sk; fy -= LEG * 0.7 * p * sk; }
        if (k === 'FF' && I.dig) { const p = Math.max(0, -I.dig) * 0.7; fx += LEG * 0.45 * p; fy -= LEG * 0.5 * p; }
        // zıplama: ayaklar havada içe toplanır
        if (I.lift > 2 && !S.moving) { const q = clamp(I.lift / 22, 0, 1); fx = lerp(fx, j[0] + (front ? 4 : -4), q * 0.6); fy = lerp(fy, j[1] + l1 * 0.8, q * 0.6); }
        if (walkW > 0.001) {
          const g = stride(S.ph + offs[k], Sx, beta);
          const gx = (front ? restShoX : restHipX) + g.x, gy = -g.lift * LEG * (run ? 0.42 : 0.32);
          fx = lerp(fx, gx, walkW); fy = lerp(fy, gy, walkW);
        }
        const jx = j[0] + (far ? -3 : 0);
        const knee = front ? ik(jx, j[1], fx + (far ? -3 : 0), fy, l1 * legK, l2 * legK, -1) : ik(jx, j[1], fx + (far ? -3 : 0), fy, l1, l2, 1);
        legs[k] = { j: [jx, j[1]], knee, foot: [fx + (far ? -3 : 0), fy], far };
      }
      // boyun / baş
      const nb = add(add(C, n, BH * 0.16), d, -BH * 0.02);
      let na = P.neck + (S.moving ? (run ? -12 : -4) : 0);
      let hc = add(nb, pt(na, NL));
      if (hc[1] > -HR * 0.82) hc[1] = -HR * 0.82;    // baş yere gömülmesin
      const hRot = P.head + (S.moving ? (run ? 3 : 1.5) * Math.sin(TAU * S.ph * 2) : 0) + 14 * I.headTilt + 8 * I.headTurn;
      // kuyruk zinciri
      const tb = add(add(R, d, -BH * 0.36), n, BH * 0.18);
      const tp = [tb], nT = 7, seg = TL / nT;
      const wagA = (S.moving ? (run ? 18 : 10) * Math.sin(TAU * S.ph) : 7 * Math.sin(S.t * 1.2) + 3 * Math.sin(S.t * 2.7)) + 26 * I.wag;
      for (let i = 1; i <= nT; i++) {
        const q = i / nT;
        const a = P.tailA + P.th * (1 - (P.sit || 0)) + (P.curl * Math.pow(q, 1.6)) + wagA * q * Math.sin(S.t * 0.6 + q * 1.4 + 1);
        tp.push(add(tp[i - 1], pt(a, seg)));
      }
      // --- çizim
      const g = [];
      // uzak bacaklar, gövde, yakın bacaklar (hepsi aynı mürekkep: siluet birleşir)
      const legSVG = k => { const l = legs[k]; return line([l.j, l.knee, l.foot], LW) + `<ellipse cx="${f1(l.foot[0] + LW * 0.18)}" cy="${f1(Math.min(l.foot[1] - LW * 0.36, l.foot[1]))}" rx="${f1(LW * 0.66)}" ry="${f1(LW * 0.44)}"/>`; };
      g.push(legSVG('FB'), legSVG('FF'));
      if (TL > 10) g.push(`<path d="${taper(tp, TW * 1.25, TW * 0.85)}"/>`); else g.push(smoothLine(tp, TW));
      // gövde (sağrı → göğüs; tepe ve karın profili)
      const top = Q.box ? [1, 1, 1, 1, 1] : [0.92, 1, 0.96, 1, 1.02], bot = Q.box ? [1, 1, 1, 1, 1] : [0.9, 0.96, 1.02, 1, 0.94];
      const pts = [add(R, d, -BH * (Q.box ? 0.3 : 0.5))];
      for (let i = 0; i <= 4; i++) pts.push(add(add(R, d, Lr * i / 4), n, BH / 2 * top[i]));
      pts.push(add(add(C, d, BH * (Q.box ? 0.3 : 0.44)), n, BH * 0.06));
      for (let i = 4; i >= 0; i--) pts.push(add(add(R, d, Lr * i / 4), n, -BH / 2 * bot[i]));
      g.push(path(curve(J(pts, jt, 3), true, Q.box ? 0.7 : 1)));
      if (P.haunch > 0.02) g.push(`<ellipse cx="${f1(hip[0] + BH * 0.1)}" cy="${f1(Math.min(hip[1], -BH * 0.48))}" rx="${f1(BH * 0.55 * P.haunch)}" ry="${f1(BH * 0.5 * P.haunch)}"/>`);
      g.push(line([nb, hc], NW));
      g.push(legSVG('NB'), legSVG('NF'));
      const H = quadHead(sp, HR, stage, { earBack: I.earsBack, earUp: I.earsUp + 0.6 * I.puff, eye, lid: S.lidV, lookX: 0.6 + S.look, lookY: I.headDown * 0.5, t: S.t, tears: I.tears, flap: S.moving ? Math.sin(TAU * S.ph * 2) * (run ? 1 : 0.4) : I.wag * 0.3, jt });
      g.push(`<g transform="translate(${f1(hc[0])} ${f1(hc[1])}) rotate(${f1(hRot)})">${H.body}${H.eyes}${headAcc(sp, stage, acc, H.anch)}</g>`);
      // --- bütün gövde dönüşümleri
      let tr = '';
      const lift = I.lift + (I.float ? 0 : 0);
      if (lift) tr += `translate(0 ${f1(-lift)}) `;
      if (I.shiver) tr += `translate(${f1(I.shiver)} 0) `;
      if (I.sway) tr += `rotate(${f1(4 * I.sway)} 0 0) `;
      if (I.roll > 0 && I.roll < 1) tr += `rotate(${f1(360 * I.roll)} 0 ${f1(-standH)}) `;
      if (I.spin > 0 && I.spin < 1) tr += `scale(${f1(Math.cos(I.spin * TAU * 2) * 100) / 100 || 0.01} 1) `;
      if (I.squash) tr += `scale(${f1((1 + I.squash) * 100) / 100} ${f1((1 - I.squash) * 100) / 100}) `;
      if (S.base === 'dead') { const top = R[1] - BH * 0.55; tr += `translate(0 ${f1(top)}) scale(1 -1) `; }
      me.air = clamp(lift / 30, 0, 0.6);
      return `<g fill="${INK}"${tr ? ` transform="${tr.trim()}"` : ''}>${g.join('')}</g>`;
    },
  };
  return me;
}

// ---------------------------------------------------------------- kuş (civciv → tavus)
function makeBird(stage, acc) {
  const jt = jitter(71 + stage * 5);
  const pea = stage >= 4;
  const k = [0.7, 0.62, 0.8, 0.95, 1, 1.1][stage];
  const BRx = (pea ? 20 : 20) * k, BRy = (pea ? 16 : 17) * k, LEG = (pea ? 26 : 15) * k, NL = (pea ? 20 : 8) * k, NW = (pea ? 7 : 11) * k, HR = (pea ? 9 : 11) * k;
  const l1 = LEG * 0.52, l2 = LEG * 0.52;
  let last = null, cur = null, walkW = 0;
  const S0 = run => 2 * LEG * Math.sin(rad(run ? 34 : 26)), BETA = run => (run ? 0.45 : 0.6);
  const me = {
    gait: stage === 0 ? 'hop' : 'walk', hop: 26, front: false, air: 0,
    cycle: run => S0(run) / BETA(run),
    frame(S) {
      const dt = cur ? clamp(S.t - last, 0, 0.1) : 1; last = S.t;
      const I = intent(S.verb, S.cu, S.cT, S.ce, S.mood, S.t);
      const eye = eyeState(S.mood, I, S.lidV, S.base);
      if (stage === 0) return me.egg(S, I, eye);
      const asleep = S.asleep && S.base !== 'dead';
      const T = { sit: asleep || S.base === 'lie' || S.base === 'full' || S.base === 'dead' ? 1 : 0, neck: 70 - 70 * I.headDown + 15 * I.headUp, head: 30 * I.headDown, fan: clamp((S.mood === 'happy' || S.mood === 'love' ? 0.7 : 0) + I.puff + (S.verb === 'ability' || S.verb === 'guard' ? 1 : 0), 0, 1) };
      if (asleep) { T.neck = 20; T.head = 50; }
      if (S.base === 'dead') { T.neck = -5; T.head = 70; T.sit = 0; }
      if (!cur) cur = { ...T };
      dampObj(cur, T, dt, S.still ? 1e3 : 9);
      walkW = S.still ? (S.moving ? 1 : 0) : damp(walkW, S.moving ? 1 : 0, dt, 9);
      const run = S.run, by = LEG * 0.92 * (1 - 0.55 * cur.sit) + BRy * 0.75 - I.crouch * LEG * 0.4;
      const bob = S.moving ? Math.abs(Math.sin(TAU * S.ph * 2)) * 1.4 : 0;
      const B = [0, -by - bob];
      const g = [];
      // bacaklar
      const hipY = B[1] + BRy * 0.55;
      for (const [o, far] of [[0.5, true], [0, false]]) {
        let fx = far ? -3 : 3, fy = 0;
        if (walkW > 0) { const s = stride(S.ph + o, S0(run), BETA(run)); fx = lerp(fx, s.x, walkW); fy = lerp(fy, -s.lift * LEG * 0.4, walkW); }
        if (cur.sit > 0.5) fy = 0;
        const j = [far ? -2 : 2, hipY];
        const kn = ik(j[0], j[1], fx, fy, l1, l2, 1);
        g.push(line([j, kn, [fx, fy]], 2.6 * k + 0.6));
        g.push(line([[fx - 3 * k, fy], [fx + 5 * k, fy]], 2 * k + 0.4) + line([[fx, fy], [fx + 4 * k, fy - 2.2 * k]], 1.8 * k + 0.4));
      }
      // kuyruk / tavus yelpazesi
      const tb = [B[0] - BRx * 0.8, B[1] - BRy * 0.1];
      if (pea) {
        const fan = cur.fan, N = 9;
        for (let i = 0; i < N; i++) {
          const q = i / (N - 1), a = lerp(lerp(150, 222, q), lerp(60, 205, q), fan) + 3 * Math.sin(S.t * 2 + i), len = lerp(lerp(30, 44, Math.sin(q * Math.PI)), 50, fan) * k;
          const e = add(tb, pt(a, len));
          g.push(line([tb, add(tb, pt(a + 6 * Math.sin(S.t + i) * (1 - fan), len * 0.55)), e], lerp(2.2, 2.8, fan) * k));
          g.push(`<ellipse cx="${f1(e[0])}" cy="${f1(e[1])}" rx="${f1(lerp(3, 4.4, fan) * k)}" ry="${f1(lerp(2.4, 3.4, fan) * k)}"/>`);
        }
      } else if (stage >= 2) {
        for (let i = 0; i < 3; i++) g.push(path(curve(J([add(tb, [4, 2]), add(tb, pt(150 - i * 22 + 20 * I.tailUp, (10 + 3 * i) * k)), add(tb, [3, -3])], jt, i * 3))));
      }
      // gövde
      g.push(path(curve(J([[B[0] + BRx * 0.95, B[1] - BRy * 0.3], [B[0] + BRx * 0.7, B[1] + BRy * 0.7], [B[0] - BRx * 0.1, B[1] + BRy], [B[0] - BRx * 0.85, B[1] + BRy * 0.5], [B[0] - BRx * 1.05, B[1] - BRy * 0.25], [B[0] - BRx * 0.4, B[1] - BRy * 0.92], [B[0] + BRx * 0.5, B[1] - BRy * 0.88]], jt))));
      // boyun + baş (adımda tavuk gibi: baş yere göre sabit kalır, sonra ileri atılır)
      let hb = 0;
      if (S.moving) { const q = (S.ph * 2) % 1; hb = (q < 0.7 ? -q / 0.7 : -1 + (q - 0.7) / 0.3) * S0(run) * 0.5 + S0(run) * 0.25; }
      const nb = [B[0] + BRx * 0.6, B[1] - BRy * 0.55];
      const hc = add(add(nb, pt(cur.neck, NL + 4 * k)), [hb * walkW, 0]);
      g.push(line([nb, hc], NW));
      // kanat
      const wa = rad(-55 * Math.max(0, -I.flap) - 30 * Math.max(0, I.flap) + (I.flap ? 20 * Math.sin(S.t * 26) * Math.abs(I.flap) : 0));
      const wp = [B[0] + BRx * 0.25, B[1] - BRy * 0.35];
      g.push(path(curve(J([[0, 0], [BRx * 0.25, BRy * 0.5], [-BRx * 0.55, BRy * 0.75], [-BRx * 0.85, BRy * 0.35]].map(p => add(rot(p, wa), wp)), jt, 9))));
      // baş
      const hg = [];
      hg.push(path(curve(J([[HR, 0], [HR * 0.7, HR * 0.75], [-HR * 0.3, HR * 0.95], [-HR * 0.95, HR * 0.3], [-HR * 0.8, -HR * 0.6], [0, -HR], [HR * 0.75, -HR * 0.65]], jt, 13))));
      hg.push(path(`M${f1(HR * 0.82)} ${f1(-HR * 0.28)}L${f1(HR * 1.65 + 1.5 * I.mouth)} ${f1(HR * 0.06)}L${f1(HR * 0.82)} ${f1(HR * 0.4)}Z`));
      if (pea) { for (let i = 0; i < 3; i++) { const e = [(-0.3 + i * 0.3) * HR, -HR * (1.7 + 0.15 * Math.sin(S.t * 3 + i))]; hg.push(line([[(-0.1 + i * 0.12) * HR, -HR * 0.8], e], 1.6)); hg.push(`<circle cx="${f1(e[0])}" cy="${f1(e[1])}" r="2.4"/>`); } }
      else if (stage >= 2) hg.push(path(curve(J([[-HR * 0.5, -HR * 0.8], [-HR * 0.42, -HR * 1.35], [-HR * 0.1, -HR * 1.0], [HR * 0.15, -HR * 1.42], [HR * 0.35, -HR * 0.92], [HR * 0.62, -HR * 1.2], [HR * 0.6, -HR * 0.6]], jt, 17))));
      else hg.push(path(`M${f1(-HR * 0.1)} ${f1(-HR * 0.9)}q${f1(HR * 0.2)} ${f1(-HR * 0.7)} ${f1(HR * 0.5)} ${f1(-HR * 0.5)}q${f1(-HR * 0.3)} ${f1(HR * 0.2)} ${f1(-HR * 0.1)} ${f1(HR * 0.5)}Z`));
      const r = HR * 0.44, es = [{ x: HR * 0.22, y: -HR * 0.12, r }];
      hg.push(eyesSVG(es, eye, S.lidV, 0.5 + S.look, 0.3 * I.headDown, S.t, I.tears));
      hg.push(headAcc('chick', stage, acc, [0, -HR, HR * 2, HR * 0.9, HR * 0.22, -HR * 0.12, r * 2]));
      g.push(`<g transform="translate(${f1(hc[0])} ${f1(hc[1])}) rotate(${f1(cur.head + 10 * I.headTilt + 8 * I.headTurn)})">${hg.join('')}</g>`);
      return wrapT(me, I, S, g, S.base === 'dead' ? by + BRy * 1.05 : by + BRy);
    },
    egg(S, I, eye) {
      const t = S.t, wob = 6 * cyc(t, 4.5, 0.1, 0.35) * Math.sin(t * 18) + 4 * I.wag;
      const hop = S.moving ? bell(S.ph > 0.28 ? (S.ph - 0.28) / 0.72 : 0) * 10 : 0;
      const g = [path(curve(J([[0, -46], [15, -38], [19, -18], [13, -2], [0, 0], [-13, -2], [-19, -18], [-15, -38]], jt)))];
      g.push(`<path d="M-17 -27l6 4 5-5 6 5 5-4 6 4 5-4" fill="none" stroke="${WHITE}" stroke-width="1.4" stroke-linejoin="round" opacity=".9"/>`);
      g.push(eyesSVG([{ x: 1, y: -35, r: 4.6 }, { x: 11, y: -35, r: 4.6 }], eye, S.lidV, S.look, 0, t, I.tears));
      me.air = clamp((hop + I.lift) / 30, 0, 0.6);
      return `<g fill="${INK}" transform="translate(${f1(I.shiver)} ${f1(-hop - I.lift)}) rotate(${f1(wob)} 0 0)">${g.join('')}${headAcc('chick', 0, null)}</g>`;
    },
  };
  return me;
}

// tüm gövde dönüşümleri (zıplama, titreme, takla, dönüş, ezilme, ölüm)
function wrapT(me, I, S, g, h, halfW = 0) {
  let tr = '';
  if (I.lift) tr += `translate(0 ${f1(-I.lift)}) `;
  if (I.shiver) tr += `translate(${f1(I.shiver)} 0) `;
  if (I.sway) tr += `rotate(${f1(4 * I.sway)} 0 0) `;
  if (I.roll > 0 && I.roll < 1) tr += `rotate(${f1(360 * I.roll)} 0 ${f1(-h / 2)}) `;
  if (I.spin > 0 && I.spin < 1) tr += `scale(${(Math.round(Math.cos(I.spin * TAU * 2) * 100) / 100) || 0.01} 1) `;
  if (I.squash) tr += `scale(${f1((1 + I.squash) * 100) / 100} ${f1((1 - I.squash) * 100) / 100}) `;
  if (S.base === 'dead') tr += halfW ? `translate(${f1(-h * 0.45)} ${f1(-halfW)}) rotate(90) ` : `translate(0 ${f1(-h)}) scale(1 -1) `;
  me.air = clamp(I.lift / 30, 0, 0.6);
  return `<g fill="${INK}"${tr ? ` transform="${tr.trim()}"` : ''}>${g.join('')}</g>`;
}

// ---------------------------------------------------------------- baykuş (önden)
function makeOwl(stage, acc) {
  const jt = jitter(311 + stage), k = [0.66, 0.74, 0.82, 0.9, 0.96, 1.02][stage];
  const BW = 24 * k, BHh = 30 * k, HR = 22 * k * lerp(1.12, 1, stage / 5);
  const me = {
    gait: 'hop', hop: 30, front: true, air: 0, cycle: () => 30,
    frame(S) {
      const I = intent(S.verb, S.cu, S.cT, S.ce, S.mood, S.t), eye = eyeState(S.mood, I, S.lidV, S.base);
      const hop = S.moving ? bell(S.ph > 0.28 ? (S.ph - 0.28) / 0.72 : 0) * 12 : 0;
      const sq = S.moving && S.ph <= 0.28 ? 0.08 * bell(S.ph / 0.28) : 0;
      const by = BHh + 3 * k - I.crouch * 8;
      const g = [];
      // ayaklar
      for (const s of [-1, 1]) g.push(line([[s * BW * 0.3 - 3 * k, 0], [s * BW * 0.3, -4 * k], [s * BW * 0.3 + 3 * k, 0]], 2.4 * k + 0.5) + line([[s * BW * 0.3, -4 * k], [s * BW * 0.3, -7 * k]], 2.6 * k));
      // gövde
      g.push(path(curve(J([[0, -by - BHh * 0.9], [BW * 0.85, -by - BHh * 0.4], [BW, -by + BHh * 0.35], [BW * 0.55, -6 * k], [0, -4 * k], [-BW * 0.55, -6 * k], [-BW, -by + BHh * 0.35], [-BW * 0.85, -by - BHh * 0.4]], jt))));
      // kanatlar
      const fl = I.flap ? I.flap : 0.12 * Math.sin(S.t * 1.6);
      for (const s of [-1, 1]) {
        const a = rad(s * (8 + 50 * Math.max(0, -fl) + 25 * Math.abs(I.flap) * Math.sin(S.t * 26)));
        const p = [s * BW * 0.82, -by - BHh * 0.3];
        g.push(path(curve(J([[0, 0], [s * BW * 0.35, BHh * 0.2], [s * BW * 0.32, BHh * 0.95], [0, BHh * 0.7], [-s * BW * 0.15, BHh * 0.25]].map(q => add(rot(q, a), p)), jt, s > 0 ? 5 : 9))));
      }
      // boyun boğumu + baş
      const hy = -by - BHh * 0.95 - HR * 0.72;
      const tilt = 12 * I.headTurn + 10 * I.headTilt + (S.moving ? 0 : 7 * cyc(S.t, 9, 0.2, 0.42) - 6 * cyc(S.t, 9, 0.5, 0.7)) + (S.asleep ? 10 : 0);
      g.push(path(curve(J([[-BW * 0.55, -by - BHh * 0.7], [-BW * 0.42, hy + HR * 0.6], [BW * 0.42, hy + HR * 0.6], [BW * 0.55, -by - BHh * 0.7]], jt, 2))));
      const hg = [];
      const tuft = rad(-20 * I.earsBack + 12 * I.earsUp);
      hg.push(path(curve(J([[-HR, -HR * 0.1], [-HR * 0.98, -HR * 0.68], [-HR * 1.05, -HR * 1.25], [-HR * 0.5, -HR * 0.92], [0, -HR * 0.95], [HR * 0.5, -HR * 0.92], [HR * 1.05, -HR * 1.25], [HR * 0.98, -HR * 0.68], [HR, -HR * 0.1], [HR * 0.75, HR * 0.6], [0, HR * 0.8], [-HR * 0.75, HR * 0.6]].map((q, i) => (i === 2 ? rot(q, -tuft, [-HR * 0.8, -HR * 0.8]) : i === 6 ? rot(q, tuft, [HR * 0.8, -HR * 0.8]) : q)), jt, 4))));
      const r = HR * 0.38, look = S.look * 0.8;
      hg.push(eyesSVG([{ x: -HR * 0.45, y: -HR * 0.02, r }, { x: HR * 0.45, y: -HR * 0.02, r }], eye, S.lidV, look, 0.2 * I.headDown, S.t, I.tears));
      hg.push(path(`M${f1(-HR * 0.1)} ${f1(HR * 0.2)}L0 ${f1(HR * 0.48)}L${f1(HR * 0.1)} ${f1(HR * 0.2)}Z`));
      hg.push(headAcc('owl', stage, acc, [0, -HR * 0.95, HR * 2, HR * 0.8, 0, -HR * 0.02, HR * 1.66]));
      g.push(`<g transform="translate(0 ${f1(hy)}) rotate(${f1(tilt)})">${hg.join('')}</g>`);
      const I2 = { ...I, lift: I.lift + hop, squash: I.squash + sq };
      return wrapT(me, I2, S, g, by + BHh + HR * 2, BW);
    },
  };
  return me;
}

// ---------------------------------------------------------------- kertenkele
function makeGecko(stage, acc) {
  const jt = jitter(503 + stage), u = stage / 5, k = lerp(0.62, 1, u);
  const BL = 30 * k, BT = 12 * k, HR = 11.5 * k * lerp(1.18, 1, u), LEG = 13 * k, TL = 44 * k;
  const l1 = LEG * 0.55, l2 = LEG * 0.62, H = LEG * 0.62 + BT * 0.2;
  let last = null, walkW = 0;
  const S0 = run => 2 * LEG * Math.sin(rad(run ? 44 : 30)), BETA = run => (run ? 0.5 : 0.65);
  const me = {
    gait: 'walk', front: false, air: 0, cycle: run => S0(run) / BETA(run),
    frame(S) {
      const dt = last == null ? 1 : clamp(S.t - last, 0, 0.1); last = S.t;
      const I = intent(S.verb, S.cu, S.cT, S.ce, S.mood, S.t), eye = eyeState(S.mood, I, S.lidV, S.base);
      walkW = S.still ? (S.moving ? 1 : 0) : damp(walkW, S.moving ? 1 : 0, dt, 9);
      const low = (S.asleep || S.base === 'lie' || S.base === 'full' ? 1 : 0) + I.crouch;
      const y0 = -H + low * H * 0.45, run = S.run;
      const und = S.moving ? Math.sin(TAU * S.ph) * (run ? 3 : 1.8) : Math.sin(S.t * 0.7) * 0.6;
      const hip = [-BL / 2, y0 + und * 0.3], sho = [BL / 2, y0 - und * 0.3];
      const g = [];
      // bacaklar (dirsek yukarıda, yana açık): uzak çift önce
      const offs = { NB: 0, FF: 0, NF: 0.5, FB: 0.5 };
      const legs = [];
      for (const kk of ['FB', 'FF', 'NB', 'NF']) {
        const front = kk[1] === 'F', far = kk[0] === 'F', j = front ? sho : hip;
        let fx = j[0] + (front ? 4 : -4), fy = 0;
        if (walkW > 0) { const s = stride(S.ph + offs[kk], S0(run), BETA(run)); fx = lerp(fx, j[0] + s.x, walkW); fy = lerp(0, -s.lift * LEG * 0.5, walkW); }
        if (kk === 'NF' && I.paw) { fx += 8 * I.paw; fy -= 10 * I.paw; }
        const dx = far ? -2.5 : 0;
        const kn = ik(j[0] + dx, j[1], fx + dx, fy, l1, l2, front ? 1 : -1);
        legs.push([kk, [j[0] + dx, j[1]], [kn[0], Math.min(kn[1], j[1] - 2)], [fx + dx, fy]]);
      }
      const legSVG = ([kk, j, kn, f]) => line([j, kn, f], 4.2 * k + 0.6) + [-30, 0, 30].map(a => line([f, add(f, pt(a + (kk[1] === 'F' ? 0 : 180), 4.2 * k))], 1.8 * k + 0.4)).join('');
      g.push(legSVG(legs[0]), legSVG(legs[1]));
      // kuyruk (sivrilen; yürürken dalgalanır)
      const tp = [hip]; const nT = 8;
      for (let i = 1; i <= nT; i++) { const q = i / nT; const a = 182 + 18 * q * Math.sin((S.moving ? TAU * S.ph : S.t * 0.7) - q * 2.4) + (-20 * I.tailUp) * q - 12 * q * q; tp.push(add(tp[i - 1], pt(a, TL / nT))); }
      g.push(`<path d="${taper(tp, BT * 1.0, 1.4)}"/>`);
      // gövde
      const d = [sho[0] - hip[0], sho[1] - hip[1]], m = Math.hypot(...d), dn = [d[0] / m, d[1] / m], n = [dn[1], -dn[0]];
      const pts = [add(hip, dn, -BT * 0.3)];
      for (let i = 0; i <= 4; i++) pts.push(add(add(hip, dn, m * i / 4), n, BT / 2 * [0.9, 1, 1.05, 1, 0.9][i]));
      pts.push(add(sho, dn, BT * 0.4));
      for (let i = 4; i >= 0; i--) pts.push(add(add(hip, dn, m * i / 4), n, -BT / 2 * [0.85, 1, 1.1, 1, 0.9][i]));
      g.push(path(curve(J(pts, jt))));
      // sırt dikenleri
      const sN = stage >= 3 ? 6 : stage >= 1 ? 4 : 0;
      for (let i = 0; i < sN; i++) { const q = 0.15 + 0.7 * i / Math.max(1, sN - 1), b = add(add(hip, dn, m * q), n, BT / 2 * 0.92), h = (2.4 + 0.8 * (stage >= 3)) * k * (1 + 0.5 * I.puff); g.push(path(`M${f1(b[0] - 2.4 * k)} ${f1(b[1] + 1)}L${f1(b[0] + 0.6)} ${f1(b[1] - h)}L${f1(b[0] + 2.4 * k)} ${f1(b[1] + 1)}Z`)); }
      // boyun + baş
      const nb = add(sho, n, BT * 0.1), na = 28 - 40 * I.headDown + 25 * I.headUp + (S.moving ? 0 : 8 * cyc(S.t, 12, 0.62, 0.82));
      const hc = add(nb, pt(na, 7 * k));
      g.push(line([nb, hc], BT * 0.95));
      g.push(legSVG(legs[2]), legSVG(legs[3]));
      const hg = [path(curve(J([[HR * 1.2, HR * 0.05], [HR * 0.95, HR * 0.6], [0, HR * 0.72], [-HR * 0.9, HR * 0.35], [-HR * 0.85, -HR * 0.5], [-HR * 0.1, -HR * 0.82], [HR * 0.75, -HR * 0.55]], jt, 7)))];
      const r = HR * 0.36;
      hg.push(`<circle cx="${f1(HR * 0.25)}" cy="${f1(-HR * 0.62)}" r="${f1(r * 1.2)}"/><circle cx="${f1(-HR * 0.42)}" cy="${f1(-HR * 0.6)}" r="${f1(r * 1.15)}"/>`);
      const flick = (S.verb === 'tongue' || S.verb === 'lick' || cyc(S.t, 6, 0.3, 0.36) > 0.2) ? 1 : 0;
      if (flick) hg.push(line([[HR * 1.1, HR * 0.25], [HR * 1.75, HR * 0.3], [HR * 1.95, HR * 0.15]], 1.6));
      hg.push(eyesSVG([{ x: HR * 0.25, y: -HR * 0.6, r }, { x: -HR * 0.42, y: -HR * 0.58, r }], eye, S.lidV, 0.6 + S.look, 0, S.t, I.tears));
      hg.push(headAcc('gecko', stage, acc, [0, -HR * 0.95, HR * 2, HR * 0.7, -HR * 0.08, -HR * 0.6, HR * 1.4]));
      g.push(`<g transform="translate(${f1(hc[0] + HR * 0.4)} ${f1(hc[1])}) rotate(${f1(18 * I.headDown + 8 * I.headTilt)})">${hg.join('')}</g>`);
      return wrapT(me, I, S, g, H + BT * 0.5 + (S.base === 'dead' ? HR * 1.4 : 0));
    },
  };
  return me;
}

// ---------------------------------------------------------------- balina
function makeWhale(stage, acc) {
  const jt = jitter(907 + stage), k = lerp(0.62, 1, stage / 5);
  const len = 92 * k, R0 = 21 * k;
  const me = {
    gait: 'float', front: false, air: 0, hover: 30, cycle: () => 90,
    frame(S) {
      const I = intent(S.verb, S.cu, S.cT, S.ce, S.mood, S.t), eye = eyeState(S.mood, I, S.lidV, S.base);
      const asleep = S.asleep;
      const amp = (asleep ? 1.2 : S.moving ? 6 : 3) + 4 * Math.abs(I.flap) + 1.5 * (S.mood === 'happy' ? 1 : 0);
      const ph = S.moving ? S.ph * TAU * 2 : S.t * (asleep ? 0.8 : 1.5);
      const hover = (S.base === 'dead' ? 4 : asleep ? 16 : 32) + (S.moving ? 0 : 3 * Math.sin(S.t * 1.2));
      const N = 12, sp = [];
      for (let i = 0; i <= N; i++) { const q = i / N, x = len * 0.48 - len * q; sp.push([x, -hover - R0 - amp * Math.pow(q, 1.6) * Math.sin(ph - q * 3.2)]); }
      // kalınlık: baş iri, kuyruk sapı ince
      const prof = q => R0 * (q < 0.18 ? 0.86 + 0.14 * Math.sin(q / 0.18 * Math.PI / 2) : q < 0.45 ? 1 : lerp(1, 0.16, Math.pow((q - 0.45) / 0.55, 1.2)));
      const Lp = [], Rp = [];
      for (let i = 0; i <= N; i++) {
        const a = sp[Math.max(0, i - 1)], b = sp[Math.min(N, i + 1)];
        let dx = b[0] - a[0], dy = b[1] - a[1]; const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
        const w = prof(i / N) * (i / N < 0.5 ? 1 : 1);
        Lp.push([sp[i][0] - dy * w * 0.92, sp[i][1] + dx * w * 0.92]); Rp.push([sp[i][0] + dy * w * 1.05, sp[i][1] - dx * w * 1.05]);
      }
      const nose = add(sp[0], [R0 * 0.55, R0 * 0.1]);
      const g = [path(curve(J([nose, ...Rp, ...Lp.reverse()], jt)))];
      // kuyruk yüzgeci
      const tl = sp[N], ta = Math.atan2(sp[N][1] - sp[N - 1][1], sp[N][0] - sp[N - 1][0]);
      g.push(path(curve(J([[0, 0], [-6 * k, -14 * k], [-18 * k, -20 * k], [-12 * k, -4 * k], [-14 * k, 0], [-12 * k, 4 * k], [-18 * k, 20 * k], [-6 * k, 14 * k]].map(p => add(rot([-p[0] * -1, p[1]], ta), tl)), jt, 5))));
      // yüzgeç
      const fp = add(sp[3], [0, R0 * 0.85]), fa = rad(20 + 18 * Math.sin(S.t * 1.6) + 30 * Math.abs(I.flap) * Math.sin(S.t * 20));
      g.push(path(curve(J([[0, 0], [-10 * k, 10 * k], [-22 * k, 16 * k], [-6 * k, 2 * k]].map(p => add(rot(p, fa), fp)), jt, 11))));
      // fıskiye
      const sp1 = clamp(cyc(S.t, 14, 0.4, 0.55) + (S.verb === 'ability' || S.verb === 'hop' ? bell(S.cu) : 0), 0, 1);
      const bh = add(sp[2], [0, -R0 * 0.95]);
      if (sp1 > 0.02) for (let i = 0; i < 5; i++) { const a = 90 + (i - 2) * 16, q = sp1; g.push(`<circle cx="${f1(bh[0] + Math.cos(rad(a)) * 12 * k * q)}" cy="${f1(bh[1] - Math.sin(rad(a)) * 16 * k * q)}" r="${f1(2.2 * k * (0.5 + q))}"/>`); }
      // göz
      const ec = add(sp[1], [R0 * 0.25, R0 * 0.1]);
      g.push(eyesSVG([{ x: ec[0], y: ec[1], r: 5.4 * k }], eye, S.lidV, 0.6 + S.look, 0, S.t, I.tears));
      g.push(`<g transform="translate(${f1(sp[1][0])} ${f1(sp[1][1])})">${headAcc('whale', stage, acc, [0, -R0, R0 * 2, R0 * 0.6, R0 * 0.25, R0 * 0.1, 11 * k])}</g>`);
      return wrapT(me, I, S, g, hover + R0 * 2);
    },
  };
  return me;
}

// ---------------------------------------------------------------- filiz
function makePlant(stage, acc) {
  const jt = jitter(1201 + stage);
  const me = {
    gait: 'hop', hop: 22, front: true, air: 0, cycle: () => 22,
    frame(S) {
      const I = intent(S.verb, S.cu, S.cT, S.ce, S.mood, S.t), eye = eyeState(S.mood, I, S.lidV, S.base);
      const hop = S.moving ? bell(S.ph > 0.28 ? (S.ph - 0.28) / 0.72 : 0) * 10 : 0;
      const sw = 3 * Math.sin(S.t * 0.7) + 6 * I.sway + 8 * I.headTilt;
      const g = [];
      let headY, headR, es, anch, top = '';
      if (stage === 0) {
        g.push(path(curve(J([[0, -30], [13, -24], [16, -10], [10, 0], [-10, 0], [-16, -10], [-13, -24]], jt))));
        g.push(line([[0, -29], [2, -37], [7, -40]], 2.6) + path('M7 -40q6-4 9 1q-5 3-9-1Z'));
        es = [{ x: -5, y: -16, r: 4.2 }, { x: 5, y: -16, r: 4.2 }]; anch = [0, -30, 30, 0, 0, -16, 18];
        g.push(eyesSVG(es, eye, S.lidV, S.look, 0, S.t, I.tears));
        g.push(headAcc('plant', stage, acc, anch));
      } else {
        // saksı (4) / gövde tabanı
        let baseY = 0;
        if (stage === 4) { g.push(path(curve(J([[-17, -26], [17, -26], [13, 0], [-13, 0]], jt), true, 0.4)) + path('M-20 -30h40v6h-40Z')); baseY = -28; }
        const stemL = [0, 22, 30, 36, 30, 20][stage], stemW = [0, 4, 4.5, 5, 5, 11][stage];
        const sTop = add([0, baseY], pt(90 - sw, stemL));
        g.push(smoothLine([[0, baseY], add([0, baseY], pt(90 - sw * 0.4, stemL * 0.5)), sTop], stemW));
        // yaprak kollar
        const la = 22 * Math.sin(S.t * 0.7 + 1) + 40 * Math.max(0, -I.flap) + 30 * I.flap * Math.sin(S.t * 20);
        const lp = add([0, baseY], pt(90 - sw * 0.3, stemL * 0.45));
        for (const s of [-1, 1]) { const a = rad(s * (-20 - la * 0.5)); g.push(path(curve(J([[0, 0], [s * 8, -7], [s * 18, -6], [s * 22, -1], [s * 12, 2]].map(p => add(rot(p, a), lp)), jt, s > 0 ? 3 : 8)))); }
        headR = [0, 11, 12, 12, 11, 22][stage]; headY = sTop[1] - headR * 0.6;
        const hx = sTop[0], hg = [];
        if (stage === 1) hg.push(path(curve(J([[0, -headR], [headR * 0.95, -headR * 0.3], [headR * 0.8, headR * 0.7], [0, headR], [-headR * 0.8, headR * 0.7], [-headR * 0.95, -headR * 0.3]], jt))));
        if (stage === 2) { for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + S.t * 0.15; hg.push(`<ellipse cx="${f1(Math.cos(a) * headR * 1.25)}" cy="${f1(Math.sin(a) * headR * 1.25)}" rx="${f1(headR * 0.62)}" ry="${f1(headR * 0.38)}" transform="rotate(${f1(a * 57.3)} ${f1(Math.cos(a) * headR * 1.25)} ${f1(Math.sin(a) * headR * 1.25)})"/>`); } hg.push(`<circle r="${f1(headR)}"/>`); }
        if (stage === 3 || stage === 4) hg.push(path(curve(J([[-headR, -headR * 0.2], [-headR * 0.8, -headR * 1.3], [-headR * 0.3, -headR * 0.75], [0, -headR * 1.45], [headR * 0.3, -headR * 0.75], [headR * 0.8, -headR * 1.3], [headR, -headR * 0.2], [headR * 0.75, headR * 0.8], [-headR * 0.75, headR * 0.8]], jt))));
        if (stage === 5) hg.push(path(curve(J([[0, -headR * 1.05], [headR * 0.7, -headR * 0.85], [headR * 1.15, -headR * 0.2], [headR * 1.0, headR * 0.6], [headR * 0.3, headR * 0.95], [-headR * 0.5, headR * 0.85], [-headR * 1.1, headR * 0.25], [-headR * 0.95, -headR * 0.6], [-headR * 0.4, -headR * 1.0]], jt))));
        const r = headR * (stage === 5 ? 0.24 : 0.36);
        es = [{ x: -headR * 0.4, y: 0, r }, { x: headR * 0.4, y: 0, r }];
        hg.push(eyesSVG(es, eye, S.lidV, S.look, 0, S.t, I.tears));
        hg.push(headAcc('plant', stage, acc, [0, -headR, headR * 2, headR * 0.8, 0, 0, headR * 1.2]));
        g.push(`<g transform="translate(${f1(hx)} ${f1(headY)}) rotate(${f1(sw * 0.6 + 14 * I.headTurn)})">${hg.join('')}</g>`);
      }
      const I2 = { ...I, lift: I.lift + hop };
      return wrapT(me, I2, S, g, 60, 16);
    },
  };
  return me;
}

export function makeInk(species, stage, coat, acc) {
  stage = clamp(stage | 0, 0, 5);
  if (QUAD[species]) return makeQuad(species, stage, acc);
  if (species === 'chick') return makeBird(stage, acc);
  if (species === 'owl') return makeOwl(stage, acc);
  if (species === 'gecko') return makeGecko(stage, acc);
  if (species === 'whale') return makeWhale(stage, acc);
  return makePlant(stage, acc);
}
