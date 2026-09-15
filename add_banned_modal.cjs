const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const modalCode = `      {isBannedListOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-red-500/30 w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
            <button
              onClick={() => setIsBannedListOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
              <ShieldAlert size={24} /> Usuarios Baneados
            </h2>
            {bannedList.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No hay usuarios baneados actualmente.</p>
            ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {bannedList.map(bUser => (
                     <div key={bUser.username} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                           <img src={bUser.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${bUser.username}\`} className="w-10 h-10 rounded-full bg-black/50" alt={bUser.username} />
                           <div>
                              <div className="text-white font-bold">{bUser.username}</div>
                              <div className="text-xs text-red-300">Expira: {new Date(bUser.expiresAt).toLocaleTimeString()}</div>
                           </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    socket.emit("admin_unban_user", bUser.username, (res) => {
                                        if (res.success) {
                                            setBannedList(prev => prev.filter(u => u.username !== bUser.username));
                                            showToast(\`\${bUser.username} fue desbaneado.\`, "success");
                                        }
                                    });
                                }}
                                className="px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm font-medium transition-colors"
                            >
                                Desbanear
                            </button>
                            <button
                                onClick={() => {
                                    socket.emit("admin_ban_user", bUser.username, (res) => {
                                        if (res.success) {
                                            socket.emit("get_banned_users", (list) => setBannedList(list));
                                            showToast(\`\${bUser.username} fue baneado (renovado).\`, "success");
                                        }
                                    });
                                }}
                                className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-colors"
                                title="Renovar Ban (15 min)"
                            >
                                Bloquear
                            </button>
                        </div>
                     </div>
                  ))}
                </div>
            )}
          </div>
        </div>
      )}

      {isConfigOpen && (`;

code = code.replace(`      {isConfigOpen && (`, modalCode);
fs.writeFileSync('src/App.tsx', code);
