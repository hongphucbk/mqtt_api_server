const express = require('express')
const User = require('../models/User')
const Station = require('../models/Station')
const Device = require('../models/Device')
const auth = require('../middlewares/auth')
const DeviceData = require('../models/DeviceData')
const moment = require('moment'); // require
const HistoryDeviceData = require('../models/HistoryDeviceData')
const role = require('../middlewares/role')
const DeviceType = require('../models/DeviceType')
const WhDeviceData = require('../models/WhDeviceData')

const err = require('../common/err')

const router = express.Router()

router.post('/device', auth, async (req, res) => {
    // Create a new device
    try {
      let device_type = req.body.device_type
      if (!device_type) {
        res.json(err.E40301)
      }
      let dtype = await DeviceType.findOne({_id:device_type})
      req.body.paras = dtype.paras
      const device = new Device(req.body)
      //console.log(device)
      await device.save()

      let doc = await Station.findOneAndUpdate({_id:req.body.station}, {$push: {devices: device._id}},{'upsert':true})
      //console.log(doc)

      res.status(201).send({device: device })
    } catch (error) {
      if (error.code == 11000) {
        res.json(err.E40300)
        return 
      }
      res.status(500).send({error: error.message})
    }
})

router.get('/devices', auth, async(req, res) => {
    //let id = req.params.station_id;
    //try{
        let station_id = req.body.station_id
        console.log(station_id)
        //let station = await Station.findOne({_id: station_id});
        let devices = await Device.find({station: station_id})

        console.log( devices.length)

        let data = []
        let d = {}

        for (let i = 0; i < devices.length; i++) {
          //console.log(devices[i])
          d = {
              _id : devices[i]._id,
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
          }

          let deviceDataPower = await DeviceData.find({device: devices[i]._id, paras: "power"}).sort({_id: -1}).limit(1)
          if (deviceDataPower.length > 0){
            //console.log("Result: ", deviceData[0].value)
            d.paras.power = deviceDataPower[0].value
          }

          let deviceDataPowerGenerated = await DeviceData.find({device: devices[i]._id, paras: "powerGenerated"}).sort({_id: -1}).limit(1)
          if (deviceDataPowerGenerated.length > 0){
            d.paras.powerGenerated = deviceDataPowerGenerated[0].value
          }

          data.push(d)
          //console.log(await getCurActPower(devices[0]._id))
        }

        //console.log(data)
        res.send({result: 1, data})

        //“desc”: <device_description>,
    // “status”: <device_status>,
    // “curActPower”: <power_value>,
    // “todayEnergy”: <energy_value>},



    //     res.status(201).send({result: 1, data: devices })
    // }
    // catch (error) {
    //     res.status(400).send({result: 0,error})
    // }
    

    

    //res.send(station.devices)
})


router.get('/station/show/:id', auth, async(req, res) => {
    let id = req.params.id;
    //let id = req.body.id;
    console.log(id)
    let station = await Station.findOne({ _id: id });
    res.send(station)
})

router.post('/station/edit/:id', auth, async(req, res) => {
    let id = req.params.id; //req.params.id
    //let data = req.body;
    //console.log("id = ",id)
    //let station = await Station.findOne({ _id: id });
    //res.send(station)

    var query = {"_id": req.params.id};
    var data = {
        "name" : req.body.name,
        "describe" : req.body.describe,
    }
    //console.log(query)
    Station.findOneAndUpdate(query, data, {'upsert':true}, function(err, doc){
        if (err) return res.send(500, { error: err });
        res.status(200).send('Success');
    });

})

//get details id
router.get('/site/device/details', auth, async(req, res) => {
  try{
    let id = req.query.id; //site_id
    let device = await Device.findOne({_id: id})
    if (device) {
      if (device.is_active == 0) {
        res.status(400).send(err.E40800)
        return
      }

      let d = {
        id : device.id,
        name : device.name,
        IP : device.IP,
        manufacturer : device.manufacturer,
        minResponseTimeInMiliSecond : device.minResponseTimeInMiliSecond,
        model : device.model,
        port : device.port,
        code: device.code,
        ratedSumPower : device.nameplateWatts ? device.nameplateWatts : null,
        paras: device.paras,
        status : device.is_active == 1 ? device.status : "offline",
        curActPower: 0,   //power
        todayEnergy: 0    //kwh - powerGenerated
      }

      let data = []

      let begin = moment().subtract(15, 'minutes').startOf('minute')


      let deviceData = await DeviceData.find({device: id, timestamp: { $gte : begin } }).sort({_id: -1}).limit(1)
      if (deviceData.length > 0) {
        let paras = deviceData[0].paras;

        for (let i = 0; i < d.paras.length; i++) {
          for (var j = 0; j < paras.length; j++) {
            //console.log(paras[j].name)
            if(paras[j].name == d.paras[i].name){
              //console.log("-->",paras[j].value, d.paras[i])
              d.paras[i].value = paras[j].value
            }
          }
        }

        let Watts = deviceData[0].paras.filter(function(item){
          return item.name == 'Watts'
        })
        d.curActPower = parseInt(Watts[0].value)

        let start = moment().startOf('day')
        let _wh = await WhDeviceData.find({  device: id,
                                            timestamp: { $gte : start }
                                        })
                            .sort({'timestamp': -1})
                            .limit(1)
                            .exec()
        if (_wh.length > 0) {
          d.todayEnergy = _wh[0].wh
        }
      
        res.send({device: d})
      }else{
        res.status(400).send(err.E40012)
      }
    }else{
      res.status(400).send(err.E40013)
    }
  }
  catch (error) {
      res.status(400).send({code: 40001, message: error.message})
  }
})

router.get('/device/trend', auth, async(req, res) => {
  try{
    let id = req.query.id;  //device_id
    let dataPoint = 'power' //req.query.dataPoint; //power
    let basedTime = req.query.basedTime; //'day'
    let date = req.query.date //"2021-04-22"
    let type = req.query.type //"power / energy"

    let deviceDataPowers;
    let data = []

    let sum = 0
    let count = 0
    let avg = 0

    if (basedTime === 'day' && type === 'power') {
      let start = moment(date).startOf('day')
      let end = moment(date).endOf('day')

      hisStations = await HistoryDeviceData.find({ device: id, 
                                                   timestamp: {$gte: start, $lte: end } 
                                                })
      
      for (let j = 0; j < 288; j++) {
        sum = 0, count = 0, avg = 0
        let start1 = moment(start).startOf('minute')
        let end1 = moment(start).add(5, 'minutes').startOf('minute')
        //console.log(start1, end1)
        let a1 = hisStations.map(x => {
          if (x.timestamp <= end1 && x.timestamp >= start1) {
            sum +=  x.paras.Watts
            count++

            if (count > 0) {
              avg = sum/count
            }else{
              avg = 0
            }
          }
          return avg
        })

        if (start1 > moment().subtract(5, 'minutes')) {
          avg = undefined
        }

        //console.log(j, '-->', start1.format('H:mm:ss'), end1.format('H:mm:ss'), avg)
        data.push(avg)
        //console.log(start1, avg)
        start = end1
      }

      // for (let j = 0; j < 24; j++) {
      //   data[j] = 0

      //   let hisStation = hisStations.filter(function(item){
      //     return moment(item.timestamp).hour() == j
      //   })
      //   //console.log(hisStation)
      //   if (hisStation.length > 0) {
      //     data[j] = hisStation[0].paras.power
      //   }
      // }

    }else if (basedTime === 'month' && type === 'energy') {
      var date1 = moment("2021-06-30")
      var now = moment(req.query.date);

      let StartMonth = moment(req.query.date).startOf('month');
      let EndMonth = moment(req.query.date).endOf('month');

      if (now > date1) {
        // date >= 2021-07-01
        let _whs = await WhDeviceData.find({  device: id,
                                              timestamp: { $gte : StartMonth, $lte : EndMonth }
                                            })
                            //.sort({'timestamp': -1})
                            //.limit(1)
                            .exec()
        for (let j = 1; j <= EndMonth.date(); j++) {
          data[j] = 0
          _whs.map(await function(item){
            if (moment(item.timestamp).date() == j && item.wh > 0) {
              data[j] = item.wh
            }
          })
        }
        data.splice(0, 1);

      } else {
        // date <= 2021-06-30
        hisStations = await HistoryDeviceData.find({  device: id, 
                                                      timestamp: {$gte: StartMonth, $lte: EndMonth } 
                                                  })
        //let StartDay = moment(req.query.date).startOf('day');     // set to 12:00 am today
        let EndDay = moment(req.query.date).endOf('day');     // set to 12:00 am today

        for (let j = 1; j <= EndMonth.date(); j++) {
          data[j] = 0
          let TotalWh = 0
          let minWh = 9000000000
          let maxWh = 0
          hisStations.map(await function(item){
            if (moment(item.timestamp).date() == j && item.paras.WH > 0) {
              //console.log('item WH = ' + item.paras.WH)
              if (item.paras.WH < minWh) {
                console.log("-->", minWh, item.timestamp)
              }
              minWh = item.paras.WH < minWh ? item.paras.WH : minWh
              maxWh = item.paras.WH > maxWh ? item.paras.WH : maxWh
            }
          })
          TotalWh = maxWh > minWh ?  maxWh - minWh : 0
          data[j] = TotalWh
        }
        
        data.splice(0, 1);
      }


    }else if (basedTime === 'year' && type === 'energy') {
      let StartYear = moment(req.query.date).startOf('year');
      let EndYear = moment(req.query.date).endOf('year');
      

      hisStations = await HistoryDeviceData.find({ device: id, 
                                                    timestamp: {$gte: StartYear, $lte: EndYear } 
                                                  })

      for (let j = 0; j <= 11; j++) {
        if (j <= 5) {
          data[j] = 0
          let TotalWh = 0
          let minWh = 9000000000
          let maxWh = 0
          hisStations.map(function(item){
            if (moment(item.timestamp).month() == j && item.paras.WH > 0) {
              minWh = item.paras.WH < minWh ? item.paras.WH : minWh
              maxWh = item.paras.WH > maxWh ? item.paras.WH : maxWh
            }
          })
          TotalWh = maxWh > minWh ?  maxWh - minWh : 0
          data[j] = TotalWh
        }else{
          let _whs = await WhDeviceData.find({  device: id,
                                                timestamp: { $gte : StartYear, $lte : EndYear }
                                            }).exec()
          let _total = 0
          _whs.map(await function(item){
            if (moment(item.timestamp).month() == j && item.wh > 0) {
              _total += item.wh
            }
          })
          data[j] = _total
        }
        
      }
    }
    else{
      res.json(err.E40010)
      return
    }

    res.send({siteID: id, type: type,series: data})
  }catch(error){
    res.send(error.message)
  }
})

router.get('/device/load/trend', auth, async(req, res) => {
  try{
    let id = req.query.id;  //device_id
    let dataPoint = 'power' //req.query.dataPoint; //power
    let basedTime = req.query.basedTime; // only month year
    let date = req.query.date //"2021-04-22"
    let type = 'energy'       //"power / energy"

    let deviceDataPowers;
    let data = []

    let sum = 0
    let count = 0
    let avg = 0

    if (basedTime === 'day') {
      res.json(err.E40305)
      return
    }else if (basedTime === 'month' && type === 'energy') {

      let StartMonth = moment(req.query.date).startOf('month');
      let EndMonth = moment(req.query.date).endOf('month');
      
      // date >= 2021-07-01
      let _loads = await WhDeviceData.find({  device: id,
                                              timestamp: { $gte : StartMonth, $lte : EndMonth }
                                        })
                          //.sort({'timestamp': -1})
                          //.limit(1)
                          .exec()
      for (let j = 1; j <= EndMonth.date(); j++) {
        data[j] = 0
        _loads.map(await function(item){
          if (moment(item.timestamp).date() == j && item.load > 0) {
            data[j] = item.load
          }
        })
      }
      data.splice(0, 1);

    }else if (basedTime === 'year' && type === 'energy') {
      let StartYear = moment(req.query.date).startOf('year');
      let EndYear = moment(req.query.date).endOf('year');
      
      for (let j = 0; j <= 11; j++) {
        let _loads = await WhDeviceData.find({  device: id,
                                              timestamp: { $gte : StartYear, $lte : EndYear }
                                            }).exec()
        let _total = 0
        _loads.map(await function(item){
          if (moment(item.timestamp).month() == j && item.load > 0) {
            _total += item.load
          }
        })
        data[j] = _total
      }
    }
    else{
      res.json(err.E40010)
      return
    }
    res.send({siteID: id, type: type,series: data})
  }catch(error){
    res.send(error.message)
  }
})

router.delete('/device', auth, role(['SA']), async(req, res) => {
  try{
    let device_id = req.query.id;
    let device = await Device.findOne({_id: device_id})
    //console.log(device_id, device)
    //return
    let station = await Station.findOne({_id: device.station})
    //console.log(station)
    station.devices.pull({_id: device_id})
    await station.save()

    let result = await Device.findOneAndDelete({ _id: device_id })
    if (result) {
      let d = {
        id: result._id,
        name: result.name,
        //email: result.email,
        //role: result.role
      }
      res.status(200).send({deleted: d})
      return
    }
    res.send(err.E40500)
  } catch (error) {
    res.status(400).send({error: error.message})
  }
})

async function getCurActPower(device_id){
  return await DeviceData.find({device : device_id}).sort({ timestamp: -1 }).limit(1) // latest docs
}


module.exports = router;