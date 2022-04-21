var moment = require('moment');
const CronJob = require('cron').CronJob;


var calc_kwh_sum = require('./calc_kwh_sum.js')
var calc_price_sum = require('./calc_price_sum.js')



var jobCalc = new CronJob('*/1 * * * *', function() {
  
  calc_kwh_sum.calc_kwh_sum()     // Tính kwh_sum
  calc_price_sum.calc_price_sum() // Tính price_sum

  //console.log('------->',moment().format('H mm ss') )

}, null, true, 'Asia/Ho_Chi_Minh');

jobCalc.start();
