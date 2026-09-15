const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The second msg.senderId = currentUsername; is inside send_private
let occurrences = code.split('msg.senderId = currentUsername;');
if (occurrences.length > 2) {
    code = occurrences[0] + 'msg.senderId = currentUsername;' + occurrences[1] + 
           'msg.senderId = currentUsername;\n      msg.senderLanguage = activeUsers[currentUsername]?.pais_idioma || "es";' + occurrences[2];
}

fs.writeFileSync('server.ts', code);
