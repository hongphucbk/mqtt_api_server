var mongoose = require('mongoose');
var parameterSchema = new mongoose.Schema({
	code: String,
	maptag: String,
	name: String,
	datainfo: Number,
	station: Object,
	priority: Number,
	note: String,
});

var Parameter = mongoose.model('Parameter', parameterSchema, 'parameter');

module.exports = Parameter;