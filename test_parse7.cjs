const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
lines.splice(896, 0, '</div>');
fs.writeFileSync('src/App_test.tsx', lines.join('\n'));
