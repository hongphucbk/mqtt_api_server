const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const LoadStationDataSchema = mongoose.Schema({
    load: {
        type: Number,
        required: true,
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



const LoadStationData = mongoose.model('LoadStationData', LoadStationDataSchema, 'load_station_data')

module.exports = LoadStationData
