require('dotenv').config();
var moment = require('moment'); // require
const axios = require('axios');
const delay = require('delay');
var fs = require("fs");
var path = require("path");

//-------------------------------------------------------------------
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true});

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
const BillingSchedule = require('../../models/BillingSchedule');
const Invoice = require('../../models/Invoice.model');
const IndexStation = require('../../models/IndexStation');
const AutoEmail = require('../../models/AutoEmail');
//const Customer = require('../../models/Customer.model');
const mailer = require('../../mailer/mailer');
const Report = require('../../models/Report');

station_status()
device_status()
//=======================================================
async function station_status(){
  try{
    let stations = await Station.find({is_active: 1})
    //let start = moment().subtract(22, 'hours').startOf('days')
    
    for (var i = 0; i < stations.length; i++) {
      let station = stations[i]
      let rs = await DeviceData.findOne({device: {"$in": station.devices}}).sort({timestamp: -1})
      if((rs??0) && rs?.timestamp > moment().subtract(60, 'minutes')){
        //console.log('====>', rs.timestamp, moment(), station.name, "ONLINE" )
        let rs1 = await Station.findByIdAndUpdate(station._id, {status: "normal"})

      }else{
        //console.log('====>', moment(), station.name, " --->OFFLINE" )
        let rs1 = await Station.findByIdAndUpdate(station._id, {status: "offline"})
      }

      await delay(1000)
    }
  }catch(error){
    console.log(error)
  }
}

async function device_status(){
  try{
    let devices = await Device.find({is_active: 1})
    //let start = moment().subtract(22, 'hours').startOf('days')
    
    for (var i = 0; i < devices.length; i++) {
      let device = devices[i]

      if(device.updated_at > moment().subtract(60, 'minutes')){
        let rs1 = await Device.findByIdAndUpdate(device._id, {status: "normal"})
      }else{
        let rs1 = await Device.findByIdAndUpdate(device._id, {status: "offline"})  //fault
      }
      await delay(500)
    }
  }catch(error){
    console.log(error)
  }
}




module.exports = { station_status, device_status }

  