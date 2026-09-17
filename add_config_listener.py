import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

listener_hook = """  useEffect(() => {
    if (!activeChat || activeChat === "global" || activeChat.startsWith("room_")) {
      setChatConfig(null);
      return;
    }
    const participants = [user.username, activeChat].sort();
    const convoId = participants.join("_");
    const { doc, onSnapshot } = require("firebase/firestore");
    const unsub = onSnapshot(doc(db, "chats", convoId, "config", "settings"), (docSnap) => {
      if (docSnap.exists()) {
        setChatConfig(docSnap.data());
      } else {
        setChatConfig(null);
      }
    });
    return () => unsub();
  }, [activeChat, user.username]);
"""

# Insert before the messages useEffect
if "setChatConfig(null);" not in content:
    content = content.replace("  useEffect(() => {\n    if (!isLoggedIn) return;\n\n    socket.on(\n      \"dj_request_status\",", listener_hook + "\n  useEffect(() => {\n    if (!isLoggedIn) return;\n\n    socket.on(\n      \"dj_request_status\",")

with open('src/App.tsx', 'w') as f:
    f.write(content)
