var mongoose = require('mongoose');
var Paramneter = require('../models/parameter.model')
var GCParameter = require('../models/gc_parameter.model')
var Station = require('../models/station.model')

module.exports.list = function(req, res) {
	let notify = req.query.notify
	console.log(notify)
	GCParameter.find().then(function(stations){
		res.render('admin/gc_parameter/list', {
			stations: stations,
			gc_parameters: stations,
			notify: notify
		});
	});
};

module.exports.getAdd = async function(req, res) {
	let station = await Station.findOne({ is_main: 1 });

	res.render('admin/gc_parameter/add', {
		station: station
	});
	
};

module.exports.postAdd = async function(req, res) {
	
	let dt = {
		code: req.body.code,
		name: req.body.name,
		maptag: req.body.maptag,
		//gc_parameters: mongoose.Types.ObjectId(req.body.station_id),
		station: mongoose.Types.ObjectId(req.body.station_id),
		is_display: 1,
		priority: 200,
		note: req.body.note,
	}
	console.log("dt = " + dt);
	//req.body.station = 
	// or, for inserting large batches of documents
	await GCParameter.insertMany(dt, function(err, docs) {
		if (err) return handleError(err);
		console.log(docs);
		console.log(req.body.station_id);

		Station.findOneAndUpdate({_id:req.body.station_id}, {$push: {gc_parameters: docs[0]._id}}, function(err, doc){
			if (err) return handleError(err);

			res.redirect('/admin/gc-parameter/add');
		})
	});

};

module.exports.getEdit = function(req, res) {
	var id = req.params.id;
	GCParameter.findById(id).then(function(parameter){
		res.render('admin/gc_parameter/edit', {
			parameter: parameter
		});
	});
};

module.exports.postEdit = function(req, res) {
	var query = {"_id": req.params.id};
	var data = {
		"code" : req.body.code,
    "maptag" : req.body.maptag,
    "name" : req.body.name,
    is_display: req.body.is_display,
		priority: req.body.priority,
    "note" : req.body.note
	}
	console.log(query)
	GCParameter.findOneAndUpdate(query, data, {'upsert':true}, function(err, doc){
	    if (err) return res.send(500, { error: err });
	    res.redirect('/admin/gc-parameter');
	});

};

module.exports.getDelete = async function(req, res) {
	let station = await Station.findOne({ is_main: 1 });
	var id = req.params.id;
	Station.update({ _id: station.id }, { "$pull": { "gc_parameters": id }}, { safe: true, multi:true }, function(err, obj) {
    
    GCParameter.findByIdAndDelete(id, function(err, doc){
	    if (err) return res.send(500, { error: err });
	    let notify = 'Delete successfully';
	    let label = 'success'
	    res.redirect('/admin/gc-parameter?notify='+notify+'&label='+label);
		});

	});


	

};