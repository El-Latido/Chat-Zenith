const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const privateHeader = `<div className="bg-[#121B2A]/95 backdrop-blur-md border-b border-[#D4AF37]/30 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-lg">
                        <div className="flex items-center gap-3">`;
                        
const replacement = `<div className="bg-[#121B2A]/95 backdrop-blur-md border-b border-[#D4AF37]/30 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-lg">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setActiveChat("global")} 
                            className="text-[#D4AF37] hover:bg-white/10 p-2 rounded-full transition-colors mr-1"
                            title="Volver a Sala Global"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                          </button>`;

code = code.replace(privateHeader, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched back button");
