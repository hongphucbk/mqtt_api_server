const mongoose = require('mongoose')
const validator = require('validator')

const LoadWStationDataSchema = mongoose.Schema({
    watts: {
        type: Array,
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



const LoadWStationData = mongoose.model('LoadWStationData', LoadWStationDataSchema, 'load_w_station_data')

module.exports = LoadWStationData
