const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const autoEmailSchema = mongoose.Schema({
    
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    station: {type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
    email_to: {
        type: String,
        trim: true,
    },
    date_start: {
        type: Date,
    },
    date_end: {
        type: Date,
    },
    is_active: {
        type: Number,
        default: 1,
    },
    range: {
        type: Number,
        default: 7,
    },

    updated_at: {
        type: Date,
    },
    created_at: {
        type: Date,
    },

})


const AutoEmail = mongoose.model('AutoEmail', autoEmailSchema,'auto_emails')

module.exports = AutoEmail
