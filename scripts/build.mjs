// src/ + public/ → www/ (Capacitor'ın telefona koyduğu ve OTA ile güncellenen klasör)
import { build } from 'esbuild';
import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

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

await build({
  entryPoints: [path.join(root, 'src/styles.css')],
  bundle: true,
  minify: true,
  target: ['safari15', 'chrome90'],
  outfile: path.join(out, 'assets/styles.css'),
  logLevel: 'warning'
});

// Önbellek kırıcı: her sürüm kendi ?v= parametresiyle yüklenir.
let html = await readFile(path.join(root, 'src/index.html'), 'utf8');
html = html.replace('./assets/styles.css', `./assets/styles.css?v=${version}`).replace('./assets/app.js', `./assets/app.js?v=${version}`);
await writeFile(path.join(out, 'index.html'), html);

await cp(path.join(root, 'public'), out, { recursive: true });
const sw = (await readFile(path.join(out, 'sw.js'), 'utf8')).replace('__APP_VERSION__', version);
await writeFile(path.join(out, 'sw.js'), sw);
await writeFile(path.join(out, 'version.json'), JSON.stringify({ version, buildTime }, null, 2));

console.log(`✓ www/ hazır — English Quest ${version}`);
