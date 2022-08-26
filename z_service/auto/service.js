var moment = require('moment');
//const { calc_kwh_diff } = require('./calc_kwh_diff.js');
const CronJob = require('cron').CronJob;


var calc_kwh_3_auto = require('./calc_kwh_3_auto.js')
var calc_price_sum = require('./calc_price_sum.js')
var calc_load_kwh_station = require('./calc_load_kwh_station')
var calc_station_3price_auto = require('./calc_station_3price_auto')

var calc_station_load_w = require('./calc_station_load_w')
var calc_billing = require('./calc_billing')

var jobCalc0h30 = new CronJob('30 0 * * *', async function() {
  await calc_kwh_3_auto.index                // Tính lại kwh_3
}, null, true, 'Asia/Ho_Chi_Minh');

var jobCalc0h35 = new CronJob('35 0 * * *', async function() {
  await calc_station_3price_auto.index()
  await calc_price_sum.calc_price_sum() // Tính price_sum
}, null, true, 'Asia/Ho_Chi_Minh');

// Job Call billing
var jobCalc0h40 = new CronJob('40 0 * * *', async function() {
  await calc_billing.calc_billing(moment()) //
  //await calc_billing.calc_invoice_send_mail(moment()) // Tính price_sum
  
}, null, true, 'Asia/Ho_Chi_Minh');

var jobCalc0h45 = new CronJob('45 0 * * *', async function() {
  await calc_billing.calc_invoice_send_mail(moment()) // Tính price_sum

}, null, true, 'Asia/Ho_Chi_Minh');

//================================================================
  // Every
  var jobCalcEvery10 = new CronJob('*/10 * * * *', async function() {
    await calc_load_kwh_station.calc_load_kwh_station() // Tính load_kwh_station
  }, null, true, 'Asia/Ho_Chi_Minh');

  //Every 1h
  var jobCalcEvery1h = new CronJob('0 * * * *', async function() {
    await calc_station_load_w.index()     //Update again load_w for station

  }, null, true, 'Asia/Ho_Chi_Minh');
//================================================================

jobCalc0h30.start()
jobCalc0h35.start()
jobCalc0h40.start()
jobCalc0h45.start()

jobCalcEvery10.start()
jobCalcEvery1h.start()