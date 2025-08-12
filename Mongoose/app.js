const path = require('path');
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = process.env.MONGODB_URI;

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
})
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images'); // Store uploaded files in the 'images' directory
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    cb(null, timestamp + '-' + file.originalname); // Use a timestamp to avoid filename conflicts
  } 
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'  
  ) {
    cb(null, true); // Accept the file
  } else {
    cb(null, false); // Reject the file
  }
}

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
// Parse incoming request bodies in a middleware before your handlers, available under the req.body property
// extended: false means that the body will only contain strings or arrays, not objects
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));
// Serve static files from the public directory
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
// Use multer to handle file uploads, expecting a single file with the field name 'image'
app.use('/images', express.static(path.join(__dirname, 'images')));
// Serve static files from the images directory
app.use(session({ secret: 'my secret should be long', resave: false, saveUninitialized: false, store: store }));
//resave : false = do not save session if nothing changed
//saveUninitialized : false = do not save session if it is new but not modified

app.use(csrfProtection);
// Protect against CSRF attacks by generating a token for each session

app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken(); // Make CSRF token available in views
  next();
})

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(err);
    });
});



app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(error.httpStatusCode || 500);
  res.status(500).render('500', {
    pageTitle: 'Error Occurred',
    path: '/500',
     isAuthenticated: req.session ? req.session.isLoggedIn : false,
    csrfToken: req.csrfToken ? req.csrfToken() : ''
  });
});

mongoose
  .connect(
    MONGODB_URI
  )
  .then(result => {
    app.listen(3000);
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
