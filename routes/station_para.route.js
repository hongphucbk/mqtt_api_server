var express = require('express');
var router = express.Router();

// router.use(express.static(__dirname + './public'));

var controller = require('../controllers/station_para.controller');
//var validate = require('../validate/station.validate');

router.get('/', controller.getStation);
router.get('/:id', controller.getList);

router.get('/:id/add', controller.getAdd);
router.post('/:id/add', controller.postAdd);

router.get('/:station_id/edit/:id', controller.getEdit);
router.post('/:station_id/edit/:id', controller.postEdit);

router.get('/:station_id/delete/:id', controller.getDelete);


// router.get('/', function(req, res) {
// 	res.render('users/list');
// });

// router.get('/add', function(req, res) {
// 	res.render('users/list');
// });


module.exports = router;
