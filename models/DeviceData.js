const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const deviceDataSchema = mongoose.Schema({
    paras: {
        type: String,
        required: true,
        trim: true,
    },
    value: {
        type: Number,
        required: true,
        trim: true,
    },
    unit: {
        type: String,
        trim: true,
    },
    dataType: {
        type: String,
        trim: true,
    },
    timestamp: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
    device: {type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
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

const DeviceData = mongoose.model('DeviceData', deviceDataSchema)

module.exports = DeviceData
