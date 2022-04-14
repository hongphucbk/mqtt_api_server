require('dotenv').config();
require('express-group-routes');
const CronJob = require('cron').CronJob;

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
const WDeviceData = require('./models/WDeviceData')
const WhDeviceData = require('./models/WhDeviceData')
const WhDeviceData3Price = require('./models/WhDeviceData3Price')
const LoadStationData = require('./models/LoadStationData')

let stationData = []

//========================================================
// Run job stored w device (every 10 minutes)
var StoredkWh3PriceJob = new CronJob('*/10 * * * *', function() {
  StoredWhDeviceData3PriceAuto()
}, null, true, 'Asia/Ho_Chi_Minh');

StoredkWh3PriceJob.start();
//========================================================

async function StoredWhDeviceData3PriceAuto(){
  let point;
  let strDate = moment().subtract(10, 'minutes').format('DD-MM-YYYY') + " "
  const hours_arrs = [
      {code: 1, name: 'BT', description: '4h00->9h30',  min: strDate +'04:00:00', max: strDate +'09:30:00' },
      {code: 2, name: 'CD', description: '9h30->11h30', min: strDate +'09:30:00', max: strDate +'11:30:00' },
      {code: 3, name: 'BT', description: '11h30->17h00', min: strDate +'11:30:00', max: strDate +'17:00:00' },
      {code: 4, name: 'CD', description: '17h00->20h00', min: strDate +'17:00:00', max: strDate +'20:00:00' },
      {code: 5, name: 'BT', description: '20h00->22h00', min: strDate +'20:00:00', max: strDate +'22:00:00' },
      {code: 6, name: 'TD', description: '22h00->24h00', min: strDate +'22:00:00', max: strDate +'24:00:00' },
      {code: 7, name: 'TD', description: '00h00->04h00', min: strDate +'00:00:00', max: strDate +'04:00:00' },
    ]
  try{
    let now = moment().subtract(10, 'minutes')
    await hours_arrs.forEach(function(e){
      if ((now > moment(e.min,  "DD-MM-YYYY hh:mm:ss")) && (now < moment(e.max,  "DD-MM-YYYY hh:mm:ss")) ){
        point = e        
      }
    })
    //console.log('point ', point)

    let devices = await Device.find({is_active: 1});
    for (let j = 0; j < devices.length; j++) {
        let dt = {
          device: devices[j]._id,
          device_name : devices[j].name,
          station: devices[j].station,
          timestamp : moment(strDate + '00:00:00', "DD-MM-YYYY hh:mm:ss"),
          updated_at: new Date(),
          type_number: point.code,
          type_name: point.name,
          type_description: point.description,

          watts: []
        }

        let data = await getkWhCurrent(devices[j]._id, point.min, point.max)
        //console.log(point.code, data)
        dt.kwh_min = data.min
        dt.kwh_max = data.max 
        dt.kwh = data.wh 

        const filter = {timestamp: moment(point.min,  "DD-MM-YYYY hh:mm:ss"), device: devices[j]._id, type_number: point.code};
        const update = dt;

        let doc = await WhDeviceData3Price.findOneAndUpdate(filter, update, {
          new: true,
          upsert: true  // Make this update into an upsert
        });
      
    }
  }catch(error){
    console.log(error.message)
  }
}

async function getkWhCurrent(device, start1, end1){
  let start = moment(start1, "DD-MM-YYYY hh:mm:ss")
  let end = moment(end1, "DD-MM-YYYY hh:mm:ss")

  //console.log(start, end)
  let data = []

  let infors = await DeviceData.find({ device: device, 
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
  return {wh: TotalWh/1000, min: minWh, minAt: minAt, max: maxWh, maxAt: maxAt } 
}