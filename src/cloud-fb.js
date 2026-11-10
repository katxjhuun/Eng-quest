// Firebase SDK'sı ayrı parça olarak yüklenir (uygulamanın ilk açılışını hızlandırmak için).
export { initializeApp } from 'firebase/app';
export { initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, inMemoryPersistence, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
export { getDatabase, ref, set, update, onValue, onDisconnect, serverTimestamp, onChildAdded, remove, goOffline, goOnline, get, query, orderByChild, limitToLast } from 'firebase/database';
