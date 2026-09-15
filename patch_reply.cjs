const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
if (!code.includes('replyTo?:')) {
    code = code.replace(/isAi\?: boolean;/, "isAi?: boolean;\n  replyTo?: { id: string, sender: string, text: string };");
    fs.writeFileSync('src/types.ts', code);
    console.log("types.ts patched");
}
