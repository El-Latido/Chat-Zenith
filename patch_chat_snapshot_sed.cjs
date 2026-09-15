const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  useEffect(() => {
    if (!isLoggedIn) return;
    let unsubMessages: any = null;
    
    if (activeChat === 'global') {`;

const rep = `  useEffect(() => {
    if (!isLoggedIn) return;
    let unsubMessages: any = null;
    
    setMessages([]);
    if (activeChat === 'global') {
        const q = query(collection(db, 'global_chat'), orderBy('timestamp', 'asc'), limitToLast(30));
        unsubMessages = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => {
                const data = doc.data();
                return { ...data, id: data.id || doc.id };
            });
            const filteredMsgs = msgs.filter((m: any) => {
                if (m.sender === 'Elizabeth' && (isGamesMenuOpenRef.current || activeChessGameRef.current)) {
                    return false;
                }
                return true;
            });
            setMessages(filteredMsgs);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });
    } else {
        const participants = [user.username, activeChat].sort();
        const convoId = participants.join("_");
        const q = query(collection(db, 'chats', convoId, 'messages'), orderBy('timestamp', 'asc'), limitToLast(30));
        unsubMessages = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => {
                const data = doc.data();
                return { ...data, id: data.id || doc.id };
            });
            setMessages(msgs);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });
    }
    
    return () => {
        if (unsubMessages) unsubMessages();
    };
  }, [isLoggedIn, activeChat, user.username]);

  useEffect(() => {
    if (!isLoggedIn) return;
    
    if (activeChat === 'global') {`;

if (code.includes(target)) {
    code = code.replace(target, rep);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched chat snapshot");
} else {
    console.log("Target not found");
}
