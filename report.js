require('dotenv').config();
require('express-group-routes');
var moment = require('moment'); // require

const excel = require('node-excel-export');

var mongoose = require('mongoose');
//mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true});
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});



//var client = mqtt.connect('mqtt://m11.cloudmqtt.com', options);
const DeviceData = require('./models/DeviceData')
const HistoryDeviceData = require('./models/HistoryDeviceData')
const Event = require('./models/Event')
const HistoryEvent = require('./models/HistoryEvent')
const HistoryDeviceRawData = require('./models/HistoryDeviceRawData')
const AlarmCode = require('./models/AlarmCode')
const Alarm = require('./models/Alarm')
const Device = require('./models/Device')

const Queue = require('./common/Queue')
let _queue = new Queue();

exportExcel()

async function exportExcel() {
  let histories = await HistoryDeviceRawData.find().sort('timestamp').limit(10);
  let data = []
  let temp1;
  let temp2;

  histories.forEach(async function(history) {
    temp2 = "";

    let prs = await history.paras.filter(function(para){
      return para.name == "WH"
    })
    console.log(prs)

    // if (water.data > 80) {
    //  temp2 = "Hight"
    // }
    // if (water.data < 20) {
    //  temp2 = "Low"
    // }

    temp1 = {time: history.timestamp, T1: 1, T2: 1 }  // moment().format('MMMM Do YYYY, h:mm:ss a');
    data.push(temp1)
  })
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
      
      width: 100 // <- width in pixels
    },
    T1: {
      displayName: 'T1 [DEG.C]',
      headerStyle: styles.headerDark,
      // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
      //   return (value == 1) ? 'Active' : 'Inactive';
      // },
      width: 50 // <- width in chars (when the number is passed as string)
    },
    T2: {
      displayName: 'T2 [DEG.C]',
      headerStyle: styles.headerDark,
      //cellStyle: styles.cellPink, // <- Cell style
      // cellStyle: function(value, row) { // <- style renderer function
      //   // if the status is 1 then color in green else color in red
      //   // Notice how we use another cell value to style the current one
      //   return (row.value <= 80 & row.value >= 20) ? styles.cellGreen : {fill: {fgColor: {rgb: 'FFFF0000'}}}; // <- Inline cell style is possible 
      // },
      width: 50 // <- width in pixels
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
   
  // Define an array of merges. 1-1 = A:1
  // The merges are independent of the data.
  // A merge will overwrite all data _not_ in the top-left cell.
  const merges = [
    { start: { row: 1, column: 1 }, end: { row: 1, column: 5 } },
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
   
  // OR you can save this buffer to the disk by creating a file.
};



