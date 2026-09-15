const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Insert pendingCalls
code = code.replace(/const chessGames = \{\};/, 'const chessGames = {};\n  const pendingCalls = {};');

// Insert socket events
const socketEvents = `
    socket.on("iniciar_llamada", (targetUser) => {
        if (!currentUsername) return;
        if (activeUsers[targetUser]) {
            io.to(activeUsers[targetUser].socketId).emit("llamada_entrante", currentUsername);
        } else {
            pendingCalls[targetUser] = currentUsername;
        }
    });

    socket.on("responder_llamada", (data) => {
        if (!currentUsername) return;
        if (pendingCalls[currentUsername] === data.targetUser) {
            delete pendingCalls[currentUsername];
        }
        if (activeUsers[data.targetUser]) {
            io.to(activeUsers[data.targetUser].socketId).emit("respuesta_llamada", {
                responder: currentUsername,
                accepted: data.accepted
            });
        }
    });

    socket.on("check_pending_calls", () => {
        if (!currentUsername) return;
        if (pendingCalls[currentUsername]) {
            socket.emit("llamada_entrante", pendingCalls[currentUsername]);
        }
    });
`;

code = code.replace(/socket\.on\("reconnect_user"/, socketEvents + '\n    socket.on("reconnect_user"');

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with calls logic");
