// src/ + public/ → www/ (Capacitor'ın telefona koyduğu ve OTA ile güncellenen klasör)
import { build } from 'esbuild';
import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildThemedCss } from './theme-gen.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'www');
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version;
const buildTime = new Date().toISOString();

await rm(out, { recursive: true, force: true });
await mkdir(path.join(out, 'assets'), { recursive: true });

await build({
  entryPoints: [path.join(root, 'src/app.js')],
  bundle: true,
  // ESM + parçalama: Firebase, savaş ekranı ve bilgi tabloları ilk açılışta değil, gerektiğinde yüklenir
  format: 'esm',
  splitting: true,
  chunkNames: 'chunks/[name]-[hash]',
  target: ['es2020', 'safari15', 'chrome90'],
  minify: true,
  sourcemap: false,
  legalComments: 'none',
  outdir: path.join(out, 'assets'),
  define: { __APP_VERSION__: JSON.stringify(version), __BUILD_TIME__: JSON.stringify(buildTime) },
  logLevel: 'warning'
});

// Temalar: renkler CSS değişkenlerine çevrilir; her tema yalnızca değişkenleri değiştirir.
const baseCss = (await readFile(path.join(root, 'src/styles.css'), 'utf8')) + '\n' + (await readFile(path.join(root, 'src/features.css'), 'utf8')) + '\n' + (await readFile(path.join(root, 'src/pet.css'), 'utf8')) + '\n' + (await readFile(path.join(root, 'src/games/games.css'), 'utf8')) + '\n' + (await readFile(path.join(root, 'src/battle/battle.css'), 'utf8'));
const themed = buildThemedCss(baseCss);
await mkdir(path.join(root, '.build'), { recursive: true });
await writeFile(path.join(root, '.build/styles.css'), themed.css);
// Tema özel ek stiller (ör. logo temasının çıkartma görünümü): renkleri dönüştürülmeden, temaların arkasına eklenir.
await writeFile(path.join(root, '.build/themes.css'), themed.themes + '\n' + (await readFile(path.join(root, 'src/theme-extras.css'), 'utf8')));
for (const name of ['styles', 'themes']) {
  await build({
    entryPoints: [path.join(root, `.build/${name}.css`)],
    bundle: true,
    minify: true,
    target: ['safari15', 'chrome90'],
    outfile: path.join(out, `assets/${name}.css`),
    logLevel: 'warning'
  });
}
console.log(`  ${themed.count} renk değişkeni · temalar üretildi`);

// Önbellek kırıcı: her sürüm kendi ?v= parametresiyle yüklenir.
let html = await readFile(path.join(root, 'src/index.html'), 'utf8');
html = html.replace('./assets/styles.css', `./assets/styles.css?v=${version}`).replace('./assets/themes.css', `./assets/themes.css?v=${version}`).replace('./assets/app.js', `./assets/app.js?v=${version}`);
// İçerik Güvenlik Politikası: yalnızca uygulamanın kendi betikleri (+ satır içi tema betiğinin özeti) çalışabilir;
// ağ istekleri bilinen servislerle sınırlıdır. Böylece olası bir HTML enjeksiyonu kod çalıştıramaz ve veri dışarı sızdıramaz.
const { createHash } = await import('node:crypto');
const inlineHashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`);
const FB = 'https://*.firebaseio.com https://*.firebasedatabase.app';
const csp = [
  "default-src 'self'",
  `script-src 'self' ${inlineHashes.join(' ')} ${FB} https://www.youtube.com https://s.ytimg.com`,
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' data: blob: https:",
  `connect-src 'self' ${FB} wss://*.firebaseio.com wss://*.firebasedatabase.app https://*.googleapis.com https://itunes.apple.com https://api.deezer.com https://github.com https://*.githubusercontent.com https://huggingface.co https://*.huggingface.co https://*.hf.co https://cdn.jsdelivr.net`,
  "worker-src 'self' blob:",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');
if (!html.includes('<meta charset="utf-8">')) throw new Error('index.html: <meta charset> bulunamadı (CSP eklenemedi)');
html = html.replace('<meta charset="utf-8">', `<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="${csp}">\n<meta name="referrer" content="strict-origin-when-cross-origin">`);
await writeFile(path.join(out, 'index.html'), html);

await cp(path.join(root, 'public'), out, { recursive: true });
// Kokoro AI sesi: kütüphane uygulamayla birlikte gelir; transformers ayarına erişim için dışa aktarım eklenir.
await mkdir(path.join(out, 'vendor'), { recursive: true });
let kokoroLib = await readFile(path.join(root, 'node_modules/kokoro-js/dist/kokoro.web.js'), 'utf8');
const KOKORO_EXPORT = 'export{Ef as KokoroTTS,kf as TextSplitterStream,Mf as env};';
if (!kokoroLib.includes(KOKORO_EXPORT)) throw new Error('kokoro-js sürümü değişmiş: dışa aktarım satırı bulunamadı');
kokoroLib = kokoroLib.replace(KOKORO_EXPORT, 'export{Ef as KokoroTTS,kf as TextSplitterStream,Mf as env,Wg as transformersEnv};');
await writeFile(path.join(out, 'vendor/kokoro.web.js'), kokoroLib);
await cp(path.join(root, 'src/vendor/kokoro-worker.js'), path.join(out, 'vendor/kokoro-worker.js'));
const sw = (await readFile(path.join(out, 'sw.js'), 'utf8')).replace('__APP_VERSION__', version);
await writeFile(path.join(out, 'sw.js'), sw);
await writeFile(path.join(out, 'version.json'), JSON.stringify({ version, buildTime }, null, 2));
// "Yenilikler" penceresi için: DEGISIKLIKLER.md → changelog.json (son 8 sürüm; başlık ve maddeler)
{
  const md = await readFile(path.join(root, 'DEGISIKLIKLER.md'), 'utf8').catch(() => '');
  const list = [];
  for (const block of md.split(/^# /m).slice(1)) {
    const [head, ...rest] = block.split('\n');
    const m = head.match(/dam-la\s+([0-9][0-9.]*)\s*[—-]\s*(.+)/); if (!m) continue;
    const items = rest.filter(l => /^\s*-\s+/.test(l)).map(l => l.replace(/^\s*-\s+/, '').trim()).slice(0, 14);
    list.push({ v: m[1], title: m[2].trim(), items });
    if (list.length >= 8) break;
  }
  await writeFile(path.join(out, 'changelog.json'), JSON.stringify(list));
}

console.log(`✓ www/ hazır — dam-la ${version}`);
