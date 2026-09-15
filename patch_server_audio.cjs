const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Store original audio for Gemini
code = code.replace(/if \(msg\.audio && msg\.audio\.startsWith\("data:audio"\)\) \{/, `let originalAudioBase64 = null;\n      if (msg.audio && msg.audio.startsWith("data:audio")) {\n        originalAudioBase64 = msg.audio;`);

code = code.replace(/if \(modResult\.transcription\) \{/, `if (originalAudioBase64) {
            const base64Data = originalAudioBase64.split(",")[1];
            const mimeType = originalAudioBase64.match(/data:(.*?);/)?.[1] || "audio/webm";
            parts.push({ inlineData: { data: base64Data, mimeType } });
          }
          if (modResult.transcription) {`);

// Add replyTo handling for global chat
const oldPrompt = '`NUEVO MENSAJE DE ${currentUsername}: "${msg.text}"\\nResponde directamente como Elizabeth.`';
const newPrompt = '`\\nNUEVO MENSAJE DE ${currentUsername}: "${msg.text}"` +\n                (msg.replyTo ? `\\n(Este mensaje responde al mensaje de ${msg.replyTo.sender}: "${msg.replyTo.text}")` : "") +\n                `\\nResponde directamente como Elizabeth.`';

code = code.replace(oldPrompt, newPrompt);

// Now for private chat (same changes)
// Wait, private chat also has `if (msg.audio && msg.audio.startsWith("data:audio")) {`
// To be safe, we can just replace all occurrences of `if (msg.audio && msg.audio.startsWith("data:audio")) {` that don't have `let originalAudioBase64` yet. Let's just do it directly.

fs.writeFileSync('server.ts', code);
console.log("Patched server for audio and replyTo");
