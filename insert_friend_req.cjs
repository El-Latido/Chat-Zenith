const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const modalCode = `
      {/* Friend Requests Modal */}
      {isFriendReqOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-[#12141c] p-6 rounded-3xl w-full max-w-sm shadow-2xl relative border border-cyan-500/30">
            <button
              onClick={() => setIsFriendReqOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-center gap-2">
              <UserPlus className="text-cyan-400" /> Solicitudes
            </h2>
            <div className="max-h-64 overflow-y-auto space-y-3">
               {(!user.friend_requests || user.friend_requests.length === 0) ? (
                   <p className="text-center text-gray-500 py-4">No tienes solicitudes pendientes.</p>
               ) : (
                   user.friend_requests.map((reqUsername) => {
                       const reqInfo = usersOnline.find(u => u.username === reqUsername) || userCache[reqUsername];
                       const pic = reqInfo?.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${reqUsername}\`;
                       return (
                           <div key={reqUsername} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                               <div className="flex items-center gap-3">
                                  <img src={pic} className="w-10 h-10 rounded-full border border-cyan-500/30" />
                                  <span className="text-white font-medium">{reqUsername}</span>
                               </div>
                               <div className="flex gap-2">
                                  <button onClick={() => socket.emit("accept_friend_request", reqUsername)} className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center hover:bg-green-500/40 font-bold">✓</button>
                                  <button onClick={() => socket.emit("reject_friend_request", reqUsername)} className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/40 font-bold">✕</button>
                               </div>
                           </div>
                       );
                   })
               )}
            </div>
          </div>
        </div>
      )}
`;

code = code.replace("      {selectedUserModal && (", modalCode + "\n      {selectedUserModal && (");

fs.writeFileSync('src/App.tsx', code);
console.log("Added Friend Requests Modal.");
