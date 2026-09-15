const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const searchState = `  const [outOfTokensAi, setOutOfTokensAi] = useState<string | null>(null);`;
const replaceState = `  const [outOfTokensAi, setOutOfTokensAi] = useState<string | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [isBannedListOpen, setIsBannedListOpen] = useState(false);
  const [bannedList, setBannedList] = useState<any[]>([]);`;
code = code.replace(searchState, replaceState);

const searchSocket = `    socket.on("active_users", (usersList: UserObj[]) => {`;
const replaceSocket = `    socket.on("banned_status", (data: {isBanned: boolean}) => {
      setIsBanned(data.isBanned);
      if (data.isBanned) {
         showToast("Has sido baneado. No podrás escribir.", "error");
      } else {
         showToast("Has sido desbaneado.", "success");
      }
    });
    
    socket.on("system_message", (data) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: data.text,
            sender: "Sistema",
            timestamp: new Date().toISOString()
        }]);
    });

    socket.on("active_users", (usersList: UserObj[]) => {`;
code = code.replace(searchSocket, replaceSocket);

const searchInput1 = `                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}`;
const replaceInput1 = `                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  disabled={isBanned}
                  placeholder={isBanned ? "Estás baneado. No puedes escribir." : "Escribe un mensaje..."}`;
code = code.replace(searchInput1, replaceInput1);

const searchInput2 = `                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}`;
const replaceInput2 = `                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      disabled={isBanned}
                      placeholder={isBanned ? "Estás baneado." : (activeChat === "global" ? "Mensaje global..." : \`Mensaje a \${activeChat}...\`)}`;
code = code.replace(searchInput2, replaceInput2);

fs.writeFileSync('src/App.tsx', code);
