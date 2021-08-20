var PidInterface = require('../models/pid_interface.model')

module.exports.list = function(req, res) {
	//let user = req.userId;
	console.log("==============")
	//console.log("user = " + user)
	//console.log(req)
	PidInterface.find().then(function(tags){
		res.render('admin/pid_interface/list', {
			tags: tags
		});
	});
};

module.exports.getAdd = function(req, res) {
	console.log('Hello')
	res.render('admin/pid_interface/add', {
		
	});
};

module.exports.postAdd = function(req, res) {
	PidInterface.insertMany(req.body, function(err) {
		if (err) return handleError(err);
	});
	res.redirect('/admin/pid-interface');
};

module.exports.getEdit = function(req, res) {
	var id = req.params.id;
	PidInterface.findById(id).then(function(tag){
		res.render('admin/pid_interface/edit', {
			tag: tag
		});
	});
};

module.exports.postEdit = function(req, res) {
	var query = {"_id": req.params.id};
	var data = {
		"name" : req.body.name,
    "isBgColor" : req.body.isBgColor,
    "note" : req.body.note,
	}
	PidInterface.findOneAndUpdate(query, data, {'upsert':true}, function(err, doc){
	    if (err) return res.send(500, { error: err });
	    res.redirect('/admin/pid-interface');
	});

};

module.exports.getDelete = function(req, res) {
	var id = req.params.id;
	Station.findByIdAndDelete(id, function(err, doc){
	    if (err) return res.send(500, { error: err });
	    res.redirect('/admin/station');
	});

};