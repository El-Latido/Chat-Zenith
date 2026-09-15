const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `const avatarUrl = m.profilePic || senderInfo?.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${m.sender}\`;`;
const rep1 = `const avatarUrl = senderInfo?.profilePic || m.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${m.sender}\`;`;

if (code.includes(target1)) {
    code = code.replace(target1, rep1);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched avatar order");
} else {
    console.log("Could not find target1");
}
