const express = require('express')
const User = require('../models/User')
const auth = require('../middlewares/auth')
const bcrypt = require('bcryptjs')
const router = express.Router()
const role = require('../middlewares/role')
const Station = require('../models/Station')
const err = require('../common/err')

router.post('/users/create', async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body)
        user.role = "US"
        //console.log(user)
        
        let result = await user.save()
        //console.log(result)
        
        const token = await user.generateAuthToken()
        res.status(201).send({'success': true })

        //res.status(201).send({'result': 1,user, token })
    } catch (error) {
        res.status(400).send({'error': error.errmsg})
    }
})

router.post('/users/login', async(req, res) => {
    //Login a registered user
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        
        if (user && user.code == 1) { //user
          return res.status(401).send(err.E40020)
        }

        if (user && user.code == 2) { //password
          return res.status(401).send(err.E40021)
        }

        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()

        let jsonUser = {
          _id: user._id,
          name : user.name,
          email : user.email,
          role : user.role
        }
        res.send({ 'user': jsonUser, token })
    } catch (error) {
        res.status(400).send(err.E40001)
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

router.post('/users/update-sites', auth, role(["SA"]), async(req, res) => {
  //Login a registered user
  try {
    //console.log(req.user)
    const id = req.body.id
    const action = req.body.action
    const sites = req.body.sites

    //console.log(id, action, sites, sites.length)

    if (action == "add") {
      for (var i = 0; i < sites.length; i++) {
        let b = await User.find({stations: sites[i]}).countDocuments()
        //console.log(b)
        if (b <= 0) {
          let a = await User.findByIdAndUpdate(id, {$push : {stations : sites[i] }},{new: false})
        }
      }
    }else if (action == "remove") {
      for (var i = 0; i < sites.length; i++) {
        let b = await User.find({stations: sites[i]}).countDocuments()
        if (b > 0) {
          await User.findByIdAndUpdate(id,{ $pull: {stations: sites[i] } })
        }
      }
    }else{

    }

    res.status(200).send({success: true})
  } catch (error) {
      res.status(400).send({error: error.message})
  }
})

router.post('/users/update-role', auth, role(["SA"]), async(req, res) => {
  //Login a registered user
  try {
    //console.log(req.user)
    const id = req.body.id
    const role = req.body.role.toUpperCase()
    //const sites = req.body.sites
    //console.log(id, role)
    if (role != "AD" && role != "SA" && role != "US") {
      res.status(400).send({error: 40002, message: 'Role is incorrect systax. Please use [SA, AD, US]'})
      return
    }
    await User.findByIdAndUpdate(id, {role: role },{new: false})    
    res.status(200).send({success: true})
  } catch (error) {
      res.status(400).send({error: 40001, message: error.message})
  }
})

router.get('/users/list', async(req, res) => {
  try{
    let strQuery
    let role = req.query.role ? req.query.role.toUpperCase() : undefined;
    //console.log(role)
    let limit = parseInt(req.query.limit); // perpage số lượng sản phẩm xuất hiện trên 1 page
    let nextPageToken = parseInt(req.query.nextPageToken) || 1;

    if (role != "AD" && role != "SA" && role != "US" && role != undefined) {
      res.status(400).send(err.E40002)
      return
    }
    if (role === undefined) {
      strQuery = {}
    }else{
      strQuery = {role: role}
    }

    let totalRecord = await User.find(strQuery).countDocuments();
    let totalPage = Math.ceil(totalRecord/limit)
    let users = await User.find(strQuery).skip((limit * nextPageToken) - limit).limit(limit)
    
    let arrUser = []
  
    for (var i = 0; i < users.length; i++) {
      let jsonUser = {
        _id: users[i]._id,
        name : users[i].name,
        email : users[i].email,
        role : users[i].role
      }
      arrUser.push(jsonUser)
    }

    nextPageToken = nextPageToken + 1;

    if(nextPageToken <= totalPage){
      res.send({ 'users' : arrUser,  nextPageToken:nextPageToken })
    }
    else{
      res.send({ 'users': arrUser })
    }
  } catch (error) {
      res.status(400).send({'code': 40001 , error: "System error: " + error})
  }
})

router.get('/users/get-sites', async(req, res) => {
    //get user
    try {
      let strQuery
      let id = req.query.id //user_id
      let access = req.query.access //true or false
      let limit = parseInt(req.query.limit); // perpage số lượng sản phẩm xuất hiện trên 1 page
      let nextPageToken = parseInt(req.query.nextPageToken) || 1;

      let user = await User.findOne({_id: id})
      //console.log(user)
      if (user == null) {
        res.status(400).send(err.E40014);
        return;
      }

      if (access !== 'true' && access !== 'false' ) {
        res.status(400).send(err.E40015);
        return;
      }


      let sites = user.stations
      //console.log(sites)

      let qr;
      if (access == 'true') {
        qr = { $in: sites }
      }else{
        qr = { $nin: sites }
      }
      //let results = await Station.find({_id: { $in: sites }})
      // if (role != "AD" && role != "SA" && role != "US" && role != undefined) {
      //   res.status(400).send({error: 40002, message: 'Role is incorrect systax. Please use [SA, AD, US]'})
      //   return
      // }
      let totalRecord = await Station.countDocuments({_id: qr}).exec();
      let totalPage = Math.ceil(totalRecord/limit)
      let stations = await Station.find({_id: qr}).skip((limit * nextPageToken) - limit).limit(limit)
      
      let arrStation = []

    
      for (var i = 0; i < stations.length; i++) {
        let jsonStation = {
          _id: stations[i]._id,
          name : stations[i].name,
          // email : users[i].email,
          // role : users[i].role
        }
        arrStation.push(jsonStation)
      }

      nextPageToken = nextPageToken + 1;

      //console.log(nextPageToken, totalPage, totalRecord)

      if(nextPageToken <= totalPage){
        res.send({ 'sites' : arrStation,  nextPageToken:nextPageToken })
      }
      else{
        res.send({ 'sites': arrStation })
      }
    } catch (error) {
        res.status(400).send({'code': 40001 , error: "System error: " + error})
    }
})

module.exports = router;