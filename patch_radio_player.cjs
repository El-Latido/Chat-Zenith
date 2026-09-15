const fs = require('fs');
let code = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

const oldWrapper = '<div className="fixed top-0 left-0 w-[1px] h-[1px] opacity-0 pointer-events-none overflow-hidden" aria-hidden="true">';
const newWrapper = '<div className="absolute inset-0 w-full h-full z-[-1] pointer-events-none overflow-hidden rounded-2xl" aria-hidden="true">';

code = code.replace(oldWrapper, newWrapper);

fs.writeFileSync('src/components/InlineRadio.tsx', code);
console.log("Patched InlineRadio.tsx");
