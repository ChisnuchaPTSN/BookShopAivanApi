const router = require('express').Router();
const usersController = require('../controllers/usersController');

router.route('/auth/signin/')
    .post(usersController.signin)

module.exports = router;
