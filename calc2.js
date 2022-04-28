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
const StationData = require('./models/StationData')
const LoadWStationData = require('./models/LoadWStationData')
const LoadWhStationData = require('./models/LoadWhStationData')
const WhDeviceData3 = require('./models/WhDeviceData3')
const WhStation3Price = require('./models/WhStation3Price')
const WStationData = require('./models/WStationData')


async function StoredWStation(date, station_id){
  try{
    let start = moment(date).subtract(2, 'hours').startOf('days')
    //let start = moment(date).startOf('day')
    let end = moment(date).endOf('day')


    let devices = await Device.find({ station: station_id, is_active: 1 })
    let ids = []
    devices.forEach(function(device){
      ids.push(device._id)
    })

    let data = []
    let sum = 0
    let count = 0
    let avg = 0

    device_datas = await DeviceData.find({ device: { $in: ids}, 
                                              timestamp: {$gte: start, $lte: end } 
                                            })
      
    for (let j = 0; j < 288; j++) {
      sum = 0, count = 0, avg = 0
      let start1 = moment(start).startOf('minute')
      let end1 = moment(start).add(5, 'minutes').startOf('minute')
      //console.log(start1, end1)
      device_datas.map(await function(item){
        if (item.timestamp <= end1 && item.timestamp >= start1) {
          let str_w = item.paras.filter(function(it){
            return it.name == 'Watts'
          })
          let watts = parseInt(str_w[0].value)
          sum +=  watts
          count++
        }
      })

      if (count > 0) {
        avg = sum
      }else{
        avg = 0
      }

      if (start1 > moment().subtract(10, 'minutes')) {
        avg = undefined
      }
      //console.log(j, '-->', start1.format('H:mm:ss'), end1.format('H:mm:ss'), avg, sum, count)
      data.push(avg)
      start = end1
    }

    return data

  }catch(error){
    //console.log(error.message)
  }
}
  
setInterval(async function(){
  let start = moment().startOf('days')
  let stations = await Station.find({is_active: 1})

  

  for (let i = 0; i < stations.length; i++) {
    const station = stations[i];
    
    let watts = await StoredWStation(start, station._id)

    let d = {
      station: station._id,
      station_name: station.name,
      watts: watts,
      timestamp: start,
      updated_at: new Date(),

    }

    const filter = {timestamp: start, station: station._id};
    const update = d;

    let doc = await WStationData.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true  // Make this update into an upsert
    });
  }
  
}, parseInt(10000)); // 1 minutes
  
