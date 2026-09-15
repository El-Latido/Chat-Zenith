const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The duplicate originalPrivateAudioBase64 block in global chat is around line 2114.
// Let's remove it.
const badBlock = `if (originalPrivateAudioBase64) {
              const base64Data = originalPrivateAudioBase64.split(",")[1];
              const mimeType = originalPrivateAudioBase64.match(/data:(.*?);/)?.[1] || "audio/webm";
              parts.push({ inlineData: { data: base64Data, mimeType } });
            }
            if (modResult.transcription) {`;
            
// Only replace the first occurrence (which is in global chat where it shouldn't be)
code = code.replace(badBlock, `if (modResult.transcription) {`);

// Now let's check where `let originalPrivateAudioBase64 = null;` was inserted.
const privRegex = /let originalPrivateAudioBase64 = null;/;
if (!privRegex.test(code)) {
    // If it wasn't inserted, insert it
    const regexPrivAudio = /if \(msg\.audio && msg\.audio\.startsWith\("data:audio"\)\) \{\s*let uploadedToStorage = false;\s*if \(fStorage\) \{/g;
    let matchCount = 0;
    code = code.replace(regexPrivAudio, (match) => {
        matchCount++;
        if (matchCount === 2) {
            return `let originalPrivateAudioBase64 = null;\n      if (msg.audio && msg.audio.startsWith("data:audio")) {\n        originalPrivateAudioBase64 = msg.audio;\n        let uploadedToStorage = false;\n        if (fStorage) {`;
        }
        return match;
    });
}

fs.writeFileSync('server.ts', code);
