// Web bildirimi göndericisi. GitHub Actions (push.yml) her ~10 dakikada bir çalıştırır.
// Firebase'deki push/<uid> kayıtlarını okur; vakti gelmiş notları Web Push ile gönderir, gönderileni siler.
// Gerekli gizli değişkenler: FIREBASE_SERVICE_ACCOUNT (Firebase hizmet hesabı JSON), VAPID_PRIVATE_KEY.
import admin from 'firebase-admin';
import webpush from 'web-push';
import { FIREBASE_CONFIG, VAPID_PUBLIC_KEY } from '../src/config.js';

const SA = process.env.FIREBASE_SERVICE_ACCOUNT, PRIV = process.env.VAPID_PRIVATE_KEY;
if (!SA || !PRIV) { console.log('Gizli değişkenler eksik (FIREBASE_SERVICE_ACCOUNT, VAPID_PRIVATE_KEY); bildirim gönderilmedi.'); process.exit(0); }
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(SA)), databaseURL: FIREBASE_CONFIG.databaseURL });
webpush.setVapidDetails('https://github.com/katxjhuun/Eng-quest', VAPID_PUBLIC_KEY, PRIV);

const db = admin.database();
const now = Date.now();
const LATE = 6 * 3600 * 1000;   // 6 saatten eski kaçmış bildirimler gönderilmez, silinir
const snap = await db.ref('push').get();
let sent = 0, dropped = 0, gone = 0;
const jobs = [];
snap.forEach(u => {
  const v = u.val() || {}, sub = v.sub, notes = v.notes || {};
  if (!sub?.endpoint) return;
  // aynı kullanıcıya bir çalıştırmada en çok bir bildirim (en yenisi)
  const due = Object.entries(notes).filter(([, n]) => n && n.at <= now).sort((a, b) => b[1].at - a[1].at);
  if (!due.length) return;
  const [key, n] = due[0];
  const updates = {}; for (const [k] of due) updates[k] = null;
  jobs.push((async () => {
    if (now - n.at > LATE) { dropped++; await u.ref.child('notes').update(updates); return; }
    try {
      await webpush.sendNotification(sub, JSON.stringify({ title: n.title, body: n.body, tag: 'dl-' + key }), { TTL: 6 * 3600, urgency: 'normal' });
      sent++;
      await u.ref.child('notes').update(updates);
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) { gone++; await u.ref.remove(); }   // abonelik artık geçersiz
      else console.warn('gönderilemedi', u.key.slice(0, 6), e.statusCode || e.message);
    }
  })());
});
await Promise.all(jobs);
console.log(`gönderildi: ${sent}, süresi geçmiş: ${dropped}, geçersiz abonelik: ${gone}`);
await admin.app().delete();
