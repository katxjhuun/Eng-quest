// dam-la — Ayarlar penceresini sekmelere ayırır: her şey tek uzun listede değil, konusuna göre gruplanır.
// Bölümler başlıklarına göre sekmelere dağıtılır; sonradan eklenen bölümler (ör. pet) data-tab ile kendini bildirir.
const TABS = [
  { id: 'genel', icon: '🎨', label: 'Genel', match: ['Görünüm', 'Öğrenme'] },
  { id: 'ses', icon: '🔊', label: 'Ses', match: ['Seslendirme', 'Müzik', 'Bildirimler'] },
  { id: 'pet', icon: '🐾', label: 'Pet', match: ['Petin'] },
  { id: 'mesaj', icon: '✉️', label: 'Mesajlar', match: ['Mesajlar'] },
  { id: 'hesap', icon: '🗂️', label: 'Hesap', match: ['Kimliğin', 'İlerleme yedeği', 'güncellemeler', 'Veri'] },
];

export function initSettingsTabs() {
  const grid = document.querySelector('#settingsOverlay .settings-grid');
  if (!grid || grid.dataset.tabbed) return;
  grid.dataset.tabbed = '1';
  const bar = document.createElement('div');
  bar.className = 'set-tabs'; bar.setAttribute('role', 'tablist');
  bar.innerHTML = TABS.map(t => `<button role="tab" data-tab="${t.id}"><span>${t.icon}</span>${t.label}</button>`).join('');
  grid.parentNode.insertBefore(bar, grid);
  let cur = 'genel';
  const tabOf = sec => {
    if (sec.dataset.tab) return sec.dataset.tab;
    const h = sec.querySelector('h3')?.textContent || '';
    return (TABS.find(t => t.match.some(m => h.includes(m))) || TABS[0]).id;
  };
  function show(id) {
    cur = id;
    for (const sec of grid.querySelectorAll(':scope > .setting-section')) sec.classList.toggle('tab-off', tabOf(sec) !== id);
    bar.querySelectorAll('[data-tab]').forEach(b => { const on = b.dataset.tab === id; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); });
    grid.parentNode.scrollTop = 0;
  }
  bar.addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) show(b.dataset.tab); });
  window.addEventListener('dl:settings-tab', e => show(e.detail || 'genel'));
  // yeni bölüm eklenirse (pet modülü) sekmesine yerleşsin
  new MutationObserver(() => show(cur)).observe(grid, { childList: true });
  show(cur);
}
