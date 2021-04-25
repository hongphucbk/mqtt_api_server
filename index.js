require('dotenv').config();
require('express-group-routes');
var moment = require('moment'); // require

var bodyParser = require('body-parser')

const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT;


var http = require('http').createServer(app);
var io = require('socket.io')(http);

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

app.listen(port, function(){
	console.log(`Server listening on port ${port}!`)
});



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


const client = mqtt.connect('mqtt://113.161.79.146:5000', options );
let data;

client.on("connect", ack => {
  console.log("MQTT Client Connected!");
  client.subscribe('inverterB/#');

  client.subscribe('SOLAR/#');

  // client.subscribe('SOLAR/607c7e4cba23121608c8fc77/INVERTER7/power');

  // {
  //   //device_id: '607c7e4cba23121608c8fc77',
  //   type: 'power',


  // }
  //client.subscribe('SOLAR/power/607c7e4cba23121608c8fc77/');


  client.on("message", (topic, message) => {
    //console.log(`MQTT Client Message.  Topic: ${topic}.  Message: ${message.toString()}`);
    try{
      const str_topic = topic.split('/');
    
      if(str_topic[0] == "SOLAR"){
        
        data = JSON.parse(message.toString()) //JSON.parse(message.toString());
        data.device = str_topic[1] //process.env.DEVICE_ID        
        data.timestamp = moment(data.timeStamp).add(7, 'hours')        
        data.updated_at = new Date()
        data.paras =  str_topic[2];

        // if (a[1] == "power") {
        //   data.paras = "power"
        // }else if(a[1] == "powerGenerated"){
        //   data.paras = "powerGenerated"
        // }else if(a[1] == "workingHours"){
        //   data.paras = "workingHours"
        // }else{

      }
      //console.log(data, "\n--------------- ", data.timestamp)
      
      let dt = new DeviceData(data)
      dt.save();
      let dt1 = new HistoryDeviceData(data)
      dt1.save()
    }catch(error){
      console.log('error', error)
    }
      
    //DeviceData.insertMany([data])
  });
});

client.on("error", err => {
  console.log(err);
});


// Service to delete database
async function deleteData() {
  let before1h = moment().subtract(2, 'hours');

  //console.log('Cant stop me now!');
  await DeviceData.deleteMany({ timestamp: { $lte: before1h } });
}
setInterval( deleteData , 2*60000);
