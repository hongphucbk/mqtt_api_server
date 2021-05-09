const mongoose = require('mongoose')
const validator = require('validator')

const eventSchema = mongoose.Schema({
    event: {
        type: String,
        required: true,
        trim: true,
    },
    code: {
        type: String,
        //required: true,
        trim: true,
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