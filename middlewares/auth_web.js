const User = require('../models/User')
const err = require('../common/err')

module.exports.requireAuth = async function(req, res, next){
	if (!req.cookies.userId) {
		res.redirect('/member/auth/login');
		return;
	}

	let user = await User.findById(req.cookies.userId);
    if (!user) {
        res.render('member/auth/login');
        return;
    };
	
    res.user = user
	//res.locals.user = "A";
	next();
};
