const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const sendGlobalMod = `      const modResult = await moderateMessage(msg, ai);
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
        else {
          fallbackState.globalMessages.push(banMsg);
          saveFallbackDB();
        }
        io.emit("receive_global", banMsg);
        return;
      }`;

const sendGlobalModReplacement = `      const modResult = await moderateMessage(msg, ai);
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
        else {
          fallbackState.globalMessages.push(banMsg);
          saveFallbackDB();
        }
        io.emit("receive_global", banMsg);
        return;
      } else if (modResult.isWarning) {
        const warnMsg = {
          text: \\\`⚠️ \${currentUsername}, \${modResult.reason}\\\`,
          sender: "Elizabeth",
          profilePic: "",
          isAi: true,
          id: Date.now().toString(),
          createdAt: Date.now(),
        };
        if (fdb) addDoc(collection(fdb, "global_chat"), { ...warnMsg, timestamp: serverTimestamp() }).catch(e => console.error(e));
        io.emit("receive_global", warnMsg);
        return;
      }`;

code = code.replace(sendGlobalMod, sendGlobalModReplacement.replace(/\\`/g, '`'));
fs.writeFileSync('server.ts', code);
console.log("Patched warning in send_global");
