// admin/ → admin-dist/ : uygulamadan bağımsız yönetici paneli (GitHub Pages'te /admin/ altında yayınlanır).
// OTA paketine (www/) girmez; telefondaki uygulamanın içinde yer almaz.
import { build } from 'esbuild';
import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'admin-dist');
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await build({
  entryPoints: [path.join(root, 'admin/admin.js')],
  bundle: true, format: 'iife', minify: true, legalComments: 'none',
  target: ['es2020', 'safari15', 'chrome90'],
  outfile: path.join(out, 'admin.js'),
  define: { __APP_VERSION__: JSON.stringify(pkg.version), __BUILD_TIME__: JSON.stringify(new Date().toISOString()) },
  logLevel: 'warning'
});
const v = pkg.version + '-' + Date.now().toString(36);
const html = (await readFile(path.join(root, 'admin/index.html'), 'utf8')).replace('./admin.css', `./admin.css?v=${v}`).replace('./admin.js', `./admin.js?v=${v}`);
await writeFile(path.join(out, 'index.html'), html);
await cp(path.join(root, 'admin/admin.css'), path.join(out, 'admin.css'));
await cp(path.join(root, 'public/logo.png'), path.join(out, 'logo.png'));
console.log('✓ admin-dist/ hazır — yönetici paneli');
