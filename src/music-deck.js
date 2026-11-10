// dam-la — pet bloğunun altındaki müzik ödülü çaları.
// Şarkı SEÇİMİ her zamanki listelerden gelir (Apple/Deezer popüler listeleri, music.js).
// ÇALMA: YouTube anahtarı tanımlıysa ▶'a basınca şarkının tamamı YouTube'un resmi oynatıcısında çalar
// (oynatıcı kurallar gereği görünür durur). Anahtar yoksa, kota dolduysa ya da video gömülemiyorsa
// sağlayıcının 30 saniyelik ön dinlemesine düşer. Geçmişte ileri-geri, durdur, sar ve Mix (crossfade) vardır.
import { Platform } from './platform.js';
import { toggleLike, isLiked, httpsUrl } from './music.js';
import { YOUTUBE_API_KEY } from './config.js';

const HIST_KEY = 'dl-music-history', POS_KEY = 'dl-music-pos', MIX_KEY = 'dl-music-mix';
const YT_IDS_KEY = 'dl-yt-ids', YT_OFF_KEY = 'dl-yt-off-until';
const MAX_HIST = 60, FADE = 6;
const YT_BAD = new Set([2, 5, 100, 101, 150, 153]); // geçersiz / bulunamadı / gömmeye kapalı / yapılandırma

function readJson(k, f) { try { const v = JSON.parse(localStorage.getItem(k) || ''); return v ?? f; } catch { return f; } }
function writeJson(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
const fmt = s => { s = Math.max(0, Math.floor(Number(s) || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const clean = t => ({
  id: String(t.id || '').slice(0, 80), provider: String(t.provider || '').slice(0, 20),
  title: String(t.title || '').slice(0, 200), artist: String(t.artist || '').slice(0, 200), album: String(t.album || '').slice(0, 200),
  artwork: httpsUrl(t.artwork), previewUrl: httpsUrl(t.previewUrl), link: httpsUrl(t.link), at: Number(t.at) || Date.now(),
});
const norm = s => String(s || '').toLocaleLowerCase('tr').normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/\(.*?\)|\[.*?\]/g, ' ').replace(/[^a-z0-9ğüşıöç ]+/g, ' ').replace(/\s+/g, ' ').trim();

const ICON = {
  prev: '<svg viewBox="0 0 24 24"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z"/></svg>',
  stop: '<svg viewBox="0 0 24 24"><rect x="5.5" y="5.5" width="13" height="13" rx="2"/></svg>',
  mix: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h3.5c5 0 6 10 11 10H21M18 14l3 3-3 3M3 17h3.5c1.6 0 2.7-1 3.6-2.4M13.9 9.4C14.8 8 15.9 7 17.5 7H21M18 4l3 3-3 3"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg>',
  out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
};

// ---------- YouTube ----------
let ytApi = null;
function loadYtApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (ytApi) return ytApi;
  ytApi = new Promise((res, rej) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { try { prev?.(); } catch {} res(window.YT); };
    const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; s.async = true;
    s.onerror = () => { ytApi = null; rej(new Error('YouTube oynatıcısı yüklenemedi')); };
    document.head.appendChild(s);
    setTimeout(() => { if (!window.YT?.Player) { ytApi = null; rej(new Error('YouTube oynatıcısı zaman aşımı')); } }, 15000);
  });
  return ytApi;
}
const ytAvailable = () => !!YOUTUBE_API_KEY && navigator.onLine !== false && Date.now() > Number(localStorage.getItem(YT_OFF_KEY) || 0);

// Şarkı listeden seçilir; YouTube yalnızca o şarkının videosunu bulmak için aranır (sonuçlar cihazda saklanır, kota korunur).
async function ytCandidates(t) {
  const cache = readJson(YT_IDS_KEY, {});
  if (Array.isArray(cache[t.id])) return cache[t.id];
  const q = `${t.artist} ${t.title}`.slice(0, 180);
  const url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&videoEmbeddable=true&videoSyndicated=true&safeSearch=strict'
    + `&q=${encodeURIComponent(q)}&key=${encodeURIComponent(YOUTUBE_API_KEY)}`;
  let d;
  try { d = await Platform.getJson(url, 9000); }
  catch (e) {
    const m = String(e?.message || e);
    if (/40[03]/.test(m)) { localStorage.setItem(YT_OFF_KEY, String(Date.now() + 6 * 3600e3)); const err = new Error('quota'); err.quota = true; throw err; }
    throw e;
  }
  const want = norm(t.title), artist = norm(t.artist).split(' ')[0] || '';
  const bad = /\b(cover|karaoke|instrumental|8d|nightcore|sped up|slowed|reverb|1 hour|10 hours|reaction|tutorial|lyrics? video)\b/;
  const scored = (d?.items || []).map((it, i) => {
    const id = it?.id?.videoId; const sn = it?.snippet || {};
    if (!/^[\w-]{11}$/.test(String(id || ''))) return null;
    const title = norm(sn.title), ch = String(sn.channelTitle || '');
    let s = -i * 0.3;
    if (want && title.includes(want)) s += 3;
    if (artist && (title.includes(artist) || norm(ch).includes(artist))) s += 2;
    if (/ - Topic$/.test(ch)) s += 2.5;
    if (/official|resmi/i.test(sn.title || '')) s += 1;
    if (/vevo/i.test(ch)) s += 1;
    if (bad.test(title) && !bad.test(want)) s -= 4;
    if (/\blive\b|canli/.test(title) && !/\blive\b|canli/.test(want)) s -= 1.5;
    return { id, s };
  }).filter(Boolean).sort((a, b) => b.s - a.s).map(x => x.id).slice(0, 4);
  cache[t.id] = scored;
  const keys = Object.keys(cache); if (keys.length > 300) keys.slice(0, keys.length - 300).forEach(k => delete cache[k]);
  writeJson(YT_IDS_KEY, cache);
  return scored;
}
function dropCandidate(t, vid) {
  const cache = readJson(YT_IDS_KEY, {});
  if (Array.isArray(cache[t.id])) { cache[t.id] = cache[t.id].filter(v => v !== vid); writeJson(YT_IDS_KEY, cache); }
}

// ---------- Çalar yuvası: ses (ön dinleme) ya da YouTube ----------
function makeSlot(box, on) {
  const audio = new Audio(); audio.preload = 'none';
  let yt = null, ytState = -1, kind = 'audio', id = '', vid = '', vol = 1, ytQueued = null;
  const slot = {
    box, audio,
    get kind() { return kind; }, get id() { return id; }, get vid() { return vid; },
    get playing() { return kind === 'yt' ? (ytState === 1 || ytState === 3) : (!audio.paused && !audio.ended); },
    get time() { try { return kind === 'yt' ? (yt?.getCurrentTime?.() || 0) : audio.currentTime || 0; } catch { return 0; } },
    get duration() { try { const d = kind === 'yt' ? yt?.getDuration?.() : audio.duration; return Number.isFinite(d) && d > 0 ? d : 0; } catch { return 0; } },
    loadAudio(t) { slot.haltYt(); kind = 'audio'; id = t.id; vid = ''; audio.dataset.tries = '0'; audio.src = t.previewUrl; audio.load(); box.classList.remove('on'); },
    async loadYt(t, v, autoplay) {
      try { audio.pause(); } catch {}
      kind = 'yt'; id = t.id; vid = v; ytState = -1; box.classList.add('on');
      const YT = await loadYtApi();
      if (id !== t.id || vid !== v) return;
      if (yt) { autoplay ? yt.loadVideoById(v) : yt.cueVideoById(v); slot.setVol(vol); return; }
      const host = document.createElement('div'); box.appendChild(host);
      const origin = /^https?:/.test(location.protocol) ? location.origin : undefined;
      await new Promise(res => {
        yt = new YT.Player(host, {
          host: 'https://www.youtube-nocookie.com', videoId: v, width: '100%', height: '100%',
          playerVars: { playsinline: 1, rel: 0, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, modestbranding: 1, autoplay: autoplay ? 1 : 0, ...(origin ? { origin } : {}) },
          events: {
            onReady: () => { slot.setVol(vol); if (ytQueued) { const f = ytQueued; ytQueued = null; f(); } else if (autoplay) yt.playVideo(); res(); },
            onStateChange: e => { ytState = e.data; on.state(slot); if (e.data === 0) on.ended(slot); },
            onError: e => { on.ytError(slot, Number(e.data)); },
          },
        });
        setTimeout(res, 8000);
      });
    },
    play() {
      if (kind === 'yt') { if (yt?.playVideo) yt.playVideo(); else ytQueued = () => yt.playVideo(); return Promise.resolve(); }
      return audio.play();
    },
    pause() { if (kind === 'yt') { try { yt?.pauseVideo?.(); } catch {} } else { try { audio.pause(); } catch {} } },
    stop() { slot.pause(); slot.seek(0); },
    seek(sec) { try { if (kind === 'yt') yt?.seekTo?.(sec, true); else audio.currentTime = sec; } catch {} },
    setVol(v) { vol = Math.max(0, Math.min(1, v)); try { audio.volume = vol; } catch {} try { yt?.setVolume?.(Math.round(vol * 100)); } catch {} box.style.opacity = kind === 'yt' ? String(Math.max(0.15, vol)) : ''; },
    haltYt() { if (kind === 'yt') { try { yt?.stopVideo?.(); } catch {} kind = 'audio'; id = ''; vid = ''; } ytState = -1; box.classList.remove('on'); },
    clear() { slot.pause(); slot.haltYt(); kind = 'audio'; id = ''; vid = ''; },
  };
  audio.addEventListener('play', () => on.state(slot));
  audio.addEventListener('pause', () => on.state(slot));
  audio.addEventListener('ended', () => on.ended(slot));
  audio.addEventListener('error', () => { if (audio.getAttribute('src')) on.audioError(slot); });
  return slot;
}

export function initMusicDeck({ toast = () => {}, stopOtherAudio = () => {} } = {}) {
  let hist = (readJson(HIST_KEY, []) || []).filter(t => t && t.id && t.title).map(clean).slice(-MAX_HIST);
  let pos = Math.min(Math.max(0, Number(readJson(POS_KEY, hist.length - 1)) || 0), Math.max(0, hist.length - 1));
  let mix = readJson(MIX_KEY, false) === true;
  let fresh = 0;

  const el = document.createElement('section');
  el.className = 'music-deck hidden'; el.id = 'musicDeck'; el.setAttribute('aria-label', 'Ödül şarkıları');
  el.innerHTML = `
    <div class="md-video" id="mdVideo" aria-label="YouTube oynatıcısı"><div class="md-yt"></div><div class="md-yt"></div><div class="md-vload" id="mdVLoad"></div></div>
    <div class="md-top">
      <div class="md-art-wrap"><img class="md-art" id="mdArt" alt="" referrerpolicy="no-referrer"><span class="md-eq" aria-hidden="true"><i></i><i></i><i></i></span></div>
      <div class="md-meta"><b class="md-title" id="mdTitle"></b><span class="md-artist" id="mdArtist"></span></div>
      <span class="md-count" id="mdCount"></span>
    </div>
    <div class="md-seek"><span id="mdCur">0:00</span><input type="range" id="mdSeek" min="0" max="1000" value="0" step="1" aria-label="Şarkıda konum"><span id="mdDur">0:00</span></div>
    <div class="md-ctrl">
      <button class="md-b" id="mdPrev" aria-label="Önceki şarkı">${ICON.prev}</button>
      <button class="md-b md-main" id="mdPlay" aria-label="Çal">${ICON.play}</button>
      <button class="md-b" id="mdStop" aria-label="Durdur">${ICON.stop}</button>
      <button class="md-b" id="mdNext" aria-label="Sonraki şarkı">${ICON.next}<em class="md-new hidden" id="mdNew"></em></button>
      <button class="md-b md-mix" id="mdMix" aria-pressed="false" aria-label="Mix: şarkılar arası geçiş">${ICON.mix}<span>Mix</span></button>
      <span class="md-sp"></span>
      <button class="md-b md-sm" id="mdLike" aria-pressed="false" aria-label="Beğen">${ICON.heart}</button>
      <a class="md-b md-sm" id="mdOpen" target="_blank" rel="noopener noreferrer" aria-label="Şarkıyı sağlayıcıda aç">${ICON.out}</a>
    </div>`;
  const $ = s => el.querySelector(s);
  const boxes = el.querySelectorAll('.md-yt');

  let cur = 0, fading = null, wantPlay = false, seeking = false, token = 0, quotaWarned = false;
  const handlers = {
    state: s => { if (s === A()) drawState(); },
    ended: s => {
      if (s !== A() || fading) return;
      if (pos < hist.length - 1) go(pos + 1, { play: true, fade: false });
      else if (mix && hist.length > 1) go(0, { play: true, fade: false });
      else { wantPlay = false; drawState(); }
    },
    ytError: (s, code) => {
      const t = hist.find(x => x.id === s.id); if (!t) return;
      if (YT_BAD.has(code)) dropCandidate(t, s.vid);
      // sıradaki aday videoyu dene; kalmadıysa ön dinlemeye düş
      startOn(s, t, { autoplay: s === A() ? wantPlay : true, tok: token });
    },
    audioError: s => {
      const t = hist.find(x => x.id === s.id);
      if (!t || s.audio.dataset.tries === '1') { if (s === A()) { wantPlay = false; drawState(); toast('Bu şarkı şu an açılamadı; ↗ ile sağlayıcıda dinleyebilirsin.'); } return; }
      s.audio.dataset.tries = '1';
      refreshPreview(t).then(ok => { if (!ok || s.id !== t.id) return handlers.audioError(s); s.audio.src = t.previewUrl; s.audio.load(); if (s === A() && wantPlay) s.audio.play().catch(() => {}); });
    },
  };
  const slots = [makeSlot(boxes[0], handlers), makeSlot(boxes[1], handlers)];
  try { if (localStorage.getItem('dl-debug') === '1') window.__dlDecks = slots; } catch {}
  const A = () => slots[cur], B = () => slots[1 - cur];
  const volumeWorks = (() => { try { const a = new Audio(); a.volume = 0.5; return Math.abs(a.volume - 0.5) < 0.01; } catch { return false; } })();

  function mount() {
    const home = document.getElementById('petHome'), bar = document.querySelector('.quiz-bar');
    if (home?.parentNode) { if (home.nextElementSibling !== el) home.parentNode.insertBefore(el, home.nextSibling); return; }
    if (el.isConnected) return;
    if (bar?.parentNode) bar.parentNode.insertBefore(el, bar.nextSibling);
    else document.querySelector('main')?.prepend(el);
  }
  function save() { writeJson(HIST_KEY, hist); writeJson(POS_KEY, pos); }
  const track = () => hist[pos] || null;

  function render() {
    mount();
    el.classList.toggle('hidden', !hist.length);
    const t = track(); if (!t) return;
    $('#mdTitle').textContent = t.title; $('#mdArtist').textContent = t.artist;
    $('#mdCount').textContent = `${pos + 1}/${hist.length}`;
    const art = $('#mdArt');
    if (art.dataset.id !== t.id) { art.dataset.id = t.id; art.classList.remove('ok'); art.onload = () => art.classList.add('ok'); art.onerror = () => art.classList.remove('ok'); if (t.artwork) art.src = t.artwork; else art.removeAttribute('src'); }
    $('#mdPrev').disabled = pos <= 0; $('#mdNext').disabled = pos >= hist.length - 1;
    const like = isLiked(t.id); $('#mdLike').classList.toggle('on', like); $('#mdLike').setAttribute('aria-pressed', String(like));
    $('#mdOpen').href = t.link || `https://music.apple.com/search?term=${encodeURIComponent(t.title + ' ' + t.artist)}`;
    $('#mdMix').classList.toggle('on', mix); $('#mdMix').setAttribute('aria-pressed', String(mix));
    const newer = Math.min(fresh, hist.length - 1 - pos);
    $('#mdNew').classList.toggle('hidden', newer <= 0); $('#mdNew').textContent = newer > 0 ? String(newer) : '';
    drawState();
  }
  function drawState() {
    const p = A().playing || wantPlay;
    $('#mdPlay').innerHTML = p ? ICON.pause : ICON.play; $('#mdPlay').setAttribute('aria-label', p ? 'Duraklat' : 'Çal');
    el.classList.toggle('is-playing', A().playing);
    el.classList.toggle('video-on', slots.some(s => s.kind === 'yt' && s.id));
    const t = track();
    el.classList.toggle('no-source', !!t && !t.previewUrl && !ytAvailable());
  }
  function drawTime() {
    const s = A(), d = s.duration, t = s.time;
    $('#mdCur').textContent = fmt(t); $('#mdDur').textContent = d ? fmt(d) : '0:00';
    if (!seeking) $('#mdSeek').value = d ? Math.round((t / d) * 1000) : 0;
  }
  setInterval(() => { if (!el.isConnected || el.classList.contains('hidden')) return; drawTime(); maybeAutoMix(); }, 250);

  async function refreshPreview(t) {
    try {
      const num = String(t.id).replace(/^(it|dz)-/, '');
      if (!/^\d+$/.test(num)) return false;
      if (t.provider === 'deezer' || t.id.startsWith('dz-')) {
        if (!Platform.isNative) return false;
        const d = await Platform.getJson(`https://api.deezer.com/track/${num}`, 8000);
        const u = httpsUrl(d?.preview); if (!u) return false; t.previewUrl = u;
      } else {
        const d = await Platform.getJson(`https://itunes.apple.com/lookup?id=${num}&entity=song`, 8000);
        const u = httpsUrl(d?.results?.[0]?.previewUrl); if (!u) return false; t.previewUrl = u;
      }
      save(); return true;
    } catch { return false; }
  }

  // Bir yuvaya şarkıyı yükle: önce YouTube'da tam hali, olmazsa ön dinleme
  async function startOn(slot, t, { autoplay, tok }) {
    if (ytAvailable()) {
      el.classList.add('yt-loading');
      try {
        const cands = await ytCandidates(t);
        if (tok !== token) return 'stale';
        const tried = slot.id === t.id && slot.kind === 'yt' ? slot.vid : '';
        const v = cands.find(x => x !== tried) || (tried && cands.includes(tried) ? tried : '');
        if (v) { await slot.loadYt(t, v, autoplay); el.classList.remove('yt-loading'); drawState(); return 'yt'; }
      } catch (e) {
        if (e?.quota && !quotaWarned) { quotaWarned = true; toast('YouTube günlük sınırına ulaşıldı; şimdilik 30 saniyelik ön dinleme çalıyor.'); }
        else if (!e?.quota) console.warn('[music-deck] youtube', e?.message || e);
      }
      el.classList.remove('yt-loading');
      if (tok !== token) return 'stale';
    }
    if (!t.previewUrl) { slot.clear(); if (slot === A()) { wantPlay = false; drawState(); toast('Bu şarkı burada çalınamadı; ↗ ile sağlayıcıda dinleyebilirsin.'); } return 'none'; }
    slot.loadAudio(t);
    if (autoplay) slot.play().catch(() => { if (slot === A()) { wantPlay = false; drawState(); } });
    drawState(); return 'audio';
  }

  function cancelFade() {
    if (!fading) return;
    cancelAnimationFrame(fading.raf); const old = fading.out; fading = null;
    old.pause(); old.setVol(1); A().setVol(1); old.box.classList.remove('fade-out');
  }
  async function crossfade(t) {
    cancelFade();
    const out = A(); cur = 1 - cur; const inn = A(); const tok = ++token;
    inn.setVol(volumeWorks ? 0 : 1);
    const r = await startOn(inn, t, { autoplay: true, tok });
    if (r === 'stale' || tok !== token) return;
    if (r === 'none') { out.pause(); return; }
    if (!volumeWorks) { out.pause(); out.setVol(1); return; }
    out.box.classList.add('fade-out');
    const t0 = performance.now(), from = 1;
    const step = now => {
      const k = Math.min(1, (now - t0) / (FADE * 1000)), e = k * k * (3 - 2 * k);
      out.setVol(from * (1 - e)); inn.setVol(e);
      if (k < 1 && fading) fading.raf = requestAnimationFrame(step);
      else { out.pause(); out.setVol(1); inn.setVol(1); out.box.classList.remove('fade-out'); if (out.kind === 'yt') out.haltYt(); fading = null; drawState(); }
    };
    fading = { out, raf: requestAnimationFrame(step) };
  }
  function maybeAutoMix() {
    if (!mix || fading || !wantPlay || hist.length < 2) return;
    const s = A(), d = s.duration; if (!d || d < FADE * 2.5) return;
    if (d - s.time > FADE) return;
    go(pos < hist.length - 1 ? pos + 1 : 0, { play: true, fade: true });
  }

  function go(i, { play = wantPlay, fade = mix } = {}) {
    if (!hist.length) return;
    i = Math.max(0, Math.min(hist.length - 1, i));
    const t = hist[i]; const was = A().playing;
    pos = i; if (pos >= hist.length - fresh) fresh = Math.max(0, hist.length - 1 - pos);
    save(); render();
    if (play && was && fade) { wantPlay = true; crossfade(t); return; }
    cancelFade();
    slots.forEach(s => s.pause());
    B().haltYt();
    wantPlay = play; A().setVol(1);
    const tok = ++token;
    if (play) { stopOtherAudio(); startOn(A(), t, { autoplay: true, tok }); }
    else { A().clear(); drawState(); }
    drawTime();
  }
  function togglePlay() {
    const t = track(); if (!t) return;
    const s = A();
    // YouTube'da video aranırken tekrar basılırsa vazgeç
    if (wantPlay && el.classList.contains('yt-loading')) { wantPlay = false; token++; el.classList.remove('yt-loading'); drawState(); return; }
    if (s.playing || (wantPlay && s.id === t.id)) { wantPlay = false; cancelFade(); s.pause(); drawState(); return; }
    wantPlay = true; stopOtherAudio(); s.setVol(1); drawState();
    if (s.id === t.id) { s.play().catch(() => { wantPlay = false; drawState(); }); return; }
    startOn(s, t, { autoplay: true, tok: ++token });
  }
  function stop() { wantPlay = false; cancelFade(); slots.forEach(s => s.stop()); drawTime(); drawState(); }

  $('#mdPlay').addEventListener('click', togglePlay);
  $('#mdStop').addEventListener('click', stop);
  $('#mdPrev').addEventListener('click', () => go(pos - 1));
  $('#mdNext').addEventListener('click', () => go(pos + 1));
  $('#mdMix').addEventListener('click', () => {
    mix = !mix; writeJson(MIX_KEY, mix); render();
    toast(mix ? '🎚 Mix açık · şarkılar arasında yumuşak geçiş, liste kesintisiz akar' : 'Mix kapalı');
    if (mix && A().playing && hist.length > 1) go(pos < hist.length - 1 ? pos + 1 : 0, { play: true, fade: true });
  });
  $('#mdLike').addEventListener('click', () => { const t = track(); if (!t) return; const on = toggleLike(t); render(); toast(on ? '♥ Beğendiklerine eklendi' : 'Beğenilerden çıkarıldı'); });
  const seek = $('#mdSeek');
  seek.addEventListener('pointerdown', () => { seeking = true; });
  seek.addEventListener('input', () => { seeking = true; const d = A().duration; if (d) $('#mdCur').textContent = fmt(d * seek.value / 1000); });
  seek.addEventListener('change', () => { const d = A().duration; if (d) { cancelFade(); A().seek(d * seek.value / 1000); } seeking = false; setTimeout(drawTime, 150); });

  // Yeni ödül şarkısı geçmişin sonuna eklenir. Bir şey çalmıyorsa kart hemen ona geçer (kendiliğinden çalmaz).
  function add(raw) {
    const t = clean(raw); if (!t.id || !t.title) return;
    hist = hist.filter(x => x.id !== t.id); hist.push(t);
    if (hist.length > MAX_HIST) { const drop = hist.length - MAX_HIST; hist.splice(0, drop); pos = Math.max(0, pos - drop); }
    if (A().playing || fading || wantPlay) { fresh++; save(); render(); }
    else { fresh = 0; pos = hist.length - 1; save(); go(pos, { play: false, fade: false }); }
    el.classList.remove('fresh'); void el.offsetWidth; el.classList.add('fresh');
  }

  render();
  return {
    add, render, stop,
    get playing() { return A().playing; },
    pause() { if (A().playing) { wantPlay = false; cancelFade(); A().pause(); drawState(); } },
    get el() { return el; },
  };
}
