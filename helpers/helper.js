var async = require('async');

var StationMeasurement = require('../models/station_measurement.model')
var Station = require('../models/station.model')
var Measurement = require('../models/measurement.model')

func = {
    sayhi: function(name) {
        return "Hello " + name;
    }, 
    foo: function(date) {
        //do somethings
    },    

    getMeasurementDescription:  async function(measureName){
    	var temp = await Measurement.findOne({name: measureName});
    	return temp2;
    },

    getMeasurementDescription1: function(measureName){
    	return getMeasurementDescription(measureName)
    },

};
module.exports = func;

// Station.findOne({name: stationName}).then(function(station){
//     		console.log(station);
// 			return station.description;
// 		});