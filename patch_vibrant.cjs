const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The main wrapper background
code = code.replace(
    'className="bg-[#0B0B0C] text-[#E0E2E5] flex flex-col font-sans"',
    'className="bg-[#050505] text-white flex flex-col font-sans relative overflow-hidden"'
);
// We will add animated ambient blobs in the background in the render loop.
const renderTarget = `    <div
      style={{
        height: \`\${windowHeight}px\`,
        width: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
      className="bg-[#050505] text-white flex flex-col font-sans relative overflow-hidden"
    >
      {/* Top Navigation Bar (Floating/Overlay style) */}`;

const renderReplacement = `    <div
      style={{
        height: \`\${windowHeight}px\`,
        width: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
      className="bg-[#050505] text-white flex flex-col font-sans relative overflow-hidden"
    >
      {/* Ambient Animated Blobs for Colorful Advanced Look */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-pink-500/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '4s' }}></div>
      
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none z-0"></div>

      {/* Top Navigation Bar (Floating/Overlay style) */}`;

code = code.replace(renderTarget, renderReplacement);

// Top Nav
code = code.replace(
    'bg-[#0B0B0C]/80 backdrop-blur-md',
    'bg-white/[0.03] backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]'
);

// Sidebar background
code = code.replace(
    /bg-\[#0F1012\]\/95/g,
    'bg-[#0a0a0c]/80 backdrop-blur-2xl border-r border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.2)]'
);

// Sidebar icons active states
code = code.replace(
    /bg-white\/10 text-white border border-white\/10 shadow-sm/g,
    'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
);
code = code.replace(
    /bg-transparent text-white\/50 hover:bg-white\/5 hover:text-white/g,
    'bg-transparent text-white/50 hover:bg-white/10 hover:text-white transition-all'
);

// Lizgram and Buzon top buttons active
code = code.replace(
    /text-black bg-white/g,
    'text-white bg-gradient-to-r from-pink-500 to-purple-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]'
);

// Main chat input area background
code = code.replace(
    /bg-\[#0B0B0C\]\/60 backdrop-blur-3xl border-t border-white\/5 pb-\[env\(safe-area-inset-bottom\)\] p-3 md:p-4 relative z-30 flex-shrink-0 shadow-\[0_-10px_40px_rgba\(0,0,0,0\.5\)\]/g,
    'bg-black/40 backdrop-blur-3xl border-t border-white/10 pb-[env(safe-area-inset-bottom)] p-3 md:p-4 relative z-30 flex-shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]'
);

// Input field itself
code = code.replace(
    /flex-1 bg-white\/5 border border-white\/10 rounded-full flex items-center px-4 relative shadow-inner focus-within:bg-white\/10 focus-within:border-white\/20 transition-all overflow-hidden h-\[50px\]/g,
    'flex-1 bg-white/5 border border-white/10 rounded-full flex items-center px-4 relative shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] focus-within:bg-white/10 focus-within:border-cyan-500/50 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all overflow-hidden h-[50px]'
);

// Users List Box (online users)
code = code.replace(
    /bg-white\/10 border border-white\/10/g, // Selected user
    'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
);
code = code.replace(
    /bg-\[#1A2639\]\/80 border border-white\/5/g, // Normal user box
    'bg-white/[0.03] border border-white/10 backdrop-blur-md hover:border-white/20'
);

// Chat Bubbles Colors Fix
code = code.replace(
    /const defaultBubbleColor = isMe \? "#1E1F24" : "#151619";/g,
    'const defaultBubbleColor = isMe ? "rgba(6, 182, 212, 0.15)" : "rgba(255, 255, 255, 0.05)";'
);
code = code.replace(
    /const defaultBorder = "rgba\(255,255,255,0\.05\)";/g,
    'const defaultBorder = isMe ? "rgba(6, 182, 212, 0.3)" : "rgba(255, 255, 255, 0.1)";'
);
code = code.replace(
    /boxShadow: bTexture === "glow" \? \`0 0 15px rgba\(255,255,255,0\.1\)\` : '0 2px 10px rgba\(0,0,0,0\.1\)',/g,
    'boxShadow: bTexture === "glow" ? `0 0 15px rgba(255,255,255,0.1)` : (isMe ? "0 4px 20px rgba(6,182,212,0.15)" : "0 4px 20px rgba(0,0,0,0.2)"),backdropFilter: "blur(10px)",'
);

// Name colors in chat
code = code.replace(
    /const nameColor = isElizabeth \? "text-white\/80" : "text-white\/60";/g,
    'const nameColor = isElizabeth ? "text-pink-400" : "text-cyan-300";'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched vibrant colors in App.tsx");
