var Station = require('../models/station.model');
var StationMeasurement = require('../models/station_measurement.model')
var Measurement = require('../models/measurement.model')

module.exports.list = function(req, res) {
	Station.find().then(function(stations){
		res.render('overview/list', {
			stations: stations
		})
	})
};

module.exports.maps = function(req, res) {
	Station.find().then(function(stations){
		res.render('overview/maps', {
			stations: stations
		})
	})
};

module.exports.getDetail = async function(req, res) {
	var id = req.params.id;
	//Old function
		// Station.findById(id).then(function(station){
		// 	StationMeasurement.find({station: station.name}).then(function(station_measurements){
		// 		res.render('overview/detail', {
		// 			station: station,
		// 			station_measurements: station_measurements,
		// 			helper: require('../helpers/helper'),
		// 			abc: abc,

		// 		});
		// 	});
		// });

	let station = await Station.findById(id);
	let station_measurements = await StationMeasurement.find({station: station.name});
	console.log((station_measurements));
	res.render('overview/detail', {
		station: station,
		station_measurements: station_measurements,
		helper: require('../helpers/helper'),
		readName: readName,

	});
};

module.exports.getChart = function(req, res) {
	let id = req.params.id;
	Station.findById(id).then(function(station){
		res.render('overview/chart', {
			station: station
		});
	});
};

// module.exports.postAdd = function(req, res) {
// 	console.log(req.body);
// 	// or, for inserting large batches of documents
// 	Station.insertMany(req.body, function(err) {
// 		if (err) return handleError(err);
// 	});
// 	res.redirect('/station');
// };

function abc(measureName){
	getMeasureDesc(measureName).then(function(a){
		console.log("a = " + a.description)
		return a.description;
	})
}

async function getMeasureDesc(measureName) {
    let temp = await readName(measureName);
    console.log("Temp2 = " + temp)
    return temp;
};

let readName = async(measureName) => {
	let temp = await Measurement.findOne({name: measureName});
	console.log(temp.description)
	return "a";
};

// let readName = async(measureName){
// 	return new Promise(function(resolve, reject){
// 		Measurement.findOne({name: measureName},function(err, measurement){
// 			console.log("Temp1 = " + measurement)
//     		if (err) {
//     			reject(err);
//     		} else {
//     			resolve(measurement);
//     		}
//     	});
// 	});	
// };

function getMeasureDesc1(measureName) {
    	return 'a';
};

