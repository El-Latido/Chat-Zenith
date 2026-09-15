const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = `{/* User Search */}`;
const newBtn = `             {/* AI Characters Button */}
             <div className="px-4 py-2">
                 <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-3 py-2.5 rounded-xl font-bold shadow-lg transition-transform active:scale-95" onClick={() => { closeAllModals(); setIsAiSelectorOpen(true); }}>
                    <Bot size={18} />
                    Personajes IA
                 </button>
             </div>
             `;

if(!code.includes('Personajes IA')) {
    code = code.replace(anchor, newBtn + anchor);
}

// Add isAiSelectorOpen state
if(!code.includes('isAiSelectorOpen')) {
    code = code.replace(/const \[isConfigOpen, setIsConfigOpen\] = useState\(false\);/, 'const [isConfigOpen, setIsConfigOpen] = useState(false);\n  const [isAiSelectorOpen, setIsAiSelectorOpen] = useState(false);');
    
    // add to closeAllModals
    code = code.replace(/setIsConfigOpen\(false\);/, 'setIsConfigOpen(false);\n    setIsAiSelectorOpen(false);');
}

// Add modal render
const modalRender = `
      {isAiSelectorOpen && (
        <AiSelectorModal
          onClose={() => setIsAiSelectorOpen(false)}
          userCoins={user.lizCoins || 0}
          socket={socket}
          onSelect={(id) => {
            setIsAiSelectorOpen(false);
            setIsSidebarOpen(false);
            setActiveChat(id);
          }}
        />
      )}
`;

if(!code.includes('AiSelectorModal onClose')) {
    code = code.replace(/\{selectedUserModal && \(/, modalRender + '\n      {selectedUserModal && (');
}

// add import
if(!code.includes('import { AiSelectorModal }')) {
    code = code.replace("import { Bot, UserPlus, Users, LogOut", "import { AiSelectorModal } from './components/AiSelectorModal';\nimport { Bot, UserPlus, Users, LogOut");
}

fs.writeFileSync('src/App.tsx', code);
console.log("Patched sidebar btn");
