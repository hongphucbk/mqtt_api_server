const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const historyDeviceRawDataSchema = mongoose.Schema({
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

const HistoryDeviceRawData = mongoose.model('HistoryDeviceRawData', historyDeviceRawDataSchema, 'history_device_raw_data')

module.exports = HistoryDeviceRawData
