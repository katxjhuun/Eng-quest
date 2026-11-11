// GitHub Pages sitesi: www/ (uygulamanın web sürümü) + admin-dist/ → _site/ ve _site/admin/
import { rm, cp, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(root, '_site');
await rm(site, { recursive: true, force: true });
await mkdir(site, { recursive: true });
await cp(path.join(root, 'www'), site, { recursive: true });
await cp(path.join(root, 'admin-dist'), path.join(site, 'admin'), { recursive: true });
await cp(path.join(root, 'indir'), path.join(site, 'indir'), { recursive: true });
await writeFile(path.join(site, '.nojekyll'), '');
console.log('✓ _site/ hazır (uygulama + /admin/ + /indir/)');
