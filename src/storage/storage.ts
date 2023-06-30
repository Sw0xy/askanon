import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { env } from "~/env.mjs";
const firebaseConfig = {
  apiKey: env.FIREBASE_apiKey,
  authDomain: env.FIREBASE_authDomain,
  projectId: env.FIREBASE_projectId,
  storageBucket: env.FIREBASE_storageBucket,
  messagingSenderId: env.FIREBASE_messagingSenderId,
  appId: env.FIREBASE_appId,
  measurementId: env.FIREBASE_measurementId,
};
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
