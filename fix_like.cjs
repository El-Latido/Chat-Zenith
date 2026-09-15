const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const searchLike = `            await updateDoc(uRef, { profileLikes: currentLikes + 1 });
            if (activeUsers[targetUser]) {
              activeUsers[targetUser].profileLikes = currentLikes + 1;
              emitActiveUsers();
            }`;
            
const replaceLike = `            await updateDoc(uRef, { profileLikes: currentLikes + 1 });
            if (activeUsers[targetUser]) {
              activeUsers[targetUser].profileLikes = currentLikes + 1;
              emitActiveUsers();
              io.to(activeUsers[targetUser].socketId).emit("user_liked", currentUsername);
            }`;

code = code.replace(searchLike, replaceLike);
fs.writeFileSync('server.ts', code);
