const mongoose = require('mongoose')
const validator = require('validator')

const alarmCodeSchema = mongoose.Schema({
    device: {type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    status : {
        type: Array
    },
    // event: {
    //     type: String,
    //     required: true,
    //     trim: true,
    // },
    register: {
        type: Number,
    },
    timestamp: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
    
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




const AlarmCode = mongoose.model('AlarmCode', alarmCodeSchema, 'alarm_code')

module.exports = AlarmCode
