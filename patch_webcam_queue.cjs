const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    let webcamQueue = [];
    socket.on("join_webcam_queue", (data) => {`;

const replacement = `    socket.on("join_webcam_queue", (data) => {`;

code = code.replace(target, replacement);

const topTarget = `let djStreamUrl = "https://listen.moe/stream";`;
const topReplacement = `let djStreamUrl = "https://listen.moe/stream";
let webcamQueue = [];`;

code = code.replace(topTarget, topReplacement);

fs.writeFileSync('server.ts', code);
console.log("Patched webcam queue to be global");
