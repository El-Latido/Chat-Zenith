const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `               activeUsers[username] = {
                  socketId: socket.id,
                  profilePic: user.profilePic || "",
                  status: user.statusMessage || "Disponible",
                  role: user.role || "user"
               };`;

const replacement1 = `               activeUsers[username] = {
                  socketId: socket.id,
                  status: "online",
                  username: username,
                  profilePic: user.profilePic || "",
                  statusMessage: user.statusMessage || "Disponible",
                  role: user.role || "user",
                  pais_idioma: user.pais_idioma || "es",
                  timezone: user.timezone || timezone,
                  is_friends_public: !!user.is_friends_public,
                  friends_list: user.friends_list || [],
                  blocked_list: user.blocked_list || [],
                  awards: user.awards || [],
                  lizCoins: user.lizCoins || 0,
                  activeDecoration: user.activeDecoration || null,
                  ownedDecorations: user.ownedDecorations || [],
                  elo: user.elo || 0,
                  uid: uid,
                  profileLikes: user.profileLikes || 0
               };`;

const target2 = `            activeUsers[newUsername] = {
              socketId: socket.id,
              profilePic: photoURL || "",
              status: "Disponible",
              role: "user"
            };`;

const replacement2 = `            activeUsers[newUsername] = {
              socketId: socket.id,
              status: "online",
              username: newUsername,
              profilePic: photoURL || "",
              statusMessage: "Disponible",
              role: "user",
              pais_idioma: "es",
              timezone: timezone,
              is_friends_public: false,
              friends_list: [],
              blocked_list: [],
              awards: [],
              lizCoins: 0,
              activeDecoration: null,
              ownedDecorations: [],
              elo: 0,
              uid: newUid,
              profileLikes: 0
            };`;

if(code.includes(target1)) {
  code = code.replace(target1, replacement1);
  console.log("Target 1 patched.");
} else {
  console.log("Target 1 not found");
}

if(code.includes(target2)) {
  code = code.replace(target2, replacement2);
  console.log("Target 2 patched.");
} else {
  console.log("Target 2 not found");
}

fs.writeFileSync('server.ts', code, 'utf8');
