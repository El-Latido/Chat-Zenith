const fs = require('fs');

let code1 = fs.readFileSync('src/components/ActiveCallModal.tsx', 'utf8');
code1 = code1.replace(/import \{ socket \} from "\.\.\/App";/, 'import { socket } from "../socket";');
fs.writeFileSync('src/components/ActiveCallModal.tsx', code1);

let code2 = fs.readFileSync('src/components/FriendsWebcam.tsx', 'utf8');
code2 = code2.replace(/import \{ socket \} from "\.\.\/App";/, 'import { socket } from "../socket";');
fs.writeFileSync('src/components/FriendsWebcam.tsx', code2);

console.log("Fixed socket imports");
