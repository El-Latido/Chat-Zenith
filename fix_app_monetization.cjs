const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state for monetization
const searchState = `  const [isFriendReqOpen, setIsFriendReqOpen] = useState(false);`;
const replaceState = `  const [isFriendReqOpen, setIsFriendReqOpen] = useState(false);
  const [isMonetizationOpen, setIsMonetizationOpen] = useState(false);
  const [monetizationStats, setMonetizationStats] = useState({ adViews: 0, revenuePending: 0, lifetimeRevenue: 0 });`;
code = code.replace(searchState, replaceState);

// 2. Add icon import
code = code.replace("  ShieldAlert,", "  ShieldAlert,\n  DollarSign,");

// 3. Add to closeAllModals
code = code.replace("    setIsBannedListOpen(false);", "    setIsBannedListOpen(false);\n    setIsMonetizationOpen(false);");

// 4. Add button to Admin Menu
const searchAdminMenu = `              <button
                className={\`flex items-center justify-center gap-2 text-orange-400 bg-orange-500/10 border \${isReportsListOpen ? "border-orange-500/50" : "border-orange-500/20"} px-3 py-2 rounded-2xl hover:bg-orange-500/20 transition-all text-sm font-medium\`}
                onClick={() => {
                  closeAllModals();
                  socket.emit("get_reports", (list: any) => setReportsList(list));
                  setIsReportsListOpen(!isReportsListOpen);
                }}
              >
                <AlertTriangle size={16} strokeWidth={1.5} />
                Reportes
              </button>
            </div>
          )}`;
const replaceAdminMenu = `              <button
                className={\`flex items-center justify-center gap-2 text-orange-400 bg-orange-500/10 border \${isReportsListOpen ? "border-orange-500/50" : "border-orange-500/20"} px-3 py-2 rounded-2xl hover:bg-orange-500/20 transition-all text-sm font-medium\`}
                onClick={() => {
                  closeAllModals();
                  socket.emit("get_reports", (list: any) => setReportsList(list));
                  setIsReportsListOpen(!isReportsListOpen);
                }}
              >
                <AlertTriangle size={16} strokeWidth={1.5} />
                Reportes
              </button>
            </div>
            <div className="px-4 mt-2">
              <button
                className={\`w-full flex items-center justify-center gap-2 text-green-400 bg-green-500/10 border \${isMonetizationOpen ? "border-green-500/50" : "border-green-500/20"} px-3 py-2 rounded-2xl hover:bg-green-500/20 transition-all text-sm font-medium\`}
                onClick={() => {
                  closeAllModals();
                  socket.emit("get_monetization_stats", (stats: any) => setMonetizationStats(stats));
                  setIsMonetizationOpen(!isMonetizationOpen);
                }}
              >
                <DollarSign size={16} strokeWidth={1.5} />
                Ingresos SDK
              </button>
            </div>
          )}`;
code = code.replace(searchAdminMenu, replaceAdminMenu);

// 5. Add Monetization Modal
const searchModals = `      {isReportsListOpen && (`;
const replaceModals = `      {/* Monetization Panel */}
      {isMonetizationOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-[#12141c] p-6 rounded-3xl w-full max-w-md shadow-2xl relative border border-green-500/30">
            <button
              onClick={() => setIsMonetizationOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2">
              <DollarSign size={24} /> Panel de Ingresos (Ads)
            </h2>
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Vistas de Anuncios</p>
                        <p className="text-2xl font-black text-white">{monetizationStats.adViews}</p>
                    </div>
                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Ingresos de por Vida</p>
                        <p className="text-2xl font-black text-green-400">$\{(monetizationStats.lifetimeRevenue || 0).toFixed(2)}</p>
                    </div>
                </div>
                
                <div className="bg-green-500/10 p-5 rounded-2xl border border-green-500/30">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-gray-300 font-bold">Saldo Pendiente:</p>
                        <p className="text-3xl font-black text-green-400">$\{(monetizationStats.revenuePending || 0).toFixed(2)}</p>
                    </div>
                    <div className="w-full bg-black/50 rounded-full h-3 mb-4 overflow-hidden border border-white/5">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 rounded-full transition-all duration-1000" style={{ width: \`\${Math.min(100, ((monetizationStats.revenuePending || 0) / 100) * 100)}%\` }}></div>
                    </div>
                    <button
                        onClick={() => {
                            socket.emit("withdraw_revenue", (res: any) => {
                                if (res.success) {
                                    alert("Transferencia bancaria iniciada con éxito. Los fondos llegarán en 2-3 días hábiles.");
                                    setMonetizationStats(res.stats);
                                } else {
                                    alert(res.message || "Error al retirar fondos.");
                                }
                            });
                        }}
                        disabled={monetizationStats.revenuePending < 100}
                        className={\`w-full flex justify-center items-center gap-2 py-3 rounded-xl font-bold transition-all \${monetizationStats.revenuePending >= 100 ? "bg-green-500 hover:bg-green-400 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "bg-gray-800 text-gray-500 cursor-not-allowed"}\`}
                    >
                        <DollarSign size={18} />
                        {monetizationStats.revenuePending >= 100 ? "Retirar a Cuenta Bancaria" : "Se requieren $100 para retirar"}
                    </button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                    Los ingresos son calculados a través del SDK publicitario de videos recompensados.
                </p>
            </div>
          </div>
        </div>
      )}

      {isReportsListOpen && (`;
code = code.replace(searchModals, replaceModals);


// 6. Fix Video Player
const searchVideo = `             <video 
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" 
                autoPlay 
                muted
                className="w-full h-full object-cover opacity-80"
             />`;
const replaceVideo = `             <video 
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" 
                autoPlay 
                muted
                playsInline
                loop
                crossOrigin="anonymous"
                className="w-full h-full object-cover opacity-80"
             />`;
code = code.replace(searchVideo, replaceVideo);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated App.tsx with Monetization panel and fixed Video Player.");
