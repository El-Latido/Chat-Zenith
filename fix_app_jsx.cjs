const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
console.log(code.slice(2000, 2600));
