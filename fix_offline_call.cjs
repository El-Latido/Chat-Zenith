const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `    socket.on("iniciar_llamada", (targetUser) => {
        if (!currentUsername) return;
        const callerData = {
            username: currentUsername,
            profilePic: activeUsers[currentUsername]?.profilePic || ""
        };
        if (activeUsers[targetUser]) {
            io.to(activeUsers[targetUser].socketId).emit("llamada_entrante", callerData);
        } else {
            pendingCalls[targetUser] = callerData;
        }
    });`;

const replace = `    socket.on("iniciar_llamada", async (targetUser) => {
        if (!currentUsername) return;
        const callerData = {
            username: currentUsername,
            profilePic: activeUsers[currentUsername]?.profilePic || ""
        };
        if (activeUsers[targetUser]) {
            io.to(activeUsers[targetUser].socketId).emit("llamada_entrante", callerData);
        } else {
            pendingCalls[targetUser] = callerData;
            // Guardar notificación offline en Firebase para el usuario
            if (fdb) {
                try {
                    await addDoc(collection(fdb, "notifications"), {
                        recipientUid: targetUser,
                        senderUid: currentUsername,
                        senderName: currentUsername,
                        type: "llamada_perdida",
                        message: \`Llamada perdida de \${currentUsername}\`,
                        isRead: false,
                        timestamp: Date.now(),
                    });
                } catch(e) {
                    console.log("Error guardando notif offline:", e);
                }
            }
        }
    });`;

code = code.replace(search, replace);
fs.writeFileSync('server.ts', code);
