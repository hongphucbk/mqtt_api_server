const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const eventDataSchema = mongoose.Schema({
    caption: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        trim: true,
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

// userSchehis
//     const
//     return user
// }

const EventData = mongoose.model('EventData', eventDataSchema)

module.exports = EventData
