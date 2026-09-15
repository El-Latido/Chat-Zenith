const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetNav = /<div className="flex justify-center px-4 py-2 shrink-0 z-\[100\] relative w-full pointer-events-none mt-2">[\s\S]*?<\/nav>\s*<\/div>/;

const repNav = `      {/* Top Navigation Bar (Floating/Overlay style) */}
      <nav className="flex items-center justify-between px-4 py-3 shrink-0 z-[100] relative w-full border-b border-white/5 bg-black/40 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]" style={{ borderBottomColor: "var(--neon-color, #00f3ff)22" }}>
        <div className="flex-1 flex items-center justify-start">
          <button
            onClick={() => {
              closeAllModals();
              setIsSidebarOpen(!isSidebarOpen);
            }}
            className="md:hidden text-white/80 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 flex justify-center">
           {/* Empty space for balance if needed */}
        </div>

        {/* Right: Actions and Settings */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3">
          
          {/* LizGram Button */}
          <button
            onClick={() => {
              closeAllModals();
              setIsSidebarOpen(false);
              setActiveChat("lizgram");
            }}
            className={\`p-2 rounded-full transition-colors relative \${activeChat === "lizgram" ? "text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]" : "text-white/80 hover:bg-white/5"}\`}
            style={{ backgroundColor: activeChat === "lizgram" ? "var(--neon-color, #00f3ff)33" : "transparent" }}
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
            className={\`p-2 rounded-full transition-colors relative \${isFriendsSidebarOpen ? "text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]" : "text-white/80 hover:bg-white/5"}\`}
            style={{ backgroundColor: isFriendsSidebarOpen ? "var(--neon-color, #00f3ff)33" : "transparent" }}
            title="Buzón"
          >
            <MessageSquare size={24} strokeWidth={1.5} />
            {Object.values(unreadPMs).some((v) => v) && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border border-[#0B1220]" style={{ backgroundColor: "var(--neon-color, #00f3ff)" }}></span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full text-white/80 hover:bg-white/5 transition-colors relative"
            >
              <Bell size={24} strokeWidth={1.5} />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0a0a0c]/90 backdrop-blur-2xl border-r border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-white/5 rounded-2xl overflow-hidden z-50">
                <div className="p-3 border-b border-white/5 flex justify-between items-center" style={{ borderBottomColor: "var(--neon-color, #00f3ff)44" }}>
                  <h3 className="text-white font-bold" style={{ color: "var(--neon-color, #00f3ff)" }}>Notificaciones</h3>
                  {notifications.length > 0 && (
                    <button 
                       onClick={async () => {
                        const firestoreNotifs = notifications.filter(n => n.id && n.id.length > 13);
                        setNotifications([]);
                        for (const n of firestoreNotifs) { 
                           try {
                               await deleteDoc(doc(db, "notifications", n.id));
                           } catch(e) {}
                        }
                      }}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      No hay notificaciones
                    </div>
                  ) : (
                    notifications.map((n, i) => {
                      const isString = typeof n === 'string';
                      const text = isString ? n : n.text || 'Notificación';
                      const fromUser = !isString ? (n.fromUser || n.senderName) : null;
                      const type = !isString ? (n.type === 'MESSAGE' ? 'private_message' : (n.type === 'LIKE' ? 'like' : n.type)) : 'system';
                      
                      const fromUserObj = fromUser ? (usersOnline.find(u => u.username === fromUser) || userCache[fromUser]) : null;
                      const avatarSrc = fromUserObj?.profilePic || (fromUser ? \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${fromUser}\` : undefined);
                      return (
                      <div 
                         key={isString ? i : n.id || i} 
                         onClick={async () => {
                            if (n.id && n.id.length > 13) {
                               setNotifications(prev => prev.filter(x => x.id !== n.id));
                               try { await deleteDoc(doc(db, "notifications", n.id)); } catch(e) {}
                            }
                            if (type === 'private_message' && fromUser) {
                               setActiveChat(fromUser);
                               if (window.innerWidth < 768) setIsSidebarOpen(false);
                            }
                         }}
                         className="p-3 hover:bg-white/5 border-b border-white/5 cursor-pointer transition-colors flex items-start gap-3 group"
                      >
                         {avatarSrc ? (
                            <img src={avatarSrc} alt={fromUser} className="w-8 h-8 rounded-full border border-white/10" />
                         ) : (
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                              <Bell size={14} className="text-white/50" />
                            </div>
                         )}
                         <div className="flex flex-col min-w-0">
                           <span className="text-white/90 text-sm break-words group-hover:text-white">{text}</span>
                           <span className="text-white/40 text-xs mt-0.5">{type === 'system' ? 'Sistema' : fromUser}</span>
                         </div>
                      </div>
                    )})
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative group/profile ml-1">
            <button
              onClick={() => {
                closeAllModals();
                setIsProfileModalOpen(true);
              }}
              className="w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
              style={{ borderColor: "var(--neon-color, #00f3ff)" }}
            >
              <img
                referrerPolicy="no-referrer"
                src={user.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${user.username}\`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </nav>`;

if(targetNav.test(code)) {
    code = code.replace(targetNav, repNav);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Nav replacement successful");
} else {
    console.log("Nav replacement failed - Regex did not match");
}
