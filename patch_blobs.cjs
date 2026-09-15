const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
      }}
      className="bg-[#050505] text-white flex flex-col font-sans relative overflow-hidden"
    >
      {/* Top Navigation Bar (Floating/Overlay style) */}`;

const rep = `      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
      }}
      className="bg-[#030014] text-white flex flex-col font-sans relative overflow-hidden"
    >
      {/* Premium Animated Glowing Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 blur-[130px] rounded-full pointer-events-none mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] bg-pink-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '3s' }}></div>
      <div className="absolute bottom-[30%] left-[-10%] w-[35%] h-[35%] bg-blue-600/20 blur-[140px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Glassmorphism background filter overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none z-0"></div>

      {/* Top Navigation Bar (Floating/Overlay style) */}`;

code = code.replace(target, rep);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched background blobs");
