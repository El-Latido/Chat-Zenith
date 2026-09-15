const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];/;
const match = code.match(importRegex);
if (match) {
    const imports = match[1].split(',').map(s => s.trim()).filter(Boolean);
    const uniqueImports = [...new Set(imports)];
    const newImport = `import { ${uniqueImports.join(', ')} } from "lucide-react";`;
    code = code.replace(importRegex, newImport);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed lucide-react imports");
}
