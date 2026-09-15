const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const navBarSearch = `        {/* Right: Avatar, Name, Settings */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3">`;

const navBarReplace = `        {/* Right: Avatar, Name, Settings */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3">
          
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full text-[#D4AF37] hover:bg-white/5 transition-colors relative"
            >
              <Bell size={24} strokeWidth={1.5} />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-[#121B2A]/95 backdrop-blur-xl border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="p-3 border-b border-[#D4AF37]/30 flex justify-between items-center">
                  <h3 className="text-[#E8D9B0] font-bold">Notificaciones</h3>
                  {notifications.length > 0 && (
                    <button 
                      onClick={() => setNotifications([])}
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
                    notifications.map((n, i) => (
                      <div key={i} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors text-sm text-gray-300">
                        {n}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>`;

code = code.replace(navBarSearch, navBarReplace);

// Let's add notification hook when receiving private message
const pMsgSearch = `    socket.on("receive_private", (msg: any, fromUser: string) => {
      playNotifySound();
      if (activeChatRef.current !== fromUser) {
        setUnreadPMs((prev) => ({ ...prev, [fromUser]: true }));
        setToasts((prev) => [`;

const pMsgReplace = `    socket.on("receive_private", (msg: any, fromUser: string) => {
      playNotifySound();
      if (activeChatRef.current !== fromUser) {
        setUnreadPMs((prev) => ({ ...prev, [fromUser]: true }));
        setNotifications((prev) => [\`Nuevo mensaje de \${fromUser}\`, ...prev]);
        setToasts((prev) => [`;

code = code.replace(pMsgSearch, pMsgReplace);

// Add notification hook when receiving a like
const likeSearch = `    socket.on("user_liked", (fromUser: string) => {
      playNotifySound();
      setToasts((prev) => [`;

const likeReplace = `    socket.on("user_liked", (fromUser: string) => {
      playNotifySound();
      setNotifications((prev) => [\`A \${fromUser} le gustó tu perfil\`, ...prev]);
      setToasts((prev) => [`;

code = code.replace(likeSearch, likeReplace);

fs.writeFileSync('src/App.tsx', code);
