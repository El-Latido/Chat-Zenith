const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                {activeChat !== "global" &&
                  (() => {
                    const serverAiInfo = usersOnline.find((u) => u.username === activeChat);`;

const replacement = `                {activeChat !== "global" &&
                  (() => {
                    if (activeChat.startsWith("room_")) {
                        return (
                          <div className="bg-[#121B2A]/95 backdrop-blur-md border-b border-[#D4AF37]/30 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-lg">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => {
                                    socket.emit("leave_custom_room", activeChat);
                                    setActiveChat("custom_rooms");
                                }} 
                                className="text-[#D4AF37] hover:bg-white/10 p-2 rounded-full transition-colors mr-1"
                                title="Volver a Salas"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                              </button>
                              <div className="w-10 h-10 rounded-full bg-[#1A2639] border border-[#D4AF37]/50 flex items-center justify-center shadow-sm">
                                <Hash className="text-[#D4AF37]" size={20} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[#E8D9B0] font-bold text-lg leading-tight flex items-center gap-1.5">
                                  Sala Privada
                                  <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30 uppercase tracking-wider">
                                    COMUNIDAD
                                  </span>
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                socket.emit("leave_custom_room", activeChat);
                                setActiveChat("global");
                              }}
                              className="text-sm font-bold text-[#D4AF37] hover:text-[#E8D9B0] bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors border border-[#D4AF37]/20 flex items-center gap-2"
                            >
                              <Globe size={16} /> Volver al Mundo
                            </button>
                          </div>
                        );
                    }

                    const serverAiInfo = usersOnline.find((u) => u.username === activeChat);`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched room header");
