const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('const activeChatRef = useRef(activeChat);')) {
    const target1 = `const [activeChat, setActiveChat] = useState('global');`;
    const rep1 = `const [activeChat, setActiveChat] = useState('global');
  const activeChatRef = useRef(activeChat);
  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);`;
    code = code.replace(target1, rep1);

    const target2 = `    socket.on('receive_global', (msg: any) => {
      // If we are not in global chat, we shouldn't append it to the current messages view
      if (activeChat !== 'global') {
          return;
      }`;
    const rep2 = `    socket.on('receive_global', (msg: any) => {
      // If we are not in global chat, we shouldn't append it to the current messages view
      if (activeChatRef.current !== 'global') {
          return;
      }`;
    code = code.replace(target2, rep2);

    const target3 = `    socket.on('receive_private', (msg: any, fromUser: string) => {
      playNotifySound();
      if (activeChat !== fromUser) {`;
    const rep3 = `    socket.on('receive_private', (msg: any, fromUser: string) => {
      playNotifySound();
      if (activeChatRef.current !== fromUser) {`;
    code = code.replace(target3, rep3);

    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched activeChatRef");
} else {
    console.log("Already patched");
}
