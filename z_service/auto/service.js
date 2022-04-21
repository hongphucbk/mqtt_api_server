var moment = require('moment');
//const { calc_kwh_diff } = require('./calc_kwh_diff.js');
const CronJob = require('cron').CronJob;


var calc_kwh_sum = require('./calc_kwh_sum.js')
var calc_price_sum = require('./calc_price_sum.js')
var calc_kwh_diff = require('./calc_kwh_diff.js')

//calc_kwh_diff.calc_kwh_diff()


var jobCalc = new CronJob('0 1 * * *', async function() {
  
  await calc_kwh_sum.calc_kwh_sum()     // Tính kwh_sum

  await calc_price_sum.calc_price_sum() // Tính price_sum

  await calc_kwh_diff.calc_kwh_diff() // Tính price_sum

  //console.log('------->',moment().format('H mm ss') )

}, null, true, 'Asia/Ho_Chi_Minh');

jobCalc.start();
