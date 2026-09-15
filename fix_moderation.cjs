const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// For global chat:
const globalRegex = /(const modResult = await moderateMessage\(msg, ai\);\s*if \(modResult\.banned\) \{[\s\S]*?io\.emit\("receive_global", banMsg\);\s*return;\s*\})/;

const globalReplacement = `$1 else if (modResult.isWarning) {
        const warnMsg = {
          text: \`⚠️ \${currentUsername}, \${modResult.reason}\`,
          sender: "Elizabeth",
          profilePic: "",
          isAi: true,
          id: Date.now().toString(),
          createdAt: Date.now(),
        };
        if (fdb) {
          addDoc(collection(fdb, "global_chat"), {
            ...warnMsg,
            timestamp: serverTimestamp(),
          }).catch(e => console.error(e));
        } else {
          fallbackState.globalMessages.push(warnMsg);
          saveFallbackDB();
        }
        io.emit("receive_global", warnMsg);
        return; // BLOCK THE MESSAGE!
      }`;

code = code.replace(globalRegex, globalReplacement);

const privateRegex = /(const modResult = await moderateMessage\(msg, ai\);\s*if \(modResult\.banned\) \{[\s\S]*?io\.emit\("receive_global", banMsg\);\s*return callback\(\{[\s\S]*?\}\);\s*\})/;

const privateReplacement = `$1 else if (modResult.isWarning) {
        return callback({
          success: false,
          error: \`⚠️ \${modResult.reason}\`,
        });
      }`;

code = code.replace(privateRegex, privateReplacement);
fs.writeFileSync('server.ts', code);
console.log("Patched both");
