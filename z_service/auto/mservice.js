var moment = require('moment');
//const { calc_kwh_diff } = require('./calc_kwh_diff.js');
const CronJob = require('cron').CronJob;


var calc_kwh_3_auto = require('./calc_kwh_3_auto.js')
var calc_price_sum = require('../manual/calc_price_sum.js')
var calc_load_kwh_station = require('../manual/calc_load_kwh_station.js')
var calc_station_3price_auto = require('./calc_station_3price_auto')

var calc_station_load_w = require('./calc_station_load_w')
var calc_billing = require('./calc_billing')
var check_status = require('./check_status')

//====================================================================
var jobCalc0h30 = new CronJob('30 0 * * *', async function() {
  //let start = moment().subtract(10, 'hours').startOf('days')
  //await calc_kwh_3_auto.index(start)                // Tính lại kwh_3
}, null, true, 'Asia/Ho_Chi_Minh');



// Job Call billing
//var jobCalc0h50 = new CronJob('50 0 * * *', async function() {
  //await calc_billing.calc_billing(moment()) //
  //await calc_billing.calc_invoice_send_mail(moment()) // Tính price_sum
  
//}, null, true, 'Asia/Ho_Chi_Minh');

// var jobCalc1h30 = new CronJob('30 1 * * *', async function() {
//   await calc_billing.calc_invoice_send_mail(moment()) // Tính price_sum

// }, null, true, 'Asia/Ho_Chi_Minh');

//================================================================
  // Every
  var jobCalcEvery10 = new CronJob('*/5 * * * *', async function() {
    //await calc_load_kwh_station.calc_load_kwh_station()
    //await check_status.station_status()
    //await check_status.device_status()


  }, null, true, 'Asia/Ho_Chi_Minh');

  //Every 1h
  var jobCalcEvery1h = new CronJob('0 * * * *', async function() {
    //await calc_station_load_w.index()     //Update again load_w for station

  }, null, true, 'Asia/Ho_Chi_Minh');

  //Every 30s
  var jobCalcEvery30s = new CronJob('*/30 * * * * *', async function() {
      await calc_station_load_w.CalcLoadWStation()  


  }, null, true, 'Asia/Ho_Chi_Minh');
  
//================================================================




//================================================================

jobCalcEvery10.start()
jobCalcEvery30s.start()


