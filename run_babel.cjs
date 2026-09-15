const parser = require('@babel/parser');
const fs = require('fs');

const code = fs.readFileSync('src/App.tsx', 'utf8');

try {
    parser.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
    });
    console.log("No syntax errors found by Babel.");
} catch (e) {
    console.log("Babel error: " + e.message);
}
