const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const loginTarget = `      activeUsers[username] = {
        socketId: socket.id,
        status: "online",
        username,
        profilePic,
        statusMessage,
        role,
        pais_idioma: userCountryLanguage,
        timezone: userTimezone,
        is_friends_public: isFriendsPublic,
        friends_list: friendsList,
        blocked_list: blockedList,
        awards,
        lizCoins,
        activeDecoration,
        ownedDecorations,
        elo,
        uid,
        profileLikes,
      };
      emitActiveUsers();
      
      return callback({`;

const loginRep = `      activeUsers[username] = {
        socketId: socket.id,
        status: "online",
        username,
        profilePic,
        statusMessage,
        role,
        pais_idioma: userCountryLanguage,
        timezone: userTimezone,
        is_friends_public: isFriendsPublic,
        friends_list: friendsList,
        blocked_list: blockedList,
        awards,
        lizCoins,
        activeDecoration,
        ownedDecorations,
        elo,
        uid,
        profileLikes,
      };
      emitActiveUsers();
      
      io.to(socket.id).emit("queue_update", {
        queue: songQueue,
        current: currentRequestedSong,
        history: songHistory
      });

      return callback({`;

code = code.replace(loginTarget, loginRep);

const googleTarget = `            activeUsers[newUsername] = {
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
            };
            emitActiveUsers();
            
            return callback({`;

const googleRep = `            activeUsers[newUsername] = {
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
            };
            emitActiveUsers();
            
            io.to(socket.id).emit("queue_update", {
              queue: songQueue,
              current: currentRequestedSong,
              history: songHistory
            });

            return callback({`;

code = code.replace(googleTarget, googleRep);

const googleExistTarget = `            if (activeUsers[username]) {
               activeUsers[username].socketId = socket.id;
               activeUsers[username].status = user.statusMessage || "Disponible";
            } else {
               activeUsers[username] = {
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
               };
            }
            emitActiveUsers();
            
            return callback({`;

const googleExistRep = `            if (activeUsers[username]) {
               activeUsers[username].socketId = socket.id;
               activeUsers[username].status = user.statusMessage || "Disponible";
            } else {
               activeUsers[username] = {
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
               };
            }
            emitActiveUsers();
            
            io.to(socket.id).emit("queue_update", {
              queue: songQueue,
              current: currentRequestedSong,
              history: songHistory
            });

            return callback({`;

code = code.replace(googleExistTarget, googleExistRep);

fs.writeFileSync('server.ts', code);
console.log("Patched login radio emit");
