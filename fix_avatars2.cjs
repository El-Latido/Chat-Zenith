const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix in chat messages rendering
let search1 = `const avatarUrl =
                        m.profilePic ||
                        senderInfo?.profilePic ||
                        \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${m.sender}\`;`;
let replace1 = `const avatarUrl =
                        senderInfo?.profilePic ||
                        m.profilePic ||
                        \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${m.sender}\`;`;
code = code.replace(search1, replace1);

let search2 = `const avatarUrl =
                        m.profilePic ||
                        senderInfo?.profilePic ||
                        \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${m.sender}\`;`;
code = code.replace(search2, replace1);

// We need to do this globally for m.profilePic, user.profilePic etc.
fs.writeFileSync('src/App.tsx', code);
console.log("Done");
