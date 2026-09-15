const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

let idx = code.indexOf('NUEVO MENSAJE DE ${currentUsername}: "${msg.text}"');
console.log(idx);
if (idx !== -1) {
   let substr = code.substring(idx - 10, idx + 80);
   console.log(JSON.stringify(substr));
}
