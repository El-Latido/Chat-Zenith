const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const sendPrivateMod = `      const modResult = await moderateMessage(msg, ai);
      if (modResult.banned) {
        bannedUsers[currentUsername] = Date.now() + 15 * 60 * 1e3;
        io.to(socket.id).emit("banned_status", { isBanned: true });
        const banMsg = {
          text: \`\u{1F6A8} El usuario \${currentUsername} ha sido baneado por 15 minutos debido a: \${modResult.reason}.\`,
          sender: "Elizabeth",
          id: Date.now().toString(),
          createdAt: Date.now(),
        };
        if (fdb)
          addDoc(collection(fdb, "global_chat"), {
            ...banMsg,
            timestamp: serverTimestamp(),
          }).catch((e) => console.error("Firebase addDoc Error:", e));
        io.emit("receive_global", banMsg);
        return callback({
          success: false,
          error: \`Has sido baneado por contenido inapropiado: \${modResult.reason}\`,
        });
      }`;

const sendPrivateModReplacement = `      const modResult = await moderateMessage(msg, ai);
      if (modResult.banned) {
        bannedUsers[currentUsername] = Date.now() + 15 * 60 * 1e3;
        io.to(socket.id).emit("banned_status", { isBanned: true });
        const banMsg = {
          text: \\\`🚨 El usuario \${currentUsername} ha sido baneado por 15 minutos. Razón: \${modResult.reason}\\\`,
          sender: "Elizabeth",
          profilePic: "",
          isAi: true,
          id: Date.now().toString(),
          createdAt: Date.now(),
        };
        if (fdb)
          addDoc(collection(fdb, "global_chat"), {
            ...banMsg,
            timestamp: serverTimestamp(),
          }).catch((e) => console.error("Firebase addDoc Error:", e));
        io.emit("receive_global", banMsg);
        return callback({
          success: false,
          error: \\\`Has sido baneado por contenido inapropiado: \${modResult.reason}\\\`,
        });
      } else if (modResult.isWarning) {
        return callback({
          success: false,
          error: \\\`⚠️ \${modResult.reason}\\\`,
        });
      }`;

code = code.replace(sendPrivateMod, sendPrivateModReplacement.replace(/\\`/g, '`'));
fs.writeFileSync('server.ts', code);
console.log("Patched warning in send_private");
