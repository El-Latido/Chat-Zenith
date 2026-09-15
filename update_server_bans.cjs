const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const searchAdmin = `    socket.on("admin_cut_transmission", () => {`;
const replaceAdmin = `    socket.on("get_banned_users", (callback) => {
      if (activeUsers[currentUsername]?.role !== "admin") return callback([]);
      const now = Date.now();
      const list = Object.keys(bannedUsers).filter(u => bannedUsers[u] > now).map(u => ({
          username: u,
          expiresAt: bannedUsers[u],
          profilePic: activeUsers[u]?.profilePic || ""
      }));
      callback(list);
    });
    
    socket.on("admin_unban_user", (targetUser, callback) => {
      if (activeUsers[currentUsername]?.role !== "admin") return callback({success: false});
      delete bannedUsers[targetUser];
      if (activeUsers[targetUser]) {
          io.to(activeUsers[targetUser].socketId).emit("banned_status", { isBanned: false });
      }
      io.emit("system_message", { text: \`El usuario \${targetUser} ha sido desbaneado por el administrador.\` });
      callback({success: true});
    });

    socket.on("admin_ban_user", (targetUser, callback) => {
      if (activeUsers[currentUsername]?.role !== "admin") return callback({success: false});
      bannedUsers[targetUser] = Date.now() + 15 * 60 * 1000;
      if (activeUsers[targetUser]) {
          io.to(activeUsers[targetUser].socketId).emit("banned_status", { isBanned: true });
      }
      io.emit("system_message", { text: \`El usuario \${targetUser} ha sido baneado por el administrador.\` });
      callback({success: true});
    });

    socket.on("admin_cut_transmission", () => {`;

code = code.replace(searchAdmin, replaceAdmin);

const searchBan1 = `        bannedUsers[currentUsername] = Date.now() + 15 * 60 * 1e3;
        const banMsg = {`;
const replaceBan1 = `        bannedUsers[currentUsername] = Date.now() + 15 * 60 * 1e3;
        io.to(socket.id).emit("banned_status", { isBanned: true });
        const banMsg = {`;
code = code.replaceAll(searchBan1, replaceBan1);

const searchLogin = `      emitActiveUsers();
      callback({`;
const replaceLogin = `      emitActiveUsers();
      if (bannedUsers[username] && bannedUsers[username] > Date.now()) {
          socket.emit("banned_status", { isBanned: true });
      }
      callback({`;
code = code.replace(searchLogin, replaceLogin);

fs.writeFileSync('server.ts', code);
