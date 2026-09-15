const fs = require('fs');
let code = fs.readFileSync('src/components/ActiveCallModal.tsx', 'utf8');

const search = `const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });`;
const replace = `const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: false, 
                    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
                });`;

code = code.replace(search, replace);
fs.writeFileSync('src/components/ActiveCallModal.tsx', code);
