const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

const i = lines.findIndex(l => l.includes('function MainApp() {'));
if (i !== -1) {
    lines.splice(i, 0, 'const EMOTICONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];');
}

fs.writeFileSync('src/App.tsx', lines.join('\n'));
