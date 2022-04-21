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

// Tính tổng giá (3 khung giờ) theo cho tất cả station
// Update vào bảng stations
module.exports.calc_kwh_diff = async function(){
  let strDate = moment().subtract(2, 'hours').startOf('day')

  let stations = await Station.find({is_active: 1})
  let kwh = 0
  let kwh_diff = 0

  for (var i = 0; i < stations.length; i++) {
    let station = stations[i]

    kwh = await get_total_kwh(station._id, strDate)
    kwh_3 = await get_kwh_3(station._id, strDate)

    kwh_diff = kwh - kwh_3
    let total_kwh = kwh

    let price_diff = kwh_diff * station.unit_price_bt

    let sp = await WhStation3Price.findOne({ station: station._id, timestamp: strDate})
    let befor_price = sp.price_td + sp.price_bt + sp.price_cd + sp.price_diff

    let total_price_discounted = befor_price * ((100 - station.discount)/100)
    let total_price = total_price_discounted * ((100 + station.vat)/100)

    //console.log(kwh_diff, strDate, total_price_discounted, total_price)

    let filter = {station: station._id, timestamp: strDate}
    let update = {
      kwh_diff: kwh_diff, 
      price_diff: price_diff,
      befor_price: befor_price,
      total_price: total_price,
      total_kwh: total_kwh,
    }

    let result = await WhStation3Price.findOneAndUpdate(filter, update)
    //console.log(filter, update, result)
  }
}

// Tính tổng kwh theo station id, trong ngày hôm trước
// Chỉ số cuối ngày - chỉ số đầu ngày
async function get_total_kwh(station_id, strDate){

  let whs = await WhDeviceData.find({ station: station_id, timestamp: strDate})
  let sum = 0
  await whs.forEach(e => {
    sum = sum + e.wh
  })
  return sum/1000;
}

async function get_kwh_3(station_id, strDate){
  let station_price = await WhStation3Price.findOne({ station: station_id, timestamp: strDate})
  let sum = station_price.kwh_td + station_price.kwh_bt + station_price.kwh_cd
  return sum;
}


