const fs = require('fs');
let code = fs.readFileSync('src/components/ActiveCallModal.tsx', 'utf8');

const onTrackOld = `                pc.ontrack = (event) => {
                    if (remoteVideoRef.current && event.streams[0]) {
                        if (remoteVideoRef.current.srcObject !== event.streams[0]) {
                            remoteVideoRef.current.srcObject = event.streams[0];
                        }
                        const hasVideo = event.streams[0].getVideoTracks().length > 0;
                        setRemoteStreamAvailable(hasVideo);
                    }
                };`;

const onTrackNew = `                pc.ontrack = (event) => {
                    if (remoteVideoRef.current) {
                        let stream = remoteVideoRef.current.srcObject;
                        if (!stream) {
                            if (event.streams && event.streams[0]) {
                                stream = event.streams[0];
                            } else {
                                stream = new MediaStream();
                            }
                            remoteVideoRef.current.srcObject = stream;
                        }
                        if (event.track && !stream.getTracks().includes(event.track)) {
                            stream.addTrack(event.track);
                        }
                        const hasVideo = stream.getVideoTracks().length > 0;
                        setRemoteStreamAvailable(hasVideo);
                        remoteVideoRef.current.play().catch(e => console.error("Play error:", e));
                    }
                };`;

code = code.replace(onTrackOld, onTrackNew);
fs.writeFileSync('src/components/ActiveCallModal.tsx', code);
