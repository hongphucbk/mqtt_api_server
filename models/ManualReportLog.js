const mongoose = require('mongoose')

const manualReportLogSchema = mongoose.Schema({
    
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    station: {type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
    report: {type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
    type: {
        type: String,       //  Report/Invoice
    },
    
    
    date_start: {
        type: Date,
    },
    date_end: {
        type: Date,
    },

    date_run: {
        type: Date,
    },

    is_active: {
        type: Number,
        default: 1,
    },
    range: {
        type: Number,
        //default: 7,
    },

    updated_at: {
        type: Date,
    },
    created_at: {
        type: Date,
        default: Date.now()
    },

})


const ManualReportLog = mongoose.model('ManualReportLog', manualReportLogSchema,'manual_report_log')

module.exports = ManualReportLog
