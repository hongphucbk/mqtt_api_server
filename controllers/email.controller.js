var nodemailer =  require('nodemailer'); // khai báo sử dụng module nodemailer
const path = require('path');

module.exports.sendMail = function(req, res) {
	var transporter =  nodemailer.createTransport({ // config mail server
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: 'mqttserver01@gmail.com',
            pass: 'xxdmyaocbcmjsivc' //'Vietnam123!@#'
        }
    });
    var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
        from: 'Phuc Truong',
        to: 'phuchong94@gmail.com',
        subject: 'Báo cáo năng lượng',
        text: 'You recieved message from Phuc',
        html: 'Báo cáo năng lượng',
        attachments: [
            {
                'filename': 'a.xlsx',
                'path':  path.join(__dirname, '../exports/a.xlsx'),
                'contentType': 'application/pdf'
            },
            {
                'filename': 'b.xlsx',
                'path':  path.join(__dirname, '../exports/b.xlsx'),
                'contentType': 'application/pdf'
            }
        ]
    }
    transporter.sendMail(mainOptions, function(err, info){
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            console.log('Message sent: ' +  info.response);
            res.send('Send successed');
        }
    });
};

// module.exports.getDetail = function(req, res) {
// 	var id = req.params.id;
// 	Station.findById(id).then(function(station){
// 		res.render('overview/detail', {
// 			station: station
// 		});
// 	});
// };

// module.exports.postAdd = function(req, res) {
// 	console.log(req.body);
// 	// or, for inserting large batches of documents
// 	Station.insertMany(req.body, function(err) {
// 		if (err) return handleError(err);
// 	});
// 	res.redirect('/station');
// };