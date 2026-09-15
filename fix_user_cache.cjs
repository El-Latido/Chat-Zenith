const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `      setUserCache((prev) => {
        const newCache = { ...prev };
        usersList.forEach((u) => {
          newCache[u.username] = u;
        });
        return newCache;
      });`;

const replace = `      setUserCache((prev) => {
        const newCache = { ...prev };
        usersList.forEach((u) => {
          newCache[u.username] = {
            ...newCache[u.username],
            ...u,
            profilePic: u.profilePic || newCache[u.username]?.profilePic
          };
        });
        return newCache;
      });`;

code = code.replace(search, replace);
fs.writeFileSync('src/App.tsx', code);
