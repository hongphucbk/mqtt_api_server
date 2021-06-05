require('dotenv').config();
require('express-group-routes');
var moment = require('moment'); // require

var bodyParser = require('body-parser')

const express = require('express')
const cors = require('cors');
const app = express()
const HTTP_PORT = parseInt(process.env.HTTP_PORT);
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT);
//----------------------------
const https = require('https');
const fs = require('fs');


var http = require('http').createServer(app).listen(HTTP_PORT);

if(process.env.ENV == "PROD"){
  const options1 = {
    key: fs.readFileSync(process.env.PRIVATE_KEY),
    cert: fs.readFileSync(process.env.CERT_KEY)
  };
  https.createServer(options1, app).listen(HTTPS_PORT)
}
//---------

app.use((req, res, next) => {
  res.locals.user = "";
  next()
})

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

//app.use('/api/parameter', apiParameter);
//app.use('/api/pid_interface', apiPidInterface);

const cookieParser = require('cookie-parser')
app.use(cookieParser()) // use to read format cookie

var engine = require('ejs-locals');
app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(cors());

app.set('views', './views');

app.use(express.json())


//app.use(express.static(path.join(__dirname, 'public')));

// Khai báo Router --------------------------------------------------
const userRouter = require('./routes/user');
const stationRouter = require('./routes/station');
const siteRouter = require('./routes/site');
const deviceRouter = require('./routes/device');
const roleRouter = require('./routes/role');
const deviceTypeRouter = require('./routes/device_type');
const iotDeviceRouter = require('./routes/iot_device');

app.use(userRouter)
app.use(stationRouter)
app.use(deviceRouter)
app.use(siteRouter)
app.use(roleRouter)
app.use(deviceTypeRouter)
app.use(iotDeviceRouter)

//var authRouter = require('./routes/auth.route');
//var stationRouter = require('./routes/station.route');
//var datainforRouter = require('./routes/datainfor.route');
//-------------------------------------------------------------------
var mongoose = require('mongoose');
//mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true});
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

// app.get('/', function(req, res) {
// 	res.render('layout/index');
// }) 
// Router -----------------------------------------------------------
//app.use('/users', userRouter);
//app.use('/auth', authRouter);

// app.use('/station_measurement', stationMeasurementRouter);
// app.use('/device', deviceRouter);
// app.use('/', fontendRouter);
// app.use('/email', emailRouter);

// app.group("/admin", (router) => {
//   //router.use('/users', userRouter);
//   router.use('/station', stationRouter);
//   router.use('/datainfor', datainforRouter);
//   //router.get("/users", loginController.store); // /api/v1/login 
// });

//app.use('*', fontendRouter);
//-------------------------------------------------------------------
// app.listen(port, function(){
// 	console.log(`Server listening on port ${port}!`)
// });

// Mqtt
const mqtt = require('mqtt');
var options = {
    port: 5000,
    //host: 'mqtt://m11.cloudmqtt.com',
    username: 'iot2021',
    password: 'iot2021',
};

//var client = mqtt.connect('mqtt://m11.cloudmqtt.com', options);
const DeviceData = require('./models/DeviceData')
const HistoryDeviceData = require('./models/HistoryDeviceData')
const Event = require('./models/Event')
const HistoryEvent = require('./models/HistoryEvent')
const HistoryDeviceRawData = require('./models/HistoryDeviceRawData')
const AlarmCode = require('./models/AlarmCode')
const Alarm = require('./models/Alarm')

const Queue = require('./common/Queue')
let _queue = new Queue();

const client = mqtt.connect(process.env.MQTT_URL, options );
let data;

client.on("connect", ack => {
  console.log("MQTT Client Connected!");
  //client.subscribe('inverterB/#');
  client.subscribe('SOLAR/#'); // Solar/id/PARAR

  setInterval( function(){
    //let str = '{"activeEvents": [{"event": "UNDER_TEMP", "eventID": 14, "Type": "Alarm", "timeStamp": "2021-05-31 15:46:53.431452"}], "Register": 1, "RegisterStatus": 20}'
    //client.publish('SOLAR/609ea4892aec141dc890ffbb/reportEvent1', str)
  },15000);

  client.on("message", async (topic, message) => {
    //console.log(`MQTT Client Message.  Topic: ${topic}.  Message: ${message.toString()}`);
    try{
      const str_topic = topic.split('/');
    
      if(str_topic[0] == "SOLAR" && str_topic[2] == "reportData"){
        data = JSON.parse(message.toString()) //JSON.parse(message.toString());
        //console.log("----->",data.timeStamp )
        data.device = str_topic[1] //process.env.DEVICE_ID        
        data.timestamp = moment(data.timeStamp).add(7, 'hours')        
        data.updated_at = new Date()
        data.paras =  data.data;
        data.value = 0
        // if (a[1] == "power") {
        //   data.paras = "power"
        // }else if(a[1] == "powerGenerated"){
        //   data.paras = "powerGenerated"
        // }else if(a[1] == "workingHours"){
        //   data.paras = "workingHours"
        // }else{
      
        //let dt = new (data)
        DeviceData.insertMany(data)
        HistoryDeviceRawData.insertMany(data)

        // let dt1 = new HistoryDeviceData(data)
        // dt1.save();
      }


      if(str_topic[0] == "SOLAR" && str_topic[2] == "reportEvent"){
        data = JSON.parse(message.toString())
        processEvent(data, str_topic)
      }
      
    }catch(error){
      console.log('error', error.message)
    }
      
    //DeviceData.insertMany([data])
  });
});


async function processEvent(data, str_topic){
  let alarmCode = data.RegisterStatus;
  let register = data.Register;

  let arrs = []
  let arrAlarms = await Alarm.find({register: register})

  let d = {
    device : str_topic[1],
    register :  register,
    status : alarmCode,
    timestamp : new Date(),
    updated_at : new Date(),
  }

  let jsonEvent = {
    device: str_topic[1],
    register :  register,
    code: 0,
    status: 0,
    description: 'abc',
    timestamp : moment(), //.add(7, 'hours'),
    updated_at : moment(), //.add(7, 'hours'),
  }

  let arrRegister = alarmCode.toString(2).split('').reverse();
  //console.log('arrN ' + arrRegister)

  let oldAlarm = await AlarmCode.findOne({device: str_topic[1], register: register})
  if (!oldAlarm) {
    AlarmCode.insertMany([d])
  }
  let arr2 = oldAlarm.status
  //console.log('arr2 ' + arr2)
  for (var i = 0; i < arrRegister.length; i++) {
    if (arrRegister[i] == 0 && arr2[i] == 1) {
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

    if (arrRegister[i] == 1 && arr2[i] == 0) {
      // New alarm
      //console.log(i +' new alarm')
      jsonEvent.code = i
      jsonEvent.description = arrAlarms[i].description
      //console.log(jsonEvent)
      await Event.insertMany([jsonEvent])
    }
    //arrRegister[i]
  }

  let clr = await AlarmCode.findOneAndUpdate({device: str_topic[1], register: register},{status: arrRegister},{upsert: true})

}

client.on("error", err => {
  console.log(err);
});

// Service to delete database
async function deleteData() {
  let before3h = moment().subtract(3, 'hours');
  let before24h = moment().subtract(24, 'hours');
  //console.log('Cant stop me now!');
  await DeviceData.deleteMany({ timestamp: { $lte: before3h } });
  await Event.deleteMany({ timestamp: { $lte: before24h } });
}

setInterval( deleteData , 5*60000);


