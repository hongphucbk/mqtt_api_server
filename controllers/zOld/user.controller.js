var User = require('../models/user.model')

// module.exports.index = function(req, res) {
// 	res.render('users/list')
// };

module.exports.list = function(req, res) {
	User.find().then(function(users){
		res.render('admin/users/list', {
			users: users
		});
	});
};

module.exports.add = function(req, res) {
	User.find().then(function(users){
		res.render('admin/users/add', {
			users: users
		});
	});
};

module.exports.postAdd = function(req, res) {
	console.log(req.body);
	// or, for inserting large batches of documents
	User.insertMany(req.body, function(err) {
		if (err) return handleError(err);
	});
	res.redirect('/admin/users');
};

module.exports.getEdit = function(req, res) {
	var id = req.params.id;
	User.findById(id).then(function(user){
		res.render('admin/users/edit', {
			user: user
		});
	});
};

module.exports.postEdit = function(req, res) {
	var query = {"_id": req.params.id};
	var data = {
		"name" : req.body.name,
	    "phone" : req.body.phone,
	    "email" : req.body.email,
	    "password" : req.body.password,
	    "role" : parseInt(req.body.role)
	}

	console.log(query)
	User.findOneAndUpdate(query, data, {'upsert':true}, function(err, doc){
	    if (err) return res.send(500, { error: err });
	    res.redirect('/admin/users');
	});

};

module.exports.getDelete = function(req, res) {
	var id = req.params.id;
	User.findByIdAndDelete(id, function(err, doc){
	    if (err) return res.send(500, { error: err });
	    res.redirect('/admin/users');
	});

};