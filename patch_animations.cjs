const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

if (!css.includes('.animate-in')) {
    css += `
.animate-in { animation-duration: 300ms; animation-fill-mode: both; animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
.fade-in { animation-name: fadeIn; }
.zoom-in-95 { animation-name: zoomIn95; }
.slide-in-from-right-4 { animation-name: slideInRight4; }
.slide-in-from-bottom-2 { animation-name: slideInBottom2; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes zoomIn95 { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes slideInRight4 { from { opacity: 0; transform: translateX(1rem); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideInBottom2 { from { opacity: 0; transform: translateY(0.5rem); } to { opacity: 1; transform: translateY(0); } }
`;
    fs.writeFileSync('src/index.css', css);
    console.log("Added animations to CSS");
}
