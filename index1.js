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

// const options1 = {
//   key: fs.readFileSync(process.env.PRIVATE_KEY),
//   cert: fs.readFileSync(process.env.CERT_KEY)
// };

var http = require('http').createServer(app).listen(HTTP_PORT);
//https.createServer(options1, app).listen(HTTPS_PORT)
//----------------------------
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

app.use(userRouter)
app.use(stationRouter)
app.use(deviceRouter)
app.use(siteRouter)
app.use(roleRouter)

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
//   router.use('/parameter', parameterRouter);
//   router.use('/station-para', stationParaRouter);
//   router.use('/gc-parameter', gcParaRouter);
//   router.use('/pid-interface', pidInterfaceRouter);
//   //router.get("/users", loginController.store); // /api/v1/login 
// });

//app.use('*', fontendRouter);

//-------------------------------------------------------------------

// app.listen(port, function(){
// 	console.log(`Server listening on port ${port}!`)
// });



//-------------------------------------------------------------------
//Influx
  // const Influx = require('influxdb-nodejs');
  // const client = new Influx('http://127.0.0.1:8086/mydb');
  // // i --> integer
  // // s --> string
  // // f --> float
  // // b --> boolean
  // const fieldSchema = {
  //   use: 'i',
  //   bytes: 'i',
  //   url: 's',
  // };
  // const tagSchema = {
  //   spdy: ['speedy', 'fast', 'slow'],
  //   method: '*',
  //   // http stats code: 10x, 20x, 30x, 40x, 50x
  //   type: ['1', '2', '3', '4', '5'],
  // };
  // client.schema('http', fieldSchema, tagSchema, {
  //   // default is false
  //   stripUnknown: true,
  // });
  // client.write('http')
  //   .tag({
  //     spdy: 'fast',
  //     method: 'GET',
  //     type: '2',  
  //   })
  //   .field({
  //     use: 300,
  //     bytes: 2312,
  //     url: 'https://github.com/vicanso/influxdb-nodejs',
  //   })
  //   .queue()
  //   .then(() => console.info('write point success'))
  //   .catch(console.error);
  // // https://vicanso.github.io/influxdb-nodejs/Client.html#findOneAndUpdate

// Mqtt
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


const client = mqtt.connect(process.env.MQTT_URL, options );
let data;

client.on("connect", ack => {
  console.log("MQTT Client Connected!");
  //client.subscribe('inverterB/#');
  client.subscribe('SOLAR/#'); // Solar/id/PARAR

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
      //console.log(data, "\n--------------- ", data.timestamp)
      if(str_topic[0] == "SOLAR" && str_topic[2] == "reportEvent"){
        data = JSON.parse(message.toString()) //JSON.parse(message.toString());

        
        //console.log("----->",data )
        if (data) {
          let arr = []
          for (let i = 0; i < data.activeEvents.length; i++) {
            let d = {
              device : str_topic[1],
              event :  data.activeEvents[i].event,
              status : 0,
              timestamp : moment(data.activeEvents[i].timeStamp).add(7, 'hours'),
              updated_at : new Date(),
            }

            let existEvent = await Event.find({device: d.device, event: d.event, status: 0})
            //console.log(existEvent, existEvent.length)
            if (existEvent.length == 0) {
              Event.insertMany([d])
              HistoryEvent.insertMany([d])
            }
            
          }
        }else{
          let clr = await Event.findOneAndUpdate({device: str_topic[1], status: 0},{status: 1})
        }
        //--------------------
        // let backlogs = await Event.find({device: str_topic[1], status: 0})

        // for (let i = 0; i < backlogs.length; i++) {
        //   for (let j = 0; j < data.activeEvents.length; j++) {
        //     let isbool = backlogs[i].event.equals(data.activeEvents[j].event)
        //     if (!isbool) {
        //       Event.findOneAndUpdate({device: str_topic[1], status: 0, event: data.ac},{status: 1})
        //     }
        //   }
        // }

        //let existEvents = await Event.find({device: str_topic[1], status: 0})
        

        
        //console.log(arr)        //let event = new Event(arr)
        
        // let dt1 = new HistoryDeviceData(data)
        // dt1.save();
      }
      
    }catch(error){
      console.log('error', error.message)
    }
      
    //DeviceData.insertMany([data])
  });
});

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
