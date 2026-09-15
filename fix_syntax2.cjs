const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `                {selectedUserModal.username !== user.username && (
                    <button
                      onClick={() => setReportTarget(selectedUserModal.username)}
                      className="w-full mt-3 flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-colors border text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                    >
                      <ShieldAlert size={18} />
                      Reportar Infracción
                    </button>
              </div>`;

const replace = `                {selectedUserModal.username !== user.username && (
                    <button
                      onClick={() => setReportTarget(selectedUserModal.username)}
                      className="w-full mt-3 flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-colors border text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                    >
                      <ShieldAlert size={18} />
                      Reportar Infracción
                    </button>
                )}
              </div>`;

code = code.replace(search, replace);
fs.writeFileSync('src/App.tsx', code);
