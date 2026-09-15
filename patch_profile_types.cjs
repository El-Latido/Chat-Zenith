const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(/profileComments\?:\s*\{[^}]+\}\[\];/, 'profileComments?: { author: string, text: string, timestamp: number, stars?: number }[];');
fs.writeFileSync('src/types.ts', code);
console.log("Patched types");
