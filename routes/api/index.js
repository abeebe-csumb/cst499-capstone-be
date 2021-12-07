const express = require('express');
const router = express.Router();

router.use('/user', require('./user'));
router.use('/stream', require('./stream'));

module.exports = router;