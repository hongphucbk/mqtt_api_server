const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const WhStation3PriceSchema = mongoose.Schema({
    kwh_td: {
        type: Number,
        default: 0,
    },
    kwh_bt: {
        type: Number,
        default: 0,
    },
    kwh_cd: {
        type: Number,
        default: 0,
    },
    kwh_diff: {
        type: Number,
        default: 0,
    },
    kwh_edit: {
        type: Number,
        default: 0,
    },
    unit_price_td:{
        type: Number,
        default: 0,
    },
    unit_price_bt:{
        type: Number,
        default: 0,
    },
    unit_price_cd:{
        type: Number,
        default: 0,
    },
    
    price_td:{
        type: Number,
        default: 0,
    },
    price_bt:{
        type: Number,
        default: 0,
    },
    price_cd:{
        type: Number,
        default: 0,
    },
    price_diff:{
        type: Number,
        default: 0,
    },

    price_edit:{
        type: Number,
        default: 0,
    },

    befor_price:{
        type: Number,
        default: 0,
    },

    discount:{
        type: Number,
        default: 0,
    },

    vat:{
        type: Number,
        default: 0,
    },

    total_price:{
        type: Number,
        default: 0,
    },
    total_kwh:{
        type: Number,
        default: 0,
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
