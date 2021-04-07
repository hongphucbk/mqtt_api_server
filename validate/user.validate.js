module.exports.postAdd = function(req, res, next) {
	var errors = [];

	if (!req.body.name) {
		errors.push('Name is required');
	}

	if (!req.body.phone) {
		errors.push('Phone is required');
	}

	if (errors.length) {
		res.render('users/add', {
			errors: errors,
			values: req.body
		});
		console.log(errors)
		return;
	}
	next();
}