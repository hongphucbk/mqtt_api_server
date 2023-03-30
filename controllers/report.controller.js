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
const delay = require('delay');

//----------------------------------------------------------
module.exports.getList = async function(req, res){
  try{
    // let station_id = req.query.site_id
    // let user = req.user

    // const filter = {station: station_id, user: user._id};

    let reports = await Report.find({is_active: 1});
    res.send({reports: reports})
  }catch (error) {
    res.status(500).send({error: error.message})
  }
  
  

};



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
    if (DateLengh > 90) {
    	res.send(err.E41000)
    }

		let site = await Station.findOne({_id: site_id})
		const res1 = await axios.post('http://127.0.0.1:5001/download-excel',{
			site_id: site_id,
			date_start: date_start,
			date_end : date_end,
		});

		const res_sendmail = await axios.post('http://127.0.0.1:5001/sendmail', {
			site_id: site_id,
			site_name: site.name,
			email_cc: email_cc,
			email_to: email_to,
			file_name : res1.data.file_name,
		})

    res.send({success: 'Sent successed'})
    return
	}catch(e){
		res.send(e)
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

    let loads = await LoadWhStationData.find({  station: site_id,
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

};

function number_format(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//----------------------------------------------------------
// Get invoice report manual
module.exports.getReportManu = async function(req, res) {
	try{
    //let site_id = req.query.site_id; //'607c7e23ba23121608c8fc69' //req.query.site_id
    let site_id = '6237b1c479f5fbbe6a6086a5'// req.query.site_id; //'607c7e23ba23121608c8fc69' //req.query.site_id
    let invoice = await Invoice.findOne({station: site_id}).sort({timestamp: -1});
    let email_to = req.query.email_to; 
    let email_cc = req.query.email_cc; 
    let date_start = '2023-02-01' // req.query.date_start ? req.query.date_start : moment().startOf('months').format('YYYY-MM-DD')
    let date_end = '2023-02-28' // req.query.date_end ? req.query.date_end : moment().endOf('months').format('YYYY-MM-DD')

    let start = moment(date_start).startOf('days');
    let end   = moment(date_end).endOf('days');
    let DateLengh = end.diff(start, 'days');
    if (DateLengh > 60) {
      res.send(err.E41000)
    }

    let station = await Station.findOne({_id: site_id}).lean()

    // Access everything by rvn
    const config = new rvn.ReadingConfig()
    config.unit = ['đồng']

    const number1 = rvn.parseNumberData(config, invoice.price_after_vat.toString())
	//console.log(rvn.readNumber(config, number1))

  

  let electric = {
    kwh_td: invoice.kwh_td,
    kwh_bt: invoice.kwh_bt,
    kwh_cd: invoice.kwh_cd,

    price_td: number_format(invoice.kwh_td * invoice.unit_price_td),
    price_bt: number_format(invoice.kwh_bt* invoice.unit_price_bt),
    price_cd: number_format(invoice.kwh_cd * invoice.unit_price_cd),

    total_price_before: number_format(invoice.total_price),
    total_kwh: number_format(invoice.total_kwh),

    discount: number_format(invoice.price_discount.toFixed(0)),
    total_price_discounted: number_format(invoice.price_after_discount.toFixed(0)),
    vat: number_format(invoice.price_vat.toFixed(0)),
    total_price_vated: number_format(invoice.price_after_vat.toFixed(0)),

    read_number: rvn.readNumber(config, number1),
  }

  //---------------------------------------------------------------------------------------
  // Index

  let idx_station = await IndexStation.findOne({station: site_id}).sort({ timestamp: -1})
  //console.log(idx_station)
  let index_station = {
    old_kwh_td_index : idx_station.old_kwh_td_index,
    old_kwh_cd_index : idx_station.old_kwh_cd_index,
    old_kwh_bt_index : idx_station.old_kwh_bt_index,
    kwh_td_index : idx_station.kwh_td_index,
    kwh_cd_index : idx_station.kwh_cd_index,
    kwh_bt_index : idx_station.kwh_bt_index,
  }

  let inv = {
    name: invoice.name,
  }

	console.log('Hello menu')
	// Read HTML Template
	var html = fs.readFileSync(path.join(__dirname, "../templates/template.html"), "utf8");

	//var html = fs.readFileSync("./template.html", "utf8");
  var options = {
    format: "A4",
    orientation: "portrait",
    border: "8mm",
    header: {
        height: "3mm",
        // contents: '<div style="text-align: center;">Author: NTV Solar</div>'
    },
    footer: {
        height: "5mm",
        // contents: {
        //     first: 'Cover page',
        //     2: 'Second page', // Any page number is working. 1-based index
        //     default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
        //     last: 'Last Page'
        // }
    }
	};

	let devices = await Device.find({is_active: 1, station: site_id})
  let arr_device = []
  for (let i = 0; i < devices.length; i++) {
    
    let device = devices[i]

    let kwh = await WhDeviceData3.findOne({timestamp: moment(date_end).startOf('days'), type_number: 4, device: device._id })
    arr_device.push({
      name: device.name,
      kwh: kwh.kwh_max
    })
    
  }
	

  //console.log(arr_device)

	var users = [
	  {
	    name: "Shyam",
	    age: "26",
	  },
	  {
	    name: "Navjot",
	    age: "26",
	  },
	  {
	    name: "Vitthal",
	    age: "26",
	  },
	  {
	    name: "Navjot",
	    age: "26",
	  },
	  {
	    name: "Vitthal",
	    age: "26",
	  },
	];

	const bitmap = fs.readFileSync('./public/img/ntv.png');
	const logo = bitmap.toString('base64');

  //console.log(invoice)
	var document = {
	  html: html,
	  data: {
      arr_device: arr_device,
      station: station,
      electric: electric,
	    users: users,
	    logo: logo,
      inv: inv,
      index_station: index_station,
      start: moment(invoice.start_date).format('DD/MM/yyyy'),
      end: moment(invoice.end_date).format('DD/MM/yyyy')
      
	  },
	  path: `./exports/${invoice.station_name}-${invoice.name}-${moment().format("hhmmss")}.pdf`,
	  type: "",
	};

		
	pdf
	  .create(document, options)
	  .then((res) => {
	    console.log(res);
	  })
	  .catch((error) => {
	    console.error(error);
	  });
	  //console.log('good')
	  res.send('successed')
	  return 

  }catch(e){
  	console.log(e)
  	res.send(e.message)
  }




  //   
};

//==========================================================
// Get invoice report download
module.exports.getInvoiceDownload = async function(req, res) {
	try{
    let invoice_id = req.params.invoice_id
    let invoice = await Invoice.findById(invoice_id);
    let site_id = invoice.station // req.query.site_id; //'607c7e23ba23121608c8fc69' //req.query.site_id
    let station = await Station.findOne({_id: site_id}).lean()

    // Access everything by rvn
    const config = new rvn.ReadingConfig()
    config.unit = ['đồng']

    const number1 = rvn.parseNumberData(config, invoice.price_after_vat.toString())
    //console.log(rvn.readNumber(config, number1))

    let electric = {
      kwh_td: invoice.kwh_td,
      kwh_bt: invoice.kwh_bt,
      kwh_cd: invoice.kwh_cd,

      price_td: number_format(invoice.kwh_td * invoice.unit_price_td),
      price_bt: number_format(invoice.kwh_bt* invoice.unit_price_bt),
      price_cd: number_format(invoice.kwh_cd * invoice.unit_price_cd),

      total_price_before: number_format(invoice.total_price),
      total_kwh: number_format(invoice.total_kwh),

      discount: number_format(invoice.price_discount.toFixed(0)),
      total_price_discounted: number_format(invoice.price_after_discount.toFixed(0)),
      vat: number_format(invoice.price_vat.toFixed(0)),
      total_price_vated: number_format(invoice.price_after_vat.toFixed(0)),

      read_number: rvn.readNumber(config, number1),
    }
    //---------------------------------------------------------------------------------------
    // Index
    let idx_station = await IndexStation.findOne({station: site_id}).sort({ timestamp: -1})
    let index_station = {
      old_kwh_td_index : idx_station.old_kwh_td_index,
      old_kwh_cd_index : idx_station.old_kwh_cd_index,
      old_kwh_bt_index : idx_station.old_kwh_bt_index,
      kwh_td_index : idx_station.kwh_td_index,
      kwh_cd_index : idx_station.kwh_cd_index,
      kwh_bt_index : idx_station.kwh_bt_index,
    }

    let inv = {
      name: invoice.name,
    }

    var html = fs.readFileSync(path.join(__dirname, "../templates/template.html"), "utf8");
    //var html = fs.readFileSync("./template.html", "utf8");
    var options = {
      format: "A4",
      orientation: "portrait",
      border: "8mm",
      header: {
          height: "3mm",
          // contents: '<div style="text-align: center;">Author: NTV Solar</div>'
      },
      footer: {
          height: "5mm",
          // contents: {
          //     first: 'Cover page',
          //     2: 'Second page', // Any page number is working. 1-based index
          //     default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
          //     last: 'Last Page'
          // }
      }
    };
    
    const bitmap = fs.readFileSync('./public/img/ntv.png');
    const logo = bitmap.toString('base64');

    var document = {
      html: html,
      data: {
        station: station,
        electric: electric,
        logo: logo,
        inv: inv,
        index_station: index_station,
        start: moment(invoice.start_date).format('DD/MM/yyyy'),
        end: moment(invoice.end_date).format('DD/MM/yyyy')
        
      },
      //path: `./exports/invoices/${invoice.file_name}.pdf`,  //-${invoice.name}-${moment().format("hhmmss")}
      path: path.join(__dirname, `../exports/invoices/${invoice.file_name}.pdf`),
      type: "",
    };

    pdf
      .create(document, options)
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.error(error);
      });
	    console.log(document.path)
      res.send('successed')
      return 
  }catch(e){
  	console.log(e)
  	res.send(e.message)
  }
 
};

//==========================================================
// Download Export Report Manual -> store to Folder
module.exports.postReportDownload = async function(req, res) {
	try{
    
		let site_id = req.body.site_id;
		let date_start = req.body.date_start
		let date_end = req.body.date_end
    let report_code = req.query.report_code
    let type = 0 //0: Auto; 1: Manual
    let auto_email_id = 123
    //
    await Report_REPORT_01(site_id, date_start, date_end, report_code, type, auto_email_id)
		
    res.send({result: 1, site_id: site_id, file_name: file_name});
    return;


  }catch(e){
  	res.send(e.message)
  	console.log(e)
  }

};

// Download Export Report Auto (auto_email_id)   -> store to Folder
module.exports.getReportAutoDownload = async function(req, res) {
	try{
    let auto_email_id = req.params.auto_email_id
    let auto_email = await AutoEmail.findById(auto_email_id)
    let report = await Report.findById(auto_email.report)
    
		let site_id = auto_email.station;
		let date_start = auto_email.date_start // moment().subtract(auto_email.range, 'day').startOf('day')
		let date_end = auto_email.date_end

    let report_code = report.code
    let type = 0 //0: Auto; 1: Manual
    let file_name

    if(report_code == "REPORT_01"){
      file_name = await Report_REPORT_01(site_id, date_start, date_end, report_code, type, auto_email_id)
    }
    res.send({file_name: file_name})
    return
  }catch(e){
  	res.send(e.message)
  	console.log(e)
  }

};

// Download Export Report Manual (manual_email_id)   -> store to Folder
module.exports.getReportManualDownload = async function(req, res) {
	try{
    let manual_email_id = req.params.manual_email_id
    let manual_email = await ManualEmail.findById(manual_email_id)
    let report = await Report.findById(manual_email.report)
    
		let site_id = manual_email.station;
		let date_start = manual_email.date_start // moment().subtract(auto_email.range, 'day').startOf('day')
		let date_end = manual_email.date_end

    let report_code = report.code
    let type = 1 //0: Auto; 1: Manual
    let file_name

    if(report_code == "REPORT_01"){
      file_name = await Report_REPORT_01(site_id, date_start, date_end, report_code, type, manual_email_id)
    }
    if(report_code == "REPORT_02"){
      file_name = await Report_REPORT_02(site_id, date_start, date_end, report_code, type, manual_email_id)
    }
    if(report_code == "REPORT_03"){
      file_name = await Report_REPORT_03(site_id, date_start, date_end, report_code, type, manual_email_id)
    }

    

    res.send({file_name: file_name})
    return
  }catch(e){
  	res.send(e.message)
  	console.log(e)
  }

};

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

		const res1 = await axios.get(`http://127.0.0.1:5001/report/download/manual/${manual_email._id}`,{
		});

    let rs2 = await ManualEmail.findByIdAndUpdate(manual_email._id, {file_name: res1.data.file_name})

    await delay(500)
    // Send mail
		// const res_sendmail = await axios.post('http://127.0.0.1:5001/sendmail', {
		// 	manual_email_id: manual_email._id,
		// 	// site_name: site.name,
		// })

    res.send({success: 'Sent successed'})
    //return
	}catch(e){
    console.log(e.message)
		res.send(e)
    return
	}
};




//==============
// Report Template
async function Report_REPORT_01(site_id, date_start, date_end, report_code, type, email_id){
  let StartDate = moment(date_start).startOf('days');
  let EndDate 	= moment(date_end).endOf('days');

  let DateLengh = EndDate.diff(StartDate, 'days');

  let site = await Station.findOne({_id: site_id})
  let devices = await Device.find({station: site_id, is_active: 1});
  let loads = await LoadWhStationData.find({  station: site_id,
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

    let file_name = `A_${report_code}_${email_id}.xlsx`
    if(type == 1){
      //Manual
      file_name = `M_${report_code}_${email_id}.xlsx`
    }
		wb.write('./exports/reports/' + file_name); // moment().format('YYYYMMDD_Hmmss')

    return file_name
}

async function Report_REPORT_02(site_id, date_start, date_end, report_code, type, email_id){
	let StartDate = moment(date_start).startOf('days');
	let EndDate 	= moment(date_end).endOf('days');

	let DateLengh = EndDate.diff(StartDate, 'days');
  
	let site = await Station.findOne({_id: site_id})
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

	  let file_name = `A_${report_code}_${email_id}.xlsx`
	  if(type == 1){
		//Manual
		file_name = `M_${report_code}_${email_id}.xlsx`
	  }
		  wb.write('./exports/reports/' + file_name); // moment().format('YYYYMMDD_Hmmss')
  
	  return file_name
  }

async function Report_REPORT_03(site_id, date_start, date_end, report_code, type, email_id){
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
       let rs = await GetWhStation31(date, device._id)
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
        ws.cell(2, 4).string('BÁO CÁO NĂNG LƯỢNG THEO KHUNG GIỜ')
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
        ws.cell(row, 2).string(`${d.name}`) //.style({numberFormat: 'dd-mm-yyyy'})
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
  
    let file_name = `A_${report_code}_${email_id}.xlsx`
    if(type == 1){
    //Manual
    file_name = `M_${report_code}_${email_id}.xlsx`
    }
      wb.write('./exports/reports/' + file_name); // moment().format('YYYYMMDD_Hmmss')
  
    return file_name
}

async function GetWhStation31(date, device_id){
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
        
        let min = 999999999
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
          date: moment(date).format('DD-MM-YYYY'),
          min: min,
          max: max
        }
        return dts
        
      
  }catch(error){
    console.log(error.message)
  }
}