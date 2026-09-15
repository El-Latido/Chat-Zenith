const fs = require('fs');
const code = fs.readFileSync('src/App.tsx', 'utf8');

// Use Babel to parse JSX and find the unclosed tag!
