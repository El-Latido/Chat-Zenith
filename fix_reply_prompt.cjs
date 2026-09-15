const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = '`NUEVO MENSAJE DE ${currentUsername}: "${msg.text}"\\nResponde directamente como Elizabeth.`';
const replace1 = '`\\nNUEVO MENSAJE DE ${currentUsername}: "${msg.text}"` + (msg.replyTo ? `\\n(Este mensaje responde al mensaje de ${msg.replyTo.sender}: "${msg.replyTo.text}")` : "") + `\\nResponde directamente como Elizabeth.`';

code = code.replace(target1, replace1);

const target2 = '`NUEVO MENSAJE DE ${currentUsername}: "${msg.text}"\\nResponde directamente como Elizabeth.`';
// Actually, it might be exactly the same for both.
// Let's use regex to be safe.
code = code.replace(/`NUEVO MENSAJE DE \$\{currentUsername\}: "\$\{msg\.text\}"\\nResponde directamente como Elizabeth.`/g, replace1);

fs.writeFileSync('server.ts', code);
