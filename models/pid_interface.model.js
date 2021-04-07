var mongoose = require('mongoose');
var pidInterfaceSchema = new mongoose.Schema({
	name: String,
	isBgColor: Number,
	
	note: String,
});

var PidInterface = mongoose.model('PidInterface', pidInterfaceSchema, 'pid_interface');

module.exports = PidInterface;