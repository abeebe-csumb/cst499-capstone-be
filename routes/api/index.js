const express = require('express');
const router = express.Router();

router.use('/user', require('./user'));
router.use('/talk', require('./talk'));

module.exports = router;