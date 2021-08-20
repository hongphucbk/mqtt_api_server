var StationMeasurement = require('../models/station_measurement.model')
var Station = require('../models/station.model')
var Measurement = require('../models/measurement.model')
var Device = require('../models/device.model')


module.exports.list = function(req, res) {
	Device.find().then(function(devices){
		//console.log(station_measurements)
		res.render('device/list', {
			devices: devices
		});
	});
};

module.exports.getAdd = function(req, res) {
	Station.find().then(function (stations) {
		res.render('device/add', {
				//station_measurements: station_measurements,
				stations: stations,
				
			});
	});	
};

module.exports.postAdd = function(req, res) {
	console.log(req.body);
	// or, for inserting large batches of documents
	Device.insertMany(req.body, function(err) {
		if (err) return handleError(err);
	});
	res.redirect('/device');
};

module.exports.getEdit = function(req, res) {
	var id = req.params.id;
	Device.findById(id).then(function(device){
		Station.find().then(function (stations) {
			res.render('device/edit', {
				device: device,
				stations: stations,
			});
		});	
	});
};

module.exports.postEdit = function(req, res) {
	var query = {"_id": req.params.id};
	var data = {
		"station" : req.body.station,
		"name" : req.body.name,
	    "description" : req.body.description,
	    "active" : req.body.active,
	    "information" : req.body.information,
	    "note" : req.body.note
	}
	console.log(query)
	Device.findOneAndUpdate(query, data, {'upsert':true}, function(err, doc){
	    if (err) return res.send(500, { error: err });
	    res.redirect('/device');
	});

};

// module.exports.getDelete = function(req, res) {
// 	var id = req.params.id;
// 	Measurement.findByIdAndDelete(id, function(err, doc){
// 	    if (err) return res.send(500, { error: err });
// 	    res.redirect('/station');
// 	});

// };