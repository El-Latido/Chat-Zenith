const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/**/*.tsx');

files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');
    if (code.includes('<img ')) {
        // Replace <img ... > with <img referrerPolicy="no-referrer" ... >
        // Be careful not to replace it multiple times
        code = code.replace(/<img (?!referrerPolicy)/g, '<img referrerPolicy="no-referrer" ');
        fs.writeFileSync(file, code);
        console.log("Patched " + file);
    }
});
