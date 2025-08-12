const user = require('../models/user');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const sendEmail = require('../util/mail');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMessage: req.flash('error'),
    oldInput: {},
    validationErrors: []
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: req.flash('error'),
    oldInput: {},
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email, password: password },
      validationErrors: errors.array()
    })
  };

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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword
      },
      validationErrors: errors.array()
    });
  }
  bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const newUser = new User({
        email: email,
        password: hashedPassword
      });
      return newUser.save();
    })
    .then(() => {
      sendEmail(
        email,
        'Signup succeeded!',
        'Hello, thanks for signing up!',
        '<h1>Hello, thanks for signing up!</h1>'
      )
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    isAuthenticated: false,
    errorMessage: req.flash('error'), // Pass flash messages to the view
  });
};

exports.postReset = (req, res, next) => {
  const email = req.body.email;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      req.flash('error', 'Something went wrong, please try again later.');
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    user.findOne({ email: email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email found.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
        user.save()
          .then(result => {
            sendEmail(
              email,
              'Password Reset',
              'You requested a password reset.',
              `<p>You requested a password reset. Click this <a href="${baseUrl}/reset/${token}">link</a> to set a new password.</p>`
            );
            req.flash('info', 'Check your email for the reset link.');
            res.redirect('/');
          })
          .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
      })
      .catch(err => {
      const error = new Error(err);

      error.httpStatusCode = 500;
      return next(error);
    });
  });
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() }
  })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid or expired token.');
        return res.redirect('/reset');
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        isAuthenticated: false,
        errorMessage: req.flash('error'),
        userId: user._id.toString(),
        passwordToken: token,
      })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    _id: userId,
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() }
  })
    .then(user => {
      if (!user) {
        req.flash('error', 'No user found.');
        res.redirect('/reset');
        return Promise.reject();
      }
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      req.flash('success', 'Password updated successfully!');
      res.redirect('/login');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}