const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    socket.on("google_login", async (data, callback) => {`;
const replacement = `    socket.on("request_initial_state", () => {
      if (currentUsername) {
        // Send active users
        const usersList = Object.values(activeUsers).map((u) => ({
          username: u.username,
          profilePic: u.profilePic,
          statusMessage: u.statusMessage,
          role: u.role,
          is_friends_public: u.is_friends_public,
          friends_list: u.is_friends_public ? u.friends_list : void 0,
          awards: u.awards || [],
          lizCoins: u.lizCoins || 0,
          activeDecoration: u.activeDecoration || null,
          ownedDecorations: u.ownedDecorations || [],
        }));
        usersList.unshift(aiUserTempCache);
        socket.emit("active_users", usersList);
        
        // Send radio state
        socket.emit("queue_update", {
          queue: songQueue,
          current: currentRequestedSong,
          history: songHistory
        });
      }
    });

    socket.on("google_login", async (data, callback) => {`;

if (code.includes(target) && !code.includes('request_initial_state')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('server.ts', code);
  console.log("Patched server request_initial_state");
} else {
  console.log("Could not patch server");
}
