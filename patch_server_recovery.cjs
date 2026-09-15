const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /socket\.on\("forgot_password_request", async \(username, callback\) => \{[\s\S]*?if \(\!process\.env\.SMTP_EMAIL/g;
const replacement = `socket.on("forgot_password_request", async (data, callback) => {
      let username = data;
      let emailFromClient = "";
      if (typeof data === 'object') {
         username = data.username;
         emailFromClient = data.email;
      }
      
      let userEmail = "";
      if (fdb) {
        try {
          const d = await getDoc(doc(fdb, "users", username));
          if (d.exists()) {
             userEmail = d.data().securityEmail;
          }
        } catch(e) {}
      } else {
        userEmail = fallbackState.users[username]?.securityEmail;
      }
      
      if (!userEmail) {
        return callback({ success: false, error: "Este usuario no tiene configurado un correo de recuperación. Inicia sesión con la clave actual para agregar uno, o crea una nueva cuenta." });
      }
      
      if (emailFromClient && emailFromClient.toLowerCase() !== userEmail.toLowerCase()) {
         return callback({ success: false, error: "El correo ingresado no coincide con el correo asociado a este usuario." });
      }

      if (!process.env.SMTP_EMAIL`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
