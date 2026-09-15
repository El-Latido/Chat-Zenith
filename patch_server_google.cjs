const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regexGoogleLogin = /socket\.on\("google_login"[\s\S]*?\);/g;
code = code.replace(regexGoogleLogin, '');

const googleLoginCode = `
    socket.on("google_login", async (data, callback) => {
      const { email, displayName, photoURL, googleUid, timezone = "UTC" } = data;
      if (!email || !googleUid) return callback({ success: false, error: "Datos de Google inválidos" });

      if (fdb) {
        try {
          const usersRef = collection(fdb, "users");
          
          // Check by googleUid first
          const qUid = query(usersRef, where("googleUid", "==", googleUid));
          const snapUid = await getDocs(qUid);
          
          let userDocSnap = null;
          let username = "";
          
          if (!snapUid.empty) {
            userDocSnap = snapUid.docs[0];
            username = userDocSnap.id;
          } else {
            // Check by securityEmail
            const qEmail = query(usersRef, where("securityEmail", "==", email));
            const snapEmail = await getDocs(qEmail);
            
            if (!snapEmail.empty) {
              userDocSnap = snapEmail.docs[0];
              username = userDocSnap.id;
              // Link googleUid
              await updateDoc(doc(fdb, "users", username), { googleUid });
            }
          }

          if (userDocSnap) {
            // LOGIN
            const user = userDocSnap.data();
            let uid = user.uid;
            if (!uid) {
              uid = Math.random().toString(36).substring(2, 8).toUpperCase();
              await setDoc(doc(fdb, "users", username), { uid }, { merge: true });
            }
            if (user.timezone !== timezone) {
              await setDoc(doc(fdb, "users", username), { timezone }, { merge: true });
            }
            
            currentUsername = username;
            if (activeUsers[username]) {
               activeUsers[username].socketId = socket.id;
               activeUsers[username].status = user.statusMessage || "Disponible";
            } else {
               activeUsers[username] = {
                  socketId: socket.id,
                  profilePic: user.profilePic || "",
                  status: user.statusMessage || "Disponible",
                  role: user.role || "user"
               };
            }
            emitActiveUsers();
            
            return callback({
              success: true,
              username,
              profilePic: user.profilePic || "",
              statusMessage: user.statusMessage || "Disponible",
              role: user.role || "user",
              countryLanguage: user.pais_idioma || "es",
              timezone: timezone,
              is_friends_public: !!user.is_friends_public,
              friends_list: user.friends_list || [],
              blocked_list: user.blocked_list || []
            });
          } else {
            // CREATE NEW ACCOUNT
            let baseUsername = (displayName || "Usuario").replace(/[^a-zA-Z0-9_]/g, "");
            if (!baseUsername) baseUsername = "User";
            
            let newUsername = baseUsername;
            let counter = 1;
            while (true) {
               const checkSnap = await getDoc(doc(fdb, "users", newUsername));
               if (!checkSnap.exists()) break;
               newUsername = baseUsername + counter;
               counter++;
            }
            
            const newUid = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            await setDoc(doc(fdb, "users", newUsername), {
              username: newUsername,
              password: "GOOGLE_AUTH_NO_PASSWORD",
              profilePic: photoURL || "",
              statusMessage: "Disponible",
              role: "user",
              pais_idioma: "es",
              securityEmail: email,
              googleUid,
              timezone,
              uid: newUid,
              profileLikes: 0,
            });
            
            currentUsername = newUsername;
            activeUsers[newUsername] = {
              socketId: socket.id,
              profilePic: photoURL || "",
              status: "Disponible",
              role: "user"
            };
            emitActiveUsers();
            
            return callback({
              success: true,
              username: newUsername,
              profilePic: photoURL || "",
              statusMessage: "Disponible",
              role: "user",
              countryLanguage: "es",
              timezone: timezone,
              is_friends_public: false,
              friends_list: [],
              blocked_list: []
            });
          }

        } catch (err) {
          console.error("Google login error:", err);
          return callback({ success: false, error: "Database error during Google Login" });
        }
      } else {
         return callback({ success: false, error: "Base de datos no disponible para Google Login" });
      }
    });
`;

code = code.replace(/socket\.on\("register_or_login"/, googleLoginCode + '\n    socket.on("register_or_login"');

fs.writeFileSync('server.ts', code);
