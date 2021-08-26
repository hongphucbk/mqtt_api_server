var nodemailer =  require('nodemailer'); // khai báo sử dụng module nodemailer
const path = require('path');

module.exports.sendMail = function(req, res) {
    let station_id = req.body.site_id
    let station_name = req.body.site_name
    let email_to = req.body.email_to //['phuchong94@gmail.com', 'phuctruongdev@gmail.com']
    let email_cc = req.body.email_cc //['phuchong94@gmail.com', 'phuctruongdev@gmail.com']
    let file_name = req.body.file_name

    //console.log(station_id, station_name, file_name)
    //res.send(req.body)
    //return

    //res.send(email)
    //return
	var transporter =  nodemailer.createTransport({ // config mail server
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD //'Vietnam123!@#'
        }
    });
    var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
        from: 'NTV Solar',
        to: email_to,
        cc: email_cc,
        subject: 'NTV Solar - Báo cáo năng lượng - ' + station_name,
        text: 'You recieved message from NTV',
        html: `Chào bạn, <br>Báo cáo năng lượng solar <br>NTV Solar Team`,
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
