const fs = require('fs');
const code = fs.readFileSync('src/App.tsx', 'utf8');

const lines = code.split('\n');

let insideAside = false;
let divDepth = 0;

for (let i = 824; i <= 938; i++) {
    const line = lines[i];
    if (line.includes('<aside')) insideAside = true;
    
    if (insideAside) {
        const opens = (line.match(/<div(\s|>)/g) || []).length;
        const closes = (line.match(/<\/div>/g) || []).length;
        divDepth += opens - closes;
        console.log(`${i+1}: depth=${divDepth} | ${line.trim().substring(0, 50)}`);
    }

    if (line.includes('</aside>')) insideAside = false;
}
