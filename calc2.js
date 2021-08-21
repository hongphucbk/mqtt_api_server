require('dotenv').config();
require('express-group-routes');
var moment = require('moment');

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

async function StoredLoadStationData(){
  try{
    let start = moment().subtract(2, 'hours').startOf('days')

    let stations = await Station.find({is_active: 1});
    for (let j = 0; j < stations.length; j++) {
      let st = stations[j]
      let json = {
        station: st._id,
        station_name : st.name,
        timestamp : start,
        updated_at: new Date(),
        load: 1234,
      }
            
      const filter = {timestamp: start, station: st._id};
      const update = json;

      let doc = await LoadStationData.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true  // Make this update into an upsert
      });
    }
  }catch(error){
    console.log(error)
  }
}

setInterval(function(){
  StoredLoadStationData()
}, parseInt(5000)); // 10 minutes
