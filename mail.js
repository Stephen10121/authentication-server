require('dotenv').config();

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.mail.yahoo.com',
  port: 465,
  service:'yahoo',
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  },
  debug: false,
  logger: true
});

function sendMail(email, what) {
    transporter.sendMail({
        from: `"Your Name" ${email}`,
        to: process.env.MAIL_TO,
        subject: "Gruzservices Contact Form",
        text: `From: ${email}\nWhat: ${what}`
    }).then(info => {
        console.log({info});
    }).catch(console.error);
}
module.exports = {sendMail}