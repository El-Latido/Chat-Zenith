const fs = require('fs');
let code = fs.readFileSync('src/components/ActiveCallModal.tsx', 'utf8');

const search = `                pc.onnegotiationneeded = async () => {
                    try {
                        if (pc.signalingState !== "stable") return;
                        const offer = await pc.createOffer();`;

const replace = `                pc.onnegotiationneeded = async () => {
                    if (!isInitiator) return;
                    try {
                        if (pc.signalingState !== "stable") return;
                        const offer = await pc.createOffer();`;

code = code.replace(search, replace);
fs.writeFileSync('src/components/ActiveCallModal.tsx', code);
