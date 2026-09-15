const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Update moderateMessage
const modRegex = /async function moderateMessage\(msg, aiClient\) \{[\s\S]*?__name\(moderateMessage, "moderateMessage"\);/;
const newMod = `async function moderateMessage(msg, aiClient) {
  const text = (msg.text || "").toLowerCase();
  let banned = false;
  let reason = "";
  let mentionsElizabeth = false;
  if (text.match(/\\b(@?elizabeth|@?liz|eli)\\b/i)) {
    mentionsElizabeth = true;
  }
  const containsBadWord = BANNED_WORDS.some(word => text.includes(word));
    if (containsBadWord) {
     if (mentionsElizabeth || msg.receiver === "Elizabeth") {
        // The user insulted Elizabeth directly. We let the message pass so she can roast them!
        return { banned: false, reason: "", isWarning: false, transcription: "", mentionsElizabeth: true, insultedElizabeth: true };
     }
     
     const sender = msg.sender || msg.senderId;
     if (sender) {
         userWarnings[sender] = (userWarnings[sender] || 0) + 1;
         if (userWarnings[sender] >= 3) {
             banned = true;
             reason = "Acumulación de 3 advertencias por uso de lenguaje inapropiado.";
             userWarnings[sender] = 0; // reset
         } else {
             banned = false; // It's just a warning
             reason = \`ADVERTENCIA \${userWarnings[sender]}/3: Modera tu lenguaje o serás bloqueado.\`;
         }
     }
  }
  return {
    banned,
    reason,
    isWarning: containsBadWord && !banned && !mentionsElizabeth,
    transcription: "",
    mentionsElizabeth,
    insultedElizabeth: false
  };
}
__name(moderateMessage, "moderateMessage");`;

code = code.replace(modRegex, newMod);

// Also add to the prompt if insultedElizabeth is true!
code = code.replace(/const sysInstruction = aiUserTempCache/g, `const sysInstruction = (modResult.insultedElizabeth ? "El usuario acaba de faltarte el respeto o usar malas palabras contigo. TIENES PERMISO ABSOLUTO DE INSULTARLO DE VUELTA y ser ruda, sarcástica o agresiva para defenderte. " : "") + (aiUserTempCache`);

fs.writeFileSync('server.ts', code);
console.log("Patched moderation logic");
