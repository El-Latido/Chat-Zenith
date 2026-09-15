const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `const sysInstruction = aiUserTempCache?.systemInstruction
            ? \`\$\{baseSysInstruction\}
Instrucciones adicionales del Administrador:
\$\{aiUserTempCache.systemInstruction\}\`
            : baseSysInstruction;`;
const rep1 = `const sysInstruction = aiUserTempCache["Elizabeth"]?.systemInstruction
            ? \`\$\{baseSysInstruction\}
Instrucciones adicionales del Administrador:
\$\{aiUserTempCache["Elizabeth"].systemInstruction\}\`
            : baseSysInstruction;`;
            
code = code.replace(target1, rep1);

const target2 = `const sysInstruction = aiUserTempCache?.systemInstruction
            ? \`\$\{baseSysInstruction\}

Instrucciones adicionales del Administrador:
\$\{aiUserTempCache.systemInstruction\}\`
            : baseSysInstruction;`;
const rep2 = `const sysInstruction = aiUserTempCache[aiCharacter.id]?.systemInstruction
            ? \`\$\{baseSysInstruction\}
Instrucciones adicionales del Administrador:
\$\{aiUserTempCache[aiCharacter.id].systemInstruction\}\`
            : baseSysInstruction;`;
            
code = code.replace(target2, rep2);

fs.writeFileSync('server.ts', code);
