const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

// The outer wrapper
code = code.replace(
  'className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"',
  'className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-4 overflow-y-auto"'
);

// The Modal container
code = code.replace(
  'className="relative w-full max-w-2xl bg-gradient-to-br from-[#12141c] to-[#0a0a0f] rounded-3xl shadow-2xl border border-white/10 flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-300"',
  'className="relative w-full max-w-2xl bg-gradient-to-br from-[#12141c] to-[#0a0a0f] rounded-3xl shadow-2xl border border-white/10 flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-300 mt-10 sm:mt-0 mb-10 sm:mb-0"'
);

fs.writeFileSync('src/components/ProfileConfigModal.tsx', code);
console.log("Fixed modal layout for mobile");
