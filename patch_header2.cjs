const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = `const isOnline = !!usersOnline.find(u => u.username === activeChat);`;
const replace = `const isOnline = !!aiChar || !!usersOnline.find(u => u.username === activeChat);`;

code = code.replace(anchor, replace);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched isOnline");
