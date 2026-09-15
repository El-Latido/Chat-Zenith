const fs = require('fs');
const code = fs.readFileSync('src/App.tsx', 'utf8');

const lines = code.split('\n');

let insideMain = false;
let divDepth = 0;
let mainOpen = 0;

for (let i = 938; i <= 1195; i++) {
    const line = lines[i];
    if (line.includes('<main')) { insideMain = true; mainOpen++; }
    
    if (insideMain) {
        const opens = (line.match(/<div(\s|>)/g) || []).length;
        const closes = (line.match(/<\/div>/g) || []).length;
        divDepth += opens - closes;
        if (opens !== closes || line.includes('<main') || line.includes('</main')) {
            console.log(`${i+1}: depth=${divDepth} | ${line.trim().substring(0, 50)}`);
        }
    }

    if (line.includes('</main>')) { insideMain = false; mainOpen--; }
}
