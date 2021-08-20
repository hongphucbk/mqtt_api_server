const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const WhDeviceDataSchema = mongoose.Schema({
    wh: {
        type: Number,
        required: true,
        trim: true,
    },
    load: {
        type: Number,
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
    device: {type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    station: {type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
})



const WhDeviceData = mongoose.model('WhDeviceData', WhDeviceDataSchema, 'wh_device_data')

module.exports = WhDeviceData
