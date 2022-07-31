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


//Set is_update from 1 to 0

manu()

function manu(argument) {
  let start = moment('31-07-2022 05:00:00', "DD-MM-YYYY hh:mm:ss");
  let end = moment('31-07-2022 13:00:00', "DD-MM-YYYY hh:mm:ss");

  fnc(start, end)
  
}

async function fnc(start, end){

    let filter = { timestamp: {$gte: start, $lte: end } }
    let update = {is_update: 0}

    await StationData.updateMany(filter, update)
    
}



