const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Modifying the query for private messages to load up to 200 messages instead of 15
code = code.replace(
    /limitToLast\(15\)/g,
    `limitToLast(200)`
);

// Modifying message render timestamp: 
// The regex finds: const timeStr = isNaN(date.getTime()) ... minute: "2-digit", ... });
const timeStrRegex = /const timeStr = isNaN\(date\.getTime\(\)\)\s*\?\s*`10:0\$\{idx % 10\}`\s*:\s*date\.toLocaleTimeString\(\[\],\s*\{\s*hour:\s*"2-digit",\s*minute:\s*"2-digit",?\s*\}\);/g;

const timeStrReplacement = `const timeStr = isNaN(date.getTime())
                        ? \`10:0\${idx % 10}\`
                        : activeChat === "global" 
                            ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
                            : date.toLocaleDateString([], { day: '2-digit', month: '2-digit' }) + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });`;

code = code.replace(timeStrRegex, timeStrReplacement);

// Handle "account_deleted" disconnect
const initSocketRegex = /socket\.on\("banned_status", \(\{ isBanned \}\) => \{/g;
const newInitSocket = `
    socket.on("account_deleted", () => {
        alert("Tu cuenta ha sido eliminada por un administrador.");
        window.location.reload();
    });
    socket.on("banned_status", ({ isBanned }) => {`;
code = code.replace(initSocketRegex, newInitSocket);

// Adding Friends Webcam to the Sidebar / Rooms
const webcamRoomIcon = `import { Webcam, EyeOff } from "lucide-react";`;
code = code.replace(/import \{  Send, User/, `import { Webcam, EyeOff, Send, User`);

const webcamSidebarBtn = `<div className="mt-8">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">{t('salas')}</h3>`;
const webcamSidebarReplacement = `<div className="mt-8">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">{t('salas')}</h3>
              <button 
                onClick={() => { setActiveChat("friends_webcam"); setIsMobileMenuOpen(false); }}
                className={\`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 \${activeChat === "friends_webcam" ? "bg-purple-500/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)] border border-purple-500/30" : "hover:bg-white/5 text-gray-300 border border-transparent"}\`}
              >
                 <div className="flex items-center gap-3">
                     <div className={\`w-10 h-10 rounded-xl flex items-center justify-center \${activeChat === "friends_webcam" ? "bg-purple-500/20" : "bg-[#1A2639]"}\`}>
                         <Webcam size={20} className={activeChat === "friends_webcam" ? "animate-pulse" : ""} />
                     </div>
                     <span className="font-bold">Friends Webcam</span>
                 </div>
              </button>`;
code = code.replace(webcamSidebarBtn, webcamSidebarReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx successfully");
