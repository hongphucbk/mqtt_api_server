var nodemailer =  require('nodemailer'); // khai báo sử dụng module nodemailer
const path = require('path');
const AutoEmail = require('../models/AutoEmail')

module.exports.sendMail = function(req, res) {
  let station_id = req.body.site_id
  let station_name = req.body.site_name
  let email_to = req.body.email_to //
  let email_cc = req.body.email_cc //['phuchong94@gmail.com', 'phuctruongdev@gmail.com']
  let file_name = req.body.file_name
  let is_auto = req.body.is_auto ? 1: 0;

	var transporter =  nodemailer.createTransport({ // config mail server
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD //'Vietnam123!@#'
        }
    });

  let strAuto = is_auto ? '<br>Đây là thư được gửi tự động hàng ngày.' : ''
  var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
      from: 'NTV Solar',
      to: email_to,
      cc: email_cc,
      subject: 'NTV Solar - Báo cáo năng lượng - ' + station_name,
      text: 'You recieved message from NTV',

      html: `
        Chào bạn, <br>
        NTV New Energy gửi bạn Báo cáo năng lượng solar. 
        <hr>
        <br>NTV New Energy.` + strAuto,

      attachments: [
          {
              'filename': file_name,
              'path':  path.join(__dirname, '../exports/' + file_name),
              'contentType': 'application/pdf'
          },
          // {
          //     'filename': 'a.xlsx',
          //     'path':  path.join(__dirname, '../exports/a.xlsx'),
          //     'contentType': 'application/pdf'
          // }
      ]
  }

  transporter.sendMail(mainOptions, function(err, info){
      if (err) {
          //console.log(err);
          res.send(err);
      } else {
          //console.log('Message sent: ' +  info.response);
          res.send('Send successed');
      }
  });
};

// Save config setting auto email
module.exports.postSaveAutoMail = async function(req, res){
  let station_id = req.body.site_id
  let email_to = req.body.email_to
  let range = req.body.range
  let is_active = req.body.is_active ? 1 : 0;

  let user = req.user;

  let json = {
    station : station_id,
    user : user,
    email_to : email_to,
    range : range,
    is_active : is_active,
    created_at : new Date()
  }
  console.log(req, json)

  const filter = {station: station_id, user: user._id};
  const update = json;

  let doc = await AutoEmail.findOneAndUpdate(filter, update, {
    new: true,
    upsert: true  // Make this update into an upsert
  });
  res.send(doc)

  return;

};

module.exports.getAutoMail = async function(req, res){
  let station_id = req.body.site_id
  let user = req.user

  const filter = {station: station_id, user: user._id};

  let result = await AutoEmail.findOne(filter);
  res.send(result)
  return;

};
