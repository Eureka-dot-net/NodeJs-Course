const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth');

router.get('/login',authController.getLogin);

router.post('/Login', authController.postLogin);

router.post('/logout', authController.postLogout);

module.exports = router;