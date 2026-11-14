// GitHub Pages sitesi: www/ (uygulamanın web sürümü) + admin-dist/ → _site/ ve _site/admin/
import { rm, cp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(root, '_site');
await rm(site, { recursive: true, force: true });
await mkdir(site, { recursive: true });
await cp(path.join(root, 'www'), site, { recursive: true });
await cp(path.join(root, 'admin-dist'), path.join(site, 'admin'), { recursive: true });
await cp(path.join(root, 'indir'), path.join(site, 'indir'), { recursive: true });
// kurulum rehberi: GitHub API'sine bağlı kalmadan (okul ağında saatlik sınır dolabilir) hep en güncel APK ve sürüm
{
  const ver = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).version;
  const f = path.join(site, 'indir', 'index.html');
  let h = await readFile(f, 'utf8');
  h = h.replace('href="https://github.com/katxjhuun/Eng-quest/releases/latest"', 'href="https://github.com/katxjhuun/Eng-quest/releases/latest/download/dam-la.apk"')
    .replace('<p class="ver" id="ver"></p>', `<p class="ver" id="ver">Güncel sürüm: ${ver}</p>`);
  await writeFile(f, h);
}
await writeFile(path.join(site, '.nojekyll'), '');
console.log('✓ _site/ hazır (uygulama + /admin/ + /indir/)');
