const fs = require('fs');
const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const config = JSON.parse(configStr);

let code = fs.readFileSync('src/firebaseConfig.ts', 'utf8');

const newFirebaseConfig = `const firebaseConfig = {
  apiKey: "${config.apiKey}",
  authDomain: "${config.authDomain}",
  projectId: "${config.projectId}",
  storageBucket: "${config.storageBucket}",
  messagingSenderId: "${config.messagingSenderId}",
  appId: "${config.appId}"
};`;

code = code.replace(/const firebaseConfig = \{[\s\S]*?\};/, newFirebaseConfig);

fs.writeFileSync('src/firebaseConfig.ts', code);
