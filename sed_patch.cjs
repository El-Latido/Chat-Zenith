const fs = require('fs');
let c = fs.readFileSync('server.ts', 'utf8');

c = c.replace(
  /\`Historial de chat reciente:\` \+[\s\S]*?\`Responde al \\xFAltimo mensaje de \$\{currentUsername\}\.\`,/g,
  `\`Historial de chat reciente:\\n\` +
                contextMsgs
                  .map(
                    (m) =>
                      \`[\${new Date(m.createdAt?.seconds ? m.createdAt.seconds * 1e3 : typeof m.createdAt === "number" ? m.createdAt : Date.now()).toLocaleTimeString()}] \${m.sender}: \${m.text}\`,
                  )
                  .join("\\n") +
                \`\\n\\nNUEVO MENSAJE DE \${currentUsername}: "\${msg.text}"\\nResponde directamente a este nuevo mensaje como Elizabeth.\`,`
);

c = c.replace(
  /\`Historial de chat privado con \$\{currentUsername\}:\` \+[\s\S]*?\`Responde al \\xFAltimo mensaje de \$\{currentUsername\}\.\`,/g,
  `\`Historial de chat privado con \${currentUsername}:\\n\` +
                contextMsgs
                  .map(
                    (m) =>
                      \`[\${new Date(m.timestamp?.seconds ? m.timestamp.seconds * 1e3 : typeof m.timestamp === "number" ? m.timestamp : Date.now()).toLocaleTimeString()}] \${m.sender}: \${m.text}\`,
                  )
                  .join("\\n") +
                \`\\n\\nNUEVO MENSAJE DE \${currentUsername}: "\${msg.text}"\\nResponde de forma privada y directa a este nuevo mensaje como Elizabeth.\`,`
);

fs.writeFileSync('server.ts', c);
