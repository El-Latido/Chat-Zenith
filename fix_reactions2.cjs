const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex1 = /Object\.entries\(\s*Object\.values\(m\.reactions\)\.reduce\(\s*\(\w+,\s*\w+\)\s*=>\s*\{[^}]+\},\s*\{\}\s*as\s*any,?\s*\),?\s*\)/g;
code = code.replace(regex1, 'Object.entries(m.reactions)');

fs.writeFileSync('src/App.tsx', code);
