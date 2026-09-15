const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/\s*\/\/ Hablar eliminado/g, '');
fs.writeFileSync('src/App.tsx', app);
