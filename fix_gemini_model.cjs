const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/"gemini-2\.5-flash"/g, '"gemini-1.5-flash"');

fs.writeFileSync('server.ts', code);
console.log("Changed Gemini model to gemini-1.5-flash");
