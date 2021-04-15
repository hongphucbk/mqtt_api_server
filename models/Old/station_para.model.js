var mongoose = require('mongoose');
var stationParaSchema = new mongoose.Schema({
	station: {type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
	parameter: {type: mongoose.Schema.Types.ObjectId, ref: 'Parameter' },
	maptag: String,
	priority: Number,
	active: Number,
	note: String,

});

var StationPara = mongoose.model('StationPara', stationParaSchema, 'station_para');

module.exports = StationPara;