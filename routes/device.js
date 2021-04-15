const express = require('express')
const User = require('../models/User')
const Station = require('../models/Station')
const Device = require('../models/Device')
const auth = require('../middlewares/auth')

const router = express.Router()

router.post('/station/:station_id/device/add', auth, async (req, res) => {
    // Create a new device
    let station_id = req.params.station_id;
    //let id = req.body.id;
    console.log(station_id)
    //let station = await Station.findOne({ _id: station_id });

    try {
        const device = new Device(req.body)

        device.station =  mongoose.Types.ObjectId(station_id)

        console.log(device)
        await device.save()
        //const token = await user.generateAuthToken()
        res.status(201).send({ device })
    } catch (error) {
        res.status(400).send(error)
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

router.get('/station/:station_id/devices', auth, async(req, res) => {
    let id = req.params.station_id;

    let station = await Station.findOne({_id: id});
    res.send(station.devices)
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