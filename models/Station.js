const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const stationSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    describe: {
        type: String,
        required: false,
    },
    price: {
        type: Number,
    },
    unit_price_td: {
        type: Number,
    },
    unit_price_bt: {
        type: Number,
    },
    unit_price_cd: {
        type: Number,
    },
    discount: {
        type: Number,
        default: 0,
    },
    vat: {
        type: Number,
        default: 0,
    },
    kwh_init: {
        type: Number,
        default: 0,
    },
    kwh_sum: {
        type: Number,
    },
    price_init: {
        type: Number,
        default: 0,
    },
    price_sum: {
        type: Number,
        default: 0,
    },
    currency: {
        type: String,
        //required: false,
    },
    
    status: {
        type: String,
        //required: false,
    },
    is_report: {
        type: Number,
    },
    is_active: {
        type: Number,
    },
    
    devices: [{type: mongoose.Schema.Types.ObjectId, ref: 'Device'}],
    users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
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

// userSchema.pre('save', async function (next) {
//     // Hash the password before saving the user model
//     const user = this
//     if (user.isModified('password')) {
//         user.password = await bcrypt.hash(user.password, 8)
//     }
//     next()
// })

// userSchema.methods.generateAuthToken = async function() {
//     // Generate an auth token for the user
//     const user = this
//     const token = jwt.sign({_id: user._id}, process.env.JWT_KEY)
//     user.tokens = user.tokens.concat({token})
//     await user.save()
//     return token
// }

// userSchema.statics.findByCredentials = async (email, password) => {
//     // Search for a user by email and password.
//     const user = await User.findOne({ email} )
//     if (!user) {
//         throw new Error({ error: 'Invalid login credentials' })
//     }
//     const isPasswordMatch = await bcrypt.compare(password, user.password)
//     if (!isPasswordMatch) {
//         throw new Error({ error: 'Invalid login credentials' })
//     }
//     return user
// }

const Station = mongoose.model('Station', stationSchema)

module.exports = Station
