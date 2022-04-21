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

const User = require('../models/User')
const Station = require('../models/Station')
const auth = require('../middlewares/auth')
const role = require('../middlewares/role')
const Device = require('../models/Device')
const DeviceData = require('../models/DeviceData')
const HistoryDeviceData = require('../models/HistoryDeviceData')
const HistoryStationData = require('../models/HistoryStationData')
const WhDeviceData = require('../models/WhDeviceData')
const WDeviceData = require('../models/WDeviceData')
const LoadStationData = require('../models/LoadStationData')
const StationData = require('../models/StationData')
const LoadWStationData = require('../models/LoadWStationData')
const LoadWhStationData = require('../models/LoadWhStationData')
const WhDeviceData3 = require('../models/WhDeviceData3')
const WhStation3Price = require('../models/WhStation3Price')

// Tính các thông số hôm nay
module.exports.calc_kwh_today = async function calc_kwh_sum(station_id){
	let d = {}
  let station_price = await WhStation3Price.findOne({ station: station_id, timestamp: moment().startOf('day')})
    d.kwh_td = station_price.kwh_td ? station_price.kwh_td : 0
    d.kwh_bt = station_price.kwh_bt ? station_price.kwh_bt : 0
    d.kwh_cd = station_price.kwh_cd ? station_price.kwh_cd : 0
    d.kwh_total = d.kwh_td + d.kwh_bt + d.kwh_cd  //kwh_total: Trong ngày

    d.price_td = station_price.price_td
    d.price_bt = station_price.price_bt
    d.price_cd = station_price.price_cd

    d.befor_price = station_price.befor_price
    d.total_price = station_price.total_price
  return d;
}


