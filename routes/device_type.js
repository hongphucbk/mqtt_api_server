const express = require('express')
const User = require('../models/User')
const Station = require('../models/Station')
const Device = require('../models/Device')
const auth = require('../middlewares/auth')
const DeviceData = require('../models/DeviceData')
const moment = require('moment'); // require
const HistoryDeviceData = require('../models/HistoryDeviceData')
const DeviceType = require('../models/DeviceType')

const err = require('../common/err')

const router = express.Router()

router.post('/device_type', auth, async (req, res) => {
  try {
    req.body.updated_at = new Date()
    req.body.created_at = new Date()
    const device_type = new DeviceType(req.body)
    console.log(device_type)
    await device_type.save()
    res.status(201).send({device_type: device_type})
  } catch (error) {
    res.status(400).send({error: error.message})
  }
})

router.get('/device_type', auth, async(req, res) => {
  try{
    let device_types = await DeviceType.find()

    let result = device_types.map((item) => {
      return { id: item.id, name: item.name }
    }) 
     
    res.status(201).send({device_types: result})
  }catch (error) {
    res.status(400).send({error: error.message})
  } 
})


// router.get('/station/show/:id', auth, async(req, res) => {
//     let id = req.params.id;
//     //let id = req.body.id;
//     console.log(id)
//     let station = await Station.findOne({ _id: id });
//     res.send(station)
// })

// router.post('/station/edit/:id', auth, async(req, res) => {
//     let id = req.params.id; //req.params.id
//     //let data = req.body;
//     //console.log("id = ",id)
//     //let station = await Station.findOne({ _id: id });
//     //res.send(station)

//     var query = {"_id": req.params.id};
//     var data = {
//         "name" : req.body.name,
//         "describe" : req.body.describe,
//     }
//     //console.log(query)
//     Station.findOneAndUpdate(query, data, {'upsert':true}, function(err, doc){
//         if (err) return res.send(500, { error: err });
//         res.status(200).send('Success');
//     });

// })

// //get details id
// router.get('/site/device/details', auth, async(req, res) => {
//   try{
//     let id = req.query.id; //site_id
//     //console.log(id)
//       //let station = await Station.findOne({_id: station_id});
//     let device = await Device.findOne({_id: id})
//     if (device) {
//       let d = {
//             id : device.id,
//             name : device.name,
//             IP : device.IP,
//             manufacturer : device.manufacturer,
//             minResponseTimeInMiliSecond : device.minResponseTimeInMiliSecond,
//             model : device.model,
//             port : device.port,
//             code: device.code,
//             status : "normal",
//             paras: device.paras
//           }

//       let data = []
//       //let d = {}

//       let deviceData = await DeviceData.find({device: id}).sort({_id: -1}).limit(1)
//       if (deviceData.length > 0) {
//         let paras = deviceData[0].paras;
//         //console.log(d.paras)

//         for (let i = 0; i < d.paras.length; i++) {
//           for (var j = 0; j < paras.length; j++) {
//             //console.log(paras[j].name)
//             if(paras[j].name == d.paras[i].name){
//               //console.log("-->",paras[j].value, d.paras[i])
//               d.paras[i].value = paras[j].value
//             }
//           }
//         }
//         res.send({device: d})
//       }else{
//         res.status(400).send(err.E40012)
//       }
//     }else{
//       res.status(400).send(err.E40013)
//     }
//   }
//   catch (error) {
//       res.status(400).send({code: 40001, message: error.message})
//   }
    

    

//     //res.send(station.devices)
// })

// router.get('/device/trend', auth, async(req, res) => {
//   try{
//     let id = req.query.id;  //device_id
//     let dataPoint = 'power' //req.query.dataPoint; //power
//     let basedTime = req.query.basedTime; //'day'
//     let date = req.query.date //"2021-04-22"
//     let type = req.query.type //"power / energy"


//     let deviceDataPowers;
//     let data = []

//     let sum = 0
//     let count = 0
//     let avg = 0

//     if (basedTime === 'day' && type === 'power') {
//       let start = moment(date).startOf('day')
//       let end = moment(date).endOf('day')

//       hisStations = await HistoryDeviceData.find({ device: id, 
//                                                    timestamp: {$gte: start, $lte: end } 
//                                                 })
      
//       for (let j = 0; j < 288; j++) {
//         sum = 0, count = 0, avg = 0
//         let start1 = moment(start).startOf('minute')
//         let end1 = moment(start).add(5, 'minutes').startOf('minute')
//         //console.log(start1, end1)
//         let a1 = hisStations.map(x => {
//           if (x.timestamp <= end1 && x.timestamp >= start1) {
//             sum +=  x.paras.Watts
//             count++

//             if (count > 0) {
//               avg = sum/count
//             }else{
//               avg = 0
//             }
//           }
//           return avg
//         })
//         data.push(avg)
//         start = end1
//       }

//       // for (let j = 0; j < 24; j++) {
//       //   data[j] = 0

//       //   let hisStation = hisStations.filter(function(item){
//       //     return moment(item.timestamp).hour() == j
//       //   })
//       //   //console.log(hisStation)
//       //   if (hisStation.length > 0) {
//       //     data[j] = hisStation[0].paras.power
//       //   }
//       // }

//     }else if (basedTime === 'month' && type === 'energy') {
//       let StartMonth = moment(req.query.date).startOf('month');
//       let EndMonth = moment(req.query.date).endOf('month');
      
//       hisStations = await HistoryDeviceData.find({ device: id, 
//                                                     timestamp: {$gte: StartMonth, $lte: EndMonth } 
//                                                   })
//       //let StartDay = moment(req.query.date).startOf('day');     // set to 12:00 am today
//       let EndDay = moment(req.query.date).endOf('day');     // set to 12:00 am today

//       //console.log(EndMonth)

//       for (let j = 1; j <= EndMonth.date(); j++) {
//         data[j] = 0
//         let hisStation = hisStations.reduce(function(total, cur, _, { length }){
//           return moment(cur.timestamp).date() == j ? total + cur.paras.WH/length: total;
//         }, 0)

//         //console.log(hisStation)
//         data[j] = hisStation
//       }
//       data.splice(0, 1);



//       //console.log(a)
//       //let startDate = req.query.date + " " + j  + ":00:00";
//       //let endDate = req.query.date + " " + j + ":59:59";
//       //data[0] = "Phuc is processing please wait to update. :)))"
//     }else if (basedTime === 'year' && type === 'energy') {
//       let StartYear = moment(req.query.date).startOf('year');
//       let EndYear = moment(req.query.date).endOf('year');
      
//       hisStations = await HistoryDeviceData.find({ device: id, 
//                                                     timestamp: {$gte: StartYear, $lte: EndYear } 
//                                                   })

//       for (let j = 0; j <= 11; j++) {
//         data[j] = 0
//         let hisStation = hisStations.reduce(function(total, cur, _, { length }){
//           return moment(cur.timestamp).month() == j ? total + cur.paras.WH/length : total;
//         }, 0)
//         data[j] = hisStation
//       }
//       //console.log(a)
//       //let startDate = req.query.date + " " + j  + ":00:00";
//       //let endDate = req.query.date + " " + j + ":59:59";
//       //data[0] = "Phuc is processing please wait to update. :)))"
//     }
//     else{
//       res.json(err.E40010)
//       return
//     }

//     res.send({siteID: id, type: type,series: data})
//   }catch(error){
//     res.send(err.E40001, error.message)
//   }
// })



// async function getCurActPower(device_id){
//   return await DeviceData.find({device : device_id}).sort({ timestamp: -1 }).limit(1) // latest docs
// }


module.exports = router;