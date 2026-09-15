const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const reactionMenuState = "const [reactionMenuId, setReactionMenuId] = useState<string | null>(null);\n  const reactionTimerRef = useRef<any>(null);\n";

code = code.replace("const [replyingTo, setReplyingTo] = useState<MessageObj | null>(null);", "const [replyingTo, setReplyingTo] = useState<MessageObj | null>(null);\n  " + reactionMenuState);

const handleReactionCode = `
  const handleReaction = async (msgId: string, docId: string | undefined, emoji: string) => {
      playReactionSound(emoji);
      setReactionMenuId(null);
      if (!docId) return;
      try {
          const path = activeChat === 'global' ? 'global_chat' : \`chats/\${[user.username, activeChat].sort().join('_')}/messages\`;
          const msgRef = doc(db, path, docId);
          await updateDoc(msgRef, {
              [\`reactions.\${user.username}\`]: emoji
          });
      } catch(e) { console.error(e); }
  };

  const EMOTICONS = ['❤️', '😂', '😮', '😢', '😡', '👍'];
`;

code = code.replace("const handleSendMessage = async () => {", handleReactionCode + "\n  const handleSendMessage = async () => {");

fs.writeFileSync('src/App.tsx', code);
