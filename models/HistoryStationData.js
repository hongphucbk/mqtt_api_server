const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const historyStationDataSchema = mongoose.Schema({
    
    timestamp: {
        type: Date,
        trim: true,
        //unique: true,
    },
    station: {type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
    paras: {
        type: Object,
        required: true,
        
    },

    // value: {
    //     type: Number,
    //     required: true,
    //     trim: true,
    // },

    // unit: {
    //     type: String,
    //     trim: true,
    // },
    

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


historyStationDataSchema.index({
  timestamp: 1,
  station: 1,
}, {
  unique: true,
});

const HistoryStationData = mongoose.model('HistoryStationData', historyStationDataSchema,'history_station_data')

module.exports = HistoryStationData
