const express = require('express')
const moment = require('moment'); // require
const excel = require('node-excel-export');
const xl = require('excel4node');

var pdf = require("pdf-creator-node");
var fs = require("fs");
var path = require("path");
//-- User defind

const User = require('../models/User')
const Station = require('../models/Station')
const Device = require('../models/Device')
const auth = require('../middlewares/auth')
const DeviceData = require('../models/DeviceData')
const HistoryDeviceData = require('../models/HistoryDeviceData')
const HistoryDeviceRawData = require('../models/HistoryDeviceRawData')
const WhDeviceData = require('../models/WhDeviceData')
const WDeviceData = require('../models/WDeviceData')
const LoadStationData = require('../models/LoadStationData')
const StationData = require('../models/StationData')
const LoadWhStationData = require('../models/LoadWhStationData')
const WhStation3Price = require('../models/WhStation3Price')
const WhDeviceData3 = require('../models/WhDeviceData3')
const IndexStation = require('../models/IndexStation')

const rvn = require('read-vietnamese-number')
const axios = require('axios');
const err = require('../common/err');
const Invoice = require('../models/Invoice.model');
const AutoEmail = require('../models/AutoEmail');
const Report = require('../models/Report');
const ManualEmail = require('../models/ManualEmail');
const ManualReportLog = require('../models/ManualReportLog');
const delay = require('delay');

//----------------------------------------------------------
function number_format(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


module.exports.getReport = async function(req, res) {
	let stations = await Station.find({is_report: 1});

  res.redirect('/');
  return;

	res.render('fontend/report', {
		stations: stations,
	})
};

module.exports.postReport = async function(req, res) {
	try{
		let site_id = req.body.site_id; //'607c7e23ba23121608c8fc69' //req.query.site_id
		let date_end = req.body.date_end ? req.body.date_end : moment().endOf('days').format('YYYY-MM-DD')
		let date_start = req.body.date_start ? req.body.date_start : moment(date_end).subtract(30, 'day').format('YYYY-MM-DD')
    let report_id = req.body.report_id

    //console.log(date_start)

    let dt = {
      station: site_id,
      date_start: date_start,
      date_end: date_end,
      report: report_id,
      user: req.user
    }

    console.log(dt)

    let rs = await ManualEmail.insertMany(dt)
    let manual_email = rs[0]

		let StartDate = moment(date_start).startOf('days');
    let EndDate 	= moment(date_end).endOf('days');
    let DateLengh = EndDate.diff(StartDate, 'days');
    if (DateLengh > 90) {
    	res.send(err.E41000)
    }

		let site = await Station.findOne({_id: site_id})

    //console.log(manual_email._id)


  
    let price3s = await WhStation3Price.find({station: site_id, timestamp: { $gte : StartDate, $lte : EndDate } })

	var wb = new xl.Workbook();
	  var ws = wb.addWorksheet('Sheet 1');
	  ws.addImage({
			path: './public/img/ntv.png',
			type: 'picture',
			position: {
			  type: 'twoCellAnchor',
			  from: {
				col: 1,
				colOff: 0,
				row: 1,
				rowOff: 0,
			  },
			  to: {
				col: 3,
				colOff: '0.5in',
				row: 5,
				rowOff: 0,
			  },
  
			},
  
		});
  
		  // Create a reusable style
		  var style = wb.createStyle({
			font: {
			  color: '#000000',
			  size: 13,
			},
		  });
  
		  var HeaderStyle = wb.createStyle({
			font: {
			  color: '#022154',
			  size: 13,
			  name: 'Arial',
			},
			alignment: {
			  wrapText: true,
			  horizontal: 'left',
			},
		  });
  
		  ws.column(3).setWidth(16);
		  ws.column(4).setWidth(18);
		  ws.column(5).setWidth(15);
  
		  //Title---------------------
			// Set value of cell A7.
			  ws.cell(1, 4).string('CÔNG TY TNHH TM NTV')
				.style({font: {
				  color: '#022154',
				  size: 16,
				  name: 'Arial'
				}})
  
			  // Set value of cell B7.
			  ws.cell(2, 4).string('BÁO CÁO NĂNG LƯỢNG THIẾT BỊ')
				.style({
					font: {
					  color: '#060b9c',
					  size: 14,
					  name: 'Arial'
					},
				  });
  
			  // Set value of cell B7.
			  ws.cell(3, 4).string('Từ ngày:').style(HeaderStyle)
			  ws.cell(4, 4).string('Đến ngày:').style(HeaderStyle)
			  ws.cell(5, 4).string('Trạm:').style(HeaderStyle)
		  //Header---------------------
			  let header_row = 7
			  // Set value of cell A7.
			  ws.cell(header_row, 1).string('STT').style(HeaderStyle);
			  ws.cell(header_row, 2).string('Ngày').style(HeaderStyle)
			  ws.cell(header_row, 3).string('kWh Thấp điểm (kWh)').style(HeaderStyle)  
			  ws.cell(header_row, 4).string('kWh Bình thường (kWh)').style(HeaderStyle) 
			  ws.cell(header_row, 5).string('kWh Cao điểm (kWh)').style(HeaderStyle) 
			  ws.cell(header_row, 6).string('Tổng (kWh)').style(HeaderStyle) 
			
		  //Fill to report
		  // Fill from date.
			  ws.cell(3, 5)
				.string(moment(date_start).startOf('days')
																	.format('DD-MM-YYYY'))
				.style(HeaderStyle)
  
			  // Set value of cell B7.
			  ws.cell(4, 5)
				.string(moment(date_end).startOf('days')
																.format('DD-MM-YYYY'))
				.style(HeaderStyle)
  
			  // Set value of cell B7.
			  ws.cell(5, 5, 5, 10, true)
				.string(site.name)
				.style(HeaderStyle)
				.style({font : {
					color: '#0a9103',
					bold: true,
  
				}})
  
      for (var i = 0; i < price3s.length; i++) {
        price3 = price3s[i]
        console.log(price3)
        let row = i + header_row + 1;
                
        let localDate = moment(price3.timestamp).add(7, 'hours')

        ws.cell(row, 1).number(i+1).style(style);
        ws.cell(row, 2).date(localDate).style({numberFormat: 'dd-mm-yyyy'})
        ws.cell(row, 3).number(price3.kwh_td)
          .style({style, numberFormat: '#,###; (#,###); -'});
        ws.cell(row, 4).number(price3.kwh_bt + price3.kwh_diff)
          .style({style, numberFormat: '#,###; (#,###); -'});

        ws.cell(row, 5).number(price3.kwh_cd)
          .style({style, numberFormat: '#,###; (#,###); -'});
        ws.cell(row, 6).number(price3.total_kwh)
          .style({style, numberFormat: '#,###; (#,###); -'});
        
      }

	  
		  wb.write('RP_' + convertViToEn(site.name,true) + ' From ' + date_start + ' To ' + date_end + '.xlsx', res); // moment().format('YYYYMMDD_Hmmss')
      return "OK"
    return
	}catch(e){
    console.log(e)
		res.send(e)
    return
	}
};



function convertViToEn(str, toUpperCase = false) {
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư

  return toUpperCase ? str.toUpperCase() : str;
}





//==========================================================
module.exports.getReportManualNew = async function(req, res) {
	try{
		let site_id = req.query.site_id; //'607c7e23ba23121608c8fc69' //req.query.site_id
		let email_to = req.query.email_to; 
		let email_cc = req.query.email_cc; 
		let date_end = req.query.date_end ? req.query.date_end : moment().endOf('days').format('YYYY-MM-DD')
		let date_start = req.query.date_start ? req.query.date_start : moment(date_end).subtract(30, 'day').format('YYYY-MM-DD')
    let report_id = req.query.report_id

    let dt = {
      station: site_id,
      date_start: date_start,
      date_end: date_end,
      report: report_id,
      user: req.user
    }

    let rs = await ManualEmail.insertMany(dt)
    let manual_email = rs[0]

		let StartDate = moment(date_start).startOf('days');
    let EndDate 	= moment(date_end).endOf('days');
    let DateLengh = EndDate.diff(StartDate, 'days');
    if (DateLengh > 90) {
    	res.send(err.E41000)
    }

		let site = await Station.findOne({_id: site_id})

    console.log(manual_email._id)


  
    let price3s = await WhStation3Price.find({station: site_id, timestamp: { $gte : StartDate, $lte : EndDate } })

	var wb = new xl.Workbook();
	  var ws = wb.addWorksheet('Sheet 1');
	  ws.addImage({
			path: './public/img/ntv.png',
			type: 'picture',
			position: {
			  type: 'twoCellAnchor',
			  from: {
				col: 1,
				colOff: 0,
				row: 1,
				rowOff: 0,
			  },
			  to: {
				col: 3,
				colOff: '0.5in',
				row: 5,
				rowOff: 0,
			  },
  
			},
  
		});
  
		  // Create a reusable style
		  var style = wb.createStyle({
			font: {
			  color: '#000000',
			  size: 13,
			},
		  });
  
		  var HeaderStyle = wb.createStyle({
			font: {
			  color: '#022154',
			  size: 13,
			  name: 'Arial',
			},
			alignment: {
			  wrapText: true,
			  horizontal: 'left',
			},
		  });
  
		  ws.column(3).setWidth(16);
		  ws.column(4).setWidth(18);
		  ws.column(5).setWidth(15);
  
		  //Title---------------------
			// Set value of cell A7.
			  ws.cell(1, 4).string('CÔNG TY TNHH TM NTV')
				.style({font: {
				  color: '#022154',
				  size: 16,
				  name: 'Arial'
				}})
  
			  // Set value of cell B7.
			  ws.cell(2, 4).string('BÁO CÁO NĂNG LƯỢNG THIẾT BỊ')
				.style({
					font: {
					  color: '#060b9c',
					  size: 14,
					  name: 'Arial'
					},
				  });
  
			  // Set value of cell B7.
			  ws.cell(3, 4).string('Từ ngày:').style(HeaderStyle)
			  ws.cell(4, 4).string('Đến ngày:').style(HeaderStyle)
			  ws.cell(5, 4).string('Trạm:').style(HeaderStyle)
		  //Header---------------------
			  let header_row = 7
			  // Set value of cell A7.
			  ws.cell(header_row, 1).string('STT').style(HeaderStyle);
			  ws.cell(header_row, 2).string('Ngày').style(HeaderStyle)
			  ws.cell(header_row, 3).string('kWh Thấp điểm (kWh)').style(HeaderStyle)  
			  ws.cell(header_row, 4).string('kWh Bình thường (kWh)').style(HeaderStyle) 
			  ws.cell(header_row, 5).string('kWh Cao điểm (kWh)').style(HeaderStyle) 
			  ws.cell(header_row, 6).string('Tổng (kWh)').style(HeaderStyle) 
			
		  //Fill to report
		  // Fill from date.
			  ws.cell(3, 5)
				.string(moment(date_start).startOf('days')
																	.format('DD-MM-YYYY'))
				.style(HeaderStyle)
  
			  // Set value of cell B7.
			  ws.cell(4, 5)
				.string(moment(date_end).startOf('days')
																.format('DD-MM-YYYY'))
				.style(HeaderStyle)
  
			  // Set value of cell B7.
			  ws.cell(5, 5, 5, 10, true)
				.string(site.name)
				.style(HeaderStyle)
				.style({font : {
					color: '#0a9103',
					bold: true,
  
				}})
  
      for (var i = 0; i < price3s.length; i++) {
        price3 = price3s[i]
        console.log(price3)
        let row = i + header_row + 1;
                
        let localDate = moment(price3.timestamp).add(7, 'hours')

        ws.cell(row, 1).number(i+1).style(style);
        ws.cell(row, 2).date(localDate).style({numberFormat: 'dd-mm-yyyy'})
        ws.cell(row, 3).number(price3.kwh_td)
          .style({style, numberFormat: '#,###; (#,###); -'});
        ws.cell(row, 4).number(price3.kwh_bt + price3.kwh_diff)
          .style({style, numberFormat: '#,###; (#,###); -'});

        ws.cell(row, 5).number(price3.kwh_cd)
          .style({style, numberFormat: '#,###; (#,###); -'});
        ws.cell(row, 6).number(price3.total_kwh)
          .style({style, numberFormat: '#,###; (#,###); -'});
        
      }

	  
		  wb.write('RP_' + site.name + '.xlsx', res); // moment().format('YYYYMMDD_Hmmss')
      return "OK"
    //return
	}catch(e){
    console.log(e.message)
		res.send(e)
    return
	}
};

//-- Version 2
module.exports.getReport2 = async function(req, res) {
	let stations = await Station.find({is_report: 1});
	user = res.user
	console.log(user.stations)
	res.render('admin/report/add', {
		stations: stations,
		user : user,
	})
};

module.exports.postReport2 = async function(req, res) {
	try{
		let site_id = req.body.site_id; //'607c7e23ba23121608c8fc69' //req.query.site_id
		let date_end = req.body.date_end ? req.body.date_end : moment().endOf('days').format('YYYY-MM-DD')
		let date_start = req.body.date_start ? req.body.date_start : moment(date_end).subtract(30, 'day').format('YYYY-MM-DD')
    let report_id = req.body.report_id

    //console.log(date_start)

    let dt = {
      station: site_id,
      date_start: date_start,
      date_end: date_end,
      report: report_id,
      user: res.user
    }

    let result = await ManualReportLog.insertMany(dt)

    //console.log(dt)

    let rs = await ManualEmail.insertMany(dt)
    let manual_email = rs[0]

		let StartDate = moment(date_start).startOf('days');
    let EndDate 	= moment(date_end).endOf('days');
    let DateLengh = EndDate.diff(StartDate, 'days');
    if (DateLengh > 90) {
    	res.send(err.E41000)
    }

		let site = await Station.findOne({_id: site_id})

    //console.log(manual_email._id)


  
    let price3s = await WhStation3Price.find({station: site_id, timestamp: { $gte : StartDate, $lte : EndDate } })

	var wb = new xl.Workbook();
	  var ws = wb.addWorksheet('Sheet 1');
	  ws.addImage({
			path: './public/img/ntv.png',
			type: 'picture',
			position: {
			  type: 'twoCellAnchor',
			  from: {
				col: 1,
				colOff: 0,
				row: 1,
				rowOff: 0,
			  },
			  to: {
				col: 3,
				colOff: '0.5in',
				row: 5,
				rowOff: 0,
			  },
  
			},
  
		});
  
		  // Create a reusable style
		  var style = wb.createStyle({
			font: {
			  color: '#000000',
			  size: 13,
			},
		  });
  
		  var HeaderStyle = wb.createStyle({
			font: {
			  color: '#022154',
			  size: 13,
			  name: 'Arial',
			},
			alignment: {
			  wrapText: true,
			  horizontal: 'left',
			},
		  });
  
		  ws.column(3).setWidth(16);
		  ws.column(4).setWidth(18);
		  ws.column(5).setWidth(15);
  
		  //Title---------------------
			// Set value of cell A7.
			  ws.cell(1, 4).string('CÔNG TY TNHH TM NTV')
				.style({font: {
				  color: '#022154',
				  size: 16,
				  name: 'Arial'
				}})
  
			  // Set value of cell B7.
			  ws.cell(2, 4).string('BÁO CÁO NĂNG LƯỢNG THIẾT BỊ')
				.style({
					font: {
					  color: '#060b9c',
					  size: 14,
					  name: 'Arial'
					},
				  });
  
			  // Set value of cell B7.
			  ws.cell(3, 4).string('Từ ngày:').style(HeaderStyle)
			  ws.cell(4, 4).string('Đến ngày:').style(HeaderStyle)
			  ws.cell(5, 4).string('Trạm:').style(HeaderStyle)
		  //Header---------------------
			  let header_row = 7
			  // Set value of cell A7.
			  ws.cell(header_row, 1).string('STT').style(HeaderStyle);
			  ws.cell(header_row, 2).string('Ngày').style(HeaderStyle)
			  ws.cell(header_row, 3).string('kWh Thấp điểm (kWh)').style(HeaderStyle)  
			  ws.cell(header_row, 4).string('kWh Bình thường (kWh)').style(HeaderStyle) 
			  ws.cell(header_row, 5).string('kWh Cao điểm (kWh)').style(HeaderStyle) 
			  ws.cell(header_row, 6).string('Tổng (kWh)').style(HeaderStyle) 
			
		  //Fill to report
		  // Fill from date.
			  ws.cell(3, 5)
				.string(moment(date_start).startOf('days')
																	.format('DD-MM-YYYY'))
				.style(HeaderStyle)
  
			  // Set value of cell B7.
			  ws.cell(4, 5)
				.string(moment(date_end).startOf('days')
																.format('DD-MM-YYYY'))
				.style(HeaderStyle)
  
			  // Set value of cell B7.
			  ws.cell(5, 5, 5, 10, true)
				.string(site.name)
				.style(HeaderStyle)
				.style({font : {
					color: '#0a9103',
					bold: true,
  
				}})
  
      for (var i = 0; i < price3s.length; i++) {
        price3 = price3s[i]
        console.log(price3)
        let row = i + header_row + 1;
                
        let localDate = moment(price3.timestamp).add(7, 'hours')

        ws.cell(row, 1).number(i+1).style(style);
        ws.cell(row, 2).date(localDate).style({numberFormat: 'dd-mm-yyyy'})
        ws.cell(row, 3).number(price3.kwh_td)
          .style({style, numberFormat: '#,###; (#,###); -'});
        ws.cell(row, 4).number(price3.kwh_bt + price3.kwh_diff)
          .style({style, numberFormat: '#,###; (#,###); -'});

        ws.cell(row, 5).number(price3.kwh_cd)
          .style({style, numberFormat: '#,###; (#,###); -'});
        ws.cell(row, 6).number(price3.total_kwh)
          .style({style, numberFormat: '#,###; (#,###); -'});
        
      }

	  
		  wb.write('RP_' + convertViToEn(site.name,true) + ' From ' + date_start + ' To ' + date_end + '.xlsx', res); // moment().format('YYYYMMDD_Hmmss')
      return "OK"
    return
	}catch(e){
    console.log(e)
		res.send(e)
    return
	}
};

module.exports.getReportDevice = async function(req, res) {
	let stations = await Station.find({is_report: 1});
	user = res.user
	console.log(user.stations)
	res.render('admin/report/device', {
		stations: stations,
		user : user,
	})
};

module.exports.postReportDevice = async function(req, res) {
	try{
		let site_id = req.body.site_id; // req.query.site_id
		let date_end = req.body.date_end ? req.body.date_end : moment().endOf('days').format('YYYY-MM-DD')
		let date_start = req.body.date_start ? req.body.date_start : moment(date_end).subtract(30, 'day').format('YYYY-MM-DD')
    let report_id = req.body.report_id
		
    let StartDate = moment(date_start).startOf('days');
    let EndDate 	= moment(date_end).endOf('days');

    console.log(StartDate, EndDate)
  
    let DateLengh = EndDate.diff(StartDate, 'days');
    
    let site = await Station.findOne({_id: site_id})
    //--------------------
    let devices = await Device.find({station: site_id, is_active: 1})
    console.log(devices)
    let dt = []
    let date

    for (let i = 0; i < devices.length; i++) {
      const device = devices[i];
      date = moment(date_start).startOf('days')
      //moment('29-07-2022 23:59:59',"DD-MM-YYYY hh:mm:ss")
      console.log('===============================> ', date, StartDate)
      console.log(device._id, device.name)
      console.log('------------------------')

      let _sum_td = 0;
      let _sum_bt = 0;
      let _sum_cd = 0;
      let _sum_total = 0;

      for (let j = 1; j <= DateLengh + 1; j++) {
        
        let rs = await GetWhDevice(date, device._id, device.name)
        console.log(rs)
        dt.push(rs)

        _sum_td = _sum_td + rs.sum_td;
        _sum_bt = _sum_bt + rs.sum_bt;
        _sum_cd = _sum_cd + rs.sum_cd;
        _sum_total = _sum_total + rs.sum_total;

        await delay(10)
        if(j == DateLengh + 1){
          let dts = {
            name: device._id,
            code: "TỔNG:",
            date: "===",
            sum_td: _sum_td,
            sum_bt: _sum_bt,
            sum_cd: _sum_cd,
            sum_total: _sum_total,
            min: 0,
            max: 0
          }
          dt.push(dts)
        }

        date = date.add(1, 'days')
      }
      await delay(10)
    }
  
    //--------------------
    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('Sheet 1');
    ws.addImage({
      path: './public/img/ntv.png',
      type: 'picture',
      position: {
        type: 'twoCellAnchor',
        from: {
        col: 1,
        colOff: 0,
        row: 1,
        rowOff: 0,
        },
        to: {
        col: 3,
        colOff: '0.5in',
        row: 5,
        rowOff: 0,
        },
  
      },
  
    });
  
    // Create a reusable style
    var style = wb.createStyle({
    font: {
      color: '#000000',
      size: 13,
    },
    });

    var HeaderStyle = wb.createStyle({
    font: {
      color: '#022154',
      size: 13,
      name: 'Arial',
    },
    alignment: {
      wrapText: true,
      horizontal: 'left',
    },
    });

    
    var TotalStyle = wb.createStyle({
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: '#99c291'
      },
      numberFormat: '#,###; (#,###); -'
    });


  
    ws.column(3).setWidth(16);
    ws.column(4).setWidth(18);
    ws.column(5).setWidth(15);
  
    //Title---------------------
    // Set value of cell A7.
      ws.cell(1, 4).string('CÔNG TY TNHH TM NTV')
      .style({font: {
        color: '#022154',
        size: 16,
        name: 'Arial'
      }})
  
      // Set value of cell B7.
      ws.cell(2, 4).string('BÁO CÁO NĂNG LƯỢNG THEO THIẾT BỊ THEO GIỜ')
      .style({
        font: {
          color: '#060b9c',
          size: 14,
          name: 'Arial'
        },
        });
  
      // Set value of cell B7.
      ws.cell(3, 4).string('Từ ngày:').style(HeaderStyle)
      ws.cell(4, 4).string('Đến ngày:').style(HeaderStyle)
      ws.cell(5, 4).string('Trạm:').style(HeaderStyle)
      //Header---------------------
        let header_row = 7
        // Set value of cell A7.
        ws.cell(header_row, 1).string('STT').style(HeaderStyle);
        ws.cell(header_row, 2).string('Tên device').style(HeaderStyle)
        ws.cell(header_row, 3).string('Ngày').style(HeaderStyle)
        ws.cell(header_row, 4).string('Thấp điểm').style(HeaderStyle)
        ws.cell(header_row, 5).string('Bình thường').style(HeaderStyle)
        ws.cell(header_row, 6).string('Cao điểm').style(HeaderStyle)
        ws.cell(header_row, 7).string('Tổng (Wh)').style(HeaderStyle)  
        // ws.cell(header_row, 8).string('Max (Wh)').style(HeaderStyle) 
        // ws.cell(header_row, 9).string('Max - Min (Wh)').style(HeaderStyle) 
        ws.cell(header_row, 10).string('-').style(HeaderStyle) 
      
      //Fill to report
      // Fill from date.
        ws.cell(3, 5)
        .string(moment(date_start).startOf('days')
                                  .format('DD-MM-YYYY'))
        .style(HeaderStyle)
  
        // Set value of cell B7.
        ws.cell(4, 5)
        .string(moment(date_end).startOf('days')
                                .format('DD-MM-YYYY'))
        .style(HeaderStyle)
  
        // Set value of cell B7.
        ws.cell(5, 5, 5, 10, true)
        .string(site.name)
        .style(HeaderStyle)
        .style({font : {
          color: '#0a9103',
          bold: true,
  
        }})

        
      let arrWh = new Array(500).fill(0)
  
      for (var k = 0; k < dt.length; k++) {
        d = dt[k]
        //console.log(price3)
        let row = k + header_row + 1;
                
        //let localDate = moment(price3.timestamp).add(7, 'hours')
        let isTotal = d.date == '===';
        let rowStyle = isTotal ? TotalStyle : style;


        ws.cell(row, 1).number(k+1).style(style);
        ws.cell(row, 2).string(`${d.code}`).style(rowStyle) //.style({numberFormat: 'dd-mm-yyyy'})
        ws.cell(row, 3).string(d.date).style(rowStyle)
        
        ws.cell(row, 4).number(d.sum_td)
          .style(rowStyle);
        ws.cell(row, 5).number(d.sum_bt)
          .style(rowStyle);
        ws.cell(row, 6).number(d.sum_cd)
          .style(rowStyle);
        
        // ws.cell(row, 4).number(d.min)
        //   .style({style, numberFormat: '#,###; (#,###); -'});
        // ws.cell(row, 5).number(d.max)
        //   .style({style, numberFormat: '#,###; (#,###); -'});

        // ws.cell(row, 6).number(d.max - d.min)
        //   .style({style, numberFormat: '#,###; (#,###); -'});
        ws.cell(row, 7).number(d.sum_total)
          .style(rowStyle);
        
      }

	  
		  wb.write('RPTB_' + convertViToEn(site.name,true) + ' From ' + date_start + ' To ' + date_end + '.xlsx', res); // moment().format('YYYYMMDD_Hmmss')
      return "OK"
    return
	}catch(e){
    console.log(e)
		res.send(e)
    return
	}
};

module.exports.getReportDetail = async function(req, res) {
	let stations = await Station.find({is_report: 1});
	user = res.user
	console.log(user.stations)
	res.render('admin/report/detail', {
		stations: stations,
		user : user,
	})
};

module.exports.postReportDetail = async function(req, res) {
	try{
    let site_id = req.body.site_id; //'607c7e23ba23121608c8fc69' //req.query.site_id
		let date_end = req.body.date_end ? req.body.date_end : moment().endOf('days').format('YYYY-MM-DD')
		let date_start = req.body.date_start ? req.body.date_start : moment(date_end).subtract(30, 'day').format('YYYY-MM-DD')
    let report_id = req.body.report_id
		
    let StartDate = moment(date_start).startOf('days');
    let EndDate 	= moment(date_end).endOf('days');

    console.log(StartDate, EndDate)
  
    let DateLengh = EndDate.diff(StartDate, 'days');
    
    let site = await Station.findOne({_id: site_id})
    //--------------------
    let devices = await Device.find({station: site_id, is_active: 1})
    console.log(devices)
    let dt = []
    let date

    for (let i = 0; i < devices.length; i++) {
      const device = devices[i];
      date = moment(date_start).startOf('days')
      //moment('29-07-2022 23:59:59',"DD-MM-YYYY hh:mm:ss")
      console.log('===============================> ', date, StartDate)
      console.log(device._id, device.name)
      console.log('------------------------')
      for (let j = 1; j <= DateLengh + 1; j++) {
        let rs = await GetWhStation31(date, device._id, device.name)
        console.log(rs)
        dt.push(rs)
        await delay(10)
        date = date.add(1, 'days')
      }
      await delay(500)
    }
  
    //--------------------
    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('Sheet 1');
    ws.addImage({
      path: './public/img/ntv.png',
      type: 'picture',
      position: {
        type: 'twoCellAnchor',
        from: {
        col: 1,
        colOff: 0,
        row: 1,
        rowOff: 0,
        },
        to: {
        col: 3,
        colOff: '0.5in',
        row: 5,
        rowOff: 0,
        },
  
      },
  
    });
  
    // Create a reusable style
    var style = wb.createStyle({
    font: {
      color: '#000000',
      size: 13,
    },
    });

    var HeaderStyle = wb.createStyle({
    font: {
      color: '#022154',
      size: 13,
      name: 'Arial',
    },
    alignment: {
      wrapText: true,
      horizontal: 'left',
    },
    });
  
    ws.column(3).setWidth(16);
    ws.column(4).setWidth(18);
    ws.column(5).setWidth(15);
  
    //Title---------------------
    // Set value of cell A7.
      ws.cell(1, 4).string('CÔNG TY TNHH TM NTV')
      .style({font: {
        color: '#022154',
        size: 16,
        name: 'Arial'
      }})
  
      // Set value of cell B7.
      ws.cell(2, 4).string('BÁO CÁO NĂNG LƯỢNG THEO THIẾT BỊ')
      .style({
        font: {
          color: '#060b9c',
          size: 14,
          name: 'Arial'
        },
        });
  
      // Set value of cell B7.
      ws.cell(3, 4).string('Từ ngày:').style(HeaderStyle)
      ws.cell(4, 4).string('Đến ngày:').style(HeaderStyle)
      ws.cell(5, 4).string('Trạm:').style(HeaderStyle)
      //Header---------------------
        let header_row = 7
        // Set value of cell A7.
        ws.cell(header_row, 1).string('STT').style(HeaderStyle);
        ws.cell(header_row, 2).string('Tên device').style(HeaderStyle)
        ws.cell(header_row, 3).string('Ngày').style(HeaderStyle)
        ws.cell(header_row, 4).string('Min (Wh)').style(HeaderStyle)  
        ws.cell(header_row, 5).string('Max (Wh)').style(HeaderStyle) 
        ws.cell(header_row, 6).string('Max - Min (Wh)').style(HeaderStyle) 
        ws.cell(header_row, 7).string('-').style(HeaderStyle) 
      
      //Fill to report
      // Fill from date.
        ws.cell(3, 5)
        .string(moment(date_start).startOf('days')
                                  .format('DD-MM-YYYY'))
        .style(HeaderStyle)
  
        // Set value of cell B7.
        ws.cell(4, 5)
        .string(moment(date_end).startOf('days')
                                .format('DD-MM-YYYY'))
        .style(HeaderStyle)
  
        // Set value of cell B7.
        ws.cell(5, 5, 5, 10, true)
        .string(site.name)
        .style(HeaderStyle)
        .style({font : {
          color: '#0a9103',
          bold: true,
  
        }})

        
      let arrWh = new Array(500).fill(0)
  
      for (var k = 0; k < dt.length; k++) {
        d = dt[k]
        //console.log(price3)
        let row = k + header_row + 1;
                
        //let localDate = moment(price3.timestamp).add(7, 'hours')

        ws.cell(row, 1).number(k+1).style(style);
        ws.cell(row, 2).string(`${d.code}`) //.style({numberFormat: 'dd-mm-yyyy'})
        ws.cell(row, 3).string(d.date) //.style({numberFormat: 'dd-mm-yyyy'})
        ws.cell(row, 4).number(d.min)
          .style({style, numberFormat: '#,###; (#,###); -'});
        ws.cell(row, 5).number(d.max)
          .style({style, numberFormat: '#,###; (#,###); -'});

        ws.cell(row, 6).number(d.max - d.min)
          .style({style, numberFormat: '#,###; (#,###); -'});
        ws.cell(row, 7).number(1)
          .style({style, numberFormat: '#,###; (#,###); -'});
        
      }

	  
		  wb.write('RPDT_' + convertViToEn(site.name,true) + ' From ' + date_start + ' To ' + date_end + '.xlsx', res); // moment().format('YYYYMMDD_Hmmss')
      return "OK"
    return
	}catch(e){
    console.log(e)
		res.send(e)
    return
	}
};


async function GetWhStation31(date, device_id, device_code){
  try{
    let strDate = moment(date).format('DD-MM-YYYY') + " "
    let dt = {
      timestamp : moment(strDate + '00:00:00', "DD-MM-YYYY hh:mm:ss"),
      updated_at: new Date(),
    }
    
      let data = await WhDeviceData3.find({device: device_id, timestamp: dt.timestamp});

        let sum_td = 0;
        let sum_bt = 0;
        let sum_cd = 0;
        
        let min = 999999999999
        let max = 0

        await data.forEach(e => {
          if (e.kwh_min > 0) {
            min = e.kwh_min <= min ? e.kwh_min : min
            max = e.kwh_max >= max ? e.kwh_max : max
            
          }

          if (e.type_name == 'TD') {
            sum_td += e.kwh
          }
          if (e.type_name == 'BT') {
            sum_bt += e.kwh
          }
          if (e.type_name == 'CD') {
            sum_cd += e.kwh
          }
        })

        
        //console.log(moment(date).format('DD-MM-YYYY'),",", min, ",", max)
        let dts = {
          name: device_id,
          code: device_code,
          date: moment(date).format('DD-MM-YYYY'),
          min: min,
          max: max
        }
        return dts
        
      
  }catch(error){
    console.log(error.message)
  }
}

async function GetWhDevice(date, device_id, device_code){
  try{
    let strDate = moment(date).format('DD-MM-YYYY') + " "
    let dt = {
      timestamp : moment(strDate + '00:00:00', "DD-MM-YYYY hh:mm:ss"),
      updated_at: new Date(),
    }
    
      let data = await WhDeviceData3.find({device: device_id, timestamp: dt.timestamp});

        let sum_td = 0;
        let sum_bt = 0;
        let sum_cd = 0;
        let sum_diff = 0;
        let sum_total = 0;
        
        let min = 999999999999
        let max = 0

        await data.forEach(e => {
          if (e.kwh_min > 0) {
            min = e.kwh_min <= min ? e.kwh_min : min
            max = e.kwh_max >= max ? e.kwh_max : max
            
          }

          if (e.type_name == 'TD') {
            sum_td += e.kwh
          }
          if (e.type_name == 'BT') {
            sum_bt += e.kwh
          }
          if (e.type_name == 'CD') {
            sum_cd += e.kwh
          }

          sum_total = sum_td + sum_cd + sum_bt;

          if(max > min){
            sum_diff = Math.round((max - min)/1000) - sum_total;
          }
            
        })

        
        //console.log(moment(date).format('DD-MM-YYYY'),",", min, ",", max)
        let dts = {
          name: device_id,
          code: device_code,
          date: moment(date).format('DD-MM-YYYY'),
          sum_td: sum_td,
          sum_bt: sum_bt + sum_diff,
          sum_cd: sum_cd,
          sum_total: sum_total + sum_diff,
          min: min,
          max: max
        }
        return dts
        
      
  }catch(error){
    console.log(error.message)
  }
}