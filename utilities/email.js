const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(user, url){
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = user.url;
    this.from = `Mich <${process.env.EMAIL_FROM}>`;
  }

  // 1) create Transporter
  createTransport() {
    if(process.env.NODE_ENV === 'production') {
      // sendgrid
      return 1;
    }
   
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure:true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // 2) send the actual Email
  send(template, subject) {
    // i) render HTML Based on template = pug 

    // ii) define email options
    const mailOptions = {
      from: 'Mich <mich@michstery.io>',
      to: options.email,
      subject: options.subject,
      text: options.message
      // html:
    };

    // iii) create a transport and send email

  }

  sendWelcome() {
    this.send('welcome', 'Welcome To The MichNatours Family!')
  }

};

const sendEmail = async options => {


  // 2) Define the email options
  

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

