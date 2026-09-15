const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Insert global settings variable near the top where fallbackState is
const stateRegex = /let fallbackState = \{/;
code = code.replace(stateRegex, `let globalShaders = [];\nlet fallbackState = {`);

// Add socket.on for updating shaders in connection block
const ioRegex = /socket\.on\("update_profile",/;
code = code.replace(ioRegex, `socket.on("update_shaders", (shaders) => {
      globalShaders = shaders;
      io.emit("shaders_updated", globalShaders);
    });
    
    socket.emit("shaders_updated", globalShaders);
    
    socket.on("update_profile",`);

fs.writeFileSync('server.ts', code);
console.log("Patched server with globalShaders");
