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
const HistoryDeviceRawData = require('../../models/HistoryDeviceRawData')
const HistoryDeviceData = require('../../models/HistoryDeviceData')
const HistoryStationData = require('../../models/HistoryStationData')
const WhDeviceData = require('../../models/WhDeviceData')
const WDeviceData = require('../../models/WDeviceData')
const LoadStationData = require('../../models/LoadStationData')
const StationData = require('../../models/StationData')
const StationDataRaw = require('../../models/StationDataRaw')
const LoadWStationData = require('../../models/LoadWStationData')
const LoadWhStationData = require('../../models/LoadWhStationData')
const WhDeviceData3 = require('../../models/WhDeviceData3')
const WhStation3Price = require('../../models/WhStation3Price')


// Tính lại giá trị w khi is_update = 0 trong history
async function CalcLoadWStationHistory(start1, end1){
  try{
  //let start_condtion = start // moment().subtract(5,'minutes')
  //let a = await StationData.findOneAndUpdate({is_update: null},{is_update: 0}).exec()

  let station_data = await StationDataRaw.findOne({
    is_update: 0, 
    timestamp: {$gte: start1,  $lte: end1},

  }).exec(); // {is_update: { $ne: null }}
  console.log('-->', station_data)
  if(!station_data){
      return
  }
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
  //let device_data = await DeviceData.find(strQuery)
  let device_data = await HistoryDeviceRawData.find(strQuery)
  
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

  let result = await StationDataRaw.findOneAndUpdate({_id: station_data._id}, update).exec()
  }catch(error){
    console.log(error)
  }
}

setInterval(function(){
  let start1 = moment('30-07-2022 00:00:00', "DD-MM-YYYY hh:mm:ss");
  let end1 = moment('31-07-2022 23:59:00', "DD-MM-YYYY hh:mm:ss");
  CalcLoadWStationHistory(start1, end1)

}, parseInt(4000)); // 1 minutes



