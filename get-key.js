import fs from "fs";
const firebaseConfig = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
console.log(firebaseConfig.apiKey);
