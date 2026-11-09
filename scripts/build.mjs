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
  format: 'iife',
  target: ['es2020', 'safari15', 'chrome90'],
  minify: true,
  sourcemap: false,
  legalComments: 'none',
  outfile: path.join(out, 'assets/app.js'),
  define: { __APP_VERSION__: JSON.stringify(version), __BUILD_TIME__: JSON.stringify(buildTime) },
  logLevel: 'warning'
});

// Temalar: renkler CSS değişkenlerine çevrilir; her tema yalnızca değişkenleri değiştirir.
const baseCss = (await readFile(path.join(root, 'src/styles.css'), 'utf8')) + '\n' + (await readFile(path.join(root, 'src/features.css'), 'utf8'));
const themed = buildThemedCss(baseCss);
await mkdir(path.join(root, '.build'), { recursive: true });
await writeFile(path.join(root, '.build/styles.css'), themed.css);
await writeFile(path.join(root, '.build/themes.css'), themed.themes);
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

console.log(`✓ www/ hazır — dam-la ${version}`);
