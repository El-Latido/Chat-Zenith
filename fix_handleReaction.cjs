const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

const i = lines.findIndex(l => l.includes('const handleSendMessage = () => {'));
if (i !== -1) {
    const fn = `  const handleReaction = async (msgId: string, docId: string | undefined, emoji: string) => {
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
    lines.splice(i, 0, fn);
}

fs.writeFileSync('src/App.tsx', lines.join('\n'));
