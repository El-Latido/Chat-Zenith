const fs = require('fs');
let code = fs.readFileSync('src/socket.ts', 'utf8');
code = code.replace('io();', "io({ transports: ['websocket'] });");
fs.writeFileSync('src/socket.ts', code);
