const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `    socket.on("admin_ban_user", (targetUser, callback) => {`;
const replace = `    socket.on("report_user", async (data) => {
      if (!currentUsername) return;
      const { target, reason, proofBase64 } = data;
      if (fdb) {
          try {
             const { collection, addDoc } = require("firebase/firestore");
             await addDoc(collection(fdb, "reports"), {
                 reporter: currentUsername,
                 target,
                 reason,
                 proofBase64,
                 createdAt: Date.now()
             });
          } catch(e) { console.error("Error saving report", e); }
      }
      
      // Notify admins
      for (const un in activeUsers) {
          if (activeUsers[un].role === "admin") {
              io.to(activeUsers[un].socketId).emit("receive_global", {
                  sender: "Sistema",
                  text: \`\u{1F6A8} NUEVO REPORTE: \${currentUsername} reportó a \${target}. Motivo: \${reason}\`,
                  id: Date.now().toString()
              });
          }
      }
    });

    socket.on("admin_ban_user", (targetUser, callback) => {`;

code = code.replace(search, replace);
fs.writeFileSync('server.ts', code);
