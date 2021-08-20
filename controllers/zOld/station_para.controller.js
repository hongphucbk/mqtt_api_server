var StationPara = require('../models/station_para.model')
var Station = require('../models/station.model')
var Measurement = require('../models/parameter.model')
var Parameter = require('../models/parameter.model')
var mongoose = require('mongoose');

module.exports.getStation = async function(req, res) {
	let stations = await Station.find({active: 1});
		//console.log(station_measurements)
	res.render('admin/station_para/station', {
		stations: stations
	});
};

// module.exports.getList2 = async function(req, res) {
// 	var id = req.params.id;
// 	let station = await Station.findById(id);
	
// 	let parameters = await Parameter.find();

// 	let a = await Station.aggregate([{
// 		$lookup: {
// 	  	from: "station_para",
// 	  	localField: "parameters",
// 	  	foreignField: "_id",
// 	  	as :"KQ"
// 	  }},
// 	  { 
// 	  	$match : {
// 	  		active : 1,
// 	  		_id : mongoose.Types.ObjectId(id)

// 	  	}
// 	  }
// 	], function(err, data){
// 		if (err) {
// 			res.json({kq: 0, mess: err})
// 		}

// 		let station_para = data
// 		res.render('admin/station_para/list', {
// 			station: station,
// 			station_para,
// 			station_paras : data[0].KQ
// 		});

// 	});
// };

module.exports.getList = async function(req, res) {
	var id = req.params.id;
	let station = await Station.findById(id);
	let parameters = await Parameter.find();

	StationPara.find({station: id}).populate('parameter').populate('station').sort({ priority: 'asc' }).exec(function (err, data) {
    if (err) return handleError(err);
    console.log(data);
    res.render('admin/station_para/list', {
			station: station,
			station_para : data
		});
  });
};


module.exports.getAdd = async function(req, res) {
	var station_id = req.params.id;
	let station = await Station.findById(station_id);
	let parameters = await Parameter.find();

	let station_paras = await StationPara.find({station: station_id});
	console.log(station_paras)
	res.render('admin/station_para/add', {
		station,
		parameters,
		station_paras
	});
};

module.exports.postAdd = async function(req, res) {
	var station_id = req.params.id;
	let data = {
		station: mongoose.Types.ObjectId(station_id),
		parameter: mongoose.Types.ObjectId(req.body.parameter_id),
		maptag: req.body.maptag,
		priority: req.body.priority,
		active: req.body.active,
		note: req.body.note,
	}
	console.log(data);
	// or, for inserting large batches of documents
	await StationPara.insertMany(data, function(err, docs) {
		if (err) return handleError(err);
		console.log("docs = " + docs)
		Station.findOneAndUpdate({_id:station_id}, {$push: {parameters: docs[0]._id}}, function(err){
			if (err) return handleError(err);
		})

	});
	res.redirect('/admin/station-para/'+ station_id + '/add');
};

module.exports.getEdit = async function(req, res) {
	let station_id = req.params.station_id;
	let station_para_id = req.params.id;

	let station = await Station.findById(station_id);
	let parameters = await Parameter.find();
	let station_paras = await StationPara.find({station: station_id});
	let station_para = await StationPara.findOne({_id: station_para_id})

	console.log("station_paras = " + station_paras)

	console.log(station_para)
	res.render('admin/station_para/edit', {
		station,
		parameters,
		station_paras,
		station_para
	});
};

module.exports.postEdit = async function(req, res) {
	var station_id = req.params.station_id;
	let parameter_id = req.body.parameter_id;
	let data = {
		station: mongoose.Types.ObjectId(station_id),
		//parameter: mongoose.Types.ObjectId(parameter_id),
		maptag: req.body.maptag,
		priority: req.body.priority,
		active: req.body.active,
		note: req.body.note,
	}
	console.log(data);
	// or, for inserting large batches of documents
	await StationPara.findOneAndUpdate({"_id": req.params.id}, data, function(err, docs) {
		if (err) return handleError(err);
		console.log("Update sucessfully. docs = " + docs)
		// Station.findOneAndUpdate({_id:station_id}, {$push: {parameters: docs[0]._id}}, function(err){
		// 	if (err) return handleError(err);
		// })

	});
	res.redirect('/admin/station-para/'+ station_id);
};


// module.exports.getEditOld = function(req, res) {
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

// module.exports.postEditOld = function(req, res) {
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

module.exports.getDelete = function(req, res) {
	let station_id = req.params.station_id;
	var id = req.params.id;
	StationPara.findByIdAndDelete(id, function(err, doc){
	    if (err) return res.send(500, { error: err });
	    res.redirect('/admin/station-para/'+ station_id);
	});

};