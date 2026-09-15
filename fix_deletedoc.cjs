const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/import {([^}]*)} from "firebase\/firestore";/, (match, p1) => {
    if (!p1.includes('deleteDoc')) {
        return `import {${p1}, deleteDoc } from "firebase/firestore";`;
    }
    return match;
});
fs.writeFileSync('src/App.tsx', code);
