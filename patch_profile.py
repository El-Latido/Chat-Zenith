import re

with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "{selectedUserModal && (" in line:
        start_idx = i
    if "{/* Friends Sidebar (Inbox) */}" in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    new_modal = """
      {selectedUserModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedUserModal(null)}
        >
          <div
            className="bg-[#0f111a] rounded-[32px] w-full max-w-md shadow-2xl relative overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cover Photo Area */}
            <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
               <button
                 onClick={() => setSelectedUserModal(null)}
                 className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-all"
               >
                 <X size={20} />
               </button>
            </div>
            
            <div className="px-6 pb-6 relative">
              {/* Avatar */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                  <div
                    className={`w-32 h-32 rounded-full border-4 border-[#0f111a] overflow-hidden relative shadow-lg ${selectedUserModal.isAi && user.username.trim() === "Axiss" ? "cursor-pointer group" : ""}`}
                    onClick={() => {
                      if (selectedUserModal.isAi && user.username.trim() === "Axiss") {
                        setAdminConfigAiForm({
                          profilePic: selectedUserModal.profilePic || "",
                          statusMessage: selectedUserModal.statusMessage || "Inteligencia Artificial",
                          systemInstruction: selectedUserModal.systemInstruction || "",
                        });
                        setCurrentAdminAi(selectedUserModal.username);
                        setSelectedUserModal(null);
                        closeAllModals();
                        setAdminConfigAiOpen(true);
                      }
                    }}
                  >
                    <img
                      referrerPolicy="no-referrer"
                      src={
                        selectedUserModal.profilePic ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUserModal.username}`
                      }
                      className="w-full h-full object-cover bg-white/5"
                    />
                    {selectedUserModal.isAi && user.username.trim() === "Axiss" && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Bot size={24} className="text-[#D4AF37] mb-1" />
                        <span className="text-white text-xs font-bold text-center px-2">Configurar IA</span>
                      </div>
                    )}
                  </div>
                  {/* Badge */}
                  <div className="absolute bottom-1 right-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-[#0f111a] shadow-md flex items-center gap-1">
                     <Coins size={10} /> {selectedUserModal.lizCoins || 0}
                  </div>
              </div>

              {/* User Info */}
              <div className="pt-20 text-center">
                <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2 mb-1">
                  {selectedUserModal.username}
                  {selectedUserModal.role === "admin" && (
                    <span className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-sm">
                      Admin
                    </span>
                  )}
                </h3>
                
                <div className="flex justify-center items-center gap-2 mb-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Globe size={12}/> {selectedUserModal.pais_idioma || selectedUserModal.countryLanguage || "Global"}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-pink-400"><Heart size={12} className="fill-pink-400"/> {selectedUserModal.profileLikes || 0} Likes</span>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl relative mb-6">
                  <p className="text-gray-300 italic text-sm">
                    "{selectedUserModal.statusMessage || "Disponible"}"
                  </p>
                </div>

                {/* Actions */}
                {selectedUserModal.username === user.username ? (
                  <button
                    onClick={() => {
                       setSelectedUserModal(null);
                       setIsConfigOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white p-3 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20 mb-6"
                  >
                    <Settings size={18} />
                    Configurar Perfil
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <button
                      onClick={() => {
                        window.history.pushState({}, "", "/chat/" + encodeURIComponent(selectedUserModal.username));
                        setActiveChat(selectedUserModal.username);
                        setSelectedUserModal(null);
                        setIsSidebarOpen(false);
                        notifyOwner(selectedUserModal.username, "CHAT", user.username);
                      }}
                      className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl font-bold transition-colors border border-white/5"
                    >
                      <MessageCircle size={18} /> Chat
                    </button>
                    <button
                      onClick={() => {
                        socket.emit("like_user", selectedUserModal.username);
                        setSelectedUserModal((prev) => prev ? { ...prev, profileLikes: (prev.profileLikes || 0) + 1 } : null);
                        notifyOwner(selectedUserModal.username, "LIKE", user.username);
                      }}
                      className="flex items-center justify-center gap-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20 p-3 rounded-xl font-bold transition-colors"
                    >
                      <Heart size={18} /> Like
                    </button>
                    
                    {!user.friends_list?.includes(selectedUserModal.username) ? (
                        <button
                          onClick={() => {
                            import("firebase/firestore").then(({ addDoc, collection }) => {
                              addDoc(collection(db, "friendRequests"), {
                                from: user.username,
                                to: selectedUserModal.username,
                                status: "pending",
                                timestamp: Date.now(),
                                createdAt: Date.now(),
                              }).then((docRef) => {
                                notifyOwner(selectedUserModal.username, "REQUEST", user.username, { frData: { from: user.username, docId: docRef.id } });
                              });
                            });
                            setSelectedUserModal(null);
                            alert("Solicitud de amistad enviada");
                          }}
                          className="col-span-2 flex items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 p-3 rounded-xl font-bold transition-colors"
                        >
                          <UserPlus size={18} /> Enviar Solicitud de Amistad
                        </button>
                    ) : (
                       <button
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro que quieres eliminar a ${selectedUserModal.username} de tus amigos?`)) {
                              socket.emit("remove_friend", selectedUserModal.username);
                              setUser((prev) => ({ ...prev, friends_list: prev.friends_list?.filter((f) => f !== selectedUserModal.username) }));
                              setSelectedUserModal(null);
                            }
                          }}
                          className="col-span-2 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 p-3 rounded-xl font-bold transition-colors"
                        >
                          <UserMinus size={18} /> Eliminar Amigo
                        </button>
                    )}
                  </div>
                )}

                {/* Friends List Section */}
                <div className="bg-[#1a1d2d] rounded-2xl overflow-hidden mb-6 border border-white/5 text-left">
                   <div className="p-4 bg-white/5 border-b border-white/5 flex items-center gap-2">
                       <Users size={16} className="text-cyan-400" />
                       <h4 className="font-bold text-white text-sm">Amigos</h4>
                   </div>
                   <div className="p-4 max-h-40 overflow-y-auto space-y-3">
                       {selectedUserModal.username === user.username || selectedUserModal.is_friends_public ? (
                           (selectedUserModal.username === user.username ? user.friends_list : selectedUserModal.friends_list)?.length ? (
                               (selectedUserModal.username === user.username ? user.friends_list : selectedUserModal.friends_list)?.map(friend => {
                                   const fInfo = usersOnline.find(u => u.username === friend) || userCache[friend];
                                   const fPic = fInfo?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend}`;
                                   return (
                                       <div key={friend} className="flex items-center justify-between group">
                                           <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                                               if (fInfo) setSelectedUserModal(fInfo);
                                           }}>
                                               <img src={fPic} className="w-8 h-8 rounded-full bg-black/50 object-cover" />
                                               <span className="text-gray-300 text-sm font-medium hover:text-white transition-colors">{friend}</span>
                                           </div>
                                           {selectedUserModal.username === user.username && (
                                               <button onClick={() => {
                                                   if (window.confirm(`¿Estás seguro que quieres eliminar a ${friend} de tus amigos?`)) {
                                                      socket.emit("remove_friend", friend);
                                                      setUser(prev => ({ ...prev, friends_list: prev.friends_list?.filter(f => f !== friend) }));
                                                   }
                                               }} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1">
                                                   <Trash2 size={16} />
                                               </button>
                                           )}
                                       </div>
                                   );
                               })
                           ) : (
                               <p className="text-sm text-gray-500 italic text-center">No hay amigos en la lista.</p>
                           )
                       ) : (
                           <p className="text-sm text-gray-500 italic text-center">La lista de amigos de este usuario es privada.</p>
                       )}
                   </div>
                </div>

                {/* Reviews Section */}
                <div className="bg-[#1a1d2d] rounded-2xl overflow-hidden mb-2 border border-white/5 text-left">
                   <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Star size={16} className="text-amber-400 fill-amber-400" />
                         <h4 className="font-bold text-white text-sm">Comentarios</h4>
                       </div>
                   </div>
                   <div className="p-4 max-h-48 overflow-y-auto space-y-3">
                       {(!selectedUserModal.profileComments || selectedUserModal.profileComments.length === 0) ? (
                           <p className="text-sm text-gray-500 italic text-center">No hay comentarios aún.</p>
                       ) : (
                           selectedUserModal.profileComments.map((c: any, i: number) => (
                               <div key={i} className="bg-black/30 p-3 rounded-xl border border-white/5">
                                   <div className="flex items-center justify-between mb-1">
                                       <span className="font-bold text-cyan-400 text-xs">{c.author}</span>
                                       {c.stars && (
                                           <div className="flex gap-0.5">
                                               {[...Array(5)].map((_, idx) => (
                                                   <Star key={idx} size={10} className={idx < c.stars ? "text-amber-400 fill-amber-400" : "text-gray-600"} />
                                               ))}
                                           </div>
                                       )}
                                   </div>
                                   <p className="text-gray-300 text-sm leading-relaxed">{c.text}</p>
                               </div>
                           ))
                       )}
                   </div>
                   
                   {/* Add comment form */}
                   {selectedUserModal.username !== user.username && (
                       <div className="p-4 bg-black/20 border-t border-white/5">
                           <form onSubmit={(e) => {
                               e.preventDefault();
                               const input = e.currentTarget.elements.namedItem('comment') as HTMLInputElement;
                               const starsSelect = e.currentTarget.elements.namedItem('stars') as HTMLSelectElement;
                               if (input.value.trim()) {
                                   const stars = parseInt(starsSelect.value);
                                   socket.emit("add_profile_comment", { targetUser: selectedUserModal.username, comment: input.value, stars });
                                   setSelectedUserModal(prev => prev ? {
                                       ...prev,
                                       profileComments: [...(prev.profileComments || []), { author: user.username, text: input.value, timestamp: Date.now(), stars }]
                                   } : null);
                                   input.value = '';
                                   starsSelect.value = '5';
                               }
                           }} className="flex flex-col gap-2">
                               <div className="flex gap-2">
                                   <select name="stars" className="bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50">
                                       <option value="5">⭐⭐⭐⭐⭐</option>
                                       <option value="4">⭐⭐⭐⭐</option>
                                       <option value="3">⭐⭐⭐</option>
                                       <option value="2">⭐⭐</option>
                                       <option value="1">⭐</option>
                                   </select>
                                   <input name="comment" type="text" placeholder="Escribe un comentario..." className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
                               </div>
                               <button type="submit" className="w-full bg-white/10 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors">Enviar Comentario</button>
                           </form>
                       </div>
                   )}
                </div>

                {selectedUserModal.username !== user.username && (
                    <button
                      onClick={() => setReportTarget(selectedUserModal.username)}
                      className="text-xs text-gray-500 hover:text-red-400 mt-4 underline decoration-dotted underline-offset-4"
                    >
                      Reportar Usuario
                    </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
"""
    
    new_lines = lines[:start_idx] + [new_modal] + lines[end_idx:]
    with open('src/App.tsx', 'w') as f:
        f.writelines(new_lines)
    print("Patched profile modal!")
else:
    print("Could not find start/end indices")
