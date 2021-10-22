const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const stationDataSchema = mongoose.Schema({
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
    load_kw: {
        type: Number,
    },
    load_kwh: {
        type: Number,
    },
    paras: {
        type: Object,
        required: true,
        trim: true,
    },
})



const StationData = mongoose.model('StationData', stationDataSchema, 'station_data')

module.exports = StationData
