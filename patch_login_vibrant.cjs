const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf8');

code = code.replace(
    'bg-[#0B0B0C] relative overflow-hidden font-sans',
    'bg-[#050505] relative overflow-hidden font-sans'
);

code = code.replace(
    '<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none"></div>',
    `<div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/30 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse"></div>
     <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-cyan-600/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
     <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-pink-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '4s' }}></div>`
);

code = code.replace(
    'bg-[#121316]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-2xl',
    'bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
);

code = code.replace(
    /focus:border-white\/20 focus:bg-white\/10/g,
    'focus:border-cyan-500/50 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]'
);

code = code.replace(
    'bg-white text-black font-semibold rounded-2xl py-3.5 mt-2 hover:bg-white/90',
    'bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-2xl py-3.5 mt-2 hover:opacity-90 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
);

fs.writeFileSync('src/components/Login.tsx', code);
console.log("Patched login vibrant");
