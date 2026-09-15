const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/\{m\.replyTo\.text\}/g, `<TranslatedText originalText={m.replyTo.text} senderLanguage={m.replyTo.senderLanguage} userLanguage={user.pais_idioma || 'es'} />`);

fs.writeFileSync('src/App.tsx', code);
console.log("Replaced replyTo.text");
