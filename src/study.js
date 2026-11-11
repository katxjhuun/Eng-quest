// dam-la — ders çalışma modu: ana ekranda yalnızca soru kartı kalır; üst çubuk, başlık, sekmeler, ilerleme kartı,
// pet, Altın Saat çubuğu, kurulum şeridi ve süs öğeleri gizlenir. Üstte ince bir çubuk konuyu ve ilerlemeyi gösterir, "Çık" ile dönülür.
// Seçim cihazda saklanır (uygulama yeniden açılınca aynı modda başlar).
export function initStudy(core) {
  const $ = s => document.querySelector(s);
  const btn = $('#studyBtn'), bar = $('#studyBar'), info = $('#studyInfo');
  if (!btn || !bar) return { set() {} };
  const label = () => {
    const tab = document.querySelector('#catTabs .cat-tab.on') || document.querySelector('#trackSw .on');
    const cap = $('#levelCaption')?.textContent || '', num = $('#xpNumber')?.textContent || '';
    info.textContent = `📖 ${tab ? tab.textContent.trim() : 'Ders'}${cap ? ' · ' + cap : ''}${num ? ' · ' + num : ''}`;
  };
  function set(on, { save = true } = {}) {
    document.body.classList.toggle('study', on);
    btn.setAttribute('aria-pressed', String(on));
    core.app.profile.study = on;
    if (save) core.saveLocal(false);
    label();
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.dispatchEvent(new CustomEvent('dl:study', { detail: on }));
  }
  btn.addEventListener('click', () => set(true));
  $('#studyExit').addEventListener('click', () => set(false));
  // soru/ilerleme değiştikçe çubuktaki bilgi güncel kalsın
  for (const ev of ['dl:question', 'dl:answer']) window.addEventListener(ev, () => { if (document.body.classList.contains('study')) setTimeout(label, 60); });
  if (core.app.profile?.study) set(true, { save: false });
  return { set, refresh: label };
}
