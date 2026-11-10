// dam-la pet sistemi: bakıma muhtaç, evrimleşen, ekranda dolaşan küçük arkadaş.
// Durum app.pet içinde saklanır (yedeğe ve kalıcı kayda otomatik girer).
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { petSVG, homeSVG, stageName, PET_SPECIES, randomCoat, shinyFilter } from './pet-art.js';
import { Puppet } from './pets/figure.js';
import { TYPES, SPECIES_TYPE, ROLES, SIGNATURE, SHINY, SHINY_CHANCE, HINT_VOICE, loreParts, randomRole, battleStats, BEATS } from './pets/codex.js';
import { CAT_XP_STEP, catLabel } from './quiz.js';
import { SUBJECT_ORDER } from './data/subjects.js';

const HOUR = 3600e3;
const ORDER = ['plant', 'chick', 'cat', 'dog', 'owl', 'gecko', 'whale', 'doodle', 'goat'];
const QUAD = ['cat', 'dog', 'gecko']; // rastgele (seçilemeyen) renk alan türler
export const PET_SPECS = {
  plant: {
    name: 'Filiz', hp: 100, food: 140, energy: 100, foodLabel: 'Su', foodIcon: '💧', treat: '💧', perk: 'Büyük su deposu',
    passive: { name: 'Fotosentez', desc: 'Gündüz (08–18) susuzluğu ve enerji kaybı yarı hızda.' },
    active: { id: 'weed', name: 'Ayıkla', cost: 20, desc: 'Seçenekli soruda 2 yanlış şıkkı eler; yazmalı soruda XP cezası olmadan 1 harf açar.' },
    soul: 'Sabır ve dayanıklılık. Ne umutlu ne umutsuz; kurtarıcı beklemez, dayanır. Bazen yapraksız, bazen kuru ve dikenli, bazen yarı solgun; yavaş yavaş toparlanır, yine solar. İyi günlerde kısa bir huzur bulur.',
    love: ['…', 'Güneş biraz daha kalsa.', 'Buradayım. Hep buradaydım.'],
  },
  chick: {
    name: 'Pıtırcık', hp: 100, food: 100, energy: 140, foodLabel: 'Yem', foodIcon: '🌾', treat: '🌾', perk: 'Ekstra enerji',
    passive: { name: 'Erken Kuş', desc: 'Sabah 06–12 arasında doğru cevaplar %25 fazla XP verir.' },
    active: { id: 'peek', name: 'Cik İpucu', cost: 15, desc: 'Cevabın ilk harfini, harf ve kelime sayısını fısıldar.' },
    soul: 'Saf, meraklı, etrafındaki şeylerden habersiz. Çok düşünmez, kafa yormaz; sevdiğine bağlanır, zamanını onunla geçirir. Saflığın güzelliği. Günü herkesten önce bitirir.',
    love: ['Cik.', 'Sen buradasın.', 'Bugün güzel.'],
  },
  cat: {
    name: 'Mırnav', hp: 130, food: 100, energy: 100, foodLabel: 'Mama', foodIcon: '🐟', treat: '🐟', perk: 'Ekstra can',
    passive: { name: 'Dokuz Can', desc: 'Günde bir kez ölümcül bir yanlışta 1 canla kurtulur.' },
    active: { id: 'skip', name: 'Pati Atla', cost: 25, desc: 'Soruyu cezasız ve serini bozmadan geçer.' },
    soul: 'Cazibe merkezi. Bencil, çıkarcı; tüm ilgini ister. İşine geldiği sürece seninle iyi geçinir; her şey yolundayken bile sıkılıp olay çıkarır, sonra hiçbir şey olmamış gibi yine sana sokulur.',
    love: ['Mırr.', 'Şimdilik kalabilirsin.', 'Devam et. Ben söyleyince bırakırsın.'],
  },
  dog: {
    name: 'Hav', hp: 115, food: 115, energy: 100, foodLabel: 'Mama', foodIcon: '🦴', treat: '🦴', perk: 'Can + mama dengesi',
    passive: { name: 'Sadık Dost', desc: 'Her 5 doğruluk seride 10 can yeniler.' },
    active: { id: 'sniff', name: 'İz Sür', cost: 20, desc: '1 yanlış şıkkı eler ve bu soruda yanlış yaparsan canını korur.' },
    soul: 'Can yoldaş. Koşulsuz sadakat; aç kalsa da yorulsa da yanındadır. Sen düştüğünde dümeni o alır, korur, kollar. Kendi geleneği, kendi düzeni vardır. Ama uyurken dürtme: kurt ısırır.',
    love: ['Buradayım.', 'Hep buradayım.', 'Gitme. Ya da git; beklerim.'],
  },
  owl: {
    name: 'Nöbetçi', hp: 105, food: 100, energy: 125, foodLabel: 'Av', foodIcon: '🐭', treat: '🐭', perk: 'Gece uzun dayanır',
    passive: { name: 'Gece Nöbeti', desc: 'Gece (22–04) doğru cevaplar %25 fazla XP verir; geceleri uyumaz, öğleden sonra (13–16) kestirir.' },
    active: { id: 'ward', name: 'Dört Tur Önde', cost: 25, desc: 'Sonraki 4 soruda yanlış cevapların can kaybı yarıya iner.' },
    soul: 'Gece yaşar; gece onun için gündüzdür. Gözü kapalıyken bile tetiktedir, stratejisi hep dört tur öndedir. Kaybetme, yardım bekleme lüksü yoktur; bir kez düşerse karanlık onu yutar. Kahve onu yalnızca kısır bir döngüye sokar.',
    love: ['Hm.', 'Gecenin en iyi saati.', 'Sen de uyumuyor musun?'],
  },
  gecko: {
    name: 'Süzgeç', hp: 110, food: 90, energy: 110, foodLabel: 'Böcek', foodIcon: '🦗', treat: '🦗', perk: 'Güneşte sarsılmaz',
    passive: { name: 'Güneşte Sabit', desc: 'Gündüz (10–17) yanlış cevaplarda %30 daha az can kaybeder.' },
    active: { id: 'prey', name: 'Av Ona Gelir', cost: 20, desc: 'Kıpırdamadan bekler: sonraki doğru cevabın XP’si iki katına çıkar.' },
    soul: 'Herkesten farklıdır; farklı görünür, farklı yaşar, farklı düşünür. Hayat onun süzgecinden bambaşka geçer; artı ve eksi yoktur. Güneş ne kadar yakarsa yaksın sabit durur. Av peşinde koşmaz; av ona gelir, bir şekilde hep gelir.',
    love: ['…', 'Mavi bugün tatlı.', 'Kıpırdama. Böyle iyi.'],
  },
  whale: {
    name: 'Derin', hp: 140, food: 120, energy: 90, foodLabel: 'Plankton', foodIcon: '🦐', treat: '🦐', perk: 'Heybetli can',
    passive: { name: 'Yalnızlığa Uyum', desc: 'Yalnızlık ceza değil: yanlış cevaplarda %15 daha az can kaybeder; uzun süre gelmesen de küsmez.' },
    active: { id: 'dive', name: 'Bilinmeyene Dal', cost: 25, desc: 'Sorudan kaçar, derine dalar: soruyu cezasız ve serini bozmadan geçer.' },
    soul: 'Yalnızlık ve ona uyum; yalnızlık onun için ceza değil, ödül. Hayatı kafasında yaşar, düşünmekten ölebilir. Heybetli bir cüsse ama bedenine sığmayan coşkulu bir ruh: keşiş kadar sakin, gerektiğinde hiddetli. Yüzgeçleriyle kuş gibi uçabileceğini sanır. Anlam arar, kaderini sorgular; karanlığı yararak bilinmeyene gider. Süreklilik ona ters; motivasyonu ve arzusuyla hareket eder.',
    love: ['…', 'Derinde sessiz.', 'Uçabilirim bence.'],
  },
  doodle: {
    name: 'Bodur', hp: 100, food: 100, energy: 100, foodLabel: 'Kırıntı', foodIcon: '🍞', treat: '🍞', perk: 'Sarsılmaz nötr',
    passive: { name: 'Nötr', desc: 'Hiçbir şey onu değiştirmez: yanlışlarda %20 daha az can kaybı, doğrularda %10 daha az XP.' },
    active: { id: 'replay', name: 'Aynı Satranç', cost: 20, desc: 'Sonucunu bildiği oyunu yeniden oynar: bu soruda yanlış yaparsan can kaybetmezsin.' },
    soul: 'Sıkıntı, monotonluk, boğukluk. Hiçbir şey zevk vermez, hiçbir şeye şaşırmaz; duyguları ameliyatla alınmış gibi, neredeyse ruhsuz. Temas ettiğini de boğar. Zaman durmuştur; karanlık bir odada sessizlikten kulak çınlaması. Nadiren başını yastığa koyup sessizce haykırır. Sonucunu bildiği satrancı yeniden oynar; sırası hiç gelmemiştir. Nötrlüğün karşılığı.',
    love: ['…', 'Fark etmez.', 'Peki.'],
  },
  goat: {
    name: 'Kurban', hp: 110, food: 100, energy: 110, foodLabel: 'Ot', foodIcon: '🌿', treat: '🌿', perk: 'Aynayı tutar',
    passive: { name: 'Günah Keçisi', desc: 'Yanlışların yükünü üstlenir (%25 daha fazla can kaybı); ama bir yanlıştan sonraki ilk doğru %50 fazla XP verir.' },
    active: { id: 'mirror', name: 'Ayna', cost: 20, desc: 'Gerçeğin aynasını tutar: cevabın ilk ve son harfini, uzunluğunu gösterir.' },
    soul: 'Acıların ve günahın masum av gibi görünen avcısı; kötülük beyazdır. Duyguları alt üst eder: bazen acırsın, bazen masum sanırsın. Zararı kendinedir; üzüntü onun yaşam biçimi. Gözlerinde anlam yok, misyonu buymuş gibi. En gömülü duygularını gösterir, gerçekliğin aynasını tutar. Hep suçlanan günah keçisidir; kendini savunmaz, başına geleceği bilir.',
    love: ['…', 'Biliyorum.', 'Suçlu benim, değil mi?'],
  },
};

const LINES = {
  greet: { dawn: ['Erken.'], morning: ['Günaydın.', 'Kahve mi, soru mu?'], day: ['Bir tane daha?', 'Devam.'], evening: ['Gün bitiyor.'], night: ['…'] },
  cheer: ['Devam.', 'Yavaş ama sağlam.', 'İyi gidiyor.', 'Bir soru daha.'],
  wrong: ['Olur böyle.', 'Açıklamaya bakalım.', 'Sorun değil.'],
  hungry: { plant: ['Toprak kurudu.', 'Biraz su.'], other: ['Acıktım.', 'Karnım boş.'] },
  full: ['Fazla oldu.', 'Biraz uzanayım.'],
  flow: ['Sessizce yanındayım.', 'Akıştasın.'],
  low: ['Biraz yıprandım.', 'Dikkatli olalım.'],
  missed: ['Döndün.', 'Bekliyordum.'],
  tapped: ['Hm.', 'Ne?'],
  flee: ['…'],
  woke: ['Uyuyordum.', 'Beş dakika.'],
};

const pick = a => a[Math.floor(Math.random() * a.length)];

// Emote balonları: petin başının üstünde beliren, büyük ve okunaklı duygu simgeleri
const EM = {
  love: '<path d="M12 20.6C5 15.6 2.4 11.7 2.4 8.4 2.4 5.3 4.8 3.4 7.3 3.4c2 0 3.7 1.2 4.7 2.9 1-1.7 2.7-2.9 4.7-2.9 2.5 0 4.9 1.9 4.9 5 0 3.3-2.6 7.2-9.6 12.2z" fill="#C97C86"/><path d="M6.3 7.2c.4-1.2 1.4-1.8 2.4-1.7" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>',
  note: '<path d="M8.5 17.5V6.2l10-2.4v11.4" fill="none" stroke="#7D7A9E" stroke-width="2.2" stroke-linejoin="round"/><ellipse cx="6.4" cy="17.6" rx="2.9" ry="2.3" fill="#7D7A9E"/><ellipse cx="16.4" cy="15.3" rx="2.9" ry="2.3" fill="#7D7A9E"/><path d="M8.5 9l10-2.4" stroke="#7D7A9E" stroke-width="2.2"/>',
  excl: '<rect x="9.6" y="2.6" width="4.8" height="12.8" rx="2.4" fill="#C77B5B"/><circle cx="12" cy="19.4" r="2.6" fill="#C77B5B"/>',
  ask: '<path d="M7.6 8.4c0-2.8 2-4.6 4.6-4.6 2.6 0 4.5 1.7 4.5 4 0 3.4-4.4 3.4-4.4 7" fill="none" stroke="#6E8FAE" stroke-width="3.2" stroke-linecap="round"/><circle cx="12.3" cy="19.6" r="2.2" fill="#6E8FAE"/>',
  anger: '<g fill="none" stroke="#B5605E" stroke-width="2.6" stroke-linecap="round"><path d="M9.5 2.8v3.4c0 2-1.3 3.3-3.3 3.3H2.8"/><path d="M14.5 2.8v3.4c0 2 1.3 3.3 3.3 3.3h3.4"/><path d="M9.5 21.2v-3.4c0-2-1.3-3.3-3.3-3.3H2.8"/><path d="M14.5 21.2v-3.4c0-2 1.3-3.3 3.3-3.3h3.4"/></g>',
  tear: '<path d="M12 2.8S5.4 10.8 5.4 15a6.6 6.6 0 0 0 13.2 0C18.6 10.8 12 2.8 12 2.8z" fill="#86AFC6"/><path d="M8.8 15.2c0 1.6 1 2.8 2.4 3.2" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>',
  sweat: '<path d="M15.5 3.4s-6 6.4-6 10.4a6 6 0 0 0 12 0c0-4-6-10.4-6-10.4z" fill="#A9C6D6" transform="rotate(18 15.5 12)"/><path d="M3 8.5h4.5M2.5 13h4M4 17.5h3.5" stroke="#8FAFC2" stroke-width="1.8" stroke-linecap="round"/>',
  zz: '<path d="M3.5 12.5h5.2l-5.2 6h5.2" fill="none" stroke="#7D7A9E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 3.5h8.5L11 13.5h8.5" fill="none" stroke="#7D7A9E" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  star: '<path d="M12 2.6l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" fill="#D2B46A" stroke="#B89B52" stroke-width="1.2" stroke-linejoin="round"/>',
  fire: '<path d="M12 21.4c-4.4 0-7.4-3-7.4-6.9 0-3.4 2.2-5.4 3.6-7.6.5 1.9 1.5 2.9 2.6 3.3-.3-3.4 1.2-6.2 3.6-8 0 3 1.4 4.6 2.9 6.4 1.3 1.6 2.1 3.4 2.1 5.9 0 3.9-3 6.9-7.4 6.9z" fill="#C78457"/><path d="M12 21.2c-2.2 0-3.6-1.5-3.6-3.4 0-2 1.6-3.2 2.5-4.7.6 1.4 1.4 2 2.2 2.2-.1-1.2.3-2.3 1-3.1.9 1.5 1.7 2.6 1.7 4.6 0 2.4-1.6 4.4-3.8 4.4z" fill="#DDB46A"/>',
  idea: '<path d="M12 3.2a6.3 6.3 0 0 0-3.8 11.3c.7.6 1.1 1.4 1.1 2.3h5.4c0-.9.4-1.7 1.1-2.3A6.3 6.3 0 0 0 12 3.2z" fill="#DCC27A" stroke="#BFA25A" stroke-width="1.2"/><rect x="9.4" y="17.6" width="5.2" height="3.4" rx="1.2" fill="#9A93A0"/><path d="M10.4 9.4c.3-1.3 1.2-2.1 2.4-2.3" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>',
  dots: '<circle cx="5.5" cy="12.5" r="2.3" fill="#6f6870"/><circle cx="12" cy="12.5" r="2.3" fill="#6f6870"/><circle cx="18.5" cy="12.5" r="2.3" fill="#6f6870"/>',
  shield: '<path d="M12 2.8l7.6 3v5.6c0 4.6-3.2 8.2-7.6 9.8-4.4-1.6-7.6-5.2-7.6-9.8V5.8z" fill="#6E8FAE"/><path d="M8.4 12l2.6 2.6 4.8-5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  spark: '<path d="M12 2.5c.8 4.6 2.9 6.7 7.5 7.5-4.6.8-6.7 2.9-7.5 7.5-.8-4.6-2.9-6.7-7.5-7.5 4.6-.8 6.7-2.9 7.5-7.5z" fill="#8E8AAE"/><path d="M19 15.5c.3 1.7 1.1 2.5 2.8 2.8-1.7.3-2.5 1.1-2.8 2.8-.3-1.7-1.1-2.5-2.8-2.8 1.7-.3 2.5-1.1 2.8-2.8z" fill="#B4B0CC"/>',
  cloud: '<path d="M7 14.2h10.4a3.6 3.6 0 0 0 .2-7.2 5 5 0 0 0-9.6 1A3.1 3.1 0 0 0 7 14.2z" fill="#9AA3B2"/><path d="M8.2 17l-1 3M12.2 17l-1 3M16.2 17l-1 3" stroke="#86AFC6" stroke-width="1.8" stroke-linecap="round"/>',
  fish: '<path d="M3 12c3.2-4.4 8-5.6 12.4-3.2L20.6 6v12l-5.2-2.8C11 17.6 6.2 16.4 3 12z" fill="#7D9BB3"/><circle cx="7.4" cy="11.2" r="1.2" fill="#1f2a3a"/><path d="M11.6 9.2c.8 1.8.8 3.8 0 5.6" fill="none" stroke="#5F7E96" stroke-width="1.3" stroke-linecap="round"/>',
  bone: '<path d="M6.6 9.2a2.6 2.6 0 1 1 2.8-3.6l5.2 5.2a2.6 2.6 0 1 1 3.6 2.8 2.6 2.6 0 1 1-2.8 3.6l-5.2-5.2a2.6 2.6 0 1 1-3.6-2.8z" fill="#F3E6D2" stroke="#C9AE88" stroke-width="1.4" stroke-linejoin="round"/>',
  drop: '<path d="M12 2.8S5.4 10.8 5.4 15a6.6 6.6 0 0 0 13.2 0C18.6 10.8 12 2.8 12 2.8z" fill="#7FA7BF"/><path d="M8.8 15.2c0 1.6 1 2.8 2.4 3.2" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>',
  mouse: '<path d="M4 15.5c0-4 3.4-7 7.6-7 3.8 0 7 2.6 7.4 6.2l2.6.8-2.8 1.2c-.6 1.4-2.6 2.3-7.2 2.3H6.2C5 19 4 17.6 4 15.5z" fill="#9A9088"/><circle cx="9.6" cy="9.4" r="2.6" fill="#B2A79E"/><circle cx="16.2" cy="14" r="1" fill="#2a2428"/><path d="M4.4 17c-2 0-2.8 1.4-2 3" fill="none" stroke="#9A9088" stroke-width="1.4" stroke-linecap="round"/>',
  bug: '<ellipse cx="12" cy="13.5" rx="4.6" ry="6" fill="#6E6258"/><path d="M12 7.5v12" stroke="#4E453E" stroke-width="1.2"/><circle cx="12" cy="6.4" r="2.4" fill="#4E453E"/><path d="M10.6 4.6L8.4 2.4M13.4 4.6l2.2-2.2M7.4 11l-3-1.4M16.6 11l3-1.4M7.4 15.4l-3 1.2M16.6 15.4l3 1.2" stroke="#4E453E" stroke-width="1.3" stroke-linecap="round"/>',
  seed: '<ellipse cx="8" cy="13" rx="2.4" ry="3.6" fill="#C9AA6A" transform="rotate(-25 8 13)"/><ellipse cx="15.5" cy="10" rx="2.4" ry="3.6" fill="#B89458" transform="rotate(20 15.5 10)"/><ellipse cx="14" cy="17.5" rx="2.4" ry="3.6" fill="#C9AA6A" transform="rotate(70 14 17.5)"/>',
};
const FOOD_EMOTE = { cat: 'fish', dog: 'bone', plant: 'drop', chick: 'seed', owl: 'mouse', gecko: 'bug', whale: 'drop', doodle: 'seed', goat: 'seed' };
const DOG_BITE_STAGE = 3; // Genç Kurt ve sonrası: uyurken dürtülürse ısırır
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function initPet(core, quiz) {
  const $ = s => document.querySelector(s);
  const esc = core.esc;
  const A = () => core.app;
  // kullanıcı pet özelliğini kapattıysa her yer 'pet yok' gibi davranır; pet donar (zaman işlemez), kaydı silinmez
  const off = () => A().profile?.petOff === true;
  const P = () => (off() ? null : A().pet);
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const notifyAvailable = () => { try { return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('LocalNotifications'); } catch { return false; } };

  // ---------- zaman ----------
  function clockNow() {
    try { const o = localStorage.getItem('dl-pet-clock'); if (o) { const [h, m] = o.split(':').map(Number); const d = new Date(); d.setHours(h, m || 0, 0, 0); return d; } } catch {}
    return new Date();
  }
  function phaseOf(d) {
    const m = d.getHours() * 60 + d.getMinutes();
    if (m >= 23 * 60 || m < 6 * 60) return 'night';
    if (m < 7 * 60 + 30) return 'dawn';
    if (m < 10 * 60) return 'morning';
    if (m < 20 * 60) return 'day';
    return 'evening';
  }
  const phase = () => phaseOf(clockNow());
  const isDaytime = d => d.getHours() >= 8 && d.getHours() < 18;
  const todayKey = () => new Date().toISOString().slice(0, 10);

  // ---------- durum ----------
  function maxes(p = P()) {
    const s = PET_SPECS[p.species], k = (1 + 0.06 * p.stage) * (p.shiny ? 1.1 : 1);
    return { hp: Math.round(s.hp * k), food: Math.round(s.food * k), energy: Math.round(s.energy * k) };
  }
  function normalize() {
    const app = A(); let p = app.pet;
    if (!app.petCatchUp || typeof app.petCatchUp !== 'object') app.petCatchUp = {};
    if (!app.petLevels || typeof app.petLevels !== 'object') app.petLevels = null;
    if (!Array.isArray(app.petMemorial)) app.petMemorial = [];
    if (!p || typeof p !== 'object' || !Object.prototype.hasOwnProperty.call(PET_SPECS, p.species)) { app.pet = null; return null; }
    const n = (v, d) => (Number.isFinite(+v) ? +v : d);
    p.stage = clamp(Math.floor(n(p.stage, 0)), 0, 5); p.stars = clamp(Math.floor(n(p.stars, 0)), 0, 999);
    const mx = maxes(p);
    p.hp = clamp(n(p.hp, mx.hp), 0, mx.hp); p.food = clamp(n(p.food, mx.food), 0, mx.food); p.energy = clamp(n(p.energy, mx.energy), 0, mx.energy);
    p.stuffed = clamp(n(p.stuffed, 0), 0, 100);
    p.name = String(p.name || PET_SPECS[p.species].name).slice(0, 16);
    p.alive = p.alive !== false; p.lastTick = n(p.lastTick, Date.now()); p.lastSeen = n(p.lastSeen, Date.now());
    p.flow = !!p.flow; p.flowCount = n(p.flowCount, 0); p.answers = n(p.answers, 0); p.correct = n(p.correct, 0); p.streak = n(p.streak, 0);
    p.roam = p.roam !== false; p.notify = p.notify !== false;
    if (p.species === 'plant') p.vig = clamp(n(p.vig, 0.85), 0, 1);
    // kedi/köpek tüy rengi: yoksa rastgele atanır ve kalıcı olur
    if (QUAD.includes(p.species) && !(Number.isInteger(p.coat) && p.coat >= 0 && p.coat < 8)) p.coat = randomCoat();
    if (p.death && typeof p.death !== 'object') p.death = null;
    if (!ROLES[p.role]) p.role = randomRole();
    p.shiny = p.shiny === true;
    if (!Array.isArray(p.lore)) p.lore = [];
    return p;
  }
  function save(touch = false) { core.saveLocal(touch); if (touch) core.cloudSync?.(); }

  function tick() {
    const p = P(); if (!p) return;
    const now = Date.now();
    let t = Math.max(now - 14 * 24 * HOUR, p.lastTick || now);
    if (!p.alive || now <= t) { p.lastTick = now; return; }
    const mx = maxes(p);
    while (t < now) {
      const step = Math.min(HOUR / 2, now - t), h = step / HOUR, d = new Date(t + step / 2), ph = phaseOf(d);
      const asleep = (p.species === 'owl' ? owlNap(d) : ph === 'night' || ph === 'dawn') || p.energy <= 0;
      const foodRate = p.species === 'plant' && isDaytime(d) ? 2 : 4;
      p.food = clamp(p.food - foodRate * h, 0, mx.food);
      p.energy = clamp(p.energy + (asleep ? 20 : 8) * h, 0, mx.energy);
      p.stuffed = clamp(p.stuffed - 30 * h, 0, 100);
      if (p.food <= 0) { if (p.hp > mx.hp * 0.2) p.hp = Math.max(mx.hp * 0.2, p.hp - 3 * h); }
      else if (p.food > mx.food * 0.5) p.hp = clamp(p.hp + 4 * h, 0, mx.hp);
      if (p.species === 'plant') stepVigor(p, mx, h, t + step / 2);
      t += step;
    }
    p.lastTick = now;
  }

  // Bitkinin hâli: su ve can hedefi belirler; üstüne birkaç günlük kendi döngüsü biner
  // (bazen iyi bakılsa da solar). Solmak hızlı, toparlanmak yavaştır.
  function vigorTarget(p, mx, at) {
    const base = 0.58 * (p.food / mx.food) + 0.42 * (p.hp / mx.hp);
    const days = at / (24 * HOUR);
    const cycle = 0.2 * Math.sin(days * Math.PI * 2 / 3.4 + (p.born || 0) % 7) + 0.07 * Math.sin(days * Math.PI * 2 / 1.1);
    return clamp(base + cycle - 0.04, 0, 1);
  }
  function stepVigor(p, mx, h, at) {
    if (!Number.isFinite(p.vig)) p.vig = vigorTarget(p, mx, at);
    const d = vigorTarget(p, mx, at) - p.vig;
    p.vig = clamp(p.vig + clamp(d, -0.07 * h, 0.03 * h), 0, 1);
    p.vigTrend = d > 0.04 ? 1 : d < -0.04 ? -1 : 0;
  }
  function plantCond(p) {
    const v = Number.isFinite(p.vig) ? p.vig : 1;
    return { vigor: v, dry: clamp((0.5 - v) / 0.4, 0, 1), trend: p.vigTrend || 0 };
  }

  // ---------- seviye → evrim ----------
  function levelsNow() {
    const o = { en: core.levelIndex() };
    for (const id of SUBJECT_ORDER) o[id] = Math.floor((quiz.catXp(id) || 0) / CAT_XP_STEP);
    return o;
  }
  function checkLevels() {
    if (off()) return 0;
    const app = A(), p = P(); const now = levelsNow();
    if (!app.petLevels) { app.petLevels = now; save(); return 0; }
    let gains = 0; const gainedKeys = [];
    for (const [k, v] of Object.entries(now)) {
      const prev = app.petLevels[k];
      if (prev == null) { app.petLevels[k] = v; continue; }
      if (v > prev) { gains += v - prev; app.petLevels[k] = v; gainedKeys.push({ k, v }); }
    }
    checkCatchUp();
    if (gains && p && p.alive) {
      // evrim kapısı: önce boss yenilmeli
      p.bossPending = (p.bossPending | 0) + gains;
      p.bossKeys = [...(p.bossKeys || []), ...gainedKeys];
      save(true); renderPanel();
      setTimeout(() => bossPrompt(), 900);
    } else if (gains) save();
    return gains;
  }
  const evoQueue = []; let evolving = false, deathPending = false;
  function evolveBy(n) {
    const p = P();
    for (let i = 0; i < n; i++) {
      if (p.stage < 5) {
        const from = p.stage, oldRole = p.role; p.stage++;
        p.role = randomRole(oldRole);
        const shinyNow = !p.shiny && Math.random() < SHINY_CHANCE; if (shinyNow) p.shiny = true;
        const mx = maxes(p); p.hp = Math.min(mx.hp, p.hp + mx.hp * 0.25); p.energy = Math.min(mx.energy, p.energy + 20);
        evoQueue.push({ type: 'evo', from, to: p.stage, role: p.role, oldRole, shiny: shinyNow });
        const parts = loreParts(PET_SPECS[p.species].soul), next = parts.findIndex((_, k) => !p.lore.includes(k));
        if (next >= 0) evoQueue.push({ type: 'lore', idx: next });
      }
      else { p.stars++; evoQueue.push({ type: 'star', stars: p.stars }); }
    }
    p.evolvedAt = Date.now(); save(true);
    setTimeout(runEvoQueue, 1150);
  }

  // ---------- telafi (catch-up) ----------
  function catXpOf(cat) { return cat === 'en' ? A().xp : (quiz.catXp(cat) || 0); }
  function checkCatchUp() {
    const app = A(); if (!app.petCatchUp) app.petCatchUp = {}; const cu = app.petCatchUp;
    for (const [cat, info] of Object.entries(cu)) {
      if (catXpOf(cat) >= (info.target || 0)) {
        if (cat === 'en' && info.floor != null) app.levelFloor = info.floor;
        delete cu[cat];
        if (P()) sayNow(`Telafi tamamlandı! ${catLabel(cat)} eski yerine döndü 🎉`, 4200);
      }
    }
  }
  function xpMod(cat, delta, right) {
    const p = P(); if (!(delta > 0)) return delta;
    let m = 1;
    const cu = A().petCatchUp?.[cat];
    if (cu && catXpOf(cat) < cu.target) m *= 2;
    if (p && p.alive && p.energy > 0) {
      if (p.species === 'chick') { const h = clockNow().getHours(); if (h >= 6 && h < 12) m *= 1.25; }
      if (p.species === 'owl') { const h = clockNow().getHours(); if (h >= 22 || h < 4) m *= 1.25; }
      if (p.species === 'doodle' && right) m *= 0.9;
      if (p.species === 'goat' && p.mirrorBonus && right) { m *= 1.5; p.mirrorBonus = false; }
      if (p.species === 'gecko' && p.prey && right) { m *= 2; p.prey = false; setTimeout(() => { emote('bug', 1600, true); sayNow('Av geldi. ×2 XP', 2400); renderPanel(); }, 900); }
    }
    if (p && p.alive && p.shiny) m *= 1.1;
    return Math.round(delta * m);
  }
  core.setXpMod(xpMod);
  core.setRewardBlock(() => !!(P()?.flow) || evoQueue.length > 0 || evolving || deathPending);

  // ---------- DOM: yuva paneli ----------
  const home = document.createElement('section');
  home.className = 'pet-home hidden'; home.id = 'petHome'; home.setAttribute('aria-label', 'Petin');
  home.innerHTML = `
    <div class="pet-hab" id="petHab" title="Petini çağır"><div class="pet-hab-bg" id="petHabBg"></div><div class="pet-away" id="petAway">🐾 Dolaşıyor · dokun, gelsin</div></div>
    <div class="pet-info">
      <div class="pet-title"><button class="pet-name" id="petNameBtn" aria-label="Pet bilgisi"><span id="petName">Pet</span> <span class="pet-stars" id="petStars"></span></button><span class="pet-form" id="petForm"></span>
        <button class="flow-btn arena-btn" id="arenaBtn" aria-label="Arena">⚔️<span id="arenaSmall">Arena</span></button><button class="flow-btn" id="flowBtn" aria-pressed="false"><span class="flow-ico">🌊</span><span id="flowSmall">Flow</span></button></div>
      <div class="pet-status" id="petStatus"></div>
      <div class="pet-bars">
        <div class="pbar hp"><span class="pbi">❤️</span><div class="pbt"><i id="pbHp"></i></div><b id="pbHpT"></b></div>
        <div class="pbar food" id="pbFoodRow"><span class="pbi" id="pbFoodI">🍖</span><div class="pbt"><i id="pbFood"></i></div><b id="pbFoodT"></b></div>
        <div class="pbar energy" id="pbEnergyRow"><span class="pbi">⚡</span><div class="pbt"><i id="pbEnergy"></i><em class="resist" aria-hidden="true"></em></div><b id="pbEnergyT"></b></div>
      </div>
      <div class="pet-catchup hidden" id="petCatch"></div>
    </div>`;
  const bar = document.querySelector('.quiz-bar');
  // Pet yeteneği, soru kartında ipucu düğmesinin yanında durur (yazmalı) / dinle düğmesinin yanında (seçenekli).
  const skillBtns = [];
  function mountSkill(parent, before, cls) {
    if (!parent) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = `pet-skill ${cls} hidden`;
    b.innerHTML = '<span class="ps-ico">✨</span><span class="ps-name"></span><small class="ps-cost"></small>';
    parent.insertBefore(b, before || null); skillBtns.push(b);
    b.addEventListener('click', () => useAbility());
  }
  mountSkill($('#qzHint')?.parentNode, $('#qzSubmit'), 'hintbtn ps-typed');
  mountSkill(document.querySelector('#quizCard .read-actions'), null, 'mini-btn ps-choice');
  (bar ? bar.parentNode.insertBefore(home, bar.nextSibling) : document.querySelector('main')?.prepend(home));

  // ---------- DOM: dolaşan pet ----------
  const actorEl = document.createElement('div');
  actorEl.className = 'pet-actor hidden'; actorEl.id = 'petActor';
  actorEl.innerHTML = `<div class="pet-shadow"></div><div class="pet-sprite" id="petSprite"></div><div class="pet-fx" id="petFx"></div><div class="pet-emote" id="petEmote" aria-hidden="true"></div><div class="pet-bubble" id="petBubble" role="status" aria-live="polite"></div>`;
  // Pet sayfa koordinatlarında yaşar: katman belgeyle birlikte kaydığı için kaydırma sırasında
  // tarayıcının kendi kaydırmasıyla aynı karede hareket eder (fixed + rAF gibi geriden gelmez).
  const layerEl = document.createElement('div');
  layerEl.className = 'pet-layer';
  layerEl.appendChild(actorEl);
  document.body.appendChild(layerEl);
  const SY = () => window.scrollY || document.documentElement.scrollTop || 0;
  const SX = () => window.scrollX || document.documentElement.scrollLeft || 0;
  const sprite = actorEl.querySelector('#petSprite'), fx = actorEl.querySelector('#petFx'), bubble = actorEl.querySelector('#petBubble'), emoteEl = actorEl.querySelector('#petEmote');

  // ---------- DOM: katmanlar ----------
  const layer = (id, cls, html) => { const d = document.createElement('div'); d.className = `pet-overlay ${cls}`; d.id = id; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.innerHTML = html; document.body.appendChild(d); return d; };
  const chooser = layer('petChooser', 'chooser', `<div class="pet-modal"><div class="eyebrow">YENİ ARKADAŞIN</div><h2 id="pcTitle">Bir pet seç</h2><p id="pcLead">Doğru cevaplar onu besler, yanlışlar canını yakar. Her seviye atladığında evrimleşir. Ona iyi bak!</p><div class="pc-grid" id="pcGrid"></div><div class="pc-detail" id="pcDetail"></div><div class="pc-name hidden" id="pcNameBox"><label for="pcName">Adı ne olsun?</label><div class="pc-row"><input id="pcName" maxlength="16" autocomplete="off"><button class="primarybtn" id="pcAdopt">Sahiplen 🐾</button></div></div></div>`);
  const evoEl = layer('petEvo', 'evo', `<div class="evo-box"><div class="evo-stage"><div class="evo-rays"></div><div class="evo-old" id="evoOld"></div><div class="evo-new" id="evoNew"></div><div class="evo-sparks" id="evoSparks"></div></div><h2 id="evoTitle">Bir şeyler oluyor…</h2><p id="evoSub"></p><button class="primarybtn" id="evoOk" disabled>Harika!</button></div><div class="evo-flash"></div>`);
  const deathEl = layer('petDeath', 'death', `<div class="pet-modal"><div class="death-scene"><div class="death-ghost" id="deathPet"></div><div class="death-grave">🪦</div></div><h2 id="deathTitle"></h2><p id="deathLead"></p><div class="death-opts"><button class="death-opt" id="petRevive"><b>💫 Canlandır</b><span id="reviveTxt"></span></button><button class="death-opt" id="petNew"><b>🥚 Yeni pet</b><span id="newTxt"></span></button></div></div>`);
  const infoEl = layer('petInfo', 'info', `<div class="pet-modal"><div class="modal-head"><div><div class="eyebrow">PETİN</div><h2 id="piTitle"></h2></div><button class="closebtn" id="piClose" aria-label="Kapat">×</button></div><div class="pi-line" id="piLine"></div><div class="pi-skills" id="piSkills"></div><div class="pi-stats" id="piStats"></div><label class="field-label" for="piName">Adı</label><div class="pc-row"><input id="piName" class="setting-input" maxlength="16"><button class="secondarybtn" id="piSave">Kaydet</button></div><label class="toggle-row"><span>Ekranda dolaşsın<small>Kapalıysa yuvasında kalır.</small></span><input type="checkbox" id="piRoam"></label><label class="toggle-row" id="piNotifyRow"><span>Acıkınca bildirim gönder<small>Uzun süre girmezsen telefonuna haber verir.</small></span><input type="checkbox" id="piNotify"></label><div class="setting-note" id="piMemorial"></div></div>`);

  const loreEl = layer('petLore', 'lore', `<div class="pet-modal lore-card"><div class="eyebrow" id="loreEye">PETİNİN GÜNLÜĞÜ</div><div class="lore-art" id="loreArt"></div><p class="lore-text" id="loreText"></p><div class="lore-count" id="loreCount"></div><button class="primarybtn" id="loreOk">Okudum</button></div>`);
  const codexEl = layer('petCodex', 'codex', `<div class="pet-modal codex"><div class="modal-head"><div><div class="eyebrow">ANSİKLOPEDİ</div><h2>Petler</h2></div><button class="closebtn" id="cxClose" aria-label="Kapat">×</button></div><div class="cx-tabs" id="cxTabs"></div><div id="cxBody"></div></div>`);

  // ayarlara kısa yol
  const setGrid = document.querySelector('#settingsOverlay .settings-grid');
  if (setGrid) {
    const sec = document.createElement('section'); sec.className = 'setting-section'; sec.id = 'petSettings'; sec.dataset.tab = 'pet';
    sec.innerHTML = `<h3>Petin</h3><label class="toggle-row"><span>Pet özelliği<small>Kapatınca pet, can/enerji ve pet yetenekleri gizlenir; petin donar ve açtığında kaldığı yerden devam eder.</small></span><input type="checkbox" id="petEnabled"></label><p id="petSetLead">Ad, dolaşma, bildirimler ve evrim çizgisi.</p><button class="secondarybtn" id="openPetInfo" style="width:100%">🐾 Pet bilgisi ve ayarları</button><button class="secondarybtn" id="openCodex" style="width:100%;margin-top:8px">📖 Pet ansiklopedisi</button>`;
    setGrid.insertBefore(sec, setGrid.children[1] || null);
    sec.querySelector('#openPetInfo').addEventListener('click', () => openInfo());
    sec.querySelector('#openCodex').addEventListener('click', () => openCodex());
    const tg = sec.querySelector('#petEnabled');
    const syncSet = () => { tg.checked = !off(); sec.querySelector('#openPetInfo').classList.toggle('hidden', off()); sec.querySelector('#petSetLead').classList.toggle('hidden', off()); };
    syncSet(); document.querySelector('#settingsBtn')?.addEventListener('click', syncSet);
    tg.addEventListener('change', () => { setEnabled(tg.checked); syncSet(); core.toast(tg.checked ? '🐾 Pet özelliği açıldı.' : 'Pet özelliği kapatıldı. Ayarlar’dan tekrar açabilirsin.'); });
  }

  // ---------- çizim ----------
  let tempMood = null, tempUntil = 0, animCls = '', animUntil = 0, artKey = '', lookDir = 0;
  function currentMood() {
    const p = P(); if (!p) return 'idle';
    if (!p.alive) return 'dead';
    if (tempMood && Date.now() < tempUntil) return tempMood;
    if (isSleeping()) return 'sleep';
    if (p.flow) return 'focus';
    const mx = maxes(p);
    if (p.stuffed >= 30) return 'full';
    if (p.food < mx.food * 0.2) return 'hungry';
    if (p.hp < mx.hp * 0.3) return 'sad';
    const ph = phase();
    if (p.species === 'owl') {
      if (ph === 'night' || ph === 'evening') return 'focus';
      if (ph === 'morning' || ph === 'day' && clockNow().getHours() >= 11 || p.energy < mx.energy * 0.2) return 'groggy';
      return 'idle';
    }
    if (ph === 'morning' || p.energy < mx.energy * 0.2) return 'groggy';
    if (ph === 'evening') return dozing ? 'sleep' : 'sleepy';
    return 'idle';
  }
  let awakeUntil = 0, dozing = false;
  function isSleeping() {
    const p = P(); if (!p || !p.alive) return false;
    if (p.energy <= 0) return true;
    if (p.species === 'owl') return owlNap(clockNow()) && Date.now() >= awakeUntil;
    const ph = phase();
    if (ph === 'night' || ph === 'dawn') return Date.now() >= awakeUntil;
    // civciv günü herkesten önce bitirir
    if (p.species === 'chick' && clockNow().getHours() >= 21) return Date.now() >= awakeUntil;
    return false;
  }
  // baykuş: gece uyanık, öğleden sonra kestirir
  const owlNap = d => { const h = d.getHours(); return h >= 13 && h < 16; };
  // Canlı çizim: iskeletli oynatıcı (pets/puppet.js) her karede pozu hesaplar.
  // Temel durum (boşta, oturma, yürüme, koşu, uyku, yatma, ölü) ruh hali ve hareketten gelir;
  // tepkiler (zıplama, irkilme, yemek…) bunun üstünde tek seferlik klip olarak oynar.
  const puppet = new Puppet(sprite);
  let running = false;
  function baseNow() {
    const p = P(); if (!p) return 'idle';
    if (!p.alive) return 'dead';
    if (isSleeping() || currentMood() === 'sleep') return 'sleep';
    if (moving && mode !== 'home') return running ? 'run' : 'walk';
    const m = currentMood();
    if (m === 'full') return 'lie';
    if (m === 'groggy' || m === 'sleepy') return mode === 'home' ? 'lie' : 'sit';
    if (m === 'sad' || m === 'hungry') return 'sit';
    if (m === 'focus') return 'idle';
    return mode === 'home' ? 'sit' : 'idle';
  }
  function drawSprite(force = false) {
    const p = P(); if (!p) return;
    const mood = currentMood();
    puppet.setForm(p.species, p.stage, p.coat | 0);
    puppet.setMood(mood);
    puppet.setCond(p.species === 'plant' ? plantCond(p) : null);
    puppet.setBase(baseNow());
    if (force) artKey = '';
    const key = `${mood}|${baseNow()}`;
    if (key !== artKey) { artKey = key; sprite.dataset.mood = mood; sprite.dataset.pose = baseNow(); }
    const sk = p.shiny ? p.species : '';
    if (sprite._shiny !== sk) { sprite._shiny = sk; sprite.style.filter = sk ? shinyFilter(sk) : ''; actorEl.classList.toggle('is-shiny', !!sk); }
  }
  function statusText(p) {
    if (!p.alive) return '🕊️ Öldü';
    const mx = maxes(p), parts = [];
    if (isSleeping()) parts.push(p.energy <= 0 ? '😵 Bitkin, uyuyor' : '😴 Uyuyor');
    else if (p.flow) parts.push('🎯 Odaklanmış');
    else if (p.species === 'owl') { const ph = phase(); parts.push(ph === 'night' || ph === 'evening' ? '🌙 Nöbette' : ph === 'morning' ? '☕ Mahmur' : '😐 Gündüz yorgunu'); if (p.ward) parts.push(`♟️ ${p.ward} tur önde`); }
    else { const ph = phase(); if (ph === 'morning') parts.push('☕ Mahmur'); else if (ph === 'evening') parts.push('🌙 Uykusu geliyor'); else parts.push(p.species === 'gecko' ? '🦎 Kendi halinde' : '😊 Keyifli'); }
    if (p.species === 'gecko' && p.prey) parts.push('🦗 Av yaklaşıyor');
    if (p.species === 'goat' && p.mirrorBonus) parts.push('🪞 Ayna hazır');
    if (p.species === 'plant') { const v = Number.isFinite(p.vig) ? p.vig : 1; parts.push(v > 0.75 ? '🌿 Gür' : v > 0.5 ? '🍃 İdare ediyor' : v > 0.3 ? '🥀 Yarı solgun' : '🌵 Kuru, dikenli'); if ((p.vigTrend || 0) > 0 && v < 0.7) parts.push('🌱 toparlanıyor'); }
    if (p.stuffed >= 30) parts.push('😌 Mayışmış');
    else if (p.food < mx.food * 0.2) parts.push(p.species === 'plant' ? '🥀 Susuz' : '🍖 Aç');
    if (p.hp < mx.hp * 0.3) parts.push('🩹 Canı az');
    return parts.join(' · ');
  }
  function renderPanel() {
    const p = P();
    home.classList.toggle('hidden', !p);
    if (!p) { skillBtns.forEach(b => b.classList.add('hidden')); document.body.classList.remove('pet-flow'); return; }
    const sp = PET_SPECS[p.species], mx = maxes(p);
    $('#petName').textContent = p.name;
    $('#petStars').textContent = p.stars ? '⭐'.repeat(Math.min(5, p.stars)) + (p.stars > 5 ? `×${p.stars}` : '') : '';
    $('#petForm').textContent = `${stageName(p.species, p.stage)} · ${PET_SPECIES[p.species].label} · Form ${p.stage + 1}/6`;
    $('#petStatus').textContent = statusText(p);
    const setBar = (id, v, m) => { $(id).style.width = `${clamp((v / m) * 100, 0, 100)}%`; $(id + 'T').textContent = `${Math.round(v)}`; $(id).closest('.pbar').title = `${Math.round(v)}/${m}`; };
    setBar('#pbHp', p.hp, mx.hp); setBar('#pbFood', p.food, mx.food); setBar('#pbEnergy', p.energy, mx.energy);
    $('#pbFoodI').textContent = sp.foodIcon; $('#pbFoodRow').classList.toggle('water', p.species === 'plant');
    $('#pbFoodRow').title = sp.foodLabel;
    $('#pbHp').parentElement.parentElement.classList.toggle('low', p.hp < mx.hp * 0.3);
    $('#pbEnergyRow').classList.toggle('resisting', p.flow);
    skillBtns.forEach(b => {
      b.classList.toggle('hidden', !p.alive);
      b.querySelector('.ps-name').textContent = sp.active.name;
      b.querySelector('.ps-cost').textContent = `${sp.active.cost}⚡`;
      b.disabled = p.energy < sp.active.cost;
      b.title = `${sp.active.name}: ${sp.active.desc} (${sp.active.cost} enerji)`;
    });
    $('#arenaBtn').classList.toggle('boss', !!p.bossPending); $('#arenaSmall').textContent = p.bossPending ? (p.bossNeedQ ? 'Boss · 1 soru' : 'Boss!') : 'Arena';
    $('#flowBtn').classList.toggle('on', p.flow); $('#flowBtn').setAttribute('aria-pressed', String(p.flow));
    $('#flowSmall').textContent = p.flow ? 'Flow açık' : 'Flow';
    $('#flowBtn').title = p.flow ? `Enerji ${10 - (p.flowCount % 10)} soru sonra azalacak` : 'Flow: müzik ödülleri durur, enerji 10 soruda bir azalır';
    document.body.classList.toggle('pet-flow', p.flow);
    const ph = phase(); document.body.classList.toggle('pet-night', ph === 'night' || ph === 'dawn'); document.body.classList.toggle('pet-evening', ph === 'evening');
    const cu = Object.entries(A().petCatchUp || {});
    const box = $('#petCatch');
    box.classList.toggle('hidden', !cu.length);
    box.innerHTML = cu.map(([cat, i]) => `<span>🔁 ${esc(catLabel(cat))}: 2× XP · ${Math.max(0, Math.round(i.target - catXpOf(cat)))} XP kaldı</span>`).join('');
    $('#petHabBg').innerHTML = homeSVG(p.species);
    awayShown = mode !== 'home' && !actorEl.classList.contains('hidden'); $('#petAway').classList.toggle('show', awayShown);
    drawSprite();
  }

  // ---------- konuşma balonu ve efektler ----------
  let bubbleTimer = 0, lastSay = 0;
  // Pet konuşmaktan çok ifadesiyle anlatır: sıradan laflar en fazla 40 saniyede bir, önemli olanlar (sayNow) her zaman.
  function say(text, ms = 2600) {
    if (Date.now() - lastSay < 40000) return;
    sayNow(text, ms);
  }
  function sayNow(text, ms = 3200) {
    if (!P() || actorEl.classList.contains('hidden')) return;
    bubble.textContent = text; bubble.classList.add('show'); lastSay = Date.now();
    placeBubble();
    clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => bubble.classList.remove('show'), ms);
  }
  function placeBubble() {
    const vw = window.innerWidth;
    bubble.classList.toggle('left', pos.x < 90); bubble.classList.toggle('right', pos.x > vw - 150);
    bubble.classList.toggle('below', vy(pos.y) < 90);
  }
  function spawn(char, cls = '', n = 1) {
    if (reduced && n > 2) n = 2;
    for (let i = 0; i < n; i++) {
      const e = document.createElement('span'); e.className = `pfx ${cls}`; e.textContent = char;
      e.style.left = `${20 + Math.random() * 40}%`; e.style.animationDelay = `${i * 0.12}s`;
      e.style.setProperty('--dx', `${(Math.random() - 0.5) * 40}px`);
      fx.appendChild(e); setTimeout(() => e.remove(), 1900 + i * 120);
    }
  }
  let emoteTimer = 0, emoteOut = 0;
  // Duygu öncelikle beden diliyle anlatılır; simge balonu seyrek çıkar (20 sn'de bir), yalnızca önemli anlarda zorlanır.
  let lastEmote = 0;
  function emote(kind, ms = 1800, force = false) {
    const p = P(); if (!p || actorEl.classList.contains('hidden')) return;
    if (!force && Date.now() - lastEmote < 20000) return;
    lastEmote = Date.now();
    if (kind === 'food') kind = FOOD_EMOTE[p.species] || 'star';
    const svg = EM[kind]; if (!svg) return;
    clearTimeout(emoteTimer); clearTimeout(emoteOut);
    emoteEl.className = `pet-emote e-${kind}`;
    emoteEl.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${svg}</svg>`;
    void emoteEl.offsetWidth; emoteEl.classList.add('show'); actorEl.classList.add('emoting');
    emoteTimer = setTimeout(() => { emoteEl.classList.add('out'); emoteOut = setTimeout(() => { emoteEl.className = 'pet-emote'; actorEl.classList.remove('emoting'); }, 260); }, ms);
  }
  function react(mood, ms = 1200, anim = '', em = '') {
    tempMood = mood; tempUntil = Date.now() + ms;
    if (anim) { setAnim(anim, ms); }
    if (em && Math.random() < 0.35) emote(em, Math.max(1300, ms + 300));
    drawSprite();
    setTimeout(() => drawSprite(), ms + 30);
  }
  function setAnim(cls, ms) {
    animCls = cls; animUntil = Date.now() + ms;
    sprite.className = 'pet-sprite a-' + cls;
    // kaçış hareket motorunda koşu olarak çizilir; ölüm temel duruştur
    if (cls === 'flee') { running = true; drawSprite(); return; }
    if (cls === 'dead') { puppet.stop(); drawSprite(true); return; }
    if (cls === 'sleep' && isSleeping()) { drawSprite(); return; }
    puppet.play(cls, ms);
    drawSprite();
  }

  // ---------- hareket motoru ----------
  const W = 132, H = 132;
  const pos = { x: -200, y: -200 }, target = { x: 0, y: 0 };
  let awayShown = false;
  let mode = 'home', moving = false, speed = 70, facing = 1, nextThink = 0, lastTs = 0, onArrive = null, visible = false;
  // performans: yuva konumu her karede ölçülmez (zorunlu yerleşim hesabı), kısa aralıklarla ya da kaydırma/boyut değişince yenilenir
  let anchorAt = 0, anchorCache = { x: -300, y: -300 };
  const dirtyAnchor = () => { anchorAt = 0; };
  window.addEventListener('resize', dirtyAnchor, { passive: true });
  function homeAnchor(force = false) {
    const t = performance.now();
    if (!force && t - anchorAt < 250) return anchorCache;
    anchorAt = t;
    const r = $('#petHab')?.getBoundingClientRect();
    anchorCache = (!r || !r.width) ? { x: -300, y: -300 } : { x: r.left + SX() + r.width / 2 - W / 2, y: r.bottom + SY() - H - 6 };
    return anchorCache;
  }
  // yuva ekranda değilse ve pet evdeyse çizim durdurulur
  let habOnScreen = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { habOnScreen = es[es.length - 1].isIntersecting; dirtyAnchor(); }, { rootMargin: '80px' }).observe(home);
  // pos sayfa koordinatıdır; ekran (viewport) hesapları için dönüştürücüler
  const vy = y => y - SY();
  function inView(m = 0) { const y = vy(pos.y); return y + H > -m && y < window.innerHeight + m; }
  function pageH() { return layerEl.offsetHeight || document.documentElement.scrollHeight; }
  function habVisible() { const r = $('#petHab')?.getBoundingClientRect(); return r && r.bottom > 40 && r.top < window.innerHeight - 40 && !home.classList.contains('hidden'); }
  let blockedAt = 0, blockedVal = false;
  function blocked() {
    const t = performance.now();
    if (t - blockedAt > 200) { blockedAt = t; blockedVal = !!document.querySelector('.overlay.show, .pet-overlay.show, .bt-overlay.show') || document.visibilityState === 'hidden'; }
    return blockedVal;
  }
  function busyRects() {
    return [...document.querySelectorAll('button, input, select, textarea, .quiz-opt, .slot-tray, .level-card, .cat-tab')]
      .map(e => e.getBoundingClientRect()).filter(r => r.width && r.bottom > 0 && r.top < window.innerHeight);
  }
  function freeSpot() {
    const vw = window.innerWidth, vh = window.innerHeight, rects = busyRects();
    const top = Math.max(80, vh * 0.16), span = Math.max(10, vh - H - 90 - top);
    // çoğunlukla aynı "zeminde" yürür (yatay); çapraz süzülme yerine adım adım ilerler
    const sameFloor = mode === 'roam' && inView() && Math.random() < 0.7;
    const sy = SY();
    let best = null;
    for (let i = 0; i < 8; i++) {
      const x = 8 + Math.random() * Math.max(10, vw - W - 16);
      const y = sameFloor ? clamp(vy(pos.y) + (Math.random() - 0.5) * 50, top, top + span) : top + Math.random() * span;
      const hit = rects.some(r => x < r.right && x + W > r.left && y < r.bottom && y + H > r.top);
      best = { x, y: y + sy }; if (!hit) return best;
    }
    return best;
  }
  function walkTo(t, spd, done) {
    target.x = t.x; target.y = t.y; speed = spd; moving = true; onArrive = done || null;
    running = spd >= 180;
    // yerinde oynayan bir klip yürüyüşü örtmesin (yoksa pet kayar)
    if (puppet.playing) { puppet.stop(); animCls = ''; }
    if (Math.abs(t.x - pos.x) > 4) facing = t.x > pos.x ? 1 : -1;
  }
  function baseSpeed() {
    const m = currentMood(), p = P();
    if (p.flow) return 85;
    if (m === 'full') return 30; if (m === 'groggy' || m === 'sleepy') return 40; if (m === 'hungry' || m === 'sad') return 48;
    return 72;
  }
  function goHome() {
    if (mode === 'home') return;
    if (!habVisible()) {
      // yuva ekranda değilse o yöne doğru yürüyüp ekrandan çıkar
      const r = $('#petHab')?.getBoundingClientRect();
      // pet de ekran dışındaysa yürütmeye gerek yok, doğrudan yuvasına döner
      if (!inView(20)) { mode = 'home'; moving = false; onArrive = null; return; }
      const above = !r || r.bottom < window.innerHeight / 2;
      mode = 'exit'; walkTo({ x: pos.x, y: (above ? -H - 20 : window.innerHeight + 20) + SY() }, baseSpeed() * 1.3, () => { mode = 'home'; });
      return;
    }
    mode = 'walkHome'; walkTo(homeAnchor(), baseSpeed() * 1.3, () => { mode = 'home'; });
  }
  function leaveHome() {
    if (!P()?.roam || reduced) return;
    if (habVisible()) { const a = homeAnchor(); pos.x = a.x; pos.y = a.y; }
    else {
      // yuva ekran dışındaysa en yakın kenardan içeri girer
      const r = $('#petHab')?.getBoundingClientRect(), a = homeAnchor();
      pos.x = clamp(a.x, 8, window.innerWidth - W - 8); pos.y = (!r || r.bottom < 0 ? -H : window.innerHeight + 4) + SY();
    }
    mode = 'roam';
    walkTo(freeSpot(), baseSpeed());
  }
  // türe özel boşta hareketleri (ağırlıklı seçim)
  const IDLE_KIT = {
    cat: [['groom', 2600, 4], ['stretch', 2000, 2], ['look', 1700, 2], ['sit', 3000, 2]],
    dog: [['sniff', 1800, 3], ['shake', 1400, 2], ['chase', 2200, 1], ['look', 1700, 2], ['sit', 2600, 1]],
    chick: [['look', 1700, 3], ['mirror', 3200, 2], ['petals', 3400, 2], ['hop', 950, 1], ['stretch', 2000, 1]],
    plant: [['photo', 3600, 3], ['sit', 3000, 2], ['look', 1700, 1]],
    owl: [['headturn', 2400, 3], ['look', 1700, 1], ['sit', 3000, 2], ['coffee', 4000, 1]],
    gecko: [['lick', 1800, 3], ['tongue', 1600, 2], ['freeze', 3000, 2], ['tailwave', 2600, 1], ['bask', 4200, 1]],
    whale: [['look', 2200, 2], ['stretch', 2400, 2], ['tailwave', 2600, 2], ['ability', 2000, 1]],
    doodle: [['freeze', 4000, 4], ['sit', 3600, 3], ['look', 2000, 1], ['sad', 2600, 1]],
    goat: [['look', 1800, 2], ['sniff', 1800, 2], ['freeze', 2600, 2], ['eat', 2000, 1]],
  };
  // mizaç durumu (oturum içi): kedinin can sıkıntısı, köpeğin seni kollaması
  let catBored = 0, wrongRun = 0, guardUntil = 0, mischiefAt = 0;
  function pickIdle(sp) {
    const day = isDaytime(clockNow()), ph = phase();
    const kit = (IDLE_KIT[sp] || IDLE_KIT.chick).filter(([n]) => (n !== 'photo' && n !== 'bask' || day) && (n !== 'coffee' || ph === 'morning' || ph === 'day'));
    let r = Math.random() * kit.reduce((s, k) => s + k[2], 0);
    for (const k of kit) { r -= k[2]; if (r <= 0) return k; }
    return kit[0];
  }
  function idleAct() {
    const p = P(), m = currentMood(), sp = p.species, mx = maxes(p);
    if (m === 'full' && Math.random() < 0.45) { setAnim('roll', 4200); if (Math.random() < 0.5) emote('sweat', 1800); return; }
    if (m === 'sleepy') { dozing = true; drawSprite(); setAnim('doze', 3200); emote('zz', 2600); setTimeout(() => { dozing = false; drawSprite(); }, 3200); return; }
    if (m === 'groggy' && Math.random() < 0.5) { setAnim(Math.random() < 0.5 ? 'yawn' : 'stretch', 2000); if (Math.random() < 0.5) emote('dots', 1600); return; }
    if (m === 'hungry' && Math.random() < 0.55) { setAnim('hungry', 3000); emote('food', 2200); return; }
    if (m === 'sad' && Math.random() < 0.45) { if (p.hp < mx.hp * 0.2) { setAnim('cry', 3000); emote('tear', 2000); } else { setAnim('sad', 2200); emote('cloud', 2200); } return; }
    if (p.flow && Math.random() < 0.4) { setAnim('focus', 2200); if (Math.random() < 0.4) emote('spark', 1500); return; }
    if (sp === 'dog' && Date.now() < guardUntil) { setAnim('protect', 3000); if (Math.random() < 0.4) emote('shield', 1500); return; }
    if (Math.random() < 0.18) { setAnim('sit', 2600); return; }
    const [name, ms] = pickIdle(sp);
    if (name === 'look') { facing *= -1; if (Math.random() < 0.35) emote('ask', 1400); }
    if (name === 'hop' && Math.random() < 0.5) emote('note', 1400);
    if (name === 'dance') emote('note', 1500);
    if (sp === 'cat') catBored += 8; // aynı şey sürdükçe sıkılır
    if (name === 'coffee') setTimeout(() => emote('dots', 1500), 3000); // kahve: kısa bir canlanma, sonra yine aynı yorgunluk
    if (name === 'mirror') setTimeout(() => emote('love', 1200), 1600);
    if (name === 'photo') setTimeout(() => emote('star', 1300), 900);
    setAnim(name, ms);
  }
  function think(now) {
    const p = P();
    if (!p.alive) { nextThink = now + 4000; return; }
    // yetenek gösterisi (lazer avı) sürerken kendi kafasına göre gezmesin
    if (abilityBusy) { nextThink = now + 600; return; }
    // süren bir tepki (sevinç, üzüntü, irkilme…) yarıda kesilmesin
    if (animCls && Date.now() < animUntil && !['sit', 'look', 'groom', 'sleep'].includes(animCls)) { nextThink = now + (animUntil - Date.now()) + 400; return; }
    const sleeping = isSleeping();
    if (sleeping || !p.roam || reduced) {
      if (mode !== 'home') goHome();
      else if (sleeping) setAnim('sleep', 4000);
      else idleAct();
      if (sleeping && Math.random() < 0.6) spawn('z', 'zz', 2);
      if (sleeping && Math.random() < 0.35) emote('zz', 2400);
      nextThink = now + 3200; return;
    }
    const lazy = p.stuffed >= 30 || ['groggy', 'sleepy'].includes(currentMood());
    // kedi: sıkıldıysa olay çıkarır; birkaç saniye sonra hiçbir şey olmamış gibi sokulur
    if (p.species === 'cat' && catBored >= 60 && now > mischiefAt) { catMischief(); nextThink = now + 5200; return; }
    // köpek: zor anlarında soru kartının başında nöbet tutar
    if (p.species === 'dog' && now < guardUntil && p.roam && !reduced) { const g = guardSpot(); if (g && mode !== 'home') { walkTo(g, baseSpeed() * 1.4, () => { setAnim('protect', 3000); emote('shield', 1500); }); nextThink = now + 4200; return; } }
    if (mode === 'home') { if (Math.random() < (p.flow ? 0.35 : p.species === 'plant' ? 0.25 : p.species === 'dog' && now < guardUntil ? 0.9 : 0.55)) leaveHome(); else idleAct(); }
    else if (!inView(H)) {
      // kullanıcı kaydırıp peti geride bıraktıysa: en yakın kenardan ekrana geri girer
      const above = vy(pos.y) < 0;
      pos.y = (above ? -H : window.innerHeight + 4) + SY();
      walkTo(freeSpot(), baseSpeed());
    } else {
      const r = Math.random();
      if (r < 0.14) goHome();
      else if (r < (lazy ? 0.4 : 0.6)) walkTo((p.species === 'chick' && Math.random() < 0.7 && spotNearYou()) || freeSpot(), baseSpeed());
      else idleAct();
    }
    // ara sıra moral
    const sinceSay = now - lastSay;
    if (sinceSay > (p.flow ? 150000 : 240000) && Math.random() < 0.2) {
      const mx = maxes(p);
      if (p.flow) { say(pick(LINES.flow)); emote('spark', 1500); }
      else if (p.food < mx.food * 0.25) { say(pick(p.species === 'plant' ? LINES.hungry.plant : LINES.hungry.other)); emote('food', 2400); }
      else if (p.stuffed >= 50) { say(pick(LINES.full)); emote('sweat', 1800); }
      else if (p.hp < mx.hp * 0.3) { say(pick(LINES.low)); emote('cloud', 2000); }
      else { say(pick(LINES.cheer)); emote(Math.random() < 0.5 ? 'love' : 'note', 1600); }
    }
    nextThink = now + (2600 + Math.random() * 3800) * (lazy ? 1.5 : 1);
  }
  function frame(ts) {
    requestAnimationFrame(frame);
    const p = P();
    const dt = Math.min(0.05, (ts - (lastTs || ts)) / 1000); lastTs = ts;
    const show = !!p && !blocked();
    if (show !== visible) { visible = show; actorEl.classList.toggle('hidden', !show); if (show) renderPanel(); }
    if (!show) return;
    const now = Date.now();
    let stepPx = 0;
    if (mode === 'home') { const a = homeAnchor(); pos.x = a.x; pos.y = a.y; }
    else if (moving) {
      const dx = target.x - pos.x, dy = target.y - pos.y, dist = Math.hypot(dx, dy);
      if (mode === 'walkHome') { const a = homeAnchor(); target.x = a.x; target.y = a.y; }
      if (dist < 2) { moving = false; running = false; const f = onArrive; onArrive = null; f?.(); }
      else { const s = Math.min(dist, speed * dt); stepPx = s; pos.x += (dx / dist) * s; pos.y += (dy / dist) * s; if (Math.abs(dx) > 3) facing = dx > 0 ? 1 : -1; }
    }
    if (stepPx) puppet.travel(stepPx, running ? 'run' : 'walk', W, target.x - pos.x, target.y - pos.y);
    puppet.face(facing);
    // pencere küçülürse ekranda kalsın
    if (mode === 'roam' && !moving) { pos.x = clamp(pos.x, 0, window.innerWidth - W); pos.y = clamp(pos.y, 40, pageH() - H - 6); }
    const tr = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`;
    if (tr !== lastTr) { lastTr = tr; actorEl.style.transform = tr; }
    if (facing !== lastFace) { lastFace = facing; actorEl.style.setProperty('--face', facing); }
    const walking = moving && mode !== 'home';
    if (mode === 'exit' || mode === 'walkHome') actorEl.classList.add('leaving'); else actorEl.classList.remove('leaving');
    if (walking) { if (!sprite.classList.contains('a-walk') && !sprite.classList.contains('a-flee')) sprite.className = 'pet-sprite a-walk'; }
    else if (animCls && now > animUntil) { animCls = ''; sprite.className = 'pet-sprite ' + (isSleeping() ? 'a-sleep' : 'a-idle'); }
    else if (!animCls && !/a-(idle|sleep)/.test(sprite.className)) sprite.className = 'pet-sprite ' + (isSleeping() ? 'a-sleep' : 'a-idle');
    if ((mode === 'home') !== lastHomeCls) { lastHomeCls = mode === 'home'; actorEl.classList.toggle('at-home', lastHomeCls); }
    const away = mode !== 'home';
    if (away !== awayShown) { awayShown = away; $('#petAway').classList.toggle('show', away); }
    // evde ve ekran dışındaysa çizme; dururken 30 fps yeter (yürürken/oynarken tam hız)
    const offscreen = mode === 'home' && !habOnScreen;
    accDt += dt; skipFrame = !skipFrame;
    if (!offscreen && (moving || puppet.playing || !skipFrame)) { drawSprite(); puppet.tick(accDt); accDt = 0; }
    if (now > nextThink && !moving && p) think(now);
  }
  let lastTr = '', lastFace = null, lastHomeCls = null, accDt = 0, skipFrame = false;

  // ---------- etkileşim ----------
  let pressTimer = 0, pressed = false;
  // son dokunulan yer: civciv sevdiğinin yanında kalmak ister
  let lastPtr = null;
  document.addEventListener('pointerdown', e => { if (!e.target.closest?.('#petActor')) lastPtr = { x: e.pageX, y: e.pageY, t: Date.now() }; }, { passive: true });
  function spotNearYou() {
    if (!lastPtr || Date.now() - lastPtr.t > 25000) return null;
    const vw = window.innerWidth, sy = SY(), vh = window.innerHeight;
    const y = clamp(lastPtr.y - H + (Math.random() - 0.3) * 60, sy + 70, sy + vh - H - 20);
    return { x: clamp(lastPtr.x - W / 2 + (Math.random() - 0.5) * 120, 8, vw - W - 8), y };
  }
  actorEl.addEventListener('pointerdown', e => {
    if (!P()?.alive) return;
    e.preventDefault(); e.stopPropagation(); pressed = true;
    pressTimer = setTimeout(() => { pressed = false; pet(); }, 550);
  });
  actorEl.addEventListener('pointerup', e => {
    e.stopPropagation(); clearTimeout(pressTimer);
    if (!pressed) return; pressed = false; tap();
  });
  actorEl.addEventListener('pointerleave', () => { clearTimeout(pressTimer); pressed = false; });
  actorEl.addEventListener('click', e => e.stopPropagation());
  function shakeActor() { actorEl.classList.remove('bitten'); void actorEl.offsetWidth; actorEl.classList.add('bitten'); setTimeout(() => actorEl.classList.remove('bitten'), 520); }
  function catFed(p) { return p.food > maxes(p).food * 0.45; }
  // uzun basış: okşama
  function pet() {
    const p = P(); if (!p?.alive) return;
    const sp = p.species;
    if (isSleeping() && !(sp === 'dog' && p.stage >= DOG_BITE_STAGE)) awakeUntil = Date.now() + 45000;
    if (sp === 'dog' && isSleeping() && p.stage >= DOG_BITE_STAGE) { dogBite(); return; }
    if (sp === 'cat') {
      // işine geldiğinde: karnı toksa sokulur, değilse kıvrılıp gider
      if (catFed(p)) { react('love', 2600, 'cuddle', 'love'); catBored = Math.max(0, catBored - 30); say(pick(PET_SPECS.cat.love)); }
      else { react('poked', 1200, 'poked', 'fish'); facing *= -1; if (p.roam && !reduced && mode !== 'home') setTimeout(() => walkTo(freeSpot(), baseSpeed()), 900); }
      return;
    }
    if (sp === 'plant') { react('love', 2400, isDaytime(clockNow()) ? 'photo' : 'sit', 'love'); say(pick(PET_SPECS.plant.love)); return; }
    if (sp === 'owl') { react('love', 2200, 'sit', 'love'); say(pick(PET_SPECS.owl.love)); return; }
    if (sp === 'gecko') { react('love', 2600, isDaytime(clockNow()) ? 'bask' : 'tailwave', 'love'); say(pick(PET_SPECS.gecko.love)); return; }
    if (sp === 'whale') { react('love', 2600, 'hop', 'love'); say(pick(PET_SPECS.whale.love)); return; }
    if (sp === 'doodle') { react('idle', 2000, 'freeze', 'dots'); say(pick(PET_SPECS.doodle.love)); return; }
    if (sp === 'goat') { react('sad', 2200, 'rub', 'love'); say(pick(PET_SPECS.goat.love)); return; }
    react('love', 2200, sp === 'dog' ? 'cuddle' : 'love', 'love'); spawn('♥', 'heart', 2); say(pick(PET_SPECS[sp].love));
  }
  // kurt uyurken dürtülürse ısırır
  function dogBite() {
    awakeUntil = Date.now() + 20000;
    tempMood = 'poked'; tempUntil = Date.now() + 1400;
    setAnim('bite', 1100); setTimeout(() => { emote('anger', 1600, true); shakeActor(); }, 280);
    say('Uyurken dürtme.', 2200);
    setTimeout(() => { awakeUntil = 0; drawSprite(); }, 9000); // hemen geri uyur
  }
  // kısa dokunuş: her tür kendi mizacıyla tepki verir
  // Her dokunuşa tepki vermez: bir tepkiden sonra bir süre umursamaz, çoğu zaman yalnızca göz ucuyla bakar.
  let lastTapReact = 0, tapStreak = 0;
  function tap() {
    const p = P(); if (!p?.alive) return;
    const sp = p.species, now = Date.now();
    if (isSleeping() && sp === 'dog' && p.stage >= DOG_BITE_STAGE) { dogBite(); lastTapReact = now; return; }
    tapStreak = now - lastTapReact < 9000 ? tapStreak + 1 : 0;
    const ignore = now - lastTapReact < 7000 || Math.random() < (sp === 'cat' ? 0.55 : sp === 'gecko' || sp === 'owl' ? 0.5 : sp === 'plant' ? 0.6 : 0.3);
    if (ignore) {
      // ısrar edilirse ancak o zaman kısa ve sessiz bir bakış (balonsuz)
      if (tapStreak >= 3 && !isSleeping() && sp !== 'plant') { tapStreak = 0; lastTapReact = now; setAnim('look', 900); }
      return;
    }
    lastTapReact = now;
    const r = Math.random();
    if (isSleeping()) {
      if (sp === 'plant') { emote('dots', 1400); return; }
      awakeUntil = Date.now() + 45000;
      if (sp === 'cat') { react('poked', 1300, 'poked', 'anger'); facing *= -1; return; }
      react('surprised', 1400, 'shock', sp === 'chick' ? 'ask' : 'excl'); say(pick(LINES.woke)); return;
    }
    if (sp === 'chick') {
      // meraklı, habersiz: her dokunuşa sevinir ya da merakla bakar
      if (r < 0.6) { react('happy', 1000, 'hop', Math.random() < 0.5 ? 'love' : 'note'); }
      else { react('surprised', 1500, 'look', 'ask'); }
      return;
    }
    if (sp === 'plant') {
      if (r < 0.5) react('poked', 1100, 'wiggle', 'dots');
      else if (isDaytime(clockNow())) react('happy', 2400, 'photo', 'star');
      else emote('dots', 1300);
      return;
    }
    if (sp === 'cat') {
      // umursamaz, tırmalar ya da (karnı toksa) yanaşır
      if (r < 0.42) { facing *= -1; setAnim(Math.random() < 0.5 ? 'groom' : 'sit', 2400); emote('dots', 1500); if (p.roam && !reduced && mode !== 'home' && Math.random() < 0.4) setTimeout(() => walkTo(freeSpot(), baseSpeed()), 800); }
      else if (r < 0.7) { react('poked', 1200, 'poked', 'anger'); catBored = Math.max(0, catBored - 10); }
      else if (catFed(p)) { react('love', 2400, 'cuddle', 'love'); }
      else { react('hungry', 2200, 'hungry', 'fish'); }
      return;
    }
    if (sp === 'owl') {
      // gece tetikte: başını çevirip süzer; gündüz huysuz
      const night = ['night', 'evening'].includes(phase());
      if (night) react('focus', 2400, r < 0.6 ? 'headturn' : 'look', r < 0.6 ? 'dots' : 'ask');
      else react('groggy', 1800, r < 0.5 ? 'yawn' : 'headturn', 'dots');
      return;
    }
    if (sp === 'doodle') { if (r < 0.7) { setAnim('freeze', 2600); } else react('sad', 1800, 'sad', 'cloud'); return; }
    if (sp === 'whale') { if (r < 0.5) react('happy', 1800, 'hop', 'note'); else react('focus', 2000, 'look', 'dots'); return; }
    if (sp === 'goat') { if (r < 0.5) react('sad', 1600, 'look', 'dots'); else react('surprised', 1200, 'poked', 'excl'); return; }
    if (sp === 'gecko') {
      // farklı tepki verir: donar, gözünü yalar ya da dil çıkarır
      if (r < 0.4) { setAnim('freeze', 3000); emote('dots', 1400); }
      else if (r < 0.75) { react('happy', 1800, 'lick', 'ask'); }
      else react('love', 1600, 'tongue', 'love');
      return;
    }
    // köpek: hemen sevinir; bazen oyun daveti
    if (r < 0.7) { react('love', 1800, 'love', 'love'); }
    else { react('happy', 1100, 'poked', 'note'); }
  }
  $('#petHab').addEventListener('click', () => {
    const p = P(); if (!p?.alive) return;
    if (mode === 'home') { tap(); return; }
    goHome(); emote(p.species === 'cat' ? 'dots' : 'note', 1300);
  });
  $('#petNameBtn').addEventListener('click', () => openInfo());
  $('#flowBtn').addEventListener('click', () => {
    const p = P(); if (!p) return;
    p.flow = !p.flow; p.flowCount = 0; save(true);
    if (p.flow) { react('focus', 1600, 'focus', 'spark'); spawn('✦', 'spark', 2); sayNow('Flow açık! Müzik ödülleri durdu, enerjim 10 soruda bir azalır 🌊', 3600); core.toast('🌊 Flow modu açık · ödül pencereleri kapandı'); }
    else { react('happy', 1000, 'hop', 'note'); say('Güzel bir akıştı! Biraz dinlenelim mi? 😊', 2600); core.toast('Flow modu kapandı'); }
    renderPanel();
  });

  function useAbility() {
    const p = P(); if (!p?.alive) return;
    const sp = PET_SPECS[p.species], ab = sp.active;
    if (p.energy < ab.cost) { react('groggy', 1400, 'yawn', 'dots'); sayNow('Enerjim yetmiyor… biraz dinlenmem lazım 😪'); return; }
    if (isSleeping()) awakeUntil = Date.now() + 60000;
    const t = quiz.petTarget();
    if (!t) { core.toast('Yetenekler pop quiz kartındaki cevaplanmamış sorularda çalışır.'); emote('ask', 1600, true); sayNow('Bir soru açalım, sonra yardım ederim 🤓', 2400); return; }
    // kedi: önce lazer avı, soru avın sonunda atlanır
    if (ab.id === 'skip') {
      if (abilityBusy) return;
      abilityBusy = true;
      p.energy = Math.max(0, p.energy - ab.cost); save(true); renderPanel();
      laserChase(() => {
        abilityBusy = false;
        const q = P(); if (!q) return;
        if (quiz.skip()) { sayNow('Yakaladım! Bu soruyu sonraya sakladım 🐾', 3200); spawn('✦', 'spark', 3); }
        else { q.energy = Math.min(maxes(q).energy, q.energy + ab.cost); save(true); emote('ask', 1500, true); sayNow('Soru değişti, enerjini geri verdim 🤔', 2400); }
        renderPanel();
      });
      return;
    }
    let ok = false, msg = '';
    if (ab.id === 'weed') {
      if (t.style === 'type') { ok = quiz.freeHint(); msg = 'Bir harfi senin için açtım 🌱'; }
      else { const n = quiz.eliminate(2); ok = n > 0; msg = `${n} yanlış şıkkı ayıkladım 🌿`; }
    } else if (ab.id === 'peek') {
      const h = quiz.answerHint(); if (h) { ok = true; msg = `Cik! “${h.first.toLocaleUpperCase('tr')}” ile başlıyor · ${h.letters} ${/\d/.test(h.text) ? 'karakter' : 'harf'}${h.words > 1 ? ` · ${h.words} kelime` : ''} 🐣`; }
    } else if (ab.id === 'ward') {
      p.ward = 4; ok = true; msg = 'Dört tur öndeyim. Sonraki 4 soruda yanlışların yarı acıtır.';
    } else if (ab.id === 'prey') {
      if (p.prey) { emote('dots', 1400, true); sayNow('Zaten bekliyorum.', 1800); return; }
      p.prey = true; ok = true; msg = 'Kıpırdamıyorum. Sonraki doğru cevap ×2 XP.';
    } else if (ab.id === 'dive') {
      if (quiz.skip()) { ok = true; msg = 'Derine daldım. Bu soru sonraya kaldı.'; }
    } else if (ab.id === 'replay') {
      p.shieldFor = t.item.id; ok = true; msg = 'Bu oyunu biliyorum. Bu soruda yanlışın can götürmez.';
    } else if (ab.id === 'mirror') {
      const h = quiz.answerHint(); if (h) { ok = true; const tx = String(h.text || ''); msg = `Ayna: “${h.first.toLocaleUpperCase('tr')}…${tx.slice(-1).toLocaleUpperCase('tr')}” · ${h.letters} ${/\d/.test(tx) ? 'karakter' : 'harf'}${h.words > 1 ? ` · ${h.words} kelime` : ''}`; }
    } else if (ab.id === 'sniff') {
      const n = t.style === 'type' ? 0 : quiz.eliminate(1); p.shieldFor = t.item.id; ok = true;
      msg = n ? 'Kazdım, kokladım: bir şık yanlış! Bu soruda seni koruyorum 🛡️' : 'Bu soruda seni koruyorum, yanlışta canım gitmez 🛡️';
    }
    if (!ok) { emote('ask', 1500, true); sayNow('Şu an bunu yapamam 🤔', 2000); return; }
    p.energy = Math.max(0, p.energy - ab.cost); save(true);
    // her türün kendi yetenek animasyonu; mesaj animasyonun doruğunda gelir
    if (ab.id === 'sniff') { tempMood = 'focus'; tempUntil = Date.now() + 2200; setAnim('dig', 3400); setTimeout(() => { emote('shield', 1800, true); spawn('✦', 'spark', 2); sayNow(msg, 4200); }, 2300); }
    else { setAnim('ability', 2600); setTimeout(() => { emote('idea', 1500, true); spawn('✦', 'spark', 3); sayNow(msg, 4400); }, 1100); }
    renderPanel();
  }

  function cardSpot(dx = 0.5) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const card = document.querySelector('.quiz-card')?.getBoundingClientRect();
    if (!card || !card.width || card.top < 60 || card.top > vh - 60) return null;
    return { x: clamp(card.left + card.width * dx - W / 2, 8, vw - W - 8), y: clamp(card.top - H + 14, 70, vh - H - 10) + SY() };
  }
  const guardSpot = () => cardSpot(0.82);
  // kedinin olay çıkarması: kartın kenarına gider, fincanı düşürür, umursamaz; sonra sokulur
  function catMischief() {
    const p = P(); catBored = 0; mischiefAt = Date.now() + 90000;
    const act = () => { setAnim('knock', 2400); setTimeout(() => emote('dots', 1600), 1300); };
    const spot = p.roam && !reduced ? cardSpot(0.25) : null;
    if (spot) { if (mode === 'home') { const a = homeAnchor(); pos.x = a.x; pos.y = a.y; mode = 'roam'; } walkTo(spot, baseSpeed() * 1.2, act); }
    else act();
    setTimeout(() => { const q = P(); if (q?.alive && !isSleeping()) react('love', 2600, 'cuddle', 'love'); }, 9000 + Math.random() * 6000);
  }

  // kedinin lazer avı: nokta ekranda birkaç yere sıçrar, kedi koşarak izler, sonda üstüne atlar
  let abilityBusy = false;
  function laserChase(done) {
    const p = P();
    const pounce = () => { setAnim('pounce', 2200); setTimeout(done, 1650); };
    if (!p.roam || reduced || !visible) { pounce(); return; }
    const dot = document.createElement('div'); dot.className = 'pet-laser'; layerEl.appendChild(dot);
    if (mode === 'home') { const a = homeAnchor(); pos.x = a.x; pos.y = a.y; mode = 'roam'; }
    const vw = window.innerWidth, vh = window.innerHeight;
    const card = document.querySelector('.quiz-card')?.getBoundingClientRect();
    const end = card && card.width && card.top > 60 && card.top < vh - 60
      ? { x: clamp(card.left + card.width * 0.5 - W / 2, 8, vw - W - 8), y: clamp(card.top - H + 14, 70, vh - H - 10) + SY() } : freeSpot();
    const pts = [freeSpot(), freeSpot(), end];
    let i = 0, ended = false;
    const place = (q, ms) => {
      const dir = q.x >= pos.x ? 1 : -1;
      dot.style.transition = ms ? `transform ${ms}ms cubic-bezier(.3,.8,.3,1)` : 'none';
      dot.style.transform = `translate(${(q.x + W / 2 + dir * 20).toFixed(1)}px, ${(q.y + H - 5).toFixed(1)}px)`;
    };
    const finish = () => { if (ended) return; ended = true; clearTimeout(guard); dot.remove(); pounce(); };
    const guard = setTimeout(finish, 9000);
    place({ x: pos.x + facing * 50, y: pos.y }, 0);
    const next = () => {
      if (ended) return;
      if (!P()) { ended = true; clearTimeout(guard); dot.remove(); return; }
      if (i >= pts.length) { finish(); return; }
      const q = pts[i++]; place(q, 380);
      setTimeout(() => walkTo({ x: q.x, y: q.y }, 320, () => setTimeout(next, i >= pts.length ? 0 : 160)), 240);
    };
    tempMood = 'focus'; tempUntil = Date.now() + 6000;
    emote('excl', 1100); setTimeout(next, 350);
  }

  // ---------- cevaplar ----------
  window.addEventListener('dl:answer', e => onAnswer(e.detail || {}));
  function onAnswer(d) {
    const p = P(); if (!p) return;
    tick();
    const gains = checkLevels();
    if (!p.alive) return;
    const mx = maxes(p), sp = PET_SPECS[p.species], now = clockNow();
    p.answers++;
    const warded = p.species === 'owl' && p.ward > 0;
    // enerji
    const photo = p.species === 'plant' && isDaytime(now) ? 0.5 : 1;
    if (p.flow) { p.flowCount++; if (p.flowCount % 10 === 0) { p.energy = Math.max(0, p.energy - 5 * photo); spawn('✦', 'spark', 1); } }
    else p.energy = Math.max(0, p.energy - 2 * photo);
    const ph = phase();
    if (ph === 'dawn') awakeUntil = Date.now() + 30 * 60000;
    const asleep = isSleeping();
    if (d.right) {
      p.correct++; p.streak++; wrongRun = 0;
      if (p.species === 'plant') p.vig = clamp((p.vig ?? 0.8) + 0.012, 0, 1);
      if (p.species === 'cat' && p.streak >= 3) catBored += 7; // iyi giden aynı şeyden bile sıkılır
      const feed = 7;
      if (p.food + feed > mx.food) p.stuffed = clamp(p.stuffed + 9, 0, 100);
      p.food = clamp(p.food + feed, 0, mx.food);
      if (p.food > mx.food * 0.3) p.hp = clamp(p.hp + 2, 0, mx.hp);
      if (p.species === 'dog' && p.streak % 5 === 0) { p.hp = clamp(p.hp + 10, 0, mx.hp); setTimeout(() => { emote('love', 1600); sayNow('Sadık dost: +10 can 🐶'); }, 1300); }
      if (p.shieldFor === d.id) p.shieldFor = null;
      if (asleep) { spawn('z', 'zz', 1); emote('zz', 1600); if (Math.random() < 0.25) say('Zzz… aferin… zzz', 1800); }
      else {
        react('eat', 1000, 'eat', 'food');
        if (p.species === 'plant') spawn('•', 'rain', 4); else spawn('•', 'crumb', 3);
        const big = p.streak >= 3;
        setTimeout(() => { react('happy', big ? 1500 : 1100, big ? 'dance' : 'joy', p.streak >= 5 ? 'fire' : big ? 'star' : 'note'); spawn('✦', 'spark', big ? 4 : 2); }, 1050);
        if ([3, 5, 10, 20].includes(p.streak)) setTimeout(() => say({ 3: 'Seri başladı! 🔥', 5: '5’te 5! Harikasın! 🤩', 10: 'On doğru üst üste! Efsanesin 🏆', 20: 'Yirmi! Ben bile şaşırdım 😮' }[p.streak], 2600), 900);
        else if (p.stuffed >= 50 && Math.random() < 0.3) setTimeout(() => say(pick(LINES.full)), 1200);
      }
    } else {
      p.streak = 0;
      let dmg = d.kind === 'legacy-miss' ? 5 : d.kind === 'legacy-fail' ? 8 : 14;
      if (p.species === 'owl' && p.ward > 0) dmg = Math.ceil(dmg / 2);
      if (p.species === 'gecko') { const h = now.getHours(); if (h >= 10 && h < 17) dmg = Math.ceil(dmg * 0.7); }
      if (p.species === 'whale') dmg = Math.ceil(dmg * 0.85);
      if (p.species === 'doodle') dmg = Math.ceil(dmg * 0.8);
      if (p.species === 'goat') { dmg = Math.ceil(dmg * 1.25); p.mirrorBonus = true; }
      if (p.shieldFor && p.shieldFor === d.id) { dmg = 0; p.shieldFor = null; react('focus', 1300, 'hop', 'shield'); spawn('✦', 'spark', 1); sayNow('Seni korudum! 🛡️ Açıklamaya bakalım.', 2600); }
      if (dmg > 0) {
        if (p.hp - dmg <= 0 && p.species === 'cat' && p.nineLivesDay !== todayKey()) {
          p.hp = 1; p.nineLivesDay = todayKey(); react('surprised', 1500, 'shock', 'excl'); sayNow('Dokuz candan birini kullandım! 😼 Dikkat!', 3600);
        } else {
          p.hp = Math.max(0, p.hp - dmg);
          if (p.hp <= 0) { die(d.cat); save(true); renderPanel(); return; }
          if (asleep) { spawn('•', 'tear', 1); emote('tear', 1400); }
          else {
            wrongRun++;
            const low = p.hp < mx.hp * 0.3;
            if (p.species === 'chick' && !low) {
              // habersiz: ne olduğunu tam anlamaz, merakla bakar
              react('surprised', 1600, 'look', 'ask');
            } else if (p.species === 'gecko' && !low) {
              // artı eksi yoktur: hafifçe donar, devam eder
              react('idle', 1800, 'freeze', 'dots');
            } else if (p.species === 'plant') {
              // sızlanmaz; sessizce biraz eğilir ve dayanır
              p.vig = clamp((p.vig ?? 0.8) - 0.02, 0, 1);
              react('sad', 1800, 'sad', 'dots');
            } else {
              react('sad', 700, 'flinch', low ? 'cloud' : 'tear'); spawn('•', 'tear', 1);
              setTimeout(() => { const q = P(); if (q?.alive) { const lw = q.hp < maxes(q).hp * 0.3; react('sad', lw ? 3000 : 1600, lw && q.species !== 'cat' ? 'cry' : 'sad'); } }, 720);
            }
            // köpek: sen düşünce dümeni alır — bir süre soru kartının başında nöbet tutar
            if (p.species === 'dog' && (wrongRun >= 2 || low)) { guardUntil = Date.now() + 45000; setTimeout(() => { if (P()?.alive) { emote('shield', 1800); nextThink = 0; } }, 1500); }
            if (low && Math.random() < 0.5) setTimeout(() => say(pick(LINES.low), 2600), 700);
          }
        }
      }
    }
    if (warded) { p.ward = Math.max(0, p.ward - 1); if (!p.ward) setTimeout(() => emote('dots', 1400), 1600); }
    if (gains) setTimeout(() => react('happy', 1200, 'joy', 'star'), 300);
    save(true); renderPanel();
  }

  // ---------- evrim gösterisi ----------
  function runEvoQueue() {
    if (evolving || !evoQueue.length) return;
    if (deathPending) return;
    const ev = evoQueue.shift(), p = P(); if (!p) { evoQueue.length = 0; return; }
    if (ev.type === 'lore') { showLore(ev.idx); return; }
    evolving = true;
    const oldEl = $('#evoOld'), newEl = $('#evoNew'), title = $('#evoTitle'), sub = $('#evoSub'), ok = $('#evoOk');
    evoEl.classList.remove('done', 'flashing', 'star', 'shiny'); ok.disabled = true;
    if (ev.type === 'star') {
      evoEl.classList.add('star', 'done');
      oldEl.innerHTML = ''; newEl.innerHTML = petSVG(p.species, p.stage, { mood: 'happy', coat: p.coat, shiny: p.shiny });
      title.textContent = `⭐ ${p.name} bir yıldız kazandı!`;
      sub.textContent = `Son formuna ulaştı; her yeni seviye bir yıldız ekler. Toplam: ${ev.stars} ⭐`;
      evoEl.classList.add('show'); sparkBurst(); ok.disabled = false; return;
    }
    const fromName = stageName(p.species, ev.from), toName = stageName(p.species, ev.to);
    oldEl.innerHTML = petSVG(p.species, ev.from, { mood: 'surprised', coat: p.coat, shiny: p.shiny && !ev.shiny });
    newEl.innerHTML = petSVG(p.species, ev.to, { mood: 'happy', coat: p.coat, shiny: p.shiny });
    title.textContent = 'Bir şeyler oluyor…'; sub.textContent = `${p.name} parlıyor!`;
    evoEl.classList.add('show', 'flicker');
    oldEl.classList.add('on'); newEl.classList.remove('on');
    const steps = reduced ? [] : [420, 380, 330, 290, 250, 210, 180, 150, 130, 110, 95, 85, 75, 65, 60, 55, 50];
    let i = 0;
    const flick = () => {
      if (i < steps.length) { const showNew = i % 2 === 0; oldEl.classList.toggle('on', !showNew); newEl.classList.toggle('on', showNew); setTimeout(flick, steps[i++]); return; }
      evoEl.classList.add('flashing');
      setTimeout(() => {
        evoEl.classList.remove('flicker'); oldEl.classList.remove('on'); newEl.classList.add('on'); evoEl.classList.add('done');
        title.textContent = `${p.name} evrimleşti!`;
        const R = ROLES[ev.role || p.role];
        sub.innerHTML = `${esc(fromName)} → ${esc(toName)}. Can, ${esc(PET_SPECS[p.species].foodLabel.toLocaleLowerCase('tr'))} ve enerji sınırları büyüdü.<br><b>Yeni rolü: ${R.icon} ${esc(R.name)}</b>${ev.shiny ? `<br><b class="evo-shiny">✨ Nadir form! ${esc(SHINY.name[p.species])} oldu: ${esc(SHINY.perks.join(' · '))}</b>` : ''}`;
        if (ev.shiny) evoEl.classList.add('shiny');
        sparkBurst(); ok.disabled = false; ok.focus({ preventScroll: true });
        drawSprite(true); renderPanel();
      }, 380);
    };
    setTimeout(flick, 700);
  }
  function sparkBurst() {
    const box = $('#evoSparks'); box.innerHTML = '';
    for (let k = 0; k < 18; k++) {
      const s = document.createElement('i'); const a = (k / 18) * Math.PI * 2;
      s.style.setProperty('--tx', `${Math.cos(a) * (90 + Math.random() * 40)}px`); s.style.setProperty('--ty', `${Math.sin(a) * (90 + Math.random() * 40)}px`);
      s.textContent = ['✨', '⭐', '💫'][k % 3]; box.appendChild(s);
    }
  }
  $('#evoOk').addEventListener('click', () => {
    evoEl.classList.remove('show', 'done', 'flashing', 'flicker', 'star'); evolving = false;
    react('happy', 1500, 'dance', 'star'); spawn('✦', 'spark', 3);
    if (evoQueue.length) setTimeout(runEvoQueue, 300);
    renderPanel();
  });

  // ---------- savaş ve evrim kapısındaki boss ----------
  // savaş modülü ilk kullanımda yüklenir (ayrı parça)
  let battleMod = null;
  async function getBattle() {
    if (!battleMod) {
      const m = await import('./battle/ui.js');
      battleMod = m.initBattleUI({ core, petSVG, getPet: P, onChange: (ev) => { if (ev === 'battle-end') { renderPanel(); publishCard(); } } });
      battleMod.monsters = m.monsterApi;
    }
    return battleMod;
  }
  setTimeout(() => import('./battle/ui.js').catch(() => {}), 9000); // çevrimdışı da açılabilsin diye önceden önbelleğe al
  const battle = { openArena: () => getBattle().then(b => b.openArena()), boss: st => getBattle().then(b => b.boss(st)) };
  // arena kartı: arkadaşlar petini ödünç alabilsin, oyuncular meydan okuyabilsin
  function publishCard() {
    if (!core.arena?.ready?.()) return;
    const p = P();
    core.arena.publish(p && p.alive ? { species: p.species, stage: p.stage, stars: p.stars | 0, role: p.role, shiny: !!p.shiny, coat: p.coat | 0, name: p.name, wins: A().battle?.wins | 0 } : null);
  }
  setTimeout(publishCard, 6000); setInterval(publishCard, 120000);
  $('#arenaBtn').addEventListener('click', e => { e.stopPropagation(); const p = P(); if (p?.bossPending && !p.bossNeedQ) bossPrompt(true); else battle.openArena(); });
  const bossEl = layer('petBoss', 'bossgate', `<div class="pet-modal boss-card"><div class="eyebrow">EVRİM KAPISI</div><div class="boss-art" id="bossArt"></div><h2 id="bossTitle"></h2><p id="bossLead"></p><div class="pc-row"><button class="secondarybtn" id="bossLater">Şimdi değil</button><button class="primarybtn" id="bossGo">⚔️ Meydan oku</button></div></div>`);
  let bossBusy = false;
  function bossPrompt(force = false) {
    const p = P(); if (!p || !p.alive || !p.bossPending || bossBusy) return;
    if (p.bossNeedQ) { if (force) core.toast('Önce bir soruyu doğru cevapla, sonra boss’a yeniden meydan okuyabilirsin.'); return; }
    if (evolving || deathPending || document.querySelector('.pet-overlay.show, .overlay.show, .bt-overlay.show')) { if (!force) return setTimeout(() => bossPrompt(), 4000); }
    const stageTo = Math.min(6, p.stage + 1), id = ['bossSayfa', 'bossSaat', 'bossSinav', 'bossGolge', 'bossBilinmez', 'bossSonsuz'][Math.min(5, stageTo - 1)];
    getBattle().then(b => { $('#bossArt').innerHTML = b.monsters.svg(id); $('#bossTitle').textContent = `${b.monsters.name(id)} yolunu kesti!`; });
    $('#bossTitle').textContent = 'Bir boss yolunu kesti!';
    $('#bossLead').textContent = `${p.name} seviye atladı; evrimleşmek için bu bossu yenmesi gerekiyor. ${p.stage < 3 ? 'Kaybedersen bir soruyu doğru cevaplayıp yeniden deneyebilirsin.' : 'Dikkat: bu evrede kaybedersen kazandığın seviyenin XP’si sıfırlanır.'} Takımını Arena’dan kurabilirsin.`;
    bossEl.classList.add('show');
  }
  $('#bossLater').addEventListener('click', () => { bossEl.classList.remove('show'); core.toast('Boss bekliyor: ⚔️ Arena düğmesinden meydan okuyabilirsin.'); });
  $('#bossGo').addEventListener('click', async () => {
    bossEl.classList.remove('show');
    const p = P(); if (!p) return;
    bossBusy = true;
    const r = await battle.boss(Math.min(6, p.stage + 1));
    bossBusy = false;
    const q = P(); if (!q) return;
    if (r === 'win') {
      const n = q.bossPending | 0; q.bossPending = 0; q.bossKeys = []; q.bossNeedQ = false;
      evolveBy(n);
    } else if (q.stage < 3) {
      q.bossNeedQ = true; save(true); renderPanel();
      sayNow('Bir soru daha bilelim, sonra tekrar deneriz.', 4200);
    } else {
      // yüksek evrede yenilgi: kazanılan seviyenin XP'si sıfırlanır
      const app = A();
      for (const { k, v } of q.bossKeys || []) {
        if (k === 'en') app.xp = Math.min(app.xp, core.thresholdFor ? core.thresholdFor(Math.max(0, v - 1)) : core.levelStartXp());
        else if (app.quiz?.catXp) app.quiz.catXp[k] = Math.min(app.quiz.catXp[k] || 0, Math.max(0, v - 1) * CAT_XP_STEP);
        if (app.petLevels) app.petLevels[k] = Math.max(0, v - 1);
      }
      q.bossPending = 0; q.bossKeys = []; q.bossNeedQ = false;
      save(true); core.renderProgress(); quiz.renderAll(); renderPanel();
      core.toast('Boss kazandı: bu seviyenin XP’si sıfırlandı. Yeniden kazanınca boss tekrar gelir.');
    }
  });
  window.addEventListener('dl:answer', e => {
    const p = P(); if (!p || !p.bossNeedQ || !e.detail?.right) return;
    p.bossNeedQ = false; save(true); renderPanel();
    setTimeout(() => { sayNow('Hazırız. Boss’a yeniden meydan okuyalım mı?', 3600); bossPrompt(); }, 1200);
  });

  // ---------- günlük: petin ruh yazısından tek seferlik parçalar ----------
  function showLore(idx) {
    const p = P(); if (!p) return;
    const parts = loreParts(PET_SPECS[p.species].soul); if (!parts[idx]) { if (evoQueue.length) setTimeout(runEvoQueue, 200); return; }
    evolving = true;
    $('#loreEye').textContent = `${p.name.toLocaleUpperCase('tr')} · GÜNLÜK ${idx + 1}`;
    $('#loreArt').innerHTML = petSVG(p.species, p.stage, { mood: 'idle', coat: p.coat, shiny: p.shiny });
    $('#loreText').textContent = parts[idx];
    $('#loreCount').textContent = `${Math.min(parts.length, p.lore.length + 1)} / ${parts.length} parça açıldı · Ansiklopedide yeniden okuyabilirsin`;
    loreEl.classList.add('show');
    loreEl.dataset.idx = idx;
  }
  $('#loreOk').addEventListener('click', () => {
    const p = P(), idx = +loreEl.dataset.idx;
    if (p && !p.lore.includes(idx)) {
      p.lore.push(idx);
      const app = A(); app.petLoreSeen = app.petLoreSeen || {}; const arr = app.petLoreSeen[p.species] = app.petLoreSeen[p.species] || [];
      if (!arr.includes(idx)) arr.push(idx);
      save(true);
    }
    loreEl.classList.remove('show'); evolving = false;
    if (evoQueue.length) setTimeout(runEvoQueue, 300);
  });

  // ---------- ansiklopedi ----------
  let cxTab = null;
  function openCodex(tab) {
    const own = A().pet?.species;
    cxTab = tab || cxTab || own || ORDER[0];
    $('#cxTabs').innerHTML = [...ORDER.map(id => `<button data-cx="${id}" class="${id === cxTab ? 'on' : ''}" aria-label="${esc(PET_SPECS[id].name)}">${petSVG(id, 0, { mood: 'idle' })}</button>`), `<button data-cx="types" class="cx-txt ${cxTab === 'types' ? 'on' : ''}">Tipler</button>`, `<button data-cx="roles" class="cx-txt ${cxTab === 'roles' ? 'on' : ''}">Roller</button>`].join('');
    $('#cxBody').innerHTML = cxTab === 'types' ? codexTypes() : cxTab === 'roles' ? codexRoles() : codexPet(cxTab);
    document.querySelector('#settingsOverlay.show') && document.querySelector('#closeSettings')?.click();
    codexEl.classList.add('show');
  }
  const typeChip = t => `<span class="cx-type" style="--tc:${TYPES[t].color}">${TYPES[t].icon} ${esc(TYPES[t].name)}</span>`;
  function codexPet(id) {
    const s = PET_SPECS[id], app = A(), mine = app.pet && app.pet.species === id ? app.pet : null;
    const t = SPECIES_TYPE[id], sig = SIGNATURE[id];
    const seen = new Set([...(mine ? mine.lore : []), ...((app.petLoreSeen || {})[id] || [])]);
    const parts = loreParts(s.soul);
    const maxStage = Math.max(mine ? mine.stage : -1, ...(app.petMemorial || []).filter(m => m.species === id).map(m => m.stage | 0), -1);
    const st = (role) => { const b = battleStats(id, mine ? mine.stage : 0, mine ? mine.stars : 0, role, !!mine?.shiny); return `❤️ ${b.hp} · ⚔️ ${b.atk} · 🛡️ ${b.def} · 💨 ${b.spd}`; };
    return `${petDetailHTML(id, mine ? mine.stage : 0, mine ? { coat: mine.coat, shiny: mine.shiny } : {})}
      <div class="cx-sec"><h4>Tip</h4><p>${typeChip(t)} → ${typeChip(BEATS[t])} karşısında güçlü, ${typeChip(Object.keys(BEATS).find(k => BEATS[k] === t))} karşısında zayıf.</p></div>
      <div class="cx-sec"><h4>İmza hamlesi (savaş)</h4><p><b>${esc(sig.name)}</b> · ${esc(sig.desc)}</p></div>
      ${mine ? `<div class="cx-sec"><h4>Senin ${esc(mine.name)}</h4><p>Rol: <b>${ROLES[mine.role].icon} ${esc(ROLES[mine.role].name)}</b> (her evrimde değişir)${mine.shiny ? ` · <b class="evo-shiny">✨ ${esc(SHINY.name[id])}</b>` : ''}<br>Savaş değerleri: ${st(mine.role)}</p></div>` : `<div class="cx-sec"><h4>Savaş değerleri (ilk evre, yakın dövüşçü)</h4><p>${st('melee')}</p></div>`}
      <div class="cx-sec"><h4>Evreler</h4><div class="cx-stages">${[0, 1, 2, 3, 4, 5].map(k => `<div class="${k <= maxStage ? '' : 'locked'}">${k <= maxStage ? petSVG(id, k, { coat: mine?.coat, shiny: mine?.shiny }) : '<span>?</span>'}<small>${k <= maxStage ? esc(stageName(id, k)) : '???'}</small></div>`).join('')}</div></div>
      <div class="cx-sec"><h4>Günlük</h4>${parts.map((x, k) => seen.has(k) ? `<p class="cx-lore">“${esc(x)}”</p>` : `<p class="cx-lore locked">🔒 Bu parça bir evrimde açılır.</p>`).join('')}</div>
      <div class="cx-sec"><h4>Nadir form</h4><p>${esc(SHINY.name[id])}: her evrimde küçük bir şansla gelir. ${esc(SHINY.perks.join(' · '))}.</p></div>`;
  }
  function codexTypes() {
    return `<div class="cx-sec"><p>Her tip birini yener, birine yenilir; diğerlerine nötrdür. Güçlü vuruş ×1,5, zayıf vuruş ×0,67.</p>
      ${Object.keys(BEATS).map(t => `<p>${typeChip(t)} ➜ ${typeChip(BEATS[t])}</p>`).join('')}
      <h4>Petlerin tipleri</h4><p>${ORDER.map(id => `${esc(PET_SPECS[id].name)} ${TYPES[SPECIES_TYPE[id]].icon}`).join(' · ')}</p></div>`;
  }
  function codexRoles() {
    return `<div class="cx-sec"><p>Rol, pet ilk sahiplenildiğinde ve her evrimde rastgele belirlenir.</p>${Object.values(ROLES).map(r => `<div class="cx-role"><h4>${r.icon} ${esc(r.name)}</h4><p>${esc(r.desc)}</p><ul>${r.moves.map(m => `<li><b>${esc(m.name)}</b> ${esc(m.desc)}</li>`).join('')}</ul></div>`).join('')}</div>`;
  }
  $('#cxTabs').addEventListener('click', e => { const b = e.target.closest('[data-cx]'); if (b) openCodex(b.dataset.cx); });
  $('#cxClose').addEventListener('click', () => codexEl.classList.remove('show'));
  codexEl.addEventListener('click', e => { if (e.target === codexEl) codexEl.classList.remove('show'); });

  // ---------- kendi bakışından ipucu balonları ----------
  let hintCool = 3, hintFor = null;
  function petHint(force = false) {
    const p = P(); if (!p || !p.alive || isSleeping() || actorEl.classList.contains('hidden')) return false;
    const h = quiz.answerHint?.(); if (!h || hintFor === h.text) return false;
    const voices = HINT_VOICE[p.species] || []; const cands = voices.map(f => { try { return f(h); } catch { return null; } }).filter(Boolean);
    if (!cands.length) return false;
    hintFor = h.text; hintCool = 5 + Math.floor(Math.random() * 4);
    react('focus', 1200, 'look', 'idea');
    sayNow(pick(cands), 5200);
    return true;
  }
  window.addEventListener('dl:answer', e => { if (e.detail && !e.detail.right && P() && hintCool <= 3) setTimeout(() => { if (Math.random() < 0.45) petHint(); }, 1700); });
  window.addEventListener('dl:question', () => {
    if (!P()) return;
    hintCool--;
    if (hintCool <= 0 && Math.random() < 0.35) setTimeout(() => petHint(), 1400);
  });

  // ---------- ölüm ----------
  function die(cat) {
    const p = P();
    p.alive = false; p.hp = 0; p.flow = false; p.death = { cat: cat || 'en', at: Date.now() };
    deathPending = true; evoQueue.length = 0;
    tempMood = null; setAnim('dead', 99999); drawSprite(true); emote('cloud', 1400, true);
    setTimeout(openDeath, 1500);
  }
  function catLevelText(cat) {
    if (cat === 'en') { const i = core.levelIndex(); return core.LEVELS[i]; }
    return `Sv ${Math.floor((quiz.catXp(cat) || 0) / CAT_XP_STEP) + 1}`;
  }
  function openDeath() {
    const p = P(); if (!p || p.alive) { deathPending = false; return; }
    const cat = p.death?.cat || 'en', label = catLabel(cat), lv = catLevelText(cat);
    $('#deathPet').innerHTML = petSVG(p.species, p.stage, { mood: 'dead', pose: 'flat', coat: p.coat, shiny: p.shiny });
    $('#deathTitle').textContent = `${p.name} öldü…`;
    $('#deathLead').textContent = `Canı ${label} sorusunda tükendi. Ona ne olsun istersin?`;
    $('#reviveTxt').innerHTML = `${esc(label)} seviyen sıfırlanır (${esc(lv)} → ${cat === 'en' ? 'A1' : 'Sv 1'}). Telafi: eski XP’ne (${catXpOf(cat)} XP) ulaşana kadar bu konuda <b>2× XP</b>. ${esc(p.name)} aynı formuyla geri döner.`;
    $('#newTxt').innerHTML = `${esc(p.name)} anı köşesine uğurlanır; yeni bir pet seçip baştan beslersin. ${esc(label)} seviyen <b>düşmez</b>, yalnızca bu seviyedeki XP çubuğu sıfırlanır.`;
    deathEl.classList.add('show');
  }
  $('#petRevive').addEventListener('click', () => {
    const app = A(), p = P(); if (!p) return;
    const cat = p.death?.cat || 'en';
    const oldXp = catXpOf(cat);
    if (cat === 'en') { const oldFloor = Number.isInteger(app.levelFloor) ? app.levelFloor : null; app.xp = 0; app.levelFloor = 0; if (oldXp > 0) app.petCatchUp.en = { target: oldXp, floor: oldFloor }; }
    else { app.quiz.catXp[cat] = 0; if (oldXp > 0) app.petCatchUp[cat] = { target: oldXp }; }
    const mx = maxes(p);
    p.alive = true; p.hp = Math.round(mx.hp * 0.5); p.food = Math.max(p.food, mx.food * 0.4); p.energy = Math.max(p.energy, mx.energy * 0.4); p.death = null; p.revives = (p.revives || 0) + 1;
    // seviye anlık görüntüsünü düşür: tekrar tırmanırken evrim sayılmasın (en yüksek değer korunur)
    deathPending = false; deathEl.classList.remove('show');
    tempMood = null; animCls = ''; sprite.className = 'pet-sprite a-idle'; drawSprite(true);
    save(true); core.renderProgress(); quiz.renderAll(); renderPanel();
    react('happy', 1600, 'joy', 'love'); spawn('✦', 'spark', 4);
    setTimeout(() => sayNow('Geri döndüm! Bu sefer daha dikkatli olalım 💪', 3600), 400);
    core.toast(`💫 ${p.name} canlandı · ${catLabel(cat)} sıfırlandı · telafi 2× XP`);
  });
  $('#petNew').addEventListener('click', () => {
    const app = A(), p = P(); if (!p) return;
    const cat = p.death?.cat || 'en';
    if (cat === 'en') app.xp = core.levelStartXp();
    else app.quiz.catXp[cat] = Math.floor((app.quiz.catXp[cat] || 0) / CAT_XP_STEP) * CAT_XP_STEP;
    app.petMemorial = [...(app.petMemorial || []), { name: p.name, species: p.species, stage: p.stage, stars: p.stars, at: Date.now() }].slice(-12);
    app.pet = null; deathPending = false; deathEl.classList.remove('show');
    save(true); core.renderProgress(); quiz.renderAll(); renderPanel();
    openChooser(true);
  });

  // ---------- pet seçimi ----------
  let chosen = null;
  // seçim ekranı ve ansiklopedi için tek pet kartı
  function petDetailHTML(id, stage = 0, art = {}) {
    const s = PET_SPECS[id];
    const bar = (label, icon, v, c) => `<div class="pcd-bar"><span>${icon}</span><span class="pcb"><i style="width:${Math.round(v / 140 * 100)}%;background:${c}"></i></span><em>${v}</em></div>`;
    return `<div class="pcd"><div class="pcd-art">${petSVG(id, stage, { mood: 'happy', ...art })}</div><div class="pcd-main"><h3>${esc(s.name)} <small>${esc(PET_SPECIES[id].label)}</small></h3>
      ${bar('Can', '❤️', s.hp, '#E5534B')}${bar(s.foodLabel, s.foodIcon, s.food, id === 'plant' ? '#7FA7BF' : '#F0A04B')}${bar('Enerji', '⚡', s.energy, '#E9C23C')}</div></div>
      <p class="pc-soul">${esc(s.soul.split('. ').slice(0, 2).join('. ').replace(/\.?$/, '.'))}</p>
      <div class="pc-skill"><b>${esc(s.passive.name)}</b> ${esc(s.passive.desc)}</div><div class="pc-skill act"><b>✨ ${esc(s.active.name)} · ${s.active.cost}⚡</b> ${esc(s.active.desc)}</div>`;
  }
  function openChooser(afterDeath = false) {
    $('#pcTitle').textContent = afterDeath ? 'Yeni bir arkadaş seç' : 'Bir pet seç';
    $('#pcLead').textContent = afterDeath ? 'Yeni petin sıfırdan başlar ve her seviye atladığında evrimleşir.' : 'Her biri bir hâli taşır. Doğru cevaplar onu besler, yanlışlar canını yakar; her seviyede evrimleşir.';
    $('#pcGrid').innerHTML = ORDER.map(id => {
      const s = PET_SPECS[id];
      return `<button class="pc-card" data-sp="${id}" aria-label="${esc(s.name)}, ${esc(PET_SPECIES[id].label)}"><div class="pc-art">${petSVG(id, 0, { mood: 'happy' })}</div><strong>${esc(s.name)}</strong><small>${esc(PET_SPECIES[id].label)}</small></button>`;
    }).join('');
    $('#pcDetail').innerHTML = '<p class="pc-hint">Ayrıntılarını görmek için bir pete dokun.</p>';
    $('#pcNameBox').classList.add('hidden'); chosen = null;
    chooser.classList.add('show');
  }
  $('#pcGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-sp]'); if (!b) return;
    chosen = b.dataset.sp;
    [...$('#pcGrid').children].forEach(x => x.classList.toggle('sel', x === b));
    $('#pcDetail').innerHTML = petDetailHTML(chosen);
    $('#pcName').value = PET_SPECS[chosen].name; $('#pcNameBox').classList.remove('hidden');
    $('#pcAdopt').textContent = `${PET_SPECS[chosen].name}’i sahiplen 🐾`;
    $('#pcDetail').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
  $('#pcName').addEventListener('input', () => { if (chosen) $('#pcAdopt').textContent = `${$('#pcName').value.trim() || PET_SPECS[chosen].name}’i sahiplen 🐾`; });
  $('#pcAdopt').addEventListener('click', () => {
    if (!chosen) return;
    const app = A(), now = Date.now();
    const p = { v: 1, species: chosen, name: ($('#pcName').value.trim() || PET_SPECS[chosen].name).slice(0, 16), stage: 0, stars: 0, hp: 0, food: 0, energy: 0, stuffed: 0, alive: true, born: now, lastTick: now, lastSeen: now, flow: false, flowCount: 0, answers: 0, correct: 0, streak: 0, roam: true, notify: true };
    if (QUAD.includes(chosen)) p.coat = randomCoat();
    p.role = randomRole(); p.lore = []; p.shiny = false;
    app.pet = p; const mx = maxes(p); p.hp = mx.hp; p.food = Math.round(mx.food * 0.7); p.energy = mx.energy;
    if (!app.petLevels) app.petLevels = levelsNow();
    else { const now2 = levelsNow(); for (const [k, v] of Object.entries(now2)) app.petLevels[k] = Math.max(app.petLevels[k] ?? v, v); }
    chooser.classList.remove('show'); save(true);
    mode = 'home'; artKey = ''; renderPanel();
    setTimeout(() => { react('happy', 1500, 'joy', 'love'); spawn('♥', 'heart', 3); sayNow(`Ben ${p.name}.`, 4200); }, 500);
    if (notifyAvailable()) LocalNotifications.requestPermissions().catch(() => {});
    $('#petHome')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });

  // ---------- bilgi ----------
  function openInfo() {
    const p = P(); if (!p) { openChooser(); return; }
    const sp = PET_SPECS[p.species], mx = maxes(p);
    $('#piTitle').textContent = `${p.name} · ${stageName(p.species, p.stage)}`;
    $('#piLine').innerHTML = [0, 1, 2, 3, 4, 5].map(st => `<div class="pi-stage ${st < p.stage ? 'past' : st === p.stage ? 'now' : 'future'}">${st <= p.stage ? petSVG(p.species, st, { coat: p.coat, shiny: p.shiny }) : '<span class="pi-unknown">?</span>'}<small>${st <= p.stage ? esc(stageName(p.species, st)) : '???'}</small></div>`).join('');
    $('#piSkills').innerHTML = `<p class="pi-soul">${esc(sp.soul)}</p><div><b>🌀 ${esc(sp.passive.name)} (pasif)</b><span>${esc(sp.passive.desc)}</span></div><div><b>✨ ${esc(sp.active.name)} (aktif · ${sp.active.cost}⚡)</b><span>${esc(sp.active.desc)}</span></div><div><b>💪 Güçlü yanı</b><span>${esc(sp.perk)}</span></div>`;
    $('#piStats').innerHTML = `<span>❤️ ${Math.round(p.hp)}/${mx.hp}</span><span>${sp.foodIcon} ${Math.round(p.food)}/${mx.food}</span><span>⚡ ${Math.round(p.energy)}/${mx.energy}</span><span>✅ ${p.correct} doğru</span><span>⭐ ${p.stars}</span><span>💫 ${p.revives || 0} kez canlandı</span>`;
    $('#piName').value = p.name; $('#piRoam').checked = p.roam; $('#piNotify').checked = p.notify;
    $('#piNotifyRow').classList.toggle('hidden', !notifyAvailable());
    const mem = A().petMemorial || [];
    $('#piMemorial').innerHTML = mem.length ? `<b>🕊️ Anı köşesi:</b> ${mem.map(m => `${esc(m.name)} (${esc(stageName(m.species, m.stage))})`).join(', ')}` : 'Her seviye atlamada evrimleşir. Son formdan sonra her seviye bir ⭐ ekler. Gece uyur, sabah mahmurdur; çok soru çözünce karnı şişip mayışır.';
    document.querySelector('#settingsOverlay.show') && document.querySelector('#closeSettings')?.click();
    infoEl.classList.add('show');
  }
  $('#piClose').addEventListener('click', () => infoEl.classList.remove('show'));
  infoEl.addEventListener('click', e => { if (e.target === infoEl) infoEl.classList.remove('show'); });
  $('#piSave').addEventListener('click', () => { const p = P(); if (!p) return; p.name = ($('#piName').value.trim() || p.name).slice(0, 16); save(true); renderPanel(); openInfo(); core.toast('Adı kaydedildi'); });
  $('#piRoam').addEventListener('change', e => { const p = P(); if (!p) return; p.roam = e.target.checked; if (!p.roam) goHome(); save(); });
  $('#piNotify').addEventListener('change', e => { const p = P(); if (!p) return; p.notify = e.target.checked; save(); if (p.notify && notifyAvailable()) LocalNotifications.requestPermissions().catch(() => {}); });

  // ---------- bildirimler ----------
  const NOTE_IDS = [7101, 7102, 7103, 7104];
  function quietShift(t) {
    const d = new Date(t), h = d.getHours() + d.getMinutes() / 60;
    if (h >= 22) { d.setDate(d.getDate() + 1); d.setHours(9, 30, 0, 0); return d.getTime(); }
    if (h < 9.5) { d.setHours(9, 30, 0, 0); return d.getTime(); }
    return t;
  }
  async function schedule() {
    const p = P(); if (!p || !p.alive || !p.notify || !notifyAvailable()) return;
    try {
      await LocalNotifications.cancel({ notifications: NOTE_IDS.map(id => ({ id })) }).catch(() => {});
      const now = Date.now(), mx = maxes(p), rate = p.species === 'plant' ? 3 : 4, plant = p.species === 'plant', icon = PET_SPECS[p.species].foodIcon;
      const list = [];
      if (p.food > mx.food * 0.3) list.push({ id: 7101, at: now + ((p.food - mx.food * 0.3) / rate) * HOUR, title: `${p.name} ${plant ? 'susadı' : 'acıktı'} ${icon}`, body: plant ? 'Toprağım kurudu… birkaç doğru cevapla beni sular mısın? 💧' : 'Karnım guruldadı… birkaç soru çözüp beni besler misin?' });
      list.push({ id: 7102, at: now + Math.max(2, p.food / rate) * HOUR, title: `${p.name} çok ${plant ? 'susuz' : 'aç'}! 🥺`, body: 'Seni bekliyorum… güçten düşmeye başladım.' });
      list.push({ id: 7103, at: now + 24 * HOUR, title: `${p.name} seni özledi 💛`, body: 'Bugün birlikte bir pop quiz çözelim mi?' });
      list.push({ id: 7104, at: now + 72 * HOUR, title: `${p.name} seni bekliyor…`, body: 'Üç gündür görüşmedik. Bir soru bile yeter!' });
      const used = new Set();
      const notes = list.map(n => { let at = quietShift(n.at); while (used.has(Math.round(at / 60000))) at += 30 * 60000; used.add(Math.round(at / 60000)); return { ...n, at }; })
        .filter(n => n.at > now + 60000)
        .map(n => ({ id: n.id, title: n.title, body: n.body, schedule: { at: new Date(n.at), allowWhileIdle: true }, smallIcon: 'ic_stat_pet', iconColor: '#E86FA0' }));
      if (notes.length) await LocalNotifications.schedule({ notifications: notes });
    } catch (e) { console.warn('[pet] bildirim planlanamadı', e); }
  }
  function cancelNotes() { if (notifyAvailable()) LocalNotifications.cancel({ notifications: NOTE_IDS.map(id => ({ id })) }).catch(() => {}); }

  // ---------- yaşam döngüsü ----------
  function greetIfAway() {
    const p = P(); if (!p || !p.alive) return;
    const away = Date.now() - (p.lastSeen || Date.now());
    p.lastSeen = Date.now();
    if (away > 8 * HOUR) setTimeout(() => { react('love', 2000, 'love', 'love'); spawn('♥', 'heart', 3); say(pick(LINES.missed), 3600); }, 1200);
    else if (away > 40 * 60000) setTimeout(() => { emote(phase() === 'night' ? 'zz' : 'note', 1800); say(pick(LINES.greet[phase()] || LINES.greet.day), 3000); }, 1500);
  }
  function ensure() {
    normalize();
    if (!A().calibrated || off()) return;
    if (!P()) { if (!chooser.classList.contains('show') && !deathEl.classList.contains('show')) openChooser(); return; }
    renderPanel();
  }
  function setEnabled(on) {
    const app = A(); app.profile = app.profile || {};
    if (on === !off()) return;
    app.profile.petOff = !on;
    if (!on) {
      cancelNotes(); deathPending = false;
      [chooser, deathEl, infoEl].forEach(el => el.classList.remove('show'));
      core.saveLocal(false); renderPanel(); try { publishCard(); } catch {} return;
    }
    // kapalıyken geçen süre petten düşmesin
    const raw = app.pet; if (raw) { raw.lastTick = raw.lastSeen = Date.now(); }
    core.saveLocal(false); reload(); checkLevels();
    if (!raw) setTimeout(() => { document.querySelector('#settingsOverlay.show') && document.querySelector('#closeSettings')?.click(); ensure(); }, 300);
  }
  function reload() { normalize(); tick(); artKey = ''; if (P() && !P().alive) { deathPending = true; setTimeout(openDeath, 600); } renderPanel(); }

  normalize(); tick(); checkLevels();
  if (P() && !P().alive) { deathPending = true; setTimeout(openDeath, 1200); }
  renderPanel(); greetIfAway();
  requestAnimationFrame(frame);
  setInterval(() => { const p = P(); if (!p) return; tick(); checkLevels(); p.lastSeen = Date.now(); renderPanel(); }, 30000);
  setInterval(() => { if (P() && !evolving) checkLevels(); }, 5000);
  window.addEventListener('resize', () => { if (mode !== 'home') walkTo(freeSpot(), baseSpeed()); });

  // ---------- yönetici paneli ----------
  // Panele giden özet: yalnızca pet durumu (kişisel bilgi yok).
  function snapshot() {
    const p = P(); if (!p) return null;
    const mx = maxes(p), r = v => Math.max(0, Math.round(Number(v) || 0));
    const o = {
      species: p.species, stage: p.stage, stars: r(p.stars), name: String(p.name || '').slice(0, 16), alive: !!p.alive,
      hp: r(p.hp), hpMax: mx.hp, food: r(p.food), foodMax: mx.food, energy: r(p.energy), energyMax: mx.energy,
      stuffed: Math.min(100, r(p.stuffed)), flow: !!p.flow, roam: !!p.roam, mood: currentMood(), streak: r(p.streak), correct: r(p.correct), answers: r(p.answers),
      revives: r(p.revives), memorial: Math.min(100, (A().petMemorial || []).length), catchUp: Math.min(20, Object.keys(A().petCatchUp || {}).length),
    };
    if (!p.alive && /^[a-z]{2,6}$/.test(p.death?.cat || '')) o.deathCat = p.death.cat;
    return o;
  }
  function adminRevive() {
    const p = P(); if (!p || p.alive) return false;
    const mx = maxes(p);
    p.alive = true; p.hp = mx.hp; p.food = Math.max(p.food, mx.food * 0.6); p.energy = Math.max(p.energy, mx.energy * 0.6); p.death = null;
    deathPending = false; deathEl.classList.remove('show');
    tempMood = null; animCls = ''; sprite.className = 'pet-sprite a-idle'; drawSprite(true);
    core.renderProgress(); quiz.renderAll();
    if (evoQueue.length) setTimeout(runEvoQueue, 1200);
    return true;
  }
  // görünür olana kadar bekleyip konuşur (ayarlar penceresi açıkken vb.)
  function sayWhenVisible(text, em, ms = 5200, n = 0) {
    if (!P()) return;
    if (actorEl.classList.contains('hidden')) { if (n < 40) setTimeout(() => sayWhenVisible(text, em, ms, n + 1), 1500); return; }
    if (em) emote(em, Math.min(ms, 3200));
    if (text) sayNow(text, ms);
  }
  const REACTS = { love: ['love', 2200, 'love', 'love'], joy: ['happy', 1100, 'joy', 'star'], dance: ['happy', 1500, 'dance', 'note'], shock: ['surprised', 1300, 'shock', 'excl'], sad: ['sad', 1800, 'sad', 'tear'], sleep: ['sleep', 2600, 'doze', 'zz'] };
  function admin(msg = {}) {
    const a = String(msg.action || ''), app = A();
    const pctOf = (v, m) => clamp(Math.round(Number(v)), 0, 100) / 100 * m;
    const has = k => msg[k] !== undefined && msg[k] !== null && Number.isFinite(Number(msg[k]));
    if (a === 'reset') {
      const p = P(); if (!p) return null;
      app.petMemorial = [...(app.petMemorial || []), { name: p.name, species: p.species, stage: p.stage, stars: p.stars, at: Date.now() }].slice(-12);
      app.pet = null; deathPending = false; deathEl.classList.remove('show'); evoQueue.length = 0;
      save(true); renderPanel(); openChooser(true);
      return { icon: '🐾', title: 'Yeni pet zamanı', text: `${p.name} anı köşesine uğurlandı; yeni bir pet seçebilirsin.` };
    }
    const p = P(); if (!p) return null;
    const mx = maxes(p), sp = PET_SPECS[p.species];
    let out = null;
    switch (a) {
      case 'heal':
        if (!p.alive) { adminRevive(); out = { icon: '💫', title: `${p.name} canlandı`, text: 'Yöneticin petini canlandırdı; seviyen düşmedi.' }; }
        else { p.hp = mx.hp; out = { icon: '❤️', title: `${p.name} iyileşti`, text: 'Yöneticin petinin canını doldurdu.' }; }
        setTimeout(() => react('love', 1800, 'love', 'love'), 300); break;
      case 'feed':
        p.food = mx.food; out = { icon: sp.foodIcon, title: p.species === 'plant' ? `${p.name} sulandı` : `${p.name} doydu`, text: `Yöneticin ${sp.foodLabel.toLocaleLowerCase('tr')} çubuğunu doldurdu.` };
        if (p.alive) setTimeout(() => { react('eat', 1000, 'eat', 'food'); setTimeout(() => react('happy', 1100, 'joy', 'note'), 1050); }, 300); break;
      case 'energy':
        p.energy = mx.energy; out = { icon: '⚡', title: `${p.name} dinç`, text: 'Yöneticin petinin enerjisini doldurdu.' };
        if (p.alive) { awakeUntil = Date.now() + 10 * 60000; setTimeout(() => react('happy', 1100, 'joy', 'star'), 300); } break;
      case 'restore': case 'revive': {
        const wasDead = !p.alive; adminRevive();
        if (a === 'restore' || wasDead) { p.hp = mx.hp; p.food = mx.food; p.energy = mx.energy; p.stuffed = 0; }
        out = wasDead ? { icon: '💫', title: `${p.name} canlandı`, text: 'Yöneticin petini canlandırdı; seviyen düşmedi, telafi gerekmiyor.' } : { icon: '✨', title: `${p.name} tazelendi`, text: 'Yöneticin can, ' + sp.foodLabel.toLocaleLowerCase('tr') + ' ve enerjiyi doldurdu.' };
        setTimeout(() => react('happy', 1500, 'dance', wasDead ? 'love' : 'star'), 400); break;
      }
      case 'set':
        if (has('hp')) p.hp = p.alive ? Math.max(1, pctOf(msg.hp, mx.hp)) : p.hp;
        if (has('food')) p.food = pctOf(msg.food, mx.food);
        if (has('energy')) p.energy = pctOf(msg.energy, mx.energy);
        out = { icon: '🛠️', title: `${p.name} ayarlandı`, text: 'Yöneticin petinin değerlerini değiştirdi.' };
        if (p.alive) setTimeout(() => react('surprised', 1100, 'shock', 'ask'), 300); break;
      case 'stage': {
        const target = has('stage') ? clamp(Math.floor(Number(msg.stage)), 0, 5) : p.stage;
        if (has('stars')) p.stars = clamp(Math.floor(Number(msg.stars)), 0, 999);
        if (target > p.stage && p.alive) {
          // panelden atlama: tek bir evrim gösterisi (ara formlar tek tek onaylatılmaz)
          const from = p.stage; p.stage = target; const m2 = maxes(p);
          p.hp = Math.min(m2.hp, p.hp + m2.hp * 0.25); p.energy = Math.min(m2.energy, p.energy + 20); p.evolvedAt = Date.now();
          evoQueue.push({ type: 'evo', from, to: target }); setTimeout(runEvoQueue, 900);
        }
        else if (target !== p.stage) { p.stage = target; const m2 = maxes(p); p.hp = Math.min(p.hp, m2.hp); p.food = Math.min(p.food, m2.food); p.energy = Math.min(p.energy, m2.energy); artKey = ''; }
        out = { icon: '🧬', title: `${p.name}: ${stageName(p.species, target)}`, text: `Yöneticin petinin formunu ayarladı${has('stars') ? ` · ${p.stars} ⭐` : ''}.` };
        break;
      }
      case 'name': {
        const n = String(msg.name || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16);
        if (!n) return null;
        const old = p.name; p.name = n;
        out = { icon: '🏷️', title: `Yeni adı: ${n}`, text: `Yöneticin ${old} adını ${n} olarak değiştirdi.` };
        setTimeout(() => sayWhenVisible(`Artık adım ${n}! 🏷️`, 'note', 3200), 400); break;
      }
      case 'species': {
        const s2 = String(msg.species || '');
        if (!Object.prototype.hasOwnProperty.call(PET_SPECS, s2) || s2 === p.species) return null;
        p.species = s2; const m2 = maxes(p);
        p.hp = Math.min(p.hp, m2.hp); p.food = Math.min(p.food, m2.food); p.energy = Math.min(p.energy, m2.energy); artKey = '';
        out = { icon: '🔄', title: `${p.name} dönüştü!`, text: `Yöneticin petini ${PET_SPECIES[s2].label.toLocaleLowerCase('tr')} yaptı (${stageName(s2, p.stage)}).` };
        if (p.alive) setTimeout(() => react('surprised', 1300, 'shock', 'excl'), 300); break;
      }
      case 'flow':
        p.flow = !!msg.on; p.flowCount = 0;
        out = { icon: '🌊', title: `Flow ${p.flow ? 'açıldı' : 'kapandı'}`, text: p.flow ? 'Yöneticin flow modunu açtı: müzik ödülleri durdu, enerji 10 soruda bir azalır.' : 'Yöneticin flow modunu kapattı.' };
        if (p.alive) setTimeout(() => react(p.flow ? 'focus' : 'happy', 1300, p.flow ? 'focus' : 'joy', p.flow ? 'spark' : 'note'), 300); break;
      case 'roam':
        p.roam = !!msg.on; if (!p.roam) goHome();
        out = { icon: '🐾', title: p.roam ? 'Pet dolaşabilir' : 'Pet yuvasında', text: p.roam ? 'Yöneticin petinin ekranda dolaşmasını açtı.' : 'Yöneticin petinin dolaşmasını kapattı; yuvasında kalacak.' };
        break;
      case 'say': {
        const text = String(msg.text || '').slice(0, 200).trim();
        const em = EM[msg.emote] || msg.emote === 'food' ? msg.emote : '';
        if (!text && !em) return null;
        if (p.alive && isSleeping()) awakeUntil = Date.now() + 60000;
        if (p.alive && REACTS[msg.emote]) { const [m, ms, an] = REACTS[msg.emote]; setTimeout(() => react(m, ms, an), 300); }
        sayWhenVisible(text, em || REACTS[msg.emote]?.[3] || '', Math.max(3600, Math.min(9000, text.length * 90)));
        return { silent: true };
      }
      case 'react': {
        const r = REACTS[msg.emote] || REACTS.joy;
        if (!p.alive) return { silent: true };
        if (isSleeping() && msg.emote !== 'sleep') awakeUntil = Date.now() + 60000;
        const go = (n = 0) => { if (actorEl.classList.contains('hidden') && n < 40) return setTimeout(() => go(n + 1), 1500); react(r[0], r[1], r[2], r[3]); if (msg.emote === 'love') spawn('♥', 'heart', 3); };
        setTimeout(go, 300);
        return { silent: true };
      }
      default: return null;
    }
    save(true); renderPanel(); drawSprite(true);
    return out;
  }

  return {
    ensure, reload, setEnabled, openCodex, battle, bossPrompt, enabled: () => !off(), render: renderPanel, openChooser, openInfo, xpMod, snapshot, admin,
    onPause() { const p = P(); if (p) { tick(); p.lastSeen = Date.now(); save(); schedule(); } },
    onResume() { cancelNotes(); tick(); greetIfAway(); renderPanel(); },
    debug: { die: () => { const p = P(); if (p) { p.hp = 1; } }, evolve: n => evolveBy(n || 1), phase, react, say, tick, emote, setAnim, baseNow, puppet, ability: useAbility, tap, pet, mischief: () => catMischief(), bored: v => { catBored = v; }, isSleeping, mood: currentMood, guard: () => guardUntil },
  };
}
