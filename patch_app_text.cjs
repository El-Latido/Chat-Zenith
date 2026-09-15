const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Import TranslatedText
if (!code.includes('TranslatedText')) {
    code = code.replace(/import React, \{[^\}]+\} from 'react';/, "import React, { useState, useEffect, useRef } from 'react';\\nimport { TranslatedText } from './components/TranslatedText';");
}

// 2. Replace {m.text} with <TranslatedText>
// The code is around line 2060
// {m.text}
code = code.replace(/\{m\.text\}/g, `<TranslatedText originalText={m.text} senderLanguage={m.senderLanguage} userLanguage={user.pais_idioma || 'es'} />`);

fs.writeFileSync('src/App.tsx', code);
console.log("Replaced {m.text} with TranslatedText");
