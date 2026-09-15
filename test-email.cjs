require('dotenv').config();
const nodemailer = require('nodemailer');

console.log("Email:", process.env.SMTP_EMAIL);
console.log("Pass exists:", !!process.env.SMTP_PASSWORD);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.log("Verify error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});
