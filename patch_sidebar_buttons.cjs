const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace active state buttons
code = code.replace(/bg-cyan-500\/20 text-cyan-400 border border-cyan-500\/30/g, 'bg-white/10 text-white border border-white/10 shadow-sm');
code = code.replace(/bg-purple-500\/20 text-purple-400 border border-purple-500\/30/g, 'bg-white/10 text-white border border-white/10 shadow-sm');
code = code.replace(/bg-orange-500\/20 text-orange-400 border border-orange-500\/30/g, 'bg-white/10 text-white border border-white/10 shadow-sm');
code = code.replace(/bg-white\/5 text-gray-300 hover:bg-white\/10/g, 'bg-transparent text-white/50 hover:bg-white/5 hover:text-white');

// The Lizgram & Buzon top buttons active states
code = code.replace(/text-cyan-400 bg-cyan-500\/20/g, 'text-black bg-white');
code = code.replace(/text-pink-400 bg-pink-500\/20/g, 'text-black bg-white');

// User list active states
code = code.replace(/bg-\[#1A2639\] border border-white\/20/g, 'bg-white/10 border border-white/10');
code = code.replace(/hover:bg-\[#1A2639\]\/50/g, 'hover:bg-white/5');

// Main chat input area background
code = code.replace(/bg-\[#121B2A\]\/80 backdrop-blur-xl border-t border-\[#D4AF37\]\/30/g, 'bg-[#0B0B0C]/80 backdrop-blur-2xl border-t border-white/5');

fs.writeFileSync('src/App.tsx', code);
console.log("Patched sidebar buttons");
