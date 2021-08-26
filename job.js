require('dotenv').config();
require('express-group-routes');
const moment = require('moment');
const CronJob = require('cron').CronJob;
const axios = require('axios');

var bodyParser = require('body-parser')
const express = require('express')
//-------------------------------------------------------------------
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const User = require('./models/User')
const Station = require('./models/Station')
const auth = require('./middlewares/auth')
const role = require('./middlewares/role')
const Device = require('./models/Device')
const DeviceData = require('./models/DeviceData')
const HistoryDeviceData = require('./models/HistoryDeviceData')
const HistoryStationData = require('./models/HistoryStationData')
const WhDeviceData = require('./models/WhDeviceData')
const WDeviceData = require('./models/WDeviceData')
const LoadStationData = require('./models/LoadStationData')

let stationData = []


// var job = new CronJob('*/5 * * * *', function() {
//   console.log('You will see this message every second ' + moment().format('H mm ss'));


// }, null, true, 'Asia/Ho_Chi_Minh');
// job.start();


