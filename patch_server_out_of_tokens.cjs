const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `        if (userCoins < 1) {
            io.to(activeUsers[currentUsername].socketId).emit("receive_private", {
                text: \`[SISTEMA] No tienes suficientes LizCoins para chatear con \${aiCharacter.name}. Ve al Selector de Personajes IA en la barra lateral para ver un video y ganar créditos.\`,
                sender: toUser,
                id: Date.now().toString()
            }, currentUsername);
            return;
        }`;
        
const replace = `        if (userCoins < 1) {
            io.to(activeUsers[currentUsername].socketId).emit("out_of_tokens", {
                aiName: aiCharacter.name
            });
            return;
        }`;

code = code.replace(search, replace);
fs.writeFileSync('server.ts', code);
