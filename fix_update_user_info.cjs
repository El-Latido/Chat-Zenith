const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `    socket.on("active_users", (usersList: UserObj[]) => {`;
const replace = `    socket.on("update_user_info", (updatedUser: UserObj) => {
        if (updatedUser.username === user.username) {
            setUser(prev => ({ ...prev, ...updatedUser }));
        }
    });

    socket.on("active_users", (usersList: UserObj[]) => {`;

code = code.replace(search, replace);
fs.writeFileSync('src/App.tsx', code);
console.log("Added update_user_info handler.");
