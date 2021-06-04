const mongoose = require('mongoose')
const validator = require('validator')

const alarmSchema = mongoose.Schema({
    register: {
        type: Number,
    },
    code: {
        type: Number,
    },
    description: {
        type: String,
    },
    timestamp: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
    //device: {type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
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




const Alarm = mongoose.model('Alarm', alarmSchema, 'alarms')

module.exports = Alarm
