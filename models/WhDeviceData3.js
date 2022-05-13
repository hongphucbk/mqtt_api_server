const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const WhDeviceData3Schema = mongoose.Schema({
    kwh: {
        type: Number,
        required: true,
        trim: true,
    },
    wh_min: {
        type: Number,
    },
    wh_max: {
        type: Number,
    },
    kwh_min: {
        type: Number,
    },
    kwh_max: {
        type: Number,
    },
    type_number:{
        type: String,
    },
    type_name: {
        type: String,
    },
    type_description: {
        type: String,
    },
    infors: {
        type: Array,
    },
    
    timestamp: {
        type: Date,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    device_name: {
        type: String,
        trim: true,
    },
    station_name: {
        type: String,
        trim: true,
    },
    device: {type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    station: {type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
})



const WhDeviceData3 = mongoose.model('WhDeviceData3', WhDeviceData3Schema, 'wh_device_data_3')

module.exports = WhDeviceData3
