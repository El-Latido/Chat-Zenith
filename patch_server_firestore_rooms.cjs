const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    socket.on("send_custom_room", (data) => {
        if (!currentUsername || !customRooms[data.roomId]) return;
        if (customRooms[data.roomId].banned.includes(currentUsername)) return;
        
        const msgObj = {
            ...data.msg,
            id: Date.now().toString(),
            sender: currentUsername,
            timestamp: new Date().toISOString()
        };
        io.to(data.roomId).emit("receive_custom_room", { roomId: data.roomId, msg: msgObj });
    });`;

const replacement = `    socket.on("send_custom_room", async (data) => {
        if (!currentUsername || !customRooms[data.roomId]) return;
        if (customRooms[data.roomId].banned.includes(currentUsername)) return;
        
        const msgObj = {
            ...data.msg,
            id: Date.now().toString(),
            sender: currentUsername,
            timestamp: new Date().toISOString()
        };
        io.to(data.roomId).emit("receive_custom_room", { roomId: data.roomId, msg: msgObj });
        
        if (fdb) {
            try {
                await setDoc(doc(fdb, "custom_rooms_msgs", data.roomId, "messages", msgObj.id), msgObj);
            } catch (e) {
                console.error("Error saving room msg:", e);
            }
        }
    });`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts to save room messages");
