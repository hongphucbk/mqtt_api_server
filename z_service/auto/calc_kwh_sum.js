require('dotenv').config();
require('express-group-routes');
var moment = require('moment');

var bodyParser = require('body-parser')

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

//calc_kwh_sum()

// Tính tổng kwh (3 khung giờ) theo cho tất cả station
// Update vào bảng stations
module.exports.calc_kwh_sum = async function calc_kwh_sum(){
  console.log(new Date())
  let stations = await Station.find({is_active: 1})
  let kwh_sum = 0

  for (var i = 0; i < stations.length; i++) {
    let station = stations[i]
    kwh_sum = await get_kwh_sum(station._id)

    let filter = {_id: station._id}
    let update = {kwh_sum: kwh_sum}
    await Station.findOneAndUpdate(filter, update)
  }
}

// Tính tổng kwh (3 khung giờ) theo station id
async function get_kwh_sum(station_id){
  let prices = await WhDeviceData3.find({ station: station_id})
  let kwh_sum = 0
  await prices.forEach(e => {
    kwh_sum = kwh_sum + e.kwh
  })
  return kwh_sum;
}

