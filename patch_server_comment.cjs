const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /const commentObj = \{\s*author: currentUsername,\s*text: data\.comment,\s*timestamp: Date\.now\(\)\s*\};/;

const replacement = `const commentObj = {
              author: currentUsername,
              text: data.comment,
              timestamp: Date.now(),
              stars: data.stars || null
          };`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
console.log("Patched server comment");
