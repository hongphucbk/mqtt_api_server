const express = require('express')
const moment = require('moment'); // require
const excel = require('node-excel-export');
const xl = require('excel4node');

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

const axios = require('axios');

const err = require('../common/err')
//----------------------------------------------------------

module.exports.getReportManual = async function(req, res) {
	try{
		let site_id = req.query.site_id; //'607c7e23ba23121608c8fc69' //req.query.site_id
		let email_to = req.query.email_to; 
		let email_cc = req.query.email_cc; 
		let date_start = req.query.date_start ? req.query.date_start : moment().startOf('months').format('YYYY-MM-DD')
		let date_end = req.query.date_end ? req.query.date_end : moment().endOf('months').format('YYYY-MM-DD')
		let dataPoint = 'energy'

		let StartDate = moment(date_start).startOf('days');
    let EndDate 	= moment(date_end).endOf('days');
    let DateLengh = EndDate.diff(StartDate, 'days');
    if (DateLengh > 60) {
    	res.send(err.E41000)
    }

		let site = await Station.findOne({_id: site_id})

		const res1 = await axios.post('http://127.0.0.1:5001/download-excel',{
			site_id: site_id,
			date_start: date_start,
			date_end : date_end,
		});
    //console.log(res1.data);

		const res_sendmail = await axios.post('http://127.0.0.1:5001/sendmail', {
			site_id: site_id,
			site_name: site.name,
			email_cc: email_cc,
			email_to: email_to,
			file_name : res1.data.file_name,
		})

		//console.log(res_sendmail.data)

    res.send({success: 'Sent successed'})
    return
	}catch(e){
		res.send(e)
		//console.log(e)
	}
};

module.exports.postDownloadExcel = async function(req, res) {
	try{
		// let site_id = req.query.site_id; //'607c7e23ba23121608c8fc69' //req.query.site_id
		// let date_start = req.query.date_start ? req.query.date_start : '2021-07-01'
		// let date_end = req.query.date_end ? req.query.date_end : '2021-08-30'
		// let dataPoint = 'energy'

		let site_id = req.body.site_id;
		let date_start = req.body.date_start
		let date_end = req.body.date_end
		let dataPoint = 'energy'

		let StartDate = moment(date_start).startOf('days');
    let EndDate 	= moment(date_end).endOf('days');

    let DateLengh = EndDate.diff(StartDate, 'days');

    let site = await Station.findOne({_id: site_id})

    let devices = await Device.find({station: site_id, is_active: 1});

    let loads = await LoadWhStationData.find({ station: site_id,
                                         timestamp: { $gte : StartDate, $lte : EndDate }
                                      }).exec() 

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
			ws.cell(2, 4).string('BÁO CÁO NĂNG LƯỢNG')
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
			ws.cell(header_row, 3).string('Tổng N.Lượng\nPV (kWh)').style(HeaderStyle)  
			ws.cell(header_row, 4).string('Tổng N.Lượng tải\ntiêu thụ (kWh)').style(HeaderStyle) 
		  
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
		let wh_offset = 4
		let load_offset = 5
		let col = 0

		let arrWh = new Array(500).fill(0)

		for (var i = 0; i <= DateLengh; i++) {
			let countDate = moment(StartDate).add(i, 'days')
			let row = i + header_row + 1;
		  let _loads = await loads.filter((item) => {
				return countDate.diff(item.timestamp, 'days')  ==  0
			})

			if(_loads){
				ws.cell(row, 4)
	  			.number(_loads[0] ? _loads[0].load_kwh / 1000 : 0)
			  	.style({style, numberFormat: '#,###; (#,###); -'});
			}
		}

		for (var j = 0; j < devices.length; j++) {
			col = col + 1;
			ws.column(wh_offset + col).setWidth(20);

			ws.cell(header_row, wh_offset + col)
			  .string(devices[j].name + '\nN.Lượng PV (kWh)')
			  .style(HeaderStyle)

			let _whs = await WhDeviceData.find({  device: devices[j]._id,
                                          timestamp: { $gte : StartDate, $lte : EndDate }
                                      	}).sort({timestamp: 1})
			
			for (var i = 0; i <= DateLengh; i++) {
				let countDate = moment(StartDate).add(i, 'days')				
				
				let __wh = await _whs.filter((_wh) => {
					return countDate.diff(_wh.timestamp, 'days')  ==  0
				})

				let wh = __wh[0]
				let row = i + header_row + 1;
				
				if (wh) {
					//console.log(j, i, wh)
					let localDate = moment(wh.timestamp).add(7, 'hours')
				
					//console.log(moment().add(7, 'hours').startOf('days'))
					//Column A - STT
					ws.cell(row, 1).number(i+1).style(style);
					ws.cell(row, 2).date(localDate).style({numberFormat: 'dd-mm-yyyy'})
				  ws.cell(row, wh_offset + col)
				  	.number(wh.wh ? wh.wh / 1000 : 0)
				  	.style({style, numberFormat: '#,###; (#,###); -'});
				  arrWh[i] += wh.wh / 1000
				  //Column C
		  		ws.cell(row, 3).number(arrWh[i])
		  			.style({style, numberFormat: '#,###; (#,###); -'});
				}
			}
		} //End for devices
		
		let file_name = 'Solar_' + site_id +'.xlsx'
		wb.write('./exports/' + file_name); // moment().format('YYYYMMDD_Hmmss')
    res.send({result: 1, site_id: site_id, file_name: file_name});
    return;
  }catch(e){
  	res.send(e.message)
  	console.log(e)
  }


  //   
};




