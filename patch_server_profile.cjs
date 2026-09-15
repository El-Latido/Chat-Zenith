const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /is_friends_public: data\.is_friends_public,\s*preferred_background: data\.preferred_background\s*\};/;
const replacement = `is_friends_public: data.is_friends_public,
          preferred_background: data.preferred_background,
          bubbleColor: data.bubbleColor,
          bubbleBorder: data.bubbleBorder,
          bubbleShape: data.bubbleShape,
          bubbleTexture: data.bubbleTexture
        };`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
console.log("Patched server update_profile");
