var User = require('../models/user.model')


module.exports.requireAuth = async function(req, res, next){
	if (!req.cookies.userId) {
		res.redirect('/auth/login');
		return;
	}

	let user = await User.findById(req.cookies.userId);
	if (!user) {
		res.render('auth/login');
		return;
	};
	
	res.locals.user = user;
	console.log("user = " + user)
	next();


};