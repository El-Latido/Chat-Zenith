require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

transporter.sendMail({
  from: process.env.SMTP_EMAIL,
  to: "fabiangamer587@gmail.com",
  subject: "Prueba desde AI Studio",
  text: "Hola! Si estás leyendo esto, el servidor de correo está funcionando perfectamente."
}).then(info => console.log("Sent:", info.messageId)).catch(err => console.error(err));
