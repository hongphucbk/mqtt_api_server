require('dotenv').config();
require('express-group-routes');
var moment = require('moment');
const CronJob = require('cron').CronJob;
const axios = require('axios');
const delay = require('delay');
var bodyParser = require('body-parser')

const express = require('express')
//-------------------------------------------------------------------
var mongoose = require('mongoose');
//mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true});
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});



const HistoryDeviceRawData = require('../../models/HistoryDeviceRawData')


//---------------------------------------------------------------------
// Service to delete database after 2 day
let before25h;
async function deleteData() {
  before25h = moment().subtract(1, 'years');
  let end =  moment('01-01-2023 00:00:00',"DD-MM-YYYY hh:mm:ss")

  console.log(before25h)
  
  await HistoryDeviceRawData.deleteMany({ timestamp: { $lte: end } }).limit(1000);

  console.log('----> Deleted ')
  //await StationData.deleteMany({ timestamp: { $lte: before25h } });
}
//---------------------------------------------------------------------


setInterval(() => {
    deleteData()
}, 5000);
