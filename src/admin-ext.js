// Yönetici panelinden gelen yeni komut türleri:
//  · ask  : soru-cevap bildirimi (evet/hayır, serbest yanıt ya da işaretlenebilir liste); yanıt panelde görünür
//  · boss : yöneticinin gönderdiği özel boss savaşı; sonuç panelde görünür
//  · hint : bedava ipucu hakkı verme/alma ve ipuçlarını kapatma/açma
//  · game : mini oyunlarda bölüm ayarlama ya da bölümü geçmiş sayma
import { GAMES_META } from './games/meta.js';

export function initAdminExt(core, pet) {
  const esc = core.esc;
  const A = () => core.app;
  const queue = []; let showing = false;
  const sheet = document.createElement('div');
  sheet.className = 'ask-sheet'; sheet.id = 'askSheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true');
  document.body.appendChild(sheet);

  function next() {
    if (showing || !queue.length) return;
    showing = true;
    const m = queue.shift();
    if (m.type === 'ask') renderAsk(m); else if (m.type === 'boss') renderBoss(m);
  }
  function close() { sheet.classList.remove('show'); showing = false; setTimeout(next, 400); }

  function renderAsk(m) {
    const kind = ['yesno', 'text', 'check'].includes(m.kind) ? m.kind : 'yesno';
    const opts = Object.entries(m.options || {}).filter(([k, v]) => /^o[0-9]$/.test(k) && typeof v === 'string' && v.trim()).sort(([a], [b]) => a.localeCompare(b));
    let body = '';
    if (kind === 'yesno') body = `<div class="ask-yn"><button class="primarybtn" data-a="yes">👍 Evet</button><button class="secondarybtn" data-a="no">👎 Hayır</button></div><label class="ask-more"><span>İstersen not ekle</span><input id="askNote" maxlength="200" placeholder="Bir şey eklemek ister misin?"></label>`;
    if (kind === 'text') body = `<textarea id="askText" rows="3" maxlength="300" placeholder="Yanıtını yaz…"></textarea><button class="primarybtn" data-a="send">Gönder</button>`;
    if (kind === 'check') body = `<div class="ask-list">${opts.map(([k, v]) => `<label class="ask-ck"><input type="checkbox" data-c="${k}"><span>${esc(v)}</span></label>`).join('') || '<p>Liste boş.</p>'}</div><label class="ask-more"><span>Not (isteğe bağlı)</span><input id="askNote" maxlength="200"></label><button class="primarybtn" data-a="send">Gönder</button>`;
    sheet.innerHTML = `<div class="ask-card"><div class="ask-head"><span class="ask-ico">💬</span><div><div class="eyebrow">YÖNETİCİ SORUYOR</div><h3>${esc(m.title || 'Bir sorum var')}</h3></div></div>
      ${m.text ? `<p class="ask-q">${esc(m.text)}</p>` : ''}${body}<button class="ask-later" data-a="later">Sonra yanıtla</button></div>`;
    sheet.classList.add('show');
    sheet.onclick = async e => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      const a = b.dataset.a;
      if (a === 'later') { const later = A().askLater = A().askLater || []; if (!later.some(x => x.id === m.id)) later.push(m); core.saveLocal(false); close(); core.toast('Soru “Mesajlar” bölümünde seni bekliyor.'); return; }
      const note = (sheet.querySelector('#askNote')?.value || '').trim();
      const reply = { kind, q: String(m.text || m.title || '').slice(0, 200) };
      if (kind === 'yesno') reply.answer = (a === 'yes' ? 'Evet' : 'Hayır') + (note ? ' — ' + note : '');
      if (kind === 'text') { const t = (sheet.querySelector('#askText')?.value || '').trim(); if (!t) { core.toast('Önce bir şey yaz.'); return; } reply.answer = t; }
      if (kind === 'check') { reply.checks = {}; sheet.querySelectorAll('[data-c]').forEach(c => { reply.checks[c.dataset.c] = c.checked; }); if (note) reply.answer = note; }
      reply.answer = reply.answer ? String(reply.answer).slice(0, 300) : undefined;
      if (reply.answer === undefined) delete reply.answer;
      const ok = await core.admin?.reply(m.id, reply);
      A().askLater = (A().askLater || []).filter(x => x.id !== m.id); core.saveLocal(false);
      core.toast(ok ? 'Yanıtın gönderildi ✓' : 'Yanıt kaydedildi; internete bağlanınca gönderilecek.');
      if (!ok) { const pend = A().askPending = A().askPending || []; pend.push({ id: m.id, reply }); core.saveLocal(false); }
      close();
    };
  }
  function renderBoss(m) {
    sheet.innerHTML = `<div class="ask-card boss"><div class="ask-head"><span class="ask-ico">👑</span><div><div class="eyebrow">ÖZEL BOSS · YÖNETİCİDEN</div><h3>${esc(m.title || 'Sana özel bir rakip var!')}</h3></div></div>
      ${m.text ? `<p class="ask-q">${esc(m.text)}</p>` : ''}<div class="ask-yn"><button class="primarybtn" data-a="go">⚔️ Savaşa gir</button><button class="secondarybtn" data-a="later">Sonra</button></div></div>`;
    sheet.classList.add('show');
    sheet.onclick = async e => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      if (b.dataset.a === 'later') { const l = A().bossLater = A().bossLater || []; if (!l.some(x => x.id === m.id)) l.push(m); core.saveLocal(false); close(); core.toast('Özel boss, uygulamayı bir sonraki açışında yeniden sorulacak.'); return; }
      close();
      const res = await pet?.battle?.special(m.mon, m.stage | 0, m.title, m.text);
      if (!res) return;
      A().bossLater = (A().bossLater || []).filter(x => x.id !== m.id); core.saveLocal(false);
      core.admin?.reply(m.id, { kind: 'boss', result: res, q: String(m.title || m.mon || '').slice(0, 200) });
    };
  }

  function hint(m) {
    const app = A();
    const n = Math.round(Number(m.amount) || 0);
    if (m.lock === true) { app.hintLock = true; core.saveLocal(true); window.dispatchEvent(new CustomEvent('dl:hints')); return { icon: '🔒', title: 'İpuçları kapatıldı', text: m.text || 'Yöneticin ipuçlarını bir süreliğine kapattı.' }; }
    if (m.lock === false && app.hintLock) { app.hintLock = false; }
    if (n) app.hintCredits = Math.max(0, (app.hintCredits | 0) + n);
    core.saveLocal(true); window.dispatchEvent(new CustomEvent('dl:hints'));
    if (n > 0) return { icon: '💡', title: `${n} bedava ipucu!`, text: m.text || `Yöneticin sana ${n} bedava ipucu hakkı verdi: bu ipuçları XP’ni düşürmez.` };
    if (n < 0) return { icon: '💡', title: 'İpucu hakkın azaldı', text: m.text || `Yöneticin ${-n} bedava ipucu hakkını geri aldı.` };
    return { icon: '🔓', title: 'İpuçları açıldı', text: m.text || 'İpuçlarını yeniden kullanabilirsin.' };
  }
  function game(m) {
    const app = A();
    const meta = GAMES_META.find(g => g.id === m.game); if (!meta) return null;
    if (!app.games || typeof app.games !== 'object') app.games = {};
    const g = app.games; g.lv = g.lv || {}; g.stars = g.stars || {};
    const lang = meta.lang ? (m.lang === 'en' ? 'en' : 'tr') : null, key = lang ? `${m.game}.${lang}` : m.game;
    const cur = Math.max(1, g.lv[key] | 0 || 1);
    let lv = cur, txt;
    if (m.win) { lv = Math.min(1000, cur + 1); g.stars[key] = (g.stars[key] | 0) + 3; txt = `${meta.name}: ${cur}. bölüm senin için geçildi, ${lv}. bölümdesin.`; }
    else if (Number.isFinite(Number(m.level))) { lv = Math.max(1, Math.min(1000, Math.round(Number(m.level)))); txt = `${meta.name}${lang ? ` (${lang.toUpperCase()})` : ''}: ${lv}. bölüme ayarlandın.`; }
    else return null;
    g.lv[key] = lv; core.saveLocal(true);
    window.dispatchEvent(new CustomEvent('dl:games-admin', { detail: { game: m.game, lang } }));
    return { icon: '🎮', title: 'Mini oyun güncellendi', text: m.text || txt };
  }

  // gecikmiş soru/boss ve gönderilemeyen yanıtlar
  setTimeout(() => {
    const app = A();
    for (const m of app.askLater || []) queue.push(m);
    for (const m of app.bossLater || []) queue.push(m);
    next();
  }, 4000);
  setInterval(async () => {
    const pend = A().askPending || []; if (!pend.length) return;
    const left = [];
    for (const p of pend) { const ok = await core.admin?.reply(p.id, p.reply); if (!ok) left.push(p); }
    A().askPending = left; core.saveLocal(false);
  }, 30000);

  return {
    handle(msg) {
      if (msg.type === 'ask' || msg.type === 'boss') { queue.push(msg); next(); return msg.type === 'ask' ? { icon: '💬', title: msg.title || 'Yöneticin bir şey soruyor', text: msg.text || '' , silent: true } : { icon: '👑', title: 'Özel boss geldi', text: msg.title || '', silent: true }; }
      if (msg.type === 'hint') return hint(msg);
      if (msg.type === 'game') return game(msg);
      return null;
    },
  };
}
