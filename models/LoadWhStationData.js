const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const LoadWhStationDataSchema = mongoose.Schema({
    load_kwh: { // kwh_iot + kwh_3
        type: Number,
        required: true,
    },
    kwh_iot: {
        type: Number,
    },
    kwh_3: {
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
    station_name: {
        type: String,
        trim: true,
    },
    station: {type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
})



const LoadWhStationData = mongoose.model('LoadWhStationData', LoadWhStationDataSchema, 'load_wh_station_data')

module.exports = LoadWhStationData
