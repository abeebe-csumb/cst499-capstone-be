const router = require('express').Router();
const { User } = require('../../controllers/index.js');

router.post('/', (req, res) => {
    console.log("TalkJS message: " + req.message);
});

module.exports = router;