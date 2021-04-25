const express = require('express')
const User = require('../models/User')
const auth = require('../middlewares/auth')
const bcrypt = require('bcryptjs')
const router = express.Router()

router.post('/users/create', async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body)
        console.log(user)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({'result': 1,user, token })
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
        res.status(400).send({'result': 0 , error: "user or password is not correct"})
    }
})

router.post('/users/change-password', auth, async(req, res) => {
  //Login a registered user
  try {
    //console.log(req.user)
    const email = req.user.email
    const oldPassword  = req.body.oldPassword
    const newPassword  = req.body.newPassword

    const isPasswordMatch = await bcrypt.compare(oldPassword, req.user.password)

    if(isPasswordMatch){
        let pwdFixed = await bcrypt.hash(newPassword, 8)
        //console.log(pwdFixed)
        //let user = User.findOne({email: email})
        //user.password = pwdFixed
        User.findOneAndUpdate({email: email},{password: pwdFixed}, function(res, err){

        });

        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.status(201).send({'result': 1, 'message': "Changed password success" })
    }else{
      res.status(400).json({'result': 0, 'message': "Changed password failed" })
    }

  } catch (error) {
      res.status(400).send({'result': 0 ,error})
  }
})


router.get('/users/me', auth, async(req, res) => {
    // View logged in user profile
    res.send(req.user)
})

router.get('/users/me/logout1', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        //res.send()
        res.status(200).send({ result: 1 ,Message : "Logout success"})

    } catch (error) {
        res.status(500).send({ result: 0 ,error})
    }
})

router.get('/users/me/logout', auth, async(req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})


module.exports = router;