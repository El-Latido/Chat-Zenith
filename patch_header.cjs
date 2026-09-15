const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const navTarget = `        {/* Center: Chat-Liz pill */}
        <div className="flex-1 flex justify-center">
          <div className="bg-[#121B2A]/60 backdrop-blur-md border border-[#D4AF37]/30 rounded-full px-6 py-1.5 shadow-[0_0_15px_rgba(212,175,55,0.1)] flex items-center justify-center">
            <h1 className="text-[16px] font-bold text-[#E8D9B0] tracking-wide">
              Chat-Liz
            </h1>
          </div>
        </div>`;

const navReplacement = `        {/* Center/Right alignment for top icons (Removed Chat-Liz text to save space as requested) */}
        <div className="flex-1 flex justify-center">
           {/* Empty space for balance if needed */}
        </div>`;

code = code.replace(navTarget, navReplacement);

const rightSideTarget = `        {/* Right: Avatar, Name, Settings */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3">
          
          <div className="relative">`;

const rightSideReplacement = `        {/* Right: Actions and Settings */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3">
          
          {/* LizGram Button */}
          <button
            onClick={() => {
              closeAllModals();
              setIsSidebarOpen(false);
              setActiveChat("lizgram");
            }}
            className={\`p-2 rounded-full transition-colors relative \${activeChat === "lizgram" ? "text-cyan-400 bg-cyan-500/20" : "text-[#D4AF37] hover:bg-white/5"}\`}
            title="LizGram"
          >
            <ImageIcon size={24} strokeWidth={1.5} />
          </button>

          {/* Buzón (Private messages/Friends) */}
          <button
            onClick={() => {
              closeAllModals();
              setIsFriendsSidebarOpen(!isFriendsSidebarOpen);
            }}
            className={\`p-2 rounded-full transition-colors relative \${isFriendsSidebarOpen ? "text-pink-400 bg-pink-500/20" : "text-[#D4AF37] hover:bg-white/5"}\`}
            title="Buzón"
          >
            <MessageSquare size={24} strokeWidth={1.5} />
            {Object.values(unreadPMs).some((v) => v) && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-cyan-500 rounded-full border border-[#0B1220]"></span>
            )}
          </button>

          <div className="relative">`;

code = code.replace(rightSideTarget, rightSideReplacement);

// Now remove LizGram and Buzón from the Sidebar
const sidebarTarget = `          <div className="px-4 mt-4 grid grid-cols-2 gap-2">
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
              <MessageSquare size={16} strokeWidth={1.5} />
              Buzón
              {Object.values(unreadPMs).some((v) => v) && (
                <div className="w-2 h-2 bg-cyan-500 rounded-full ml-1"></div>
              )}
            </button>
          </div>`;

code = code.replace(sidebarTarget, "");
fs.writeFileSync('src/App.tsx', code);
console.log("Patched header and sidebar items");
