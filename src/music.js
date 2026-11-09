// dam-la — ödül penceresindeki güncel popüler şarkı önerisi
// Kaynaklar (hepsi herkese açık, anahtarsız):
//  • Apple iTunes “en çok satanlar” listesi (Türkiye / ABD), açık içerik filtreli — tarayıcıda ve telefonda çalışır
//  • Deezer “Top Turkey” ve küresel liste — yalnızca telefondaki uygulamada (CORS nedeniyle)
import { Platform } from './platform.js';

const CHART_TTL = 3 * 60 * 60 * 1000;
const SEEN_KEY = 'dl-music-seen', LIKED_KEY = 'dl-music-liked', CACHE_KEY = 'dl-music-charts';
const DEEZER_TOP_TURKEY = 1116189071;

function readJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || '') ?? fallback; } catch { return fallback; } }
function writeJson(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }
export function seenIds() { return new Set(readJson(SEEN_KEY, [])); }
function markSeen(id) { const arr = readJson(SEEN_KEY, []).filter(x => x !== id); arr.push(id); writeJson(SEEN_KEY, arr.slice(-160)); }
export function likedSongs() { return readJson(LIKED_KEY, []); }
export function toggleLike(track) {
  const list = likedSongs(); const i = list.findIndex(t => t.id === track.id);
  if (i >= 0) list.splice(i, 1); else list.unshift({ id: track.id, title: track.title, artist: track.artist, link: track.link, at: Date.now() });
  writeJson(LIKED_KEY, list.slice(0, 50)); return i < 0;
}
export function isLiked(id) { return likedSongs().some(t => t.id === id); }

async function cached(key, loader) {
  const all = readJson(CACHE_KEY, {});
  const hit = all[key];
  if (hit && Date.now() - hit.at < CHART_TTL && Array.isArray(hit.items) && hit.items.length) return hit.items;
  const items = await loader();
  all[key] = { at: Date.now(), items }; writeJson(CACHE_KEY, all);
  return items;
}

async function itunesChart(country) {
  return cached('itunes-' + country, async () => {
    const d = await Platform.getJson(`https://itunes.apple.com/${country}/rss/topsongs/limit=100/explicit=false/json`, 9000);
    const entries = d?.feed?.entry || [];
    return entries.map((e, i) => {
      const links = Array.isArray(e.link) ? e.link : [e.link];
      const prev = links.find(l => l?.attributes?.['im:assetType'] === 'preview')?.attributes?.href || '';
      const page = links.find(l => l?.attributes?.rel === 'alternate')?.attributes?.href || '';
      const imgs = e['im:image'] || [];
      return {
        id: 'it-' + (e.id?.attributes?.['im:id'] || i), provider: 'itunes', rank: i + 1,
        title: e['im:name']?.label || '', artist: e['im:artist']?.label || '', album: e['im:collection']?.['im:name']?.label || '',
        genre: e.category?.attributes?.label || '', artwork: (imgs[imgs.length - 1]?.label || '').replace(/\d+x\d+bb/, '300x300bb'),
        previewUrl: prev, link: page.replace(/[?&]uo=\d+/, ''),
        chart: country === 'tr' ? 'Türkiye · iTunes en çok satanlar' : 'Dünya (ABD) · iTunes en çok satanlar',
      };
    }).filter(t => t.title && t.artist);
  });
}
async function deezerList(kind) {
  if (!Platform.isNative) throw new Error('Deezer yalnızca uygulamada');
  return cached('deezer-' + kind, async () => {
    const url = kind === 'tr' ? `https://api.deezer.com/playlist/${DEEZER_TOP_TURKEY}/tracks?limit=100` : 'https://api.deezer.com/chart/0/tracks?limit=100';
    const d = await Platform.getJson(url, 9000);
    return (d?.data || []).filter(t => t.preview && t.explicit_lyrics !== true && Number(t.explicit_content_lyrics || 0) === 0).map((t, i) => ({
      id: 'dz-' + t.id, provider: 'deezer', rank: i + 1, title: t.title, artist: t.artist?.name || '', album: t.album?.title || '',
      genre: '', artwork: t.album?.cover_medium || '', previewUrl: t.preview, link: t.link || `https://www.deezer.com/track/${t.id}`,
      chart: kind === 'tr' ? 'Deezer · Top Turkey' : 'Deezer · Dünya listesi',
    }));
  });
}

function safe(t, blockRe) {
  if (!t || !t.title || !t.artist) return false;
  if (blockRe && blockRe.test(`${t.title} ${t.artist} ${t.album}`)) return false;
  if (t.previewUrl) { try { const u = new URL(t.previewUrl); if (u.protocol !== 'https:') return false; } catch { return false; } }
  return true;
}

// Ödül için şarkı seç: listenin üst sıralarına biraz daha ağırlık ver, görülenleri tekrarlama.
export async function pickTrack({ region = 'mix', blockRe } = {}) {
  const reg = region === 'mix' ? (Math.random() < 0.6 ? 'tr' : 'global') : region;
  const loaders = reg === 'tr'
    ? [() => itunesChart('tr'), () => deezerList('tr'), () => itunesChart('us')]
    : [() => itunesChart('us'), () => deezerList('global'), () => itunesChart('tr')];
  if (Platform.isNative && Math.random() < 0.5) loaders.splice(0, 2, loaders[1], loaders[0]);
  const seen = seenIds(); let lastErr;
  for (const load of loaders) {
    try {
      const list = (await load()).filter(t => safe(t, blockRe));
      const fresh = list.filter(t => !seen.has(t.id));
      const pool = fresh.length ? fresh : list;
      if (!pool.length) continue;
      // ağırlıklı seçim: ilk 30 daha olası
      const weights = pool.map(t => 1 / Math.sqrt(t.rank || 50));
      let r = Math.random() * weights.reduce((a, b) => a + b, 0), pick = pool[0];
      for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) { pick = pool[i]; break; } }
      markSeen(pick.id);
      return { ...pick, rankText: `${pick.chart} #${pick.rank}${pick.genre ? ' · ' + pick.genre : ''}` };
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Liste alınamadı');
}

export function searchLinks(track) {
  const q = encodeURIComponent(`${track.title} ${track.artist}`);
  return { spotify: `https://open.spotify.com/search/${q}`, youtube: `https://music.youtube.com/search?q=${q}` };
}
