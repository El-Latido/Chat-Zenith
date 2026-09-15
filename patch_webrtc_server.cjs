const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace the previous call events
const oldCallEvents = `    socket.on("iniciar_llamada", (targetUser) => {
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
    });`;

const newCallEvents = `    socket.on("iniciar_llamada", (targetUser) => {
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
    });

    socket.on("cancelar_llamada", (targetUser) => {
        if (!currentUsername) return;
        if (activeUsers[targetUser]) {
            io.to(activeUsers[targetUser].socketId).emit("llamada_cancelada", currentUsername);
        }
        if (pendingCalls[targetUser]?.username === currentUsername) {
            delete pendingCalls[targetUser];
        }
    });

    socket.on("responder_llamada", (data) => {
        if (!currentUsername) return;
        if (pendingCalls[currentUsername]?.username === data.targetUser) {
            delete pendingCalls[currentUsername];
        }
        if (activeUsers[data.targetUser]) {
            io.to(activeUsers[data.targetUser].socketId).emit("respuesta_llamada", {
                responder: currentUsername,
                profilePic: activeUsers[currentUsername]?.profilePic || "",
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

    // WebRTC Signaling
    socket.on("webrtc_offer", (data) => {
        if (activeUsers[data.target]) {
            io.to(activeUsers[data.target].socketId).emit("webrtc_offer", {
                sender: currentUsername,
                sdp: data.sdp
            });
        }
    });
    socket.on("webrtc_answer", (data) => {
        if (activeUsers[data.target]) {
            io.to(activeUsers[data.target].socketId).emit("webrtc_answer", {
                sender: currentUsername,
                sdp: data.sdp
            });
        }
    });
    socket.on("webrtc_ice_candidate", (data) => {
        if (activeUsers[data.target]) {
            io.to(activeUsers[data.target].socketId).emit("webrtc_ice_candidate", {
                sender: currentUsername,
                candidate: data.candidate
            });
        }
    });
    socket.on("end_call", (targetUser) => {
        if (activeUsers[targetUser]) {
            io.to(activeUsers[targetUser].socketId).emit("call_ended", currentUsername);
        }
    });`;

code = code.replace(oldCallEvents, newCallEvents);

fs.writeFileSync('server.ts', code);
console.log("Patched server for WebRTC");
