var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
	name: String,
	email: String,
	password: String,
	phone: String,
	role: Number
});

var User = mongoose.model('User', userSchema, 'users');

module.exports = User;