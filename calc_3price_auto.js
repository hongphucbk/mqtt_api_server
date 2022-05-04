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
const WhDeviceData3 = require('./models/WhDeviceData3')
const WhStation3Price = require('./models/WhStation3Price')

let stationData = []

//========================================================
// Run job stored w device (every 10 minutes)
var StoredkWh3Job = new CronJob('*/5 * * * *', function() {
  StoredWhDeviceData3Auto()
  StoredWhStation3PriceAuto()
  //console.log('-----------> ' + moment())
}, null, true, 'Asia/Ho_Chi_Minh');

StoredkWh3Job.start();
//========================================================

async function StoredWhDeviceData3Auto(){
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

    let point = await getPoint(hours_arrs, now)
    

    let devices = await Device.find({is_active: 1});
    for (let j = 0; j < devices.length; j++) {
      let device = devices[j]
        let dt = {
          device: device._id,
          device_name : device.name,
          station: device.station,
          timestamp : moment(strDate + '00:00:00', "DD-MM-YYYY hh:mm:ss"),
          updated_at: new Date(),
          type_number: point.infor.code,
          type_name: point.infor.name,
          type_description: point.infor.description,

          watts: []
        }

        let current_max = await getkWhMax(device._id, point.current_start , point.current_end)
        let premax_max = await getkWhMax(device._id, point.pre_start, point.pre_end)
      

        //let data = await getkWhCurrent(devices[j]._id, point.min, point.max)
        //console.log(point.code, data)
        dt.kwh_min = premax_max.max
        dt.kwh_max = current_max.max 
        dt.kwh = Math.round((current_max.max -  premax_max.max)/ 1000 )

        //console.log(dt)

        const filter = {timestamp: dt.timestamp, device: device._id, type_number: point.infor.code};
        const update = dt;

        let doc = await WhDeviceData3.findOneAndUpdate(filter, update, {
          new: true,
          upsert: true  // Make this update into an upsert
        });
    }

    //console.log('point ', point)
  }catch(error){
    console.log(error.message)
  }
}

// async function getkWhCurrentNoUse(device, start1, end1){
//   let start = moment(start1, "DD-MM-YYYY hh:mm:ss")
//   let end = moment(end1, "DD-MM-YYYY hh:mm:ss")

//   //console.log(start, end)
//   let data = []

//   let infors = await DeviceData.find({ device: device, 
//                                    timestamp: {$gte: start, $lte: end } 
//                                 })

//   let TotalWh = 0
//   let minWh = 9000000000
//   let maxWh = 0
//   let minAt
//   let maxAt
//   infors.map(await function(item){
//     let strWh = item.paras.filter(function(it){
//       return it.name == 'WH'
//     })
//     let WH = parseInt(strWh[0].value)
//     if (WH > 0) {
//       // if (WH < minWh) {
//       //   console.log("-->", minWh, strWh, WH, item.timestamp)
//       // }
//       minWh = WH < minWh ? WH : minWh
//       maxWh = WH > maxWh ? WH : maxWh
//       if (WH < minWh) {
//         minAt = new Date()
//       }
//       if (WH > maxWh) {
//         maxAt = new Date()
//       }
//     }
//   })

//   TotalWh = maxWh > minWh ?  maxWh - minWh : 0
//   return {wh: TotalWh/1000, min: minWh, minAt: minAt, max: maxWh, maxAt: maxAt } 
// }



//=======================================================

async function StoredWhStation3PriceAuto(){
  //console.log(date)
  try{
    let strDate = moment().subtract(10, 'minutes').format('DD-MM-YYYY') + " "
    
    //let station_id = "6237b1c479f5fbbe6a6086a5";
    let stations = await Station.find({is_active: 1})
    if (stations.length < 1) {
      return
    }
    for (var i = 0; i < stations.length; i++) {
      let station = stations[i]       
      //console.log('station ' + station)
        let dt = {
          station: station._id,
          station_name : station.name,
          timestamp : moment(strDate + '00:00:00', "DD-MM-YYYY hh:mm:ss"),
          updated_at: new Date(),
          unit_price_td: station.unit_price_td,
          unit_price_bt: station.unit_price_bt,
          unit_price_cd: station.unit_price_cd, 
        }

        let data = await WhDeviceData3.find({station: station._id, timestamp: dt.timestamp});

        let sum_td = 0;
        let sum_bt = 0;
        let sum_cd = 0;

        await data.forEach(e => {
          if (e.type_name == 'TD') {
            sum_td += e.kwh
          }
          if (e.type_name == 'BT') {
            sum_bt += e.kwh
          }
          if (e.type_name == 'CD') {
            sum_cd += e.kwh
          }
        })
        

        dt.kwh_td = sum_td
        dt.kwh_bt = sum_bt 
        dt.kwh_cd = sum_cd 

        dt.price_td = dt.kwh_td * dt.unit_price_td
        dt.price_bt = dt.kwh_bt * dt.unit_price_bt
        dt.price_cd = dt.kwh_cd * dt.unit_price_cd

        dt.befor_price = dt.price_td + dt.price_bt + dt.price_cd

        dt.total_price_discounted =  dt.befor_price * ((100 - station.discount)/100)
        dt.total_price = dt.total_price_discounted  * ((100 + station.vat)/100 )

        const filter = {timestamp: dt.timestamp, station: station._id};
        const update = dt;

        let doc = await WhStation3Price.findOneAndUpdate(filter, update, {
          new: true,
          upsert: true  // Make this update into an upsert
        });
      }
      //console.log(dt)
  }catch(error){
    console.log(error.message)
  }
}

async function getPoint(hours_arrs, now){
  let point
  let pre_start
  let pre_end
  let pre_code

  await hours_arrs.forEach(function(e){
    if ((now > moment(e.min,  "DD-MM-YYYY hh:mm:ss")) && (now < moment(e.max,  "DD-MM-YYYY hh:mm:ss")) ){
      point = e        
    }
  })

  switch (point.code) {
    case 1:
      pre_code = 7;
      break;
    case 2:
      pre_code = 1;
      break;
    case 3:
      pre_code = 2;
      break;
    case 4:
      pre_code = 3;
      break;
    case 5:
      pre_code = 4;
      break;
    case 6:
      pre_code = 5;
      break;
    case 7:
      pre_code = 6;
  }

  await hours_arrs.forEach(function(e){
    if(point.code == 7 && e.code == 6){
      //let start = moment(now).subtract(1, 'days').startOf('day').format('DD-MM-YYYY') + " "
      pre_start = moment(e.min,  "DD-MM-YYYY hh:mm:ss").subtract(1, 'days')
      pre_end = moment(e.max,  "DD-MM-YYYY hh:mm:ss").subtract(1, 'days')
      //console.log(pre_start, pre_end)
    }else{
      if (e.code == pre_code ){
        pre_start = moment(e.min,  "DD-MM-YYYY hh:mm:ss")
        pre_end = moment(e.max,  "DD-MM-YYYY hh:mm:ss")
          
      }
    }
    
  })


  let d = {
    current_start : moment(point.min,  "DD-MM-YYYY hh:mm:ss"),
    current_end : moment(point.max,  "DD-MM-YYYY hh:mm:ss"),
    pre_start: pre_start,
    pre_end: pre_end,
    infor: point,
  }
  return  d;
  
}

async function getkWhMax(device, start, end){
  let data = []
  let infors = await DeviceData.find({  device: device, 
                                        timestamp: {$gte: start, $lte: end } 
                                })

  let maxWh = 0
  let maxAt
  infors.map(await function(item){
    let strWh = item.paras.filter(function(it){
      return it.name == 'WH'
    })
    let WH = parseInt(strWh[0].value)
    if (WH > 0) {
      maxWh = WH > maxWh ? WH : maxWh
      if (WH > maxWh) {
        maxAt = new Date()
      }
    }
  })

  return {max: maxWh, maxAt: maxAt } 
}