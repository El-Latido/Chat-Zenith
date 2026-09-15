const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const searchState = `  const [isBannedListOpen, setIsBannedListOpen] = useState(false);`;
const replaceState = `  const [isBannedListOpen, setIsBannedListOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<string | null>(null);`;
code = code.replace(searchState, replaceState);

const searchReportBtn = `                    {selectedUserModal.role !== "admin" && (
                      <button
                        onClick={() => {
                          socket.emit(
                            "iniciar_llamada",`;
const replaceReportBtn = `                    {selectedUserModal.role !== "admin" && (
                      <button
                        onClick={() => {
                          socket.emit(
                            "iniciar_llamada",`;
// Wait, actually I will add the report button right after the friend/call buttons.

const searchButtonsEnd = `                        className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-colors border text-cyan-400 bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20"
                      >
                        <Phone size={18} />
                        Llamar
                      </button>
                    )}
                  </div>
                )}`;
const replaceButtonsEnd = `                        className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-colors border text-cyan-400 bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20"
                      >
                        <Phone size={18} />
                        Llamar
                      </button>
                    )}
                  </div>
                )}
                
                {selectedUserModal.username !== user.username && (
                    <button
                      onClick={() => setReportTarget(selectedUserModal.username)}
                      className="w-full mt-2 flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-colors border text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
                    >
                      <ShieldAlert size={18} />
                      Reportar Usuario
                    </button>
                )}`;
code = code.replace(searchButtonsEnd, replaceButtonsEnd);

const modalCode = `      {reportTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-red-500/30 w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
            <button
              onClick={() => setReportTarget(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <ShieldAlert size={24} /> Reportar a {reportTarget}
            </h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                const reason = (e.currentTarget.elements.namedItem('reason') as HTMLTextAreaElement).value;
                const proof = (e.currentTarget.elements.namedItem('proof') as HTMLInputElement).files?.[0];
                if (!reason || !proof) {
                    showToast("Por favor adjunta una captura y el motivo.", "error");
                    return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                    socket.emit("report_user", { target: reportTarget, reason, proofBase64: reader.result });
                    showToast("Reporte enviado al administrador. Evaluaremos el caso.", "success");
                    setReportTarget(null);
                    setSelectedUserModal(null);
                };
                reader.readAsDataURL(proof);
            }} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Motivo del reporte / Acusación</label>
                    <textarea name="reason" rows={3} required placeholder="Explica detalladamente qué sucedió..." className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-red-500/50 outline-none" />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Captura de pantalla (Obligatorio)</label>
                    <input type="file" name="proof" accept="image/*" required className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500/10 file:text-red-400 hover:file:bg-red-500/20" />
                </div>
                <button type="submit" className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/20">
                    Enviar Reporte
                </button>
            </form>
          </div>
        </div>
      )}

      {isBannedListOpen && (`;
code = code.replace(`      {isBannedListOpen && (`, modalCode);

fs.writeFileSync('src/App.tsx', code);
