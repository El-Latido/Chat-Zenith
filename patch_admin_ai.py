import re

with open('src/components/AdminConfigAiModal.tsx', 'r') as f:
    code = f.read()

# Add Bubble Config UI before the save button
bubble_ui = """
           <div className="space-y-4 pt-4 border-t border-white/5">
             <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-400"></div> Personalizar Burbuja de Chat</h4>
             
             <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400">Color de Fondo</label>
                <div className="flex gap-2">
                    <input type="color" value={(() => {
                        const match = aiProfileForm.bubbleColor?.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                        if (match) {
                            const r = parseInt(match[1]).toString(16).padStart(2, '0');
                            const g = parseInt(match[2]).toString(16).padStart(2, '0');
                            const b = parseInt(match[3]).toString(16).padStart(2, '0');
                            return `#${r}${g}${b}`;
                        }
                        return "#0f111a";
                    })()} onChange={(e) => {
                        const hex = e.target.value;
                        const r = parseInt(hex.slice(1,3), 16);
                        const g = parseInt(hex.slice(3,5), 16);
                        const b = parseInt(hex.slice(5,7), 16);
                        setAiProfileForm({...aiProfileForm, bubbleColor: `rgba(${r}, ${g}, ${b}, 0.9)`});
                    }} className="h-10 w-16 bg-transparent border-0 rounded cursor-pointer" />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400">Borde</label>
                <select value={aiProfileForm.bubbleBorder || "border-[#D4AF37]"} onChange={e => setAiProfileForm({...aiProfileForm, bubbleBorder: e.target.value})} className="w-full bg-[#0a0a16] p-3 rounded-xl border border-white/10 outline-none text-sm text-white">
                    <option value="border-transparent">Sin Borde</option>
                    <option value="border-[#D4AF37]">Dorado Imperial</option>
                    <option value="border-cyan-500">Cyan Neón</option>
                    <option value="border-fuchsia-500">Fucsia Mágico</option>
                    <option value="border-red-500">Rojo Alerta</option>
                    <option value="border-white/20">Blanco Translúcido</option>
                </select>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400">Forma</label>
                <select value={aiProfileForm.bubbleShape || "rounded-2xl"} onChange={e => setAiProfileForm({...aiProfileForm, bubbleShape: e.target.value})} className="w-full bg-[#0a0a16] p-3 rounded-xl border border-white/10 outline-none text-sm text-white">
                    <option value="rounded-2xl">Suave (2xl)</option>
                    <option value="rounded-md">Cuadrado (md)</option>
                    <option value="rounded-full">Píldora (full)</option>
                    <option value="rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm">Hoja</option>
                </select>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400">Textura / Efecto</label>
                <select value={aiProfileForm.bubbleTexture || "none"} onChange={e => setAiProfileForm({...aiProfileForm, bubbleTexture: e.target.value})} className="w-full bg-[#0a0a16] p-3 rounded-xl border border-white/10 outline-none text-sm text-white">
                    <option value="none">Liso</option>
                    <option value="glass">Cristal (Glassmorphism)</option>
                    <option value="glow">Resplandor Exterior (Glow)</option>
                </select>
             </div>
           </div>
           
           <button
              onClick={() => {
"""

code = code.replace('<button\n              onClick={() => {\n                     let callbackCalled = false;', bubble_ui + '                     let callbackCalled = false;')

# Update the socket.emit payload inside AdminConfigAiModal.tsx to include the new fields
old_emit = 'socket.emit("update_ai_config", { aiUsername, profilePic: aiProfileForm.profilePic, statusMessage: aiProfileForm.statusMessage, systemInstruction: aiProfileForm.systemInstruction }, (res: any) => {'
new_emit = 'socket.emit("update_ai_config", { aiUsername, profilePic: aiProfileForm.profilePic, statusMessage: aiProfileForm.statusMessage, systemInstruction: aiProfileForm.systemInstruction, bubbleColor: aiProfileForm.bubbleColor, bubbleBorder: aiProfileForm.bubbleBorder, bubbleShape: aiProfileForm.bubbleShape, bubbleTexture: aiProfileForm.bubbleTexture }, (res: any) => {'
code = code.replace(old_emit, new_emit)

with open('src/components/AdminConfigAiModal.tsx', 'w') as f:
    f.write(code)

print("Patched AdminConfigAiModal.tsx")
