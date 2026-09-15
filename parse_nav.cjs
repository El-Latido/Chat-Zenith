const fs = require('fs');
const code = fs.readFileSync('src/App.tsx', 'utf8');

let divOpen = 0;
let asideOpen = 0;
let navOpen = 0;
let mainOpen = 0;

const lines = code.split('\n');

for (let i = 750; i < 830; i++) {
    const line = lines[i];
    if (!line) continue;

    const divOpens = (line.match(/<div(\s|>)/g) || []).length;
    const divCloses = (line.match(/<\/div>/g) || []).length;
    
    divOpen += divOpens - divCloses;

    if (line.includes('<nav')) navOpen++;
    if (line.includes('</nav>')) navOpen--;

    console.log(`${i+1}: ${line.trim().substring(0, 50)} | div: ${divOpen} nav: ${navOpen}`);
}
