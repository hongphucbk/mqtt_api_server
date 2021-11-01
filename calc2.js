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
const LoadWStationData = require('./models/LoadWStationData')

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
    let start = moment().subtract(22, 'hours').startOf('days')

    let stations = await Station.find({is_active: 1});
    for (let j = 0; j < stations.length; j++) {
      let jsStation = {
        station: stations[j]._id,
        station_name : stations[j].name,
        timestamp : start,
        updated_at: new Date(),
        watts: []
      }
      
      jsStation.watts = await getLoadW(stations[j]._id, start.format('YYYY-MM-DD'))
      
      const filter = {timestamp: start, station: stations[j]._id};
      const update = jsStation;

      let doc = await LoadWStationData.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true  // Make this update into an upsert
      });
    }
  }catch(error){
    console.log(error.message)
  }
}


async function getLoadW(station, date){
  let start = moment(date).startOf('day')
  let end = moment(date).endOf('day')

  let data = []

  hisStations = await StationData.find({  station: station, 
                                      timestamp: {$gte: start, $lte: end } 
                                  })      
  for (let j = 0; j < 288; j++) {
    sum = 0, count = 0, avg = 0
    let start1 = moment(start).startOf('minute')
    let end1 = moment(start).add(5, 'minutes').startOf('minute')
    let a1 = hisStations.map(x => {
      if (x.timestamp <= end1 && x.timestamp >= start1) {
        sum +=  x.load_w
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

setInterval(function(){
  StoredLoadWStationData()
}, parseInt(5000)); // 10 minutes
