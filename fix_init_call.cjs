const fs = require('fs');
let code = fs.readFileSync('src/components/ActiveCallModal.tsx', 'utf8');
const search = `                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: false, 
                    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
                });`;
const replace = `                let stream;
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ 
                        video: false, 
                        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
                    });
                } catch (err) {
                    console.error("Microphone access denied or error", err);
                    stream = new MediaStream(); // Fallback empty stream to prevent crash
                }`;
code = code.replace(search, replace);
fs.writeFileSync('src/components/ActiveCallModal.tsx', code);
