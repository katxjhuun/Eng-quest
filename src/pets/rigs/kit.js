// dam-la — görünüş seti iskeletleri için ortak matematik (geometri YOK).
// Her set (ink, lume, quirk) kendi anatomisini ve çizimini kendi dosyasında kurar; burada yalnızca
// eğri/ters kinematik yardımcıları ve uygulamanın klip adlarını "niyet" miktarlarına çeviren katman var.
// Niyet katmanı anlamsaldır ("çömel 0.7, başı eğ 0.4"); her set bunu kendi kemikleriyle yorumlar.

export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const bell = u => Math.sin(Math.PI * clamp(u, 0, 1));
export const env = (u, a = 0.15, b = 0.2) => clamp(Math.min(u / a, (1 - u) / b), 0, 1);
export const f1 = v => Math.round(v * 10) / 10;
export const deg = r => (r * 180) / Math.PI;
export const rad = d => (d * Math.PI) / 180;
// periyodik, kısa süreli bir "olay" (bekleme hareketleri için): q ∈ [a,b] aralığında 0→1→0
export const cyc = (t, period, a, b) => { const q = (t % period) / period; return q >= a && q <= b ? bell((q - a) / (b - a)) : 0; };

// tohumlu rastgele (çizimin el kesimi düzensizliği her karede aynı kalsın diye)
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// noktalardan yumuşak eğri (Catmull-Rom → kübik Bezier)
export function curve(pts, closed = true, k = 1) {
  const n = pts.length;
  if (n < 2) return '';
  const P = i => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * k, p1[1] + ((p2[1] - p0[1]) / 6) * k];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * k, p2[1] - ((p3[1] - p1[1]) / 6) * k];
    d += `C${f1(c1[0])} ${f1(c1[1])} ${f1(c2[0])} ${f1(c2[1])} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return closed ? d + 'Z' : d;
}
export const poly = pts => 'M' + pts.map(p => `${f1(p[0])} ${f1(p[1])}`).join('L') + 'Z';

// iki kemikli ters kinematik: a (eklem) → b (uç) için diz noktası. bend: +1 / -1 dizin hangi yana kırılacağı
export function ik(ax, ay, bx, by, l1, l2, bend = 1) {
  let dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy);
  const dm = Math.max(0.001, Math.min(d, l1 + l2 - 0.001));
  if (d < 0.001) { dx = 0; dy = 1; d = 1; }
  const a = Math.acos(clamp((l1 * l1 + dm * dm - l2 * l2) / (2 * l1 * dm), -1, 1));
  const base = Math.atan2(dy, dx) - bend * a;
  return [ax + Math.cos(base) * l1, ay + Math.sin(base) * l1];
}

// kritik sönümlü yaklaşma (poz geçişleri): değeri hedefe dt içinde oranla yaklaştırır
export const damp = (cur, target, dt, rate) => lerp(cur, target, 1 - Math.exp(-dt * rate));
export function dampObj(cur, tgt, dt, rate) {
  for (const k in tgt) {
    const v = tgt[k];
    if (typeof v === 'number') cur[k] = cur[k] == null ? v : damp(cur[k], v, dt, rate);
    else if (v && typeof v === 'object') dampObj(cur[k] || (cur[k] = Array.isArray(v) ? [] : {}), v, dt, rate);
  }
  return cur;
}

// yürüyüş: ayak, duruşta gövde hızıyla geri kayar (yere göre sabit), salınımda kalkıp öne gelir.
// q: bacağın döngü fazı, S: adım uzunluğu, beta: duruş oranı → {x: eklemin altına göre ayak konumu, lift: 0..1}
export function stride(q, S, beta) {
  q = ((q % 1) + 1) % 1;
  if (q < beta) return { x: S / 2 - (S * q) / beta, lift: 0 };
  const sw = (q - beta) / (1 - beta);
  return { x: -S / 2 + S * ease(sw), lift: bell(sw) };
}

// ---------------------------------------------------------------- klip → niyet
// figure.js'teki VERB tablosunun fiilleri (hop, eat, sad, ...) burada anlamsal miktarlara çevrilir.
const Z = () => ({ lift: 0, squash: 0, crouch: 0, lean: 0, headDown: 0, headUp: 0, headTurn: 0, headTilt: 0, paw: 0, tailUp: 0, wag: 0, shiver: 0,
  spin: 0, roll: 0, mouth: 0, tears: 0, flap: 0, float: 0, bow: 0, dig: 0, earsBack: 0, earsUp: 0, puff: 0, sway: 0, push: 0, eyes: '' });

export function intent(verb, cu, cT, ce, mood, t) {
  const I = Z();
  // ruh hâli taban duruşu
  if (mood === 'sad' || mood === 'hungry' || mood === 'cry') { I.headDown += 0.45; I.earsBack += 0.6; I.tailUp -= 0.6; }
  if (mood === 'happy' || mood === 'love') { I.wag = Math.sin(t * 7); I.earsUp += 0.3; }
  if (mood === 'angry') { I.crouch += 0.3; I.earsBack += 1; I.tailUp -= 0.2; I.shiver = 0.15 * Math.sin(t * 40); }
  if (mood === 'groggy' || mood === 'sleepy') { I.headDown += 0.25 + 0.12 * Math.sin(t * 0.8); }
  if (mood === 'focus') I.lean += 0.2;
  if (mood === 'full') I.squash += 0.05;
  if (mood === 'cry') I.tears = 1;
  switch (verb) {
    case 'hop': { const q = (cu * 2) % 1; I.lift += 14 * bell(q); I.squash += 0.12 * bell(q < 0.2 ? q / 0.2 : 0); I.wag = Math.sin(cT * 16); I.flap = Math.sin(cT * 20) * bell(q); I.eyes = 'happy'; break; }
    case 'eat': { const p = Math.pow(Math.abs(Math.sin(cT * 7)), 2); I.headDown += (0.8 + 0.2 * p) * ce; I.mouth = p * ce; I.wag = 0.4 * Math.sin(cT * 9) * ce; I.eyes = 'happy'; break; }
    case 'sad': case 'cry': { I.headDown += 0.6 * ce; I.earsBack += 0.8 * ce; I.tailUp -= 0.7 * ce; I.squash += 0.04 * ce; if (verb === 'cry') { I.tears = 1; I.shiver = 0.5 * Math.sin(cT * 30) * ce; } I.eyes = 'sad'; break; }
    case 'doze': { I.headDown += 0.7 * bell(cu); I.eyes = 'sleepy'; break; }
    case 'lunge': case 'bite': case 'pounce': {
      const wind = cu < 0.35 ? bell(cu / 0.7) : 0, hit = cu >= 0.35 ? bell((cu - 0.35) / 0.65) : 0;
      I.crouch += 0.8 * wind; I.push += hit * (verb === 'pounce' ? 1.4 : 1); I.lift += verb === 'pounce' ? 16 * hit : 0; I.mouth = verb !== 'pounce' ? hit : 0.3 * hit;
      I.earsBack += ce; I.eyes = 'angry'; break;
    }
    case 'swat': { I.paw = bell(cu); I.earsBack += 0.4 * bell(cu); I.lean += 0.2 * bell(cu); break; }
    case 'guard': { I.headUp += 0.5 * ce; I.tailUp += 0.8 * ce; I.puff = ce; I.flap = -0.6 * ce; I.eyes = 'angry'; break; }
    case 'jump': { const a = bell(cu); I.lift += 16 * a; I.squash -= 0.06 * a; I.tailUp += a; I.puff = a; I.flap = -a; I.eyes = 'wide'; break; }
    case 'freeze': { I.eyes = 'wide'; I.puff = 0.6; break; }
    case 'look': { I.headTurn = Math.sin(cu * TAU) * ce; break; }
    case 'headturn': { I.headTurn = 1.5 * Math.sin(cu * TAU) * ce; break; }
    case 'focus': { I.lean += 0.4 * ce; I.headUp += 0.2 * ce; I.eyes = 'squint'; break; }
    case 'sniff': { I.headDown += (0.75 + 0.08 * Math.sin(cT * 22)) * ce; I.tailUp += 0.7 * ce; I.lean += 0.3 * ce; break; }
    case 'sip': { I.headUp += 0.4 * bell(cu); I.paw = 0.6 * bell(cu); I.eyes = 'happy'; break; }
    case 'groom': case 'lick': { I.headDown += 0.4 * ce; I.headTurn = -0.6 * ce; I.paw = 0.8 * ce; I.mouth = Math.abs(Math.sin(cT * 10)) * ce; I.eyes = 'closed'; break; }
    case 'tongue': { I.mouth = cu > 0.3 && cu < 0.6 ? 1 : 0; break; }
    case 'stretch': { I.bow = bell(cu); I.tailUp += 0.8 * bell(cu); I.eyes = 'closed'; I.flap = -bell(cu); break; }
    case 'shake': { I.shiver = 3 * (1 - cu) * Math.sin(cT * 34); I.earsUp += 0.4 * Math.sin(cT * 34); break; }
    case 'roll': { I.roll = ease(cu); I.lift += 6 * bell(cu); I.eyes = 'happy'; break; }
    case 'dig': { I.dig = Math.sin(cT * 16) * ce; I.headDown += 0.6 * ce; I.tailUp += 0.6 * ce; break; }
    case 'tailwave': { I.wag = 1.6 * Math.sin(cT * 4) * ce; break; }
    case 'bask': { I.headUp += 0.3 * ce; I.squash += 0.04 * ce; I.eyes = 'closed'; break; }
    case 'rub': { I.sway = Math.sin(cT * 5) * ce; I.headTilt = Math.sin(cT * 5) * ce; I.eyes = 'happy'; break; }
    case 'fear': { I.crouch += 0.6 * ce; I.shiver = 0.9 * Math.sin(cT * 48) * ce; I.earsBack += ce; I.tailUp -= ce; I.headDown += 0.3 * ce; I.eyes = 'wide'; I.tears = 0.5 * ce; break; }
    case 'fly': { const a = bell(cu); I.lift += 22 * a; I.flap = Math.sin(cT * 26) * a; I.float = a; break; }
    case 'hit': { const a = Math.exp(-cT * 7) * Math.cos(cT * 22); I.push -= 0.8 * a; I.squash += 0.1 * Math.abs(a); I.headTurn = -0.6 * a; I.eyes = 'hurt'; break; }
    case 'spin': { I.spin = clamp(cu, 0, 1); I.lift += 6 * bell(cu); I.eyes = 'dizzy'; break; }
    case 'stalk': { I.crouch += 0.75 * ce; I.lean += 0.4 * ce; I.headDown += 0.15 * ce; I.wag = 0.4 * Math.sin(cT * 11) * ce; I.earsBack += 0.3 * ce; I.eyes = 'squint'; break; }
    case 'float': { const a = bell(cu); I.float = a; I.lift += 14 * a; I.flap = -0.6 * a; I.sway = Math.sin(cT * 3) * a; break; }
    case 'wobble': { I.squash += 0.09 * (1 - cu) * Math.sin(cT * 18); break; }
    case 'ability': { const a = bell(cu); I.lift += 8 * a; I.headUp += 0.6 * a; I.tailUp += a; I.flap = -a; I.puff = a; I.mouth = a; I.eyes = 'wide'; break; }
  }
  return I;
}

// göz durumu: ruh hâli, klip ve kapak değerinden
export function eyeState(mood, I, lidV, base) {
  if (base === 'dead') return 'x';
  if (I.eyes) return I.eyes;
  if (lidV > 0.85) return 'closed';
  if (mood === 'happy' || mood === 'love') return 'happy';
  if (mood === 'angry') return 'angry';
  if (mood === 'sad' || mood === 'cry' || mood === 'hungry') return 'sad';
  if (mood === 'surprised') return 'wide';
  if (mood === 'focus') return 'squint';
  if (lidV > 0.35) return 'sleepy';
  return 'open';
}
