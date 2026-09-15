const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// State hook
const hooks = `  const [incomingCall, setIncomingCall] = useState<{username: string, profilePic: string} | null>(null);
  const [outgoingCall, setOutgoingCall] = useState<{username: string, profilePic: string} | null>(null);
  const [activeCall, setActiveCall] = useState<{partner: {username: string, profilePic: string}, isInitiator: boolean} | null>(null);
  const [replyingTo, setReplyingTo] = useState<MessageObj | null>(null);`;
code = code.replace(/const \[incomingCall.*setActiveCall.*null\);/s, hooks);

// handleSendMessage
const oldHandle = `    const payload: any = { text: inputValue, id: msgId };
    if (selectedImage) payload.image = selectedImage;
    if (selectedGif) payload.image = selectedGif;
    if (audioUrl) payload.audio = audioUrl;

    const msgData = { ...payload, sender: user.username, senderId: user.username, timestamp: Date.now(), createdAt: Date.now() };`;

const newHandle = `    const payload: any = { text: inputValue, id: msgId };
    if (selectedImage) payload.image = selectedImage;
    if (selectedGif) payload.image = selectedGif;
    if (audioUrl) payload.audio = audioUrl;
    if (replyingTo) {
        payload.replyTo = { id: replyingTo.id, sender: replyingTo.sender, text: replyingTo.text };
    }

    const msgData = { ...payload, sender: user.username, senderId: user.username, timestamp: Date.now(), createdAt: Date.now() };`;
code = code.replace(oldHandle, newHandle);

const oldClear = `    setIsRecording(false);
    setRecordingStream(null);
    setInputValue('');
    setSelectedImage(null);
    setAudioUrl(null);`;
const newClear = `    setIsRecording(false);
    setRecordingStream(null);
    setInputValue('');
    setSelectedImage(null);
    setAudioUrl(null);
    setReplyingTo(null);`;
code = code.replace(oldClear, newClear);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched handleSendMessage");
