const nodemailer = require('nodemailer')

const sendMail = (from, to, subject, htmlContent, attachments, cc = null, bcc=null) => {
  const transporter =  nodemailer.createTransport({ // config mail server
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD //'Vietnam123!@#'
    }
  });
 
  const options = {
    from: from, // địa chỉ admin email bạn dùng để gửi
    to: to, // địa chỉ gửi đến
    cc: cc,
    bcc: bcc,
    subject: subject, // Tiêu đề của mail
    html: htmlContent, // Phần nội dung mail mình sẽ dùng html thay vì thuần văn bản thông thường.
    attachments: attachments
  }
 
   return transporter.sendMail(options)
}
 
 module.exports = {
   sendMail: sendMail
 }