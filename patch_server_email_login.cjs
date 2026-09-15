const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /if \(!uid\) \{\s*uid = Math\.random\(\)\.toString\(36\)\.substring\(2, 8\)\.toUpperCase\(\);\s*await setDoc\([\s\S]*?\{ merge: true \},\s*\);\s*\}/;

const replacement = `if (!uid) {
              uid = Math.random().toString(36).substring(2, 8).toUpperCase();
              await setDoc(
                userDocRef,
                { uid, profileLikes: profileLikes || 0 },
                { merge: true },
              );
            }
            if (userSecurityEmail && userSecurityEmail !== (user?.securityEmail || "")) {
              await setDoc(userDocRef, { securityEmail: userSecurityEmail }, { merge: true });
              user.securityEmail = userSecurityEmail;
            }`;

code = code.replace(regex, replacement);

fs.writeFileSync('server.ts', code);
