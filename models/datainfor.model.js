var mongoose = require('mongoose');
var dataInfoSchema = new mongoose.Schema({
	station: String,
	type: String,
	tag: String,
	value: Object,
	timestamp: Date,
	flag: Number,
});

var DataInfor = mongoose.model('DataInfor', dataInfoSchema, 'data_information');

module.exports = DataInfor;