const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const configPath = "firebase-applet-config.json";
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

const app = initializeApp({
  projectId: firebaseConfig.projectId,
});

const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function test() {
  try {
    const docRef = db.collection('users').doc('test');
    const doc = await docRef.get();
    console.log("Success", doc.exists);
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
