const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetNav = /<nav className="flex items-center justify-between px-4 py-3 shrink-0 z-\[100\] relative w-full border-b border-white\/5 bg-white\/\[0\.03\] backdrop-blur-xl border-b border-white\/10 shadow-\[0_4px_30px_rgba\(0,0,0,0\.1\)\]">[\s\S]*?<\/nav>/;

const replacementNav = `<div className="flex justify-center px-4 py-2 shrink-0 z-[100] relative w-full pointer-events-none mt-2">
        <nav 
          className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 rounded-full pointer-events-auto shadow-[0_4px_30px_rgba(0,0,0,0.1)] robotic-neon"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f0f0f5 100%)",
            border: "2px solid var(--neon-color, #00f3ff)",
            boxShadow: "0 0 15px var(--neon-color, #00f3ff), inset 0 0 10px rgba(0,0,0,0.05)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Hamburger (Mobile) */}
          <button
            onClick={() => {
              closeAllModals();
              setIsSidebarOpen(!isSidebarOpen);
            }}
            className="md:hidden p-2 rounded-full transition-all group"
            style={{ color: "black" }}
          >
            <Menu size={22} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
          </button>

          {/* LizGram */}
          <button
            onClick={() => {
              closeAllModals();
              setIsSidebarOpen(false);
              setActiveChat("lizgram");
            }}
            className="p-2 rounded-full transition-all relative group"
            title="LizGram"
            style={{ color: activeChat === "lizgram" ? "var(--neon-color, #00f3ff)" : "black" }}
          >
            <ImageIcon size={22} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
            {activeChat === "lizgram" && (
                <div className="absolute inset-0 rounded-full bg-black/5 animate-pulse pointer-events-none"></div>
            )}
          </button>

          {/* Divider */}
          <div className="w-[1px] h-6 bg-black/10 mx-1"></div>

          {/* Buzón (Private messages) */}
          <button
            onClick={() => {
              closeAllModals();
              setIsFriendsSidebarOpen(!isFriendsSidebarOpen);
            }}
            className="p-2 rounded-full transition-all relative group"
            title="Buzón"
            style={{ color: isFriendsSidebarOpen ? "var(--neon-color, #00f3ff)" : "black" }}
          >
            <MessageSquare size={22} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
            {Object.values(unreadPMs).some((v) => v) && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--neon-color, #00f3ff)", boxShadow: "0 0 5px var(--neon-color, #00f3ff)" }}></span>
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full transition-all relative group"
              style={{ color: showNotifications ? "var(--neon-color, #00f3ff)" : "black" }}
            >
              <Bell size={22} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                  {notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-72 bg-white border shadow-2xl overflow-hidden z-50 rounded-2xl"
                   style={{ borderColor: "var(--neon-color, #00f3ff)", boxShadow: "0 10px 40px rgba(0,0,0,0.1), 0 0 15px var(--neon-color, #00f3ff) inset" }}>
                <div className="p-3 border-b border-black/5 flex justify-between items-center bg-gray-50">
                  <h3 className="text-black font-bold">Notificaciones</h3>
                  {notifications.length > 0 && (
                    <button 
                       onClick={async () => {
                        const firestoreNotifs = notifications.filter(n => n.id && n.id.length > 13);
                        setNotifications([]);
                        for (const n of firestoreNotifs) { 
                           try { await deleteDoc(doc(db, "notifications", n.id)); } catch(e) {}
                        }
                      }}
                      className="text-xs text-gray-500 hover:text-black font-semibold"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm font-medium">
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
                         className="p-3 hover:bg-gray-50 border-b border-black/5 cursor-pointer transition-colors flex items-start gap-3 group"
                      >
                         {avatarSrc ? (
                            <img src={avatarSrc} alt={fromUser} className="w-8 h-8 rounded-full border border-gray-200" />
                         ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                              <Bell size={14} className="text-gray-400" />
                            </div>
                         )}
                         <div className="flex flex-col min-w-0">
                           <span className="text-black text-sm break-words group-hover:text-black">{text}</span>
                           <span className="text-gray-400 text-xs mt-0.5">{type === 'system' ? 'Sistema' : fromUser}</span>
                         </div>
                      </div>
                    )})
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-[1px] h-6 bg-black/10 mx-1"></div>

          {/* Profile / User Menu */}
          <div className="relative group/profile">
            <button
              onClick={() => {
                closeAllModals();
                setIsProfileModalOpen(true);
              }}
              className="w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 ml-1"
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
        </nav>
      </div>`;

if(targetNav.test(code)) {
    code = code.replace(targetNav, replacementNav);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Replaced nav correctly");
} else {
    console.log("Could not find nav block");
}
