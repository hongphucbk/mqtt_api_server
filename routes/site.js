const express = require('express')
const User = require('../models/User')
const Station = require('../models/Station')
const auth = require('../middlewares/auth')
const role = require('../middlewares/role')
const Device = require('../models/Device')
const DeviceData = require('../models/DeviceData')
const HistoryDeviceData = require('../models/HistoryDeviceData')
const HistoryStationData = require('../models/HistoryStationData')
const err = require('../common/err')

const random = require('random')
const moment = require('moment'); // require


const router = express.Router()


router.post('/site', auth, role(['SA']),async (req, res) => {
  // Validate
  if (!req.body.name) {
    res.json(err.E40101)
    return
  }

  if (!req.body.price) {
    res.json(err.E40102)
    return
  }

  if (!req.body.currency) {
    res.json(err.E40103)
    return
  }

  try {
      const site = new Station(req.body)
      console.log(site)
      await site.save()

      let displaySite = {
        id: site.id,
        name: site.name,
        describe: site.describe,
        price: site.price,
        currency: site.currency,
      }
      res.status(201).send({site: displaySite})
  } catch (error) {
    if (error.code == 11000) {
      res.json(err.E40100)
      return 
    }
    res.status(500).send({"error": error.message})
  }
})

router.post('/site/role', auth, role(['SA']),async (req, res) => {
    // Create a new user
    let stations = await Station.find();

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
  //try{
    let limit = parseInt(req.query.limit); // perpage số lượng sản phẩm xuất hiện trên 1 page
    let nextPageToken = parseInt(req.query.nextPageToken) || 1; 
    
    let status = req.query.status;
    let sites = req.user.stations;

    let strQuery = {}
    
    if(req.user.role == "SA"){
      if (status) {
        strQuery = { status: status}
      }else{
        strQuery = {}
      }
    }else{
      if (sites.length <= 0) {
        res.send(err.E40016)
        return;
      }

      if (status) {
        strQuery = { _id: { $in: sites }, status: status}
      }else{
        strQuery = { _id: { $in: sites } }
      }
    }


    let totalRecord = await Station.find(strQuery).countDocuments();
    let totalPage = Math.ceil(totalRecord/limit)

    //console.log(req.user.stations)
    
    let stations = await Station.find(strQuery).skip((limit * nextPageToken) - limit).limit(limit)
    let stationData = []
    //console.log(stations)

    for (let j = 0; j < stations.length; j++) {
      let jsonStation = {
        id: stations[j]._id,
        name: stations[j].name,
        status: 'normal',
        product : 0, //Math.random()*100, //kWh powerGenerated = WH
        //power : 0,
        workingHours : 0
      }

      let data = []
      let d = {}
      let devices = await Device.find({ station: stations[j]._id, is_active: 1 })

      for (let i = 0; i < devices.length; i++) {
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
          
        let deviceData = await DeviceData.find({device: devices[i]._id}).sort({_id: -1}).limit(1)
        
        if(deviceData[0]){
          let Watts = deviceData[0].paras.filter(function(item){
            return item.name == 'Watts'
          })          

          let WH = deviceData[0].paras.filter(function(item){
            return item.name == 'WH'
          })
          jsonStation.product += parseInt(WH[0].value)


          let nameplateWatts = deviceData[0].paras.filter(function(item){
            return item.name == 'nameplateWatts' //WattsMax
          })

          let workingHour = parseFloat(WH[0].value)/parseFloat(devices[i].nameplateWatts)
          jsonStation.workingHours += workingHour
          jsonStation.workingHours.toFixed(3)
        }
      }
      stationData.push(jsonStation)
      //console.log(jsonStation)
    }

    nextPageToken = nextPageToken + 1;
    //console.log(limit, totalRecord, nextPageToken, stations)
    if(nextPageToken <= totalPage){
      res.send({sites: stationData,  nextPageToken:nextPageToken })
    }
    else{
      res.send({sites: stationData})
    }
  // }catch(error){
  //   res.send(error)
  // }
})


router.get('/site/overview', auth, async(req, res) => {
  try{
    let id = req.query.id;
    let station = await Station.findOne({ _id: id });

    let d = {
      id: id,
      name : station.name,
      curSumActPower: 0,    // power = Watts
      todaySumEnergy: 0,    // WH
      ratedSumPower: 0,     // nameplateWatts
      allSumEnergy: 0,      // PowerGenerated = WH all = Total yield (kWh)
      price: station.price,
      currency: station.currency,
      status : station.is_active == 1 ? station.status : 'offline',
      product:0,
      workingHours : 0

    }
    let devices = await Device.find({ station: id, is_active: 1 })
    for (let i = 0; i < devices.length; i++) { 
      d.ratedSumPower += devices[i].nameplateWatts

      let start = moment().startOf('day')
      let end = moment(start).add(30, 'minutes').startOf('minute')
      //console.log(start, end)
      let str = { device: devices[i]._id,
                  timestamp: {$gte: start, $lte: end }
                }
      let rawData = await HistoryDeviceData.find(str)

      let minWh = 90000000000;
      rawData.map(function(item){
        minWh = item.paras.WH < minWh ? item.paras.WH : minWh        
      })

      //console.log(minWh)


      let query1 = {device: devices[i]._id}
      let deviceData = await DeviceData.find(query1).sort({_id: -1}).limit(1)
      

      if (deviceData[0]) {
        let paras = deviceData[0].paras
        let Watts = paras.filter((para) => para.name === 'Watts')
        d.curSumActPower += Watts[0].value

        let WH = paras.filter((para) => para.name === 'WH')
        d.allSumEnergy += WH[0].value

        //let WH_calc = paras.filter((para) => para.name === 'WH')
        d.todaySumEnergy += (WH[0].value - minWh)
      }

    }

    let data = []
    
    for (let i = 0; i < devices.length; i++) {
      let deviceData = await DeviceData.find({device: devices[i]._id}).sort({_id: -1}).limit(1)
      if(deviceData[0]){
        let WH = deviceData[0].paras.filter(function(item){
          return item.name == 'WH'
        })
        d.product += parseInt(WH[0].value)


        let nameplateWatts = deviceData[0].paras.filter(function(item){
          return item.name == 'nameplateWatts' //WattsMax
        })

        let workingHour = parseFloat(WH[0].value)/parseFloat(devices[i].nameplateWatts)
        d.workingHours += workingHour
        d.workingHours.toFixed(3)
      }
    }
    res.send({site: d})
  }catch(error){
    res.send({error: error})
  }
})

router.get('/site/devices', auth, async(req, res) => {
  try{
    let id = req.query.id;
    let limit = parseInt(req.query.limit); // perpage số lượng sản phẩm xuất hiện trên 1 page
    let nextPageToken = parseInt(req.query.nextPageToken) || 1; 

    let totalRecord = await Device.find({station: id}).countDocuments();
    let totalPage = Math.ceil(totalRecord/limit)

    let devices = await Device.find({station: id})
                              .skip((limit * nextPageToken) - limit)
                              .limit(limit)

    let data = []
    let d = {}

    for (let i = 0; i < devices.length; i++) {
      d = {
          id : devices[i]._id,
          name : devices[i].name,
          //code: devices[i].code,
          //describe : devices[i].describe,
          status : devices[i].is_active == 1 ? "normal" : "offline",
          curActPower: 0,   //power
          todayEnergy: 0    //kwh - powerGenerated
        }


      let start = moment().startOf('day')
      let end = moment(start).add(30, 'minutes').startOf('minute')
      //console.log(start, end)
      let str = { device: devices[i]._id,
                  timestamp: {$gte: start, $lte: end }
                }
      let rawData = await HistoryDeviceData.find(str)

      let minWh = 90000000000;
      rawData.map(function(item){
        minWh = item.paras.WH < minWh ? item.paras.WH : minWh        
      })
      //console.log(minWh)


      //--------
      let deviceData = await DeviceData.find({device: devices[i]._id}).sort({_id: -1}).limit(1)
      if (deviceData.length > 0) {
        //console.log(deviceData)
        let Watts = deviceData[0].paras.filter(function(item){
          return item.name == 'Watts'
        })
        d.curActPower = parseInt(Watts[0].value)
        

        let WH = deviceData[0].paras.filter(function(item){
          return item.name == 'WH'
        })
        d.todayEnergy = parseInt(WH[0].value) - minWh
      }
      
      data.push(d)
    }
    
    nextPageToken = nextPageToken + 1;
    if(nextPageToken <= totalPage){
      res.send({devices:data,  nextPageToken:nextPageToken })
    }
    else{
      res.send({devices:data})
    }

    //res.send({ devices:data})
  }
  catch(error){
    res.send({error: error.message})
  }
})


router.get('/site/trend', auth, async(req, res) => {
  try{
    let id = req.query.id;
    let dataPoint = 'power' //req.query.dataPoint; //power
    let basedTime = req.query.basedTime; //'day'
    let date = req.query.date //"2021-04-22"
    let type = req.query.type //"2021-04-22"

    let devices = await Device.find({ station: id })
    let ids = []
    devices.forEach(function(device){
      ids.push(device._id)
    })

    let deviceDataPowers;
    let data = []
    let sum = 0
    let count = 0
    let avg = 0

    if (basedTime === 'day' && type === 'power') {
      let start = moment(date).startOf('day')
      let end = moment(date).endOf('day')

      hisStations = await HistoryStationData.find({ station: id, 
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
        data.push(avg)
        start = end1
      }

    }else if (basedTime === 'month' && type === 'energy') {
      let StartMonth = moment(req.query.date).startOf('month');
      let EndMonth = moment(req.query.date).endOf('month');
      
      hisStations = await HistoryStationData.find({ station: id, 
                                                    timestamp: {$gte: StartMonth, $lte: EndMonth } 
                                                  })
      //let StartDay = moment(req.query.date).startOf('day');     // set to 12:00 am today
      let EndDay = moment(req.query.date).endOf('day');     // set to 12:00 am today

      for (let j = 1; j <= EndMonth.date(); j++) {
        data[j] = 0
        // let hisStation = hisStations.reduce(function(total, cur, _, {length}){
        //   return moment(cur.timestamp).date() == j ? total + cur.paras.power/length: total;
        // }, 0)
        let TotalWh = 0
        let minWh = 9000000000
        let maxWh = 0
        hisStations.map(await function(item){
          if (moment(item.timestamp).date() == j && item.paras.WH > 0) {
            //console.log('item WH = ' + item.paras.WH)
            minWh = item.paras.WH < minWh ? item.paras.WH : minWh
            maxWh = item.paras.WH > maxWh ? item.paras.WH : maxWh
          }
        })
        TotalWh = maxWh > minWh ?  maxWh - minWh : 0
        data[j] = TotalWh
        //console.log(j, maxWh, minWh, TotalWh)
      }
      data.splice(0, 1);



      //console.log(a)
      //let startDate = req.query.date + " " + j  + ":00:00";
      //let endDate = req.query.date + " " + j + ":59:59";
      //data[0] = "Phuc is processing please wait to update. :)))"
    }else if (basedTime === 'year' && type === 'energy') {
      let StartYear = moment(req.query.date).startOf('year');
      let EndYear = moment(req.query.date).endOf('year');
      
      hisStations = await HistoryStationData.find({ station: id, 
                                                    timestamp: {$gte: StartYear, $lte: EndYear } 
                                                  })

      for (let j = 0; j <= 11; j++) {
        data[j] = 0
        // let hisStation = hisStations.reduce(function(total, cur, _, {length}){
        //   return moment(cur.timestamp).month() == j ? total + cur.paras.power/ length: total;
        // }, 0)

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
      }
      //console.log(a)
      //let startDate = req.query.date + " " + j  + ":00:00";
      //let endDate = req.query.date + " " + j + ":59:59";
      //data[0] = "Phuc is processing please wait to update. :)))"
    }
    else{

      res.json(err.E40010)
      return
    }
    res.send({siteID: id, type: type, series: data})
  }catch(error){
    res.send(err.E40001)
  }
})


router.post('/site/update', auth,async (req, res) => {
  // update site infor mation
  try {
    let id = req.query.id   //site_id = station_id
    let price = req.body.price
    let currency = req.body.currency
    let name = req.body.name
    //----------------------------------------------
    let update
    if (name) {
      update = {price: price, currency: currency, name: name}
    }else{
      update = {price: price, currency: currency}
    }

    let query = {_id: id} 
    let station = await Station.findOneAndUpdate(query, update);
  
    res.status(201).send({ success: true })
  } catch (error) {
   res.status(400).send({code: 40001, message: error.message})
  }
})

router.delete('/site', auth, role(['SA']), async(req, res) => {
  try{
    let site_id = req.body.site_id;

    User.updateMany({},{$pull: {stations: site_id}}, function(res, err){});
    let result = await Station.findOneAndDelete({ _id: site_id })

    let device = await Device.deleteMany({ station: site_id })
    if (result) {
      let d = {
        id: result._id,
        name: result.name,
      }
      res.status(200).send({deleted: d})
      return
    }
    res.send(err.E40600)
  } catch (error) {
    res.status(400).send({error: error.message})
  }
})





module.exports = router;