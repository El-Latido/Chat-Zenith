const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldSockets = `    socket.on('active_users', (usersList: UserObj[]) => {`;
const newSockets = `    socket.on('llamada_entrante', (caller: string) => {
      setIncomingCall(caller);
    });

    socket.on('respuesta_llamada', (data: { responder: string, accepted: boolean }) => {
      if (data.accepted) {
          setActiveCall(data.responder);
          showToast(\`Llamada conectada con \${data.responder}\`, 'success');
      } else {
          showToast(\`\${data.responder} rechazó la llamada\`, 'error');
      }
    });

    socket.on('active_users', (usersList: UserObj[]) => {
      socket.emit('check_pending_calls');`;

code = code.replace(oldSockets, newSockets);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx sockets");
