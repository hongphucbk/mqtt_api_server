var mongoose = require('mongoose');
var datatestSchema = new mongoose.Schema({
	val: Object,
});

var Datatest = mongoose.model('Datatest', datatestSchema, 'datatest');

module.exports = Datatest;