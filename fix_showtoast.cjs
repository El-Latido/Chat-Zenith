const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/showToast\(([^,]+),\s*"[^"]+"\)/g, 'alert($1)');
fs.writeFileSync('src/App.tsx', code);
