const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const i = code.indexOf('socket.on("send_global", async (msg) => {');
if (i !== -1) {
    const fn = `    socket.on("message_reaction", (data) => {
        socket.broadcast.emit("message_reaction", data);
    });

`;
    code = code.slice(0, i) + fn + code.slice(i);
    fs.writeFileSync('server.ts', code);
} else {
    console.log("Could not find send_global");
}
