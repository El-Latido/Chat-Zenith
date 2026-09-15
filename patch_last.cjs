const fs = require('fs');
let c = fs.readFileSync('server.ts', 'utf8');

c = c.replace(/Responde al \\xFAltimo mensaje de \$\{currentUsername\}\./g, 'NUEVO MENSAJE DE ${currentUsername}: "${msg.text}"\\nResponde directamente como Elizabeth.');
c = c.replace(/Responde al \\xFAltimo mensaje de \$\{currentUsername\}: \$\{msg\.text\}/g, 'NUEVO MENSAJE DE ${currentUsername}: "${msg.text}"\\nResponde de forma privada como Elizabeth.');

fs.writeFileSync('server.ts', c);
