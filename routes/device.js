const express = require('express')
const User = require('../models/User')
const Station = require('../models/Station')
const Device = require('../models/Device')
const auth = require('../middlewares/auth')
const DeviceData = require('../models/DeviceData')


const router = express.Router()

router.post('/device', auth, async (req, res) => {
    // Create a new device
    //let station_id = req.params.station_id;
    //let id = req.body.id;
    //console.log(station_id)
    //let station = await Station.findOne({ _id: station_id });
    try {
        const device = new Device(req.body)

        //device.station =  mongoose.Types.ObjectId(station_id)

        console.log(device)
        await device.save()


        let doc = await Station.findOneAndUpdate({_id:req.body.station}, {$push: {devices: device._id}},{'upsert':true})
        console.log(doc)

        //const token = await user.generateAuthToken()
        res.status(201).send({result: 1, device })
    } catch (error) {
        res.status(400).send({result: 0,error})
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


          
          
          console.log('----------->',d)
          
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

async function getCurActPower(device_id){
  return await DeviceData.find({device : device_id}).sort({ timestamp: -1 }).limit(1) // latest docs
}


module.exports = router;