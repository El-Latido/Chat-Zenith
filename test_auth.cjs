const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  socket.emit("register_or_login", { username: "TestUser123", password: "password123", timezone: "America/Los_Angeles" }, (res) => {
      console.log('Auth result:', res);
      if (res.success) {
         socket.emit("send_global", {
             sender: "TestUser123",
             text: "@Elizabeth hola de nuevo, dime algo corto"
         });
      } else {
         console.log("Auth failed");
         process.exit(1);
      }
  });
});

socket.on("receive_global", (msg) => {
    console.log("Global msg:", msg);
    if (msg.sender === "Elizabeth") {
        console.log("Got response!");
        process.exit(0);
    }
});
setTimeout(() => {
    console.log("Timeout!");
    process.exit(1);
}, 10000);
