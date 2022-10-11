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







  