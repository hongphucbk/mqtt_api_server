var User = require('../models/User')
const err = require('../common/err')

module.exports.login = function(req, res) {
	res.render('admin/auth/login')
};

module.exports.postLogin = async function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	console.log(email)

	try {
        const user = await User.findByCredentials(email, password)
        
        if (user && user.code == 1) { //user
          return res.status(401).send(err.E40020)
        }

        if (user && user.code == 2) { //password
          return res.status(401).send(err.E40021)
        }

        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()

        //console.log(token)
        user.tokens = user.tokens.filter((tk) => {
            return tk.token == token
        })
        await user.save()
		res.cookie('userId', user.id);

		res.redirect('/member/report');
		return
        //console.log('-->', user.tokens)

        let jsonUser = {
          _id: user._id,
          name : user.name,
          email : user.email,
          role : user.role.toUpperCase()
        }
        res.send({ 'user': jsonUser, token })
    } catch (error) {
      res.status(400).send(err.E40001)
    }

	User.findOne({email: email}).then(async function(user){
		console.log('user: ' + user)
		if (!user) {
			res.render('auth/login',{
				errors: [
					'User does not exist.'
				]
			});
			return;
		}

		const isPasswordMatch = bcrypt.compare(user.password, password)

		if (!isPasswordMatch) {
			res.render('auth/login',{
				errors: [
					'Wrong password.'
				]
			});
			return;
		
		}

		res.cookie('userId', user.id);
		res.redirect('/users');

	});

	

	// var query = {"_id": req.params.id};
	// var data = {
	// 	"name" : req.body.name,
	//     "phone" : req.body.phone,
	//     "email" : req.body.email,
	//     "password" : req.body.password,
	//     "role" : parseInt(req.body.role)
	// }

	// console.log(query)
	// User.findOneAndUpdate(query, data, {'upsert':true}, function(err, doc){
	//     if (err) return res.send(500, { error: err });
	//     res.redirect('/users');
	// });

};

module.exports.apiPostLogin = function(req, res) {
	let user_id = req.cookies.userId ? req.cookies.userId : null;
	console.log(user_id)
	User.findOne({_id: user_id}).then(function(user){
		let result;
		if (!user) {
			result = {result: 0, username: 'Login'}
		}else{
			result = {result: 1, username: user.name, created_at: user.created_at}			
		}
		console.log(result)
		res.json(result);
	});

};

module.exports.logout = function(req, res) {
	

	if (req.cookies.userId) {
		res.clearCookie("userId");
		//res.end();
		res.redirect('/');
		return;
	}

	
	res.render('admin/auth/login')
};

module.exports.add = function(req, res) {
	User.find().then(function(users){
		res.render('users/add', {
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
	res.redirect('/users');
};

module.exports.getEdit = function(req, res) {
	var id = req.params.id;
	User.findById(id).then(function(user){
		res.render('users/edit', {
			user: user
		});
	});
};



module.exports.getDelete = function(req, res) {
	var id = req.params.id;
	User.findByIdAndDelete(id, function(err, doc){
	    if (err) return res.send(500, { error: err });
	    res.redirect('/users');
	});

};