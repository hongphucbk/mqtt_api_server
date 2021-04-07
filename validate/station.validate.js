module.exports.postAdd = function(req, res, next) {
	var errors = [];

	if (!req.body.name) {
		errors.push('Name is required');
	}

	if (!req.body.description) {
		errors.push('Description is required');
	}

	if (errors.length) {
		res.render('stations/add', {
			errors: errors,
			values: req.body
		});
		return;
	}
	next();
}