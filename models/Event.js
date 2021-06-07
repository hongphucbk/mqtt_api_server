const mongoose = require('mongoose')
const validator = require('validator')

const eventSchema = mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        //required: true,
        trim: true,
    },
    register: {
        type: String,
    },
    dataType: {
        type: String,
    },
    timestamp: {
        type: Date,
    },
    completed_at: {
        type: Date,
    },
    status: {
        type: Number,
    },

    updated_at: {
        type: Date,
    },
    device: {type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    station: {type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
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




const Event = mongoose.model('Event', eventSchema)

module.exports = Event
