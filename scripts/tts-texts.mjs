// AI ses üretimi 1. adım: Firebase'deki soru bankasından seslendirilecek İngilizce metinleri çıkarır → /tmp/tts/texts.json
// Kitap içeriği depoya ya da günlüğe yazılmaz; yalnızca sayılar yazdırılır.
import admin from 'firebase-admin';
import { writeFileSync, mkdirSync } from 'node:fs';
import { epSpeechTexts, audioKey } from './src/speech-text.js';
import { FIREBASE_CONFIG } from './src/config.js';
const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
admin.initializeApp({ credential: admin.credential.cert(sa), databaseURL: FIREBASE_CONFIG.databaseURL });
const bank = (await admin.database().ref('prep/bank').get()).val() || {};
const map = {};
for (const b of ['wb', 'sb', 'rd']) for (const u of Object.values(bank[b] || {})) for (const it of Object.values(u.items || {})) for (const t of epSpeechTexts(it)) map[audioKey(t)] = t;
mkdirSync('/tmp/tts', { recursive: true });
writeFileSync('/tmp/tts/texts.json', JSON.stringify(map));
console.log('seslendirilecek metin:', Object.keys(map).length);
process.exit(0);
