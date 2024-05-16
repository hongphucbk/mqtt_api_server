const express = require('express')
const User = require('../models/User')
const Station = require('../models/Station')
const auth = require('../middlewares/auth')
const role = require('../middlewares/role')
const Device = require('../models/Device')
const DeviceData = require('../models/DeviceData')
const HistoryDeviceData = require('../models/HistoryDeviceData')

const random = require('random')
const router = express.Router()

var controller = require('../controllers/report_web.controller');
var middleware = require('../middlewares/auth_web');




router.get('/', middleware.requireAuth, controller.getReport2);
router.post('/', middleware.requireAuth, controller.postReport2);

//router.get('/', controller.list);


module.exports = router;