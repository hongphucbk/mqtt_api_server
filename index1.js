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
const emailRouter = require('./routes/email.route');

app.use(userRouter)
app.use(stationRouter)
app.use(deviceRouter)
app.use(siteRouter)
app.use(roleRouter)
app.use(deviceTypeRouter)
app.use(iotDeviceRouter)
app.use(eventRouter)
app.use(reportRouter)
app.use(emailRouter)

var authRouter = require('./routes/auth.route');
var reportWebRouter = require('./routes/report.route');
var fontendRouter = require('./routes/fontend.route');
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

app.group("/member", (router) => {
  router.use('/auth', authRouter);
  router.use('/report', reportWebRouter);
  //router.use('/station', stationRouter);
  //router.use('/datainfor', datainforRouter);
  //router.get("/users", loginController.store); // /api/v1/login 
});

app.use('/', fontendRouter);

//app.use('*', fontendRouter);
//-------------------------------------------------------------------
// app.listen(port, function(){
// 	console.log(`Server listening on port ${port}!`)
// });



