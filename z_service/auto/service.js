var moment = require('moment');
//const { calc_kwh_diff } = require('./calc_kwh_diff.js');
const CronJob = require('cron').CronJob;


var calc_kwh_sum = require('./calc_kwh_sum.js')
var calc_price_sum = require('./calc_price_sum.js')
var calc_kwh_diff = require('./calc_kwh_diff.js')
var calc_load_kwh_station = require('./calc_load_kwh_station')

var jobCalc = new CronJob('0 1 * * *', async function() {
  await calc_kwh_sum.calc_kwh_sum()     // Tính kwh_sum
  await calc_price_sum.calc_price_sum() // Tính price_sum
  await calc_kwh_diff.calc_kwh_diff() // Tính kwh_diff (chốt số)

}, null, true, 'Asia/Ho_Chi_Minh');


var jobCalcEvery10 = new CronJob('*/10 * * * *', async function() {
  
  await calc_load_kwh_station.calc_load_kwh_station() // Tính price_sum

}, null, true, 'Asia/Ho_Chi_Minh');


jobCalc.start(); //Run at 1h00
jobCalcEvery10.start(); //Run at every 10 minute

calc_load_kwh_station.calc_load_kwh_station()