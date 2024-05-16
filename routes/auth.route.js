var express = require('express');
var router = express.Router();

var controller = require('../controllers/auth.controller');
// var validate = require('../validate/auth.validate');

router.get('/login', controller.login);
// router.get('/add', controller.add);
router.post('/login', controller.postLogin);
router.post('/apiPostLogin', controller.apiPostLogin);

// router.post('/login', validate.postAdd, controller.postAdd);

// router.get('/edit/:id', controller.getEdit);
// router.post('/edit/:id', controller.postEdit);

// router.get('/delete/:id', controller.getDelete);

router.get('/logout', controller.logout);

// router.get('/', function(req, res) {
// 	res.render('users/list');
// });

// router.get('/add', function(req, res) {
// 	res.render('users/list');
// });


module.exports = router;
