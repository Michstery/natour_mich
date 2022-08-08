const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url){
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = user.url;
    this.from = `Mich <${process.env.EMAIL_FROM}>`;
  }

  // 1) create Transporter
  newTransport() {
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
  async send(template, subject) {
    // i) render HTML Based on template = pug 
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    })

    // ii) define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    // iii) create a transport and send email
    await this.newTransport().sendMail(mailOptions);

  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome To The MichNatours Family!')
  }

};
