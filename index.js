require('dotenv').config();
require('express-group-routes');

var bodyParser = require('body-parser')

const express = require('express')
const app = express()
const port = 5300;

var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use((req, res, next) => {
  res.locals.user = "";
  next()
})

var apiStationMeasurement = require('./api/routes/station_measurement.route');
var apiParameter = require('./api/routes/parameter.route');
var apiPidInterface = require('./api/routes/pid_interface.route');

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use('/api/parameter', apiParameter);
app.use('/api/pid_interface', apiPidInterface);

const cookieParser = require('cookie-parser')
app.use(cookieParser()) // use to read format cookie

var engine = require('ejs-locals');
app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.set('views', './views');

//app.use(express.static(path.join(__dirname, 'public')));

// Khai báo Router --------------------------------------------------
var userRouter = require('./routes/user.route');
var authRouter = require('./routes/auth.route');
var stationRouter = require('./routes/station.route');
var datainforRouter = require('./routes/datainfor.route');
var parameterRouter = require('./routes/parameter.route');
var stationParaRouter = require('./routes/station_para.route');
var gcParaRouter = require('./routes/gc_parameter.route');
var pidInterfaceRouter = require('./routes/pid_interface.route');

// var deviceRouter = require('./routes/device.route');

var fontendRouter = require('./routes/fontend/fontend.route');

// var emailRouter = require('./routes/email.route');

//-------------------------------------------------------------------
var mongoose = require('mongoose');
//mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useFindAndModify: false});
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

// app.get('/', function(req, res) {
// 	res.render('layout/index');
// }) 
// Router -----------------------------------------------------------
//app.use('/users', userRouter);
app.use('/auth', authRouter);


// app.use('/station_measurement', stationMeasurementRouter);
// app.use('/device', deviceRouter);
app.use('/', fontendRouter);

// app.use('/email', emailRouter);

app.group("/admin", (router) => {
  router.use('/users', userRouter);
  router.use('/station', stationRouter);
  router.use('/datainfor', datainforRouter);
  router.use('/parameter', parameterRouter);
  router.use('/station-para', stationParaRouter);
  router.use('/gc-parameter', gcParaRouter);
  router.use('/pid-interface', pidInterfaceRouter);
  //router.get("/users", loginController.store); // /api/v1/login 
});

app.use('*', fontendRouter);

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