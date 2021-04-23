require('dotenv').config();
require('express-group-routes');
var moment = require('moment'); // require

var bodyParser = require('body-parser')

const express = require('express')

//-------------------------------------------------------------------
var mongoose = require('mongoose');
//mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true});
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const User = require('./models/User')
const Station = require('./models/Station')
const auth = require('./middlewares/auth')
const role = require('./middlewares/role')
const Device = require('./models/Device')
const DeviceData = require('./models/DeviceData')
const HistoryDeviceData = require('./models/HistoryDeviceData')
const HistoryStationData = require('./models/HistoryStationData')

let stationData = []
  //let jsonStation = {}

async function StoredDatabase(){
  let start = moment().subtract(1, 'hours').startOf('hour')
  let end = moment().subtract(1, 'hours').endOf('hour')

  console.log(start, end)
  let stations = await Station.find();

  for (let j = 0; j < stations.length; j++) {
    let jsonStation = {
      station: stations[j]._id,
      paras: {
        powerGenerated : 0, //kWh powerGenerated
        power : 0,
        workingHours : 0
      }
      //name: stations[j].name,
      
    }


    let devices = await Device.find({ station: stations[j]._id })
    let ids = []
    devices.forEach(function(device){
      ids.push(device._id)
    })

    let infors;
    let data = []

      let sum = 0
      let count = 0
      let avg = 0

      infors = await HistoryDeviceData.find({ device: { $in: ids }, 
                                              timestamp: {$gte: start, $lte: end } 
                                          })

      let powers = infors.filter(function(item){
        return item.paras == 'power'
      })

      if(powers.length > 0){
        for(let k = 0; k < powers.length; k++) {
          sum += powers[k].value
          count += 1
        }
        if (count > 0) {
          avg = sum/count
        }else{
          avg = 0
        }

        jsonStation.paras.power = avg;
      }
      //-------------------------------
        let wkhs = infors.filter(function(item){
          return item.paras == 'workingHours'
        })

        if(wkhs.length > 0){
          for(let k = 0; k < wkhs.length; k++) {
            sum += wkhs[k].value
            count += 1
          }
          if (count > 0) {
            avg = sum/count
          }else{
            avg = 0
          }

          jsonStation.paras.workingHours = avg;
        }
      //-------------------------------------
    
    jsonStation.updated_at = new Date();
    

    const filter = {timestamp: start, station: stations[j]._id};
    const update = jsonStation;

    let doc = await HistoryStationData.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true // Make this update into an upsert
    });

    //stationData.push(jsonStation)

    //console.log("---------> \n",jsonStation)
  }



}

  
setInterval(function(){
  StoredDatabase();

}, 5*60000);


  //console.log('----------->',stationData)
  //res.send({sites: stationData })
