const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Render the comments section below the "chat privado / dar like" buttons
const search = `                {selectedUserModal.username !== "Elizabeth" && (
                  <div className="flex gap-2">`;
const replace = `                {/* Comentarios de perfil */}
                <div className="mt-4 bg-[#0a0a16] border border-white/5 p-4 rounded-2xl">
                  <h4 className="text-sm font-bold text-gray-400 mb-3 border-b border-white/5 pb-2">Comentarios</h4>
                  <div className="max-h-40 overflow-y-auto flex flex-col gap-2 mb-3">
                    {(!selectedUserModal.profileComments || selectedUserModal.profileComments.length === 0) ? (
                      <p className="text-xs text-gray-500 italic">No hay comentarios aún.</p>
                    ) : (
                      selectedUserModal.profileComments.map((c: any, i: number) => (
                        <div key={i} className="bg-white/5 p-2 rounded-lg text-sm">
                          <span className="font-bold text-cyan-400 mr-2">{c.author}:</span>
                          <span className="text-gray-300">{c.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.elements.namedItem('comment') as HTMLInputElement;
                    if (input.value.trim()) {
                      socket.emit("add_profile_comment", { targetUser: selectedUserModal.username, comment: input.value });
                      // Optimistic UI update
                      setSelectedUserModal(prev => prev ? {
                        ...prev,
                        profileComments: [...(prev.profileComments || []), { author: user.username, text: input.value, timestamp: Date.now() }]
                      } : null);
                      input.value = '';
                    }
                  }} className="flex gap-2">
                    <input name="comment" type="text" placeholder="Escribe un comentario..." className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
                    <button type="submit" className="bg-cyan-500/20 text-cyan-400 px-3 py-2 rounded-xl text-sm font-bold hover:bg-cyan-500 hover:text-white transition-colors">Enviar</button>
                  </form>
                </div>

                {selectedUserModal.username !== "Elizabeth" && (
                  <div className="flex gap-2">`;

code = code.replace(search, replace);

// Let's add the socket listener for new_profile_comment
const listenSearch = `    socket.on("update_coins", (newCoins: number) => {`;
const listenReplace = `    socket.on("new_profile_comment", (data: { fromUser: string, comment: any }) => {
      playNotifySound();
      setNotifications(prev => [\`\${data.fromUser} comentó en tu perfil\`, ...prev]);
      setToasts(prev => [\`Nuevo comentario de \${data.fromUser}\`, ...prev]);
      if (user.username === data.fromUser) return; // shouldn't happen but just in case
      // update local user state if we are viewing our own profile? (Not implemented viewing own profile here, usually it's in config)
    });

    socket.on("profile_comment_added", (data: { targetUser: string, comment: any }) => {
       // already handled optimistically
    });

    socket.on("update_coins", (newCoins: number) => {`;

code = code.replace(listenSearch, listenReplace);

fs.writeFileSync('src/App.tsx', code);
