const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

let idx = code.indexOf('NUEVO MENSAJE DE ${currentUsername}: "${msg.text}"');
if (idx !== -1) {
   let startIdx = idx - 10;
   let endIdx = code.indexOf('`', idx);
   
   let matched = code.substring(startIdx, endIdx + 1);
   console.log("Found:", JSON.stringify(matched));
   
   // Do a direct slice and concat
   let before = code.substring(0, startIdx);
   let after = code.substring(endIdx + 1);
   
   let replace = '       `\\n\\nNUEVO MENSAJE DE ${currentUsername}: "${msg.text}"` + (msg.replyTo ? `\\n(Este mensaje responde al mensaje de ${msg.replyTo.sender}: "${msg.replyTo.text}")` : "") + `\\nResponde directamente como Elizabeth.`';
   
   code = before + replace + after;
   fs.writeFileSync('server.ts', code);
   console.log("Patched successfully!");
}
