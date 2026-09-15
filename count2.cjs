const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');
let open = 0;
let close = 0;
let balance = 0;
const lines = content.split('\n');
for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    for(let i=0; i<line.length; i++) {
        if (line[i] === '{') balance++;
        if (line[i] === '}') balance--;
    }
    if (balance === 0 && lineIdx > 50) {
        console.log('Negative balance at line', lineIdx + 1);
        console.log('Line content:', line);
        balance = 0; // reset to keep finding? no just break
        break;
    }
}
