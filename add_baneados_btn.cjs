const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `            <button
              className={\`flex items-center gap-2 p-2 rounded-xl transition-all \${isFriendsSidebarOpen ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}\`}
              onClick={() => {
                closeAllModals();
                setIsFriendsSidebarOpen(!isFriendsSidebarOpen);
              }}
            >
              <Users size={16} strokeWidth={1.5} />
              Inbox / Amigos
              {Object.values(unreadPMs).some((v) => v) && (
                <div className="w-2 h-2 bg-cyan-500 rounded-full ml-1"></div>
              )}
            </button>`;

const replace = `            <button
              className={\`flex items-center gap-2 p-2 rounded-xl transition-all \${isFriendsSidebarOpen ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}\`}
              onClick={() => {
                closeAllModals();
                setIsFriendsSidebarOpen(!isFriendsSidebarOpen);
              }}
            >
              <Users size={16} strokeWidth={1.5} />
              Inbox / Amigos
              {Object.values(unreadPMs).some((v) => v) && (
                <div className="w-2 h-2 bg-cyan-500 rounded-full ml-1"></div>
              )}
            </button>
            {user.role === "admin" && (
                <button
                  className={\`flex items-center gap-2 p-2 rounded-xl transition-all \${isBannedListOpen ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-gray-400 hover:bg-white/5 hover:text-white"}\`}
                  onClick={() => {
                    closeAllModals();
                    socket.emit("get_banned_users", (list) => setBannedList(list));
                    setIsBannedListOpen(true);
                  }}
                >
                  <ShieldAlert size={16} strokeWidth={1.5} />
                  Baneados
                </button>
            )}`;

code = code.replace(search, replace);

// Add ShieldAlert to lucide-react imports if not there
if (!code.includes('ShieldAlert')) {
    code = code.replace('Users,', 'Users, ShieldAlert,');
}

fs.writeFileSync('src/App.tsx', code);
