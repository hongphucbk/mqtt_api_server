const express = require('express')
const User = require('../models/User')
const Station = require('../models/Station')
const auth = require('../middlewares/auth')
const role = require('../middlewares/role')
const Device = require('../models/Device')
const DeviceData = require('../models/DeviceData')
const HistoryDeviceData = require('../models/HistoryDeviceData')

const random = require('random')
const moment = require('moment'); // require


const router = express.Router()

router.post('/station1', auth, role(['SA']) ,async (req, res) => {
    // Create a new user
    try {
        const station = new Station(req.body)
        console.log(station)
        await station.save()
        //const token = await user.generateAuthToken()
        res.status(201).send({"result": 1, station })
    } catch (error) {
        res.status(400).send({"result": 0, error})
    }
})

// router.post('/users/login', async(req, res) => {
//     //Login a registered user
//     try {
//         const { email, password } = req.body
//         const user = await User.findByCredentials(email, password)
//         if (!user) {
//             return res.status(401).send({error: 'Login failed! Check authentication credentials'})
//         }
//         const token = await user.generateAuthToken()
//         res.send({ user, token })
//     } catch (error) {
//         res.status(400).send(error)
//     }
// })

// router.get('/site/list', auth, async(req, res) => {
//     let stations = await Station.find();
//     res.send(stations)
// })

router.get('/site/list', auth, async(req, res) => {
  try{
    let stations = await Station.find();
    let stationData = []
    //let jsonStation = {}

    for (let j = 0; j < stations.length; j++) {
      let jsonStation = {
        "id": stations[j]._id,
        name: stations[j].name,
        status: 'normal',
        product : 0, //kWh powerGenerated
        //power : 0,
        workingHours : 0
      }


      let data = []
      let d = {}
      let devices = await Device.find({ station: stations[j]._id })

      for (let i = 0; i < devices.length; i++) {
        //console.log(devices[i])
        d = {
            id : devices[i]._id,
            name : devices[i].name,
            code: devices[i].code,
            describe : devices[i].describe,
            status : "normal",
            paras: {
              workingHours: 0,
              powerGenerated: 0,
              power: 0
            }
          }
          

        let deviceData = await DeviceData.find({device: devices[i]._id, paras: "workingHours"}).sort({_id: -1}).limit(1)
        if (deviceData.length > 0){
          //console.log("Result: ", deviceData[0].value)
          d.paras.workingHours = deviceData[0].value

          jsonStation.workingHours += deviceData[0].value;
        }


        // let deviceDataPower = await DeviceData.find({device: devices[i]._id, paras: "power"}).sort({_id: -1}).limit(1)
        // if (deviceDataPower.length > 0){
        //   //console.log("Result: ", deviceData[0].value)
        //   d.paras.power = deviceDataPower[0].value
        //   jsonStation.power.value += deviceDataPower[0].value

        // }

        let deviceDataPowerGenerated = await DeviceData.find({device: devices[i]._id, paras: "powerGenerated"}).sort({_id: -1}).limit(1)
        if (deviceDataPowerGenerated.length > 0){
          d.paras.powerGenerated = deviceDataPowerGenerated[0].value
          jsonStation.product += deviceDataPowerGenerated[0].value
        }
        
        data.push(d)
        //console.log(await getCurActPower(devices[0]._id))
      }


      stationData.push(jsonStation)

      //console.log(jsonStation)
    }
    console.log('----------->',stationData)
    res.send({sites: stationData })
  }catch(error){
    res.send(error)
  }
})



router.get('/site/overview', auth, async(req, res) => {
  try{
    let id = req.query.id;
    //let id = req.body.id;
    console.log(id)
    let station = await Station.findOne({ _id: id });

    let d = {
      id: id,
      curSumActPower: 0,    //power
      todaySumEnergy: 0,
      ratedSumPower: 0,
      allSumEnergy: 0       //PowerGenerated
    }
    let devices = await Device.find({ station: id })

    for (let i = 0; i < devices.length; i++) {
      
      // let deviceData = await DeviceData.find({device: devices[i]._id, paras: "workingHours"}).sort({_id: -1}).limit(1)
      // if (deviceData.length > 0){
      //   jsonStation.workingHours += deviceData[0].value;
      // }


      let deviceDataPower = await DeviceData.find({device: devices[i]._id, paras: "power"}).sort({_id: -1}).limit(1)
      if (deviceDataPower.length > 0){
        //console.log("Result: ", deviceData[0].value)
        d.curSumActPower = deviceDataPower[0].value
      }

      let deviceDataPowerGenerated = await DeviceData.find({device: devices[i]._id, paras: "powerGenerated"}).sort({_id: -1}).limit(1)
      if (deviceDataPowerGenerated.length > 0){
        d.allSumEnergy = deviceDataPowerGenerated[0].value
        //jsonStation.product += deviceDataPowerGenerated[0].value
      }
      //console.log(await getCurActPower(devices[0]._id))
    }

    res.send({site: d})
  }catch(error){
    res.send(error)
  }
})

router.get('/site/devices', auth, async(req, res) => {
  try{
    let id = req.query.id;
    console.log(id)

    let devices = await Device.find({station: id})

    console.log( devices.length)

    let data = []
    let d = {}

    for (let i = 0; i < devices.length; i++) {
      //console.log(devices[i])
      d = {
          id : devices[i]._id,
          name : devices[i].name,
          //code: devices[i].code,
          //describe : devices[i].describe,
          status : "normal",
          curActPower: 0,   //power
          todayEnergy: 0    //kwh - powerGenerated

          // paras: {
          //   workingHours: 0,
          //   powerGenerated: 0,
          //   power: 0
          // }
        }
        

      // let deviceData = await DeviceData.find({device: devices[i]._id, paras: "workingHours"}).sort({_id: -1}).limit(1)
      // if (deviceData.length > 0){
      //   //console.log("Result: ", deviceData[0].value)
      //   d.paras.workingHours = deviceData[0].value
      // }

      let deviceDataPower = await DeviceData.find({device: devices[i]._id, paras: "power"}).sort({_id: -1}).limit(1)
      if (deviceDataPower.length > 0){
        //console.log("Result: ", deviceData[0].value)
        d.curActPower = deviceDataPower[0].value
      }

      let deviceDataPowerGenerated = await DeviceData.find({device: devices[i]._id, paras: "powerGenerated"}).sort({_id: -1}).limit(1)
      if (deviceDataPowerGenerated.length > 0){
        d.todayEnergy = deviceDataPowerGenerated[0].value
      }


      
      
      //console.log('----------->',d)
      
      data.push(d)
      //console.log(await getCurActPower(devices[0]._id))
    }
    res.send({ devices:data})
  }
  catch(error){
    res.send(error)
  }
})


router.get('/site/trend', auth, async(req, res) => {
  let id = req.query.id;
  let dataPoint = 'power' //req.query.dataPoint; //power
  let basedTime = req.query.basedTime; //'day'
  let date = req.query.date //"2021-04-22"

  console.log(req.query)

  let devices = await Device.find({ station: id })
  let ids = []
  devices.forEach(function(device){
    ids.push(device._id)
  })

  let deviceDataPowers;
  let data = []

  if (basedTime === 'day') {
    for (let j = 0; j <= 23; j++) {
      let startDate = req.query.date + " " + j  + ":00:00";
      let endDate = req.query.date + " " + j + ":59:59";
      
      

      let sum = 0
      let count = 0
      let avg = 0

      deviceDataPowers = await HistoryDeviceData.find({ device: { $in: ids }, 
                                                        paras: dataPoint, 
                                                        timestamp: {$gte: startDate, $lte: endDate } 
                                                      })
      if(deviceDataPowers.length > 0){
        for(let k = 0; k < deviceDataPowers.length; k++) {
          sum += deviceDataPowers[k].value
          count += 1
        }
      }

      if (count > 0) {
        avg = sum/count
      }else{
        avg = 0
      }
      data.push(avg)
    }
  }
  if (basedTime === 'month') {
    // let StartMonth = moment(req.query.date).startOf('month');
    // let EndMonth = moment(req.query.date).endOf('month');
    
    // deviceDataPowers = await HistoryDeviceData.find({ device: { $in: ids }, 
    //                                                     paras: dataPoint, 
    //                                                     timestamp: {$gte: StartMonth, $lte: EndMonth } 
    //                                                   })

    // let StartDay = moment(req.query.date).startOf('day');     // set to 12:00 am today
    // let EndDay = moment(req.query.date).endOf('day');     // set to 12:00 am today

    // var a = deviceDataPowers.filter(function(item) {
    //   return item.timestamp < EndDay && item.timestamp >= StartDay;
    // });


    // console.log(a)
    //let startDate = req.query.date + " " + j  + ":00:00";
    //let endDate = req.query.date + " " + j + ":59:59";
    data[0] = "Phuc is processing please wait to update. :)))"
  }
  else{
    data[0] = "Phuc is processing please wait to update. :)))"
  
  }
    
  
  res.send({siteID: id, series: data})
  
})

// router.post('/station/trend/month1', auth, async(req, res) => {
//   let station_id = req.body.station_id;
//   let dataPoint = req.body.dataPoint; //power
//   let basedTime = req.body.basedTime; //'day'
//   let strDate = req.body.date //"2021-04-22"

//   console.log(req.body)

//   let infor = {
//     station_id: req.body.station_id,
//     dataPoint : req.body.dataPoint,
//     basedTime : req.body.basedTime,
//     strDate : req.body.date
//   }

//   if(false){


//   let devices = await Device.find({ station: station_id })
//   let ids = []
//   devices.forEach(function(device){
//     ids.push(device._id)
//   })


  
//   //let data = []

//   for (let j = 0; j <= 23; j++) {
//     let startDate = req.body.date + " " + j  + ":00:00";
//     let endDate = req.body.date + " " + j + ":59:59";
    
//     let deviceDataPowers;

//     let sum = 0
//     let count = 0
//     let avg = 0

//     //for (let i = 0; i < devices.length; i++) {
      
//       deviceDataPowers = await HistoryDeviceData.find({ device: { $in: ids }, 
//                                                         paras: dataPoint, 
//                                                         timestamp: {$gte: startDate, $lte: endDate } 
//                                                       })

//       //console.log(devices[i]._id," --> ", deviceDataPowers.length)

//       if(deviceDataPowers.length > 0){
//         //console.log(deviceDataPowers[0].value)

//         for(let k = 0; k < deviceDataPowers.length; k++) {
//           sum += deviceDataPowers[k].value
//           count += 1

//         }
//       }

//       if (count > 0) {
//         avg = sum/count
//       }else{
//         avg = 0
//       }



//       let d = {
//         hour: j,
//         value: avg
//       }
      
//       data.push(d)
  
//     //avg = sum/count;
//     console.log('sum = ', sum, ' count = ', count, ' avg = ', avg)
    
//     console.log(j,' -----------> ', startDate)
    
//   }

//   }
  
//   let data = []
//   for (let j = 1; j <= 30; j++) {
//     let d = {
//       day: j,
//       value: random.int(1000, 9000),
//       unit: "W"
//     }
//     data.push(d)
//   }

//   res.send({result: 1, infor, data})
// })

// router.post('/station/trend/year1', auth, async(req, res) => {
//   let station_id = req.body.station_id;
//   let dataPoint = req.body.dataPoint; //power
//   let basedTime = req.body.basedTime; //'day'
//   let date = req.body.date //"2021-04-22"

//   console.log(req.body)

//   let infor = {
//     station_id: req.body.station_id,
//     dataPoint : req.body.dataPoint,
//     basedTime : req.body.basedTime,
//     date : req.body.date
//   }

//   if(false){


//   let devices = await Device.find({ station: station_id })
//   let ids = []
//   devices.forEach(function(device){
//     ids.push(device._id)
//   })


  
//   //let data = []

//   for (let j = 0; j <= 23; j++) {
//     let startDate = req.body.date + " " + j  + ":00:00";
//     let endDate = req.body.date + " " + j + ":59:59";
    
//     let deviceDataPowers;

//     let sum = 0
//     let count = 0
//     let avg = 0

//     //for (let i = 0; i < devices.length; i++) {
      
//       deviceDataPowers = await HistoryDeviceData.find({ device: { $in: ids }, 
//                                                         paras: dataPoint, 
//                                                         timestamp: {$gte: startDate, $lte: endDate } 
//                                                       })

//       //console.log(devices[i]._id," --> ", deviceDataPowers.length)

//       if(deviceDataPowers.length > 0){
//         //console.log(deviceDataPowers[0].value)

//         for(let k = 0; k < deviceDataPowers.length; k++) {
//           sum += deviceDataPowers[k].value
//           count += 1

//         }
//       }

//       if (count > 0) {
//         avg = sum/count
//       }else{
//         avg = 0
//       }



//       let d = {
//         hour: j,
//         value: avg
//       }
      
//       data.push(d)
  
//     //avg = sum/count;
//     console.log('sum = ', sum, ' count = ', count, ' avg = ', avg)
    
//     console.log(j,' -----------> ', startDate)
    
//   }

//   }
  
//   let data = []
//   for (let j = 2021; j <= 2025; j++) {
//     let d = {
//       year: j,
//       value: random.int(10000, 90000),
//       unit: "W"
//     }
//     data.push(d)
//   }

//   res.send({result: 1, infor, data})
// })

// router.post('/station/event1', auth, async(req, res) => {
//   let station_id = req.body.station_id;
//   let d1 = {
//     caption: 'Inverter bị lỗi',
//     type:'Error',
//     status:'Active',
//     timestamp:new Date(),
//     updated_at: new Date(),
//     device: '607c7e4cba23121608c8fc77'
//   }

//   let d2 = {
//     caption: 'Inverter cảnh báo',
//     type:'Warning',
//     status:'Active',
//     timestamp:new Date(),
//     updated_at: new Date(),
//     device: '607c7e4cba23121608c8fc77'
//   }
//   let data = [d1, d2]
  


//   res.send({result: 1, data})
// })



// router.post('/station1/edit/:id', auth, async(req, res) => {
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

// router.post('/users/me/logout', auth, async (req, res) => {
//     // Log user out of the application
//     try {
//         req.user.tokens = req.user.tokens.filter((token) => {
//             return token.token != req.token
//         })
//         await req.user.save()
//         res.send()
//     } catch (error) {
//         res.status(500).send(error)
//     }
// })



module.exports = router;