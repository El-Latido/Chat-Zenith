const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetBg = `      className="text-black flex flex-col font-sans relative overflow-hidden"
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
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
      <div className="absolute right-0 top-0 w-[5%] h-full bg-gradient-to-l from-black/5 to-transparent pointer-events-none"></div>`;

const repBg = `      className="text-white flex flex-col font-sans relative overflow-hidden"
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "#030014", // Cyberpunk Dark
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
          .cyberpunk-neon {
            animation: rainbow-neon 5s linear infinite;
          }
        \`}</style>
      )}
      
      {/* Cyberpunk Animated Glowing Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] blur-[130px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ backgroundColor: 'var(--neon-color, #00f3ff)', opacity: 0.15 }}></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '1.5s', backgroundColor: 'var(--neon-color, #ff00ff)', opacity: 0.15 }}></div>
      
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        backgroundImage: \`
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        \`,
        backgroundSize: '30px 30px',
        transform: 'perspective(500px) rotateX(60deg) scale(2) translateY(-100px)',
        transformOrigin: 'top',
        opacity: 0.3
      }}></div>
      
      {/* Glassmorphism background filter overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-none z-0"></div>`;

code = code.replace(targetBg, repBg);
fs.writeFileSync('src/App.tsx', code);
