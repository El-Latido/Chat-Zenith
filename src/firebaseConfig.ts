import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBgTuV7xHa3PAPSzacRsEkcnJ59Fukye1A",
  authDomain: "eighth-ability-8szp9.firebaseapp.com",
  projectId: "eighth-ability-8szp9",
  storageBucket: "eighth-ability-8szp9.firebasestorage.app",
  messagingSenderId: "389253128291",
  appId: "1:389253128291:web:087a456f72bbc4bf0b1856"
};

const databaseId = "ai-studio-chatliz-19b8032a-22a9-4b1d-9b50-b3d4b9771a26";

let app: any;
let db: any;
let auth: any;
let storage: any;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app, databaseId);
  auth = getAuth(app);
  storage = getStorage(app);
} catch (e) {
  console.error("Firebase frontend initialization failed:", e);
  // Prevent complete crash
  db = {} as any;
  auth = {} as any;
  storage = {} as any;
}

export { app, db, auth, storage };
