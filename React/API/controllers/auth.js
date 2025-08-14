const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const { validationResult } = require('express-validator')

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  const user = new User({
    name: name,
    email: email,
    password: password,
  });

  user.save()
    .then(result => {
      res.status(201).json({ message: 'User created successfully', userId: result._id });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
          }
          const token = jwt.sign(
            { userId: loadedUser._id.toString(), email: loadedUser.email },
            'your_jwt_secret_super_amazing',
            { expiresIn: '1h' }
          );
          res.status(200).json({ token: token, userId: loadedUser._id.toString() });
        });
    })
    .catch(err => next(err));
};