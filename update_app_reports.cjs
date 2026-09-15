const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const searchState = `  const [isBannedListOpen, setIsBannedListOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<string | null>(null);`;
const replaceState = `  const [isBannedListOpen, setIsBannedListOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [isReportsListOpen, setIsReportsListOpen] = useState(false);
  const [reportsList, setReportsList] = useState<any[]>([]);`;
code = code.replace(searchState, replaceState);

const searchBaneadosBtn = `            {user.role === "admin" && (
                <button
                  className={\`flex items-center gap-2 p-2 rounded-xl transition-all \${isBannedListOpen ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-gray-400 hover:bg-white/5 hover:text-white"}\`}
                  onClick={() => {
                    closeAllModals();
                    socket.emit("get_banned_users", (list) => setBannedList(list));
                    setIsBannedListOpen(true);
                  }}
                >
                  <ShieldAlert size={16} strokeWidth={1.5} />
                  Baneados
                </button>
            )}`;
const replaceBaneadosBtn = `            {user.role === "admin" && (
                <>
                  <button
                    className={\`flex items-center gap-2 p-2 rounded-xl transition-all \${isBannedListOpen ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-gray-400 hover:bg-white/5 hover:text-white"}\`}
                    onClick={() => {
                      closeAllModals();
                      socket.emit("get_banned_users", (list: any) => setBannedList(list));
                      setIsBannedListOpen(true);
                    }}
                  >
                    <ShieldAlert size={16} strokeWidth={1.5} />
                    Baneados
                  </button>
                  <button
                    className={\`flex items-center gap-2 p-2 rounded-xl transition-all \${isReportsListOpen ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "text-gray-400 hover:bg-white/5 hover:text-white"}\`}
                    onClick={() => {
                      closeAllModals();
                      socket.emit("get_reports", (list: any) => setReportsList(list));
                      setIsReportsListOpen(true);
                    }}
                  >
                    <AlertTriangle size={16} strokeWidth={1.5} />
                    Reportes
                  </button>
                </>
            )}`;
code = code.replace(searchBaneadosBtn, replaceBaneadosBtn);

const searchIcons = `Users, ShieldAlert,`;
const replaceIcons = `Users, ShieldAlert, AlertTriangle,`;
code = code.replace(searchIcons, replaceIcons);


const modalCode = `      {isReportsListOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-orange-500/30 w-full max-w-2xl rounded-2xl p-6 relative shadow-2xl">
            <button
              onClick={() => setIsReportsListOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-orange-400 mb-6 flex items-center gap-2">
              <AlertTriangle size={24} /> Panel de Reportes
            </h2>
            {reportsList.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No hay reportes pendientes.</p>
            ) : (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  {reportsList.map(report => (
                     <div key={report.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <span className="text-gray-400">Reportado por: </span>
                                <span className="font-bold text-cyan-400">{report.reporter}</span>
                                <span className="text-gray-400 mx-2">➡️</span>
                                <span className="text-gray-400">Acusado: </span>
                                <span className="font-bold text-red-400">{report.target}</span>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg text-gray-200 text-sm">
                            <span className="text-gray-400 font-bold block mb-1">Motivo:</span>
                            {report.reason}
                        </div>
                        {report.proofBase64 && (
                            <div>
                                <span className="text-gray-400 font-bold block mb-2 text-sm">Evidencia:</span>
                                <img src={report.proofBase64} alt="Evidencia" className="max-h-64 rounded-lg border border-white/10 object-contain bg-black/50" />
                            </div>
                        )}
                        <div className="flex gap-2 justify-end mt-2">
                            <button
                                onClick={() => {
                                    socket.emit("admin_ban_user", report.target, (res: any) => {
                                        if (res.success) {
                                            showToast(\`\${report.target} ha sido baneado.\`, "success");
                                        }
                                    });
                                }}
                                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-bold transition-colors"
                            >
                                Banear Acusado
                            </button>
                            <button
                                onClick={() => {
                                    socket.emit("delete_report", report.id, (res: any) => {
                                        if (res.success) {
                                            setReportsList(prev => prev.filter(r => r.id !== report.id));
                                            showToast("Reporte descartado y eliminado.", "success");
                                        }
                                    });
                                }}
                                className="px-4 py-2 bg-gray-500/20 text-gray-300 hover:bg-gray-500/40 rounded-lg text-sm font-bold transition-colors"
                            >
                                Descartar / Resolver
                            </button>
                        </div>
                     </div>
                  ))}
                </div>
            )}
          </div>
        </div>
      )}

      {reportTarget && (`;

code = code.replace(`      {reportTarget && (`, modalCode);

fs.writeFileSync('src/App.tsx', code);
