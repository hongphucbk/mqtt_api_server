const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const stationDataRawSchema = mongoose.Schema({
    station: {type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
    value: {
        type: Number,
        trim: true,
    },
    timestamp: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
    load_w: {
        type: Number,
    },
    sum_w: {
        type: Number,
    },
    consum_w: {
        type: Number,
    },
    load_wh: {
        type: Number,
    },
    paras: {
        type: Object,
        required: true,
        trim: true,
    },
    is_update: {
        type: Number,
        default: 0,
    },
    infor: {
        type: Object,
    },
})



const StationDataRaw = mongoose.model('StationDataRaw', stationDataRawSchema, 'station_data_raw')

module.exports = StationDataRaw
