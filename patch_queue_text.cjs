const fs = require('fs');
let code = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

code = code.replace(/En Cola \(\{songQueue\.length\}\)/g, 'En Cola ({songQueue.length}/20)');

fs.writeFileSync('src/components/InlineRadio.tsx', code);
console.log("Patched queue text");
