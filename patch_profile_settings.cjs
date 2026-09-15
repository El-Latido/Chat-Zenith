const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

const target = `                <div className="space-y-4 pt-4 border-t border-white/5">
                   <h4 className="text-sm font-bold text-white flex items-center gap-2">Cambiar Contraseña</h4>`;

const replacement = `                <div className="space-y-4 pt-4 border-t border-white/5">
                   <h4 className="text-sm font-bold text-white flex items-center gap-2">Personalización de Interfaz</h4>
                   
                   <div>
                       <label className="text-xs text-white/70 font-semibold uppercase tracking-wider">Color de Neón Principal</label>
                       <div className="flex gap-2 mt-2">
                           <input type="color" className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0" 
                               defaultValue={localStorage.getItem("chatliz_neon_color") || "#00f3ff"} 
                               onChange={(e) => {
                                   localStorage.setItem("chatliz_neon_color", e.target.value);
                                   window.dispatchEvent(new Event("chatliz_ui_update"));
                               }} 
                           />
                           <label className="flex items-center justify-between bg-black/30 p-2 rounded-lg border border-white/10 flex-1 cursor-pointer">
                              <span className="text-sm text-white/80 font-bold">Neón Arcoiris (Animado)</span>
                              <input type="checkbox" defaultChecked={localStorage.getItem("chatliz_rainbow_neon") === "true"} 
                                  onChange={(e) => {
                                      localStorage.setItem("chatliz_rainbow_neon", e.target.checked.toString());
                                      window.dispatchEvent(new Event("chatliz_ui_update"));
                                  }} 
                              />
                           </label>
                       </div>
                   </div>

                   <div>
                       <label className="text-xs text-white/70 font-semibold uppercase tracking-wider">Fondo del Chat (URL)</label>
                       <input 
                           type="text" 
                           placeholder="https://ejemplo.com/fondo.jpg" 
                           defaultValue={localStorage.getItem("chatliz_chat_bg") || ""}
                           onChange={(e) => {
                               localStorage.setItem("chatliz_chat_bg", e.target.value);
                               window.dispatchEvent(new Event("chatliz_ui_update"));
                           }}
                           className="w-full bg-black/30 p-3 mt-1 rounded-xl border border-white/10 focus:border-cyan-400 outline-none text-white transition-colors text-sm"
                       />
                       <p className="text-xs text-white/40 mt-1">Este fondo sólo será visible en tu dispositivo.</p>
                   </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                   <h4 className="text-sm font-bold text-white flex items-center gap-2">Cambiar Contraseña</h4>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/ProfileConfigModal.tsx', code);
console.log("Patched profile settings");
