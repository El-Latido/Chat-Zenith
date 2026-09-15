const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const sidebarBottom = `          <div className="w-full h-px bg-white/5 my-2"></div>`;
const roomsSection = `          <div className="w-full h-px bg-white/5 my-2"></div>

          {/* Salas */}
          <div className="px-4 py-2 flex flex-col gap-2">
            <button
              className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all \${activeChat === "global" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-white/5 text-gray-300 hover:bg-white/10"}\`}
              onClick={() => {
                closeAllModals();
                setIsSidebarOpen(false);
                setActiveChat("global");
              }}
            >
              <div className="flex items-center gap-2">
                <Globe size={18} className={activeChat === "global" ? "animate-pulse" : ""} />
                Sala Global
              </div>
            </button>
            <button
              className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all \${activeChat === "friends_webcam" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-white/5 text-gray-300 hover:bg-white/10"}\`}
              onClick={() => {
                closeAllModals();
                setIsSidebarOpen(false);
                setActiveChat("friends_webcam");
              }}
            >
              <div className="flex items-center gap-2">
                <Webcam size={18} className={activeChat === "friends_webcam" ? "animate-pulse" : ""} />
                Friends Webcam
              </div>
            </button>
            <button
              className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all \${activeChat === "custom_rooms" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-white/5 text-gray-300 hover:bg-white/10"}\`}
              onClick={() => {
                closeAllModals();
                setIsSidebarOpen(false);
                setActiveChat("custom_rooms");
              }}
            >
              <div className="flex items-center gap-2">
                <Hash size={18} />
                Salas Creadas
              </div>
            </button>
          </div>
`;

code = code.replace(sidebarBottom, roomsSection);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched sidebar to include rooms");
