const express = require('express')
const User = require('../models/User')
const Station = require('../models/Station')
const auth = require('../middlewares/auth')
const role = require('../middlewares/role')
const Device = require('../models/Device')
const DeviceData = require('../models/DeviceData')

const router = express.Router()

router.post('/station', auth, role(['SA']) ,async (req, res) => {
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

router.get('/stations', auth, async(req, res) => {
    let stations = await Station.find();
    res.send(stations)
})

router.get('/stations2', auth, async(req, res) => {
  let stations = await Station.find();
  let stationData = []
  //let jsonStation = {}

  for (let j = 0; j < stations.length; j++) {
    let jsonStation = {
      "_id": stations[j]._id,
      "name": stations[j].name,
      "describe": stations[j].describe,
      
      status: 'normal',
      todayYield : {
        value : 0,
        unit: "kWh",
        note: "Sum of daily yield (powerGenerated)"
      },

      power : {
        value : 0,
        unit: "kW",
        note: "Sum of totalPower"
      },

      workingHours : {
        value: 0,
        unit: "h",
        note: "Sum of workingHours"
      },
    }


    let data = []
    let d = {}
    let devices = await Device.find({ station: stations[j]._id })

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

        jsonStation.workingHours.value += deviceData[0].value;
      }


      let deviceDataPower = await DeviceData.find({device: devices[i]._id, paras: "power"}).sort({_id: -1}).limit(1)
      if (deviceDataPower.length > 0){
        //console.log("Result: ", deviceData[0].value)
        d.paras.power = deviceDataPower[0].value
        jsonStation.power.value += deviceDataPower[0].value

      }

      let deviceDataPowerGenerated = await DeviceData.find({device: devices[i]._id, paras: "powerGenerated"}).sort({_id: -1}).limit(1)
      if (deviceDataPowerGenerated.length > 0){
        d.paras.powerGenerated = deviceDataPowerGenerated[0].value
        jsonStation.todayYield.value += deviceDataPowerGenerated[0].value
      }


      
      
      
      
      data.push(d)
      //console.log(await getCurActPower(devices[0]._id))
    }


    stationData.push(jsonStation)

    //console.log(jsonStation)
  }
  console.log('----------->',stationData)
  res.send(stationData)
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