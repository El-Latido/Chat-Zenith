import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import fs from "fs";
import { getAuth, signInAnonymously } from "firebase/auth";

const configPath = "firebase-applet-config.json";
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
const appInfo = initializeApp(firebaseConfig);
const fdb = getFirestore(appInfo, firebaseConfig.firestoreDatabaseId || undefined);
const auth = getAuth(appInfo);

async function test() {
  try {
    await signInAnonymously(auth);
    console.log("Signed in anonymously");
    const userDocRef = doc(fdb, "users", "test");
    const userDoc = await getDoc(userDocRef);
    console.log("Success", userDoc.exists());
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
