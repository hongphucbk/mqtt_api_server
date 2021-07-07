const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const deviceDataSchema = mongoose.Schema({
    paras: {
        type: Object,
        required: true,
        trim: true,
    },
    value: {
        type: Number,
        required: true,
        trim: true,
    },
    unit: {
        type: String,
        trim: true,
    },
    dataType: {
        type: String,
        trim: true,
    },
    timestamp: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
    watts: {
        type: Number,
    },
    device: {type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    // password: {
    //     type: String,
    //     required: true,
    //     minLength: 5
    // },
    // tokens: [{
    //     token: {
    //         type: String,
    //         required: true
    //     }
    // }]
})



const DeviceData = mongoose.model('DeviceData', deviceDataSchema, 'device_data')

module.exports = DeviceData
