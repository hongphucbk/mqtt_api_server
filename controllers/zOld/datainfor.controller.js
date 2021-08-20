let Station = require('../models/station.model')
var Parameter = require('../models/parameter.model')
var DataInfor = require('../models/datainfor.model')
var StationPara = require('../models/station_para.model')

module.exports.list = async function(req, res) {
	let stations = await Station.find({ active : 1 });
	res.render('admin/datainfor/list', {
		stations: stations
	});
};

module.exports.detail = async function(req, res) {
	var id = req.params.id;
	let station = await Station.findById(id);
	let parameters = await Parameter.find();

	StationPara.find({station: id})
						 .populate('parameter')
						 .populate('station')
						 .sort({ priority: 'asc' })
		.exec(function (err, paras) {
	    if (err) return handleError(err);
	    //console.log(paras);
	    res.render('admin/datainfor/detail', {
	    	station_paras: paras,
				parameters: parameters,
				station: station 
			});
					
  })
};

//No use
module.exports.detailold = async function(req, res) {
	var id = req.params.id;
	let station = await Station.findById(id);
	let parameters = await Parameter.find();

	res.render('admin/datainfor/detail', {
		parameters: parameters,
		station: station
	});
};

// module.exports.getAdd = function(req, res) {
// 	Measurement.find().then(function(measurements){
// 		res.render('admin/measurements/add', {
// 			measurements: measurements
// 		});
// 	});
// };

// module.exports.postAdd = function(req, res) {
// 	console.log(req.body);
// 	// or, for inserting large batches of documents
// 	Measurement.insertMany(req.body, function(err) {
// 		if (err) return handleError(err);
// 	});
// 	res.redirect('/measurement');
// };

// module.exports.getEdit = function(req, res) {
// 	var id = req.params.id;
// 	Measurement.findById(id).then(function(measurement){
// 		res.render('admin/measurements/edit', {
// 			measurement: measurement
// 		});
// 	});
// };

// module.exports.postEdit = function(req, res) {
// 	var query = {"_id": req.params.id};
// 	var data = {
// 		"name" : req.body.name,
// 	    "description" : req.body.description,
// 	    "group" : req.body.group,
// 	    "information" : req.body.information,
// 	    "note" : req.body.note
// 	}
// 	console.log(query)
// 	Measurement.findOneAndUpdate(query, data, {'upsert':true}, function(err, doc){
// 	    if (err) return res.send(500, { error: err });
// 	    res.redirect('/measurement');
// 	});

// };

// module.exports.getDelete = function(req, res) {
// 	var id = req.params.id;
// 	Measurement.findByIdAndDelete(id, function(err, doc){
// 	    if (err) return res.send(500, { error: err });
// 	    res.redirect('/station');
// 	});

// };