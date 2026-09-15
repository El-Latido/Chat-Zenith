import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

let fdb: any = null;
let fStorage: any = null;

try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  let firebaseConfig: any = null;
  
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } else if (process.env.FIREBASE_CONFIG) {
     try {
       firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
     } catch (e) {
       console.error("Invalid FIREBASE_CONFIG env var");
     }
  } else if (process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY) {
     firebaseConfig = {
        apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || "eighth-ability-8szp9.firebaseapp.com",
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "eighth-ability-8szp9",
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "eighth-ability-8szp9.appspot.com",
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || "389253128291",
        appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || "1:389253128291:web:087a456f72bbc4bf0b1856", firestoreDatabaseId: "ai-studio-chatliz-19b8032a-22a9-4b1d-9b50-b3d4b9771a26"
     };
  }

  if (firebaseConfig) {
    const appInfo = initializeApp(firebaseConfig);
    fdb = getFirestore(appInfo, firebaseConfig.firestoreDatabaseId || undefined);
    fStorage = getStorage(appInfo);
    console.log("Firebase initialized");
  } else {
    console.warn("No Firebase configuration found. Using fallback local storage.");
  }
} catch(e) {
  console.error("Firebase initialization failed:", e);
}

export { fdb, fStorage };
