const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `    socket.on("receive_global", (msg: any) => {`;
const replace = `    socket.on("message_reaction", (data: { msgId: string, docId?: string, emoji: string, activeChat: string }) => {
      setMessages(prev => prev.map(m => {
        if ((m.id && m.id === data.msgId) || (m.docId && m.docId === data.docId)) {
          const currentReactions = m.reactions || {};
          return {
            ...m,
            reactions: {
              ...currentReactions,
              [data.emoji]: (currentReactions[data.emoji] || 0) + 1
            }
          };
        }
        return m;
      }));
    });

    socket.on("receive_global", (msg: any) => {`;

code = code.replace(search, replace);

const offSearch = `      socket.off("receive_global");`;
const offReplace = `      socket.off("receive_global");
      socket.off("message_reaction");`;

code = code.replace(offSearch, offReplace);

fs.writeFileSync('src/App.tsx', code);
