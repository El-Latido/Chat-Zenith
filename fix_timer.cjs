const fs = require('fs');
let code = fs.readFileSync('src/components/ActiveCallModal.tsx', 'utf8');

const search = `        return () => {
            clearInterval(timer);
            socket.off('webrtc_offer', handleOffer);
            socket.off('webrtc_answer', handleAnswer);
            socket.off('webrtc_ice_candidate', handleIceCandidate);
            socket.off('call_ended', handleCallEnded);
            socket.off('video_request', handleVideoRequest);
            socket.off('video_response', handleVideoResponse);
            cleanup();
        };
    });`;

const replace = `        return () => {
            clearInterval(timer);
            socket.off('webrtc_offer', handleOffer);
            socket.off('webrtc_answer', handleAnswer);
            socket.off('webrtc_ice_candidate', handleIceCandidate);
            socket.off('call_ended', handleCallEnded);
            socket.off('video_request', handleVideoRequest);
            socket.off('video_response', handleVideoResponse);
            cleanup();
        };
    }, []);`;

code = code.replace(search, replace);
fs.writeFileSync('src/components/ActiveCallModal.tsx', code);
