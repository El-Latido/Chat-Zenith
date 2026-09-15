const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const lines = code.split('\n');
let divCount = 0;

for (let i = 1640; i <= 1891; i++) {
    const line = lines[i];
    const opens = (line.match(/<div/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    divCount += opens - closes;
}
console.log("Net div count before </aside>:", divCount);
