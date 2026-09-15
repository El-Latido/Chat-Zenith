const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import for FriendsWebcam
code = code.replace(
  /import \{ CallModal \} from "\.\/components\/CallModal";/,
  'import { CallModal } from "./components/CallModal";\nimport { FriendsWebcam } from "./components/FriendsWebcam";'
);

// 2. Add the component to render list
const renderMatch = `{activeChat === "lizgram" ? (`;
const renderReplace = `
            {activeChat === "friends_webcam" ? (
                <FriendsWebcam user={user} onClose={() => setActiveChat("global")} />
            ) : activeChat === "lizgram" ? (
`;

code = code.replace(renderMatch, renderReplace);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched webcam import in App.tsx");
