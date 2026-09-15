const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetRoom = `                                <span className="text-white font-bold text-lg leading-tight flex items-center gap-1.5">
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
                              className="text-sm font-bold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors border border-[#D4AF37]/20 flex items-center gap-2"
                            >
                              <Globe size={16} /> Volver al Mundo
                            </button>
                          </div>
                        );`;

const repRoom = `                                <span className="text-white font-bold text-lg leading-tight flex items-center gap-1.5">
                                  Sala Personalizada
                                  <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30 uppercase tracking-wider">
                                    COMUNIDAD
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );`;

code = code.replace(targetRoom, repRoom);

const targetVolver = `                        <button
                          onClick={() => setActiveChat("global")}
                          className="text-sm font-bold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors border border-[#D4AF37]/20 flex items-center gap-2"
                        >
                          <Globe size={16} /> Volver al Mundo
                        </button>`;

const repVolver = `                        <button
                          onClick={() => setActiveChat("global")}
                          className="text-sm font-bold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors border border-white/20 flex items-center justify-center"
                          title="Chat Global"
                        >
                          <Globe size={20} />
                        </button>`;

code = code.replace(targetVolver, repVolver);

fs.writeFileSync('src/App.tsx', code);
