const mongoose = require('mongoose')
const validator = require('validator')

const deviceTypeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    
    // describe: {
    //     type: String,
    //     required: false,
    // },
    paras: {
        type: Array ,
        //required: false,
    },

    // manufacture: {
    //     type: String,
    // },
    // model: {
    //     type: String,
    // },
    // version: {
    //     type: String,
    // },
    // SN: {
    //     type: String,
    // },
    // deviceAddress: {
    //     type: Number,
    // },
    // nameplateWatts: {
    //     type: Number,
    // },

    //station: {type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
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
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
})

const DeviceType = mongoose.model('DeviceType', deviceTypeSchema, 'device_type')

module.exports = DeviceType
