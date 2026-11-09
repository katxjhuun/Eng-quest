// Firebase Realtime Database kurallarının izin/ret testleri (targaryen simülatörü).
// Çalıştırma: npm run test:rules
const targaryen = require('targaryen');
const rules = require('../database.rules.json');
const NOW = Date.now();
const data = { admins: { adminUid: true }, users: { u1: { profile: { shortId: 'DL-ABCDE' }, inbox: { m1: { type: 'message', title: 't', text: 'x', at: NOW } } }, u2: { profile: { shortId: 'DL-ZZZZZ' } } }, history: { u1: { h1: { type: 'xp', amount: 5, seenAt: NOW } } } };
const db = targaryen.database(rules, data, NOW).with({ debug: false });
const anon = uid => ({ uid, provider: 'anonymous', token: { firebase: { sign_in_provider: 'anonymous' } } });
const admin = { uid: 'adminUid', provider: 'google', token: { email: 'a@b.c', email_verified: true, firebase: { sign_in_provider: 'google.com' } } };
const googleNotAdmin = { uid: 'g2', provider: 'google', token: { email: 'x@y.z', email_verified: true, firebase: { sign_in_provider: 'google.com' } } };
const anonAdminUid = { uid: 'adminUid', token: { firebase: { sign_in_provider: 'anonymous' } } };
let pass = 0, fail = 0;
function t(name, expect, res) { const ok = res.allowed === expect; ok ? pass++ : fail++; console.log(`${ok ? 'OK  ' : 'FAIL'} ${expect ? 'allow' : 'deny '} ${name}${ok ? '' : '\n' + res.info}`); }
const goodStats = { shortId: 'DL-ABCDE', xp: 10, level: 'A1', levelLabel: 'Başlangıç', levelIndex: 0, total: 12, catXp: { mat: 2 }, correct: 1, wrong: 0, streak: 1, opened: 0, failed: 0, mode: 'quiz', cat: 'en', dept: 'genel', theme: 'krem', badges: 0, updatedAt: NOW };
// kullanıcı kendi verisi
t('anon writes own stats', true, db.as(anon('u1')).write('/users/u1/stats', goodStats));
t('anon writes own profile', true, db.as(anon('u1')).update('/users/u1/profile', { shortId: 'DL-ABCDE', platform: 'android', appVersion: '2.1.1', lastOpen: NOW }));
t('anon writes own status', true, db.as(anon('u1')).write('/users/u1/status', { state: 'online', last: NOW }));
t('anon writes own live', true, db.as(anon('u1')).write('/users/u1/live', { cat: 'mat', catLabel: 'Matematik', mode: 'Pop Quiz', question: 'Soru?', answer: 'A', options: ['A', 'B', 'C', 'D'], state: 'cevaplıyor', at: NOW }));
t('anon reads own node', true, db.as(anon('u1')).read('/users/u1'));
t('anon deletes delivered inbox msg', true, db.as(anon('u1')).write('/users/u1/inbox/m1', null));
t('anon writes history entry', true, db.as(anon('u1')).write('/history/u1/h2', { type: 'message', title: 't', text: 'x', at: NOW, seenAt: NOW }));
t('anon deletes all own data', true, db.as(anon('u1')).write('/users/u1', null));
// kötüye kullanım
t('anon XSS in stats.total (string)', false, db.as(anon('u1')).write('/users/u1/stats', { ...goodStats, total: '<img src=x onerror=alert(1)>' }));
t('anon unknown stats key', false, db.as(anon('u1')).write('/users/u1/stats', { ...goodStats, email: 'a@b.c' }));
t('anon bad shortId', false, db.as(anon('u1')).update('/users/u1/profile', { shortId: '<b>x</b>' }));
t('anon huge question', false, db.as(anon('u1')).update('/users/u1/live', { question: 'x'.repeat(5000) }));
t('anon unknown top key under user', false, db.as(anon('u1')).write('/users/u1/notes', 'hi'));
t('anon reads other user', false, db.as(anon('u1')).read('/users/u2'));
t('anon reads all users', false, db.as(anon('u1')).read('/users'));
t('anon writes other user stats', false, db.as(anon('u1')).write('/users/u2/stats', goodStats));
t('anon sends itself inbox msg', false, db.as(anon('u1')).write('/users/u1/inbox/m9', { type: 'xp', amount: 9999, at: NOW }));
t('anon edits history entry', false, db.as(anon('u1')).write('/history/u1/h1', { type: 'xp', amount: 99999, seenAt: NOW }));
t('anon reads history', false, db.as(anon('u1')).read('/history/u1'));
t('anon reads admins', false, db.as(anon('u1')).read('/admins'));
t('anon writes admins (self-promote)', false, db.as(anon('u1')).write('/admins/u1', true));
t('anon reads labels', false, db.as(anon('u1')).read('/admin/labels'));
t('unauth reads users', false, db.as(null).read('/users'));
t('unauth writes stats', false, db.as(null).write('/users/u1/stats', goodStats));
t('anon with admin uid but not google', false, db.as(anonAdminUid).read('/users'));
t('google non-admin reads users', false, db.as(googleNotAdmin).read('/users'));
t('google non-admin sends msg', false, db.as(googleNotAdmin).write('/users/u1/inbox/m5', { type: 'message', title: 'a', text: 'b', at: NOW }));
// yönetici
t('admin reads users', true, db.as(admin).read('/users'));
t('admin reads history', true, db.as(admin).read('/history'));
t('admin sends xp', true, db.as(admin).write('/users/u1/inbox/m5', { type: 'xp', amount: 10, cat: 'mat', text: 'Bravo', at: NOW, by: 'admin' }));
t('admin sends reward', true, db.as(admin).write('/users/u1/inbox/m6', { type: 'reward', emoji: '🏆', title: 'Ödül', text: 'Tebrikler', amount: 25, cat: 'en', music: true, at: NOW, by: 'admin' }));
t('admin bad msg type', false, db.as(admin).write('/users/u1/inbox/m7', { type: 'script', at: NOW }));
t('admin sets label', true, db.as(admin).write('/admin/labels/u1', 'Damla'));
t('admin deletes user', true, db.as(admin).write('/users/u2', null));
t('admin cannot add admins', false, db.as(admin).write('/admins/x', true));
t('admin reads own admin flag', true, db.as(admin).read('/admins/adminUid'));
// pet
const goodPet = { species: 'cat', stage: 3, stars: 0, name: 'Mırnav', alive: true, hp: 90, hpMax: 154, food: 60, foodMax: 118, energy: 80, energyMax: 118, stuffed: 0, flow: false, roam: true, mood: 'idle', streak: 2, correct: 40, answers: 55, revives: 1, memorial: 0, catchUp: 0, updatedAt: NOW };
t('anon writes own pet', true, db.as(anon('u1')).write('/users/u1/pet', goodPet));
t('anon removes own pet', true, db.as(anon('u1')).write('/users/u1/pet', null));
t('anon pet bad species', false, db.as(anon('u1')).write('/users/u1/pet', { ...goodPet, species: 'dragon' }));
t('anon pet long name', false, db.as(anon('u1')).write('/users/u1/pet', { ...goodPet, name: 'x'.repeat(40) }));
t('anon pet unknown key', false, db.as(anon('u1')).write('/users/u1/pet', { ...goodPet, owner: 'a@b.c' }));
t('anon writes other pet', false, db.as(anon('u1')).write('/users/u2/pet', goodPet));
t('anon sends itself pet command', false, db.as(anon('u1')).write('/users/u1/inbox/p1', { type: 'pet', action: 'restore', at: NOW }));
t('admin sends pet restore', true, db.as(admin).write('/users/u1/inbox/p2', { type: 'pet', action: 'restore', at: NOW, by: 'admin' }));
t('admin sends pet set', true, db.as(admin).write('/users/u1/inbox/p3', { type: 'pet', action: 'set', hp: 50, food: 100, energy: 20, at: NOW, by: 'admin' }));
t('admin sends pet say', true, db.as(admin).write('/users/u1/inbox/p4', { type: 'pet', action: 'say', text: 'Merhaba!', emote: 'love', at: NOW, by: 'admin' }));
t('admin pet bad action', false, db.as(admin).write('/users/u1/inbox/p5', { type: 'pet', action: 'explode', at: NOW }));
t('admin pet hp over 100', false, db.as(admin).write('/users/u1/inbox/p6', { type: 'pet', action: 'set', hp: 500, at: NOW }));
t('admin pet stage over 5', false, db.as(admin).write('/users/u1/inbox/p7', { type: 'pet', action: 'stage', stage: 9, at: NOW }));
console.log(`\n${pass} geçti, ${fail} başarısız`);
process.exit(fail ? 1 : 0);
