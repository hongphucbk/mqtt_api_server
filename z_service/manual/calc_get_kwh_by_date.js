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
  //let start1 = moment('02-12-2021 10:00:00', "DD-MM-YYYY hh:mm:ss");
  let date = moment('25-03-2022',"DD-MM-YYYY")

  setInterval(function() {
    date = date.add(1, 'days')
    //console.log('---> ', date);

    GetWhStation31(date)
  }, 1000);
}


async function GetWhStation31(date){
  //console.log(date)
  try{
    //let start = moment(start1).startOf('days')
    let station_id = "6237b1c479f5fbbe6a6086a5";
    let device_id = '6237bb7379f5fbbe6a6086ae'
    let strDate = moment(date).format('DD-MM-YYYY') + " "
    
    //let devices = await Device.find({is_active: 1, station: station});
    let station = await Station.findOne({_id: station_id})
        //console.log('station ' + station)
        let dt = {
          station: station._id,
          station_name : station.name,
          timestamp : moment(strDate + '00:00:00', "DD-MM-YYYY hh:mm:ss"),
          updated_at: new Date(),
          unit_price_td: station.unit_price_td,
          unit_price_bt: station.unit_price_bt,
          unit_price_cd: station.unit_price_cd, 
        }

        let data = await WhDeviceData3.find({station: station_id, device: device_id, timestamp: dt.timestamp});

        let sum_td = 0;
        let sum_bt = 0;
        let sum_cd = 0;
        
        let min = 999999999
        let max = 0

        await data.forEach(e => {
          if (e.kwh_min > 0) {
            min = e.kwh_min <= min ? e.kwh_min : min
            max = e.kwh_max >= max ? e.kwh_max : max
            
          }

          if (e.type_name == 'TD') {
            sum_td += e.kwh
          }
          if (e.type_name == 'BT') {
            sum_bt += e.kwh
          }
          if (e.type_name == 'CD') {
            sum_cd += e.kwh
          }
        })
        
        console.log(moment(date).format('DD-MM-YYYY'),",", min, ",", max)
        //let sum = 
        

        
      
  }catch(error){
    console.log(error.message)
  }
}



