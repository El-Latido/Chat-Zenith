const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css += `
/* Global minimal scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
`;

fs.writeFileSync('src/index.css', css);
console.log("Patched scrollbar");
