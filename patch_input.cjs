const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `bg-[#0B0B0C]/80 backdrop-blur-2xl border-t border-white/5 pb-[env(safe-area-inset-bottom)] p-2 md:p-3 relative z-30 flex-shrink-0`;
const rep1 = `bg-[#0B0B0C]/60 backdrop-blur-3xl border-t border-white/5 pb-[env(safe-area-inset-bottom)] p-3 md:p-4 relative z-30 flex-shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]`;

code = code.replace(target1, rep1);

const target2 = `flex-1 bg-[#0F1012]/60 border border-white/10 rounded-[24px] flex items-center px-3 relative shadow-[0_0_15px_rgba(212,175,55,0.05)] focus-within:border-[#D4AF37] focus-within:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all overflow-hidden h-[46px]`;
const rep2 = `flex-1 bg-white/5 border border-white/10 rounded-full flex items-center px-4 relative shadow-inner focus-within:bg-white/10 focus-within:border-white/20 transition-all overflow-hidden h-[50px]`;

code = code.replace(target2, rep2);

const target3 = `className="flex-1 min-w-0 py-2 h-full bg-transparent outline-none text-white placeholder-[#D4AF37]/60 text-[14px]"`;
const rep3 = `className="flex-1 min-w-0 py-2 h-full bg-transparent outline-none text-white placeholder-white/40 text-[15px]"`;

code = code.replace(target3, rep3);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched chat input");
