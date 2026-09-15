const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldActiveUsers = `    socket.on('active_users', (usersList: UserObj[]) => {
      const cleaned = usersList.filter(u => u.username !== 'Elizabeth' && u.username !== user.username);
      const elizabeth = usersList.find(u => u.username === 'Elizabeth') || { username: 'Elizabeth', statusMessage: 'Administradora', role: 'admin' };
      cleaned.unshift(elizabeth); 
      setUsersOnline(cleaned);`;

const newActiveUsers = `    socket.on('active_users', (usersList: UserObj[]) => {
      const aiIds = ['Elizabeth', 'Sensei', 'Shadow', 'Neko'];
      const ais = usersList.filter(u => aiIds.includes(u.username)).map(u => ({...u, isAi: true}));
      const others = usersList.filter(u => !aiIds.includes(u.username) && u.username !== user.username);
      setUsersOnline([...ais, ...others]);`;
      
code = code.replace(oldActiveUsers, newActiveUsers);

const oldFilter = `                    if (u.username === 'Elizabeth') return null;`;
const newFilter = `                    if (['Elizabeth', 'Sensei', 'Shadow', 'Neko'].includes(u.username)) return null;`;
code = code.replace(oldFilter, newFilter);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched users list display in App.tsx");
