require('dotenv').config();
require('express-group-routes');
var moment = require('moment');

var bodyParser = require('body-parser')

const express = require('express')
//-------------------------------------------------------------------
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const User = require('./models/User')
const Station = require('./models/Station')
const auth = require('./middlewares/auth')
const role = require('./middlewares/role')
const Device = require('./models/Device')
const DeviceData = require('./models/DeviceData')
const HistoryDeviceData = require('./models/HistoryDeviceData')
const HistoryStationData = require('./models/HistoryStationData')
const WhDeviceData = require('./models/WhDeviceData')
const WDeviceData = require('./models/WDeviceData')
const LoadStationData = require('./models/LoadStationData')

let stationData = []
const StationData = require('./models/StationData')

async function CalcLoadWStation(){
  let a = await StationData.findOneAndUpdate({is_update: null},{is_update: 0}).exec()

  let station_data = await StationData.findOne({is_update: 0}).exec(); // {is_update: { $ne: null }}
  let kw = station_data.paras.filter((para) => para.name === 'kiloWatts')

  let devices = await Device.find({station: station_data.station})
  let arr_device = devices.map((device) => {
      return device._id
  })

  let start = moment(station_data.timestamp).subtract(30, 'seconds')
  let end = moment(station_data.timestamp).add(30, 'seconds')

  let strQuery = {  device: { $in: arr_device }, 
                    timestamp: {$gte: start, $lte: end }
                 }
  let device_data = await DeviceData.find(strQuery)
  

  let sum = 0
  
  let b = device_data.map((d) => {
    let Watts = d.paras.filter((para) => para.name === 'Watts')
    sum += Watts[0].value
    //console.log(Watts)
  })

  let total = sum + kw[0].value * 1000
  
  let infor = {
    sum : sum,
    consum : kw[0].value * 1000,
    total : total
  };

  let update = {infor: infor, 
                is_update: 1, 
                load_w : total,
                sum_w : infor.sum,
                consum_w : infor.consum
              }

  let result = await StationData.findOneAndUpdate({_id: station_data._id}, update).exec()
}


async function StoredLoadWStationData(){
  try{
    let start = moment().subtract(2, 'hours').startOf('days')

    let devices = await Device.find({is_active: 1});
    for (let j = 0; j < devices.length; j++) {
      let jsonDevice = {
        device: devices[j]._id,
        device_name : devices[j].name,
        station: devices[j].station,
        timestamp : start,
        updated_at: new Date(),
        watts: []
      }
      
      jsonDevice.watts = await getWatts(devices[j]._id, start.format('YYYY-MM-DD'))
      
      const filter = {timestamp: start, device: devices[j]._id};
      const update = jsonDevice;

      let doc = await WDeviceData.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true  // Make this update into an upsert
      });
    }
  }catch(error){
    //console.log(error.message)
  }
}

setInterval(function(){
  CalcLoadWStation()
}, parseInt(1000)); // 10 minutes
