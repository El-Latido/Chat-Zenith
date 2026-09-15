const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add UserPlus to lucide imports
code = code.replace("  Users,", "  Users,\n  UserPlus,");

// Add state for friend requests modal
code = code.replace("  const [isReportsListOpen, setIsReportsListOpen] = useState(false);", "  const [isReportsListOpen, setIsReportsListOpen] = useState(false);\n  const [isFriendReqOpen, setIsFriendReqOpen] = useState(false);");

// Close friend requests modal in closeAllModals
code = code.replace("    setIsFriendsSidebarOpen(false);", "    setIsFriendsSidebarOpen(false);\n    setIsFriendReqOpen(false);");

// Inject Solicitudes button
const searchGrid = `            <button
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
          </div>`;

const replaceGrid = `            <button
              className={\`flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border \${isFriendsSidebarOpen ? "border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]" : "border-[#D4AF37]/30"} px-3 py-2 rounded-2xl hover:bg-white/5 hover:text-[#E8D9B0] transition-all text-sm font-medium shadow-sm\`}
              onClick={() => {
                closeAllModals();
                setIsFriendsSidebarOpen(!isFriendsSidebarOpen);
              }}
            >
              <MessageSquare size={16} strokeWidth={1.5} />
              Buzón
              {Object.values(unreadPMs).some((v) => v) && (
                <div className="w-2 h-2 bg-cyan-500 rounded-full ml-1"></div>
              )}
            </button>
          </div>
          <div className="px-4 mt-2">
            <button
              className={\`w-full flex items-center justify-center gap-2 text-cyan-400 bg-cyan-500/10 border \${isFriendReqOpen ? "border-cyan-500/50" : "border-cyan-500/20"} px-3 py-2 rounded-2xl hover:bg-cyan-500/20 transition-all text-sm font-medium\`}
              onClick={() => {
                closeAllModals();
                setIsFriendReqOpen(!isFriendReqOpen);
              }}
            >
              <UserPlus size={16} strokeWidth={1.5} />
              Solicitudes de Amistad
              {(user?.friend_requests && user.friend_requests.length > 0) && (
                <span className="bg-cyan-500 text-black text-xs font-bold px-2 py-0.5 rounded-full ml-1">{user.friend_requests.length}</span>
              )}
            </button>
          </div>`;

code = code.replace(searchGrid, replaceGrid);

fs.writeFileSync('src/App.tsx', code);
console.log("Added Solicitudes button and changed Inbox to Buzon.");
