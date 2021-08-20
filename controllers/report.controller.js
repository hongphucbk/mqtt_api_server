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

const err = require('../common/err')
//----------------------------------------------------------

module.exports.getReportManual = async function(req, res) {
	try{
		let site_id = '607c7e23ba23121608c8fc69' //req.query.site_id
		let date_start = req.query.date_start ? req.query.date_start : '2021-07-01'
		let date_end = req.query.date_end ? req.query.date_end : '2021-08-20'
		let dataPoint = 'energy'

		let StartDate = moment(date_start).startOf('days');
    let EndDate 	= moment(date_end).endOf('days');

    let DateLengh = EndDate.diff(StartDate, 'days');

    let site = await Station.findOne({_id: site_id})

    let devices = await Device.find({station: site_id, is_active: 1});

    //console.log(devices)

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

		//var ws2 = wb.addWorksheet('Sheet 2');
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

		ws.column(3).setWidth(15);
		ws.column(4).setWidth(15);
		ws.column(5).setWidth(15);

		//ws.row(1).setHeight(20);


		//Title---------------------
		// Set value of cell A7.
			ws.cell(1, 4)
			  .string('CÔNG TY NTV NEW ENERGY')
			  .style({font: {
		    	color: '#022154',
			    size: 16,
			    name: 'Arial'
			  }})

			// Set value of cell B7.
			ws.cell(2, 4)
			  .string('BÁO CÁO NĂNG LƯỢNG ĐIỆN MẶT TRỜI')
			  .style({
			  	font: {
			    	color: '#060b9c',
				    size: 14,
				    name: 'Arial'
				  },
				  
				});

			// Set value of cell B7.
			ws.cell(3, 4)
			  .string('Từ ngày:')
			  .style(HeaderStyle)

			// Set value of cell B7.
			ws.cell(4, 4)
			  .string('Đến ngày:')
			  .style(HeaderStyle)
			// Set value of cell B7.
			ws.cell(5, 4)
			  .string('Trạm:')
			  .style(HeaderStyle)

		//Header---------------------
			let header_row = 7
			// Set value of cell A7.
			ws.cell(header_row, 1)
			  .string('STT')
			  .style(HeaderStyle);

			// Set value of cell B7.
			ws.cell(header_row, 2)
			  .string('Ngày')
			  .style(HeaderStyle)

			// Set value of cell D7.
			ws.cell(header_row, 3)
			  .string('Tổng n/lượng phát (kWh)')
			  .style(HeaderStyle)  

			// Set value of cell E7.
			ws.cell(header_row, 4)
			  .string('Tổng n/lượng tải (kWh)')
			  .style(HeaderStyle) 

			// Set value of cell D7.
			// ws.cell(header_row, 6)
			//   .string('Đơn vị')
			//   .style(HeaderStyle)
		  

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
		let arrLoad = new Array(500).fill(0)

		for (var j = 0; j < devices.length; j++) {
			col = col + 2;
			ws.column(wh_offset + col).setWidth(15);
			ws.column(load_offset + col).setWidth(15);

			ws.cell(header_row, wh_offset + col)
			  .string(devices[j].name + '\n n/l phát (kWh)')
			  .style(HeaderStyle)

			ws.cell(header_row, load_offset + col)
			  .string(devices[j].name + '\nn/l tải (kWh)')
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
				
				// for (var i =  0; i < _whs.length; i++) {
				if (wh) {
					console.log(j, i, wh)

					let row = i + header_row + 1;
					let localDate = moment(wh.timestamp).add(7, 'hours')

					//console.log(moment().add(7, 'hours').startOf('days'))
					//Column A - STT
					ws.cell(row, 1)
				  	.number(i+1)
				  	.style(style);

				  //Column B
					ws.cell(row, 2)
				  	.date(localDate)
		  			.style({numberFormat: 'dd-mm-yyyy'})

					//Column D
				  ws.cell(row, wh_offset + col)
				  	.number(wh.wh ? wh.wh : 0)
				  	.style({style, numberFormat: '#,###; (#,###); -'});

				  arrWh[i] += wh.wh
				  //Column D

				  let wh_load = wh.load ? _whs[i].load : 0
				  arrLoad[i] += wh_load

				  ws.cell(row, load_offset + col)
				  	.number(wh_load)
				  	.style({style, numberFormat: '#,###; (#,###); -'});
				  
				  
				  //Column C
		  		ws.cell(row, 3)
		  			.number(arrWh[i])
				  	.style({style, numberFormat: '#,###; (#,###); -'});

				  ws.cell(row, 4)
		  			.number(arrLoad[i])
				  	.style({style, numberFormat: '#,###; (#,###); -'});
				}

			}

			

		} //End for devices

				 
		// Set value of cell C1 to a formula styled with paramaters of style
		// ws.cell(1, 3)
		//   .formula('A1 + B1')
		//   .style(style);
		 
		// Set value of cell A2 to 'string' styled with paramaters of style
		// ws.cell(2, 1)
		//   .string('string')
		//   .style(style);
		 
		
		 
		wb.write('./exports/Export_Excel_'+ moment().format('YYYYMMDD_Hmmss') +'.xlsx');


    res.send('Done');
    return;
  }catch(e){
  	console.log(e)
  }


  //   if (basedTime === 'day' && type === 'power') {
  //     let start = moment(date).startOf('day')
  //     let end = moment(date).endOf('day')

  //     hisStations = await HistoryDeviceData.find({ device: id, 
  //                                                  timestamp: {$gte: start, $lte: end } 
  //                                               })
      
  //     for (let j = 0; j < 288; j++) {
  //       sum = 0, count = 0, avg = 0
  //       let start1 = moment(start).startOf('minute')
  //       let end1 = moment(start).add(5, 'minutes').startOf('minute')
  //       //console.log(start1, end1)
  //       let a1 = hisStations.map(x => {
  //         if (x.timestamp <= end1 && x.timestamp >= start1) {
  //           sum +=  x.paras.Watts
  //           count++

  //           if (count > 0) {
  //             avg = sum/count
  //           }else{
  //             avg = 0
  //           }
  //         }
  //         return avg
  //       })

  //       //console.log(j, '-->', start1.format('H:mm:ss'), end1.format('H:mm:ss'), avg)
  //       data.push(avg)
  //       start = end1
  //     }

      

  //   }else if (basedTime === 'month' && type === 'energy') {
  //     var date1 = moment("2021-06-30")
  //     var now = moment(req.query.date);

      


  //     if (now > date1) {
  //       // date >= 2021-07-01
        
  //                           //.sort({'timestamp': -1})
  //                           //.limit(1)
  //                           .exec()
  //       for (let j = 1; j <= EndMonth.date(); j++) {
  //         data[j] = 0
  //         _whs.map(await function(item){
  //           if (moment(item.timestamp).date() == j && item.wh > 0) {
  //             data[j] = item.wh
  //           }
  //         })
  //       }
  //       data.splice(0, 1);

  //     } else {
  //       // date <= 2021-06-30
  //       hisStations = await HistoryDeviceData.find({  device: id, 
  //                                                     timestamp: {$gte: StartMonth, $lte: EndMonth } 
  //                                                 })
  //       //let StartDay = moment(req.query.date).startOf('day');     // set to 12:00 am today
  //       let EndDay = moment(req.query.date).endOf('day');     // set to 12:00 am today

  //       for (let j = 1; j <= EndMonth.date(); j++) {
  //         data[j] = 0
  //         let TotalWh = 0
  //         let minWh = 9000000000
  //         let maxWh = 0
  //         hisStations.map(await function(item){
  //           if (moment(item.timestamp).date() == j && item.paras.WH > 0) {
  //             //console.log('item WH = ' + item.paras.WH)
  //             if (item.paras.WH < minWh) {
  //               console.log("-->", minWh, item.timestamp)
  //             }
  //             minWh = item.paras.WH < minWh ? item.paras.WH : minWh
  //             maxWh = item.paras.WH > maxWh ? item.paras.WH : maxWh
  //           }
  //         })
  //         TotalWh = maxWh > minWh ?  maxWh - minWh : 0
  //         data[j] = TotalWh
  //       }
        
  //       data.splice(0, 1);
  //     }


  //   }else if (basedTime === 'year' && type === 'energy') {
  //     let StartYear = moment(req.query.date).startOf('year');
  //     let EndYear = moment(req.query.date).endOf('year');
      

  //     hisStations = await HistoryDeviceData.find({ device: id, 
  //                                                   timestamp: {$gte: StartYear, $lte: EndYear } 
  //                                                 })

  //     for (let j = 0; j <= 11; j++) {
  //       if (j <= 5) {
  //         data[j] = 0
  //         let TotalWh = 0
  //         let minWh = 9000000000
  //         let maxWh = 0
  //         hisStations.map(function(item){
  //           if (moment(item.timestamp).month() == j && item.paras.WH > 0) {
  //             minWh = item.paras.WH < minWh ? item.paras.WH : minWh
  //             maxWh = item.paras.WH > maxWh ? item.paras.WH : maxWh
  //           }
  //         })
  //         TotalWh = maxWh > minWh ?  maxWh - minWh : 0
  //         data[j] = TotalWh
  //       }else{
  //         let _whs = await WhDeviceData.find({  device: id,
  //                                               timestamp: { $gte : StartYear, $lte : EndYear }
  //                                           }).exec()
  //         let _total = 0
  //         _whs.map(await function(item){
  //           if (moment(item.timestamp).month() == j && item.wh > 0) {
  //             _total += item.wh
  //           }
  //         })
  //         data[j] = _total
  //       }
        
  //     }
  //   }
  //   else{
  //     res.json(err.E40010)
  //     return
  //   }

  //   res.send({siteID: id, type: type,series: data})
  // }catch(error){
  //   res.send(error.message)
  // }
};


