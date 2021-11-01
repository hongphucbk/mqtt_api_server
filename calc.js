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
const AutoEmail = require('./models/AutoEmail')

const StationData = require('./models/StationData')
const LoadWhStationData = require('./models/LoadWhStationData')
const LoadWStationData = require('./models/LoadWStationData')


let stationData = []

async function StoredDeviceData(){
  try{
    let start = moment().subtract(10, 'minutes').startOf('minute')
    let end = moment().subtract(0, 'minutes').endOf('minute')
    let devices = await Device.find({is_active: 1});
    for (let j = 0; j < devices.length; j++) {
      let jsonDevice = {
        device: devices[j]._id,
        watts: 0,
        paras: {
          WH : 0, //kWh powerGenerated
          Watts : 0, //power
          workingHours : 0
        }
      }

      let infors;
      let data = []

      let sum = 0
      let count = 0
      let avg = 0

      infors = await DeviceData.find({ device: devices[j]._id, 
                                       timestamp: {$gte: start, $lte: end } 
                                    })
      // Watts
      for (var i = 0; i < infors.length; i++) {
        let Watts = infors[i].paras.filter(function(item){
          return item.name == 'Watts'
        })
        sum += parseInt(Watts[0].value)
        count = count + 1
      }
      if (count > 0) {
        avg = sum/count
      }else{
        avg = 0
      }
      jsonDevice.paras.Watts = avg;
      jsonDevice.watts = avg

      //WH
      count = 0
      sum = 0
      for (var i = 0; i < infors.length; i++) {
        let WH = infors[i].paras.filter(function(item){
          return item.name == 'WH'
        })
        sum += parseInt(WH[0].value)
        count = count + 1
      }
      if (count > 0) {
        avg = sum/count
      }else{
        avg = 0
      }
      jsonDevice.paras.WH = avg;

      //workingHours 
      let nameplateWatts = devices[j].nameplateWatts
      if (nameplateWatts > 0) {
        jsonDevice.paras.workingHours = jsonDevice.paras.WH / nameplateWatts
      }else{
        jsonDevice.paras.workingHours = 0
      }

      jsonDevice.updated_at = new Date();

      const filter = {timestamp: end, device: devices[j]._id};
      const update = jsonDevice;

      let doc = await HistoryDeviceData.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true // Make this update into an upsert
      });

    }
  }catch(error){
    console.log(error.message)
  }
}

async function StoredStationData(){
  try{
    let start = moment().subtract(5, 'minutes').startOf('minute')
    let end = moment().subtract(5, 'minutes').endOf('minute')

    let stations = await Station.find({is_active: 1});

    for (let j = 0; j < stations.length; j++) {
      let jsonStation = {
        station: stations[j]._id,
        paras: {
          WH : 0,   //kWh powerGenerated
          Watts : 0,    //Power W
          workingHours : 0
        }
        //name: stations[j].name,
      }

      let devices = await Device.find({ station: stations[j]._id })
      let ids = []
      devices.forEach(function(device){
        if (device.is_active == 1) {
          ids.push(device._id)
          //console.log(device._id, device.name)
        }
      })

      let infors;
      let Watts = 0;
      let WH = 0;
      let workingHours = 0

      infors = await HistoryDeviceData.find({ device: { $in: ids }, 
                                              timestamp: {$gte: start, $lte: end } 
                                          })

      //console.log(infors)
      for (var i = 0; i < infors.length; i++) {
        Watts += infors[i].paras.Watts
        WH += infors[i].paras.WH
        workingHours += infors[i].paras.workingHours

      }
        
      jsonStation.paras.Watts = Watts;
      jsonStation.paras.WH = WH;
      jsonStation.paras.workingHours = workingHours;
      
      jsonStation.updated_at = new Date();
      
      const filter = {timestamp: start, station: stations[j]._id};
      const update = jsonStation;

      let doc = await HistoryStationData.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true // Make this update into an upsert
      });
    }
  }catch(error){
    console.log(error.message)
  }
}


//---------------------------------------
// Calc Wh device data -> save
async function StoredWhDeviceData(){
  try{
    let start = moment().subtract(2, 'minutes').startOf('days')
    let end = moment().subtract(2, 'minutes').endOf('days')

    let devices = await Device.find({is_active: 1});
    for (let j = 0; j < devices.length; j++) {
      let jsonDevice = {
        device: devices[j]._id,
        device_name : devices[j].name,
        station: devices[j].station,
        timestamp : start,
        infors: []
      }

      let infors = await DeviceData.find({ device: devices[j]._id, 
                                       timestamp: {$gte: start, $lte: end } 
                                    })

      let TotalWh = 0
      let minWh = 9000000000
      let maxWh = 0
      let minAt
      let maxAt
      infors.map(await function(item){
        let strWh = item.paras.filter(function(it){
          return it.name == 'WH'
        })
        let WH = parseInt(strWh[0].value)
        if (WH > 0) {
          // if (WH < minWh) {
          //   console.log("-->", minWh, strWh, WH, item.timestamp)
          // }
          minWh = WH < minWh ? WH : minWh
          maxWh = WH > maxWh ? WH : maxWh
          if (WH < minWh) {
            minAt = new Date()
          }
          if (WH > maxWh) {
            maxAt = new Date()
          }
        }
      })

      TotalWh = maxWh > minWh ?  maxWh - minWh : 0
      //console.log(maxWh, minWh, TotalWh)
      jsonDevice.wh = TotalWh
      jsonDevice.infors = [
        {min: minWh, minAt: minAt, max: maxWh, maxAt: maxAt }
      ]
      jsonDevice.updated_at = new Date();

      const filter = {timestamp: start, device: devices[j]._id};
      const update = jsonDevice;

      let doc = await WhDeviceData.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true // Make this update into an upsert
      });

    }
  }catch(error){
    console.log(error.message)
  }
}

//---------------------------------------------------------------------
// Service to delete database after 1 day
let before25h;
async function deleteData() {
  before25h = moment().subtract(25, 'hours');
  await DeviceData.deleteMany({ timestamp: { $lte: before25h } });
  await StationData.deleteMany({ timestamp: { $lte: before25h } });
}
//---------------------------------------------------------------------

async function StoredWDeviceData(){
  try{
    let start = moment().subtract(2, 'hours').startOf('days')

    let devices = await Device.find({is_active: 1});
    for (let j = 0; j < devices.length; j++) {
      let jsonDevice = {
        device: devices[j]._id,
        device_name : devices[j].name,
        station: devices[j].station,
        timestamp : start,
        updated_at: new Date(),
        watts: []
      }
      
      jsonDevice.watts = await getWatts(devices[j]._id, start.format('YYYY-MM-DD'))
      
      const filter = {timestamp: start, device: devices[j]._id};
      const update = jsonDevice;

      let doc = await WDeviceData.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true  // Make this update into an upsert
      });
    }
  }catch(error){
    //console.log(error.message)
  }
}

async function getWatts(device, date){
  let start = moment(date).startOf('day')
  let end = moment(date).endOf('day')

  let data = []

  hisStations = await HistoryDeviceData.find({  device: device, 
                                                timestamp: {$gte: start, $lte: end } 
                                            })      
  for (let j = 0; j < 288; j++) {
    sum = 0, count = 0, avg = 0
    let start1 = moment(start).startOf('minute')
    let end1 = moment(start).add(5, 'minutes').startOf('minute')
    let a1 = hisStations.map(x => {
      if (x.timestamp <= end1 && x.timestamp >= start1) {
        sum +=  x.paras.Watts
        count++
        if (count > 0) {
          avg = sum/count
        }else{
          avg = 0
        }
      }
      return avg
    })

    //console.log(j, '-->', start1.format('H:mm:ss'), end1.format('H:mm:ss'), avg)
    data.push(avg)
    start = end1
  }
  return data;
}

//---------------------------------------------------------------------


setInterval(function(){
  StoredWhDeviceData()
}, parseInt(4 * 60000));

setInterval(function(){
  StoredDeviceData()
}, parseInt(process.env.DEVICE_CALC) * 60000);

setInterval(function(){
  StoredStationData()
}, parseInt(process.env.STATION_CALC) * 60000);

//----------------------------------------------------

//========================================================
async function sendAutoMail() {
  let emails = await AutoEmail.find({'is_active': 1})

  for (var i = 0; i < emails.length; i++) {
    email = emails[i]

    let date_start = moment().subtract(email.range, 'days').startOf('days').format('YYYY-MM-DD')
    let date_end = moment().endOf('days').format('YYYY-MM-DD')

    let site = await Station.findOne({_id: email.station})

    const res1 = await axios.post('http://127.0.0.1:5001/download-excel',{
      site_id: email.station,
      date_start: date_start,
      date_end : date_end,
    });
    await delay(500);

    const res_sendmail = await axios.post('http://127.0.0.1:5001/sendmail', {
      site_id: email.station,
      site_name: site.name,
      email_cc: '',
      email_to: email.email_to,
      file_name : res1.data.file_name,
      is_auto : 1,
    })
    await delay(15000);
  }
}

var jobSendMail = new CronJob('0 23 * * *', function() {
  //console.log('You will see this message every minute ' + moment().format('H mm ss'));
  sendAutoMail()
}, null, true, 'Asia/Ho_Chi_Minh');

jobSendMail.start();

//========================================================
// Run job stored w device (0h20p)
var StoredWDeviceJob = new CronJob('20 0 * * *', function() {
  StoredWDeviceData()

  StoredLoadWStationData()

  deleteData()
}, null, true, 'Asia/Ho_Chi_Minh');

StoredWDeviceJob.start();
//========================================================

//---------------------------------------
// Calc kWh station data -> save
async function StoredLoadkWhStationData(){
  try{
    let start = moment().subtract(2, 'minutes').startOf('days')
    let end = moment().subtract(2, 'minutes').endOf('days')

    let stations = await Station.find({is_active: 1});
    for (let j = 0; j < stations.length; j++) {
      let jsStation = {
        station: stations[j]._id,
        station_name : stations[j].name,
        timestamp : start,
        infors: []
      }

      let infors = await StationData.find({ station: stations[j]._id, 
                                       timestamp: {$gte: start, $lte: end } 
                                    })

      let TotalWh = 0
      let minWh = 9000000000
      let maxWh = 0
      let minAt
      let maxAt
      infors.map(await function(item){
        let strWh = item.paras.filter(function(it){
          return it.name == 'kWh'
        })
        let WH = parseInt(strWh[0].value)
        if (WH > 0) {
          // if (WH < minWh) {
          //   console.log("-->", minWh, strWh, WH, item.timestamp)
          // }
          minWh = WH < minWh ? WH : minWh
          maxWh = WH > maxWh ? WH : maxWh
          if (WH < minWh) {
            minAt = new Date()
          }
          if (WH > maxWh) {
            maxAt = new Date()
          }
        }
      })

      TotalWh = maxWh > minWh ?  maxWh - minWh : 0

      jsStation.load_kwh = TotalWh * 1000
      jsStation.infors = [
        {min: minWh, minAt: minAt, max: maxWh, maxAt: maxAt }
      ]
      jsStation.updated_at = new Date();

      const filter = {timestamp: start, station: stations[j]._id};
      const update = jsStation;

      let doc = await LoadWhStationData.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true // Make this update into an upsert
      });

    }
  }catch(error){
    console.log(error)
  }
}

setInterval(function(){
  StoredLoadkWhStationData()
}, parseInt(5 * 60000));


async function CalcLoadWStation(){
  let a = await StationData.findOneAndUpdate({is_update: null},{is_update: 0}).exec()

  let station_data = await StationData.findOne({is_update: 0}).exec(); // {is_update: { $ne: null }}
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
    sum += Watts[0].value
    //console.log(Watts)
  })

  let total = sum + kw[0].value * 1000
  
  let infor = {
    sum : sum,
    consum : kw[0].value * 1000,
    total : total
  };

  let update = {infor: infor, 
                is_update: 1, 
                load_w : total,
                sum_w : infor.sum,
                consum_w : infor.consum
              }

  let result = await StationData.findOneAndUpdate({_id: station_data._id}, update).exec()
}

setInterval(function(){
  CalcLoadWStation()
}, parseInt(60000)); // 10 minutes


//-----------------------------
async function StoredLoadWStationData(){
  try{
    let start = moment().subtract(2, 'hours').startOf('days')

    let stations = await Station.find({is_active: 1});
    for (let j = 0; j < stations.length; j++) {
      let jsStation = {
        station: stations[j]._id,
        station_name : stations[j].name,
        timestamp : start,
        updated_at: new Date(),
        watts: []
      }
      
      jsStation.watts = await getLoadW(stations[j]._id, start.format('YYYY-MM-DD'))
      
      const filter = {timestamp: start, station: stations[j]._id};
      const update = jsStation;

      let doc = await LoadWStationData.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true  // Make this update into an upsert
      });
    }
  }catch(error){
    console.log(error.message)
  }
}


async function getLoadW(station, date){
  let start = moment(date).startOf('day')
  let end = moment(date).endOf('day')

  let data = []

  hisStations = await StationData.find({  station: station, 
                                      timestamp: {$gte: start, $lte: end } 
                                  })      
  for (let j = 0; j < 288; j++) {
    sum = 0, count = 0, avg = 0
    let start1 = moment(start).startOf('minute')
    let end1 = moment(start).add(5, 'minutes').startOf('minute')
    let a1 = hisStations.map(x => {
      if (x.timestamp <= end1 && x.timestamp >= start1) {
        sum +=  x.load_w
        count++
        if (count > 0) {
          avg = sum/count
        }else{
          avg = 0
        }
      }
      return avg
    })

    //console.log(j, '-->', start1.format('H:mm:ss'), end1.format('H:mm:ss'), avg)
    data.push(avg)
    start = end1
  }
  return data;
}

