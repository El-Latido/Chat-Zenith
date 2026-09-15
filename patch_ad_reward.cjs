const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const anchor = 'socket.on("buy_decoration", async (data, callback) => {';
const newCode = `    socket.on("watch_ad_reward", async (callback) => {
      if (!currentUsername || !activeUsers[currentUsername]) return callback({ success: false });
      const REWARD = 5;
      activeUsers[currentUsername].lizCoins = (activeUsers[currentUsername].lizCoins || 0) + REWARD;
      if (fdb) {
         try {
           await updateDoc(doc(fdb, "users", currentUsername), { lizCoins: activeUsers[currentUsername].lizCoins });
         } catch(e){}
      } else {
         if(fallbackState.users[currentUsername]){
             fallbackState.users[currentUsername].lizCoins = activeUsers[currentUsername].lizCoins;
             saveFallbackDB();
         }
      }
      io.to(activeUsers[currentUsername].socketId).emit("update_user_info", activeUsers[currentUsername]);
      callback({ success: true, newCoins: activeUsers[currentUsername].lizCoins });
    });

`;

code = code.replace(anchor, newCode + anchor);
fs.writeFileSync('server.ts', code);
console.log("Patched ad reward");
