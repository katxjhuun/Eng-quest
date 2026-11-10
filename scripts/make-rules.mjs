// database.rules.json üretici. Kurallar elle yazılınca tekrar eden yönetici koşulu hataya açık olduğu için buradan üretilir.
// Yönetici: Firebase'de admins/<uid> = true kaydı olan Google hesabı. E-posta herkese açık depoya yazılmaz.
import { writeFile } from 'node:fs/promises';
const ADMIN = "auth != null && auth.token.firebase.sign_in_provider == 'google.com' && root.child('admins').child(auth.uid).val() == true";
const OWN = 'auth != null && auth.uid == $uid';
const str = (max, re) => ({ '.validate': `newData.isString() && newData.val().length <= ${max}${re ? ` && newData.val().matches(${re})` : ''}` });
const num = (max = 10000000) => ({ '.validate': `newData.isNumber() && newData.val() >= 0 && newData.val() <= ${max}` });
const ts = () => ({ '.validate': 'newData.isNumber() && newData.val() <= now + 300000' });
const bool = () => ({ '.validate': 'newData.isBoolean()' });
const NO = { '.validate': false };
const msgFields = {
  type: str(10, '/^(message|xp|level|reward|pet)$/'), amount: { '.validate': 'newData.isNumber() && newData.val() >= -100000 && newData.val() <= 100000' },
  cat: str(6, '/^[a-z]{2,6}$/'), catLevel: num(100), level: str(2, '/^(A1|A2|B1|B2|C1|C2)$/'),
  title: str(80), text: str(600), emoji: str(16), music: bool(), at: ts(), by: str(120), broadcast: bool(),
  // pet komutları (yalnızca yönetici gönderebilir; uygulama ayrıca doğrular)
  action: str(12, '/^(heal|feed|energy|restore|revive|set|stage|name|species|flow|roam|say|react|reset)$/'),
  species: str(6, '/^(plant|chick|cat|dog|owl|gecko|whale|doodle|goat)$/'), stage: num(5), stars: num(999), name: str(16),
  hp: num(100), food: num(100), energy: num(100), emote: str(8, '/^[a-z]{2,8}$/'), on: bool(),
  $other: NO,
};
const rules = {
  rules: {
    '.read': false, '.write': false,
    users: {
      '.read': ADMIN,
      $uid: {
        '.read': OWN,
        // Yönetici kaydı silebilir; kullanıcı kendi kaydının tamamını silebilir (verimi sil).
        '.write': `(${ADMIN}) || (${OWN} && !newData.exists())`,
        profile: {
          '.write': OWN,
          shortId: str(8, '/^DL-[A-Z0-9]{5}$/'), platform: str(10, '/^(android|ios|web)$/'),
          appVersion: str(30, '/^[0-9A-Za-z.+-]+$/'), lastOpen: ts(), $other: NO,
        },
        stats: {
          '.write': OWN,
          shortId: str(8, '/^DL-[A-Z0-9]{5}$/'),
          xp: num(), total: num(), levelIndex: num(5), correct: num(), wrong: num(), streak: num(), opened: num(), failed: num(), badges: num(1000),
          level: str(2, '/^(A1|A2|B1|B2|C1|C2)$/'), levelLabel: str(20), mode: str(6, '/^(type|quiz|listen|mix)$/'),
          cat: str(6, '/^[a-z]{2,6}$/'), dept: str(20, '/^[a-z]{2,20}$/'), theme: str(20, '/^[a-z]{2,20}$/'),
          catXp: { $c: { '.validate': "$c.matches(/^[a-z]{2,6}$/) && newData.isNumber() && newData.val() >= 0 && newData.val() <= 10000000" } },
          updatedAt: ts(), $other: NO,
        },
        live: {
          '.write': OWN,
          cat: str(6, '/^[a-z]{2,6}$/'), catLabel: str(40), mode: str(20), question: str(1000), answer: str(300), state: str(40),
          options: { $i: { '.validate': "$i.matches(/^[0-9]$/) && newData.isString() && newData.val().length <= 300" } },
          at: ts(), $other: NO,
        },
        status: { '.write': OWN, state: str(7, '/^(online|offline)$/'), last: ts(), $other: NO },
        // petin durumu (uygulama yazar, panel okur); kişisel bilgi içermez
        pet: {
          '.write': OWN,
          species: str(6, '/^(plant|chick|cat|dog|owl|gecko|whale|doodle|goat)$/'), stage: num(5), stars: num(9999), name: str(16), alive: bool(),
          hp: num(10000), hpMax: num(10000), food: num(10000), foodMax: num(10000), energy: num(10000), energyMax: num(10000),
          stuffed: num(100), flow: bool(), roam: bool(), mood: str(12, '/^[a-z]{2,12}$/'), streak: num(), correct: num(), answers: num(),
          revives: num(10000), memorial: num(100), deathCat: str(6, '/^[a-z]{2,6}$/'), catchUp: num(20), updatedAt: ts(), $other: NO,
        },
        inbox: { $msg: { '.write': `${OWN} && !newData.exists()`, ...msgFields } },
        $other: NO,
      },
    },
    history: {
      '.read': ADMIN,
      $uid: {
        '.write': `(${ADMIN}) || (${OWN} && !newData.exists())`,
        $msg: { '.write': `${OWN} && !data.exists()`, ...msgFields, seenAt: ts() },
      },
    },
    // Arena: oyuncuların petlerinin herkese açık savaş kartı (kimlik kodu ile). Kişisel bilgi yok; yalnızca sahibi yazar/siler.
    arena: {
      '.read': 'auth != null',
      '.indexOn': ['at'],
      $code: {
        '.write': "auth != null && $code.matches(/^DL-[A-Z0-9]{5}$/) && (!data.exists() || data.child('uid').val() == auth.uid) && (!newData.exists() || newData.child('uid').val() == auth.uid)",
        '.validate': "newData.hasChildren(['uid', 'code', 'pet', 'at']) && newData.child('code').val() == $code",
        uid: str(128), code: str(8, '/^DL-[A-Z0-9]{5}$/'), wins: num(1000000), at: ts(),
        pet: {
          '.validate': "newData.hasChildren(['species', 'stage', 'role', 'name'])",
          species: str(6, '/^(plant|chick|cat|dog|owl|gecko|whale|doodle|goat)$/'), stage: num(5), stars: num(9999),
          role: str(10, '/^(tank|melee|ranger|assassin|support|magician|trickster)$/'), shiny: bool(), coat: num(7), name: str(16), $other: NO,
        },
        $other: NO,
      },
    },
    admin: { '.read': ADMIN, '.write': ADMIN, labels: { $uid: str(60) } },
    admins: { $uid: { '.read': 'auth != null && auth.uid == $uid', '.write': false } },
  },
};
await writeFile(new URL('../database.rules.json', import.meta.url), JSON.stringify(rules, null, 2) + '\n');
console.log('✓ database.rules.json');
