const mongoose = require('mongoose')

const reportSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    
    version: {
        type: String,
    },
    SN: {
        type: String,
    },
    is_active: {
        type: Number,
    },
    status: {
        type: String,
    },
    
    created_at: {
        type: Date,
        //default: Date.now
    },
    updated_at: {
        type: Date,
        //default: Date.now
    },
})

const Report = mongoose.model('Report', reportSchema)

module.exports = Report
