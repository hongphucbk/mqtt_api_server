const mongoose = require('mongoose')
const validator = require('validator')

const WDeviceDataSchema = mongoose.Schema({
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



const WDeviceData = mongoose.model('WDeviceData', WDeviceDataSchema, 'w_device_data')

module.exports = WDeviceData
