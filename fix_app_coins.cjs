const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `    socket.on("user_liked", (fromUser: string) => {`;
const replace = `    socket.on("update_coins", (newCoins: number) => {
      setUser(prev => ({ ...prev, lizCoins: newCoins }));
      setToasts(prev => [\`¡Has recibido LM!\`, ...prev]);
    });

    socket.on("user_liked", (fromUser: string) => {`;

code = code.replace(search, replace);
fs.writeFileSync('src/App.tsx', code);
