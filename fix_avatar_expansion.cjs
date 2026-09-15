const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const searchState = `  const [reportTarget, setReportTarget] = useState<string | null>(null);`;
const replaceState = `  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [expandedAvatar, setExpandedAvatar] = useState<string | null>(null);`;
code = code.replace(searchState, replaceState);

const searchImg = `              <div className="w-full h-full rounded-full overflow-hidden relative z-0">
                <img
                  referrerPolicy="no-referrer"
                  src={
                    selectedUserModal.profilePic ||
                    \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${selectedUserModal.username}\`
                  }
                  className="w-full h-full object-cover"
                  alt="Avatar"
                />`;

const replaceImg = `              <div 
                  className="w-full h-full rounded-full overflow-hidden relative z-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setExpandedAvatar(selectedUserModal.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${selectedUserModal.username}\`)}
                  title="Ampliar foto"
              >
                <img
                  referrerPolicy="no-referrer"
                  src={
                    selectedUserModal.profilePic ||
                    \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${selectedUserModal.username}\`
                  }
                  className="w-full h-full object-cover"
                  alt="Avatar"
                />`;
code = code.replace(searchImg, replaceImg);

const modalCode = `      {expandedAvatar && (
        <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setExpandedAvatar(null)}
        >
            <div className="relative max-w-3xl w-full flex items-center justify-center">
                <button 
                    onClick={() => setExpandedAvatar(null)}
                    className="absolute -top-12 right-0 text-white/50 hover:text-white"
                >
                    <X size={32} />
                </button>
                <img 
                    src={expandedAvatar} 
                    alt="Expanded Avatar" 
                    className="max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/10 bg-black/50"
                    onClick={(e) => e.stopPropagation()} 
                />
            </div>
        </div>
      )}

      {reportTarget && (`;

code = code.replace(`      {reportTarget && (`, modalCode);

fs.writeFileSync('src/App.tsx', code);
console.log("Done adding avatar expansion.");
