const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/UserPlus, AlertCircle, Bell/, "UserPlus, AlertCircle, Bell, PhoneCall");
const newImports = `import { CallModal } from './components/CallModal';
import { ActiveCallModal } from './components/ActiveCallModal';
import { ChessGameModal } from './components/ChessGameModal';`;
code = code.replace(/import \{ ChessGameModal \} from '\.\/components\/ChessGameModal';/, newImports);

// Also add state hooks
const hooks = `  const [incomingCall, setIncomingCall] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<string | null>(null);`;
code = code.replace(/const \[activeChat, setActiveChat\] = useState\('global'\);/, hooks + '\n  const [activeChat, setActiveChat] = useState("global");');

// We need to add socket listeners in the useEffect
// Wait, we already replaced the socket 'active_users' in the previous patch, let's see if it worked.

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx imports");
