const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `                    const aiChar = [
                      "Elizabeth",
                      "Sensei",
                      "Shadow",
                      "Neko",
                    ].includes(activeChat)
                      ? {
                          username: activeChat,
                          profilePic: \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${activeChat}\`,
                          statusMessage: "Inteligencia Artificial",
                          isAi: true,
                        }
                      : null;`;

const replace = `                    const serverAiInfo = usersOnline.find((u) => u.username === activeChat);
                    const aiChar = [
                      "Elizabeth",
                      "Sensei",
                      "Shadow",
                      "Neko",
                    ].includes(activeChat)
                      ? {
                          username: activeChat,
                          profilePic: serverAiInfo?.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${activeChat}\`,
                          statusMessage: serverAiInfo?.statusMessage || "Inteligencia Artificial",
                          isAi: true,
                        }
                      : null;`;

code = code.replace(search, replace);
fs.writeFileSync('src/App.tsx', code);
console.log("Fixed AI profile picture overriding.");
