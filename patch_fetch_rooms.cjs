const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    } else {
      const participants = [user.username, activeChat].sort();`;

const replacement = `    } else if (activeChat.startsWith("room_")) {
      const q = query(
        collection(db, "custom_rooms_msgs", activeChat, "messages"),
        orderBy("timestamp", "asc"),
        limitToLast(500)
      );
      unsubMessages = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map((doc) => {
          const data = doc.data();
          return { ...data, id: data.id || doc.id, docId: doc.id };
        });
        setMessages(msgs);
        setTimeout(scrollToBottom, 100);
      });
    } else {
      const participants = [user.username, activeChat].sort();`;

code = code.replace(target, replacement);

const targetSend = `    if (activeChat === "global") {
      socket.emit("send_global", payload);`;
const replacementSend = `    if (activeChat.startsWith("room_")) {
      socket.emit("send_custom_room", { roomId: activeChat, msg: payload });
    } else if (activeChat === "global") {
      socket.emit("send_global", payload);`;

code = code.replace(targetSend, replacementSend);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched message fetching and sending for custom rooms");
