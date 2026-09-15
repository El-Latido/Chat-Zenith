import re

with open('src/components/ProfileConfigModal.tsx', 'r') as f:
    code = f.read()

# Add Bubble Config UI before the save button
bubble_ui = """
          <div className="space-y-4 pt-4 border-t border-[rgba(255,255,255,0.1)]">
             <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div> Personalizar Mi Burbuja de Chat</h4>
             
             <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400">Color de Fondo</label>
                <div className="flex gap-2">
                    <input type="color" value={(() => {
                        const match = (user.bubbleColor || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                        if (match) {
                            const r = parseInt(match[1]).toString(16).padStart(2, '0');
                            const g = parseInt(match[2]).toString(16).padStart(2, '0');
                            const b = parseInt(match[3]).toString(16).padStart(2, '0');
                            return `#${r}${g}${b}`;
                        }
                        return "#121B2A";
                    })()} onChange={(e) => {
                        const hex = e.target.value;
                        const r = parseInt(hex.slice(1,3), 16);
                        const g = parseInt(hex.slice(3,5), 16);
                        const b = parseInt(hex.slice(5,7), 16);
                        setUser({...user, bubbleColor: `rgba(${r}, ${g}, ${b}, 0.95)`});
                    }} className="h-10 w-16 bg-transparent border-0 rounded cursor-pointer" />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400">Borde</label>
                <select value={user.bubbleBorder || "border-[#5A52A5]/30"} onChange={e => setUser({...user, bubbleBorder: e.target.value})} className="w-full bg-[#0f111a] p-3 rounded-xl border border-[rgba(255,255,255,0.1)] outline-none text-sm text-[#ffffff]">
                    <option value="border-transparent">Sin Borde</option>
                    <option value="border-[#5A52A5]/30">Morado Suave</option>
                    <option value="border-[#D4AF37]">Dorado Imperial</option>
                    <option value="border-cyan-500">Cyan Neón</option>
                    <option value="border-pink-500">Rosa Neón</option>
                    <option value="border-green-500">Verde Esmeralda</option>
                </select>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400">Forma</label>
                <select value={user.bubbleShape || "rounded-2xl rounded-tr-sm"} onChange={e => setUser({...user, bubbleShape: e.target.value})} className="w-full bg-[#0f111a] p-3 rounded-xl border border-[rgba(255,255,255,0.1)] outline-none text-sm text-[#ffffff]">
                    <option value="rounded-2xl rounded-tr-sm">Clásico Chat</option>
                    <option value="rounded-2xl">Suave (2xl)</option>
                    <option value="rounded-md">Cuadrado (md)</option>
                    <option value="rounded-full">Píldora (full)</option>
                    <option value="rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm">Hoja</option>
                </select>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400">Textura / Efecto</label>
                <select value={user.bubbleTexture || "none"} onChange={e => setUser({...user, bubbleTexture: e.target.value})} className="w-full bg-[#0f111a] p-3 rounded-xl border border-[rgba(255,255,255,0.1)] outline-none text-sm text-[#ffffff]">
                    <option value="none">Liso</option>
                    <option value="glass">Cristal (Glassmorphism)</option>
                    <option value="glow">Resplandor Exterior (Glow)</option>
                </select>
             </div>
          </div>
"""

# Insert before user.username === 'Axiss' check
marker = "{user.username === 'Axiss' && ("
code = code.replace(marker, bubble_ui + '\n          ' + marker)

# Also update the save payload in ProfileConfigModal.tsx
old_emit = 'socket.emit("update_profile", { profilePic: fotoURL, statusMessage: comentario, password, countryLanguage: pais, is_friends_public: isFriendsPublic, preferred_background: backgroundBase64 });'
new_emit = 'socket.emit("update_profile", { profilePic: fotoURL, statusMessage: comentario, password, countryLanguage: pais, is_friends_public: isFriendsPublic, preferred_background: backgroundBase64, bubbleColor: user.bubbleColor, bubbleBorder: user.bubbleBorder, bubbleShape: user.bubbleShape, bubbleTexture: user.bubbleTexture });'
code = code.replace(old_emit, new_emit)

with open('src/components/ProfileConfigModal.tsx', 'w') as f:
    f.write(code)

print("Patched ProfileConfigModal.tsx")
