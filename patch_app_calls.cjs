const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The Banear block:
const oldBanear = `                                     socket.emit('toggle_ban', selectedUserModal.username, async (res: any) => {
                                         if(res.success) {
                                             setUser(prev => ({
                                                 ...prev,
                                                 blocked_list: res.isBanned ? [...(prev.blocked_list || []), selectedUserModal.username] : (prev.blocked_list || []).filter(b => b !== selectedUserModal.username)
                                             }));
                                             if (res.isBanned) {
                                                 await notifyOwner(selectedUserModal.username, 'BAN', user.username);
                                             }
                                             setSelectedUserModal(null);
                                         }
                                     });
                                 }}
                                 className={\`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-colors border \${user.blocked_list?.includes(selectedUserModal.username) ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20'}\`}
                             >
                                 <AlertCircle size={18} />
                                 {user.blocked_list?.includes(selectedUserModal.username) ? 'Desbanear' : 'Banear'}
                             </button>`;

const newLlamar = `                                     socket.emit('iniciar_llamada', selectedUserModal.username);
                                     setSelectedUserModal(null);
                                 }}
                                 className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-colors border text-cyan-400 bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20"
                             >
                                 <PhoneCall size={18} />
                                 Llamar
                             </button>`;

code = code.replace(oldBanear, newLlamar);

// Add the modals at the end of the root div
const modals = `      {incomingCall && (
        <CallModal 
            caller={incomingCall}
            onAccept={() => {
                socket.emit('responder_llamada', { targetUser: incomingCall, accepted: true });
                setActiveCall(incomingCall);
                setIncomingCall(null);
            }}
            onReject={() => {
                socket.emit('responder_llamada', { targetUser: incomingCall, accepted: false });
                setIncomingCall(null);
            }}
        />
      )}

      {activeCall && (
        <ActiveCallModal 
            partner={activeCall}
            onEndCall={() => {
                setActiveCall(null);
            }}
        />
      )}`;

code = code.replace(/\{isAiSelectorOpen && \(/, modals + '\n      {isAiSelectorOpen && (');

fs.writeFileSync('src/App.tsx', code);
console.log("Patched Banear and Modals");
