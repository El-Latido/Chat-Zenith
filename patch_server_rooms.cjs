const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add state for custom rooms
const importMatch = `let djStreamUrl = "https://listen.moe/stream";`;
const stateAdd = `let djStreamUrl = "https://listen.moe/stream";
let customRooms = {}; // { id: { name, owner, rules, banned: [], users: [] } }`;

if (code.includes(importMatch) && !code.includes("let customRooms = {};")) {
    code = code.replace(importMatch, stateAdd);
}

const customRoomEvents = `
    socket.on("get_custom_rooms", (callback) => {
        callback(Object.keys(customRooms).map(id => ({
            id,
            name: customRooms[id].name,
            owner: customRooms[id].owner,
            rules: customRooms[id].rules,
            usersCount: customRooms[id].users.length
        })));
    });

    socket.on("create_custom_room", (data, callback) => {
        if (!currentUsername) return callback({success: false, error: "No logueado"});
        const roomId = "room_" + Date.now();
        customRooms[roomId] = {
            id: roomId,
            name: data.name,
            owner: currentUsername,
            rules: data.rules,
            banned: [],
            users: []
        };
        io.emit("custom_rooms_updated");
        callback({success: true, roomId});
    });

    socket.on("join_custom_room", (roomId, callback) => {
        if (!currentUsername || !customRooms[roomId]) return callback({success: false});
        if (customRooms[roomId].banned.includes(currentUsername)) return callback({success: false, error: "Estás baneado de esta sala"});
        
        socket.join(roomId);
        if (!customRooms[roomId].users.includes(currentUsername)) {
            customRooms[roomId].users.push(currentUsername);
        }
        callback({success: true, room: customRooms[roomId]});
    });

    socket.on("leave_custom_room", (roomId) => {
        if (!currentUsername || !customRooms[roomId]) return;
        socket.leave(roomId);
        customRooms[roomId].users = customRooms[roomId].users.filter(u => u !== currentUsername);
        if (customRooms[roomId].users.length === 0 && customRooms[roomId].owner !== currentUsername) {
            // we could auto-delete, but let's keep it until owner deletes or server restart
        }
    });

    socket.on("send_custom_room", (data) => {
        if (!currentUsername || !customRooms[data.roomId]) return;
        if (customRooms[data.roomId].banned.includes(currentUsername)) return;
        
        const msgObj = {
            ...data.msg,
            id: Date.now().toString(),
            sender: currentUsername,
            timestamp: new Date().toISOString()
        };
        io.to(data.roomId).emit("receive_custom_room", { roomId: data.roomId, msg: msgObj });
    });

    socket.on("ban_from_custom_room", (data, callback) => {
        if (!currentUsername || !customRooms[data.roomId]) return;
        if (customRooms[data.roomId].owner !== currentUsername) return callback({success: false, error: "No eres el dueño"});
        
        customRooms[data.roomId].banned.push(data.targetUser);
        if (activeUsers[data.targetUser]) {
             io.to(activeUsers[data.targetUser].socketId).emit("kicked_from_room", data.roomId);
             const targetSocket = io.sockets.sockets.get(activeUsers[data.targetUser].socketId);
             if (targetSocket) targetSocket.leave(data.roomId);
        }
        customRooms[data.roomId].users = customRooms[data.roomId].users.filter(u => u !== data.targetUser);
        callback({success: true});
    });

    socket.on("delete_custom_room", (roomId, callback) => {
        if (!currentUsername || !customRooms[roomId]) return;
        if (customRooms[roomId].owner !== currentUsername) return callback({success: false});
        io.to(roomId).emit("room_deleted", roomId);
        delete customRooms[roomId];
        io.emit("custom_rooms_updated");
        callback({success: true});
    });
`;

code = code.replace(/socket\.on\("get_reports",/g, customRoomEvents + '\n    socket.on("get_reports",');

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with Custom Rooms logic");
