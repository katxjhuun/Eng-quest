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
const CODE = str(8, '/^DL-[A-Z0-9]{5}$/');
const SPECIES = str(6, '/^(plant|chick|cat|dog|owl|gecko|whale|doodle|goat)$/');
const PERSON = { '.validate': "newData.hasChildren(['code', 'name', 'at'])", code: CODE, name: str(16), at: ts(), $other: NO };
const PETCARD = {
  '.validate': "newData.hasChildren(['species', 'stage', 'role', 'name'])",
  species: SPECIES, stage: num(5), stars: num(999), role: str(10, '/^(tank|melee|ranger|assassin|support|magician|trickster)$/'), shiny: bool(), coat: num(7), name: str(16), $other: NO,
};
const MEMBER = "$cid.beginsWith(auth.uid + '_') || $cid.endsWith('_' + auth.uid)";
const msgFields = {
  type: str(10, '/^(message|xp|level|reward|pet|boss|ask|hint|game)$/'), amount: { '.validate': 'newData.isNumber() && newData.val() >= -100000 && newData.val() <= 100000' },
  cat: str(6, '/^[a-z]{2,6}$/'), catLevel: num(100), level: str(2, '/^(A1|A2|B1|B2|C1|C2)$/'),
  title: str(80), text: str(600), emoji: str(16), music: bool(), at: ts(), by: str(120), broadcast: bool(),
  // pet komutları (yalnızca yönetici gönderebilir; uygulama ayrıca doğrular)
  action: str(12, '/^(heal|feed|energy|restore|revive|set|stage|name|species|flow|roam|say|react|reset|shiny|role)$/'),
  role: str(10, '/^(tank|melee|ranger|assassin|support|magician|trickster)$/'),
  // özel boss (type=boss)
  mon: str(14, '/^[A-Za-z]{2,14}$/'),
  // soru-cevap bildirimi (type=ask): evet/hayır, serbest yanıt ya da onay listesi
  kind: str(6, '/^(yesno|text|check)$/'), options: { $o: { '.validate': "$o.matches(/^o[0-9]$/) && newData.isString() && newData.val().length <= 80" } },
  // ipucu hakkı (type=hint) ve mini oyun (type=game)
  lock: bool(), game: str(10, '/^[a-z]{3,10}$/'), lang: str(2, '/^(tr|en)$/'), win: bool(),
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
          shiny: bool(), role: str(10, '/^(tank|melee|ranger|assassin|support|magician|trickster)$/'),
          revives: num(10000), memorial: num(100), deathCat: str(6, '/^[a-z]{2,6}$/'), catchUp: num(20), updatedAt: ts(), $other: NO,
        },
        inbox: { $msg: { '.write': `${OWN} && !newData.exists()`, ...msgFields } },
        // kullanıcının yönetici sorularına yanıtları ve özel boss sonuçları (yönetici okur)
        replies: {
          $msg: {
            '.write': OWN,
            kind: str(6, '/^(yesno|text|check|boss)$/'), q: str(200), answer: str(300), result: str(4, '/^(win|lose)$/'),
            checks: { $c: { '.validate': "$c.matches(/^o[0-9]$/) && newData.isBoolean()" } }, at: ts(), $other: NO,
          },
        },
        // süren savaşın canlı özeti (yönetici panelde izler ve müdahale eder)
        battle: {
          '.write': OWN,
          active: bool(), title: str(60), round: num(1000), at: ts(),
          units: { $i: { '.validate': "$i.matches(/^u[0-9]{1,4}$/)", uid: str(12), name: str(24), side: str(1, '/^(A|B)$/'), hp: num(), maxHp: num(), will: num(), maxWill: num(), role: str(10), alive: bool(), $other: NO } },
          $other: NO,
        },
        // yöneticinin canlı savaş komutları: yönetici yazar, uygulama uygulayıp siler
        battleCmd: {
          $c: {
            '.write': `(${ADMIN}) || (${OWN} && !newData.exists())`,
            op: str(8, '/^(heal|hurt|shield|buff|weaken|confuse|will|ko|revive)$/'), target: str(12), at: ts(), $other: NO,
          },
        },
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
    // Web bildirimleri: telefonun push aboneliği ve vakti gelince gönderilecek notlar. Yalnızca sahibi okur/yazar;
    // gönderici (GitHub zamanlanmış işi) hizmet hesabıyla kurallardan bağımsız okur ve gönderilenleri siler.
    push: {
      $uid: {
        '.read': OWN, '.write': OWN,
        '.validate': "newData.hasChildren(['sub', 'updatedAt'])",
        sub: {
          '.validate': "newData.hasChildren(['endpoint', 'keys'])",
          endpoint: str(1000, '/^https:\\/\\//'),
          keys: { p256dh: str(200, '/^[A-Za-z0-9_=-]+$/'), auth: str(100, '/^[A-Za-z0-9_=-]+$/'), $other: NO },
          $other: NO,
        },
        notes: { $n: { '.validate': "$n.matches(/^n[0-9]$/) && newData.hasChildren(['at', 'title', 'body'])", at: { '.validate': 'newData.isNumber()' }, title: str(80), body: str(200), $other: NO } },
        loud: bool(), golden: bool(), upd: bool(), updatedAt: ts(), $other: NO,
      },
    },
    // Duyuru şeridi: oyuncuların başarıları (nadir pet, seviye, son evrim). Herkes okur; yalnızca sahibi ekler, değiştiremez.
    feed: {
      '.read': 'auth != null', '.indexOn': ['at'], '.write': ADMIN,
      $id: {
        '.write': `auth != null && !data.exists() && newData.child('uid').val() == auth.uid`,
        '.validate': "newData.hasChildren(['uid', 'code', 'kind', 'tier', 'at'])",
        uid: str(128), code: str(8, '/^DL-[A-Z0-9]{5}$/'), kind: str(10, '/^(shiny|maxevo|level|maxlevel|boss|stars)$/'), tier: num(3), at: ts(),
        name: str(16), species: str(6, '/^(plant|chick|cat|dog|owl|gecko|whale|doodle|goat)$/'), level: str(12), stage: num(5), coat: num(7), stars: num(9999), shiny: bool(),
        $other: NO,
      },
    },
    // Çözülen soru sıralaması (yalnızca şeritte kendi sıranı görürsün)
    board: {
      '.read': 'auth != null', '.indexOn': ['n'],
      $code: {
        '.write': "auth != null && $code.matches(/^DL-[A-Z0-9]{5}$/) && (!data.exists() || data.child('uid').val() == auth.uid) && (!newData.exists() || newData.child('uid').val() == auth.uid)",
        '.validate': "newData.hasChildren(['uid', 'code', 'n', 'at']) && newData.child('code').val() == $code",
        uid: str(128), code: str(8, '/^DL-[A-Z0-9]{5}$/'), n: num(), name: str(16), species: str(6, '/^(plant|chick|cat|dog|owl|gecko|whale|doodle|goat)$/'),
        stage: num(5), shiny: bool(), coat: num(7), at: ts(), $other: NO,
      },
    },
    // Sosyal: oyuncu dizini (kod → uid), arkadaşlık istekleri, arkadaş listeleri, engellemeler, sohbetler ve pet takası.
    // Mesaj yazabilmek için alıcının arkadaş listesinde olmak ve engellenmemiş olmak gerekir. Sohbeti yalnızca iki taraf okur;
    // yönetici moderasyon için okuyabilir (uygulamada açıkça yazar). Dosya, ses, görüntü yok: yalnızca kısa metin ve takas kartı.
    soc: {
      '.read': ADMIN,
      dir: {
        '.read': 'auth != null',
        $code: {
          '.write': "auth != null && $code.matches(/^DL-[A-Z0-9]{5}$/) && (!data.exists() || data.child('uid').val() == auth.uid) && (!newData.exists() || newData.child('uid').val() == auth.uid)",
          '.validate': "newData.hasChildren(['uid', 'code', 'name', 'at']) && newData.child('code').val() == $code",
          uid: str(128), code: CODE, name: str(16), species: SPECIES, stage: num(5), coat: num(7), shiny: bool(), at: ts(), $other: NO,
        },
      },
      req: {
        $to: {
          '.read': 'auth != null && auth.uid == $to',
          $from: {
            '.read': 'auth != null && auth.uid == $from',
            '.write': "auth != null && ((auth.uid == $from && $from != $to && (!newData.exists() || !root.child('soc/blk/' + $to + '/' + $from).exists())) || (auth.uid == $to && !newData.exists()))",
            ...PERSON,
          },
        },
      },
      acc: {
        $to: {
          '.read': 'auth != null && auth.uid == $to',
          $from: {
            '.write': "auth != null && ((auth.uid == $from && (!newData.exists() || root.child('soc/fr/' + $from + '/' + $to).exists())) || (auth.uid == $to && !newData.exists()))",
            ...PERSON,
          },
        },
      },
      fr: { $uid: { '.read': OWN, '.write': OWN, $fid: PERSON } },
      blk: { $uid: { '.read': OWN, '.write': OWN, $bid: bool() } },
      ping: {
        $to: {
          '.read': 'auth != null && auth.uid == $to',
          $from: {
            '.write': "auth != null && ((auth.uid == $from && root.child('soc/fr/' + $to + '/' + $from).exists() && !root.child('soc/blk/' + $to + '/' + $from).exists()) || auth.uid == $to)",
            '.validate': 'newData.isNumber() && newData.val() <= now + 300000',
          },
        },
      },
      ch: {
        $cid: {
          '.read': `auth != null && (${MEMBER})`,
          m: {
            $id: {
              '.write': `auth != null && !data.exists() && newData.child('f').val() == auth.uid && ($cid == auth.uid + '_' + newData.child('to').val() || $cid == newData.child('to').val() + '_' + auth.uid) && root.child('soc/fr/' + newData.child('to').val() + '/' + auth.uid).exists() && !root.child('soc/blk/' + newData.child('to').val() + '/' + auth.uid).exists()`,
              '.validate': "newData.hasChildren(['f', 'to', 'k', 'at']) && (newData.child('k').val() != 'msg' || newData.hasChild('t')) && (newData.child('k').val() != 'trade' || newData.hasChild('pet'))",
              f: str(128), to: str(128), k: str(5, '/^(msg|trade)$/'), t: { '.validate': 'newData.isString() && newData.val().length >= 1 && newData.val().length <= 500' }, at: ts(), pet: PETCARD, $other: NO,
            },
          },
          x: {
            $id: {
              '.write': `auth != null && !data.exists() && (${MEMBER}) && newData.child('by').val() == auth.uid && root.child('soc/ch/' + $cid + '/m/' + $id + '/k').val() == 'trade' && ((newData.child('ok').val() == true && newData.hasChild('pet') && root.child('soc/ch/' + $cid + '/m/' + $id + '/f').val() != auth.uid) || newData.child('ok').val() == false)`,
              '.validate': "newData.hasChildren(['by', 'ok', 'at'])",
              by: str(128), ok: bool(), at: ts(), pet: PETCARD, $other: NO,
            },
          },
          r: { $uid: { '.write': `${OWN} && (${MEMBER})`, '.validate': 'newData.isNumber() && newData.val() <= now + 300000' } },
          $other: NO,
        },
      },
      rep: {
        $id: {
          '.write': "auth != null && !data.exists() && newData.child('from').val() == auth.uid",
          '.validate': "newData.hasChildren(['from', 'at'])",
          from: str(128), about: str(8), cid: str(260), text: str(600), at: ts(), $other: NO,
        },
      },
    },
    admin: { '.read': ADMIN, '.write': ADMIN, labels: { $uid: str(60) }, tags: { $uid: { $t: { '.validate': "$t.matches(/^t[0-7]$/) && newData.isString() && newData.val().length >= 1 && newData.val().length <= 24" } } } },
    admins: { $uid: { '.read': 'auth != null && auth.uid == $uid', '.write': false } },
  },
};
await writeFile(new URL('../database.rules.json', import.meta.url), JSON.stringify(rules, null, 2) + '\n');
console.log('✓ database.rules.json');
