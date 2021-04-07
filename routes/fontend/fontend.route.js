var express = require('express');
var router = express.Router();

// router.use(express.static(__dirname + './public'));

var controller = require('../../controllers/fontend/fontend.controller');
//var validate = require('../validate/station.validate');

router.get('/', controller.getIndex);
router.get('/overview', controller.getIndex);
router.get('/metering/:station_id', controller.getMetering);
router.get('/pid/:station_id', controller.getPID);
router.get('/outlet', controller.getOutlet);
router.get('/process-flow-diagram', controller.getProcessFlowDiagram);


router.get('/gc_data/:station_id', controller.getGCData);

//router.get('/maps', controller.maps);


// router.get('/detail/:id', controller.getDetail);
// router.get('/chart/:id', controller.getChart);
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
