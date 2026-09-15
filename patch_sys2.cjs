const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The one around 1809 is global chat (Elizabeth)
code = code.replace(/const sysInstruction = aiUserTempCache\[aiCharacter\.id\]\?.systemInstruction\s*\?\s*`\$\{baseSysInstruction\}[\s\S]*?\$\{aiUserTempCache\[aiCharacter\.id\].systemInstruction\}`\s*:\s*baseSysInstruction;/, 
`const sysInstruction = aiUserTempCache["Elizabeth"]?.systemInstruction
            ? \`\$\{baseSysInstruction\}\\nInstrucciones adicionales del Administrador:\\n\$\{aiUserTempCache["Elizabeth"].systemInstruction\}\`
            : baseSysInstruction;`);
            
// The one around 2366 is private chat
code = code.replace(/const sysInstruction = aiUserTempCache\?.systemInstruction\s*\?\s*`\$\{baseSysInstruction\}[\s\S]*?\$\{aiUserTempCache\.systemInstruction\}`\s*:\s*baseSysInstruction;/, 
`const sysInstruction = aiUserTempCache[aiCharacter.id]?.systemInstruction
            ? \`\$\{baseSysInstruction\}\\nInstrucciones adicionales del Administrador:\\n\$\{aiUserTempCache[aiCharacter.id].systemInstruction\}\`
            : baseSysInstruction;`);

fs.writeFileSync('server.ts', code);
