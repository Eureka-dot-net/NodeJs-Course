const express = require('express');
const { check, body } = require('express-validator');
const User = require('../models/user');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', body('email', 'Please enter a valid email').isEmail().normalizeEmail(), 
    body('password', 'Password must be at least 6 characters long').isLength({ min: 6 }).trim(),
    authController.postLogin);

router.post('/signup',
    check('email').isEmail().withMessage('Please enter a valid email')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(user => {
                    if (user) {
                        return Promise.reject('E-Mail address already exists!');
                    }
                })
        }).normalizeEmail(),
    body('password', 'Password must be at least 6 characters long').isLength({ min: 6 }).trim(),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }).trim(),
    authController.postSignup
);

router.post('/logout', authController.postLogout);

router.post('/reset', authController.postReset);



router.post('/new-password', authController.postNewPassword);

router.get('/reset', authController.getReset);

router.get('/reset/:token', authController.getNewPassword);

module.exports = router;