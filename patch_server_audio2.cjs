const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// For private chat
const regexAudio = /if \(msg\.audio && msg\.audio\.startsWith\("data:audio"\)\) \{\s*let uploadedToStorage = false;\s*if \(fStorage\) \{/g;
let matchCount = 0;
code = code.replace(regexAudio, (match) => {
    matchCount++;
    if (matchCount === 2) {
        return `let originalPrivateAudioBase64 = null;\n      if (msg.audio && msg.audio.startsWith("data:audio")) {\n        originalPrivateAudioBase64 = msg.audio;\n        let uploadedToStorage = false;\n        if (fStorage) {`;
    }
    return match;
});

const oldPromptPriv = '`NUEVO MENSAJE DE ${currentUsername}: "${msg.text}"\\nResponde directamente como Elizabeth.`';
const newPromptPriv = '`\\nNUEVO MENSAJE DE ${currentUsername}: "${msg.text}"` +\n                  (msg.replyTo ? `\\n(Este mensaje responde al mensaje de ${msg.replyTo.sender}: "${msg.replyTo.text}")` : "") +\n                  `\\nResponde directamente como Elizabeth.`';
code = code.replace(oldPromptPriv, newPromptPriv);

code = code.replace(/if \(modResult\.transcription\) \{/g, (match, offset, str) => {
    // Only target the one in send_private_message (after line 2700)
    if (offset > 2600) {
        return `if (originalPrivateAudioBase64) {
              const base64Data = originalPrivateAudioBase64.split(",")[1];
              const mimeType = originalPrivateAudioBase64.match(/data:(.*?);/)?.[1] || "audio/webm";
              parts.push({ inlineData: { data: base64Data, mimeType } });
            }
            if (modResult.transcription) {`;
    }
    return match;
});

fs.writeFileSync('server.ts', code);
console.log("Patched server for private audio and replyTo");
