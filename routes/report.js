const express = require('express')
const User = require('../models/User')
const Station = require('../models/Station')
const Device = require('../models/Device')
const auth = require('../middlewares/auth')
const DeviceData = require('../models/DeviceData')
const moment = require('moment'); // require
const HistoryDeviceData = require('../models/HistoryDeviceData')
const HistoryDeviceRawData = require('../models/HistoryDeviceRawData')

const err = require('../common/err')
const excel = require('node-excel-export');

const router = express.Router()
var controller = require('../controllers/report.controller');
//var validate = require('../validate/station.validate');

router.get('/manual', controller.getReportManual);



router.get('/report', async (req, res) => {
  let before3d = moment().subtract(3, 'days');

  let histories = await HistoryDeviceRawData.find({timestamp: { $gte: before3d }}) //.sort('timestamp').limit(100);
  let data = []
  let temp1;
  let temp2;
  for (var i = 0; i < histories.length; i++) {
    
    let prs = await histories[i].paras.filter(function(para){
      return para.name == "WH"
    })

    let wH = prs[0] ? prs[0].value : "No"
    let watts = await histories[i].paras.filter(function(para){
      return para.name == "Watts"
    })

    let watt = watts[0] ? watts[0].value : "No"
    //console.log(wH)

    temp1 = {time: histories[i].timestamp.toString(), T1: wH,T2: watt, T3: histories[i].device }  // moment().format('MMMM Do YYYY, h:mm:ss a');
    data.push(temp1)
  }


  // You can define styles as json object
  const styles = {
    headerDark: {
      fill: {
        fgColor: {
          rgb: 'FF000000'
        }
      },
      font: {
        color: {
          rgb: 'FFFFFFFF'
        },
        sz: 12,
        bold: true,
        underline: false
      }
    },
    headerBlue: {
      fill: {
        fgColor: {
          rgb: '00c8fa'
        }
      },
      font: {
        color: {
          rgb: 'FFFFFFFF'
        },
        sz: 14,
        bold: true,
        underline: false
      }
    },
    cellPink: {
      fill: {
        fgColor: {
          rgb: 'FFFFCCFF'
        }
      }
    },
    cellGreen: {
      fill: {
        fgColor: {
          rgb: 'FF00FF00'
        }
      }
    },
    cellRed: {
      fill: {
        fgColor: {
          rgb: 'f5938c'
        }
      }
    },
    cellYellow: {
      fill: {
        fgColor: {
          rgb: 'eff59d'
        }
      }
    },
    cellWhite: {
      fill: {
        fgColor: {
          rgb: 'ffffff'
        }
      }
    }
  };
   
  //Array of objects representing heading rows (very top)
  const heading = [
    [ {value: 'REPORT', style: styles.headerBlue}, 
      // {value: 'b1', style: styles.headerDark}, 
      // {value: 'c1', style: styles.headerDark} ],
      ]
    //['a2', 'b2', 'c2'] // <-- It can be only values
  ];
   
  //Here you specify the export structure
  const specification = {
    time: { // <- the key should match the actual data key
      displayName: 'Time', // <- Here you specify the column header
      headerStyle: styles.headerDark, // <- Header style
      
      width: 200 // <- width in pixels
    },
    T1: {
      displayName: 'WH',
      headerStyle: styles.headerDark,
      // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
      //   return (value == 1) ? 'Active' : 'Inactive';
      // },
      width: 100 // <- width in chars (when the number is passed as string)
    },
    T2: {
      displayName: 'Watts',
      headerStyle: styles.headerDark,
      // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
      //   return (value == 1) ? 'Active' : 'Inactive';
      // },
      width: 100 // <- width in chars (when the number is passed as string)
    },
    T3: {
      displayName: 'DeviceId',
      headerStyle: styles.headerDark,
      //cellStyle: styles.cellPink, // <- Cell style
      // cellStyle: function(value, row) { // <- style renderer function
      //   // if the status is 1 then color in green else color in red
      //   // Notice how we use another cell value to style the current one
      //   return (row.value <= 80 & row.value >= 20) ? styles.cellGreen : {fill: {fgColor: {rgb: 'FFFF0000'}}}; // <- Inline cell style is possible 
      // },
      width: 200 // <- width in pixels
    },
    // T3: {
    //   displayName: 'CẢNH BÁO',
    //   headerStyle: styles.headerDark,
    //   //cellStyle: styles.cellPink, // <- Cell style
    //   cellStyle: function(value, row) { // <- style renderer function
    //     // if the status is 1 then color in green else color in red
    //     // Notice how we use another cell value to style the current one
    //     if (row.value > 80) {
    //      return styles.cellRed
    //     }
    //     if (row.value < 20) {
    //      return styles.cellYellow
    //     }
    //     return styles.cellWhite

    //   },
    //   width: 100 // <- width in pixels
    // },
    // time: {
    //   displayName: 'THỜI GIAN',
    //   headerStyle: styles.headerDark,
    //   //cellStyle: styles.cellPink, // <- Cell style
    //   width: 200 // <- width in pixels
    // }
  }
   
  // The data set should have the following shape (Array of Objects)
  // The order of the keys is irrelevant, it is also irrelevant if the
  // dataset contains more fields as the report is build based on the
  // specification provided above. But you should have all the fields
  // that are listed in the report specification
  // const dataset = [
  //   {station: '1', status_id: 1, note: 'some note', misc: 'not shown'},
  //   {station: '1', status_id: 0, note: 'some note'},
  //   {station: '1', status_id: 0, note: 'some note', misc: 'not shown'}
  // ]

  const dataset = data;
  
  console.log(dataset)
  // Define an array of merges. 1-1 = A:1
  // The merges are independent of the data.
  // A merge will overwrite all data _not_ in the top-left cell.
  const merges = [
    //{ start: { row: 1, column: 1 }, end: { row: 1, column: 5 } },
    // { start: { row: 2, column: 1 }, end: { row: 2, column: 5 } },
    // { start: { row: 2, column: 6 }, end: { row: 2, column: 10 } }
  ]
   
  // Create the excel report.
  // This function will return Buffer
  const report = excel.buildExport(
    [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
      {
        name: 'Report', // <- Specify sheet name (optional)
        heading: heading, // <- Raw heading array (optional)
        merges: merges, // <- Merge cell ranges
        specification: specification, // <- Report specification
        data: dataset // <-- Report data
      }
    ]
  );
   
  // You can then return this straight
  res.attachment('Report.xlsx'); // This is sails.js specific (in general you need to set headers)
  return res.send(report);
})




module.exports = router;