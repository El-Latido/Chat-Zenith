const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldPrompt = `          let parts = [
            {
              text:
                \`Historial de chat reciente:\` +
                contextMsgs
                  .map(
                    (m) =>
                      \`[\${new Date(m.createdAt?.seconds ? m.createdAt.seconds * 1e3 : typeof m.createdAt === "number" ? m.createdAt : Date.now()).toLocaleTimeString()}] \${m.sender}: \${m.text}\`,
                  )
                  .join("\\n") +
                \`Responde al \u00FAltimo mensaje de \${currentUsername}.\`,
            },
          ];`;

const newPrompt = `          let parts = [
            {
              text:
                \`Historial de chat reciente:\\n\` +
                contextMsgs
                  .map(
                    (m) =>
                      \`[\${new Date(m.createdAt?.seconds ? m.createdAt.seconds * 1e3 : typeof m.createdAt === "number" ? m.createdAt : Date.now()).toLocaleTimeString()}] \${m.sender}: \${m.text}\`,
                  )
                  .join("\\n") +
                \`\\n\\n---\\nNUEVO MENSAJE DE \${currentUsername}: "\${msg.text}"\\n\\nResponde directamente al nuevo mensaje como Elizabeth.\`,
            },
          ];`;

content = content.replace(oldPrompt, newPrompt);
fs.writeFileSync('server.ts', content);
