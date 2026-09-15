const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const adSearch = `  socket.on("buy_decoration", async (data: { decorationId: string, price: number }, cb) => {`;
const adReplace = `  socket.on("watch_ad_reward", async () => {
    if (!socket.data.user) return;
    try {
      const username = socket.data.user.username;
      const snap = await getDoc(doc(db, "users", username));
      if (snap.exists()) {
        const currentCoins = snap.data().lizCoins || 0;
        await updateDoc(doc(db, "users", username), {
          lizCoins: currentCoins + 100
        });
        socket.emit("update_coins", currentCoins + 100);
      }
    } catch (e) {
      console.error("Ad reward error", e);
    }
  });

  socket.on("buy_decoration", async (data: { decorationId: string, price: number }, cb) => {`;

code = code.replace(adSearch, adReplace);
fs.writeFileSync('server.ts', code);
