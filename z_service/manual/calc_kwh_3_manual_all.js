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
var calc_kwh_3_auto = require('../auto/calc_kwh_3_auto')
var calc_station_3price_auto = require('../auto/calc_station_3price_auto')


//manu()
manu1()

let date = moment('03-09-2022 00:00:00',"DD-MM-YYYY hh:mm:ss")
let date1 = moment('03-09-2022 00:00:00',"DD-MM-YYYY hh:mm:ss")
let end =  moment('08-09-2022 13:59:59',"DD-MM-YYYY hh:mm:ss")

function manu() {
  //let start1 = moment('02-12-2021 10:00:00', "DD-MM-YYYY hh:mm:ss");
  let end =  moment('08-09-2022 13:59:59',"DD-MM-YYYY hh:mm:ss")

  // setInterval(async function() {
    
  // }, 20000);

  setTimeout(async () => {
    console.log('------> ', date);
    if(date <= end){
      await calc_kwh_3_auto.index(date)

      console.log('-> done: ->', date);
      date = date.add(1, 'days')
    }

    manu()

  }, 2000)
}


function manu1() {
  setTimeout(async () => {
    console.log('------> ', date1);
    if(date1 <= end){
      await calc_station_3price_auto.index(date1)

      console.log('-> done: ->', date1);
      date1 = date1.add(1, 'days')
    }

    manu1()

  }, 5000)

  
  
}


