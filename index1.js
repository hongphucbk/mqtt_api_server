require('dotenv').config();
require('express-group-routes');
var moment = require('moment'); // require
var mongoose = require('mongoose');

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

mongoose.connect(process.env.MONGO_URL, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  useFindAndModify: false});

//app.use(express.static(path.join(__dirname, 'public')));

// Khai báo Router --------------------------------------------------
const userRouter = require('./routes/user');
const stationRouter = require('./routes/station');
const siteRouter = require('./routes/site');
const deviceRouter = require('./routes/device');
const roleRouter = require('./routes/role');
const deviceTypeRouter = require('./routes/device_type');
const iotDeviceRouter = require('./routes/iot_device');
const eventRouter = require('./routes/event');

const reportRouter = require('./routes/report');

app.use(userRouter)
app.use(stationRouter)
app.use(deviceRouter)
app.use(siteRouter)
app.use(roleRouter)
app.use(deviceTypeRouter)
app.use(iotDeviceRouter)
app.use(eventRouter)
app.use(reportRouter)

//var authRouter = require('./routes/auth.route');
//var stationRouter = require('./routes/station.route');
//var datainforRouter = require('./routes/datainfor.route');
//-------------------------------------------------------------------

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





// async function manualUpdate(){
//   let a = await HistoryDeviceData.updateMany({device: '609ea4982aec141dc890ffbd' ,
//                                        timestamp: { $gte: "2021-06-20T20:04:00.000+07:00",
//                                        $lte: "2021-06-21T05:19:00.000+07:00" }},
//                                             { $set: { "paras.WH": 16198290, "paras.workingHours": 154.269428571429 } }) 
  

//   //let a = await HistoryDeviceData.find()                                            //{paras : true });
//   console.log("result", a)
// }

// manualUpdate()
const HistoryStationData = require('./models/HistoryStationData')

// async function manualUpdateStation(){
//   let a = await HistoryStationData.updateMany({station: '607c7e23ba23121608c8fc69' ,
//                                        timestamp: { $gte: "2021-07-05T00:00:01.000+07:00",
//                                        $lte: "2021-07-05T22:50:59.000+07:00" }},
//                                             { $set: { "paras.WH": 42876710, "paras.workingHours": 413 } }) 
  

//   //let a = await HistoryDeviceData.find()                                            //{paras : true });
//   console.log("result", a)
// }

//manualUpdateStation()
