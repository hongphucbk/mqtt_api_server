var mongoose = require('mongoose');
var gcParaSchema = new mongoose.Schema({
	code: String,
	name: String,
	maptag: String,
	station: {type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
	is_display: Number,
	priority: Number,
	note: String,
});

var GCParameter = mongoose.model('GCParameter', gcParaSchema, 'gc_parameter');

module.exports = GCParameter;