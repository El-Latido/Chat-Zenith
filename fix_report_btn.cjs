const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `                    {selectedUserModal.role !== "admin" && (
                      <button
                        onClick={() => {
                          socket.emit(
                            "iniciar_llamada",
                            selectedUserModal.username,
                          );
                          setOutgoingCall({
                            username: selectedUserModal.username,
                            profilePic: selectedUserModal.profilePic || "",
                          });
                          setSelectedUserModal(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-colors border text-cyan-400 bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20"
                      >
                        <PhoneCall size={18} />
                        Llamar
                      </button>
                    )}
                  </div>
                )}`;

const replace = `                    {selectedUserModal.role !== "admin" && (
                      <button
                        onClick={() => {
                          socket.emit(
                            "iniciar_llamada",
                            selectedUserModal.username,
                          );
                          setOutgoingCall({
                            username: selectedUserModal.username,
                            profilePic: selectedUserModal.profilePic || "",
                          });
                          setSelectedUserModal(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-colors border text-cyan-400 bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20"
                      >
                        <PhoneCall size={18} />
                        Llamar
                      </button>
                    )}
                  </div>
                )}
                
                {selectedUserModal.username !== user.username && (
                    <button
                      onClick={() => setReportTarget(selectedUserModal.username)}
                      className="w-full mt-3 flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-colors border text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                    >
                      <ShieldAlert size={18} />
                      Reportar Infracción
                    </button>
                )}
              </div>
            )}
`;

code = code.replace(search, replace);
fs.writeFileSync('src/App.tsx', code);
console.log("Done fixing report button.");
