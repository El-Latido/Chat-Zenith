const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const stateInjection = `  const [tfAnswers, setTfAnswers] = useState({ name: '', color: '', animal: '', fruit: '', thing: '' });
  const [toasts, setToasts] = useState<any[]>([]);

  useEffect(() => {
      if (toasts.length > 0) {
          const timer = setTimeout(() => setToasts(prev => prev.slice(1)), 5000);
          return () => clearTimeout(timer);
      }
  }, [toasts]);
`;

code = code.replace("  const [tfAnswers, setTfAnswers] = useState({ name: '', color: '', animal: '', fruit: '', thing: '' });", stateInjection);

const receivePrivateRegex = /    socket\.on\('receive_private', \(msg: any, fromUser: string\) => \{\n      playNotifySound\(\);\n      if \(activeChat !== fromUser\) \{\n        setUnreadPMs\(prev => \(\{ \.\.\.prev, \[fromUser\]: true \}\)\);/;

const receivePrivateReplacement = `    socket.on('receive_private', (msg: any, fromUser: string) => {
      playNotifySound();
      if (activeChat !== fromUser) {
        setUnreadPMs(prev => ({ ...prev, [fromUser]: true }));
        setToasts(prev => [...prev, { id: Date.now(), type: 'PM', sender: fromUser, text: msg.text || 'Nuevo audio/imagen' }]);`;

code = code.replace(receivePrivateRegex, receivePrivateReplacement);

fs.writeFileSync('src/App.tsx', code);
