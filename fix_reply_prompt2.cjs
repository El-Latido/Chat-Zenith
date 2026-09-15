const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/`NUEVO MENSAJE DE \$\{currentUsername\}: "\$\{msg\.text\}"\\nResponde directamente como Elizabeth.`/g, '`NUEVO MENSAJE DE ${currentUsername}: "${msg.text}"` + (msg.replyTo ? `\\n(Este mensaje responde al mensaje de ${msg.replyTo.sender}: "${msg.replyTo.text}")` : "") + `\\nResponde directamente como Elizabeth.`');

// If that doesn't work, maybe the \n is a real newline or parsed differently. Let's do this:
let parts = code.split('`NUEVO MENSAJE DE ${currentUsername}: "${msg.text}"\\nResponde directamente como Elizabeth.`');
if (parts.length === 1) {
    console.log("Still didn't match.");
    // Try matching the template literal more dynamically
    code = code.replace(/`NUEVO MENSAJE DE \$\{currentUsername\}: "\$\{msg\.text\}"\\nResponde directamente como Elizabeth\.`/g, 
        '`NUEVO MENSAJE DE ${currentUsername}: "${msg.text}"` + (msg.replyTo ? `\\n(Este mensaje responde al mensaje de ${msg.replyTo.sender}: "${msg.replyTo.text}")` : "") + `\\nResponde directamente como Elizabeth.`');
} else {
    code = parts.join('`NUEVO MENSAJE DE ${currentUsername}: "${msg.text}"` + (msg.replyTo ? `\\n(Este mensaje responde al mensaje de ${msg.replyTo.sender}: "${msg.replyTo.text}")` : "") + `\\nResponde directamente como Elizabeth.`');
}
fs.writeFileSync('server.ts', code);
