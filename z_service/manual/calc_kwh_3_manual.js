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
const HistoryDeviceRawData = require('../../models/HistoryDeviceRawData')
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
  let date = moment('07-09-2022 00:00:00',"DD-MM-YYYY hh:mm:ss")
  let end =  moment('10-09-2022 13:59:59',"DD-MM-YYYY hh:mm:ss")

  let station = "62c6e706d5b1b9149d447679"; //

  setInterval(async function() {
    
    console.log('------> ', date);
    if(date <= end){
      await StoredWhDeviceData3(station, date)
      console.log('-> done: ->', date);
      date = date.add(1, 'days')
    }
    
  }, 20000);

  
}


async function StoredWhDeviceData3(station, date){
  //console.log(date)
  //try{
    //let start = moment(start1).startOf('days')
    
    let strDate = moment(date).format('DD-MM-YYYY') + " "
    let hours = [
      {code: 1, name: 'BT', description: '4h00->9h30',  min: strDate +'04:00:00', max: strDate +'09:30:00' },
      {code: 2, name: 'CD', description: '9h30->11h30', min: strDate +'09:30:00', max: strDate +'11:30:00' },
      {code: 3, name: 'BT', description: '11h30->17h00', min: strDate +'11:30:00', max: strDate +'17:00:00' },
      {code: 4, name: 'CD', description: '17h00->20h00', min: strDate +'17:00:00', max: strDate +'20:00:00' },
      {code: 5, name: 'BT', description: '20h00->22h00', min: strDate +'20:00:00', max: strDate +'22:00:00' },
      {code: 6, name: 'TD', description: '22h00->24h00', min: strDate +'22:00:00', max: strDate +'24:00:00' },
      {code: 7, name: 'TD', description: '00h00->04h00', min: strDate +'00:00:00', max: strDate +'04:00:00' },

    ]


    let devices = await Device.find({is_active: 1, station: station});
    for (let j = 0; j < devices.length; j++) {
      let device = devices[j]
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

        // let data = await getkWh(devices[j]._id, hours[i].min, hours[i].max)
        // console.log(hours[i].code, data)
        // dt.kwh_min = data.min
        // dt.kwh_max = data.max 
        // dt.kwh = data.wh.toFixed(0)
        let now = moment(hours[i].min, "DD-MM-YYYY hh:mm:ss").add(1, 'minutes')
        //console.log(now)

        let point = await getPoint(hours, now)
        //console.log(point)
        let current_max = await getkWhMax(device._id, point.current_start , point.current_end)
        let premax_max = await getkWhMax(device._id, point.pre_start, point.pre_end)

        dt.kwh_min = premax_max.max
        dt.kwh_max = current_max.max

        let min
        if(dt.kwh_min == 0){
          min = await getkWhMin(device._id, point.current_start, point.current_end)
          dt.kwh_min = min.min
        }
        

        if(dt.kwh_max == 0){
          dt.kwh_max = dt.kwh_min
        }
      
        if(dt.kwh_max > 0 && dt.kwh_min > 0 ){
          dt.kwh = Math.floor((dt.kwh_max -  dt.kwh_min)/ 1000 )
        }else{
          dt.kwh = 0
        }

        console.log(dt.timestamp, dt.device_name, dt.type_number, dt.kwh_min, dt.kwh_max, dt.kwh)

        const filter = {timestamp: dt.timestamp, device: devices[j]._id, type_number: hours[i].code};
        const update = dt;

        let doc = await WhDeviceData3.findOneAndUpdate(filter, update, {
          new: true,
          upsert: true  // Make this update into an upsert
        });
      }
      

      
    }
  // }catch(error){
  //   console.log(error.message)
  // }
}

async function getkWhNotUse(device, start1, end1){
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
  //console.log(point.code, '--> ', d)
  return  d;

  
  
}

async function getkWhMax(device, start, end){
  let data = []
  let infors = await HistoryDeviceRawData.find({  device: device, 
                                                  timestamp: {$gte: start, $lte: end } 
                                              })

  let maxWh = 0
  let maxAt
  
  infors.map(async function(item){
    //let strWh = item.paras.WH    
    //let WH = parseInt(strWh)
    //console.log(infors.length, item)

    let strWh = item.paras.filter(function(it){
      return it.name == 'WH'
    })
    let WH = strWh[0] ? parseInt(strWh[0].value) : 0
    if (WH > 0) {
      maxWh = WH >= maxWh ? WH : maxWh
      if (WH >= maxWh) {
        maxAt = new Date()
      }
    }
  })

  return {max: maxWh, maxAt: maxAt } 
}

async function getkWhMin(device, start, end){
  let data = []
  let infors = await HistoryDeviceRawData.find({  device: device, 
                                                  timestamp: {$gte: start, $lte: end } 
                                              })

  let minWh = 999999999
  let minAt;
  infors.map(async function(item){
    //let strWh = item.paras.WH    
    //let WH = parseInt(strWh)
    //console.log(infors.length, item)

    let strWh = item.paras.filter(function(it){
      return it.name == 'WH'
    })
    let WH = strWh[0] != null ? parseInt(strWh[0].value) : 0
    if (WH > 0) {
      minWh = WH <= minWh ? WH : minWh
      if (WH <= minWh) {
        minAt = new Date()
      }
    }
  })
  if(minWh == 999999999 ){
    minWh = 0
  }

  return {min: minWh, minAt: minAt } 
}
