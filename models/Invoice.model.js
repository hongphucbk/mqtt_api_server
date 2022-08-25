const mongoose = require('mongoose')

const InvoiceSchema = mongoose.Schema({
    name: {
        type: String,
        
    },
    billing_code: {
        type: String,
    },
    export_date: {
        type: Date,
    },
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
    total_kwh:{
        type: Number,
        default: 0,
    },

    kwh_diff: {
        type: Number,
        // default: function() {
        //     return this.total_kwh - (this.kwh_td +  this.kwh_bt + this.kwh_cd)
        // }
    },
    kwh_edit: {
        type: Number,
        //default: 0,
    },
    total_kwh_3: {
        type: Number,
        // default: function() {
        //     return this.kwh_td +  this.kwh_bt + this.kwh_cd
        // }
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
    
    unit_price_diff:{
        type: Number,
        //default: 0,
    },

    unit_price_edit:{
        type: Number,
        //default: 0,
    },

    discount:{
        type: Number,
        //default: 0,
    },

    price_discount:{
        type: Number,
        //default: 0,
    },

    price_vat:{
        type: Number,
        //default: 0,
    },

    vat:{
        type: Number,
        //default: 0,
    },

    total_price:{
        type: Number,
        //default: 0,
    },
    price_after_discount:{
        type: Number,
        //default: 0,
    },
    price_after_vat:{
        type: Number,
    },
    
    infors: {
        type: Array,
    },
    
    timestamp: {
        type: Date,
    },
    start_date: {
        type: Date,
    },
    end_date: {
        type: Date,
    },

    customer_name: {
        type: String,
    },
    customer_address: {
        type: String,
    },
    customer_code: {
        type: String,
    },
    customer_phone: {
        type: String,
    },
    customer_email: {
        type: String,
    },
    customer_tax_number: {
        type: String,
    },
    customer_address_use: {
        type: String,
    },
    
    customer_purpose: {
        type: String,
    },
    customer_type: {
        type: String,
    },

    supplier_group: {
        type: String,
    },
    supplier_name: {
        type: String,
    },
    supplier_address: {
        type: String,
    },
    supplier_tax_number: {
        type: String,
    },
    supplier_contact: {
        type: String,
    },

    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
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
    station_name: {
        type: String,
        trim: true,
    },
    version: {
        type: String,
    },

    timestamp_unix: {
        type: Number,
    },
    is_active: {
        type: Number,
        default: 1,
    },
    file_name: {
        type: String,
    },
    //device: {type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    station: {type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
})


const Invoice = mongoose.model('Invoice', InvoiceSchema, 'invoice')

module.exports = Invoice