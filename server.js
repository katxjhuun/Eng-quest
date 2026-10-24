'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// Read a local .env file for easy Windows setup. Real environment variables win.
function loadDotEnvFile() {
  const file = path.join(__dirname, '.env');
  let content = '';
  try { content = fs.readFileSync(file, 'utf8'); } catch { return; }
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    else value = value.replace(/\s+#.*$/, '').trim();
    if (process.env[key] === undefined || process.env[key] === '') process.env[key] = value;
  }
}
loadDotEnvFile();

const ROOT = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT || 4319);
const APP_PASSWORD = process.env.APP_PASSWORD || '';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_PROGRESS_READY = Boolean(SUPABASE_URL && SUPABASE_SECRET_KEY);
const IS_HOSTED_RENDER = process.env.RENDER === 'true' || Boolean(process.env.RENDER_SERVICE_ID);
// Music artwork and preview media only; no unrelated media discovery is implemented.
const BLOCKED_MUSIC_TERMS = /\b(?:sex(?:ual)?|porn(?:ography)?|hentai|nsfw|nudes?|erotic|lewd|onlyfans|fetish|orgasm|masturbat\w*|penis|vagina|boobs?|tits|politic\w*|election\w*|president\w*|congress|parliament|government|democrat\w*|republican\w*|trump|biden|putin|warfare|war|battlefield|invasion|genocide|airstrike|missile|military|terroris\w*|cartel|true\s?crime|criminal\w*|murder\w*|homicide|robbery|burglary|kidnap\w*|rape|sexual\s?assault|crime)\b/i;
const IMAGE_HOST_OK = host => host === 'dzcdn.net' || host.endsWith('.dzcdn.net') || host === 'mzstatic.com' || host.endsWith('.mzstatic.com');
const AUDIO_HOST_OK = host => host === 'dzcdn.net' || host.endsWith('.dzcdn.net') || host === 'audio-ssl.itunes.apple.com' || host === 'audio.itunes.apple.com';
const recentMusicIds = new Set();

function loadLocalSessionSecret() {
  const file = path.join(__dirname, 'data', '.session_secret');
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8').trim();
    const secret = crypto.randomBytes(48).toString('base64url');
    try { fs.writeFileSync(file, secret, { mode: 0o600, flag: 'wx' }); return secret; }
    catch { if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8').trim(); throw new Error('Session secret could not be persisted.'); }
  } catch { return crypto.randomBytes(48).toString('base64url'); }
}
const SESSION_SECRET = process.env.SESSION_SECRET || loadLocalSessionSecret();
const SESSION_SECRET_CONFIGURED = Boolean(process.env.SESSION_SECRET);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data', 'users');
const MAX_BODY = 256 * 1024;
const RATE_WINDOW = 60 * 1000;
const RATE_MAX = 24;
const requestsByIp = new Map();

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8'
};

function json(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer'
  });
  res.end(JSON.stringify(payload));
}
function isAuthorized(req) {
  if (!APP_PASSWORD) return true;
  const supplied = req.headers['x-app-password'];
  if (typeof supplied !== 'string' || supplied.length > 256) return false;
  const a = Buffer.from(supplied, 'utf8');
  const b = Buffer.from(APP_PASSWORD, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function parseCookies(req) {
  const out = {};
  const raw = String(req.headers.cookie || '');
  for (const part of raw.split(';')) {
    const at = part.indexOf('=');
    if (at < 0) continue;
    const key = part.slice(0, at).trim();
    const value = part.slice(at + 1).trim();
    try { out[key] = decodeURIComponent(value); } catch { out[key] = value; }
  }
  return out;
}
function makeSessionCookie(user) {
  const payload = {
    sub: String(user.sub), email: String(user.email || ''),
    name: String(user.name || ''), picture: String(user.picture || ''),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 60
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}
function getGoogleSession(req) {
  const token = parseCookies(req).engquest_session;
  if (!token || typeof token !== 'string') return null;
  const [encoded, signature, extra] = token.split('.');
  if (!encoded || !signature || extra) return null;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest();
  let supplied;
  try { supplied = Buffer.from(signature, 'base64url'); } catch { return null; }
  if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload.sub || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}
function cookieFlags(req) {
  const secure = req.socket.encrypted || req.headers['x-forwarded-proto'] === 'https';
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 60}${secure ? '; Secure' : ''}`;
}
function userDataPath(sub) {
  const key = crypto.createHash('sha256').update(String(sub)).digest('hex');
  return path.join(DATA_DIR, `${key}.json`);
}

function cloudProgressUrl() { return `${SUPABASE_URL}/rest/v1/user_progress`; }
function supabaseHeaders(extra = {}) {
  // New sb_secret_* keys are API keys, not JWTs: send them in apikey only.
  // Legacy service_role keys are JWT-based and also work as Authorization bearer tokens.
  const headers = { 'apikey': SUPABASE_SECRET_KEY, 'Accept': 'application/json' };
  if (!SUPABASE_SECRET_KEY.startsWith('sb_secret_')) headers.Authorization = `Bearer ${SUPABASE_SECRET_KEY}`;
  return { ...headers, ...extra };
}
async function supabaseRequest(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, { ...options, headers: supabaseHeaders(options.headers || {}), signal: controller.signal, cache: 'no-store' });
    if (!response.ok) {
      const detail = (await response.text().catch(() => '')).slice(0, 300);
      console.error('[cloud-progress] Supabase returned', response.status, detail);
      throw Object.assign(new Error('Bulut veritabanına erişilemedi. Supabase tablo/anahtar ayarlarını kontrol et.'), { status: 503 });
    }
    return response;
  } catch (error) {
    if (error.status) throw error;
    throw Object.assign(new Error(error.name === 'AbortError' ? 'Bulut kaydı zaman aşımına uğradı.' : 'Bulut veritabanına bağlanılamadı.'), { status: 503 });
  } finally { clearTimeout(timer); }
}
async function readProgressForUser(sub) {
  if (SUPABASE_PROGRESS_READY) {
    const target = new URL(cloudProgressUrl());
    target.searchParams.set('select', 'state,updated_at');
    target.searchParams.set('user_sub', `eq.${String(sub)}`);
    target.searchParams.set('limit', '1');
    const response = await supabaseRequest(target.href, { method: 'GET' });
    const rows = await response.json();
    return Array.isArray(rows) && rows.length ? rows[0].state : null;
  }
  if (IS_HOSTED_RENDER) throw Object.assign(new Error('Bulut ilerleme kaydı yapılandırılmamış. SUPABASE_URL ve SUPABASE_SECRET_KEY ortam değişkenlerini ayarla.'), { status: 503 });
  const file = userDataPath(sub);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
async function writeProgressForUser(sub, state) {
  if (SUPABASE_PROGRESS_READY) {
    const target = new URL(cloudProgressUrl());
    target.searchParams.set('on_conflict', 'user_sub');
    await supabaseRequest(target.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify([{ user_sub: String(sub), state, updated_at: new Date(Number(state.updatedAt) || Date.now()).toISOString() }])
    });
    return;
  }
  if (IS_HOSTED_RENDER) throw Object.assign(new Error('Bulut ilerleme kaydı yapılandırılmamış. SUPABASE_URL ve SUPABASE_SECRET_KEY ortam değişkenlerini ayarla.'), { status: 503 });
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(userDataPath(sub), JSON.stringify(state), { mode: 0o600 });
}
function isApiAuthorized(req) {
  return isAuthorized(req) || Boolean(getGoogleSession(req));
}
async function verifyGoogleCredential(credential) {
  if (!GOOGLE_CLIENT_ID) throw Object.assign(new Error('Google girişi henüz yapılandırılmadı. Sunucuya GOOGLE_CLIENT_ID eklenmeli.'), { status: 503 });
  if (typeof credential !== 'string' || credential.length < 50 || credential.length > 12000) {
    throw Object.assign(new Error('Google kimlik doğrulama yanıtı geçersiz.'), { status: 400 });
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, { signal: controller.signal });
    const profile = await response.json().catch(() => ({}));
    const issuerOk = ['accounts.google.com', 'https://accounts.google.com'].includes(profile.iss);
    const exp = Number(profile.exp || 0);
    if (!response.ok || profile.aud !== GOOGLE_CLIENT_ID || !issuerOk || !profile.sub || exp <= Math.floor(Date.now() / 1000)) {
      throw Object.assign(new Error('Google kimliği doğrulanamadı. Tekrar giriş yap.'), { status: 401 });
    }
    if (profile.email_verified !== 'true' && profile.email_verified !== true) {
      throw Object.assign(new Error('Google hesabının e-posta adresi doğrulanmış olmalı.'), { status: 401 });
    }
    return { sub: profile.sub, email: profile.email || '', name: profile.name || profile.given_name || 'Öğrenci', picture: profile.picture || '' };
  } finally { clearTimeout(timeout); }
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (Buffer.byteLength(data) > MAX_BODY) {
        reject(Object.assign(new Error('İstek çok büyük.'), { status: 413 }));
        req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); }
      catch { reject(Object.assign(new Error('Geçersiz JSON.'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}
function sendFile(req, res, pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return json(res, 400, { error: 'Geçersiz adres.' }); }
  let filePath = path.join(ROOT, decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, ''));
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== path.join(ROOT, 'index.html')) return json(res, 403, { error: 'Erişim reddedildi.' });
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) filePath = path.join(ROOT, 'index.html');
    fs.readFile(filePath, (readErr, body) => {
      if (readErr) return json(res, 404, { error: 'Dosya bulunamadı.' });
      const type = MIME[path.extname(filePath)] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': type,
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'microphone=(), camera=(), geolocation=()',
        'Cache-Control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=3600'
      });
      res.end(body);
    });
  });
}


function cappedAdd(set, value, max = 500) {
  set.add(String(value));
  while (set.size > max) set.delete(set.values().next().value);
}
function allowedImageUrl(raw) {
  try {
    const u = new URL(String(raw || ''));
    if (u.protocol !== 'https:' || !IMAGE_HOST_OK(u.hostname.toLowerCase()) || u.username || u.password) return null;
    if (!/\.(?:jpe?g|png|gif|webp|avif)$/i.test(u.pathname) && u.hostname.toLowerCase() !== 'i.chzbgr.com') return null;
    return u;
  } catch { return null; }
}
function localArtworkUrl(upstreamUrl) {
  return `/api/music-artwork?u=${Buffer.from(String(upstreamUrl), 'utf8').toString('base64url')}`;
}
function localAudioUrl(upstreamUrl) {
  return `/api/music-preview?u=${Buffer.from(String(upstreamUrl), 'utf8').toString('base64url')}`;
}

async function fetchJson(url, timeoutMs = 6500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'User-Agent': 'EnglishQuest/1.0 (personal language-learning reward)' },
      signal: controller.signal,
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
    return await response.json();
  } finally { clearTimeout(timer); }
}
function isSafeMusicTrack(track) {
  if (!track || !track.id || !track.title || !track.artist?.name || !track.preview || track.explicit_lyrics === true || Number(track.explicit_content_lyrics || 0) > 0) return false;
  const details = `${track.title} ${track.title_short || ''} ${track.artist.name} ${track.album?.title || ''}`;
  if (BLOCKED_MUSIC_TERMS.test(details)) return false;
  try {
    const preview = new URL(track.preview);
    if (preview.protocol !== 'https:' || !AUDIO_HOST_OK(preview.hostname.toLowerCase())) return false;
  } catch { return false; }
  return true;
}
async function fetchPopularMusic(seenIds) {
  let deezerError = null;
  try {
    const payload = await fetchJson('https://api.deezer.com/chart/0/tracks?limit=100', 8500);
    if (payload?.error || !Array.isArray(payload?.data)) throw new Error('Deezer chart unavailable');
    const candidates = payload.data.filter(isSafeMusicTrack).filter(t => !seenIds.has(String(t.id)) && !recentMusicIds.has(String(t.id)));
    if (candidates.length) {
      const pool = candidates.slice(0, Math.min(60, candidates.length));
      const track = pool[crypto.randomInt(pool.length)];
      cappedAdd(recentMusicIds, track.id, 300);
      const artwork = String(track.album?.cover_medium || track.album?.cover || '');
      const artworkUrl = allowedImageUrl(artwork) ? localArtworkUrl(artwork) : '';
      const deezerUrl = /^https:\/\/www\.deezer\.com\/(?:[a-z]{2}\/)?track\/\d+/i.test(String(track.link || '')) ? track.link : `https://www.deezer.com/track/${encodeURIComponent(track.id)}`;
      return { id: String(track.id), provider: 'deezer', title: String(track.title).slice(0, 180), artist: String(track.artist.name).slice(0, 160), album: String(track.album?.title || '').slice(0, 180), artwork: artworkUrl, previewProxy: localAudioUrl(track.preview), link: deezerUrl, rank: Number(track.rank || 0), source: 'Deezer charts', previewSeconds: 30 };
    }
    deezerError = new Error('No safe unseen Deezer tracks');
  } catch (e) { deezerError = e; }

  // Resilient fallback: Apple's public iTunes Search API has CORS-enabled JSON and 30-second previews.
  try {
    const terms = ['top hits pop music', 'popular songs', 'viral hits music', 'global hits'];
    const term = terms[crypto.randomInt(terms.length)];
    const payload = await fetchJson(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=50&explicit=No`, 9000);
    const rows = Array.isArray(payload?.results) ? payload.results : [];
    const safe = rows.filter(t => {
      const details = `${t.trackName || ''} ${t.artistName || ''} ${t.collectionName || ''}`;
      const preview = String(t.previewUrl || '');
      try { const u = new URL(preview); return Boolean(t.trackId && t.trackName && t.artistName && preview && u.protocol === 'https:' && AUDIO_HOST_OK(u.hostname.toLowerCase()) && !BLOCKED_MUSIC_TERMS.test(details) && !/explicit/i.test(String(t.trackExplicitness || t.collectionExplicitness || ''))); } catch { return false; }
    }).filter(t => !seenIds.has(String(t.trackId)) && !recentMusicIds.has(String(t.trackId)));
    if (!safe.length) throw new Error('No safe iTunes preview tracks returned');
    const track = safe[crypto.randomInt(safe.length)];
    cappedAdd(recentMusicIds, track.trackId, 300);
    const art = String(track.artworkUrl100 || track.artworkUrl60 || '');
    return {
      id: String(track.trackId), provider: 'itunes', title: String(track.trackName).slice(0, 180), artist: String(track.artistName).slice(0, 160),
      album: String(track.collectionName || '').slice(0, 180), artwork: allowedImageUrl(art) ? localArtworkUrl(art) : '',
      previewProxy: localAudioUrl(track.previewUrl), link: /^https:\/\/music\.apple\.com\//i.test(String(track.trackViewUrl || '')) ? track.trackViewUrl : `https://music.apple.com/search?term=${encodeURIComponent(track.trackName + ' ' + track.artistName)}`,
      rank: 0, source: 'Apple iTunes popular-song search', previewSeconds: 30
    };
  } catch (appleError) {
    console.warn('[music-chart] Deezer and iTunes sources failed:', deezerError?.message || '', appleError?.message || '');
    throw new Error('No current safe music preview source is available.');
  }
}
async function readResponseCapped(response, limitBytes) {
  const declared = Number(response.headers.get('content-length') || 0);
  if (declared > limitBytes) throw new Error('Media file exceeds allowed size.');
  if (!response.body) return Buffer.from(await response.arrayBuffer());
  const reader = response.body.getReader();
  const chunks = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limitBytes) { try { await reader.cancel(); } catch {} throw new Error('Media file exceeds allowed size.'); }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks, size);
}
async function serveMusicArtwork(req, res, encoded) {
  if (!isApiAuthorized(req)) return json(res, 401, { error: 'Özel uygulama erişim kodu veya Google oturumu gerekli.' });
  let raw;
  try { raw = Buffer.from(String(encoded || ''), 'base64url').toString('utf8'); } catch { return json(res, 400, { error: 'Görsel adresi geçersiz.' }); }
  const target = allowedImageUrl(raw);
  if (!target) return json(res, 400, { error: 'Bu görsel kaynağına izin verilmiyor.' });
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const upstream = await fetch(target.href, { headers: { 'Accept': 'image/avif,image/webp,image/png,image/jpeg,image/gif,*/*;q=0.5', 'Cache-Control': 'no-cache', 'User-Agent': 'EnglishQuest/1.0' }, signal: controller.signal, cache: 'no-store' });
    if (!upstream.ok) return json(res, 502, { error: 'Görsel sağlayıcısı yanıt vermedi.' });
    const type = String(upstream.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!type.startsWith('image/')) return json(res, 415, { error: 'Kaynak bir görsel döndürmedi.' });
    const bytes = await readResponseCapped(upstream, 9 * 1024 * 1024);
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': bytes.length, 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0', 'Pragma': 'no-cache', 'Expires': '0', 'X-Content-Type-Options': 'nosniff', 'Cross-Origin-Resource-Policy': 'same-origin' });
    res.end(bytes);
  } catch (e) { if (!res.headersSent) json(res, 502, { error: e.name === 'AbortError' ? 'Görsel yükleme zaman aşımına uğradı.' : 'Görsel şu an yüklenemiyor.' }); else res.destroy(); }
  finally { clearTimeout(timer); }
}
async function serveMusicPreview(req, res, id, encodedUrl = '') {
  if (!isApiAuthorized(req)) return json(res, 401, { error: 'Özel uygulama erişim kodu veya Google oturumu gerekli.' });
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 20000);
  try {
    let previewUrl;
    if (encodedUrl) {
      let raw;
      try { raw = Buffer.from(String(encodedUrl), 'base64url').toString('utf8'); } catch { return json(res, 400, { error: 'Ön dinleme adresi geçersiz.' }); }
      const parsed = new URL(raw);
      if (parsed.protocol !== 'https:' || !AUDIO_HOST_OK(parsed.hostname.toLowerCase()) || parsed.username || parsed.password) return json(res, 400, { error: 'Bu ses kaynağına izin verilmiyor.' });
      previewUrl = parsed;
    } else {
      if (!/^\d{1,18}$/.test(String(id || ''))) return json(res, 400, { error: 'Şarkı kimliği geçersiz.' });
      const metadata = await fetchJson(`https://api.deezer.com/track/${id}`, 8000);
      if (metadata?.error || !isSafeMusicTrack(metadata)) return json(res, 404, { error: 'Bu şarkının uygun ön dinlemesi bulunamadı.' });
      previewUrl = new URL(metadata.preview);
      if (!AUDIO_HOST_OK(previewUrl.hostname.toLowerCase())) return json(res, 400, { error: 'Ses kaynağına izin verilmiyor.' });
    }
    const upstream = await fetch(previewUrl.href, { headers: { 'Accept': 'audio/mpeg,audio/mp4,audio/*;q=0.9,*/*;q=0.5', 'Cache-Control': 'no-cache', 'User-Agent': 'EnglishQuest/1.0' }, signal: controller.signal, cache: 'no-store' });
    if (!upstream.ok) return json(res, 502, { error: 'Müzik ön dinleme kaynağı yanıt vermedi.' });
    try { const finalUrl = new URL(upstream.url || previewUrl.href); if (finalUrl.protocol !== 'https:' || !AUDIO_HOST_OK(finalUrl.hostname.toLowerCase())) return json(res, 502, { error: 'Ses kaynağı güvenli değil.' }); } catch { return json(res, 502, { error: 'Ses kaynağı adresi geçersiz.' }); }
    const type = String(upstream.headers.get('content-type') || 'audio/mpeg').split(';')[0].trim().toLowerCase();
    if (!type.startsWith('audio/') && type !== 'application/octet-stream') return json(res, 415, { error: 'Kaynak bir ses ön dinlemesi döndürmedi.' });
    const bytes = await readResponseCapped(upstream, 7 * 1024 * 1024);
    res.writeHead(200, { 'Content-Type': type === 'application/octet-stream' ? 'audio/mpeg' : type, 'Content-Length': bytes.length, 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0', 'Pragma': 'no-cache', 'Expires': '0', 'X-Content-Type-Options': 'nosniff', 'Content-Disposition': 'inline' });
    res.end(bytes);
  } catch (e) { if (!res.headersSent) json(res, 502, { error: e.name === 'AbortError' ? 'Müzik ön dinleme zaman aşımına uğradı.' : 'Müzik ön dinlemesi şu an kullanılamıyor.' }); else res.destroy(); }
  finally { clearTimeout(timer); }
}

const server = http.createServer(async (req, res) => {
  const host = req.headers.host || 'localhost';
  const base = `http://${host}`;
  let url;
  try { url = new URL(req.url, base); } catch { return json(res, 400, { error: 'Geçersiz URL.' }); }
  if (req.method === 'GET' && url.pathname === '/healthz') {
    return json(res, 200, { ok: true, app: 'English Quest', version: '20', progressStorage: SUPABASE_PROGRESS_READY ? 'supabase' : (IS_HOSTED_RENDER ? 'unconfigured' : 'local') });
  }
  if (req.method === 'GET' && url.pathname === '/api/config') {
    return json(res, 200, { googleClientId: GOOGLE_CLIENT_ID, googleSignInConfigured: Boolean(GOOGLE_CLIENT_ID), cloudProgressConfigured: SUPABASE_PROGRESS_READY, progressMode: SUPABASE_PROGRESS_READY ? 'supabase' : (IS_HOSTED_RENDER ? 'unconfigured' : 'local-file'), hosted: IS_HOSTED_RENDER });
  }
  if (req.method === 'GET' && url.pathname === '/api/auth/me') {
    const session = getGoogleSession(req);
    return json(res, 200, { signedIn: Boolean(session), user: session ? { email: session.email, name: session.name, picture: session.picture } : null, rememberDays: 60 });
  }
  if (req.method === 'POST' && url.pathname === '/api/auth/google') {
    let payload;
    try { payload = await readBody(req); }
    catch (e) { return json(res, e.status || 400, { error: e.message || 'Giriş isteği okunamadı.' }); }
    try {
      const user = await verifyGoogleCredential(payload.credential);
      const token = makeSessionCookie(user);
      res.setHeader('Set-Cookie', `engquest_session=${encodeURIComponent(token)}; ${cookieFlags(req)}`);
      return json(res, 200, { ok: true, user: { email: user.email, name: user.name, picture: user.picture }, rememberDays: 60 });
    } catch (e) {
      return json(res, e.status || 502, { error: e.name === 'AbortError' ? 'Google bağlantısında zaman aşımı oldu.' : e.message || 'Google girişi başarısız.' });
    }
  }
  if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
    const secure = req.socket.encrypted || req.headers['x-forwarded-proto'] === 'https';
    res.setHeader('Set-Cookie', `engquest_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`);
    return json(res, 200, { ok: true });
  }
  if (url.pathname === '/api/music' && req.method === 'POST') {
    if (!isApiAuthorized(req)) return json(res, 401, { error: 'Özel uygulama erişim kodu veya Google oturumu gerekli.' });
    let payload;
    try { payload = await readBody(req); }
    catch (e) { return json(res, e.status || 400, { error: e.message || 'Müzik isteği okunamadı.' }); }
    const incoming = Array.isArray(payload.seenIds) ? payload.seenIds.slice(-150) : [];
    const seen = new Set(incoming.map(v => String(v)).filter(v => /^\d{1,18}$/.test(v)));
    try {
      const track = await fetchPopularMusic(seen);
      return json(res, 200, { track, stored: false, source: 'Deezer global chart' });
    } catch (e) {
      console.warn('[music-chart]', e.message);
      return json(res, 503, { error: 'Şu anda uygun bir popüler şarkı ön dinlemesi alınamadı.', stored: false });
    }
  }
  if (req.method === 'GET' && url.pathname === '/api/music-artwork') {
    return serveMusicArtwork(req, res, url.searchParams.get('u'));
  }
  if (req.method === 'GET' && url.pathname === '/api/music-preview') {
    return serveMusicPreview(req, res, url.searchParams.get('id'), url.searchParams.get('u'));
  }
  if (url.pathname.startsWith('/api/')) {
    if (!isApiAuthorized(req)) return json(res, 401, { error: 'Özel uygulama erişim kodu veya Google oturumu gerekli.' });
    if (url.pathname === '/api/progress' && req.method === 'GET') {
      const session = getGoogleSession(req);
      if (!session) return json(res, 401, { error: 'İlerlemeyi eşitlemek için Google hesabına giriş yap.' });
      try {
        const state = await readProgressForUser(session.sub);
        return json(res, 200, { state, stored: Boolean(state), storage: SUPABASE_PROGRESS_READY ? 'cloud' : (IS_HOSTED_RENDER ? 'unconfigured' : 'local') });
      } catch (e) { return json(res, e.status || 500, { error: e.message || 'Kayıtlı ilerleme okunamadı.' }); }
    }
    if (url.pathname === '/api/progress' && req.method === 'POST') {
      const session = getGoogleSession(req);
      if (!session) return json(res, 401, { error: 'İlerlemeyi eşitlemek için Google hesabına giriş yap.' });
      let payload;
      try { payload = await readBody(req); }
      catch (e) { return json(res, e.status || 400, { error: e.message || 'İlerleme isteği okunamadı.' }); }
      if (!payload.state || typeof payload.state !== 'object' || JSON.stringify(payload.state).length > 220000) return json(res, 400, { error: 'İlerleme verisi geçersiz veya fazla büyük.' });
      try {
        await writeProgressForUser(session.sub, payload.state);
        return json(res, 200, { ok: true, savedAt: Date.now(), storage: SUPABASE_PROGRESS_READY ? 'cloud' : 'local' });
      } catch (e) { console.error('[progress-sync]', e.message); return json(res, e.status || 500, { error: e.message || 'İlerleme sunucuya kaydedilemedi.' }); }
    }
    return json(res, 404, { error: 'API yolu bulunamadı.' });
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Bu yöntem desteklenmiyor.' });
  sendFile(req, res, url.pathname);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`English Quest: http://localhost:${PORT}`);
  console.log('Seslendirme: tarayıcı/işletim sisteminin yerleşik İngilizce sesi (AI model kurulumu yok)');
  console.log(`Google giriş: ${GOOGLE_CLIENT_ID ? 'hazır' : 'GOOGLE_CLIENT_ID gerekli'}`);
  console.log(`İlerleme depolaması: ${SUPABASE_PROGRESS_READY ? 'Supabase bulut veritabanı' : (IS_HOSTED_RENDER ? 'YAPILANDIRILMAMIŞ - bulut kaydı çalışmaz' : 'yerel dosya')}`);
  console.log(`Oturum anahtarı: ${SESSION_SECRET_CONFIGURED ? 'SESSION_SECRET ortam değişkeni ile sabit' : 'data/.session_secret dosyasına yerel kaydedildi; barındırmada SESSION_SECRET tanımla'}`);
  console.log(`Erişim kodu koruması: ${APP_PASSWORD ? 'aktif' : 'kapalı (yerel kişisel kullanım için uygun)'}`);
});
