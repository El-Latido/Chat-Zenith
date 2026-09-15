const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const builderRegex = /if\s*\(activeChat\s*===\s*'builder'\)\s*\{\s*return\s*\(\s*<div[^>]*>\s*<Builder3D[^>]*\/>\s*<\/div>\s*\);\s*\}/g;
code = code.replace(builderRegex, "");

fs.writeFileSync('src/App.tsx', code);
