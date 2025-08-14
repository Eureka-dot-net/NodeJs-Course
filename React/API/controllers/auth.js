const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const { validationResult } = require('express-validator');

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(422).json({ message: 'User with this email already exists' });
    }

    // Password will be hashed automatically by the model
    const user = new User({
      name: name,
      email: email,
      password: password, // Plain text - model will hash it
    });

    const result = await user.save();
    
    res.status(201).json({ 
      message: 'User created successfully', 
      userId: result._id 
    });
    
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email 
      },
      process.env.JWT_SECRET || 'your_jwt_secret_super_amazing',
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      token: token, 
      userId: user._id.toString(),
      expiresIn: 3600 // 1 hour in seconds
    });
    
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};