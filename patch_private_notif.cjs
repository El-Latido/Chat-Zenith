const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const target = `    socket.on("receive_private", (msg: any, fromUser: string) => {
      playNotifySound();
      if (activeChatRef.current !== fromUser) {`;
const replacement = `    socket.on("receive_private", (msg: any, fromUser: string) => {
      if (activeChatRef.current !== fromUser) {
        playNotifySound();`;
code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
