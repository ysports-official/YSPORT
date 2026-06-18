import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            "AIzaSyD-6fZ_7ZS3cnS--VGcib_f6n_S2wG5QVw",
  authDomain:        "ysports-31e37.firebaseapp.com",
  projectId:         "ysports-31e37",
  storageBucket:     "ysports-31e37.firebasestorage.app",
  messagingSenderId: "734566007827",
  appId:             "1:734566007827:web:da19d79901b6a4599d6be6",
};

// ponytail: app+firestore safe at module level. Auth intentionally NOT initialized
// here — initializeAuth() at module level crashes because firebase/auth component
// isn't registered yet when Metro executes this module. Screens call getAuth(getApp())
// inside useEffect where the runtime is ready.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db  = getFirestore(app);

export { db };
export default app;
