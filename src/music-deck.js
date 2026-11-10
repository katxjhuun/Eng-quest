// dam-la — pet bloğunun altındaki müzik ödülü çalarları.
// Her ödül şarkısı geçmişe eklenir; kullanıcı eski/yeni şarkılar arasında ileri-geri gezer,
// çalar/duraklatır/durdurur, sarar ve "Mix" açıkken şarkılar arasında ses geçişiyle (crossfade) akar.
// Ses kaynakları sağlayıcıların (Apple/Deezer) herkese açık ön dinlemeleridir; dam-la dosya kaydetmez.
import { Platform } from './platform.js';
import { toggleLike, isLiked, httpsUrl } from './music.js';

const HIST_KEY = 'dl-music-history', POS_KEY = 'dl-music-pos', MIX_KEY = 'dl-music-mix';
const MAX_HIST = 60, FADE = 6;

function readJson(k, f) { try { const v = JSON.parse(localStorage.getItem(k) || ''); return v ?? f; } catch { return f; } }
function writeJson(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
const fmt = s => { s = Math.max(0, Math.floor(Number(s) || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const clean = t => ({
  id: String(t.id || '').slice(0, 80), provider: String(t.provider || '').slice(0, 20),
  title: String(t.title || '').slice(0, 200), artist: String(t.artist || '').slice(0, 200), album: String(t.album || '').slice(0, 200),
  artwork: httpsUrl(t.artwork), previewUrl: httpsUrl(t.previewUrl), link: httpsUrl(t.link), at: Number(t.at) || Date.now(),
});

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

export function initMusicDeck({ toast = () => {}, stopOtherAudio = () => {} } = {}) {
  let hist = (readJson(HIST_KEY, []) || []).filter(t => t && t.id && t.title).map(clean).slice(-MAX_HIST);
  let pos = Math.min(Math.max(0, Number(readJson(POS_KEY, hist.length - 1)) || 0), Math.max(0, hist.length - 1));
  let mix = readJson(MIX_KEY, false) === true;
  let fresh = 0; // dinlenmemiş yeni şarkı sayısı (çalarken gelenler)

  const el = document.createElement('section');
  el.className = 'music-deck hidden'; el.id = 'musicDeck'; el.setAttribute('aria-label', 'Ödül şarkıları');
  el.innerHTML = `
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
      <a class="md-b md-sm" id="mdOpen" target="_blank" rel="noopener noreferrer" aria-label="Şarkıyı tam dinle">${ICON.out}</a>
    </div>`;
  const $ = s => el.querySelector(s);

  // İki çalar: biri çalarken diğeri bir sonraki şarkıya hazırlanır, Mix'te sesler üst üste biner.
  const decks = [new Audio(), new Audio()];
  try { if (localStorage.getItem('dl-debug') === '1') window.__dlDecks = decks; } catch {}
  decks.forEach(a => { a.preload = 'none'; a.crossOrigin = null; });
  let cur = 0, fading = null, wantPlay = false, seeking = false;
  // iOS sesi uygulamadan kısmaya izin vermez; o zaman geçiş yumuşak değil, kesik yapılır
  const volumeWorks = (() => { try { const a = new Audio(); a.volume = 0.5; return Math.abs(a.volume - 0.5) < 0.01; } catch { return false; } })();
  const A = () => decks[cur], B = () => decks[1 - cur];

  function mount() {
    const home = document.getElementById('petHome'), bar = document.querySelector('.quiz-bar');
    if (home?.parentNode) { if (home.nextElementSibling !== el) home.parentNode.insertBefore(el, home.nextSibling); return; }
    if (el.isConnected) return;
    if (bar?.parentNode) bar.parentNode.insertBefore(el, bar.nextSibling);
    else if (bar?.parentNode) bar.parentNode.insertBefore(el, bar.nextSibling);
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
    const link = t.link || `https://music.apple.com/search?term=${encodeURIComponent(t.title + ' ' + t.artist)}`;
    $('#mdOpen').href = link;
    $('#mdMix').classList.toggle('on', mix); $('#mdMix').setAttribute('aria-pressed', String(mix));
    const newer = Math.min(fresh, hist.length - 1 - pos);
    $('#mdNew').classList.toggle('hidden', newer <= 0); $('#mdNew').textContent = newer > 0 ? String(newer) : '';
    drawState();
  }
  function playing() { return !A().paused && !A().ended; }
  function drawState() {
    const p = playing() || (wantPlay && !A().ended);
    $('#mdPlay').innerHTML = p ? ICON.pause : ICON.play; $('#mdPlay').setAttribute('aria-label', p ? 'Duraklat' : 'Çal');
    el.classList.toggle('is-playing', playing());
    el.classList.toggle('no-preview', !track()?.previewUrl);
  }
  function drawTime() {
    const a = A(), d = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : 0;
    $('#mdCur').textContent = fmt(a.currentTime); $('#mdDur').textContent = d ? fmt(d) : '0:00';
    if (!seeking) $('#mdSeek').value = d ? Math.round((a.currentTime / d) * 1000) : 0;
  }

  // Ön dinleme adresleri zamanla geçersizleşebilir (özellikle Deezer'in imzalı adresleri): sağlayıcıdan tazele.
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
  async function load(a, t) {
    a.dataset.id = t.id; a.dataset.tries = '0';
    a.src = t.previewUrl; a.load();
  }
  function onError(a) {
    const t = hist.find(x => x.id === a.dataset.id);
    if (!t || a.dataset.tries === '1') { if (a === A()) { wantPlay = false; drawState(); toast('Bu şarkının ön dinlemesi şu an açılamadı; ↗ ile tamamını dinleyebilirsin.'); } return; }
    a.dataset.tries = '1';
    refreshPreview(t).then(ok => { if (!ok || a.dataset.id !== t.id) return onError(a); const at = a.currentTime || 0; a.src = t.previewUrl; a.load(); if (a === A() && wantPlay) a.play().then(() => { if (at) a.currentTime = at; }).catch(() => {}); });
  }
  decks.forEach(a => {
    a.addEventListener('error', () => { if (a.getAttribute('src')) onError(a); });
    a.addEventListener('play', () => { if (a === A()) drawState(); });
    a.addEventListener('pause', () => { if (a === A()) drawState(); });
    a.addEventListener('timeupdate', () => { if (a !== A()) return; drawTime(); maybeAutoMix(); });
    a.addEventListener('loadedmetadata', () => { if (a === A()) drawTime(); });
    a.addEventListener('ended', () => {
      if (a !== A()) return;
      if (fading) return;
      // Mix kapalıyken şarkı bitince sıradakine geçip devam eder; listenin sonunda durur
      if (pos < hist.length - 1) go(pos + 1, { play: true, fade: false });
      else { wantPlay = false; drawState(); }
    });
  });

  function setVol(a, v) { try { a.volume = Math.max(0, Math.min(1, v)); } catch {} }
  function cancelFade() {
    if (!fading) return;
    cancelAnimationFrame(fading.raf); const old = fading.out; fading = null;
    try { old.pause(); } catch {} setVol(old, 1); setVol(A(), 1);
  }
  // İki şarkı arasında yumuşak ses geçişi: eski şarkı kısılırken yenisi açılır
  function crossfade(nextTrack) {
    cancelFade();
    const out = A(); cur = 1 - cur; const inn = A();
    if (inn.dataset.id !== nextTrack.id || !inn.getAttribute('src')) load(inn, nextTrack);
    setVol(inn, volumeWorks ? 0 : 1);
    inn.play().catch(() => {});
    if (!volumeWorks) { try { out.pause(); } catch {} return; }
    const t0 = performance.now(), from = out.volume;
    const step = now => {
      const k = Math.min(1, (now - t0) / (FADE * 1000)), e = k * k * (3 - 2 * k);
      setVol(out, from * (1 - e)); setVol(inn, e);
      if (k < 1 && fading) fading.raf = requestAnimationFrame(step);
      else { try { out.pause(); } catch {} setVol(out, 1); setVol(inn, 1); fading = null; drawState(); }
    };
    fading = { out, raf: requestAnimationFrame(step) };
  }
  // Mix açıkken şarkının sonuna yaklaşınca sıradakine kendiliğinden karışır
  function maybeAutoMix() {
    if (!mix || fading || !wantPlay) return;
    const a = A(); if (!Number.isFinite(a.duration) || a.duration < FADE * 2.5) return;
    if (a.duration - a.currentTime > FADE) return;
    if (pos < hist.length - 1) go(pos + 1, { play: true, fade: true });
    else if (hist.length > 1) go(0, { play: true, fade: true }); // listenin sonundan başa sar
  }
  // önceden bir sonraki şarkıyı arka çalarda hazırla (geçişte bekleme olmasın)
  function preloadNext() {
    const n = hist[pos + 1]; const b = B();
    if (!n?.previewUrl || fading || b.dataset.id === n.id) return;
    b.preload = 'auto'; load(b, n);
  }

  function go(i, { play = wantPlay, fade = mix } = {}) {
    if (!hist.length) return;
    i = Math.max(0, Math.min(hist.length - 1, i));
    const t = hist[i]; const was = playing();
    pos = i; if (pos >= hist.length - 1 - fresh + 1) fresh = Math.max(0, hist.length - 1 - pos);
    save();
    if (!t.previewUrl) { cancelFade(); A().pause(); wantPlay = false; render(); return; }
    if (play && was && fade) { wantPlay = true; crossfade(t); }
    else {
      cancelFade();
      decks.forEach(a => { try { a.pause(); } catch {} });
      const a = A(); if (a.dataset.id !== t.id) { const b = B(); if (b.dataset.id === t.id && b.getAttribute('src')) { cur = 1 - cur; } else load(A(), t); }
      try { A().currentTime = 0; } catch {}
      setVol(A(), 1);
      wantPlay = play;
      if (play) { stopOtherAudio(); A().play().catch(() => { wantPlay = false; drawState(); }); }
    }
    render(); drawTime(); setTimeout(preloadNext, 400);
  }
  function togglePlay() {
    const t = track(); if (!t) return;
    if (!t.previewUrl) { window.open($('#mdOpen').href, '_blank', 'noopener,noreferrer'); return; }
    const a = A();
    if (playing()) { wantPlay = false; cancelFade(); a.pause(); drawState(); return; }
    if (a.dataset.id !== t.id || !a.getAttribute('src')) load(a, t);
    wantPlay = true; stopOtherAudio(); setVol(a, 1);
    a.play().then(() => setTimeout(preloadNext, 600)).catch(() => { wantPlay = false; drawState(); toast('Çalma başlatılamadı; tekrar dokun.'); });
    drawState();
  }
  function stop() { wantPlay = false; cancelFade(); decks.forEach(a => { try { a.pause(); a.currentTime = 0; } catch {} }); drawTime(); drawState(); }

  $('#mdPlay').addEventListener('click', togglePlay);
  $('#mdStop').addEventListener('click', stop);
  $('#mdPrev').addEventListener('click', () => go(pos - 1));
  $('#mdNext').addEventListener('click', () => go(pos + 1));
  $('#mdMix').addEventListener('click', () => {
    mix = !mix; writeJson(MIX_KEY, mix); render();
    toast(mix ? '🎚 Mix açık · şarkılar arasında yumuşak geçiş, liste kesintisiz akar' : 'Mix kapalı');
    // çalarken açılırsa hemen bir sonrakine karıştır
    if (mix && playing() && hist.length > 1) go(pos < hist.length - 1 ? pos + 1 : 0, { play: true, fade: true });
  });
  $('#mdLike').addEventListener('click', () => { const t = track(); if (!t) return; const on = toggleLike(t); render(); toast(on ? '♥ Beğendiklerine eklendi' : 'Beğenilerden çıkarıldı'); });
  const seek = $('#mdSeek');
  seek.addEventListener('pointerdown', () => { seeking = true; });
  seek.addEventListener('input', () => { seeking = true; const a = A(); if (Number.isFinite(a.duration)) $('#mdCur').textContent = fmt(a.duration * seek.value / 1000); });
  seek.addEventListener('change', () => { const a = A(); if (Number.isFinite(a.duration) && a.duration > 0) { cancelFade(); try { a.currentTime = a.duration * seek.value / 1000; } catch {} } seeking = false; drawTime(); });

  // Yeni ödül şarkısı: geçmişin sonuna eklenir. Bir şey çalmıyorsa kart hemen ona geçer.
  function add(raw) {
    const t = clean(raw); if (!t.id || !t.title) return;
    hist = hist.filter(x => x.id !== t.id); hist.push(t);
    if (hist.length > MAX_HIST) { const drop = hist.length - MAX_HIST; hist.splice(0, drop); pos = Math.max(0, pos - drop); }
    if (playing() || fading) { fresh++; save(); render(); setTimeout(preloadNext, 300); }
    else { fresh = 0; pos = hist.length - 1; save(); go(pos, { play: false, fade: false }); }
    el.classList.remove('fresh'); void el.offsetWidth; el.classList.add('fresh');
  }

  render();
  return {
    add, render, stop,
    get playing() { return playing(); },
    pause() { if (playing()) { wantPlay = false; cancelFade(); A().pause(); drawState(); } },
    get el() { return el; },
  };
}
