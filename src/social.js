// dam-la — Sosyal: arkadaş ekleme (kodla), istekler, engelleme, WhatsApp benzeri yazışma ve mesajların içinden pet takası.
// Yalnızca kısa metin ve takas kartı: fotoğraf, ses, görüntülü arama ve dosya yok.
// Güvenlik: sana yalnızca arkadaşların yazabilir (sunucu kuralları denetler); engellenen kişi istek de mesaj da gönderemez;
// şikâyet edilen sohbet yönetici tarafından incelenebilir. Arka planda tek bir küçük dinleyici çalışır (kim yeni yazdı).
import { petSVG, stageName, PET_SPECIES } from './pet-art.js';
import { ROLES } from './pets/codex.js';

const DAY = 864e5;
const BAD = /\b(amk|aq|siktir\w*|sik\w*|orospu\w*|piç\w*|yarra\w*|göt\w*|ananı\w*|fuck\w*|shit\w*|bitch\w*)\b/giu;
const clean = t => String(t || '').replace(BAD, m => m[0] + '*'.repeat(Math.max(2, m.length - 1)));
const hm = t => new Date(t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
const dayLabel = t => { const d = new Date(t), n = new Date(); const a = new Date(d.toDateString()), b = new Date(n.toDateString()); const k = Math.round((b - a) / DAY); return k === 0 ? 'Bugün' : k === 1 ? 'Dün' : d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }); };

export function initSocial(core, pet) {
  const esc = core.esc;
  const S = () => core.soc?.();
  const st = () => { const a = core.app; if (!a.social || typeof a.social !== 'object') a.social = {}; const s = a.social; s.done ||= {}; s.offers ||= {}; s.seen ||= {}; s.blockedInfo ||= {}; return s; };
  let friends = {}, reqs = {}, blocks = {}, pings = {}, dirCache = {}, view = 'chats', chat = null, started = false, bootAt = Date.now();

  // ---------- DOM ----------
  const btn = document.createElement('button');
  btn.className = 'iconbtn soc-btn'; btn.id = 'socialBtn'; btn.setAttribute('aria-label', 'Sosyal'); btn.title = 'Arkadaşlar ve mesajlar';
  btn.innerHTML = '💬<b class="soc-badge hidden" id="socBadge"></b>';
  document.getElementById('gamesBtn')?.before(btn);
  const ov = document.createElement('div');
  ov.className = 'soc-overlay'; ov.id = 'socialOverlay'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
  ov.innerHTML = `<div class="soc-sheet"><div class="soc-home" id="socHome"></div><div class="soc-chat hidden" id="socChat"></div><div class="soc-dlg hidden" id="socDlg"></div></div>`;
  document.body.appendChild(ov);
  const $ = s => ov.querySelector(s);

  const myName = () => core.app.pet?.name || 'Oyuncu';
  const avatar = (code, size = '') => {
    const d = dirCache[code];
    const art = d?.species && PET_SPECIES[d.species] ? petSVG(d.species, Math.min(5, d.stage | 0), { coat: d.coat | 0, shiny: !!d.shiny, mood: 'happy' }) : '<span>🐾</span>';
    return `<span class="soc-av ${size}">${art}</span>`;
  };
  async function dir(code, force) {
    if (!code || (!force && dirCache[code])) return dirCache[code];
    const v = await S()?.lookup(code); if (v) dirCache[code] = v; return v;
  }

  // ---------- rozet ----------
  function unread() {
    const s = st(); let n = 0;
    for (const [uid, at] of Object.entries(pings)) if (friends[uid] && at > (s.seen[uid] || 0) && chat?.uid !== uid) n++;
    return n;
  }
  function badge() {
    const n = unread() + Object.keys(reqs).filter(u => !blocks[u]).length;
    const b = btn.querySelector('#socBadge'); b.textContent = n > 9 ? '9+' : n; b.classList.toggle('hidden', !n);
  }

  // ---------- bağlantı ----------
  function start() {
    const soc = S(); if (started || !soc?.ready?.()) return; started = true;
    soc.dirSet(pet.tradeCard?.() || { name: myName() });
    soc.onFriends(v => { friends = v; for (const f of Object.values(v)) dir(f.code); badge(); render(); });
    soc.onRequests(v => { reqs = v; for (const r of Object.values(v)) dir(r.code); badge(); render(); });
    soc.onBlocks(v => { blocks = v; badge(); render(); });
    soc.onAccepts((uid, info) => core.toast(`🤝 ${info.name || info.code} arkadaşlık isteğini kabul etti.`));
    soc.onPings(v => {
      const prev = pings; pings = v; badge();
      for (const [uid, at] of Object.entries(v)) {
        if (at > (prev[uid] || 0) && at > bootAt && chat?.uid !== uid && friends[uid]) {
          core.toast(`💬 ${friends[uid].name || friends[uid].code}: yeni mesaj`);
        }
        if (at > (prev[uid] || 0)) checkOffers(uid);
      }
      if (view === 'chats' && ov.classList.contains('show') && !chat) render();
    });
    // açılışta yarım kalmış takas teklifleri
    for (const id of Object.keys(st().offers)) checkOffers(st().offers[id].to);
  }
  setInterval(start, 3000); setTimeout(start, 1500);

  // benim tekliflerim kabul edildiyse yeni peti al
  async function checkOffers(uid) {
    const s = st();
    for (const [id, o] of Object.entries(s.offers)) {
      if (o.to !== uid || s.done[id]) continue;
      const x = await S()?.tradeResult(uid, id);
      if (!x) { if (Date.now() - o.at > DAY) { delete s.offers[id]; core.saveLocal(false); } continue; }
      s.done[id] = 1; delete s.offers[id];
      if (x.ok && x.pet && x.by === uid) {
        const nm = friends[uid]?.name || friends[uid]?.code || '';
        if (pet.tradeIn(x.pet, nm)) { core.toast(`🔄 Takas tamamlandı! ${x.pet.name} artık seninle.`); S()?.dirSet(pet.tradeCard?.()); }
      }
      core.saveLocal(true);
    }
  }

  // ---------- ana görünüm ----------
  async function open(uid) {
    start();
    if (!S()?.ready?.()) { core.toast('Sosyal özellikler için internet bağlantısı gerekir.'); return; }
    ov.classList.add('show'); document.body.classList.add('modal-open');
    if (uid && friends[uid]) return openChat(uid);
    view = Object.keys(reqs).length && !Object.keys(friends).length ? 'reqs' : view;
    render(); loadPreviews();
  }
  function close() { closeChat(); ov.classList.remove('show'); document.body.classList.remove('modal-open'); }
  btn.addEventListener('click', () => open());

  const previews = {};
  async function loadPreviews() {
    const list = Object.keys(friends).slice(0, 40);
    await Promise.all(list.map(async uid => { previews[uid] = await S()?.lastMsg(uid); }));
    if (!chat && view === 'chats') render();
  }
  function rowTime(uid) { return Math.max(pings[uid] || 0, previews[uid]?.at || 0, friends[uid]?.at || 0); }
  function previewText(uid) {
    const m = previews[uid]; if (!m) return 'Henüz mesaj yok — selam ver!';
    const mine = m.f === S()?.me().uid;
    return `${mine ? 'Sen: ' : ''}${m.k === 'trade' ? '🔄 Pet takası teklifi' : esc(clean(m.t)).slice(0, 60)}`;
  }

  function render() {
    if (!ov.classList.contains('show') || chat) return;
    const me = S()?.me() || {};
    const reqN = Object.keys(reqs).filter(u => !blocks[u]).length;
    const fr = Object.entries(friends);
    const chats = fr.sort((a, b) => rowTime(b[0]) - rowTime(a[0])).map(([uid, f]) => {
      const un = (pings[uid] || 0) > (st().seen[uid] || 0);
      return `<button class="soc-row${un ? ' unread' : ''}" data-chat="${esc(uid)}">${avatar(f.code)}<span class="soc-mid"><b>${esc(f.name || f.code)}</b><small>${previewText(uid)}</small></span><span class="soc-side">${rowTime(uid) && previews[uid] ? `<small>${dayLabel(rowTime(uid)) === 'Bugün' ? hm(rowTime(uid)) : dayLabel(rowTime(uid))}</small>` : ''}${un ? '<i class="soc-dot"></i>' : ''}</span></button>`;
    }).join('') || '<p class="soc-empty">Henüz arkadaşın yok. Arkadaşının kodunu yukarıya yaz ve istek gönder; kabul edince burada sohbet açılır.</p>';
    const frl = fr.map(([uid, f]) => `<div class="soc-row">${avatar(f.code)}<span class="soc-mid"><b>${esc(f.name || f.code)}</b><small>${esc(f.code)}${dirCache[f.code]?.species ? ` · ${esc(PET_SPECIES[dirCache[f.code].species]?.label || '')}` : ''}</small></span><span class="soc-acts"><button class="soc-ic" data-chat="${esc(uid)}" aria-label="Mesaj">💬</button><button class="soc-ic" data-menu="${esc(uid)}" aria-label="Diğer">⋯</button></span></div>`).join('') || '<p class="soc-empty">Arkadaş listen boş.</p>';
    const bl = Object.keys(blocks).map(uid => { const i = st().blockedInfo[uid] || {}; return `<div class="soc-row dim">${avatar(i.code)}<span class="soc-mid"><b>${esc(i.name || 'Engellenen oyuncu')}</b><small>${esc(i.code || '')} · engelli</small></span><button class="secondarybtn soc-sm" data-unblock="${esc(uid)}">Engeli kaldır</button></div>`; }).join('');
    const rq = Object.entries(reqs).filter(([u]) => !blocks[u]).map(([uid, r]) => `<div class="soc-row">${avatar(r.code)}<span class="soc-mid"><b>${esc(r.name || r.code)}</b><small>${esc(r.code)} · arkadaş olmak istiyor</small></span><span class="soc-acts"><button class="primarybtn soc-sm" data-acc="${esc(uid)}">Kabul</button><button class="secondarybtn soc-sm" data-dec="${esc(uid)}">Reddet</button><button class="soc-ic" data-blk="${esc(uid)}" aria-label="Engelle" title="Engelle">⛔</button></span></div>`).join('') || '<p class="soc-empty">Bekleyen istek yok.</p>';
    $('#socHome').innerHTML = `<div class="soc-head"><div><div class="eyebrow">SOSYAL</div><h2>Arkadaşlar</h2></div><button class="closebtn" data-x aria-label="Kapat">×</button></div>
      <div class="soc-me"><span>Senin kodun</span><b>${esc(me.code || '—')}</b><button class="secondarybtn soc-sm" data-copy>Kopyala</button></div>
      <form class="soc-add" id="socAdd"><input id="socCode" maxlength="8" placeholder="Arkadaş kodu: DL-XXXXX" autocomplete="off" autocapitalize="characters" spellcheck="false"><button class="primarybtn soc-sm">Bul</button></form>
      <div id="socFound"></div>
      <div class="soc-tabs" role="tablist"><button data-view="chats" class="${view === 'chats' ? 'on' : ''}">Sohbetler</button><button data-view="friends" class="${view === 'friends' ? 'on' : ''}">Arkadaşlar <small>${fr.length || ''}</small></button><button data-view="reqs" class="${view === 'reqs' ? 'on' : ''}">İstekler ${reqN ? `<i class="soc-pill">${reqN}</i>` : ''}</button></div>
      <div class="soc-list">${view === 'chats' ? chats : view === 'friends' ? frl + (bl ? `<h4 class="soc-h4">Engellenenler</h4>${bl}` : '') : rq}</div>
      <p class="soc-safe">🔒 Sana yalnızca arkadaşların yazabilir. Yalnızca kısa yazı; fotoğraf, ses ve dosya yok. Rahatsız eden olursa engelle ya da şikâyet et; şikâyet edilen sohbeti yönetici inceleyebilir.</p>`;
  }

  // ---------- sohbet ----------
  let msgs = [], trades = {}, otherRead = 0, chatOff = null, lastSend = 0, sentWin = [];
  function openChat(uid) {
    closeChat();
    const f = friends[uid]; if (!f) return;
    chat = { uid, ...f }; msgs = []; trades = {}; otherRead = 0;
    $('#socHome').classList.add('hidden'); $('#socChat').classList.remove('hidden');
    $('#socChat').innerHTML = `<div class="soc-chead"><button class="soc-ic" data-back aria-label="Geri">←</button>${avatar(f.code, 'sm')}<span class="soc-mid"><b>${esc(f.name || f.code)}</b><small>${esc(f.code)}</small></span><button class="soc-ic" data-cmenu aria-label="Diğer">⋮</button></div>
      <div class="soc-msgs" id="socMsgs"><p class="soc-empty">Yükleniyor…</p></div>
      <form class="soc-compose" id="socForm"><button type="button" class="soc-ic soc-trade" data-trade aria-label="Pet takası teklif et" title="Pet takası">🔄</button><input id="socText" maxlength="500" placeholder="Mesaj yaz" autocomplete="off"><button class="soc-send" aria-label="Gönder">➤</button></form>`;
    const soc = S();
    let first = true;
    chatOff = soc.openChat(uid, {
      onMsg: m => { msgs.push(m); scheduleDraw(); if (m.f !== soc.me().uid) markRead(); },
      onTrade: v => { trades = v; scheduleDraw(); checkOffers(uid); },
      onRead: v => { otherRead = v; scheduleDraw(); },
    });
    setTimeout(() => { if (first && !msgs.length) { first = false; drawMsgs(); } }, 1200);
    markRead(); badge();
  }
  function markRead() { if (!chat) return; S()?.markRead(chat.uid); st().seen[chat.uid] = Math.max(Date.now(), pings[chat.uid] || 0); core.saveLocal(false); badge(); }
  function closeChat() { chatOff?.(); chatOff = null; if (chat) { st().seen[chat.uid] = Math.max(st().seen[chat.uid] || 0, pings[chat.uid] || 0); } chat = null; $('#socChat')?.classList.add('hidden'); $('#socHome')?.classList.remove('hidden'); }
  let drawT = 0;
  function scheduleDraw() { cancelAnimationFrame(drawT); drawT = requestAnimationFrame(drawMsgs); }
  function tradeCardHTML(m) {
    const me = S()?.me().uid, mine = m.f === me, x = trades[m.id], p = m.pet || {};
    const sp = PET_SPECIES[p.species];
    const expired = !x && Date.now() - (m.at || 0) > DAY;
    const status = x ? (x.ok ? '✅ Takas tamamlandı' : x.by === m.f ? '↩️ Teklif geri çekildi' : '✖️ Reddedildi') : expired ? '⌛ Süresi doldu' : mine ? '⏳ Cevap bekleniyor' : '';
    const acts = !x && !expired ? (mine ? `<button class="secondarybtn soc-sm" data-tcancel="${esc(m.id)}">Geri çek</button>` : `<button class="primarybtn soc-sm" data-taccept="${esc(m.id)}">Kabul et</button><button class="secondarybtn soc-sm" data-tdecline="${esc(m.id)}">Reddet</button>`) : '';
    return `<div class="soc-tcard${p.shiny ? ' shiny' : ''}"><div class="soc-tt">🔄 PET TAKASI</div><div class="soc-tart">${sp ? petSVG(p.species, Math.min(5, p.stage | 0), { coat: p.coat | 0, shiny: !!p.shiny, mood: 'happy' }) : ''}</div>
      <b>${esc(p.name || '')}</b><small>${sp ? esc(sp.label) : ''} · ${sp ? esc(stageName(p.species, Math.min(5, p.stage | 0))) : ''} · ${ROLES[p.role]?.icon || ''} ${esc(ROLES[p.role]?.name || '')}${p.shiny ? ' · ✨ nadir' : ''}${p.stars ? ` · ⭐${p.stars}` : ''}</small>
      <p>${mine ? 'Petini teklif ettin. Kabul ederse onun peti sana gelir.' : 'Bu peti sana veriyor; kabul edersen senin petin ona gider.'}</p>
      ${status ? `<em>${status}</em>` : ''}<div class="soc-tacts">${acts}</div></div>`;
  }
  function drawMsgs() {
    const box = $('#socMsgs'); if (!box || !chat) return;
    const me = S()?.me().uid;
    const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    let lastDay = '', html = '';
    const lastMine = [...msgs].reverse().find(m => m.f === me);
    for (const m of msgs) {
      const d = dayLabel(m.at || Date.now()); if (d !== lastDay) { html += `<div class="soc-day"><span>${d}</span></div>`; lastDay = d; }
      const mine = m.f === me;
      const tick = mine ? `<i class="soc-tick${otherRead >= (m.at || 0) ? ' read' : ''}">${otherRead >= (m.at || 0) ? '✓✓' : '✓'}</i>` : '';
      if (m.k === 'trade') html += `<div class="soc-msg ${mine ? 'me' : 'them'} trade">${tradeCardHTML(m)}<span class="soc-meta">${hm(m.at || Date.now())}${tick}</span></div>`;
      else html += `<div class="soc-msg ${mine ? 'me' : 'them'}"><span class="soc-txt">${esc(clean(m.t))}</span><span class="soc-meta">${hm(m.at || Date.now())}${m === lastMine || otherRead < (m.at || 0) ? tick : ''}</span></div>`;
    }
    box.innerHTML = html || '<p class="soc-empty">Sohbetin başlangıcı. Selam ver 👋</p>';
    if (nearBottom || box.dataset.init !== '1') { box.scrollTop = box.scrollHeight; box.dataset.init = '1'; }
  }
  async function send() {
    const inp = $('#socText'); const t = inp.value.trim(); if (!t || !chat) return;
    const now = Date.now();
    sentWin = sentWin.filter(x => now - x < 60000);
    if (now - lastSend < 600 || sentWin.length >= 20) { core.toast('Biraz yavaş: çok hızlı yazıyorsun.'); return; }
    lastSend = now; sentWin.push(now); inp.value = '';
    const id = await S().send(chat.uid, { k: 'msg', t: t.slice(0, 500) });
    if (!id) { core.toast('Gönderilemedi. Arkadaşın seni listesinden çıkarmış ya da engellemiş olabilir.'); inp.value = t; }
  }

  // ---------- onay penceresi ----------
  function confirmBox(html, yes = 'Evet', no = 'Vazgeç', danger = false) {
    return new Promise(res => {
      const d = $('#socDlg');
      d.innerHTML = `<div class="soc-dbox">${html}<div class="soc-dacts"><button class="secondarybtn" data-dno>${esc(no)}</button><button class="${danger ? 'dangerbtn' : 'primarybtn'}" data-dyes>${esc(yes)}</button></div></div>`;
      d.classList.remove('hidden');
      const h = e => { const y = e.target.closest('[data-dyes]'), n = e.target.closest('[data-dno]') || e.target === d; if (!y && !n) return; d.removeEventListener('click', h); d.classList.add('hidden'); res(!!y); };
      d.addEventListener('click', h);
    });
  }
  function menu(items) {
    return new Promise(res => {
      const d = $('#socDlg');
      d.innerHTML = `<div class="soc-dbox soc-menu">${items.map((it, i) => `<button class="${it.danger ? 'danger' : ''}" data-mi="${i}">${it.label}</button>`).join('')}<button data-mi="-1">Vazgeç</button></div>`;
      d.classList.remove('hidden');
      const h = e => { const b = e.target.closest('[data-mi]'); if (!b && e.target !== d) return; d.removeEventListener('click', h); d.classList.add('hidden'); res(b ? items[+b.dataset.mi] : null); };
      d.addEventListener('click', h);
    });
  }
  const petLine = c => c ? `<b>${esc(c.name)}</b> (${esc(PET_SPECIES[c.species]?.label || '')}, ${esc(stageName(c.species, Math.min(5, c.stage | 0)))}${c.shiny ? ', ✨ nadir' : ''})` : '';

  async function offerTrade() {
    const mine = pet.tradeCard?.();
    if (!mine) { core.toast('Takas için canlı bir petin olmalı.'); return; }
    const s = st(); const open = Object.values(s.offers).find(o => Date.now() - o.at < DAY);
    if (open) { core.toast('Zaten bekleyen bir takas teklifin var. Önce o sonuçlansın ya da geri çek.'); return; }
    const ok = await confirmBox(`<h3>🔄 Pet takası teklif et</h3><div class="soc-dart">${petSVG(mine.species, mine.stage, { coat: mine.coat | 0, shiny: mine.shiny, mood: 'happy' })}</div><p>${petLine(mine)} teklif edilecek. <b>${esc(chat.name || chat.code)}</b> kabul ederse onun peti sana gelir, seninki ona gider. Takas geri alınamaz.</p>`, 'Teklif et');
    if (!ok || !chat) return;
    const id = await S().send(chat.uid, { k: 'trade', pet: mine });
    if (id) { s.offers[id] = { to: chat.uid, at: Date.now() }; core.saveLocal(true); } else core.toast('Teklif gönderilemedi.');
  }
  async function acceptTrade(id) {
    const m = msgs.find(x => x.id === id); if (!m || !chat) return;
    const mine = pet.tradeCard?.();
    if (!mine) { core.toast('Takas için canlı bir petin olmalı.'); return; }
    const ok = await confirmBox(`<h3>Takası kabul et?</h3><div class="soc-swap"><div>${petSVG(mine.species, mine.stage, { coat: mine.coat | 0, shiny: mine.shiny, mood: 'sad' })}<small>gidecek</small></div><span>⇄</span><div>${petSVG(m.pet.species, Math.min(5, m.pet.stage | 0), { coat: m.pet.coat | 0, shiny: !!m.pet.shiny, mood: 'happy' })}<small>gelecek</small></div></div><p>${petLine(mine)} gider, ${petLine(m.pet)} gelir. Takas geri alınamaz.</p>`, 'Takas et', 'Vazgeç', true);
    if (!ok) return;
    const done = await S().trade(chat.uid, id, true, mine);
    if (!done) { core.toast('Takas yapılamadı (teklif geri çekilmiş olabilir).'); return; }
    st().done[id] = 1;
    if (pet.tradeIn(m.pet, chat.name || chat.code)) { core.toast(`🔄 Takas tamamlandı! ${m.pet.name} artık seninle.`); S()?.dirSet(pet.tradeCard?.()); }
    core.saveLocal(true);
  }
  async function resolveNo(id) { if (!chat) return; await S().trade(chat.uid, id, false); const s = st(); delete s.offers[id]; s.done[id] = 1; core.saveLocal(false); }

  async function friendMenu(uid) {
    const f = friends[uid]; if (!f) return;
    const it = await menu([{ k: 'chat', label: '💬 Mesaj yaz' }, { k: 'rm', label: '👋 Arkadaşlıktan çıkar' }, { k: 'blk', label: '⛔ Engelle', danger: true }]);
    if (!it) return;
    if (it.k === 'chat') openChat(uid);
    if (it.k === 'rm' && await confirmBox(`<h3>Arkadaşlıktan çıkar?</h3><p>${esc(f.name || f.code)} artık sana yazamaz. İstersen yeniden istek gönderebilirsin.</p>`, 'Çıkar', 'Vazgeç', true)) { S().unfriend(uid); }
    if (it.k === 'blk') block(uid, f);
  }
  async function block(uid, info) {
    if (!await confirmBox(`<h3>${esc(info.name || info.code)} engellensin mi?</h3><p>Sana mesaj ve arkadaşlık isteği gönderemez. Engeli istediğin zaman kaldırabilirsin.</p>`, 'Engelle', 'Vazgeç', true)) return false;
    st().blockedInfo[uid] = { code: info.code, name: info.name }; core.saveLocal(false);
    await S().block(uid); if (chat?.uid === uid) closeChat(); core.toast('Engellendi.'); render(); return true;
  }
  async function report() {
    if (!chat) return;
    const d = $('#socDlg');
    d.innerHTML = `<div class="soc-dbox"><h3>Şikâyet et</h3><p>Neyi rahatsız edici buldun? Yönetici bu sohbeti inceleyebilir.</p><textarea id="socRep" maxlength="500" rows="3" placeholder="Kısaca anlat (isteğe bağlı)"></textarea><label class="soc-chk"><input type="checkbox" id="socRepBlk" checked> Bu kişiyi engelle</label><div class="soc-dacts"><button class="secondarybtn" data-dno>Vazgeç</button><button class="dangerbtn" data-dyes>Gönder</button></div></div>`;
    d.classList.remove('hidden');
    const h = async e => {
      const y = e.target.closest('[data-dyes]'), n = e.target.closest('[data-dno]'); if (!y && !n) return;
      d.removeEventListener('click', h); d.classList.add('hidden'); if (!y || !chat) return;
      const c = chat, blk = d.querySelector('#socRepBlk')?.checked;
      const ok = await S().report(c.code, c.uid, d.querySelector('#socRep')?.value || '');
      core.toast(ok ? 'Şikâyetin iletildi. Teşekkürler.' : 'Şikâyet gönderilemedi.');
      if (blk) { st().blockedInfo[c.uid] = { code: c.code, name: c.name }; core.saveLocal(false); await S().block(c.uid); closeChat(); render(); }
    };
    d.addEventListener('click', h);
  }

  // ---------- olaylar ----------
  ov.addEventListener('click', async e => {
    const t = e.target;
    if (t === ov || t.closest('[data-x]')) { close(); return; }
    if (t.closest('[data-copy]')) { const c = S()?.me().code; try { await navigator.clipboard.writeText(c); core.toast('Kodun kopyalandı: ' + c); } catch { core.toast('Kodun: ' + c); } return; }
    const v = t.closest('[data-view]'); if (v) { view = v.dataset.view; render(); if (view === 'chats') loadPreviews(); return; }
    const c = t.closest('[data-chat]'); if (c) { openChat(c.dataset.chat); return; }
    const mn = t.closest('[data-menu]'); if (mn) { friendMenu(mn.dataset.menu); return; }
    const ac = t.closest('[data-acc]'); if (ac) { const uid = ac.dataset.acc, r = reqs[uid]; ac.disabled = true; if (await S().accept(uid, r, myName())) core.toast(`🤝 ${r.name || r.code} ile artık arkadaşsınız.`); return; }
    const dc = t.closest('[data-dec]'); if (dc) { S().decline(dc.dataset.dec); return; }
    const bk = t.closest('[data-blk]'); if (bk) { const uid = bk.dataset.blk; if (await block(uid, reqs[uid] || {})) S().decline(uid); return; }
    const ub = t.closest('[data-unblock]'); if (ub) { S().unblock(ub.dataset.unblock); delete st().blockedInfo[ub.dataset.unblock]; core.saveLocal(false); return; }
    const sr = t.closest('[data-send-req]'); if (sr) { sr.disabled = true; const ok = await S().request(sr.dataset.sendReq, myName()); core.toast(ok ? 'İstek gönderildi. Kabul edince sohbet açılır.' : 'İstek gönderilemedi.'); $('#socFound').innerHTML = ''; return; }
    if (t.closest('[data-back]')) { closeChat(); render(); loadPreviews(); return; }
    if (t.closest('[data-cmenu]')) {
      const it = await menu([{ k: 'trade', label: '🔄 Pet takası teklif et' }, { k: 'rep', label: '🚩 Şikâyet et', danger: true }, { k: 'blk', label: '⛔ Engelle', danger: true }]);
      if (it?.k === 'trade') offerTrade(); if (it?.k === 'rep') report(); if (it?.k === 'blk' && chat) block(chat.uid, chat);
      return;
    }
    if (t.closest('[data-trade]')) { offerTrade(); return; }
    const ta = t.closest('[data-taccept]'); if (ta) { acceptTrade(ta.dataset.taccept); return; }
    const td = t.closest('[data-tdecline]'); if (td) { resolveNo(td.dataset.tdecline); return; }
    const tc = t.closest('[data-tcancel]'); if (tc) { resolveNo(tc.dataset.tcancel); return; }
  });
  ov.addEventListener('submit', async e => {
    e.preventDefault();
    if (e.target.id === 'socForm') { send(); return; }
    if (e.target.id === 'socAdd') {
      const code = $('#socCode').value.trim().toUpperCase();
      const out = $('#socFound');
      if (!/^DL-[A-Z0-9]{5}$/.test(code)) { out.innerHTML = '<p class="soc-note">Kod DL-XXXXX biçiminde olmalı.</p>'; return; }
      if (code === S()?.me().code) { out.innerHTML = '<p class="soc-note">Bu senin kendi kodun 🙂</p>'; return; }
      out.innerHTML = '<p class="soc-note">Aranıyor…</p>';
      const d = await dir(code, true);
      if (!d) { out.innerHTML = '<p class="soc-note">Bu kodla bir oyuncu bulunamadı. Arkadaşının uygulamayı bir kez açmış olması gerekir.</p>'; return; }
      const already = friends[d.uid];
      out.innerHTML = `<div class="soc-row found">${avatar(code)}<span class="soc-mid"><b>${esc(d.name)}</b><small>${esc(code)}${d.species ? ` · ${esc(PET_SPECIES[d.species]?.label || '')}` : ''}</small></span>${already ? `<button class="secondarybtn soc-sm" data-chat="${esc(d.uid)}">Mesaj</button>` : blocks[d.uid] ? '<small>engelli</small>' : `<button class="primarybtn soc-sm" data-send-req="${esc(d.uid)}">İstek gönder</button>`}</div>`;
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && ov.classList.contains('show')) { if (!$('#socDlg').classList.contains('hidden')) return; if (chat) { closeChat(); render(); } else close(); } });
  // pet adı/türü değişince dizindeki kart güncellensin
  setInterval(() => { if (started) { const c = pet.tradeCard?.(); const k = JSON.stringify(c); if (k !== dirCache.__me) { dirCache.__me = k; S()?.dirSet(c || { name: myName() }); } } }, 60000);
  return { open, close, badge };
}
