const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const toastUI = `
       {/* Toasts Notifications */}
       <div className="fixed top-20 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
           {toasts.map(toast => {
               const senderInfo = usersOnline.find(u => u.username === toast.sender) || userCache[toast.sender];
               const senderPic = senderInfo?.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${toast.sender}\`;
               return (
                   <div key={toast.id} onClick={() => {
                       setIsSidebarOpen(false);
                       setIsFriendsSidebarOpen(false);
                       setActiveChat(toast.sender);
                       setToasts(prev => prev.filter(t => t.id !== toast.id));
                   }} className="pointer-events-auto cursor-pointer bg-[#0f111a]/95 backdrop-blur-xl border border-[#D4AF37]/50 shadow-[0_4px_20px_rgba(212,175,55,0.15)] rounded-2xl p-3 flex items-center gap-3 w-72 animate-in fade-in slide-in-from-top-4 transition-all hover:bg-white/5">
                       <img src={senderPic} alt={toast.sender} className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/30" />
                       <div className="flex flex-col flex-1 min-w-0">
                           <span className="text-[#E8D9B0] font-bold text-sm truncate">{toast.sender}</span>
                           <span className="text-gray-400 text-xs truncate">{toast.text}</span>
                       </div>
                   </div>
               );
           })}
       </div>
`;

code = code.replace("{/* Selected User Info Modal */}", toastUI + "\n      {/* Selected User Info Modal */}");

fs.writeFileSync('src/App.tsx', code);
