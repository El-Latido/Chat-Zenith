const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace the one at line 2522
code = code.replace(/if \(msg\.audio && msg\.audio\.startsWith\("data:audio"\)\) \{\s*let uploadedToStorage = false;\s*if \(fStorage\) \{/, 
`let originalPrivateAudioBase64 = null;
      if (msg.audio && msg.audio.startsWith("data:audio")) {
        originalPrivateAudioBase64 = msg.audio;
        let uploadedToStorage = false;
        if (fStorage) {`);

fs.writeFileSync('server.ts', code);
