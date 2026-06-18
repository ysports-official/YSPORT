import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, inMemoryPersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            "AIzaSyD-6fZ_7ZS3cnS--VGcib_f6n_S2wG5QVw",
  authDomain:        "ysports-31e37.firebaseapp.com",
  projectId:         "ysports-31e37",
  storageBucket:     "ysports-31e37.firebasestorage.app",
  messagingSenderId: "734566007827",
  appId:             "1:734566007827:web:da19d79901b6a4599d6be6",
};

let app, auth;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  // ponytail: try/catch — Metro production occasionally strips firebase/auth
  // component registration; getAuth() fallback keeps app alive either way
  try {
    auth = initializeAuth(app, { persistence: inMemoryPersistence });
  } catch (_) {
    auth = getAuth(app);
  }
} else {
  app  = getApp();
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };
export default app;
