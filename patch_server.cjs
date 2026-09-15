const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `  let activeUsers = {};
  const chessGames = {};`;
const replacement = `  let activeUsers = {};
  const chessGames = {};
  let customRooms = {};
  let webcamQueue = [];`;

code = code.replace(target, replacement);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with customRooms and webcamQueue");
