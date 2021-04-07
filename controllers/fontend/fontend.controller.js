let Station = require('../../models/station.model')
var Parameter = require('../../models/parameter.model')
var DataInfor = require('../../models/datainfor.model')
var StationPara = require('../../models/station_para.model')

module.exports.getIndex = async function(req, res) {
	let stations = await Station.find({ is_main: null });
	let main_station = await Station.findOne({ is_main: 1 });
	res.render('fontend/overview', {
		stations: stations,
		main_station: main_station
	})
};

module.exports.getMetering = async function(req, res) {
	var id = req.params.station_id;
	let station = await Station.findById(id);
	let parameters = await Parameter.find();

	StationPara.find({station: id})
						 .populate('parameter')
						 .populate('station')
						 .sort({ priority: 'asc' })
		.exec(function (err, paras) {
	    if (err) return handleError(err);
	    //console.log(paras);
	    res.render('fontend/metering', {
	    	station_paras: paras,
				parameters: parameters,
				station: station 
			});
	});
}

module.exports.getPID = async function(req, res) {
	var id = req.params.station_id;
	let station = await Station.findById(id);
	let parameters = await Parameter.find();

	if (station.type == null) {
		res.send("Trạm chưa setting !!! Vui lòng quay lại " + "<a href='/'>Home</a>")
	}
	res.render('fontend/pid/'+ station.type, {
		parameters: parameters,
		station: station 
	});
}

module.exports.getOutlet = async function(req, res) {
	//var id = req.params.station_id;
	//let station = await Station.findById(id);
	//let parameters = await Parameter.find();

	res.render('fontend/outlet', {
				// parameters: parameters,
				// station: station 
	});
}

module.exports.getProcessFlowDiagram = async function(req, res) {
	//var id = req.params.station_id;
	//let station = await Station.findById(id);
	//let parameters = await Parameter.find();

	res.render('fontend/process_flow_diagram', {
				// parameters: parameters,
				// station: station 
	});
}

module.exports.getGCData = async function(req, res) {
	//var id = req.params.station_id;
	//let station = await Station.findById(id);
	//let parameters = await Parameter.find();
	let station = await Station.findOne({ is_main: 1 });
	res.render('fontend/lgds/gc_data',{
		station: station
	});
}

// module.exports.getDetail = async function(req, res) {
// 	var id = req.params.id;
// 	//Old function
// 		// Station.findById(id).then(function(station){
// 		// 	StationMeasurement.find({station: station.name}).then(function(station_measurements){
// 		// 		res.render('overview/detail', {
// 		// 			station: station,
// 		// 			station_measurements: station_measurements,
// 		// 			helper: require('../helpers/helper'),
// 		// 			abc: abc,

// 		// 		});
// 		// 	});
// 		// });

// 	let station = await Station.findById(id);
// 	let station_measurements = await StationMeasurement.find({station: station.name});
// 	console.log((station_measurements));
// 	res.render('overview/detail', {
// 		station: station,
// 		station_measurements: station_measurements,
// 		helper: require('../helpers/helper'),
// 		readName: readName,

// 	});
// };

// module.exports.getChart = function(req, res) {
// 	let id = req.params.id;
// 	Station.findById(id).then(function(station){
// 		res.render('overview/chart', {
// 			station: station
// 		});
// 	});
// };

// // module.exports.postAdd = function(req, res) {
// // 	console.log(req.body);
// // 	// or, for inserting large batches of documents
// // 	Station.insertMany(req.body, function(err) {
// // 		if (err) return handleError(err);
// // 	});
// // 	res.redirect('/station');
// // };

// function abc(measureName){
// 	getMeasureDesc(measureName).then(function(a){
// 		console.log("a = " + a.description)
// 		return a.description;
// 	})
// }

// async function getMeasureDesc(measureName) {
//     let temp = await readName(measureName);
//     console.log("Temp2 = " + temp)
//     return temp;
// };

// let readName = async(measureName) => {
// 	let temp = await Measurement.findOne({name: measureName});
// 	console.log(temp.description)
// 	return "a";
// };

// // let readName = async(measureName){
// // 	return new Promise(function(resolve, reject){
// // 		Measurement.findOne({name: measureName},function(err, measurement){
// // 			console.log("Temp1 = " + measurement)
// //     		if (err) {
// //     			reject(err);
// //     		} else {
// //     			resolve(measurement);
// //     		}
// //     	});
// // 	});	
// // };

// function getMeasureDesc1(measureName) {
//     	return 'a';
// };

