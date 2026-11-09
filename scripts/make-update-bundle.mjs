// www/ klasörünü OTA güncelleme paketine çevirir:
//   dist-ota/web-bundle.zip  — telefona indirilecek içerik
//   dist-ota/update.json     — uygulamanın denetlediği sürüm bilgisi
// Kullanım: node scripts/make-update-bundle.mjs [indirme-adresi-tabanı] [notlar]
// GitHub Actions "release" iş akışı bunu otomatik çalıştırır.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version;
const minNativeVersion = pkg.minNativeVersion || '2.0.0';
const repo = process.env.GITHUB_REPOSITORY || 'katxjhuun/Eng-quest';
const baseUrl = process.argv[2] || `https://github.com/${repo}/releases/download/v${version}`;
const notes = process.argv[3] || process.env.RELEASE_NOTES || '';

const outDir = path.join(root, 'dist-ota');
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
const zipPath = path.join(outDir, 'web-bundle.zip');

// index.html zip'in kök dizininde olmalı.
execFileSync('zip', ['-q', '-r', '-X', zipPath, '.', '-x', 'sw.js'], { cwd: path.join(root, 'www'), stdio: 'inherit' });

const checksum = createHash('sha256').update(await readFile(zipPath)).digest('hex');
const manifest = {
  version,
  minNativeVersion,
  url: `${baseUrl}/web-bundle.zip`,
  checksum,
  notes,
  publishedAt: new Date().toISOString()
};
await writeFile(path.join(outDir, 'update.json'), JSON.stringify(manifest, null, 2));
console.log(`✓ OTA paketi: ${version} (sha256 ${checksum.slice(0, 12)}…)\n  ${manifest.url}`);
