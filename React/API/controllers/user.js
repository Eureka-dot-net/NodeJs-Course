const User = require('../models/user');

exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.status(200).json({ status: user.status });
    
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.putUserStatus = async (req, res, next) => {
  try {
    const newStatus = req.body.status;
    
    // Input validation
    if (!newStatus) {
      return res.status(422).json({ message: 'Status is required.' });
    }
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    user.status = newStatus;
    const result = await user.save();
    
    res.status(200).json({ 
      message: 'User status updated.', 
      status: result.status 
    });
    
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};