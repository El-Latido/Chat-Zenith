const fs = require('fs');
let code = fs.readFileSync('src/components/ActiveCallModal.tsx', 'utf8');

// The remote video element needs to not be muted for audio to play. 
// Also, we need to ensure the audio track is enabled.
// In the current implementation, we are using a <video> element for the remote stream.
// If the video element is missing 'muted={false}', it should play audio by default, but let's make sure it's working.
// Actually, some browsers require autoplay policies to be met. 
// Let's ensure the remote video element is clearly visible and has volume.

// Let's modify the OutgoingCallModal to remove the ringtone.
let outgoingCode = fs.readFileSync('src/components/OutgoingCallModal.tsx', 'utf8');
outgoingCode = outgoingCode.replace(/<audio ref=\{audioRef\} src="[^"]+" loop \/>/, '');
fs.writeFileSync('src/components/OutgoingCallModal.tsx', outgoingCode);
console.log("Patched OutgoingCallModal");

