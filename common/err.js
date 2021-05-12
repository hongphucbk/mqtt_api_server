const moment = require('moment');

const chart = {};

module.exports = {
  E40001 : {code: 40001, message: 'System code. Please contact with your admin'},
  E40002 : {error: 40002, message: 'Role is incorrect systax. Please use [SA, AD, US]'},
  E40010 : {code: 40010, message: 'Basetime or type is incorrect'},
  E40011 : {code: 40011, message: 'Username or passwork is incorrect'},
  E40012 : {code: 40012, message: 'There is no data in device data'},
  E40013 : {code: 40013, message: 'Device id is incorrect'},
  E40014 : {code: 40014, message: 'Can not find user. Maybe user id is incorrect'},
  E40015 : {code: 40015, message: 'Param \'access\' is incorrect. Please use in [true or false]'},

  E40020 : {code: 40020, message: 'Email is incorrect'},
  E40021 : {code: 40021, message: 'Password is incorrect'},
}