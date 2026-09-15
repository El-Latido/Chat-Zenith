const fs = require('fs');
let code = fs.readFileSync('src/components/ActiveCallModal.tsx', 'utf8');

// replace negotiationneeded to allow both
const oldNeg = `                pc.onnegotiationneeded = async () => {
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

const newNeg = `                pc.onnegotiationneeded = async () => {
                    try {
                        if (pc.signalingState !== "stable") return;
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        socket.emit('webrtc_offer', {
                            target: partner.username,
                            sdp: offer
                        });
                    } catch (e) {
                        console.error("negotiation error", e);
                    }
                };`;

code = code.replace(oldNeg, newNeg);

// Replace enableVideoNew
const oldEnableOffer = `                // Let negotiationneeded handle it, or we just manually renegotiate if we are initiator
                if (isInitiator) {
                    const offer = await peerConnection.current.createOffer();
                    await peerConnection.current.setLocalDescription(offer);
                    socket.emit('webrtc_offer', { target: partner.username, sdp: offer });
                }`;

const newEnableOffer = `                // Let negotiationneeded handle it automatically`;
code = code.replace(oldEnableOffer, newEnableOffer);

fs.writeFileSync('src/components/ActiveCallModal.tsx', code);
