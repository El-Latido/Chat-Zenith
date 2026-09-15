const fs = require('fs');
let code = fs.readFileSync('src/components/FriendsWebcam.tsx', 'utf8');

code = code.replace(/\\`/g, "`");

fs.writeFileSync('src/components/FriendsWebcam.tsx', code);
console.log("Fixed backticks in FriendsWebcam");

let code2 = fs.readFileSync('src/components/ActiveCallModal.tsx', 'utf8');
code2 = code2.replace(/\\`/g, "`");
fs.writeFileSync('src/components/ActiveCallModal.tsx', code2);
console.log("Fixed backticks in ActiveCallModal");

