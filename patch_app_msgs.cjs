const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `const avatarUrl = senderInfo?.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${m.sender}\`;`;
const rep1 = `const avatarUrl = m.profilePic || senderInfo?.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${m.sender}\`;`;

code = code.replace(target1, rep1);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx avatarUrl");
