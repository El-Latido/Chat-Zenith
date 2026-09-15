const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `                             socket.emit("watch_ad_reward", (res: any) => {
                                 if (res.success) {
                                     alert(\`¡Felicidades! Has ganado 100 Liz-Moneditas.\`);
                                     setOutOfTokensAi(null);
                                     setIsWatchingAd(false);
                                 }
                             });`;

const replace = `                             socket.emit("watch_ad_reward", (res: any) => {
                                 if (res.success) {
                                     setUser(prev => ({ ...prev, lizCoins: res.newCoins }));
                                     alert(\`¡Felicidades! Has ganado 100 Liz-Moneditas.\`);
                                     setOutOfTokensAi(null);
                                     setIsWatchingAd(false);
                                 }
                             });`;

code = code.replace(search, replace);
fs.writeFileSync('src/App.tsx', code);
console.log("Added local UI state update for new coins.");
