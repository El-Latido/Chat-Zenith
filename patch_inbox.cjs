const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('Trash2')) {
    content = content.replace('Menu, X, Hash', 'Trash2, Menu, X, Hash');
}

const oldSidebarStart = '{/* Friends Sidebar */}';
const oldSidebarEnd = '{/* Games Menu Modal */}';

const startIndex = content.indexOf(oldSidebarStart);
const endIndex = content.indexOf(oldSidebarEnd);

const newSidebar = `
       {/* Friends Sidebar (Inbox) */}
       {isFriendsSidebarOpen && (
           <div className="fixed inset-y-0 right-0 w-80 bg-[#0f111a] backdrop-blur-xl border-l border-white/10 shadow-2xl z-[105] flex flex-col transform transition-transform animate-in slide-in-from-right">
               <div className="p-6 border-b border-white/5 flex items-center justify-between">
                   <h2 className="text-xl font-bold text-white flex items-center gap-2">
                       <MessageSquare size={24} className="text-cyan-400" />
                       Buzón de Mensajes
                   </h2>
                   <button onClick={() => setIsFriendsSidebarOpen(false)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                       <X size={20} />
                   </button>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-2">
                   {chatList.length === 0 ? (
                       <p className="text-gray-500 text-center text-sm mt-10">Tu buzón está vacío. ¡Empieza a chatear!</p>
                   ) : (
                       chatList.map(chatInfo => {
                           const friendUsername = chatInfo.withUser;
                           const isOnline = usersOnline.some(u => u.username === friendUsername);
                           const friendInfo = usersOnline.find(u => u.username === friendUsername) || userCache[friendUsername];
                           
                           return (
                               <div key={friendUsername} className="flex items-center gap-2 group p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                   <div 
                                       onClick={() => { setActiveChat(friendUsername); setUnreadPMs(prev => ({...prev, [friendUsername]: false})); setIsFriendsSidebarOpen(false); }}
                                       className="flex-1 flex items-center gap-3 cursor-pointer min-w-0"
                                   >
                                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 overflow-hidden relative flex-shrink-0">
                                           <img src={friendInfo?.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${friendUsername}\`} className="w-full h-full object-cover" />
                                           <div className={\`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f111a] \${isOnline ? 'bg-green-500' : 'bg-gray-500'}\`}></div>
                                       </div>
                                       <div className="flex-1 min-w-0">
                                           <div className="flex justify-between items-center">
                                               <p className="text-white font-medium text-sm truncate">{friendUsername}</p>
                                               {unreadPMs[friendUsername] && <div className="w-2 h-2 rounded-full bg-cyan-500 ml-2"></div>}
                                           </div>
                                           <p className="text-xs text-gray-500 truncate">{chatInfo.lastMessage || 'Conversación'}</p>
                                       </div>
                                   </div>
                                   <button 
                                       onClick={(e) => {
                                           e.stopPropagation();
                                           if(window.confirm('¿Eliminar esta conversación de tu buzón?')) {
                                               import('firebase/firestore').then(({ deleteDoc, doc }) => {
                                                   deleteDoc(doc(db, "userChats", user.username, "chats", friendUsername));
                                               });
                                           }
                                       }}
                                       className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                                       title="Eliminar del buzón"
                                   >
                                       <Trash2 size={16} />
                                   </button>
                               </div>
                           );
                       })
                   )}
               </div>
           </div>
       )}
       `;

content = content.substring(0, startIndex) + newSidebar + content.substring(endIndex);
fs.writeFileSync('src/App.tsx', content);
