const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const bellButton = `
             <button onClick={() => { closeAllModals(); setShowNotifications(!showNotifications); }} className="relative text-[#D4AF37] hover:text-[#E8D9B0] p-2 rounded-full hover:bg-white/5 transition-colors">
                 <Bell size={20} strokeWidth={1.5} />
                 {notifications.filter(n => !n.isRead).length > 0 && (
                     <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0B101A]"></div>
                 )}
             </button>
             
             {showNotifications && (
                 <div className="absolute top-16 right-4 w-80 bg-[#121B2A] border border-[#D4AF37]/30 shadow-2xl rounded-xl z-[200] overflow-hidden flex flex-col max-h-[400px]">
                    <div className="p-3 border-b border-[#D4AF37]/20 flex justify-between items-center bg-black/20">
                        <h3 className="text-[#E8D9B0] font-bold text-sm flex items-center gap-2"><Bell size={16}/> Notificaciones</h3>
                        <button onClick={() => {
                            import('firebase/firestore').then(({ writeBatch, doc }) => {
                                const batch = writeBatch(db);
                                notifications.filter(n => !n.isRead).forEach(n => {
                                    batch.update(doc(db, "notifications", n.id), { isRead: true });
                                });
                                batch.commit();
                            });
                        }} className="text-xs text-[#D4AF37] hover:text-white">Marcar leídas</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {notifications.length === 0 ? (
                            <p className="text-xs text-gray-500 text-center py-4">No tienes notificaciones.</p>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className={\`p-3 rounded-lg text-sm flex gap-3 items-start \${n.isRead ? 'opacity-60 bg-white/5' : 'bg-white/10 border border-[#D4AF37]/30'}\`}>
                                    <div className="mt-1">
                                        {n.type === 'LIKE' ? <Heart size={16} className="text-pink-500" /> : 
                                         n.type === 'MESSAGE' ? <MessageSquare size={16} className="text-blue-400" /> : 
                                         <Bell size={16} className="text-[#D4AF37]" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white text-xs">{n.message || (n.type === 'LIKE' ? \`A \${n.senderName} le gustó tu perfil.\` : \`Nueva notificación de \${n.senderName}\`)}</p>
                                    </div>
                                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5"></div>}
                                </div>
                            ))
                        )}
                    </div>
                 </div>
             )}
`;

content = content.replace(
    /<button onClick=\{[^}]+\} className="hidden sm:flex items-center gap-1.5 bg-\[#121B2A\]\/60 border border-\[#D4AF37\]\/30 px-3 py-1.5 rounded-full hover:bg-white\/5 transition-colors group">/g,
    bellButton + '\n             <button onClick={() => { closeAllModals(); setIsGamesMenuOpen(true); }} className="hidden sm:flex items-center gap-1.5 bg-[#121B2A]/60 border border-[#D4AF37]/30 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors group">'
);

fs.writeFileSync('src/App.tsx', content);
