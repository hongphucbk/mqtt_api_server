require('dotenv').config();
require('express-group-routes');
var moment = require('moment'); // require

var bodyParser = require('body-parser')

const express = require('express')

//-------------------------------------------------------------------
var mongoose = require('mongoose');
//mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true});
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const User = require('./models/User')
const Station = require('./models/Station')
const auth = require('./middlewares/auth')
const role = require('./middlewares/role')
const Device = require('./models/Device')
const DeviceData = require('./models/DeviceData')
const HistoryDeviceData = require('./models/HistoryDeviceData')
const HistoryStationData = require('./models/HistoryStationData')

let stationData = []

// async function StoredDeviceData(){
//   try{
//     let start = moment().subtract(10, 'minutes').startOf('minute')
//     let end = moment().subtract(0, 'minutes').endOf('minute')
//     //console.log(start, end)
//     let devices = await Device.find();
//     //console.log('------------')
//     for (let j = 0; j < devices.length; j++) {
//       let jsonDevice = {
//         device: devices[j]._id,
//         paras: {
//           WH : 0, //kWh powerGenerated
//           Watts : 0, //power
//           workingHours : 0
//         }
//         //name: stations[j].name
//       }

//       let infors;
//       let data = []

//       let sum = 0
//       let count = 0
//       let avg = 0

//       infors = await DeviceData.find({ device: devices[j]._id, 
//                                        timestamp: {$gte: start, $lte: end } 
//                                     })

//       //console.log(devices[j].name, '-----------')
//       //console.log(infors)

//       // Watts
//       for (var i = 0; i < infors.length; i++) {
//         let Watts = infors[i].paras.filter(function(item){
//           return item.name == 'Watts'
//         })
//         sum += parseInt(Watts[0].value)
//         count = count + 1
//       }
//       if (count > 0) {
//         avg = sum/count
//       }else{
//         avg = 0
//       }
//       jsonDevice.paras.Watts = avg;

//       //WH
//       count = 0
//       sum = 0
//       for (var i = 0; i < infors.length; i++) {
//         let WH = infors[i].paras.filter(function(item){
//           return item.name == 'WH'
//         })
//         sum += parseInt(WH[0].value)
//         count = count + 1
//       }
//       if (count > 0) {
//         avg = sum/count
//       }else{
//         avg = 0
//       }
//       jsonDevice.paras.WH = avg;

//       //workingHours 
//       let nameplateWatts = devices[j].nameplateWatts
//       if (nameplateWatts > 0) {
//         jsonDevice.paras.workingHours = jsonDevice.paras.WH / nameplateWatts
//       }else{
//         jsonDevice.paras.workingHours = 0
//       }

//       jsonDevice.updated_at = new Date();

//       const filter = {timestamp: end, device: devices[j]._id};
//       const update = jsonDevice;

//       let doc = await HistoryDeviceData.findOneAndUpdate(filter, update, {
//         new: true,
//         upsert: true // Make this update into an upsert
//       });

//     }
//   }catch(error){
//     console.log(error.message)
//   }
// }

async function StoredStationDataManual(){
  try{
    // let start = moment().subtract(5, 'minutes').startOf('minute')
    // let end = moment().subtract(5, 'minutes').endOf('minute')
    
    let start =  moment('02-07-2021 10:00:00', "DD-MM-YYYY hh:mm:ss");
    let end =  moment('02-07-2021 10:10:00', "DD-MM-YYYY hh:mm:ss");

    console.log(start, end)
    //let start = moment().subtract(3, 'days').startOf('days')
    //let end = moment().subtract(3, 'days').endOf('days')

    let stations = await Station.find({is_active: 1});

    //console.log(stations)

    for (let j = 0; j < stations.length; j++) {
      let jsonStation = {
        station: stations[j]._id,
        paras: {
          WH : 0,   //kWh powerGenerated
          Watts : 0,    //Power W
          workingHours : 0
        }
        //name: stations[j].name,
      }

      let devices = await Device.find({ station: stations[j]._id })
      let ids = []
      devices.forEach(function(device){
        ids.push(device._id)
      })

      //console.log("--------------------")
      //console.log(ids)

      let infors;
      let Watts = 0;
      let WH = 0;
      let workingHours = 0

      infors = await HistoryDeviceData.find({ device: { $in: ids }, 
                                              timestamp: {$gte: start, $lte: end } 
                                          })

      for (var i = 0; i < infors.length; i++) {

        Watts += infors[i].paras.Watts
        console.log(Watts)
        WH += infors[i].paras.WH
        workingHours += infors[i].paras.workingHours
      }
        
      jsonStation.paras.Watts = Watts;
      jsonStation.paras.WH = WH;
      jsonStation.paras.workingHours = workingHours;
      
      jsonStation.updated_at = new Date();

      console.log(jsonStation)
      
      const filter = {timestamp: start, station: stations[j]._id};
      const update = jsonStation;

      // let doc = await HistoryStationData.findOneAndUpdate(filter, update, {
      //   new: true,
      //   upsert: true // Make this update into an upsert
      // });
    }
  }catch(error){
    console.log(error.message)
  }
}

//StoredStationDataManual()
