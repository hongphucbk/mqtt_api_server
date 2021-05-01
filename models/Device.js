const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const deviceSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    code: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    describe: {
        type: String,
        required: false,
    },
    paras: {
        type: Array ,
        //required: false,
    },

    manufacture: {
        type: String,
    },
    model: {
        type: String,
    },
    version: {
        type: String,
    },
    SN: {
        type: String,
    },
    deviceAddress: {
        type: Number,
    },
    nameplateWatts: {
        type: Number,
    },

    station: {type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
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

const Device = mongoose.model('Device', deviceSchema)

module.exports = Device
