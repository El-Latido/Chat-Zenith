const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
if (!code.includes('addDoc,')) {
    code = code.replace('onSnapshot,', 'onSnapshot, addDoc,');
    fs.writeFileSync('server.ts', code);
}
