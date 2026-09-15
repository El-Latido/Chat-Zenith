const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const videoEvents = `
    socket.on("video_request", (targetUser) => {
        if (activeUsers[targetUser]) {
            io.to(activeUsers[targetUser].socketId).emit("video_request", currentUsername);
        }
    });

    socket.on("video_response", (data) => {
        if (activeUsers[data.target]) {
            io.to(activeUsers[data.target].socketId).emit("video_response", {
                sender: currentUsername,
                accepted: data.accepted
            });
        }
    });
`;

code = code.replace(/socket\.on\("end_call"/, videoEvents + '\n    socket.on("end_call"');

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with video events");
