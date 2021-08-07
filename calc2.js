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

let stationData = []

async function StoredWDeviceData(){
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

async function getWatts(device, date){
  let start = moment(date).startOf('day')
  let end = moment(date).endOf('day')

  let data = []

  hisStations = await HistoryDeviceData.find({  device: device, 
                                                timestamp: {$gte: start, $lte: end } 
                                            })      
  for (let j = 0; j < 288; j++) {
    sum = 0, count = 0, avg = 0
    let start1 = moment(start).startOf('minute')
    let end1 = moment(start).add(5, 'minutes').startOf('minute')
    let a1 = hisStations.map(x => {
      if (x.timestamp <= end1 && x.timestamp >= start1) {
        sum +=  x.paras.Watts
        count++
        if (count > 0) {
          avg = sum/count
        }else{
          avg = 0
        }
      }
      return avg
    })

    //console.log(j, '-->', start1.format('H:mm:ss'), end1.format('H:mm:ss'), avg)
    data.push(avg)
    start = end1
  }
  return data;
}


//----------------------------------------------------
let from
let to
let now

setInterval(function(){
  from = moment().endOf('days').add(1, 'minutes')
  to   = moment().endOf('days').add(40, 'minutes')
  now  = moment()

  if (now > from && now < to) {
    StoredWDeviceData()
  }
}, parseInt(10 * 60000)); // 10 minutes
