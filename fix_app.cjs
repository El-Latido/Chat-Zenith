const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I might have accidentally caused a nesting error because I replaced a string that appeared in multiple places?
// Let's count how many times my replacement pattern appeared.

const count = (code.match(/<div className="px-4 py-3 pb-\[calc\(12px\+env\(safe-area-inset-bottom\)\)\] shrink-0 bg-white\/\[0\.03\] backdrop-blur-2xl border-t border-white\/10 shadow-\[0_-10px_40px_rgba\(0,0,0,0\.5\)\] relative z-10 w-full flex flex-col gap-2">/g) || []).length;
console.log("Count of replaced string:", count);
