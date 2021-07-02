const express = require('express')
const User = require('../models/User')
const Station = require('../models/Station')
const Device = require('../models/Device')
const auth = require('../middlewares/auth')
const DeviceData = require('../models/DeviceData')
const moment = require('moment'); // require
const HistoryDeviceData = require('../models/HistoryDeviceData')
const Event = require('../models/Event')

const err = require('../common/err')

const router = express.Router()

router.get('/event', auth, async(req, res) => {
  try{
    let limit = req.query.limit ? parseInt(req.query.limit) : 15;
    let nextPageToken = parseInt(req.query.nextPageToken) || 1; 

    let site_id = req.query.site_id
    let device_id = req.query.device_id

    let status = req.query.status ? req.query.status.trim() : null
    let eventType = req.query.eventType ? req.query.eventType.trim() :null

    if (status != null && status != 'resolved' && status != 'incoming' ) {
      res.send(err.E40700) 
      return
    }

    if (eventType != null && eventType != 'alarm' && eventType != 'fault' ) {
      res.send(err.E40701) 
      return
    }


    let query = {}
    if (site_id) {
      query = {station: site_id}
      if (device_id) {
        query = {station: site_id, device: device_id}
      }
    }else{
      if (req.user.role == "SA") {
        query = {}
      }else{
        let sites = req.user.stations;
        query = {station: {"$in": sites}}
      }
    }

    if (status != null) {
      if (status == 'incoming') {
        query = {...query, status: 0}
      }
      if (status == 'resolved') {
        query = {...query, status: 1}
      }
    }

    if (eventType != null) {
      if (eventType == 'alarm') {
        query = {...query, eventType: 'alarm'}
      }
      if (eventType == 'fault') {
        query = {...query, eventType: 'fault'}
      }
    }
        

    let totalRecord = await Event.find(query).countDocuments();
    let totalPage = Math.ceil(totalRecord/limit)

    let events = await Event.find(query)
                            .populate({ path: 'station', select: 'name' })
                            .populate({ path: 'device', select: 'name' })
                            .skip((limit * nextPageToken) - limit)
                            .sort({completed_at: -1, timestamp: -1})
                            .limit(limit)

    let arr = []
    for (var i = 0; i < events.length; i++) {
      let d = {
        id: events[i].id,
        siteId: events[i].station.id,
        siteName: events[i].station.name,
        //site: events[i].station,
        deviceId: events[i].device.id,
        deviceName: events[i].device.name,
        error: events[i].description,
        eventType: events[i].eventType,
        status: events[i].status == 1 ? "resolved": "incoming",
        timestamp : events[i].timestamp,
        completed_at : events[i].completed_at,

      }
      arr.push(d)
    }

    //res.send({events: arr})

     
    nextPageToken = nextPageToken + 1;
    //console.log(limit, totalRecord, nextPageToken, stations)
    if(nextPageToken <= totalPage){
      res.send({events: arr,  nextPageToken:nextPageToken })
    }
    else{
      res.send({events: arr})
    }
  }
  catch (error) {
      res.status(400).send({error: error.message})
  }

})

router.get('/1station/show/:id', auth, async(req, res) => {
    let id = req.params.id;
    //let id = req.body.id;
    let station = await Station.findOne({ _id: id });
    res.send(station)
})


module.exports = router;