const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The error is that the map inside the usersList was not returning the correct parent element!
// Wait! Let's check what exactly is inside the usersOnline.map

content = content.replace(/<div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 scrollbar-thin">\s*\{usersOnline.map\(/g, '<div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 scrollbar-thin"></div>\n                 {usersOnline.map(');

// Actually, wait! The usersOnline.map DOES return an element.
// Let's replace the whole block to be safe.

const usersListRegex = /\{\/\* Users List \*\/\}\s*<div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 scrollbar-thin">.*?<\/aside>/s;

const newUsersList = `{/* Users List */}
              <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 scrollbar-thin">
                 {usersOnline.map(u => {
                    if (u.username === 'Elizabeth') return null;
                    return (
                        <div key={u.username} className="bg-[#1A2639]/80 border border-[#D4AF37]/30 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-colors" onClick={() => { closeAllModals(); setIsSidebarOpen(false); setActiveChat(u.username); }}>
                           <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D4AF37]/50 relative flex-shrink-0">
                                   <img src={u.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${u.username}\`} alt={u.username} className="w-full h-full object-cover" />
                                   {u.activeDecoration && (
                                       <div className="absolute inset-0 pointer-events-none scale-125 z-10 flex items-center justify-center">
                                           <img src={u.activeDecoration} alt="marco" className="w-full h-full object-contain" />
                                       </div>
                                   )}
                               </div>
                               <div className="flex-1 min-w-0">
                                   <p className="text-[#E8D9B0] font-bold text-sm truncate flex items-center gap-1.5">{u.username} {u.username.toUpperCase() === 'AXISS' && <span className="bg-red-500/20 text-red-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Admin</span>}</p>
                                   <p className="text-[#8B98B0] text-xs truncate">En línea</p>
                               </div>
                           </div>
                        </div>
                    );
                 })}
              </div>
          </aside>`;

content = content.replace(usersListRegex, newUsersList);

fs.writeFileSync('src/App.tsx', content);
console.log('Replaced users list.');
