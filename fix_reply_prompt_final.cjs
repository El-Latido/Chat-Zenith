const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = '`\\n\\nNUEVO MENSAJE DE ${currentUsername}: "${msg.text}"\\nResponde directamente como Elizabeth.`';
const replaceStr = '`\\n\\nNUEVO MENSAJE DE ${currentUsername}: "${msg.text}"` + (msg.replyTo ? `\\n(Este mensaje responde al mensaje de ${msg.replyTo.sender}: "${msg.replyTo.text}")` : "") + `\\nResponde directamente como Elizabeth.`';

code = code.replace(targetStr, replaceStr);

fs.writeFileSync('server.ts', code);
