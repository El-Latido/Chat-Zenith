const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    socket.on('receive_global', (msg: any) => {
      // In firebase mode, we rely on the onSnapshot listener for most messages.
      // However, we want to ensure immediate optimistic UI or fallback for non-firebase.
      // Also, we need to make sure we don't duplicate. We only push if it's not from us 
      // (since we pushed optimistically) or if it's an AI/System message.
      if (msg.sender !== user.username || msg.sender === 'Elizabeth' || msg.isAi) {
          setMessages(prev => { if (prev.some(m => m.id === msg.id)) return prev; return [...prev, msg]; });
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    });`;

const rep = `    socket.on('receive_global', (msg: any) => {
      // If we are not in global chat, we shouldn't append it to the current messages view
      if (activeChat !== 'global') {
          return;
      }
      
      if (msg.sender !== user.username || msg.sender === 'Elizabeth' || msg.isAi) {
          setMessages(prev => { if (prev.some(m => m.id === msg.id)) return prev; return [...prev, msg]; });
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    });`;

if (code.includes(target)) {
    code = code.replace(target, rep);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched receive_global in App.tsx");
} else {
    console.log("Target not found");
}
