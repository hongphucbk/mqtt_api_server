require('dotenv').config();
require('express-group-routes');
var moment = require('moment'); // require

var bodyParser = require('body-parser')

const express = require('express')

//-------------------------------------------------------------------
var mongoose = require('mongoose');
//mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true});
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

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

manu()

function manu(argument) {
  //let start1 = moment('02-12-2021 10:00:00', "DD-MM-YYYY hh:mm:ss");
  let date = moment('14-04-2022',"DD-MM-YYYY")

  setInterval(function() {
    date = date.add(1, 'days')
    console.log('---> ', date);

    StoredWhDeviceData3(date)
  }, 25000);

  
}


async function StoredWhDeviceData3(date){
  console.log(date)
  try{
    //let start = moment(start1).startOf('days')
    let station = "6237b1c479f5fbbe6a6086a5";
    let strDate = moment(date).format('DD-MM-YYYY') + " "
    let hours = [
      {code: 1, name: 'BT', description: '4h00->9h30',  min: strDate +'04:00:00', max: strDate +'09:30:00' },
      {code: 2, name: 'CD', description: '9h30->11h30', min: strDate +'09:30:00', max: strDate +'11:30:00' },
      {code: 3, name: 'BT', description: '11h30->17h00', min: strDate +'11:30:00', max: strDate +'17:00:00' },
      {code: 4, name: 'CD', description: '17h00->20h00', min: strDate +'17:00:00', max: strDate +'20:00:00' },
      {code: 5, name: 'BT', description: '20h00->22h00', min: strDate +'20:00:00', max: strDate +'22:00:00' },
    ]


    let devices = await Device.find({is_active: 1, station: station});
    for (let j = 0; j < devices.length; j++) {
      for (var i = 0; i < hours.length; i++) {
        let dt = {
          device: devices[j]._id,
          device_name : devices[j].name,
          station: devices[j].station,
          timestamp : moment(strDate + '00:00:00', "DD-MM-YYYY hh:mm:ss"),
          updated_at: new Date(),
          type_number: hours[i].code,
          type_name: hours[i].name,
          type_description: hours[i].description,

          watts: []
        }

        let data = await getkWh(devices[j]._id, hours[i].min, hours[i].max)
        console.log(hours[i].code, data)
        dt.kwh_min = data.min
        dt.kwh_max = data.max 
        dt.kwh = data.wh.toFixed(0)

        //console.log(dt)

        const filter = {timestamp: date, device: devices[j]._id, type_number: hours[i].code};
        const update = dt;

        let doc = await WhDeviceData3.findOneAndUpdate(filter, update, {
          new: true,
          upsert: true  // Make this update into an upsert
        });
      }
      

      
    }
  }catch(error){
    console.log(error.message)
  }
}

async function getkWh(device, start1, end1){
  let start = moment(start1, "DD-MM-YYYY hh:mm:ss")
  let end = moment(end1, "DD-MM-YYYY hh:mm:ss")

  //console.log(start, end)
  //let data = []

  hisStations = await HistoryDeviceData.find({  device: device, 
                                                timestamp: {$gte: start, $lte: end } 
                                            })      
  let TotalWh = 0
  let minWh = 9000000000
  let maxWh = 0
  let minAt
  let maxAt
  hisStations.map(await function(item){
      let strWh = item.paras.WH
      //console.log(item)
      
      let WH = parseInt(strWh)
      if (WH > 0) {
        if (WH <= minWh) {
          minAt = item.timestamp
        }
        if (WH >= maxWh) {
          maxAt = item.timestamp
        }

        minWh = WH <= minWh ? WH : minWh
        maxWh = WH >= maxWh ? WH : maxWh
        
      }
    })
  TotalWh = maxWh > minWh ?  maxWh - minWh : 0
  
  
  return {wh: TotalWh/1000, min: minWh, minAt: minAt, max: maxWh, maxAt: maxAt }   
}




