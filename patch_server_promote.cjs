const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetServer = `    socket.on("admin_delete_user", async (targetUsername, callback) => {
        if (!currentUsername || (activeUsers[currentUsername]?.role !== "admin" && currentUsername.toUpperCase() !== "AXISS")) return callback({success: false});`;

const repServer = `    socket.on("admin_promote_user", async (targetUsername, callback) => {
        if (!currentUsername || currentUsername.toUpperCase() !== "AXISS") return callback({success: false});
        if (fdb) {
            try {
                await updateDoc(doc(fdb, "users", targetUsername.toLowerCase()), { role: "admin" });
                if (activeUsers[targetUsername]) activeUsers[targetUsername].role = "admin";
                io.emit("update_active_users", Object.values(activeUsers).filter(u => !u.incognito).map(u => ({
                    username: u.username,
                    profilePic: u.profilePic,
                    statusMessage: u.statusMessage,
                    role: u.role,
                    pais_idioma: u.pais_idioma
                })));
                callback({success: true});
            } catch(e) {
                callback({success: false});
            }
        }
    });

    socket.on("admin_delete_user", async (targetUsername, callback) => {
        if (!currentUsername || (activeUsers[currentUsername]?.role !== "admin" && currentUsername.toUpperCase() !== "AXISS")) return callback({success: false});`;

code = code.replace(targetServer, repServer);
fs.writeFileSync('server.ts', code);
console.log("Patched server promote");
