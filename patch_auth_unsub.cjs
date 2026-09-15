const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /onAuthStateChanged\(auth, \(authUser\) => \{/g,
  'const authUnsubscribe = onAuthStateChanged(auth, (authUser) => {'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched authUnsubscribe");
