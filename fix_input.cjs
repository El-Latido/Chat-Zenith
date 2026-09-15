const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                {/* Input Area */}
                <div className="p-3 pb-[env(safe-area-inset-bottom)] shrink-0 bg-black/40 backdrop-blur-3xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] relative z-10 w-full flex flex-col gap-2">
                  <div className="max-w-5xl w-full mx-auto flex flex-col gap-2">`;

const rep = `                {/* Input Area */}
                <div className="px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] shrink-0 bg-white/[0.03] backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] relative z-10 max-w-5xl w-full mx-auto flex flex-col gap-2">`;

code = code.replace(target, rep);
fs.writeFileSync('src/App.tsx', code);
console.log("Fixed unclosed div");
