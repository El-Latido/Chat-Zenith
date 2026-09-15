const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected!');
  socket.emit('chatMessage', {
     sender: 'TestUser',
     text: 'Hola Elizabeth',
     id: Date.now().toString(),
     createdAt: Date.now()
  });
});

socket.on('receive_global', (msg) => {
  console.log('Received:', msg);
  if (msg.sender === 'Elizabeth') {
     console.log('Success!');
     process.exit(0);
  }
});
