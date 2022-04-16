const moment = require('moment');

const chart = {};

module.exports = {
  E40001 : {code: 40001, message: 'System code. Please contact with your admin'},
  E40002 : {error: 40002, message: 'Role is incorrect systax. Please use [SA, AD, US, MA, EN]'},
  E40010 : {code: 40010, message: 'Basetime or type is incorrect. [day - power, month/year - energy]'},
  E40011 : {code: 40011, message: 'Username or passwork is incorrect'},
  E40012 : {code: 40012, message: 'There are no data in device data'},
  E40013 : {code: 40013, message: 'Device id is incorrect'},
  E40014 : {code: 40014, message: 'Can not find user. Maybe user id is incorrect'},
  E40015 : {code: 40015, message: 'Param \'access\' is incorrect. Please use in [true or false]'},
  E40016 : {code: 40016, message: 'There are no sites assigned for your user. Please contact with your admin'},
  E40017 : {code: 40017, message: 'Email is duplicated. Please change other email'},
  E40018 : {code: 40018, message: 'Password is must at list 3 characters'},
  E40019 : {code: 40019, message: 'Not authorized to access this resource. Please login again'},


  E40020 : {code: 40020, message: 'Email is incorrect'},
  E40021 : {code: 40021, message: 'Password is incorrect'},
  E40022 : {code: 40022, message: 'Unauthorized'},

  E40100 : {code: 40100, message: 'The site name is exist in database'},
  E40101 : {code: 40101, message: 'The site name is required'},
  E40102 : {code: 40102, message: 'The price is required'},
  E40103 : {code: 40103, message: 'The currency is required'},
  E40104 : {code: 40104, message: 'The status is incorrect'},

  E40200 : {code: 40200, message: 'The iot name is exist in database'},
  E40201 : {code: 40201, message: 'The iot name is required'},
  E40202 : {code: 40202, message: 'The iot code is required'},
  E40203 : {code: 40203, message: 'The site_id is required'},
  E40204 : {code: 40204, message: 'IOT Code is incorrect'},

  //Device
  E40300 : {code: 40300, message: 'The device name is exist in database'},
  E40301 : {code: 40301, message: 'Device type is required'},

  E40305 : {code: 40305, message: 'Basetime is incorrect. [month or year]'},


  E40400 : {code: 40400, message: 'Can not find user'},


  E40500 : {code: 40500, message: 'Can not find device'},

  E40600 : {code: 40600, message: 'Can not find site'},

  E40700 : {code: 40700, message: 'Status event is incorrect'},
  E40701 : {code: 40701, message: 'Event type is incorrect'},

  // add
  E40800 : {code: 40800, message: 'Device is not active or dont have data'},

  //Report
  E41000 : {code: 41000, message: 'The distance between start date and end date is too far. Select data in 2 months range'},
  E41001 : {code: 41001, message: 'Too many requests from this IP, please try again after 10s'},
  E41002 : {code: 41002, message: '"Range" value is incorrect. Refer value [1, 7, 14, 30]'},



  //

}

