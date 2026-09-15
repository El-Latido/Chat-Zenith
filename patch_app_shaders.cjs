const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import
code = code.replace('import { AdminConfigAiModal } from "./components/AdminConfigAiModal";', 
`import { AdminConfigAiModal } from "./components/AdminConfigAiModal";
import { AdminShadersModal } from "./components/AdminShadersModal";`);

// 2. Add state
code = code.replace('const [adminConfigAiOpen, setAdminConfigAiOpen] = useState(false);', 
`const [adminConfigAiOpen, setAdminConfigAiOpen] = useState(false);
  const [adminShadersOpen, setAdminShadersOpen] = useState(false);
  const [globalShaders, setGlobalShaders] = useState<string[]>([]);
  const [previewShaders, setPreviewShaders] = useState<string[] | null>(null);`);

// 3. Add socket listener inside useEffect
const socketUseEffectRegex = /socket\.on\("banned_status", \(data\) => \{/;
code = code.replace(socketUseEffectRegex, `socket.on("shaders_updated", (shaders) => {
      setGlobalShaders(shaders || []);
    });
    
    socket.on("banned_status", (data) => {`);

// 4. Apply classes to main container
const mainContainerRegex = /<div className="flex h-screen bg-black overflow-hidden relative">/;
code = code.replace(mainContainerRegex, `<div className={\`flex h-screen bg-black overflow-hidden relative \${(previewShaders || globalShaders).join(" ")}\`}>`);

// Add CSS filter style to the wrapper if needed
const appWrapperRegex = /<div\s+className="relative z-10 flex h-full w-full max-w-6xl mx-auto overflow-hidden"/;
code = code.replace(appWrapperRegex, `<div
        style={{
          filter: (previewShaders || globalShaders).includes("grayscale") ? "grayscale(100%)" :
                  (previewShaders || globalShaders).includes("sepia") ? "sepia(100%)" :
                  (previewShaders || globalShaders).includes("invert") ? "invert(100%)" : "none"
        }}
        className="relative z-10 flex h-full w-full max-w-6xl mx-auto overflow-hidden"`);

// 5. Add button in Settings modal (for Admin)
const adminBtnRegex = /<div className="pt-4 border-t border-white\/10 flex flex-col gap-2">\s*<button\s*onClick=\{[^}]+\}\s*className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600/;
code = code.replace(adminBtnRegex, `<div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                <button
                  onClick={() => {
                     setIsConfigOpen(false);
                     setAdminShadersOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02]"
                >
                  <Layers size={18} /> Configurar Shaders Globales
                </button>
                <button
                  onClick={() => {`);

// 6. Add modal component
const modalsContainerRegex = /\{adminConfigAiOpen && \(/;
code = code.replace(modalsContainerRegex, `{adminShadersOpen && (
        <AdminShadersModal
          setOpen={setAdminShadersOpen}
          currentShaders={globalShaders}
          onPreview={(shaders) => setPreviewShaders(shaders)}
          onSave={(shaders) => {
             setPreviewShaders(null);
             socket.emit("update_shaders", shaders);
          }}
        />
      )}
      
      {adminConfigAiOpen && (`);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with Shaders");
