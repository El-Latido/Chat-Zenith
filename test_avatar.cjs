const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
if (code.includes('expandedAvatar && (')) {
    console.log("Avatar expansion is present.");
} else {
    console.log("Avatar expansion missing.");
}
