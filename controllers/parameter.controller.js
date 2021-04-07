var Paramneter = require('../models/parameter.model')
var Station = require('../models/parameter.model')

module.exports.list = function(req, res) {
	Paramneter.find().then(function(stations){
		res.render('admin/parameter/list', {
			stations: stations
		});
	});
};

module.exports.getAdd = function(req, res) {
	Paramneter.find().then(function(stations){
		res.render('admin/parameter/add', {
			stations: stations
		});
	});
};

module.exports.postAdd = function(req, res) {
	console.log(req.body);
	// or, for inserting large batches of documents
	Paramneter.insertMany(req.body, function(err) {
		if (err) return handleError(err);
	});
	res.redirect('/admin/parameter/add');
};

module.exports.getEdit = function(req, res) {
	var id = req.params.id;
	Paramneter.findById(id).then(function(parameter){
		res.render('admin/parameter/edit', {
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
	    "datainfo" : req.body.datainfo,
	    "note" : req.body.note
	}
	console.log(query)
	Paramneter.findOneAndUpdate(query, data, {'upsert':true}, function(err, doc){
	    if (err) return res.send(500, { error: err });
	    res.redirect('/admin/parameter');
	});

};

module.exports.getDelete = function(req, res) {
	var id = req.params.id;
	Station.findByIdAndDelete(id, function(err, doc){
	    if (err) return res.send(500, { error: err });
	    res.redirect('/admin/station');
	});

};