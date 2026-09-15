const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

// I need to add UI for Bubble Customization
const search = `<button
            onClick={onClose}
            className="w-full bg-[#121B2A] text-gray-400 hover:text-white hover:bg-white/5 py-3 rounded-xl font-bold transition-all"
          >
            Cerrar
          </button>`;

const replacement = `
          {/* Bubble Customization */}
          <div className="bg-black/20 p-4 rounded-xl border border-[#D4AF37]/20 space-y-4">
             <h3 className="text-sm font-bold text-[#D4AF37] mb-2 uppercase tracking-wider">
                 Personalización de Burbuja
             </h3>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                     <label className="text-xs text-gray-400 mb-1 block">Color Base (Hex)</label>
                     <input
                         type="text"
                         placeholder="#1A2035"
                         value={user.bubbleColor || ""}
                         onChange={(e) => setUser({ ...user, bubbleColor: e.target.value })}
                         className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50"
                     />
                 </div>
                 <div>
                     <label className="text-xs text-gray-400 mb-1 block">Borde Neón (Hex)</label>
                     <input
                         type="text"
                         placeholder="#D4AF37"
                         value={user.bubbleBorder || ""}
                         onChange={(e) => setUser({ ...user, bubbleBorder: e.target.value })}
                         className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50"
                     />
                 </div>
             </div>
             <div className="grid grid-cols-2 gap-4 mt-3">
                 <div>
                     <label className="text-xs text-gray-400 mb-1 block">Forma</label>
                     <select
                         value={user.bubbleShape || "rounded"}
                         onChange={(e) => setUser({ ...user, bubbleShape: e.target.value })}
                         className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50"
                     >
                         <option value="rounded">Redondeada</option>
                         <option value="square">Cuadrada</option>
                         <option value="pill">Píldora</option>
                         <option value="leaf">Hoja</option>
                     </select>
                 </div>
                 <div>
                     <label className="text-xs text-gray-400 mb-1 block">Textura</label>
                     <select
                         value={user.bubbleTexture || "solid"}
                         onChange={(e) => setUser({ ...user, bubbleTexture: e.target.value })}
                         className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50"
                     >
                         <option value="solid">Sólida</option>
                         <option value="glass">Cristal (Glassmorphism)</option>
                         <option value="gradient">Degradado Suave</option>
                     </select>
                 </div>
             </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-[#121B2A] text-gray-400 hover:text-white hover:bg-white/5 py-3 rounded-xl font-bold transition-all"
          >
            Cerrar
          </button>`;

if (code.includes('Cerrar')) {
    code = code.replace(search, replacement);
    fs.writeFileSync('src/components/ProfileConfigModal.tsx', code);
    console.log("Patched ProfileConfigModal");
}
