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
const LoadWhStationData = require('./models/LoadWhStationData')

async function StoredLoadkWhStationData(){
  try{
    let start = moment().subtract(2, 'minutes').startOf('days')
    let end = moment().subtract(2, 'minutes').endOf('days')

    let stations = await Station.find({is_active: 1});
    for (let j = 0; j < stations.length; j++) {
      let jsStation = {
        station: stations[j]._id,
        station_name : stations[j].name,
        timestamp : start,
        infors: []
      }

      let infors = await StationData.find({ station: stations[j]._id, 
                                       timestamp: {$gte: start, $lte: end } 
                                    })

      let TotalWh = 0
      let minWh = 9000000000
      let maxWh = 0
      let minAt
      let maxAt
      infors.map(await function(item){
        let strWh = item.paras.filter(function(it){
          return it.name.toUpperCase() == 'KWH'
        })
        let WH = parseInt(strWh[0].value)
        if (WH > 0) {
          // if (WH < minWh) {
          //   console.log("-->", minWh, strWh, WH, item.timestamp)
          // }
          minWh = WH < minWh ? WH : minWh
          maxWh = WH > maxWh ? WH : maxWh
          if (WH < minWh) {
            minAt = new Date()
          }
          if (WH > maxWh) {
            maxAt = new Date()
          }
        }
      })

      TotalWh = maxWh > minWh ?  maxWh - minWh : 0

      let _wh = await getTotalLoadkWhStation(stations[j]._id, start);

      jsStation.load_kwh = TotalWh * 1000 + _wh

      jsStation.infors = [
        {min: minWh, minAt: minAt, max: maxWh, maxAt: maxAt, wh: _wh, load: TotalWh * 1000, load_kwh: jsStation.load_kwh, unit: "Wh"  }
      ]
      jsStation.updated_at = new Date();
      const filter = {timestamp: start, station: stations[j]._id};
      const update = jsStation;

      let doc = await LoadWhStationData.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true // Make this update into an upsert
      });

    }
  }catch(error){
    console.log(error)
  }
}

setInterval(function(){
  StoredLoadkWhStationData()
}, parseInt(10000));


async function getTotalLoadkWhStation(station, start) {
  let devices = await Device.find({station: station})
  let arr_device = devices.map((device) => {
      return device._id
  })

  let strQuery = {  device: { $in: arr_device }, 
                    timestamp: start
                 }
  let device_data = await WhDeviceData.find(strQuery)

  let sum = 0
  device_data.map((d) => {
    sum += d.wh
    //console.log(Watts)
  })
  return sum;
}