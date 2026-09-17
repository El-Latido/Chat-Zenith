import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add Palette to lucide-react import
content = content.replace("Globe, Box,", "Globe, Box, Palette,")

# Add chatConfig state
if 'const [chatConfig, setChatConfig]' not in content:
    content = content.replace('const [chatBgImage, setChatBgImage] = useState<string>(() => localStorage.getItem("chatliz_chat_bg") || "");', 'const [chatBgImage, setChatBgImage] = useState<string>(() => localStorage.getItem("chatliz_chat_bg") || "");\n  const [chatConfig, setChatConfig] = useState<any>(null);\n  const [showChatConfig, setShowChatConfig] = useState(false);')

# Update the chatBg logic
content = content.replace("let chatBg = user?.preferred_background || chatBgImage;", "let chatBg = (activeChat !== 'global' && !activeChat.startsWith('room_') && chatConfig?.backgroundBase64) ? chatConfig.backgroundBase64 : (user?.preferred_background || chatBgImage);")
content = content.replace("let chatBg = (activeTheme === 'default' ? chatBgImage : chatBgImage);", "")

# Add Palette button to header
palette_button = """                        <button
                          onClick={() => setShowChatConfig(true)}
                          className="text-sm font-bold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors border border-white/20 flex items-center justify-center mr-2"
                          title="Personalizar este chat"
                        >
                          <Palette size={20} />
                        </button>
                        <button
                          onClick={() => setActiveChat("global")}
"""
content = content.replace("""                        <button
                          onClick={() => setActiveChat("global")}""", palette_button)


# We need to add a ChatConfigModal component inside App.tsx (near the end, inside a portal or just before the closing </div> of the main return)
# Let's put it right before <ProfileConfigModal
chat_config_modal = """
      {showChatConfig && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121B2A] border border-[#5A52A5]/30 rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl relative max-h-[90vh]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Palette className="text-cyan-400" />
                Personalizar este chat
              </h2>
              <button onClick={() => setShowChatConfig(false)} className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4">
              <p className="text-sm text-gray-400">Los cambios que hagas aquí se aplicarán para ambos en este chat privado.</p>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Subir Fondo de Pantalla</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const base64 = e.target?.result as string;
                        // Save to Firebase
                        const participants = [user.username, activeChat].sort();
                        const convoId = participants.join("_");
                        const { doc, setDoc } = require("firebase/firestore");
                        setDoc(doc(db, "chats", convoId, "config", "settings"), {
                          backgroundBase64: base64
                        }, { merge: true }).then(() => {
                            setShowChatConfig(false);
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30 cursor-pointer"
                />
              </div>
              <div>
                <button 
                  onClick={() => {
                      const participants = [user.username, activeChat].sort();
                      const convoId = participants.join("_");
                      const { doc, deleteDoc } = require("firebase/firestore");
                      deleteDoc(doc(db, "chats", convoId, "config", "settings")).then(() => {
                          setShowChatConfig(false);
                      });
                  }}
                  className="w-full mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 py-2.5 rounded-xl font-bold transition-colors"
                >
                  Restablecer por defecto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ProfileConfigModal"""

content = content.replace('<ProfileConfigModal', chat_config_modal)

with open('src/App.tsx', 'w') as f:
    f.write(content)
