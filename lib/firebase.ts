import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDk5gwNjJJYfRtAs540q_acwhYgZzMUGn8",
  authDomain: "vidcheck-3c3bc.firebaseapp.com",
  databaseURL: "https://vidcheck-3c3bc-default-rtdb.firebaseio.com",
  projectId: "vidcheck-3c3bc",
  storageBucket: "vidcheck-3c3bc.firebasestorage.app",
  messagingSenderId: "785391713841",
  appId: "1:785391713841:web:9b5064429a23dbc7e89f10",
  measurementId: "G-YJ4PVFKL90"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((ok) => {
    if (ok) analytics = getAnalytics(app);
  });
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    console.log("Firebase persistence error:", err);
  });
}
