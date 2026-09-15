const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetScroll = `<div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 space-y-4 relative scroll-smooth flex flex-col pt-[70px]" id="chat-messages-container">`;
const repScroll = `<div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 space-y-4 relative scroll-smooth flex flex-col pt-[70px]" id="chat-messages-container" style={{
                    backgroundImage: chatBgImage ? \`url('\${chatBgImage}')\` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
                {chatBgImage && <div className="absolute inset-0 bg-white/40 pointer-events-none z-0 mix-blend-overlay"></div>}
                `;

code = code.replace(targetScroll, repScroll);

// Also listen for storage event to update neonColor and chatBgImage dynamically
const targetEffect = `  useEffect(() => {
    socket.emit("get_games_state", (state: any) => {`;

const repEffect = `  useEffect(() => {
    const handleStorageChange = () => {
       setNeonColor(localStorage.getItem("chatliz_neon_color") || "#00f3ff");
       setIsRainbowNeon(localStorage.getItem("chatliz_rainbow_neon") === "true");
       setChatBgImage(localStorage.getItem("chatliz_chat_bg") || "");
    };
    window.addEventListener("storage", handleStorageChange);
    // Custom event to trigger it from within the app without other tabs
    window.addEventListener("chatliz_ui_update", handleStorageChange);
    
    socket.emit("get_games_state", (state: any) => {`;

code = code.replace(targetEffect, repEffect);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched app bg and storage listener");
