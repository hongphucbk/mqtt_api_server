var mongoose = require('mongoose');
var stationSchema = new mongoose.Schema({
	name: String,
	description: String,
	address: String,
	information: String,
	type: String,
	active: Number,
	is_main: Number,
	priority: Number,
	note: String,
	parameters: [{type: mongoose.Schema.Types.ObjectId}],
	gc_parameters: [{type: mongoose.Schema.Types.ObjectId}]
});

var Station = mongoose.model('Station', stationSchema, 'stations');

module.exports = Station;