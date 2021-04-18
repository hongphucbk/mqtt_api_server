const express = require('express')
const User = require('../models/User')
const auth = require('../middlewares/auth')

const router = express.Router()

router.post('/users', async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body)
        console.log(user)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({'result': 1 ,user, token })
    } catch (error) {
        res.status(400).send({'result': 0 ,error})
    }
})

router.post('/users/login', async(req, res) => {
    //Login a registered user
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()
        res.send({ 'result': 1 , user, token })
    } catch (error) {
        res.status(400).send({'result': 0 ,error})
    }
})

router.get('/users/me', auth, async(req, res) => {
    // View logged in user profile
    res.send(req.user)
})

router.post('/users/me/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})



module.exports = router;