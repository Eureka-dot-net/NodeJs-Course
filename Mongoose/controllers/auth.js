const user = require('../models/user');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMessage: req.flash('error'), // Pass flash messages to the view
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: req.flash('error'),
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password.');
        res.redirect('/login');
        return Promise.reject();
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(passwordMatches => {
      if (!passwordMatches) {
        req.flash('error', 'Invalid email or password.');
        res.redirect('/login');
        return Promise.reject();
      }
      req.session.isLoggedIn = true;
      req.session.user = loadedUser;
      req.session.save(err => {
        console.log(err);
        res.redirect('/');
      });
    })
    .catch(err => {
      if (err) console.log(err); // Will log only real errors
    });

};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then(user => {
      if (user) {
        req.flash('error', 'User already exists!'); // Use flash to pass error message
        res.redirect('/signup');
        return Promise.reject();
      }
      return bcrypt.hash(password, 12)
    }).then(hashedPassword => {
      const newUser = new User({
        email: email,
        password: hashedPassword
      });
      return newUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      if (err) console.log(err); // Will log only real errors
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
