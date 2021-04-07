//var Station = require('../models/station.model');
var nodemailer =  require('nodemailer'); // khai báo sử dụng module nodemailer

module.exports.list = function(req, res) {
	var transporter =  nodemailer.createTransport({ // config mail server
        service: 'Gmail',
        auth: {
            user: 'mqttserver01@gmail.com',
            pass: 'Vietnam123!@#'
        }
    });
    var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
        from: 'Phuc Truong',
        to: 'phuchong94@gmail.com',
        subject: 'Test Nodemailer',
        text: 'You recieved message from Phuc',
        html: '<p>You have got a new message</b><ul><li>Username:' + "Phuc" + '</li><li>Email:' + "Phuc" + '</li><li>Username:' + "Message" + '</li></ul>'
    }
    transporter.sendMail(mainOptions, function(err, info){
        if (err) {
            console.log(err);
            res.redirect('/');
        } else {
            console.log('Message sent: ' +  info.response);
            res.redirect('/users');
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