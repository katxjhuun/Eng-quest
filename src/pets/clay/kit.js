// dam-la — 3B kil petler: ortak yapı taşları (malzeme, şekil, göz, bacak)
// Birimler: yer y=0, ileri yön +Z (kameraya bakar), sağ +X. Ölçüler yetişkin bir kedinin boyu ≈ 1,2 birim olacak şekilde.
import { Group, Mesh, MeshStandardMaterial, MeshBasicMaterial, Color, CanvasTexture, RepeatWrapping, SphereGeometry, CapsuleGeometry, ConeGeometry, CylinderGeometry,
  TorusGeometry, LatheGeometry, Vector2, Vector3, Scene, PerspectiveCamera, HemisphereLight, DirectionalLight, PlaneGeometry, WebGLRenderer, SRGBColorSpace, ACESFilmicToneMapping } from 'three';
// yalnızca kullanılan sınıflar (paket boyutu için)
const THREE = { Group, Mesh, MeshStandardMaterial, MeshBasicMaterial, Color, CanvasTexture, RepeatWrapping, SphereGeometry, CapsuleGeometry, ConeGeometry, CylinderGeometry,
  TorusGeometry, LatheGeometry, Vector2, Vector3, Scene, PerspectiveCamera, HemisphereLight, DirectionalLight, PlaneGeometry, WebGLRenderer, SRGBColorSpace, ACESFilmicToneMapping };

// ---- kil malzemesi: mat, hafif pürüzlü (parmak izi dokusu), yumuşak ışık
let clayBump = null;
function bumpTex() {
  if (clayBump) return clayBump;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const img = g.createImageData(128, 128);
  // yumuşak gürültü + birkaç parmak izi kıvrımı
  for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
    const n = 128 + 22 * Math.sin(x * 0.21 + Math.sin(y * 0.13) * 2) * Math.cos(y * 0.17) + (Math.random() - 0.5) * 26;
    const i = (y * 128 + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = n; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  clayBump = new THREE.CanvasTexture(c); clayBump.wrapS = clayBump.wrapT = THREE.RepeatWrapping; clayBump.repeat.set(2, 2);
  return clayBump;
}
const matCache = new Map();
export function clay(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: opts.gloss ? 0.35 : 0.82, metalness: 0, bumpMap: opts.smooth ? null : bumpTex(), bumpScale: 0.6,
      emissive: opts.glow ? new THREE.Color(opts.glow) : new THREE.Color(0), emissiveIntensity: opts.glow ? 0.9 : 0, transparent: opts.alpha != null, opacity: opts.alpha ?? 1 });
    matCache.set(key, m);
  }
  return m;
}

// ---- geometri önbelleği
const geoCache = new Map();
const G = (key, make) => { let g = geoCache.get(key); if (!g) { g = make(); geoCache.set(key, g); } return g; };
export const SPH = () => G('sph', () => new THREE.SphereGeometry(1, 20, 14));
export const HEMI = () => G('hemi', () => new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2));
export const CAPS = () => G('caps', () => new THREE.CapsuleGeometry(1, 1, 5, 12));
export const CONE = () => G('cone', () => new THREE.ConeGeometry(1, 1, 14, 1));
export const CYL = () => G('cyl', () => new THREE.CylinderGeometry(1, 1, 1, 10, 1));
export const TOR = () => G('tor', () => new THREE.TorusGeometry(1, 0.22, 8, 20));

// ---- kurucular
export function grp(parent, name, x = 0, y = 0, z = 0) {
  const g = new THREE.Group(); g.name = name || ''; g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}
// elips kütle
export function blob(parent, color, x, y, z, rx, ry = rx, rz = rx, opts) {
  const m = new THREE.Mesh(SPH(), clay(color, opts)); m.position.set(x, y, z); m.scale.set(rx, ry, rz);
  m.castShadow = false; parent.add(m); return m;
}
// kapsül: (x,y,z)'den yönü (dx,dy,dz) olan, yarıçapı r, boyu len
export function caps(parent, color, x, y, z, r, len, rx = 0, ry = 0, rz = 0, opts) {
  // CapsuleGeometry(1,1) boyu 3 birim: y ölçeği boyu verir (uçlar da biraz uzar; kilde fark edilmez)
  const m = new THREE.Mesh(CAPS(), clay(color, opts)); m.position.set(x, y, z); m.scale.set(r, len / 3, r); m.rotation.set(rx, ry, rz); parent.add(m); return m;
}
export function cone(parent, color, x, y, z, r, h, rx = 0, ry = 0, rz = 0, opts) {
  const m = new THREE.Mesh(CONE(), clay(color, opts)); m.position.set(x, y, z); m.scale.set(r, h, r * (opts?.flat || 1)); m.rotation.set(rx, ry, rz); parent.add(m); return m;
}
export function cyl(parent, color, x, y, z, r, h, rx = 0, ry = 0, rz = 0, opts) {
  const m = new THREE.Mesh(CYL(), clay(color, opts)); m.position.set(x, y, z); m.scale.set(r, h, r); m.rotation.set(rx, ry, rz); parent.add(m); return m;
}
export function torus(parent, color, x, y, z, r, rx = 0, ry = 0, rz = 0, tube = 1) {
  const m = new THREE.Mesh(TOR(), clay(color)); m.position.set(x, y, z); m.scale.set(r, r, r * tube); m.rotation.set(rx, ry, rz); parent.add(m); return m;
}
// döndürme gövdesi (saksı, yumurta, kabuk): profil [ [r,y], … ]
export function lathe(parent, color, pts, x = 0, y = 0, z = 0, opts) {
  const key = 'lathe' + JSON.stringify(pts);
  const g = G(key, () => new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), 24));
  const m = new THREE.Mesh(g, clay(color, { ...opts })); m.position.set(x, y, z); parent.add(m); return m;
}

// ---- göz: beyaz küre, iris, göz bebeği, ışık; kapak = gövde renginde yarım küre (dönerek kapanır)
// opts: iris, pupil ('round'|'slit'|'bar'|'bead'), lid (renk), r, look (bakışta bebeğin kayma payı)
export function eye(parent, name, x, y, z, r, opts = {}) {
  const g = grp(parent, name, x, y, z);
  if (opts.ry) g.rotation.y = opts.ry;
  const bead = opts.pupil === 'bead';
  blob(g, bead ? '#1A1719' : (opts.white || '#F6F0E2'), 0, 0, 0, r, r, r * 0.8, { smooth: true, gloss: true });
  const pup = grp(g, name + 'Pup', 0, 0, r * 0.62);
  if (!bead) {
    blob(pup, opts.iris || '#C99A2E', 0, 0, 0, r * 0.62, r * 0.62, r * 0.32, { smooth: true, gloss: true });
    if (opts.pupil === 'slit') blob(pup, '#141014', 0, 0, r * 0.2, r * 0.13, r * 0.52, r * 0.16, { smooth: true });
    else if (opts.pupil === 'bar') blob(pup, '#141014', 0, 0, r * 0.2, r * 0.5, r * 0.14, r * 0.16, { smooth: true });
    else blob(pup, '#141014', 0, 0, r * 0.2, r * 0.32, r * 0.32, r * 0.18, { smooth: true });
  }
  blob(pup, '#FFFFFF', -r * 0.22, r * 0.24, r * (bead ? 0.2 : 0.36), r * 0.13, r * 0.13, r * 0.06, { smooth: true, glow: '#ffffff' });
  // kapak: üst yarım küre, x ekseninde döner (0 açık, π/2 kapalı)
  const lid = grp(g, name + 'Lid');
  const lm = new THREE.Mesh(HEMI(), clay(opts.lid || '#888', { smooth: true })); lm.scale.set(r * 1.08, r * 1.08, r * 1.0); lid.add(lm);
  lid.rotation.x = -0.25;
  g.userData = { r, pup, lid };
  return g;
}

// ---- bacak: kalçada dönen grup; üst kapsül + pati (yerde). len: kalçadan yere
export function leg(parent, name, x, y, z, len, r, color, pawColor) {
  const g = grp(parent, name, x, y, z);
  caps(g, color, 0, -len / 2 + r * 0.2, 0, r, len - r * 0.4);
  blob(g, pawColor || color, 0, -len + r * 0.55, r * 0.35, r * 1.15, r * 0.6, r * 1.45);
  g.userData.len = len;
  return g;
}

// ---- kuyruk zinciri: segmentler iç içe gruplar (dalga hareketi için)
export function tailChain(parent, name, x, y, z, n, segLen, r0, r1, color, dir = [0, 0.4, -1], tipColor) {
  let p = grp(parent, name, x, y, z);
  const root = p; const segs = [];
  const v = new THREE.Vector3(...dir).normalize();
  for (let i = 0; i < n; i++) {
    const r = r0 + (r1 - r0) * (i / Math.max(1, n - 1));
    const seg = grp(p, name + i);
    const m = blob(seg, i === n - 1 && tipColor ? tipColor : color, v.x * segLen * 0.5, v.y * segLen * 0.5, v.z * segLen * 0.5, r, r, segLen * 0.62);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), v);
    segs.push(seg);
    const nx = grp(seg, '', v.x * segLen * 0.85, v.y * segLen * 0.85, v.z * segLen * 0.85);
    p = nx;
  }
  root.userData.segs = segs;
  return root;
}
// elipsoid yüzeyine yapışık leke (çizgi, benek, rozet): u = çevre açısı, v = yükseklik açısı
export function mark(parent, color, rx, ry, rz, cx, cy, cz, u, v, w, h, depth = 0.04, ring = false) {
  const nx = Math.sin(u) * Math.cos(v), ny = Math.sin(v), nz = Math.cos(u) * Math.cos(v);
  const m = new THREE.Mesh(ring ? TOR() : SPH(), clay(color));
  m.position.set(cx + rx * nx * 0.985, cy + ry * ny * 0.985, cz + rz * nz * 0.985);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(nx / rx, ny / ry, nz / rz).normalize());
  m.scale.set(w, h, ring ? depth * 4 : depth);
  parent.add(m); return m;
}
export { THREE };
