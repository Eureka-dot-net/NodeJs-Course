const express = require('express');

const UserController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');

const route = express.Router();

route.get('/status/:userId', isAuth, UserController.getUserStatus);

route.put('/status', isAuth, UserController.putUserStatus);

module.exports = route;