var mongoose = require('mongoose');
var deviceSchema = new mongoose.Schema({
	name: String,
	description: String,
	station: String,
	active: Number,
	information: String,
	note: String,
});

var Device = mongoose.model('Device', deviceSchema, 'devices');

module.exports = Device;