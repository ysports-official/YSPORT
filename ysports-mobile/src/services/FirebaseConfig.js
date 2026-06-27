import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            "AIzaSyD-6fZ_7ZS3cnS--VGcib_f6n_S2wG5QVw",
  authDomain:        "ysports-31e37.firebaseapp.com",
  projectId:         "ysports-31e37",
  storageBucket:     "ysports-31e37.firebasestorage.app",
  messagingSenderId: "734566007827",
  appId:             "1:734566007827:web:da19d79901b6a4599d6be6",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// initializeAuth must run synchronously at module load — before any React render
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (_) {
  // Already initialized (hot reload or duplicate import)
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };
export default app;
