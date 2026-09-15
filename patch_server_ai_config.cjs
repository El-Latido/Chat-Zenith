const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /statusMessage: data\.statusMessage,\s*systemInstruction: data\.systemInstruction\s*\};/;
const replacement = `statusMessage: data.statusMessage,
          systemInstruction: data.systemInstruction,
          bubbleColor: data.bubbleColor,
          bubbleBorder: data.bubbleBorder,
          bubbleShape: data.bubbleShape,
          bubbleTexture: data.bubbleTexture
        };`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
console.log("Patched server update_ai_config");
