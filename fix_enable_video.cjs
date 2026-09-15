const fs = require('fs');
let code = fs.readFileSync('src/components/ActiveCallModal.tsx', 'utf8');

const enableVideoOld = `                // Renegotiate connection with new track
                const offer = await peerConnection.current.createOffer();
                await peerConnection.current.setLocalDescription(offer);
                socket.emit('webrtc_offer', { target: partner.username, sdp: offer });`;

const enableVideoNew = `                // Let negotiationneeded handle it, or we just manually renegotiate if we are initiator
                if (isInitiator) {
                    const offer = await peerConnection.current.createOffer();
                    await peerConnection.current.setLocalDescription(offer);
                    socket.emit('webrtc_offer', { target: partner.username, sdp: offer });
                }`;

code = code.replace(enableVideoOld, enableVideoNew);

const initWebRTCOld = `                stream.getTracks().forEach(track => pc.addTrack(track, stream));`;

const initWebRTCNew = `                stream.getTracks().forEach(track => pc.addTrack(track, stream));
                
                pc.onnegotiationneeded = async () => {
                    try {
                        if (isInitiator && pc.signalingState !== "closed") {
                            const offer = await pc.createOffer();
                            await pc.setLocalDescription(offer);
                            socket.emit('webrtc_offer', {
                                target: partner.username,
                                sdp: offer
                            });
                        }
                    } catch (e) {
                        console.error("negotiation error", e);
                    }
                };`;
code = code.replace(initWebRTCOld, initWebRTCNew);

// Fix the glare issue on offer
const handleOfferOld = `        const handleOffer = async (data: { sender: string, sdp: RTCSessionDescriptionInit }) => {
            if (data.sender !== partner.username || !peerConnection.current) return;
            const pc = peerConnection.current;
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('webrtc_answer', {
                target: partner.username,
                sdp: answer
            });
        };`;

const handleOfferNew = `        const handleOffer = async (data: { sender: string, sdp: RTCSessionDescriptionInit }) => {
            if (data.sender !== partner.username || !peerConnection.current) return;
            const pc = peerConnection.current;
            if (pc.signalingState !== "stable") {
                // If we are initiator and we receive an offer while not stable, we ignore it (glare resolution - initiator wins)
                if (isInitiator) return;
                // If non-initiator, we should rollback, but standard WebRTC rollback is complex.
                // We'll just try to set it.
            }
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('webrtc_answer', {
                    target: partner.username,
                    sdp: answer
                });
            } catch (e) {
                console.error("Error handling offer", e);
            }
        };`;

code = code.replace(handleOfferOld, handleOfferNew);

fs.writeFileSync('src/components/ActiveCallModal.tsx', code);
