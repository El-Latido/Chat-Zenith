const fs = require('fs');
let code = fs.readFileSync('src/components/ActiveCallModal.tsx', 'utf8');

const iceSearch = `        const handleIceCandidate = async (data: { sender: string, candidate: RTCIceCandidateInit }) => {
            if (data.sender !== partner.username || !peerConnection.current) return;
            try {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (e) {
                if (!ignoreOffer) {
                    console.error("Error adding ice candidate", e);
                }
            }
        };`;

const iceReplace = `        const iceCandidateQueue: RTCIceCandidateInit[] = [];
        const handleIceCandidate = async (data: { sender: string, candidate: RTCIceCandidateInit }) => {
            if (data.sender !== partner.username || !peerConnection.current) return;
            try {
                if (peerConnection.current.remoteDescription) {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                } else {
                    iceCandidateQueue.push(data.candidate);
                }
            } catch (e) {
                if (!ignoreOffer) {
                    console.error("Error adding ice candidate", e);
                }
            }
        };`;

code = code.replace(iceSearch, iceReplace);

const answerSearch = `        const handleAnswer = async (data: { sender: string, sdp: RTCSessionDescriptionInit }) => {
            if (data.sender !== partner.username || !peerConnection.current) return;
            try {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
            } catch(e) {
                console.error("Error setting answer", e);
            }
        };`;

const answerReplace = `        const handleAnswer = async (data: { sender: string, sdp: RTCSessionDescriptionInit }) => {
            if (data.sender !== partner.username || !peerConnection.current) return;
            try {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
                // Process queued ICE candidates
                while (iceCandidateQueue.length > 0) {
                    const candidate = iceCandidateQueue.shift();
                    if (candidate) await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
            } catch(e) {
                console.error("Error setting answer", e);
            }
        };`;

code = code.replace(answerSearch, answerReplace);


const offerSearch = `                if (pc.signalingState !== "stable" && polite) {
                    await Promise.all([
                        pc.setLocalDescription({type: "rollback"}),
                        pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
                    ]);
                } else {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                }
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('webrtc_answer', {
                    target: partner.username,
                    sdp: pc.localDescription
                });`;

const offerReplace = `                if (pc.signalingState !== "stable" && polite) {
                    await Promise.all([
                        pc.setLocalDescription({type: "rollback"}),
                        pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
                    ]);
                } else {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                }
                
                // Process queued ICE candidates
                while (iceCandidateQueue.length > 0) {
                    const candidate = iceCandidateQueue.shift();
                    if (candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
                }

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('webrtc_answer', {
                    target: partner.username,
                    sdp: pc.localDescription
                });`;
code = code.replace(offerSearch, offerReplace);

fs.writeFileSync('src/components/ActiveCallModal.tsx', code);
