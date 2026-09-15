const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    socket.on('active_users', (usersList: UserObj[]) => {`;
const replacement = `    socket.emit('request_initial_state');

    socket.on('active_users', (usersList: UserObj[]) => {`;

if (code.includes(target) && !code.includes('request_initial_state')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched App request_initial_state");
} else {
  console.log("Could not patch App");
}
