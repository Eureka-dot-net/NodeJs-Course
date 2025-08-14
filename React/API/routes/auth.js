const express = require('express');

const {signupValidator} = require('../validators/auth');
const authController = require('../controllers/auth');

const router = express.Router();

router.put('/signup', signupValidator, authController.signup);

router.post('/login', authController.login);

module.exports = router;