const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    "import { FriendsWebcam } from './components/FriendsWebcam';",
    "import { FriendsWebcam } from './components/FriendsWebcam';\nimport { CustomRooms } from './components/CustomRooms';"
);

const target = `            {activeChat === "friends_webcam" ? (
                <FriendsWebcam user={user} onClose={() => setActiveChat("global")} />
            ) : activeChat === "lizgram" ? (
              <SocialFeed user={user} onClose={() => setActiveChat("global")} />
            ) : (`;

const replacement = `            {activeChat === "custom_rooms" ? (
                <CustomRooms user={user} onJoinRoom={(roomId, roomData) => {
                    setActiveChat(roomId);
                }} />
            ) : activeChat === "friends_webcam" ? (
                <FriendsWebcam user={user} onClose={() => setActiveChat("global")} />
            ) : activeChat === "lizgram" ? (
              <SocialFeed user={user} onClose={() => setActiveChat("global")} />
            ) : (`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx rendering CustomRooms");
