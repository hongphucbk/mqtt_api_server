require('dotenv').config();
var moment = require('moment');
const express = require('express')
//-------------------------------------------------------------------
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, 
  {useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false});

const User = require('../../models/User')
const Station = require('../../models/Station')
const auth = require('../../middlewares/auth')
const role = require('../../middlewares/role')
const Device = require('../../models/Device')
const DeviceData = require('../../models/DeviceData')
const HistoryDeviceData = require('../../models/HistoryDeviceData')
const HistoryStationData = require('../../models/HistoryStationData')
const WhDeviceData = require('../../models/WhDeviceData')
const WDeviceData = require('../../models/WDeviceData')
const LoadStationData = require('../../models/LoadStationData')
const StationData = require('../../models/StationData')
const LoadWStationData = require('../../models/LoadWStationData')
const LoadWhStationData = require('../../models/LoadWhStationData')
const WhDeviceData3 = require('../../models/WhDeviceData3')
const WhStation3Price = require('../../models/WhStation3Price')

// Tính Load Kwh 
// Update vào bảng load_wh_station_data
// Hàng ngày

module.exports.calc_load_kwh_station = async function(){
  try{
    let start = moment().subtract(10, 'minutes').startOf('days')
    let end = moment().subtract(10, 'minutes').endOf('days')

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

      let _wh = await getTotalkWhStation(stations[j]._id, start);

      jsStation.kwh_iot = TotalWh * 1000
      jsStation.kwh_3 = _wh
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

// Tính total_kwh theo bảng Price
async function getTotalkWhStation(station, start) {
  // let devices = await Device.find({station: station})
  // let arr_device = devices.map((device) => {
  //     return device._id
  // })

  // let strQuery = {  device: { $in: arr_device }, 
  //                   timestamp: start
  //                }
  let strQuery = {
    station: station,
    timestamp: start
  }
  let sum = 0
  let price3 = await WhStation3Price.findOne(strQuery)
  if(price3){
    sum = price3.total_kwh ? price3.total_kwh : 0
  }
   
  return sum;
}


