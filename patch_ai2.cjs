const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /\`Historial de chat reciente:\` \+[\s\S]*? \`Responde al \\xFAltimo mensaje de \$\{currentUsername\}\.\`,/g,
  `\`Historial de chat reciente:\\n\` +
  contextMsgs.map((m) => \`[\${new Date(m.createdAt?.seconds ? m.createdAt.seconds * 1e3 : typeof m.createdAt === "number" ? m.createdAt : Date.now()).toLocaleTimeString()}] \${m.sender}: \${m.text}\`).join("\\n") +
  \`\\n\\nNUEVO MENSAJE DE \${currentUsername}: "\${msg.text}"\\n\\nResponde al nuevo mensaje de \${currentUsername}.\`,`
);

// also for the private message one (search for `Historial de chat privado con`)
content = content.replace(
  /\`Historial de chat privado con \$\{currentUsername\}:\` \+[\s\S]*? \`Responde al \\xFAltimo mensaje de \$\{currentUsername\}\.\`,/g,
  `\`Historial de chat privado con \${currentUsername}:\\n\` +
  contextMsgs.map((m) => \`[\${new Date(m.createdAt?.seconds ? m.createdAt.seconds * 1e3 : typeof m.createdAt === "number" ? m.createdAt : Date.now()).toLocaleTimeString()}] \${m.sender}: \${m.text}\`).join("\\n") +
  \`\\n\\nNUEVO MENSAJE DE \${currentUsername}: "\${msg.text}"\\n\\nResponde de forma privada al nuevo mensaje de \${currentUsername}.\`,`
);


fs.writeFileSync('server.ts', content);
