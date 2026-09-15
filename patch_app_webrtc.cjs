const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Imports
const newImports = `import { CallModal } from './components/CallModal';
import { ActiveCallModal } from './components/ActiveCallModal';
import { OutgoingCallModal } from './components/OutgoingCallModal';
import { ChessGameModal } from './components/ChessGameModal';`;
code = code.replace(/import \{ CallModal \}.*import \{ ChessGameModal \} from '\.\/components\/ChessGameModal';/s, newImports);

// State hooks
const oldHooks = `  const [incomingCall, setIncomingCall] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<string | null>(null);`;
const newHooks = `  const [incomingCall, setIncomingCall] = useState<{username: string, profilePic: string} | null>(null);
  const [outgoingCall, setOutgoingCall] = useState<{username: string, profilePic: string} | null>(null);
  const [activeCall, setActiveCall] = useState<{partner: {username: string, profilePic: string}, isInitiator: boolean} | null>(null);`;
code = code.replace(oldHooks, newHooks);

// Sockets
const oldSockets = `    socket.on('llamada_entrante', (caller: string) => {
      setIncomingCall(caller);
    });

    socket.on('respuesta_llamada', (data: { responder: string, accepted: boolean }) => {
      if (data.accepted) {
          setActiveCall(data.responder);
          showToast(\`Llamada conectada con \${data.responder}\`, 'success');
      } else {
          showToast(\`\${data.responder} rechazó la llamada\`, 'error');
      }
    });`;
const newSockets = `    socket.on('llamada_entrante', (caller: {username: string, profilePic: string}) => {
      setIncomingCall(caller);
    });
    
    socket.on('llamada_cancelada', () => {
      setIncomingCall(null);
    });

    socket.on('respuesta_llamada', (data: { responder: string, profilePic: string, accepted: boolean }) => {
      if (data.accepted) {
          setOutgoingCall(null);
          setActiveCall({ partner: { username: data.responder, profilePic: data.profilePic }, isInitiator: true });
          showToast(\`Llamada conectada con \${data.responder}\`, 'success');
      } else {
          setOutgoingCall(null);
          showToast(\`\${data.responder} rechazó la llamada\`, 'error');
      }
    });
    
    socket.on('call_ended', () => {
        setActiveCall(null);
        showToast('Llamada finalizada', 'info');
    });`;
code = code.replace(oldSockets, newSockets);

// Modals
const oldModals = `      {incomingCall && (
        <CallModal 
            caller={incomingCall}
            onAccept={() => {
                socket.emit('responder_llamada', { targetUser: incomingCall, accepted: true });
                setActiveCall(incomingCall);
                setIncomingCall(null);
            }}
            onReject={() => {
                socket.emit('responder_llamada', { targetUser: incomingCall, accepted: false });
                setIncomingCall(null);
            }}
        />
      )}

      {activeCall && (
        <ActiveCallModal 
            partner={activeCall}
            onEndCall={() => {
                setActiveCall(null);
            }}
        />
      )}`;

const newModals = `      {incomingCall && (
        <CallModal 
            caller={incomingCall}
            onAccept={() => {
                socket.emit('responder_llamada', { targetUser: incomingCall.username, accepted: true });
                setActiveCall({ partner: incomingCall, isInitiator: false });
                setIncomingCall(null);
            }}
            onReject={() => {
                socket.emit('responder_llamada', { targetUser: incomingCall.username, accepted: false });
                setIncomingCall(null);
            }}
        />
      )}

      {outgoingCall && (
          <OutgoingCallModal
              partner={outgoingCall}
              onCancel={() => {
                  socket.emit('cancelar_llamada', outgoingCall.username);
                  setOutgoingCall(null);
              }}
          />
      )}

      {activeCall && (
        <ActiveCallModal 
            partner={activeCall.partner}
            isInitiator={activeCall.isInitiator}
            onEndCall={() => {
                setActiveCall(null);
            }}
        />
      )}`;
code = code.replace(oldModals, newModals);

// Initiating Call logic
const oldLlamar = `                                     socket.emit('iniciar_llamada', selectedUserModal.username);
                                     setSelectedUserModal(null);`;
const newLlamar = `                                     socket.emit('iniciar_llamada', selectedUserModal.username);
                                     setOutgoingCall({ username: selectedUserModal.username, profilePic: userObj?.profilePic || "" });
                                     setSelectedUserModal(null);`;
code = code.replace(oldLlamar, newLlamar);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx WebRTC");
