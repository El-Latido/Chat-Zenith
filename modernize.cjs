const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The main wrapper background
code = code.replace(
    'className="bg-gradient-to-br from-[#0B1220] via-[#121B2A] to-[#0A101C] text-gray-200 flex flex-col font-sans"',
    'className="bg-[#0B0B0C] text-[#E0E2E5] flex flex-col font-sans"'
);

// Sidebar background
code = code.replace(
    /bg-\[#121B2A\]\/95/g,
    'bg-[#0F1012]/95'
);

// General deep backgrounds
code = code.replace(
    /bg-\[#121B2A\]/g,
    'bg-[#0F1012]'
);

// Gold borders heavily used -> tone them down to white/5 or white/10
code = code.replace(
    /border-\[#D4AF37\]\/30/g,
    'border-white/5'
);
code = code.replace(
    /border-\[#D4AF37\]\/50/g,
    'border-white/10'
);

// Primary gold accents (keep some for buttons, but refine them)
// #D4AF37 -> we can keep it as an accent or change it to #F5F5F5 / #EBEBEB for a sleeker look. Let's make the main accent a sleek off-white/gray, or keep gold but subtle.
// The prompt asked for modern, wow. Let's make it a sleek Deep Slate theme with Violet/Indigo accents instead of casino gold, OR just hyper-minimalist black/white. Let's stick to hyper-minimalist dark mode (Geist-like, but using our fonts).
code = code.replace(/text-\[#D4AF37\]/g, 'text-white/80');
code = code.replace(/text-\[#E8D9B0\]/g, 'text-white');
code = code.replace(/text-\[#8B98B0\]/g, 'text-white/50');
code = code.replace(/hover:text-\[#E8D9B0\]/g, 'hover:text-white');

// Shadows
code = code.replace(/shadow-\[0_0_15px_rgba\(212,175,55,0\.1\)\]/g, 'shadow-[0_4px_24px_rgba(0,0,0,0.2)]');
code = code.replace(/shadow-\[0_0_15px_rgba\(212,175,55,0\.4\)\]/g, 'shadow-[0_4px_24px_rgba(0,0,0,0.4)]');
code = code.replace(/shadow-\[0_0_10px_rgba\(212,175,55,0\.3\)\]/g, 'shadow-lg');

// Bubbles
code = code.replace(/bg-gradient-to-r from-cyan-600 to-blue-600/g, 'bg-white/10'); // My messages
code = code.replace(/bg-gradient-to-r from-gray-700 to-gray-600/g, 'bg-[#18191B]'); // Other messages
code = code.replace(/bg-\[#1F2937\]\/80/g, 'bg-[#18191B]'); // Other msgs
code = code.replace(/bg-\[#374151\]\/80/g, 'bg-white/10 text-white'); // My msgs

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx modernized colors");
