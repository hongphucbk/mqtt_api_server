var PidInterface = require('../../models/pid_interface.model')
//var StationPara = require('../../models/station_para.model')

module.exports.getAllPidInterface = async function(req, res) {
	let allTags = await PidInterface.find();
	res.json(allTags)
};

// module.exports.postAllParameter = async function(req, res) {
// 	let station_id = req.body.station_id;
// 	console.log("api - station_id = ", station_id)
// 	//let parameters = await Paramneter.find({id: station_id});
// 	let station_paras = await StationPara.find({station: station_id}).sort({ priority: 'asc' });
// 	console.log("api - station_paras = ", station_paras)
// 	res.json(station_paras)
// };
// module.exports.create = async function(req, res) {
// 	console.log(req.body)
// 	let station_measurement = await StationMeasurement.insertMany(req.body)
// 	res.json(station_measurement)
// };

// module.exports.list = function(req, res) {
// 	Paramneter.find().then(function(stations){
// 		res.render('parameter/list', {
// 			stations: stations
// 		});
// 	});
// };

// module.exports.postAdd = function(req, res) {
// 	console.log(req.body);
// 	// or, for inserting large batches of documents
// 	StationMeasurement.insertMany(req.body, function(err) {
// 		if (err) return handleError(err);
// 	});
// 	res.redirect('/station_measurement');
// };

// module.exports.getEdit = function(req, res) {
// 	var id = req.params.id;
// 	StationMeasurement.findById(id).then(function(station_measurement){
// 		Station.find().then(function (stations) {
// 		//console.log(stations)
// 			Measurement.find().then(function(measurements){
// 				res.render('station_measurement/edit', {
// 					station_measurement: station_measurement,
// 					stations: stations,
// 					measurements: measurements
// 				});
// 			});
// 		});	
// 	});
// };

// module.exports.postEdit = function(req, res) {
// 	var query = {"_id": req.params.id};
// 	var data = {
// 		"station" : req.body.station,
// 	    "measurement" : req.body.measurement,
// 	    "unit" : req.body.unit,
// 	    "note" : req.body.note
// 	}
// 	console.log(query)
// 	StationMeasurement.findOneAndUpdate(query, data, {'upsert':true}, function(err, doc){
// 	    if (err) return res.send(500, { error: err });
// 	    res.redirect('/station_measurement');
// 	});

// };

// module.exports.getDelete = function(req, res) {
// 	var id = req.params.id;
// 	Measurement.findByIdAndDelete(id, function(err, doc){
// 	    if (err) return res.send(500, { error: err });
// 	    res.redirect('/station');
// 	});

// };