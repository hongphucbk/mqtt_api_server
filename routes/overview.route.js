var express = require('express');
var router = express.Router();

// router.use(express.static(__dirname + './public'));

var controller = require('../controllers/overview.controller');
//var validate = require('../validate/station.validate');

router.get('/', controller.list);

router.get('/maps', controller.maps);


router.get('/detail/:id', controller.getDetail);
router.get('/chart/:id', controller.getChart);
//router.post('/add', validate.postAdd, controller.postAdd);

// router.get('/edit/:id', controller.getEdit);
// router.post('/edit/:id', controller.postEdit);

// router.get('/delete/:id', controller.getDelete);


// router.get('/', function(req, res) {
// 	res.render('users/list');
// });

// router.get('/add', function(req, res) {
// 	res.render('users/list');
// });


module.exports = router;
