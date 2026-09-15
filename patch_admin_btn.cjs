const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const adminBtn = `
                     <button onClick={() => { closeAllModals(); setActiveChat('cloud_admin'); }} className="hidden sm:flex items-center gap-1.5 bg-[#121B2A]/60 border border-[#D4AF37]/30 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors group">
                         <Cloud size={18} className="text-[#D4AF37] group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                         <span className="font-bold text-[#E8D9B0] text-sm">Panel Cloud</span>
                     </button>
                     <button onClick={() => { closeAllModals(); setActiveChat('cloud_admin'); }} className="sm:hidden text-[#D4AF37] hover:text-[#E8D9B0] p-1.5 rounded-full hover:bg-white/5 transition-colors">
                         <Cloud size={20} strokeWidth={1.5} />
                     </button>
`;

code = code.replace(
  "                     <button onClick={() => { closeAllModals(); setActiveChat('builder'); }} className=\"hidden sm:flex",
  adminBtn + "\n                     <button onClick={() => { closeAllModals(); setActiveChat('builder'); }} className=\"hidden sm:flex"
);

// also in the sidebar
const sidebarAdminBtn = `
                         <button className={\`flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border \${activeChat === 'cloud_admin' ? 'border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'border-[#D4AF37]/30'} px-3 py-2 rounded-2xl hover:bg-white/5 hover:text-[#E8D9B0] transition-all text-sm font-medium shadow-sm\`} onClick={() => { closeAllModals(); setIsSidebarOpen(false); setActiveChat('cloud_admin'); }}>
                            <Cloud size={16} strokeWidth={1.5} />
                            Panel Cloud
                         </button>
`;

code = code.replace(
  "                         <button className={\`flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border \${activeChat === 'builder'",
  sidebarAdminBtn + "\n                         <button className={\`flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border \${activeChat === 'builder'"
);


fs.writeFileSync('src/App.tsx', code);
