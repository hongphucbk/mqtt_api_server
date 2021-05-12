const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({error: 'Invalid Email address'})
            }
        }
    },
    phone: {
        type: String,
        trim: true
    },
    role:{
        type: String,
        required: true,
        //unique: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 3
    },
    stations: [{type: mongoose.Schema.Types.ObjectId}],

    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],

    created_at: {
        type: Date,
        default: Date.now
    },
})

userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({_id: user._id}, process.env.JWT_KEY)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await User.findOne({ email} )
    if (!user) {
        return {code: 1, error: "Email is incorrect"}
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        return {code: 2, error: "Password is incorrect"}
        //return new Error({ error: 'Invalid login credentials' })
    }
    return user
}

const User = mongoose.model('User', userSchema)

module.exports = User
