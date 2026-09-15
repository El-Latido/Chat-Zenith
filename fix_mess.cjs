const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /\`\\n\\nNUEVO MENSAJE DE \$\{currentUsername\}: "\$\{msg\.text\}"\` \+ \(msg\.replyTo \? \`\\n\(Este mensaje responde al mensaje de \$\{msg\.replyTo\.sender\}: "\$\{msg\.replyTo\.text\}"\)\` : ""\) \+ \`\\nResponde de forma privada como \$\{"Elizabeth"\}\.\` \+ \(msg\.replyTo \? \`\\n\(Este mensaje responde al mensaje de \$\{msg\.replyTo\.sender\}: "\$\{msg\.replyTo\.text\}"\)\` : ""\) \+ \`\\nResponde directamente como Elizabeth\.\` \+ \(msg\.replyTo \? \`\\n\(Este mensaje responde al mensaje de \$\{msg\.replyTo\.sender\}: "\$\{msg\.replyTo\.text\}"\)\` : ""\) \+ \`\\nResponde directamente como Elizabeth\.\`/g;

const replacement = '\`\\n\\nNUEVO MENSAJE DE ${currentUsername}: "${msg.text}"\` + (msg.replyTo ? \`\\n(Este mensaje responde al mensaje de ${msg.replyTo.sender}: "${msg.replyTo.text}")\` : "") + \`\\nResponde directamente como Elizabeth.\`';

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
console.log("Fixed mess.");
