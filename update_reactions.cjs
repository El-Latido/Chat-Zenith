const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldReaction = `  const handleReaction = async (msgId: string, docId: string | undefined, emoji: string) => {
    setReactionMenuId(null);
    playReactionSound(emoji);
    
    // Add optimistic UI reaction
    setMessages(prev => prev.map(m => {
        if ((m.id && m.id === msgId) || (m.docId && m.docId === docId)) {
            const currentReactions = m.reactions || {};
            return {
                ...m,
                reactions: {
                    ...currentReactions,
                    [emoji]: (currentReactions[emoji] || 0) + 1
                }
            };
        }
        return m;
    }));

    if (docId) {
        import("firebase/firestore").then(async ({ doc, updateDoc, increment, getDoc }) => {
            try {
                const msgRef = doc(db, "globalMessages", docId);
                const snap = await getDoc(msgRef);
                if (snap.exists()) {
                    await updateDoc(msgRef, {
                        [\`reactions.\${emoji}\`]: increment(1)
                    });
                }
            } catch (e) {
                console.error("Error updating reaction in Firestore:", e);
            }
        });
    }
    if (socket) {
        socket.emit("message_reaction", { msgId, emoji, activeChat, docId });
    }
  };`;

const newReaction = `  const handleReaction = async (msgId: string, docId: string | undefined, emoji: string) => {
    setReactionMenuId(null);
    playReactionSound(emoji);
    
    // Add optimistic UI reaction
    setMessages(prev => prev.map(m => {
        if ((m.id && m.id === msgId) || (m.docId && m.docId === docId)) {
            const currentReactions = m.reactions || {};
            const reactionUsers = Array.isArray(currentReactions[emoji]) ? currentReactions[emoji] : [];
            if (!reactionUsers.includes(user.username)) {
               return {
                   ...m,
                   reactions: {
                       ...currentReactions,
                       [emoji]: [...reactionUsers, user.username]
                   }
               };
            }
        }
        return m;
    }));

    if (docId) {
        import("firebase/firestore").then(async ({ doc, updateDoc, arrayUnion, getDoc }) => {
            try {
                const msgRef = doc(db, "globalMessages", docId);
                const snap = await getDoc(msgRef);
                if (snap.exists()) {
                    await updateDoc(msgRef, {
                        [\`reactions.\${emoji}\`]: arrayUnion(user.username)
                    });
                }
            } catch (e) {
                console.error("Error updating reaction in Firestore:", e);
            }
        });
    }
    if (socket) {
        socket.emit("message_reaction", { msgId, emoji, activeChat, docId, username: user.username });
    }
  };`;

if (code.includes('const handleReaction = async')) {
    // Regex replace because there might be slight variations
    const regex = /const handleReaction = async \([^]*?socket\.emit\("message_reaction"[^]*?\}\n  \};/;
    code = code.replace(regex, newReaction.trim());
}

// Update socket listener
const socketListenerOld = `    socket.on("message_reaction", (data: { msgId: string, docId?: string, emoji: string, activeChat: string }) => {
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
    });`;

const socketListenerNew = `    socket.on("message_reaction", (data: { msgId: string, docId?: string, emoji: string, activeChat: string, username: string }) => {
      setMessages(prev => prev.map(m => {
        if ((m.id && m.id === data.msgId) || (m.docId && m.docId === data.docId)) {
          const currentReactions = m.reactions || {};
          const reactionUsers = Array.isArray(currentReactions[data.emoji]) ? currentReactions[data.emoji] : [];
          if (!reactionUsers.includes(data.username)) {
              return {
                ...m,
                reactions: {
                  ...currentReactions,
                  [data.emoji]: [...reactionUsers, data.username]
                }
              };
          }
        }
        return m;
      }));
    });`;

code = code.replace(socketListenerOld, socketListenerNew);

fs.writeFileSync('src/App.tsx', code);
