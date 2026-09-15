const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/behavior: 'smooth'/g, "behavior: 'auto'");
code = code.replace(/behavior: "smooth"/g, "behavior: 'auto'");

fs.writeFileSync('src/App.tsx', code);
console.log("Changed scroll behavior to auto");
