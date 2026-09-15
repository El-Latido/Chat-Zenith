const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (code.includes('https://cdn.tailwindcss.com')) {
    console.log("Tailwind CDN is present in App.tsx");
} else {
    console.log("Tailwind CDN is MISSING in App.tsx!");
}
