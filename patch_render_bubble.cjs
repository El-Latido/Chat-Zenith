const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{isLiz \? \([\s\S]*?\}\)\s*\}\s*<\/div>\s*<\/div>\s*\)\s*:\s*\(\s*<div className="flex gap-2 w-full mt-1.5 group">([\s\S]*?)<\/div>\s*<\/div>\s*\)/;

const match = code.match(regex);
if (!match) {
    console.log("Could not find message renderer block");
    process.exit(1);
}

// I will rewrite the entire map block for messages to handle styles and remove the isLiz separation.
