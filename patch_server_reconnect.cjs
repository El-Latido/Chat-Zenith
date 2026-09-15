const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    socket.on("register_or_login", async (data, callback) => {`;
const rep = `    socket.on("reconnect_user", async (data) => {
      const { username } = data;
      if (!username) return;
      
      let profilePic = "";
      let statusMessage = "Disponible";
      let role = "user";
      let isFriendsPublic = false;
      let friendsList = [];
      let blockedList = [];
      let awards = [];
      let lizCoins = 0;
      let activeDecoration = null;
      let ownedDecorations = [];
      let elo = 0;
      let uid = "";
      let profileLikes = 0;

      if (fdb) {
        try {
          const userDocRef = doc(fdb, "users", username);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const user = userDoc.data();
            profilePic = user?.profilePic || "";
            statusMessage = user?.statusMessage || "Disponible";
            role = user?.role || role;
            isFriendsPublic = !!user?.is_friends_public;
            friendsList = user?.friends_list || [];
            blockedList = user?.blocked_list || [];
            awards = user?.awards || [];
            lizCoins = user?.lizCoins || 0;
            activeDecoration = user?.activeDecoration || null;
            ownedDecorations = user?.ownedDecorations || [];
            elo = user?.elo || 0;
            uid = user?.uid || "";
            profileLikes = user?.profileLikes || 0;
          }
        } catch(e) {}
      }

      currentUsername = username;
      if (activeUsers[username]) {
         activeUsers[username].socketId = socket.id;
      } else {
         activeUsers[username] = {
            socketId: socket.id,
            status: "online",
            username,
            profilePic,
            statusMessage,
            role,
            is_friends_public: isFriendsPublic,
            friends_list: friendsList,
            blocked_list: blockedList,
            awards,
            lizCoins,
            activeDecoration,
            ownedDecorations,
            elo,
            uid,
            profileLikes,
         };
      }
      emitActiveUsers();
      socket.emit("queue_update", {
        queue: songQueue,
        current: currentRequestedSong,
        history: songHistory
      });
    });

    socket.on("register_or_login", async (data, callback) => {`;

if (code.includes(target) && !code.includes('reconnect_user')) {
    code = code.replace(target, rep);
    fs.writeFileSync('server.ts', code);
    console.log("Patched server reconnect");
} else {
    console.log("Target not found");
}
