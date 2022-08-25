const mongoose = require('mongoose')
const validator = require('validator')

const BillingScheduleSchema = mongoose.Schema({
    start_day: {
        type: String,
    },
    start_day_premonth: {
        type: Number,
        default: 0,
    },
    end_day: {
        type: String,
    },
    end_day_premonth: {
        type: Number,
        default: 0,
    },
    run_day: {
        type: String,
    },

    infors: {
        type: Array,
    },
    email_to: {
        type: Array,
    },
    email_cc: {
        type: Array,
    },
    email_bcc: {
        type: Array,
    },
    timestamp: {
        type: Date,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    
    station_name: {
        type: String,
        trim: true,
    },
    name: {
        type: String,
        trim: true,
    },
    code: {
        type: String,
        
    },

    timestamp_unix: {
        type: Number,
    },
    is_active: {
        type: Number,
        default: 1,
    },
    station: {type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
})


const BillingSchedule = mongoose.model('BillingSchedule', BillingScheduleSchema, 'billing_schedule')

module.exports = BillingSchedule
