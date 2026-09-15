const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the main wrapper div
const targetBg = `      className="bg-[#030014] text-white flex flex-col font-sans relative overflow-hidden"
    >
      {/* Premium Animated Glowing Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 blur-[130px] rounded-full pointer-events-none mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] bg-pink-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '3s' }}></div>
      <div className="absolute bottom-[30%] left-[-10%] w-[35%] h-[35%] bg-blue-600/20 blur-[140px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Glassmorphism background filter overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none z-0"></div>`;

const repBg = `      className="text-black flex flex-col font-sans relative overflow-hidden"
      style={{
        backgroundColor: "#f5f5f7", // Robotic White
        "--neon-color": isRainbowNeon ? undefined : neonColor,
      } as React.CSSProperties}
    >
      {isRainbowNeon && (
        <style>{\`
          @keyframes rainbow-neon {
            0% { --neon-color: #ff0000; }
            17% { --neon-color: #ff00ff; }
            33% { --neon-color: #0000ff; }
            50% { --neon-color: #00ffff; }
            67% { --neon-color: #00ff00; }
            83% { --neon-color: #ffff00; }
            100% { --neon-color: #ff0000; }
          }
          .robotic-neon {
            animation: rainbow-neon 5s linear infinite;
          }
        \`}</style>
      )}
      
      {/* High-Tech Robotic Background Accents */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        backgroundImage: \`
          radial-gradient(circle at 10% 20%, rgba(0,0,0,0.03) 0%, transparent 20%),
          radial-gradient(circle at 90% 80%, rgba(0,0,0,0.03) 0%, transparent 20%),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)
        \`,
        backgroundSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px'
      }}></div>
      
      {/* Dark robotic panels on sides */}
      <div className="absolute left-0 top-0 w-[5%] h-full bg-gradient-to-r from-black/5 to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-0 w-[5%] h-full bg-gradient-to-l from-black/5 to-transparent pointer-events-none"></div>
`;

code = code.replace(targetBg, repBg);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched robotic background");
