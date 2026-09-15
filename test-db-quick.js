import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import fs from "fs";

const configPath = "firebase-applet-config.json";
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
const appInfo = initializeApp(firebaseConfig);
const fdb = getFirestore(appInfo, firebaseConfig.firestoreDatabaseId || undefined);

async function test() {
  try {
    const userDocRef = doc(fdb, "users", "test");
    const userDoc = await getDoc(userDocRef);
    console.log("Success", userDoc.exists());
    process.exit(0);
  } catch(e) {
    console.error("Error:", e);
    process.exit(1);
  }
}
test();
