const mongoose = require('mongoose')
const validator = require('validator')

const eventSchema = mongoose.Schema({
    event: {
        type: String,
        required: true,
        trim: true,
    },
    dataType: {
        type: String,
    },
    timestamp: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
    device: {type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
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




const HistoryEvent = mongoose.model('HistoryEvent', eventSchema)

module.exports = HistoryEvent
