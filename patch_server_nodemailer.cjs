const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Add nodemailer import
if (!code.includes("import nodemailer")) {
  code = code.replace(
    'import { createServer } from "http";',
    'import { createServer } from "http";\nimport nodemailer from "nodemailer";\n'
  );
}

// 2. Add nodemailer config
if (!code.includes("const transporter = nodemailer.createTransport")) {
  code = code.replace(
    'const app = express();',
    `const app = express();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL || "",
    pass: process.env.SMTP_PASSWORD || ""
  }
});
`
  );
}

// 3. Update forgot_password_request
const oldForgotRequest = /socket\.on\("forgot_password_request", async \(username, callback\) => \{[\s\S]*?\}\);/;
const newForgotRequest = `socket.on("forgot_password_request", async (username, callback) => {
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

      if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
         return callback({ success: false, error: "El servidor no tiene configurado SMTP_EMAIL y SMTP_PASSWORD en sus variables de entorno." });
      }

      const code = Math.floor(1e5 + Math.random() * 9e5).toString();
      recoveryCodes[username] = code;

      try {
        await transporter.sendMail({
          from: process.env.SMTP_EMAIL,
          to: userEmail,
          subject: "ChatLiz - Código de Recuperación de Contraseña",
          text: \`Hola \${username},\\n\\nTu código de recuperación es: \${code}\\n\\nIngresa este código en ChatLiz para cambiar tu contraseña.\\nSi no solicitaste esto, puedes ignorar este correo.\\n\\n- El equipo de ChatLiz\`
        });
        callback({ success: true, message: "Código enviado" });
      } catch (e) {
        console.error("Mail error:", e);
        callback({ success: false, error: "Error al enviar el correo. Por favor contacta al administrador." });
      }
    });`;

code = code.replace(oldForgotRequest, newForgotRequest);

fs.writeFileSync('server.ts', code);
