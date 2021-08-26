var express = require('express');
var router = express.Router();



// router.use(express.static(__dirname + './public'));

var controller = require('../controllers/email.controller');

router.get('/sendmail', controller.sendMail);
router.post('/sendmail', controller.sendMail);



module.exports = router;
