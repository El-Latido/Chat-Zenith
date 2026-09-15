const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const globalTarget = `      msg.sender = currentUsername;
      msg.senderId = currentUsername;
      msg.id = msg.id || Date.now().toString();`;
const globalReplacement = `      msg.sender = currentUsername;
      msg.senderId = currentUsername;
      msg.profilePic = activeUsers[currentUsername]?.profilePic || "";
      msg.id = msg.id || Date.now().toString();`;

const privateTarget = `      msg.sender = currentUsername;
      msg.senderId = currentUsername;
      msg.id = msg.id || Date.now().toString();`;
const privateReplacement = `      msg.sender = currentUsername;
      msg.senderId = currentUsername;
      msg.profilePic = activeUsers[currentUsername]?.profilePic || "";
      msg.id = msg.id || Date.now().toString();`;

code = code.replace(globalTarget, globalReplacement);
code = code.replace(privateTarget, privateReplacement);

const eliGlobalTarget = `          const eliMsg = {
            text: aiResponse,
            sender: "Elizabeth",
            id: Date.now().toString(),
            createdAt: Date.now(),
          };`;
const eliGlobalReplacement = `          const eliMsg = {
            text: aiResponse,
            sender: "Elizabeth",
            profilePic: aiUserTempCache.profilePic || "",
            id: Date.now().toString(),
            createdAt: Date.now(),
          };`;

const eliPrivateTarget = `            const eliMsg = {
              text: aiResponse,
              sender: "Elizabeth",
              id: Date.now().toString(),
              createdAt: Date.now(),
            };`;
const eliPrivateReplacement = `            const eliMsg = {
              text: aiResponse,
              sender: "Elizabeth",
              profilePic: aiUserTempCache.profilePic || "",
              id: Date.now().toString(),
              createdAt: Date.now(),
            };`;

code = code.replace(eliGlobalTarget, eliGlobalReplacement);
code = code.replace(eliPrivateTarget, eliPrivateReplacement);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts messages");
