const fs = require('fs');
let code = fs.readFileSync('src/components/ActiveCallModal.tsx', 'utf8');

const search = `                        if (event.track && !stream.getTracks().includes(event.track)) {
                            stream.addTrack(event.track);
                        }
                        const hasVideo = stream.getVideoTracks().length > 0;`;

const replace = `                        if (event.track && !(stream as MediaStream).getTracks().includes(event.track)) {
                            (stream as MediaStream).addTrack(event.track);
                        }
                        const hasVideo = (stream as MediaStream).getVideoTracks().length > 0;`;

code = code.replace(search, replace);
fs.writeFileSync('src/components/ActiveCallModal.tsx', code);
