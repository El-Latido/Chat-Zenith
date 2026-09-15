const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const lucideImportRegex = /import\s+\{([^}]+)\}\s+from\s+["']lucide-react["'];/;
const match = code.match(lucideImportRegex);

if (match) {
    let imports = match[1];
    if (!imports.includes('Star')) {
        let newImports = imports + ', Star';
        code = code.replace(match[0], 'import { ' + newImports + ' } from "lucide-react";');
        fs.writeFileSync('src/App.tsx', code);
        console.log("Imported Star from lucide-react.");
    } else {
        console.log("Star already imported.");
    }
}
