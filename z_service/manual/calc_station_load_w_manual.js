require('dotenv').config();
var moment = require('moment');

var bodyParser = require('body-parser')
const express = require('express')
//-------------------------------------------------------------------
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, 
  {useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false});

const StationData = require('../../models/StationData')
const Device = require('../../models/Device')
const DeviceData = require('../../models/DeviceData')

// 2022-07-31
// Update is_update = 0 to recalc load_w for station
async function index(){
  let start = moment().subtract(1, 'hours')
  let end = moment()

  let filter = { timestamp: {$gte: start, $lte: end } }
  let update = {is_update: 0}

  await StationData.updateMany(filter, update)

}

async function CalcLoadWStation(){
  try{
  let start_condtion = moment().subtract(2,'hours')
  let end_condtion = moment().subtract(15,'minutes')
  let a = await StationData.findOneAndUpdate({is_update: null},{is_update: 0, is_recalc: 0}).exec()

  let station_data = await StationData.findOne({is_update: 0, timestamp: { $lte: end_condtion, $gte: start_condtion}}).exec(); // {is_update: { $ne: null }}
  
  //console.log('-->', start_condtion, end_condtion, station_data)
  if(!station_data){
      return
  }
  let kw = station_data.paras.filter((para) => para.name === 'kiloWatts')

  let devices = await Device.find({station: station_data.station})
  let arr_device = devices.map((device) => {
      return device._id
  })

  let start = moment(station_data.timestamp).subtract(30, 'seconds')
  let end = moment(station_data.timestamp).add(30, 'seconds')

  let strQuery = {  device: { $in: arr_device }, 
                    timestamp: {$gte: start, $lte: end }
                 }
  let device_data = await DeviceData.find(strQuery)
  
  let sum = 0
  
  let b = device_data.map((d) => {
    let Watts = d.paras.filter((para) => para.name === 'Watts')
    //console.log(Watts)
    if(Watts[0]){
      sum += Watts[0].value
    }
    
    //console.log(Watts)
  })

  let total = sum + kw[0].value * 1000
  
  let infor = {
    sum : sum,                    // kw device
    consum : kw[0].value * 1000,  // kw iot station
    total : total
  };

  let update = {infor: infor, 
                is_update: 1, 
                load_w : total,
                sum_w : infor.sum,
                consum_w : infor.consum
              }

  let result = await StationData.findOneAndUpdate({_id: station_data._id}, update).exec()
  }catch(error){
    console.log(error)
  }
}

module.exports = { CalcLoadWStation, index }




