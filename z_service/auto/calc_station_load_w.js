require('dotenv').config();
var moment = require('moment');

var bodyParser = require('body-parser')
const express = require('express')
//-------------------------------------------------------------------
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, 
  {useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false});

const StationData = require('../../models/StationData')

// 2022-07-31
// Update is_update = 0 to recalc load_w for station
module.exports.index = async function(){
  let start = moment().subtract(1, 'hours')
  let end = moment()

  let filter = { timestamp: {$gte: start, $lte: end } }
  let update = {is_update: 0}

  await StationData.updateMany(filter, update)

}



