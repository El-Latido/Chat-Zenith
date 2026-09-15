const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchorTop = `                        {Object.values(unreadPMs).some(v => v) && (
                           <div className="w-2 h-2 bg-cyan-500 rounded-full ml-1"></div>
                        )}
                     </button>
                 </div>`;

const anchorBottom = `                            <div className="w-full h-px bg-white/5 my-2"></div>

             {/* User Search */}`;

// We will replace the entire block from the Top Nav AXISS check, down to the anchorBottom.
const badBlockStart = `                     {user?.username?.toUpperCase() === 'AXISS' && (
                         <>
                         <button className={\`flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border \${activeChat === 'cloud_admin'`;

const fullRegex = /\{user\?\.username\?\.toUpperCase\(\) === 'AXISS' && \([\s\S]*?<div className="w-full h-px bg-white\/5 my-2"><\/div>\s*\{\/\* User Search \*\/\}/m;

const restoredCode = `             {user?.username?.toUpperCase() === 'AXISS' && (
                 <>
                     <button onClick={() => { closeAllModals(); setActiveChat('cloud_admin'); }} className="hidden sm:flex items-center gap-1.5 bg-[#121B2A]/60 border border-[#D4AF37]/30 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors group">
                         <Cloud size={18} className="text-[#D4AF37] group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                         <span className="font-bold text-[#E8D9B0] text-sm">Panel Cloud</span>
                     </button>
                     <button onClick={() => { closeAllModals(); setActiveChat('cloud_admin'); }} className="sm:hidden text-[#D4AF37] hover:text-[#E8D9B0] p-1.5 rounded-full hover:bg-white/5 transition-colors">
                         <Cloud size={20} strokeWidth={1.5} />
                     </button>
                     <button onClick={() => { closeAllModals(); setActiveChat('builder'); }} className="hidden sm:flex items-center gap-1.5 bg-[#121B2A]/60 border border-[#D4AF37]/30 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors group">
                         <Home size={18} className="text-[#D4AF37] group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                         <span className="font-bold text-[#E8D9B0] text-sm">Creador 3D</span>
                     </button>
                     <button onClick={() => { closeAllModals(); setActiveChat('builder'); }} className="sm:hidden text-[#D4AF37] hover:text-[#E8D9B0] p-1.5 rounded-full hover:bg-white/5 transition-colors">
                         <Home size={20} strokeWidth={1.5} />
                     </button>
                 </>
             )}
             
             <button onClick={() => { closeAllModals(); setIsGamesMenuOpen(true); }} className="hidden sm:flex items-center gap-1.5 bg-[#121B2A]/60 border border-[#D4AF37]/30 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors group">
                 <Gamepad2 size={18} className="text-[#D4AF37] group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                 <span className="font-bold text-[#E8D9B0] text-sm">Juegos</span>
             </button>
             
             <div className="relative group cursor-pointer" onClick={() => { closeAllModals(); setAdminConfigLizOpen(true); }}>
                 <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.3)] group-hover:border-[#D4AF37] transition-all">
                     <img src={user.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${user.username}\`} alt={user.username} className="w-full h-full object-cover" />
                 </div>
                 {user.activeDecoration && (
                     <div className="absolute inset-0 pointer-events-none scale-125 z-10 flex items-center justify-center">
                         <img src={user.activeDecoration} alt="marco" className="w-full h-full object-contain" />
                     </div>
                 )}
                 <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0B1220]"></div>
             </div>
         </div>
      </nav>

      <div className="flex flex-1 h-0 relative">
         {/* Sidebar Principal */}
         <aside className={\`w-[280px] shrink-0 border-r border-[#D4AF37]/30 bg-[#121B2A]/95 backdrop-blur-xl absolute md:relative z-40 h-full flex flex-col transition-transform duration-300 \${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}\`}>
             <div className="p-4 flex flex-col items-center border-b border-[#D4AF37]/30">
                 <div className="relative mb-3 group cursor-pointer" onClick={() => { closeAllModals(); setAdminConfigLizOpen(true); }}>
                     <div className="w-20 h-20 rounded-full overflow-hidden border-[3px] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                         <img src={user.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${user.username}\`} alt={user.username} className="w-full h-full object-cover" />
                     </div>
                     {user.activeDecoration && (
                         <div className="absolute inset-0 pointer-events-none scale-125 z-10 flex items-center justify-center">
                             <img src={user.activeDecoration} alt="marco" className="w-full h-full object-contain" />
                         </div>
                     )}
                     <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-[3px] border-[#121B2A]"></div>
                 </div>
                 <h2 className="text-[#E8D9B0] font-bold text-lg flex items-center gap-1.5">{user.username} {user?.username?.toUpperCase() === 'AXISS' && <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Admin</span>}</h2>
                 <p className="text-[#8B98B0] text-xs">Conectado(a)</p>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar">
                 <div className="px-4 mt-4 grid grid-cols-2 gap-2">
                     <button className={\`flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border \${activeChat === 'lizgram' ? 'border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'border-[#D4AF37]/30'} px-3 py-2 rounded-2xl hover:bg-white/5 hover:text-[#E8D9B0] transition-all text-sm font-medium shadow-sm\`} onClick={() => { closeAllModals(); setIsSidebarOpen(false); setActiveChat('lizgram'); }}>
                        <ImageIcon size={16} strokeWidth={1.5} />
                        LizGram
                     </button>
                     {user?.username?.toUpperCase() === 'AXISS' && (
                         <button className={\`flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border \${activeChat === 'cloud_admin' ? 'border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'border-[#D4AF37]/30'} px-3 py-2 rounded-2xl hover:bg-white/5 hover:text-[#E8D9B0] transition-all text-sm font-medium shadow-sm\`} onClick={() => { closeAllModals(); setIsSidebarOpen(false); setActiveChat('cloud_admin'); }}>
                            <Cloud size={16} strokeWidth={1.5} />
                            Panel Cloud
                         </button>
                     )}
                     {user?.username?.toUpperCase() === 'AXISS' && (
                         <button className={\`flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border \${activeChat === 'builder' ? 'border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'border-[#D4AF37]/30'} px-3 py-2 rounded-2xl hover:bg-white/5 hover:text-[#E8D9B0] transition-all text-sm font-medium shadow-sm\`} onClick={() => { closeAllModals(); setIsSidebarOpen(false); setActiveChat('builder'); }}>
                            <Box size={16} strokeWidth={1.5} />
                            Creador 3D
                         </button>
                     )}
                     <button className={\`\${user?.username?.toUpperCase() === 'AXISS' ? 'col-span-2' : 'col-span-1'} flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border \${isFriendsSidebarOpen ? 'border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'border-[#D4AF37]/30'} px-3 py-2 rounded-2xl hover:bg-white/5 hover:text-[#E8D9B0] transition-all text-sm font-medium shadow-sm\`} onClick={() => { closeAllModals(); setIsFriendsSidebarOpen(!isFriendsSidebarOpen); }}>
                        <Users size={16} strokeWidth={1.5} />
                        Amigos
                        {Object.values(unreadPMs).some(v => v) && (
                           <div className="w-2 h-2 bg-cyan-500 rounded-full ml-1"></div>
                        )}
                     </button>
                 </div>
              
              <div className="w-full h-px bg-white/5 my-2"></div>

             {/* User Search */}`;

code = code.replace(fullRegex, restoredCode);

fs.writeFileSync('src/App.tsx', code);
