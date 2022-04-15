const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const WhStation3PriceSchema = mongoose.Schema({
    kwh_td: {
        type: Number,
    },
    kwh_bt: {
        type: Number,
    },
    kwh_cd: {
        type: Number,
    },
    unit_price_td:{
        type: Number,
    },
    unit_price_bt:{
        type: Number,
    },
    unit_price_cd:{
        type: Number,
    },
    
    price_td:{
        type: Number,
    },
    price_bt:{
        type: Number,
    },
    price_cd:{
        type: Number,
    },

    befor_price:{
        type: Number,
    },

    discount:{
        type: Number,
    },

    vat:{
        type: Number,
    },

    total_price:{
        type: Number,
    },

    infors: {
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
    //device: {type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    station: {type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
})



const WhStation3Price = mongoose.model('WhStation3Price', WhStation3PriceSchema, 'wh_station_3_price')

module.exports = WhStation3Price
