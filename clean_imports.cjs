const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/, Volume2, VolumeX/, '');
fs.writeFileSync('src/App.tsx', app);
