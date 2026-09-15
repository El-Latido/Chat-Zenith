const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `        socket.on("watch_ad_reward", async (callback) => {
      if (!currentUsername || !activeUsers[currentUsername]) return callback({ success: false });
      const REWARD = 5;
      activeUsers[currentUsername].lizCoins = (activeUsers[currentUsername].lizCoins || 0) + REWARD;`;

const replace = `        socket.on("watch_ad_reward", async (callback) => {
      if (!currentUsername || !activeUsers[currentUsername]) {
          if (typeof callback === 'function') callback({ success: false });
          return;
      }
      const REWARD = 100;
      activeUsers[currentUsername].lizCoins = (activeUsers[currentUsername].lizCoins || 0) + REWARD;`;

code = code.replace(search, replace);

// And we need to make sure we also fix the fallback logic if it calls callback
const search2 = `             fallbackState.users[currentUsername].lizCoins = activeUsers[currentUsername].lizCoins;
             saveFallbackDB();
         }
      }
      io.to(activeUsers[currentUsername].socketId).emit("update_user_info", activeUsers[currentUsername]);
      callback({ success: true, newCoins: activeUsers[currentUsername].lizCoins });
    });`;
const replace2 = `             fallbackState.users[currentUsername].lizCoins = activeUsers[currentUsername].lizCoins;
             saveFallbackDB();
         }
      }
      io.to(activeUsers[currentUsername].socketId).emit("update_user_info", activeUsers[currentUsername]);
      if (typeof callback === 'function') {
          callback({ success: true, newCoins: activeUsers[currentUsername].lizCoins });
      }
    });`;

code = code.replace(search2, replace2);
fs.writeFileSync('server.ts', code);
