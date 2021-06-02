const mongoose = require('mongoose')
const validator = require('validator')

const deviceSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    code: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    describe: {
        type: String,
        //required: false,
    },
    status: {
        type: String,
        //required: false,
    },
    IP: {
        type: String,
    },
    Port: {
        type: Number,
    },
    config: {
        type: String,
        //required: false,
    },
    model: {
        type: String,
    },
    version: {
        type: String,
    },
    station: {type: mongoose.Schema.Types.ObjectId, ref: 'Station'},
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


const IotDevice = mongoose.model('IotDevice', deviceSchema, 'iot_device')

module.exports = IotDevice
