require('dotenv').config();
require('express-group-routes');
var moment = require('moment');

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
const WhDeviceData = require('./models/WhDeviceData')

let stationData = []

async function StoredDeviceData(){
  try{
    let start = moment().subtract(10, 'minutes').startOf('minute')
    let end = moment().subtract(0, 'minutes').endOf('minute')
    let devices = await Device.find({is_active: 1});
    for (let j = 0; j < devices.length; j++) {
      let jsonDevice = {
        device: devices[j]._id,
        paras: {
          WH : 0, //kWh powerGenerated
          Watts : 0, //power
          workingHours : 0
        }
      }

      let infors;
      let data = []

      let sum = 0
      let count = 0
      let avg = 0

      infors = await DeviceData.find({ device: devices[j]._id, 
                                       timestamp: {$gte: start, $lte: end } 
                                    })
      // Watts
      for (var i = 0; i < infors.length; i++) {
        let Watts = infors[i].paras.filter(function(item){
          return item.name == 'Watts'
        })
        sum += parseInt(Watts[0].value)
        count = count + 1
      }
      if (count > 0) {
        avg = sum/count
      }else{
        avg = 0
      }
      jsonDevice.paras.Watts = avg;

      //WH
      count = 0
      sum = 0
      for (var i = 0; i < infors.length; i++) {
        let WH = infors[i].paras.filter(function(item){
          return item.name == 'WH'
        })
        sum += parseInt(WH[0].value)
        count = count + 1
      }
      if (count > 0) {
        avg = sum/count
      }else{
        avg = 0
      }
      jsonDevice.paras.WH = avg;

      //workingHours 
      let nameplateWatts = devices[j].nameplateWatts
      if (nameplateWatts > 0) {
        jsonDevice.paras.workingHours = jsonDevice.paras.WH / nameplateWatts
      }else{
        jsonDevice.paras.workingHours = 0
      }

      jsonDevice.updated_at = new Date();

      const filter = {timestamp: end, device: devices[j]._id};
      const update = jsonDevice;

      let doc = await HistoryDeviceData.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true // Make this update into an upsert
      });

    }
  }catch(error){
    console.log(error.message)
  }
}

async function StoredStationData(){
  try{
    let start = moment().subtract(5, 'minutes').startOf('minute')
    let end = moment().subtract(5, 'minutes').endOf('minute')

    let stations = await Station.find({is_active: 1});

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
        if (device.is_active == 1) {
          ids.push(device._id)
          //console.log(device._id, device.name)
        }
      })

      let infors;
      let Watts = 0;
      let WH = 0;
      let workingHours = 0

      infors = await HistoryDeviceData.find({ device: { $in: ids }, 
                                              timestamp: {$gte: start, $lte: end } 
                                          })

      //console.log(infors)
      for (var i = 0; i < infors.length; i++) {
        Watts += infors[i].paras.Watts
        WH += infors[i].paras.WH
        workingHours += infors[i].paras.workingHours

      }
        
      jsonStation.paras.Watts = Watts;
      jsonStation.paras.WH = WH;
      jsonStation.paras.workingHours = workingHours;
      
      jsonStation.updated_at = new Date();
      
      const filter = {timestamp: start, station: stations[j]._id};
      const update = jsonStation;

      let doc = await HistoryStationData.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true // Make this update into an upsert
      });
    }
  }catch(error){
    console.log(error.message)
  }
}

async function StoredWhDeviceData(){
  try{
    let start = moment().subtract(2, 'minutes').startOf('days')
    let end = moment().subtract(2, 'minutes').endOf('days')

    let devices = await Device.find({is_active: 1});
    for (let j = 0; j < devices.length; j++) {
      let jsonDevice = {
        device: devices[j]._id,
        device_name : devices[j].name,
        station: devices[j].station,
        timestamp : start,
        infors: []
      }

      let infors = await DeviceData.find({ device: devices[j]._id, 
                                       timestamp: {$gte: start, $lte: end } 
                                    })

      let TotalWh = 0
      let minWh = 9000000000
      let maxWh = 0
      let minAt
      let maxAt
      infors.map(await function(item){
        let strWh = item.paras.filter(function(it){
          return it.name == 'WH'
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
      console.log(maxWh, minWh, TotalWh)
      jsonDevice.wh = TotalWh
      jsonDevice.infors = [
        {min: minWh, minAt: minAt, max: maxWh, maxAt: maxAt }
      ]
      jsonDevice.updated_at = new Date();

      const filter = {timestamp: start, device: devices[j]._id};
      const update = jsonDevice;

      let doc = await WhDeviceData.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true // Make this update into an upsert
      });

    }
  }catch(error){
    console.log(error.message)
  }
}

setInterval(function(){
  StoredWhDeviceData()
}, parseInt(4 * 60000));

setInterval(function(){
  StoredDeviceData()
}, parseInt(process.env.DEVICE_CALC) * 60000);

setInterval(function(){
  StoredStationData()
}, parseInt(process.env.STATION_CALC) * 60000);
