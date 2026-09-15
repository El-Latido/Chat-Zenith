const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{\/\* Friends Sidebar \*\/\}([\s\S]*?)<\/div>\s*\}\s*\{\/\* Games Menu Modal \*\/\}/m;
const match = content.match(regex);
if (match) {
    console.log("Found friends sidebar!");
} else {
    console.log("Not found.");
}

