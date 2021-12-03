require('dotenv').config();
var moment = require('moment');
var mongoose = require('mongoose');

var bodyParser = require('body-parser')
const express = require('express')
//-------------------------------------------------------------------
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const User = require('./models/User')
const Station = require('./models/Station')
const auth = require('./middlewares/auth')
const role = require('./middlewares/role')

//---------------------------------------------------------------
// Defind model
const Device = require('./models/Device')
const DeviceData = require('./models/DeviceData')
const HistoryDeviceData = require('./models/HistoryDeviceData')
const HistoryStationData = require('./models/HistoryStationData')
const WhDeviceData = require('./models/WhDeviceData')
const Event = require('./models/Event')
const HistoryEvent = require('./models/HistoryEvent')
const HistoryDeviceRawData = require('./models/HistoryDeviceRawData')
const AlarmCode = require('./models/AlarmCode')
const Alarm = require('./models/Alarm')
const StationData = require('./models/StationData')

//---------------------------------------------------------------
// Mqtt
const mqtt = require('mqtt');
var options = {
    port: 5000,
    //host: 'mqtt://m11.cloudmqtt.com',
    username: 'iot2021',
    password: 'iot2021',
};

//var client = mqtt.connect('mqtt://m11.cloudmqtt.com', options);

const Queue = require('./common/Queue')
let _queue = new Queue();

const client = mqtt.connect(process.env.MQTT_URL, options );
let data;

client.on("connect", ack => {
  console.log("MQTT Client Connected!");
  client.subscribe('SOLAR/#'); // Solar/id/PARAR
  client.subscribe('STATION/#'); // Solar/id/PARAR
  client.on("message", async (topic, message) => {
    //console.log(`MQTT Client Message.  Topic: ${topic}.  Message: ${message.toString()}`);
    try{
      const str_topic = topic.split('/');
      if(str_topic[0] == "SOLAR" && str_topic[2] == "reportData"){
        data = JSON.parse(message.toString())
        //console.log("----->",data.timeStamp )
        data.device = str_topic[1] //process.env.DEVICE_ID        
        data.timestamp = moment(data.timeStamp).add(7, 'hours')        
        data.updated_at = new Date()
        data.paras =  data.data;
        data.value = 0

        DeviceData.insertMany(data)
        HistoryDeviceRawData.insertMany(data)
        Device.findOneAndUpdate({_id: str_topic[1]}, {updated_at: new Date()}, function(){})
      }

      if(str_topic[0] == "SOLAR" && str_topic[2] == "reportEvent"){
        data = JSON.parse(message.toString())
        processEvent(data, str_topic)
      }

      if(str_topic[0] == "STATION" && str_topic[2] == "reportData"){
      if (str_topic[1] != "60ca422f05c9e02304f88b27") {
      data = JSON.parse(message.toString())
      //console.log("----->",data )
      data.station = str_topic[1] //process.env.DEVICE_ID        
      data.timestamp = moment(data.timeStamp).add(7, 'hours')        
      data.updated_at = new Date()
      data.paras =  data.data;
      StationData.insertMany(data)
      }

      if (str_topic[1] == "60ca422f05c9e02304f88b27" ) {
      data = JSON.parse(message.toString())
      //console.log("----->",data )
      data.station = "6195f8617fd2a1dbf860af4a" //process.env.DEVICE_ID        
      data.timestamp = moment(data.timeStamp).add(7, 'hours')        
      data.updated_at = new Date()
      data.paras =  data.data;
      StationData.insertMany(data)
      }

      
        
        //HistoryDeviceRawData.insertMany(data)
        //Device.findOneAndUpdate({_id: str_topic[1]}, {updated_at: new Date()}, function(){})
      }
    }catch(error){
      console.log('error', error.message)
    }
  });
});


async function processEvent(data, str_topic){
  let alarmCode = data.RegisterStatus;
  let register = data.Register;

  let arrs = []
  let arrAlarms = await Alarm.find({register: register})
  let device = await Device.findOne({_id: str_topic[1]})
  let site_id = null
  if (device) {
    site_id = device.station
  }

  let arrRegister = alarmCode.toString(2).split('').reverse();
  for (let i = 0; i <= 15; i++) {
    arrRegister[i] = arrRegister[i] != null ? arrRegister[i] : 0
  }

  let d = {
    device : str_topic[1],
    register :  register,
    status : arrRegister,
    timestamp : new Date(),
    updated_at : new Date(),
  }

  let jsonEvent = {
    station: site_id,
    device: str_topic[1],
    register :  register,
    eventType : 'alarm',
    code: 0,
    status: 0,
    description: '',
    timestamp : moment(), //.add(7, 'hours'),
    updated_at : moment(), //.add(7, 'hours'),
  }

  let oldAlarm = await AlarmCode.findOne({device: str_topic[1], register: register})
  //console.log('oldAlarm ',oldAlarm)

  let arr2 = []
  for (let i = 0; i <= 15; i++) {
    arr2.push(0)
  }

  if (!oldAlarm) {
    await AlarmCode.insertMany([d])
  }else{
    arr2 = oldAlarm.status
  }
  //console.log('arrN ' + arrRegister)
  //console.log('arr2 ' + arr2)
  for (var i = 0; i < arrRegister.length; i++) {
    if (arrRegister[i] == 0 && arr2[i] == 1 && i <= 15) {
      //console.log(i + ' - old alarm')
      await Event.findOneAndUpdate({
        device: str_topic[1], 
        register: register, 
        code: i, 
        status: 0
      },
      { status: 1,
        completed_at: moment(),
      },
      {upsert: false}
      )
    }

    if (arrRegister[i] == 1 && arr2[i] == 0 && i <= 15) {
      // New alarm
      //console.log(i +' new alarm')
      jsonEvent.code = i
      jsonEvent.description = arrAlarms[i].description
      //console.log(jsonEvent)
      await Event.insertMany([jsonEvent])
    }
  }

  let clr = await AlarmCode.findOneAndUpdate({device: str_topic[1], register: register},{status: arrRegister, updated_at: moment()},{upsert: true})
}

client.on("error", err => {
  console.log(err);
});






