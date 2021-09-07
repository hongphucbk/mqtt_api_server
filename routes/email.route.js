var express = require('express');
var router = express.Router();
const auth = require('../middlewares/auth')

var controller = require('../controllers/email.controller');

router.get('/sendmail', controller.sendMail);
router.post('/sendmail', controller.sendMail);

router.get('/auto/mail', auth, controller.getAutoMail);
router.post('/auto/mail/save', auth, controller.postSaveAutoMail);

module.exports = router;
