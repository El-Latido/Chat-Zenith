const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const webcamQueueBlock = `    let webcamQueue = [];
    socket.on("join_webcam_queue", () => {
        if (!currentUsername) return;
        if (!webcamQueue.includes(socket.id)) {
            webcamQueue.push(socket.id);
        }
        if (webcamQueue.length >= 2) {
            const peer1 = webcamQueue.shift();
            const peer2 = webcamQueue.shift();
            io.to(peer1).emit("webcam_matched", { initiator: true, partnerSocket: peer2 });
            io.to(peer2).emit("webcam_matched", { initiator: false, partnerSocket: peer1 });
        }
    });
    socket.on("leave_webcam_queue", () => {
        webcamQueue = webcamQueue.filter(id => id !== socket.id);
    });`;

const webcamQueueReplace = `    let webcamQueue = [];
    socket.on("join_webcam_queue", (data) => {
        if (!currentUsername) return;
        const customName = data?.name || currentUsername;
        
        webcamQueue = webcamQueue.filter(p => p.id !== socket.id); // remove if exists
        webcamQueue.push({ id: socket.id, name: customName });
        
        if (webcamQueue.length >= 2) {
            const peer1 = webcamQueue.shift();
            const peer2 = webcamQueue.shift();
            io.to(peer1.id).emit("webcam_matched", { initiator: true, partnerSocket: peer2.id, partnerName: peer2.name });
            io.to(peer2.id).emit("webcam_matched", { initiator: false, partnerSocket: peer1.id, partnerName: peer1.name });
        }
    });
    socket.on("leave_webcam_queue", () => {
        webcamQueue = webcamQueue.filter(p => p.id !== socket.id);
    });`;

code = code.replace(webcamQueueBlock, webcamQueueReplace);
code = code.replace(/webcamQueue = webcamQueue\.filter\(id => id !== socket\.id\);/g, `webcamQueue = webcamQueue.filter(p => p.id !== socket.id);`);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts webcam queue");
