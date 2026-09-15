const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { TranslatedText }')) {
    code = code.replace(/import React, \{/, "import { TranslatedText } from './components/TranslatedText';\nimport React, {");
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed TranslatedText import.");
}
