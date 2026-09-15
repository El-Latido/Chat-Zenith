const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `          <div className="px-4 mt-4 grid grid-cols-2 gap-2">
            <button
              className={\`flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border \${activeChat === "lizgram" ? "border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]" : "border-[#D4AF37]/30"} px-3 py-2 rounded-2xl hover:bg-white/5 hover:text-[#E8D9B0] transition-all text-sm font-medium shadow-sm\`}
              onClick={() => {
                closeAllModals();
                setIsSidebarOpen(false);
                setActiveChat("lizgram");
              }}
            >
              <ImageIcon size={16} strokeWidth={1.5} />
              LizGram
            </button>
            <button
              className={\`\${user?.username?.toUpperCase() === "AXISS" ? "col-span-2" : "col-span-1"} flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border \${isFriendsSidebarOpen ? "border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]" : "border-[#D4AF37]/30"} px-3 py-2 rounded-2xl hover:bg-white/5 hover:text-[#E8D9B0] transition-all text-sm font-medium shadow-sm\`}
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
          </div>`;

const replace = `          <div className="px-4 mt-4 grid grid-cols-2 gap-2">
            <button
              className={\`flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border \${activeChat === "lizgram" ? "border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]" : "border-[#D4AF37]/30"} px-3 py-2 rounded-2xl hover:bg-white/5 hover:text-[#E8D9B0] transition-all text-sm font-medium shadow-sm\`}
              onClick={() => {
                closeAllModals();
                setIsSidebarOpen(false);
                setActiveChat("lizgram");
              }}
            >
              <ImageIcon size={16} strokeWidth={1.5} />
              LizGram
            </button>
            <button
              className={\`flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border \${isFriendsSidebarOpen ? "border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]" : "border-[#D4AF37]/30"} px-3 py-2 rounded-2xl hover:bg-white/5 hover:text-[#E8D9B0] transition-all text-sm font-medium shadow-sm\`}
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
          </div>

          {user?.role === "admin" && (
            <div className="px-4 mt-2 grid grid-cols-2 gap-2">
              <button
                className={\`flex items-center justify-center gap-2 text-red-400 bg-red-500/10 border \${isBannedListOpen ? "border-red-500/50" : "border-red-500/20"} px-3 py-2 rounded-2xl hover:bg-red-500/20 transition-all text-sm font-medium\`}
                onClick={() => {
                  closeAllModals();
                  socket.emit("get_banned_users", (list: any) => setBannedList(list));
                  setIsBannedListOpen(!isBannedListOpen);
                }}
              >
                <ShieldAlert size={16} strokeWidth={1.5} />
                Baneados
              </button>
              <button
                className={\`flex items-center justify-center gap-2 text-orange-400 bg-orange-500/10 border \${isReportsListOpen ? "border-orange-500/50" : "border-orange-500/20"} px-3 py-2 rounded-2xl hover:bg-orange-500/20 transition-all text-sm font-medium\`}
                onClick={() => {
                  closeAllModals();
                  socket.emit("get_reports", (list: any) => setReportsList(list));
                  setIsReportsListOpen(!isReportsListOpen);
                }}
              >
                <AlertTriangle size={16} strokeWidth={1.5} />
                Reportes
              </button>
            </div>
          )}`;

code = code.replace(search, replace);
fs.writeFileSync('src/App.tsx', code);
console.log("Done fixing admin buttons.");
