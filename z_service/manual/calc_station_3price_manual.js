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


//StoredStationDataManual()

manu()

function manu(argument) {
  //let start1 = moment('02-12-2021 10:00:00', "DD-MM-YYYY hh:mm:ss");
  let date = moment('06-04-2022',"DD-MM-YYYY")

  setInterval(function() {
    date = date.add(1, 'days')
    console.log('---> ', date);

    StoredWhStation3Price(date)
  }, 10000);

  
}


async function StoredWhStation3Price(date){
  console.log(date)
  try{
    //let start = moment(start1).startOf('days')
    let station_id = "6237b1c479f5fbbe6a6086a5";
    let strDate = moment(date).format('DD-MM-YYYY') + " "
    
    //let devices = await Device.find({is_active: 1, station: station});
    let station = await Station.findOne({_id: station_id})
    console.log('station ' + station)
        let dt = {
          station: station._id,
          station_name : station.name,
          timestamp : moment(strDate + '00:00:00', "DD-MM-YYYY hh:mm:ss"),
          updated_at: new Date(),
          unit_price_td: station.unit_price_td,
          unit_price_bt: station.unit_price_bt,
          unit_price_cd: station.unit_price_cd, 
        }

        let data = await WhDeviceData3.find({station: station_id, timestamp: dt.timestamp});

        let sum_td = 0;
        let sum_bt = 0;
        let sum_cd = 0;

        await data.forEach(e => {
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
        

        dt.kwh_td = sum_td
        dt.kwh_bt = sum_bt 
        dt.kwh_cd = sum_cd 

        dt.price_td = dt.kwh_td * dt.unit_price_td
        dt.price_bt = dt.kwh_bt * dt.unit_price_bt
        dt.price_cd = dt.kwh_cd * dt.unit_price_cd
        //----------
        kwh = await get_total_kwh(station._id, dt.timestamp)
        kwh_3 = dt.kwh_td + dt.kwh_bt + dt.kwh_cd
    
        let kwh_diff = kwh - kwh_3
        dt.total_kwh = kwh
        dt.kwh_diff = kwh_diff
    
        let price_diff = kwh_diff * station.unit_price_bt
        dt.price_diff = price_diff

        //-------------------

        dt.befor_price = dt.price_td + dt.price_bt + dt.price_cd + dt.price_diff
        dt.total_price_discounted =  dt.befor_price * ((100 - station.discount)/100)
        dt.total_price = dt.total_price_discounted  * ((100 + station.vat)/100 )

        const filter = {timestamp: dt.timestamp, station: station._id};
        const update = dt;

        let doc = await WhStation3Price.findOneAndUpdate(filter, update, {
          new: true,
          upsert: true  // Make this update into an upsert
        });
      
      console.log(dt)
  }catch(error){
    console.log(error.message)
  }
}


async function get_total_kwh(station_id, strDate){

  let whs = await WhDeviceData.find({ station: station_id, timestamp: strDate})
  let sum = 0
  await whs.forEach(e => {
    sum = sum + e.wh
  })
  return sum/1000;
}


