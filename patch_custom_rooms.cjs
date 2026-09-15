const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// import CustomRooms
const importTarget = `import { FriendsWebcam } from "./components/FriendsWebcam";`;
const importReplacement = `import { FriendsWebcam } from "./components/FriendsWebcam";
import { CustomRooms } from "./components/CustomRooms";`;
code = code.replace(importTarget, importReplacement);

// Render it
const renderTarget = `            {activeChat === "friends_webcam" ? (
                <FriendsWebcam user={user} onClose={() => setActiveChat("global")} />
            ) : activeChat === "lizgram" ? (`;

const renderReplacement = `            {activeChat === "friends_webcam" ? (
                <FriendsWebcam user={user} onClose={() => setActiveChat("global")} />
            ) : activeChat === "custom_rooms" ? (
                <CustomRooms user={user} onJoinRoom={(roomId, roomData) => {
                    setActiveChat("room_" + roomId);
                }} />
            ) : activeChat === "lizgram" ? (`;
code = code.replace(renderTarget, renderReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log("CustomRooms patched into App.tsx");
